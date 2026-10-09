/**
 * Centralized backend URL configuration.
 * Set VITE_API_URL to the server origin (no trailing slash).
 * Example: http://localhost:3002
 *          https://version-control-system-n1ri.onrender.com
 *
 * Paths under /api are appended here so callers keep using /users, /repos, etc.
 */

function normalizeOrigin(raw) {
  const fallback = "http://localhost:3002";
  let origin = String(raw || fallback).trim().replace(/\/+$/, "");

  // Support legacy env values that already include /api
  if (origin.toLowerCase().endsWith("/api")) {
    origin = origin.slice(0, -4).replace(/\/+$/, "");
  }

  return origin || fallback;
}

export const API_ORIGIN = normalizeOrigin(import.meta.env.VITE_API_URL);

/** Axios / REST base URL (includes /api). */
export const API_BASE_URL = `${API_ORIGIN}/api`;

/**
 * Socket.IO server origin (same host as the API).
 * Only use this if/when a client connection is intentionally added.
 */
export const SOCKET_URL = API_ORIGIN;

/**
 * Resolve image/media paths against the API origin.
 * Leaves absolute http(s), data:, and blob: URLs unchanged.
 */
export function resolveMediaUrl(path) {
  if (!path) return "";
  if (
    /^https?:\/\//i.test(path) ||
    path.startsWith("data:") ||
    path.startsWith("blob:")
  ) {
    return path;
  }
  return path.startsWith("/") ? `${API_ORIGIN}${path}` : `${API_ORIGIN}/${path}`;
}
