/**
 * Core Log() function.
 *
 * Design decisions:
 * - Validation is synchronous so callers get immediate feedback during
 *   development without waiting for a network round-trip.
 * - On a 401 the token cache is invalidated and the request retried once —
 *   this handles token expiry edge cases without manual intervention.
 * - The function is async so callers can await it in critical paths or
 *   fire-and-forget in hot paths (e.g., HTTP middleware).
 */

import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

import {
  Stack, Level, Package,
  VALID_LEVELS, VALID_STACKS,
  VALID_BACKEND_PACKAGES, VALID_FRONTEND_PACKAGES, VALID_SHARED_PACKAGES,
} from "./constants";
import { getAuthToken, invalidateToken } from "./tokenManager";

const BASE_URL = process.env.LOG_API_BASE ?? "http://20.207.122.201/evaluation-service";

function validate(stack: string, level: string, pkg: string, message: string): void {
  if ([stack, level, pkg].some((v) => v !== v.toLowerCase())) {
    throw new Error("All Log() arguments must be lowercase strings.");
  }
  if (!VALID_STACKS.includes(stack as Stack)) {
    throw new Error(`Invalid stack "${stack}". Allowed: ${VALID_STACKS.join(", ")}`);
  }
  if (!VALID_LEVELS.includes(level as Level)) {
    throw new Error(`Invalid level "${level}". Allowed: ${VALID_LEVELS.join(", ")}`);
  }

  const allowed: string[] =
    stack === "backend"
      ? [...VALID_BACKEND_PACKAGES, ...VALID_SHARED_PACKAGES]
      : [...VALID_FRONTEND_PACKAGES, ...VALID_SHARED_PACKAGES];

  if (!allowed.includes(pkg)) {
    throw new Error(
      `Invalid package "${pkg}" for stack "${stack}". Allowed: ${allowed.join(", ")}`
    );
  }
  if (!message?.trim()) {
    throw new Error("Log message must be a non-empty string.");
  }
}

async function sendLog(
  stack: Stack,
  level: Level,
  pkg: Package,
  message: string,
  isRetry = false
): Promise<void> {
  const token = await getAuthToken();
  try {
    await axios.post(
      `${BASE_URL}/logs`,
      { stack, level, package: pkg, message },
      { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 401 && !isRetry) {
        invalidateToken();
        return sendLog(stack, level, pkg, message, true);
      }
      throw new Error(
        `Log delivery failed: ${err.response?.status} — ${JSON.stringify(err.response?.data)}`
      );
    }
    throw err;
  }
}

/**
 * Log(stack, level, pkg, message)
 * @param stack   "backend" | "frontend"
 * @param level   "debug" | "info" | "warn" | "error" | "fatal"
 * @param pkg     package name validated per stack
 * @param message human-readable log message
 */
export async function Log(
  stack: string,
  level: string,
  pkg: string,
  message: string
): Promise<void> {
  validate(stack, level, pkg, message);
  await sendLog(stack as Stack, level as Level, pkg as Package, message);
}
