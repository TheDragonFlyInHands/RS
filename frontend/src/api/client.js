import axios from 'axios';
import { getAuthToken, clearAuthToken } from './cookies';

const API_BASE_URL = 'http://localhost:8000/server_cm';

const DEFAULT_GET_CACHE_TTL_MS = 30_000;

const getCacheKey = ({ url, params }) => {
  const paramsPart = params ? JSON.stringify(params) : '';
  return `${url}?${paramsPart}`;
};

const getCache = new Map(); // key -> { expiresAt, data }

function getCachedData(key) {
  const entry = getCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    getCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCachedData(key, data, ttlMs) {
  getCache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

const api = axios.create({
  baseURL: API_BASE_URL,
  // Нам НЕ нужно с withCredentials, т.к. Django сейчас ожидает Token в Authorization.
  // Кэш/куки — это клиентская логика.
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // При любых 401/403 имеет смысл очистить токен, чтобы не гонять пользователя по циклу
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      clearAuthToken();
    }
    return Promise.reject(error);
  }
);

export async function apiGet(url, { params, cache = true, cacheTtlMs = DEFAULT_GET_CACHE_TTL_MS } = {}) {
  const key = getCacheKey({ url, params });

  if (cache) {
    const cached = getCachedData(key);
    if (cached !== null) return cached;
  }

  const res = await api.get(url, { params });
  if (cache) setCachedData(key, res.data, cacheTtlMs);
  return res.data;
}

export function apiPost(url, data, config = {}) {
  return api.post(url, data, config).then((r) => r.data);
}

export function apiPut(url, data, config = {}) {
  return api.put(url, data, config).then((r) => r.data);
}

export function apiDelete(url, config = {}) {
  return api.delete(url, config).then((r) => r.data);
}

export default api;
