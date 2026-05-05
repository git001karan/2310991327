import axios from "axios";

const BASE_URL = "http://20.207.122.201/evaluation-service";
const TOKEN_KEY = "log_token";
const TOKEN_EXPIRY_KEY = "log_token_expiry";
const REFRESH_BUFFER_MS = 60_000;

const FRONTEND_PACKAGES = [
  "api","component","hook","page","state","style",
  "auth","config","middleware","utils",
];
const VALID_LEVELS = ["debug","info","warn","error","fatal"];

async function getToken(): Promise<string> {
  const now = Date.now();
  const cached = sessionStorage.getItem(TOKEN_KEY);
  const expiry = Number(sessionStorage.getItem(TOKEN_EXPIRY_KEY) ?? "0");
  if (cached && expiry - now > REFRESH_BUFFER_MS) return cached;

  const clientId = process.env.REACT_APP_LOG_CLIENT_ID;
  const clientSecret = process.env.REACT_APP_LOG_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("Log credentials not set.");

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

  const expiresAt = data.expires_in > 1_000_000_000
    ? data.expires_in * 1000
    : now + data.expires_in * 1000;

  sessionStorage.setItem(TOKEN_KEY, data.access_token);
  sessionStorage.setItem(TOKEN_EXPIRY_KEY, String(expiresAt));
  return data.access_token;
}

export async function Log(
  stack: string,
  level: string,
  pkg: string,
  message: string
): Promise<void> {
  if (!["backend","frontend"].includes(stack)) throw new Error(`Invalid stack: ${stack}`);
  if (!VALID_LEVELS.includes(level)) throw new Error(`Invalid level: ${level}`);
  if (!FRONTEND_PACKAGES.includes(pkg)) throw new Error(`Invalid package: ${pkg}`);
  if (!message?.trim()) throw new Error("Message must be non-empty.");

  try {
    const token = await getToken();
    await axios.post(
      `${BASE_URL}/logs`,
      { stack, level, package: pkg, message },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch {
    // Logging failures must never break the UI
  }
}
