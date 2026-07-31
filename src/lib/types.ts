export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type PlatformGroup = "desktop" | "mobile" | "web" | "other";

export type PlatformLink = {
  label: string; // e.g. "Windows", "macOS", "APK", or any custom name
  url: string;
  group: PlatformGroup;
};

export type Screenshot = {
  url: string;
  // Which platform group this screenshot represents, so the app page can
  // show the right set of screenshots for whichever platform the visitor
  // has selected (falls back to `default_platform` below).
  group: PlatformGroup;
};

export type App = {
  id: string;
  app_code: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  category_id: string | null;
  icon_url: string | null;
  screenshots: Screenshot[];
  version: string;
  size_label: string | null;
  platform_links: PlatformLink[];
  // Which platform's screenshots to show by default (set from the admin
  // panel) until the visitor picks one themselves.
  default_platform: PlatformGroup;
  status: "draft" | "published";
  downloads_count: number;
  created_at: string;
  updated_at: string;
  categories?: Category | null;
};

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "user" | "admin";
};

export type Source = {
  id: string;
  app_id: string;
  github_url: string;
  created_at: string;
  updated_at: string;
  apps?: { name: string; slug: string; icon_url: string | null } | null;
};
