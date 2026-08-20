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
  // Wide cover image used as the background when this app is featured in a
  // homepage hero billboard. Same aspect ratio as the billboard itself.
  cover_url: string | null;
  // CSS object-position (e.g. "50% 30%") controlling which part of the
  // cover stays visible when it's cropped to the billboard's 21:9 shape.
  cover_position: string;
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
  profiles?: { full_name: string | null; avatar_url: string | null } | null;
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

export type Billboard = {
  id: string;
  title: string;
  app_id: string;
  offer: string | null;
  display_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  apps?: {
    name: string;
    slug: string;
    icon_url: string | null;
    cover_url: string | null;
    cover_position: string | null;
  } | null;
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
