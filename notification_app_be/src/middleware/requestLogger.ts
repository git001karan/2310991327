/**
 * HTTP request logging middleware.
 * Attaches to res "finish" to capture the final status code after all
 * downstream handlers have run — including error middleware.
 * Fire-and-forget so logging never adds latency to responses.
 */
import { Request, Response, NextFunction } from "express";
import { Log } from "../services/logger";

/** Strip newlines to prevent log injection via crafted request paths. */
function sanitize(s: string): string {
  return s.replace(/[\r\n]/g, " ").slice(0, 200);
}

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  res.on("finish", () => {
    const level =
      res.statusCode >= 500 ? "error" :
      res.statusCode >= 400 ? "warn" : "info";

    const msg = `${sanitize(req.method)} ${sanitize(req.originalUrl)} -> ${res.statusCode}`;

    Log("backend", level, "middleware", msg)
      .catch((err) => console.error("[requestLogger] failed:", err.message));
  });
  next();
}
