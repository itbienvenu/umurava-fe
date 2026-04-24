import { API_BASE_URL } from "./api-config";

const BASE = API_BASE_URL;

export function getTokens() {
  if (typeof window === "undefined") return { accessToken: null, refreshToken: null };
  return {
    accessToken: localStorage.getItem("accessToken") || null,
    refreshToken: localStorage.getItem("refreshToken") || null,
  };
}

export function saveTokens(accessToken: string, refreshToken?: string) {
  localStorage.setItem("accessToken", accessToken);
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
}

export function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}

export function getUser(): { _id: string; name: string; email: string; role: string } | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function saveUser(user: object) {
  // Normalize role to lowercase before saving
  const normalized = { ...(user as Record<string, unknown>) };
  if (typeof normalized.role === "string") {
    normalized.role = normalized.role.toLowerCase().trim();
  }
  localStorage.setItem("user", JSON.stringify(normalized));
}

/** Normalize role for comparison (lowercase, trim whitespace) */
export function normalizeRole(role: string): string {
  return role.toLowerCase().trim();
}

/** Check if user has a specific role (case-insensitive) */
export function hasRole(user: { role?: string } | null, expectedRole: string): boolean {
  if (!user || typeof user.role !== "string") return false;
  return normalizeRole(user.role) === normalizeRole(expectedRole);
}

/** Calls /api/v1/auth/refresh and updates the stored accessToken.
 *  Returns the new accessToken or null on failure. */
export async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = getTokens();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${BASE}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      saveTokens(data.data.accessToken);
      return data.data.accessToken;
    }
    clearTokens();
    return null;
  } catch {
    return null;
  }
}

export async function authFetch(input: RequestInfo, init: RequestInit = {}): Promise<Response> {
  const { accessToken } = getTokens();
  if (process.env.NODE_ENV === 'development') {
    console.log(`[authFetch] Initiating request to: ${input}`, { hasToken: !!accessToken });
  }

  const makeRequest = (token: string | null) => {
    const headers = new Headers(init.headers);

    if (!headers.has("Content-Type") && !(init.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return fetch(input, { ...init, headers });
  };

  let res = await makeRequest(accessToken);
  if (process.env.NODE_ENV === 'development') {
    console.log(`[authFetch] Response status ${res.status} from ${input}`);
  }

  if (res.status === 401) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[authFetch] Unauthorized (401) response from ${input}. Attempting token refresh...`);
    }
    const newToken = await refreshAccessToken();
    if (newToken) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[authFetch] Token refreshed successfully. Retrying request to ${input}...`);
      }
      res = await makeRequest(newToken);
    } else {
       if (process.env.NODE_ENV === 'development') {
         console.error(`[authFetch] Token refresh failed for ${input}.`);
       }
    }
  }

  return res;
}
