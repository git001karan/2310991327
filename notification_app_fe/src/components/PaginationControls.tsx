import React from "react";
import { Box, Pagination } from "@mui/material";

interface Props {
  total: number;
  page: number;
  limit: number;
  onChange: (page: number) => void;
}

export function PaginationControls({ total, page, limit, onChange }: Props): React.ReactElement {
  const count = Math.ceil(total / limit);
  if (count <= 1) return <></>;

  return (
    <Box display="flex" justifyContent="center" mt={4}>
      <Pagination
        count={count}
        page={page}
        onChange={(_e, p) => onChange(p)}
        color="primary"
        shape="rounded"
      />
    </Box>
  );
}
