// lib/api.js
// ─────────────────────────────────────────────────────────────
// Helper terpusat untuk semua request ke Laravel API.
// Gunakan fungsi-fungsi ini di setiap halaman/komponen.
// ─────────────────────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

// ── Token helpers ────────────────────────────────────────────

/** Simpan token ke localStorage */
export function saveToken(token) {
  localStorage.setItem('auth_token', token);
}

/** Ambil token dari localStorage */
export function getToken() {
  return localStorage.getItem('auth_token');
}

/** Hapus token (saat logout) */
export function removeToken() {
  localStorage.removeItem('auth_token');
}

/** Cek apakah user sudah login */
export function isLoggedIn() {
  return !!getToken();
}

// ── Base fetch wrapper ───────────────────────────────────────

/**
 * Wrapper fetch yang otomatis:
 * - Tambah header Accept & Content-Type
 * - Tambah Authorization Bearer token (jika ada)
 * - Parse JSON response
 * - Throw error jika response tidak OK
 */
async function apiFetch(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    // Kalau ada token, tambahkan ke header Authorization
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    // Merge dengan headers tambahan dari caller
    ...options.headers,
  };

  const response = await fetch(`${API_URL}/api${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  // Jika response tidak OK (4xx, 5xx), lempar error
  if (!response.ok) {
    // Laravel mengembalikan errors validasi di data.errors
    const message =
      data.message ||
      (data.errors ? Object.values(data.errors).flat().join(' ') : 'Terjadi kesalahan.');
    throw new Error(message);
  }

  return data;
}

// ── Auth endpoints ───────────────────────────────────────────

/**
 * Register user baru
 * @param {{ name, email, password, password_confirmation }} body
 */
export async function registerUser(body) {
  return apiFetch('/register', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * Login user
 * @param {{ email, password }} body
 */
export async function loginUser(body) {
  return apiFetch('/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * Ambil data user yang sedang login (butuh token)
 */
export async function getUser() {
  return apiFetch('/user');
}

/**
 * Logout — hapus token di server lalu hapus di localStorage
 */
export async function logoutUser() {
  await apiFetch('/logout', { method: 'POST' });
  removeToken();
}