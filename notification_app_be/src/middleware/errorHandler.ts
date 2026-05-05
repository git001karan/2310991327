/**
 * Centralised error handler — must be registered last in the middleware chain.
 * Catches any error passed via next(err) and returns a consistent JSON shape.
 */
import { Request, Response, NextFunction } from "express";
import { Log } from "../services/logger";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  Log("backend", "error", "middleware", `Unhandled error on ${req.method} ${req.originalUrl}: ${err.message}`)
    .catch(() => {});

  res.status(500).json({ success: false, message: err.message ?? "Internal server error" });
}
