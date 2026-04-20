/**
 * api.ts — Centralized API client for blain-projects.ca web projects.
 *
 * WHAT THIS DOES:
 *   1. Auto-detects the correct backend URL (localhost in dev, api.SUBDOMAIN in prod)
 *   2. Always sends auth cookies (credentials: 'include') so Google OAuth works
 *   3. Provides a drop-in replacement for fetch() — just use `apiFetch('/api/...')`
 *
 * USAGE:
 *   import { apiFetch, getApiBaseUrl } from './api';
 *
 *   // Simple GET:
 *   const res = await apiFetch('/api/health');
 *   const data = await res.json();
 *
 *   // POST with body:
 *   const res = await apiFetch('/api/items', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ name: 'test' }),
 *   });
 *
 * WHY:
 *   In production, the frontend (monprojet.blain-projects.ca) calls the backend
 *   (api.monprojet.blain-projects.ca) — that's cross-origin. The browser requires:
 *     - `credentials: 'include'` on every fetch (sends the auth cookie)
 *     - Explicit CORS origins on the backend (not '*')
 *   Forgetting `credentials: 'include'` on even ONE fetch = 307 auth redirect = broken.
 *   This module makes it impossible to forget.
 *
 * SEE ALSO: NETWORK.md for the full architecture explanation.
 */

/**
 * Returns the base URL for API calls.
 * - In dev: http://localhost:5000 (or VITE_API_PORT)
 * - In prod: https://api.{current host}
 * - Override: set VITE_API_BASE_URL at build time
 */
export function getApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL;
  if (configured) return configured;

  if (typeof window === 'undefined') return '';

  const { hostname, protocol, host } = window.location;
  if (['localhost', '127.0.0.1'].includes(hostname)) {
    const port = import.meta.env.VITE_API_PORT ?? '5000';
    return `http://localhost:${port}`;
  }

  return `${protocol}//api.${host}`;
}

/**
 * Build a full API URL from a path.
 * @example apiUrl('/api/health') → 'https://api.monprojet.blain-projects.ca/api/health'
 */
export function apiUrl(path: string): string {
  return `${getApiBaseUrl()}${path}`;
}

/**
 * Fetch wrapper that ALWAYS sends auth cookies.
 * Drop-in replacement for fetch() when calling your backend.
 *
 * @param path  - API path (e.g. '/api/health') — auto-prefixed with the base URL
 * @param init  - Standard RequestInit options (method, headers, body, signal, etc.)
 * @returns     - Standard Response promise
 */
export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(apiUrl(path), { ...init, credentials: 'include' });
}
