import React from "react";
import { Box, Typography, Divider, Stack } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import { Notification } from "../services/notificationsApi";
import { NotificationCard } from "./NotificationCard";

interface Props {
  notifications: Notification[];
  viewedIds: Set<string>;
  onView: (id: string) => void;
}

export function PriorityInbox({ notifications, viewedIds, onView }: Props): React.ReactElement {
  if (notifications.length === 0) return <></>;

  return (
    <Box mb={4}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <StarIcon color="warning" />
        <Typography variant="h6" fontWeight={700}>Priority Inbox</Typography>
        <Typography variant="caption" color="text.secondary">(Top 10 by type weight × recency)</Typography>
      </Box>
      <Stack spacing={1.5}>
        {notifications.map((n) => (
          <NotificationCard
            key={n.id}
            notification={n}
            viewed={viewedIds.has(n.id)}
            onView={onView}
            priority
          />
        ))}
      </Stack>
      <Divider sx={{ mt: 4, mb: 2 }} />
    </Box>
  );
}
