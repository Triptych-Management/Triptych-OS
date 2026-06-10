import { USER_COOKIE, USER_COOKIE_DAYS } from "./constants";

export function readUserCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${USER_COOKIE}=`));
  if (!match) return null;
  const value = decodeURIComponent(match.split("=")[1] ?? "");
  return value || null;
}

export function writeUserCookie(userId: string): void {
  if (typeof document === "undefined") return;
  const expires = new Date();
  expires.setDate(expires.getDate() + USER_COOKIE_DAYS);
  document.cookie = `${USER_COOKIE}=${encodeURIComponent(
    userId
  )}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
}

export function clearUserCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${USER_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}
