import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api',
  withCredentials: true,               // required for Sanctum cookie auth
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});
 
// ── Request interceptor: attach Bearer token if present ───────────────────
instance.interceptors.request.use((config) => {
  // If you use token-based auth (not cookie), read from localStorage.
  // For SPA with cookie auth, withCredentials above is enough.
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
 
// ── Response interceptor: normalise errors ────────────────────────────────
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ?? error.message ?? 'Network error';
    return Promise.reject(new Error(message));
  },
);

export default instance;