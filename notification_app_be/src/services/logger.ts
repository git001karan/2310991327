import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

import { getAuthToken, invalidateToken } from "./tokenManager";

const BASE_URL = process.env.LOG_API_BASE ?? "http://20.207.122.201/evaluation-service";

type Stack = "backend" | "frontend";
type Level = "debug" | "info" | "warn" | "error" | "fatal";

const BACKEND_PACKAGES = ["cache","controller","cron_job","db","domain","auth","config","middleware","utils"];

function sanitize(s: string): string {
  return s.replace(/[\r\n]/g, " ").slice(0, 300);
}

function validate(stack: string, level: string, pkg: string, message: string): void {
  if ([stack, level, pkg].some((v) => v !== v.toLowerCase()))
    throw new Error("All Log() arguments must be lowercase.");
  if (!["backend","frontend"].includes(stack))
    throw new Error(`Invalid stack: ${stack}`);
  if (!["debug","info","warn","error","fatal"].includes(level))
    throw new Error(`Invalid level: ${level}`);
  if (!BACKEND_PACKAGES.includes(pkg))
    throw new Error(`Invalid package "${pkg}" for backend stack.`);
  if (!message?.trim())
    throw new Error("Log message must be non-empty.");
}

async function send(stack: Stack, level: Level, pkg: string, message: string, retry = false): Promise<void> {
  const token = await getAuthToken();
  try {
    await axios.post(
      `${BASE_URL}/logs`,
      { stack, level, package: pkg, message: sanitize(message) },
      { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 401 && !retry) {
        invalidateToken();
        return send(stack, level, pkg, message, true);
      }
      // Log failures are non-fatal — swallow after retry
      return;
    }
    throw err;
  }
}

export async function Log(stack: string, level: string, pkg: string, message: string): Promise<void> {
  try {
    validate(stack, level, pkg, message);
    await send(stack as Stack, level as Level, pkg, message);
  } catch {
    // Logging must never crash the server
  }
}
