import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.LOG_API_BASE ?? "http://20.207.122.201/evaluation-service";
const REFRESH_BUFFER_MS = 60_000;

interface TokenCache { token: string; expiresAt: number; }
let cache: TokenCache | null = null;

export async function getAuthToken(): Promise<string> {
  const now = Date.now();
  if (cache && cache.expiresAt - now > REFRESH_BUFFER_MS) return cache.token;

  const clientId = process.env.LOG_CLIENT_ID;
  const clientSecret = process.env.LOG_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("LOG_CLIENT_ID and LOG_CLIENT_SECRET must be set in .env");
  }

  // Auth endpoint requires all 6 fields
  const { data } = await axios.post<{ access_token: string; expires_in: number }>(
    `${BASE_URL}/auth`,
    {
      clientID: clientId,
      clientSecret,
      email: "karan1327.be23@chitkara.edu.in",
      name: "Karan",
      rollNo: "2310991327",
      accessCode: "EXfvDp",
    }
  );

  // Response uses access_token and expires_in (unix timestamp, not duration)
  const expiresAt = data.expires_in > 1_000_000_000
    ? data.expires_in * 1000          // already a unix timestamp in seconds
    : now + data.expires_in * 1000;   // duration in seconds

  cache = { token: data.access_token, expiresAt };
  return cache.token;
}

export function invalidateToken(): void { cache = null; }
