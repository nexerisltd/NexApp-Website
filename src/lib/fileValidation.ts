// Validates an uploaded image on the server before it ever reaches
// storage — never trusts the client-side <input accept="..."> alone (that
// only filters the file picker UI; a request can claim any content-type).
//
// Checks three things per SECURITY REQUIREMENT 6:
//   1. Declared type is on the allow-list.
//   2. Size is under the limit.
//   3. The file's actual bytes (magic number) match a real image of the
//      declared type — not just its extension/Content-Type header.
// Storage safety (outside the web root, never executed as code) is handled
// structurally: uploads go straight into a Supabase Storage bucket, which
// only ever serves files as static blobs — there's no code path that would
// execute an uploaded file server-side.

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

export async function validateImageFile(
  file: File
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(file.type === "image/png" || file.type === "image/jpeg")) {
    return { ok: false, error: "Only PNG or JPEG images are allowed." };
  }

  if (file.size <= 0) {
    return { ok: false, error: "The uploaded file is empty." };
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, error: "Images must be under 8MB." };
  }

  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const signatures = MAGIC_NUMBERS[file.type];
  const matches = signatures.some((sig) => matchesMagicNumber(head, sig));

  if (!matches) {
    return {
      ok: false,
      error: "This file doesn't look like a valid PNG or JPEG image.",
    };
  }

  return { ok: true };
}
