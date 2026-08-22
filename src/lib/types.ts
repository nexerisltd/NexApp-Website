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
  // GitHub source repo — mandatory for outside developer submissions,
  // optional for admin-created apps. source_public controls whether the
  // link is shown on the app's public page or kept review-team-only.
  github_url: string | null;
  source_public: boolean;
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

export type DevAreaTag =
  | "android"
  | "ios"
  | "web"
  | "desktop"
  | "backend"
  | "game_dev"
  | "other";

export type DevVerification = {
  id: string;
  profile_id: string;
  request_number: string;
  full_legal_name: string;
  display_name: string;
  country: string;
  date_of_birth: string;
  phone_number: string;
  phone_verified: boolean;
  profile_photo_url: string | null;
  gov_id_type: "nid" | "passport" | "driving_license";
  gov_id_document_url: string;
  selfie_url: string;
  identity_match_confirmed: boolean;
  bio: string | null;
  portfolio_url: string | null;
  github_url: string | null;
  previous_projects: string | null;
  dev_areas: DevAreaTag[];
  agreement_accepted: boolean;
  ownership_declaration: boolean;
  ip_responsibility_declaration: boolean;
  content_policy_accepted: boolean;
  privacy_policy_accepted: boolean;
  false_info_agreement: boolean;
  status: "pending" | "approved" | "rejected";
  reject_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "user" | "admin";
  dev_status: "none" | "pending" | "verified" | "rejected";
  dev_application_note: string | null;
  dev_reject_reason: string | null;
  profile_headline: string | null;
  profile_bio: string | null;
  display_name: string | null;
  country: string | null;
};

// The separate `sources` table/admin section is retired — github_url and
// source_public now live directly on `apps`, editable from the app form
// itself (see AppForm.tsx / SubmitAppForm.tsx).

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

export type AppIssue = {
  id: string;
  app_id: string;
  title: string;
  description: string | null;
  download_blocked: boolean;
  active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
};

export type IssueRequestStatus = "pending" | "testing" | "granted" | "denied";

export type IssueRequest = {
  id: string;
  app_id: string;
  requested_by: string;
  target_admin_id: string;
  original_admin_id: string;
  title: string;
  description: string;
  download_blocked: boolean;
  eta_start: string | null;
  eta_end: string | null;
  status: IssueRequestStatus;
  status_note: string | null;
  assigned_at: string;
  created_at: string;
  updated_at: string;
  apps?: { name: string; slug: string; icon_url: string | null } | null;
  requester?: { full_name: string | null; avatar_url: string | null } | null;
  target_admin?: { full_name: string | null; avatar_url: string | null } | null;
};

export type Notification = {
  id: string;
  user_id: string;
  type:
    | "app_update"
    | "submission_approved"
    | "submission_declined"
    | "issue_request_new"
    | "issue_request_status"
    | "issue_request_claimed"
    | "dev_application_result"
    | "app_issue_posted";
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
