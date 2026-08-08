import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// ────────────────────────────────────────────────────────────────
// Refresco de token (persistencia de sesión)
// ────────────────────────────────────────────────────────────────

const clearSession = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

// Intenta renovar el access token con el refresh token guardado.
// Devuelve el nuevo access token o null si no fue posible.
const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) return null;
  try {
    const res = await axios.post(`${BASE_URL}/auth/refresh`, null, {
      params: { refresh_token: refreshToken },
      timeout: 10000,
    });
    const data = res.data;
    if (data?.access_token) {
      localStorage.setItem('access_token', data.access_token);
      if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);
      return data.access_token;
    }
    return null;
  } catch {
    return null;
  }
};

// ────────────────────────────────────────────────────────────────
// Cliente axios
// ────────────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json; charset=utf-8',
  },
  responseType: 'json',
  responseEncoding: 'utf8',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de respuesta:
//  - En error 401 renueva el token automáticamente y reintenta la petición.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;
    const originalRequest: any = config;
    const url: string = originalRequest?.url || '';

    const isAuthEndpoint =
      url.includes('/auth/login') || url.includes('/auth/refresh');

    if (
      response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }
      // No se pudo renovar la sesión → cerrar sesión
      clearSession();
    }

    return Promise.reject(error);
  }
);

export default api;
