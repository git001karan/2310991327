import React from "react";
import { Box, Skeleton, Stack } from "@mui/material";

interface Props { count?: number; }

export function NotificationSkeleton({ count = 6 }: Props): React.ReactElement {
  return (
    <Stack spacing={2}>
      {Array.from({ length: count }).map((_, i) => (
        <Box key={i} sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Skeleton variant="rounded" width={80} height={24} />
            <Skeleton variant="text" width={100} />
          </Box>
          <Skeleton variant="text" width="60%" height={28} />
          <Skeleton variant="text" width="90%" />
          <Skeleton variant="text" width="75%" />
        </Box>
      ))}
    </Stack>
  );
}
