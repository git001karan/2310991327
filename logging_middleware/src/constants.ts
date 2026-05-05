/**
 * Centralised validation constants.
 * Keeping these separate from runtime logic makes it trivial to extend
 * allowed values without touching business logic.
 */

export type Stack = "backend" | "frontend";
export type Level = "debug" | "info" | "warn" | "error" | "fatal";
export type BackendPackage = "cache" | "controller" | "cron_job" | "db" | "domain";
export type FrontendPackage = "api" | "component" | "hook" | "page" | "state" | "style";
export type SharedPackage = "auth" | "config" | "middleware" | "utils";
export type Package = BackendPackage | FrontendPackage | SharedPackage;

export const VALID_LEVELS: Level[] = ["debug", "info", "warn", "error", "fatal"];
export const VALID_STACKS: Stack[] = ["backend", "frontend"];

export const VALID_BACKEND_PACKAGES: BackendPackage[] = [
  "cache", "controller", "cron_job", "db", "domain",
];
export const VALID_FRONTEND_PACKAGES: FrontendPackage[] = [
  "api", "component", "hook", "page", "state", "style",
];
export const VALID_SHARED_PACKAGES: SharedPackage[] = [
  "auth", "config", "middleware", "utils",
];
