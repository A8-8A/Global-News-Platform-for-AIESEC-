// Centralized API client for the Spring Boot backend.
//
// Every network call goes through here so that:
//  - the base URL is configured once (from VITE_API_BASE_URL)
//  - our JWT session token is attached automatically
//  - error handling is consistent
//
// This talks to OUR backend only. The frontend never calls AIESEC's
// API or token endpoint directly - that all happens server-side.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Where we keep the session JWT in the browser.
const TOKEN_KEY = 'aiesec_news_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Core request helper.
 * @param {string} path   - path beginning with "/", e.g. "/api/feed"
 * @param {object} options - fetch options (method, body as plain object)
 */
async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  // 204 No Content - nothing to parse.
  if (response.status === 204) return null;

  let data = null;
  try {
    data = await response.json();
  } catch {
    // non-JSON response; leave data null
  }

  if (!response.ok) {
    const message = data?.message || `Request failed (${response.status})`;
    throw new ApiError(message, response.status, data);
  }

  return data;
}

/** Error type carrying the HTTP status, so callers can branch on it. */
export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
};
