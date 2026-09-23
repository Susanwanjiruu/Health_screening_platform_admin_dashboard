const SESSION_KEY = "admin_session_token";
const REFRESH_KEY = "admin_refresh_token";

export function getAdminSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(SESSION_KEY);
}

export function getAdminRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(REFRESH_KEY);
}

export function saveAdminSession(
  sessionToken: string,
  refreshToken?: string,
): void {
  sessionStorage.setItem(SESSION_KEY, sessionToken);

  if (refreshToken) {
    sessionStorage.setItem(REFRESH_KEY, refreshToken);
  }
}

export function clearAdminSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
}
