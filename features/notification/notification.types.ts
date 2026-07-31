export interface Notification {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type(type: any): string | import("url").UrlObject;
  id: string;
  profile_id: string;

  title: string;
  message: string;

  notification_type: string;

  reference_id: string | null;
  action_url: string | null;

  is_read: boolean;

  created_by: string | null;

  created_at: string;
  updated_at: string;
}