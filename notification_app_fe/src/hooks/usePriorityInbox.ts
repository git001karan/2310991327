/**
 * usePriorityInbox hook.
 *
 * Priority score = TYPE_WEIGHT * RECENCY_SCORE
 *
 * Type weights: Placement=3, Result=2, Event=1
 * Recency score: 1 / (1 + hours_since_created) — decays toward 0 over time,
 * ensuring recent items always outrank older items of the same type.
 *
 * Trade-off: computing scores on every render is O(n) but acceptable for
 * n <= 1000. For larger datasets, move scoring to the backend and index
 * on (type, created_at) for efficient Top-K queries.
 */
import { useMemo } from "react";
import { Notification } from "../services/notificationsApi";

const TYPE_WEIGHT: Record<string, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

function recencyScore(createdAt: string): number {
  const hoursSince = (Date.now() - new Date(createdAt).getTime()) / 3_600_000;
  return 1 / (1 + hoursSince);
}

export function usePriorityInbox(notifications: Notification[]): Notification[] {
  return useMemo(() => {
    return [...notifications]
      .map((n) => ({
        notification: n,
        score: (TYPE_WEIGHT[n.notification_type] ?? 1) * recencyScore(n.created_at),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((item) => item.notification);
  }, [notifications]);
}
