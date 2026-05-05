import React from "react";
import { Tabs, Tab, Box } from "@mui/material";

const FILTERS = [
  { label: "All", value: "" },
  { label: "Event", value: "Event" },
  { label: "Result", value: "Result" },
  { label: "Placement", value: "Placement" },
];

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function FilterBar({ value, onChange }: Props): React.ReactElement {
  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
      <Tabs
        value={value}
        onChange={(_e, v) => onChange(v)}
        textColor="primary"
        indicatorColor="primary"
      >
        {FILTERS.map((f) => (
          <Tab key={f.value} label={f.label} value={f.value} />
        ))}
      </Tabs>
    </Box>
  );
}
