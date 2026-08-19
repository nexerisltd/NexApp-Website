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
  status: "draft" | "published" | "pending" | "declined";
  review_note: string | null;
  downloads_count: number;
  rating_avg: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
  categories?: Category | null;
};

export type Review = {
  id: string;
  app_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  profiles?: { full_name: string | null; avatar_url: string | null } | null;
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

export type Notification = {
  id: string;
  user_id: string;
  type: "app_update" | "submission_approved" | "submission_declined";
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
};

export type Report = {
  id: string;
  app_id: string;
  user_id: string;
  reason: "spam" | "malware" | "broken_link" | "inappropriate" | "copyright" | "other";
  details: string | null;
  status: "open" | "resolved" | "dismissed";
  created_at: string;
  apps?: { name: string; slug: string; icon_url: string | null } | null;
  profiles?: { full_name: string | null } | null;
};
