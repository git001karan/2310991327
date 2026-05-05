import React from "react";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { DashboardPage } from "./pages/DashboardPage";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1976d2" },
    warning: { main: "#ed6c02" },
    success: { main: "#2e7d32" },
  },
  shape: { borderRadius: 8 },
});

function App(): React.ReactElement {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <DashboardPage />
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
