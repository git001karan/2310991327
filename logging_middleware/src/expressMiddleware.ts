/**
 * Express request logging middleware.
 *
 * Attaches to the response "finish" event rather than wrapping res.json()
 * so the final status code is captured regardless of which handler sets it,
 * including downstream error-handling middleware.
 *
 * Fire-and-forget (no await) is intentional — logging must never block
 * or add latency to the HTTP response cycle.
 */

import { Request, Response, NextFunction } from "express";
import { Log } from "./logger";

/** Strip newlines/carriage-returns to prevent log injection via crafted URLs. */
function sanitize(s: string): string {
  return s.replace(/[\r\n]/g, " ").slice(0, 200);
}

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  res.on("finish", () => {
    const level =
      res.statusCode >= 500 ? "error" :
      res.statusCode >= 400 ? "warn" : "info";

    const msg = `${sanitize(req.method)} ${sanitize(req.originalUrl)} -> ${res.statusCode}`;

    Log("backend", level, "middleware", msg).catch((err) => {
      // Degrade gracefully — a logging failure must never crash the server
      console.error("[requestLogger] Log delivery failed:", err.message);
    });
  });
  next();
}
