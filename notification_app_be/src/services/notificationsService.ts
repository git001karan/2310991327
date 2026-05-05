import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

import { getAuthToken, invalidateToken } from "./tokenManager";
import { Log } from "./logger";

const NOTIFICATIONS_BASE =
  process.env.NOTIFICATIONS_API_BASE ?? "http://20.207.122.201/evaluation-service";

export interface NotificationQuery {
  limit?: number;
  page?: number;
  notification_type?: string;
}

// Raw shape from upstream API
interface RawNotification {
  ID: string;
  Type: string;
  Message: string;
  Timestamp: string;
}

interface RawResponse {
  notifications: RawNotification[];
}

// Normalised shape we expose to the frontend
export interface NormalisedNotification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  created_at: string;
}

export interface NormalisedResponse {
  notifications: NormalisedNotification[];
  total: number;
  page: number;
  limit: number;
}

function normalise(raw: RawNotification): NormalisedNotification {
  return {
    id: raw.ID,
    title: `${raw.Type} Notification`,
    message: raw.Message,
    notification_type: raw.Type,
    created_at: raw.Timestamp,
  };
}

async function fetchNotifications(
  query: NotificationQuery,
  retry = false
): Promise<NormalisedResponse> {
  const token = await getAuthToken();

  try {
    const params: Record<string, unknown> = {};
    if (query.limit) params["limit"] = query.limit;
    if (query.page) params["page"] = query.page;
    if (query.notification_type) params["notification_type"] = query.notification_type;

    const { data } = await axios.get<RawResponse>(
      `${NOTIFICATIONS_BASE}/notifications`,
      { headers: { Authorization: `Bearer ${token}` }, params }
    );

    const notifications = (data.notifications ?? []).map(normalise);

    Log("backend", "info", "controller",
      `Fetched ${notifications.length} notifications page=${query.page ?? 1}`
    ).catch(() => {});

    return {
      notifications,
      total: notifications.length,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 401 && !retry) {
        invalidateToken();
        return fetchNotifications(query, true);
      }
      Log("backend", "error", "controller",
        `Notifications fetch failed: ${err.response?.status}`
      ).catch(() => {});
      throw new Error(
        `Upstream API error: ${err.response?.status} ${JSON.stringify(err.response?.data)}`
      );
    }
    throw err;
  }
}

export { fetchNotifications };
