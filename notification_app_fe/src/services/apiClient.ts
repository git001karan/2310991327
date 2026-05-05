/**
 * Configured axios instance with logging interceptors.
 * Using an interceptor for logging ensures global coverage — every API call
 * made through this instance is automatically logged without per-call
 * instrumentation. Import this instead of raw axios throughout the app.
 */
import axios from "axios";
import { Log } from "./logger";

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE ?? "http://localhost:5000",
});

apiClient.interceptors.request.use(
  (config) => {
    Log("frontend", "debug", "api", `Request: ${config.method?.toUpperCase()} ${config.url}`)
      .catch(() => {});
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    Log("frontend", "info", "api", `Response: ${response.status} ${response.config.url}`)
      .catch(() => {});
    return response;
  },
  (error) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 0;
      const level = status >= 500 ? "error" : "warn";
      Log("frontend", level, "api", `API error: ${status} ${error.config?.url} — ${error.message}`)
        .catch(() => {});
    }
    return Promise.reject(error);
  }
);

export default apiClient;
