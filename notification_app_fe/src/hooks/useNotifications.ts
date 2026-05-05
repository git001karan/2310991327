/**
 * useNotifications hook.
 * Centralises all data-fetching state so components stay declarative.
 * "viewed" IDs are stored in a Set for O(1) lookup — important when
 * rendering large lists where per-item checks happen on every render.
 */
import { useState, useEffect, useCallback } from "react";
import { fetchNotifications, Notification } from "../services/notificationsApi";
import { Log } from "../services/logger";

interface UseNotificationsReturn {
  notifications: Notification[];
  total: number;
  loading: boolean;
  error: string | null;
  page: number;
  filter: string;
  viewedIds: Set<string>;
  setPage: (p: number) => void;
  setFilter: (f: string) => void;
  markViewed: (id: string) => void;
  refetch: () => void;
}

const LIMIT = 20;

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<string>("");
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchNotifications({
      limit: LIMIT,
      page,
      notification_type: filter || undefined,
    })
      .then((res) => {
        if (cancelled) return;
        const list = res.data?.notifications ?? [];
        setNotifications(list);
        setTotal(res.data?.total ?? 0);
        Log("frontend", "info", "hook", `Loaded ${list.length} notifications`).catch(() => {});
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message);
        Log("frontend", "error", "hook", `Failed to load notifications: ${err.message}`).catch(
          () => {}
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, filter, tick]);

  const markViewed = useCallback((id: string) => {
    setViewedIds((prev) => new Set(prev).add(id));
  }, []);

  const handleSetFilter = useCallback((f: string) => {
    setFilter(f);
    setPage(1);
  }, []);

  return {
    notifications,
    total,
    loading,
    error,
    page,
    filter,
    viewedIds,
    setPage,
    setFilter: handleSetFilter,
    markViewed,
    refetch,
  };
}
