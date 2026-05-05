/**
 * Dashboard page — the single page of the notification dashboard.
 *
 * Architecture: data-fetching lives in useNotifications(), priority scoring
 * in usePriorityInbox(), and rendering is split into focused components.
 * This keeps the page component as a pure composition layer.
 */
import React, { useEffect } from "react";
import {
  Box, Container, Typography, Alert, Stack, Chip,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useNotifications } from "../hooks/useNotifications";
import { usePriorityInbox } from "../hooks/usePriorityInbox";
import { NotificationCard } from "../components/NotificationCard";
import { NotificationSkeleton } from "../components/NotificationSkeleton";
import { PriorityInbox } from "../components/PriorityInbox";
import { FilterBar } from "../components/FilterBar";
import { PaginationControls } from "../components/PaginationControls";
import { Log } from "../services/logger";

const LIMIT = 20;

export function DashboardPage(): React.ReactElement {
  const {
    notifications, total, loading, error,
    page, filter, viewedIds,
    setPage, setFilter, markViewed,
  } = useNotifications();

  const priorityItems = usePriorityInbox(notifications);

  // Log page mount — demonstrates page-level lifecycle logging
  useEffect(() => {
    Log("frontend", "info", "page", "Dashboard mounted").catch(() => {});
  }, []);

  const handleView = (id: string): void => {
    markViewed(id);
    Log("frontend", "debug", "component", `Notification viewed: ${id}`).catch(() => {});
  };

  const newCount = notifications.filter((n) => !viewedIds.has(n.id)).length;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={4}>
        <NotificationsIcon color="primary" sx={{ fontSize: 36 }} />
        <Typography variant="h4" fontWeight={700}>Notifications</Typography>
        {newCount > 0 && (
          <Chip label={`${newCount} new`} color="primary" size="small" />
        )}
      </Box>

      {/* Filter tabs */}
      <FilterBar value={filter} onChange={setFilter} />

      {/* Error state */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load notifications: {error}
        </Alert>
      )}

      {/* Loading skeleton */}
      {loading && <NotificationSkeleton count={6} />}

      {/* Content */}
      {!loading && !error && (
        <>
          {/* Priority inbox — only shown on the unfiltered "All" view */}
          {!filter && (
            <PriorityInbox
              notifications={priorityItems}
              viewedIds={viewedIds}
              onView={handleView}
            />
          )}

          {/* All notifications */}
          <Typography variant="subtitle2" color="text.secondary" mb={2}>
            {total} notification{total !== 1 ? "s" : ""} total
          </Typography>

          {notifications.length === 0 ? (
            <Alert severity="info">No notifications found.</Alert>
          ) : (
            <Stack spacing={2}>
              {notifications.map((n) => (
                <NotificationCard
                  key={n.id}
                  notification={n}
                  viewed={viewedIds.has(n.id)}
                  onView={handleView}
                />
              ))}
            </Stack>
          )}

          <PaginationControls
            total={total}
            page={page}
            limit={LIMIT}
            onChange={setPage}
          />
        </>
      )}
    </Container>
  );
}
