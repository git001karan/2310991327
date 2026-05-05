/**
 * Axios interceptor factory for frontend logging.
 *
 * Using an interceptor ensures global coverage — every API call made through
 * this instance is automatically logged without per-call instrumentation.
 * This is the frontend equivalent of Express middleware.
 *
 * Trade-off: interceptors are bound to a specific axios instance, so always
 * import the configured instance rather than the default axios object.
 */

import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { Log } from "./logger";

export function createLoggedAxiosInstance(baseURL?: string): AxiosInstance {
  const instance = axios.create({ baseURL });

  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      Log("frontend", "debug", "api", `Request: ${config.method?.toUpperCase()} ${config.url}`)
        .catch(() => {});
      return config;
    },
    (error: unknown) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      Log("frontend", "info", "api", `Response: ${response.status} ${response.config.url}`)
        .catch(() => {});
      return response;
    },
    (error: unknown) => {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status ?? 0;
        const level = status >= 500 ? "error" : "warn";
        Log("frontend", level, "api", `API error: ${status} ${error.config?.url} — ${error.message}`)
          .catch(() => {});
      }
      return Promise.reject(error);
    }
  );

  return instance;
}
