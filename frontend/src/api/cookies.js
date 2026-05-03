const AUTH_TOKEN_COOKIE_NAME = 'auth_token';

function readCookieValue(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookieValue(name, value, { maxAgeSeconds } = {}) {
  const encoded = encodeURIComponent(value);

  // max-age (optional). If not provided, cookie becomes a session cookie.
  const maxAgePart = typeof maxAgeSeconds === 'number' ? `; max-age=${maxAgeSeconds}` : '';

  // Accessible from JS (not httpOnly), потому что backend сейчас ожидает Token в Authorization.
  document.cookie = `${name}=${encoded}; path=/${maxAgePart}`;
}

function clearCookieValue(name) {
  // Удаляем cookie через max-age=0
  document.cookie = `${name}=; path=/; max-age=0`;
}

export function getAuthToken() {
  // 1) Берём из cookie (по требованию "cookie")
  const tokenFromCookie = readCookieValue(AUTH_TOKEN_COOKIE_NAME);
  if (tokenFromCookie) return tokenFromCookie;

  // 2) Fallback на localStorage, чтобы не сломать старое состояние после деплоя/обновления
  try {
    return localStorage.getItem(AUTH_TOKEN_COOKIE_NAME);
  } catch {
    return null;
  }
}

export function setAuthToken(token, { maxAgeSeconds = 60 * 60 * 24 * 7 } = {}) {
  writeCookieValue(AUTH_TOKEN_COOKIE_NAME, token, { maxAgeSeconds });
  // Дополнительно продублируем в localStorage для совместимости с уже существующим кодом,
  // который мы будем постепенно переписывать.
  try {
    localStorage.setItem(AUTH_TOKEN_COOKIE_NAME, token);
  } catch {
    // ignore
  }
}

export function clearAuthToken() {
  clearCookieValue(AUTH_TOKEN_COOKIE_NAME);
  try {
    localStorage.removeItem(AUTH_TOKEN_COOKIE_NAME);
  } catch {
    // ignore
  }
}
