/**
 * Token manager with in-memory caching.
 *
 * Trade-off: in-memory storage is intentional for single-process services.
 * For multi-process/multi-instance deployments, replace the module-level
 * cache with a shared store (e.g., Redis) to avoid redundant auth calls.
 *
 * Tokens are refreshed proactively 60 s before expiry to prevent any
 * in-flight request from hitting the API with a stale token.
 */

import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.LOG_API_BASE ?? "http://20.207.122.201/evaluation-service";
const REFRESH_BUFFER_MS = 60_000;

interface TokenCache {
  token: string;
  expiresAt: number;
}

let cache: TokenCache | null = null;

export async function getAuthToken(): Promise<string> {
  const now = Date.now();

  if (cache && cache.expiresAt - now > REFRESH_BUFFER_MS) {
    return cache.token;
  }

  const clientId = process.env.LOG_CLIENT_ID;
  const clientSecret = process.env.LOG_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "LOG_CLIENT_ID and LOG_CLIENT_SECRET must be set. Run the registration script first."
    );
  }

  try {
    const { data } = await axios.post<{ token: string; expiresIn: number }>(
      `${BASE_URL}/auth`,
      { clientID: clientId, clientSecret }
    );

    cache = {
      token: data.token,
      expiresAt: now + data.expiresIn * 1000,
    };

    return cache.token;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        `Auth failed: ${err.response?.status} — ${JSON.stringify(err.response?.data)}`
      );
    }
    throw err;
  }
}

/** Invalidate cached token — call this after receiving a 401 response. */
export function invalidateToken(): void {
  cache = null;
}
