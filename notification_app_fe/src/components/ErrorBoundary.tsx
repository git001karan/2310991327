/**
 * ErrorBoundary — catches render-time errors in the React tree.
 * Must be a class component; React does not support functional error boundaries.
 * Logs the error via Log() so render failures are captured in the evaluation service.
 */
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Log } from "../services/logger";

interface Props { children: ReactNode; }
interface State { hasError: boolean; message: string; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    Log("frontend", "error", "component", `ErrorBoundary caught: ${error.message} | ${info.componentStack?.slice(0, 120)}`)
      .catch(() => {});
  }

  handleReset = (): void => {
    this.setState({ hasError: false, message: "" });
  };

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Paper elevation={3} sx={{ p: 4, maxWidth: 480, textAlign: "center" }}>
          <ErrorOutlineIcon color="error" sx={{ fontSize: 56, mb: 2 }} />
          <Typography variant="h6" gutterBottom>Something went wrong</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {this.state.message}
          </Typography>
          <Button variant="contained" onClick={this.handleReset}>Try Again</Button>
        </Paper>
      </Box>
    );
  }
}
