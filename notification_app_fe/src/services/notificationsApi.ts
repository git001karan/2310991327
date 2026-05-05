import apiClient from "./apiClient";

export type NotificationType = "Event" | "Result" | "Placement";

export interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: NotificationType;
  created_at: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface FetchParams {
  limit?: number;
  page?: number;
  notification_type?: string;
}

export async function fetchNotifications(
  params: FetchParams = {}
): Promise<NotificationsResponse> {
  const { data } = await apiClient.get<NotificationsResponse>("/api/notifications", {
    params,
  });
  return data;
}
