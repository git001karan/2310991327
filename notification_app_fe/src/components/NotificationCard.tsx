import React from "react";
import {
  Box, Card, CardActionArea, CardContent, Chip, Typography, Tooltip,
} from "@mui/material";
import FiberNewIcon from "@mui/icons-material/FiberNew";
import { Notification } from "../services/notificationsApi";

const TYPE_COLOR: Record<string, "primary" | "success" | "warning"> = {
  Event: "primary",
  Result: "success",
  Placement: "warning",
};

interface Props {
  notification: Notification;
  viewed: boolean;
  onView: (id: string) => void;
  priority?: boolean;
}

/**
 * React.memo prevents re-rendering all cards when only one card's viewed
 * state changes — critical for lists of 20+ items.
 */
export const NotificationCard = React.memo(function NotificationCard({
  notification,
  viewed,
  onView,
  priority = false,
}: Props): React.ReactElement {
  const { id, title, message, notification_type, created_at } = notification;

  return (
    <Card
      elevation={viewed ? 0 : 3}
      sx={{
        border: "1px solid",
        borderColor: priority ? "warning.main" : viewed ? "divider" : "primary.light",
        opacity: viewed ? 0.75 : 1,
        transition: "opacity 0.2s",
      }}
    >
      <CardActionArea onClick={() => onView(id)}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Box display="flex" gap={1} alignItems="center">
              <Chip
                label={notification_type}
                color={TYPE_COLOR[notification_type] ?? "default"}
                size="small"
              />
              {priority && (
                <Chip label="Priority" color="warning" size="small" variant="outlined" />
              )}
            </Box>
            <Box display="flex" alignItems="center" gap={0.5}>
              {!viewed && (
                <Tooltip title="New">
                  <FiberNewIcon color="primary" fontSize="small" />
                </Tooltip>
              )}
              <Typography variant="caption" color="text.secondary">
                {new Date(created_at).toLocaleString()}
              </Typography>
            </Box>
          </Box>
          <Typography variant="subtitle1" fontWeight={viewed ? 400 : 700} gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {message}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
});
