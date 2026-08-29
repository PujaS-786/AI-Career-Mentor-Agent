/**
 * api.js — Frontend API service layer
 *
 * All HTTP calls to the Flask backend go through this file.
 * The base URL is read from the Vite environment variable so it is
 * never hard-coded in component files and can be changed per environment.
 *
 * Usage:
 *   import api from '@/services/api';
 *   const data = await api.get('/health');
 */

// Read the base URL from the Vite env variable (defined in .env.local)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api/v1';

/**
 * Core fetch wrapper.
 * Sends a JSON request and returns the parsed response body.
 * Throws a descriptive Error on HTTP errors or network failures.
 *
 * @param {string} endpoint  - Path relative to BASE_URL, e.g. '/health'
 * @param {RequestInit} options - Optional fetch options (method, body, etc.)
 * @returns {Promise<any>}   - Parsed JSON response
 */
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  // Parse the JSON body regardless of status so we can surface server messages
  let data;
  try {
    data = await response.json();
  } catch {
    // Server returned no JSON body (e.g. 502 from a proxy)
    throw new Error(`Server returned a non-JSON response (HTTP ${response.status})`);
  }

  if (!response.ok) {
    // Use the server's own message if provided, otherwise fall back to status text
    throw new Error(data?.message || `HTTP error ${response.status}: ${response.statusText}`);
  }

  return data;
}

/**
 * Convenience wrappers for common HTTP verbs.
 * Add more verbs (PUT, DELETE, PATCH) here as the project grows.
 */
const api = {
  /** GET request */
  get: (endpoint, options = {}) => request(endpoint, { method: 'GET', ...options }),

  /** POST request with a JSON body */
  post: (endpoint, body, options = {}) =>
    request(endpoint, { method: 'POST', body: JSON.stringify(body), ...options }),
};

export default api;
