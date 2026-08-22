"use client";

import { createClient } from "@/lib/supabase/client";

const ASSET_BUCKET = "app-assets";
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB

const MAGIC_NUMBERS: Record<string, number[][]> = {
  "image/png": [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  "image/jpeg": [
    [0xff, 0xd8, 0xff, 0xdb],
    [0xff, 0xd8, 0xff, 0xe0],
    [0xff, 0xd8, 0xff, 0xe1],
    [0xff, 0xd8, 0xff, 0xee],
  ],
};

function matchesMagicNumber(bytes: Uint8Array, signature: number[]): boolean {
  if (bytes.length < signature.length) return false;
  return signature.every((byte, i) => bytes[i] === byte);
}

// Mirrors src/lib/fileValidation.ts (server-side) so a bad file is rejected
// before it's even sent over the wire, not just after.
export async function validateImageFileClient(
  file: File
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(file.type === "image/png" || file.type === "image/jpeg")) {
    return { ok: false, error: "Only PNG or JPEG images are allowed." };
  }
  if (file.size <= 0) return { ok: false, error: "The selected file is empty." };
  if (file.size > MAX_IMAGE_BYTES) return { ok: false, error: "Images must be under 8MB." };

  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const signatures = MAGIC_NUMBERS[file.type];
  if (!signatures.some((sig) => matchesMagicNumber(head, sig))) {
    return { ok: false, error: "This file doesn't look like a valid PNG or JPEG image." };
  }
  return { ok: true };
}

// Uploads straight from the browser to Supabase Storage using XHR (not
// fetch) specifically because XHR exposes real `upload.onprogress` byte
// events — this is genuine transfer progress, not a simulated timer.
function uploadWithProgress(opts: {
  bucket: string;
  path: string;
  file: File;
  accessToken: string;
  supabaseUrl: string;
  onProgress: (pct: number) => void;
}): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `${opts.supabaseUrl}/storage/v1/object/${opts.bucket}/${opts.path}`;
    xhr.open("POST", url);
    xhr.setRequestHeader("Authorization", `Bearer ${opts.accessToken}`);
    xhr.setRequestHeader("x-upsert", "true");
    xhr.setRequestHeader("Content-Type", opts.file.type);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) opts.onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed (${xhr.status}). Please try again.`));
    };
    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.send(opts.file);
  });
}

export type UploadScope = "admin" | "submission";

export async function uploadImage(
  file: File,
  opts: {
    folder: "icons" | "covers" | "screenshots";
    scope: UploadScope;
    onProgress?: (pct: number) => void;
  }
): Promise<string> {
  const validation = await validateImageFileClient(file);
  if (!validation.ok) throw new Error(validation.error);

  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("You must be signed in to upload.");

  const ext = file.type === "image/png" ? "png" : "jpg";
  const random = crypto.randomUUID();
  // Admin uploads go to top-level folders; public submissions are scoped
  // under the uploader's own id (submissions/<uid>/...), matching the
  // storage RLS policies for each role.
  const path =
    opts.scope === "submission"
      ? `submissions/${session.user.id}/${opts.folder}/${random}.${ext}`
      : `${opts.folder}/${random}.${ext}`;

  await uploadWithProgress({
    bucket: ASSET_BUCKET,
    path,
    file,
    accessToken: session.access_token,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    onProgress: opts.onProgress ?? (() => {}),
  });

  const { data } = supabase.storage.from(ASSET_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

const PRIVATE_DOC_BUCKET = "dev-verification-docs";

// Government ID / selfie uploads for developer verification. These go into
// a PRIVATE bucket (not app-assets) — the return value is a storage PATH,
// not a public URL, because the bucket has no public access at all. The
// only way to ever view one of these files is a short-lived signed URL
// minted server-side for an authorized viewer (the owner or an admin) —
// see src/lib/devDocSignedUrl.ts.
export async function uploadPrivateDoc(
  file: File,
  opts: {
    folder: "gov_id" | "selfie";
    onProgress?: (pct: number) => void;
  }
): Promise<string> {
  const validation = await validateImageFileClient(file);
  if (!validation.ok) throw new Error(validation.error);

  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("You must be signed in to upload.");

  const ext = file.type === "image/png" ? "png" : "jpg";
  const random = crypto.randomUUID();
  const path = `${session.user.id}/${opts.folder}/${random}.${ext}`;

  await uploadWithProgress({
    bucket: PRIVATE_DOC_BUCKET,
    path,
    file,
    accessToken: session.access_token,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    onProgress: opts.onProgress ?? (() => {}),
  });

  return path;
}
