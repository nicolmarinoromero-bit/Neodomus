import axios from 'axios';

// Función para corregir codificación UTF-8 mal interpretada (ISO-8859-1 → UTF-8)
const fixEncoding = (str: string): string => {
  try {
    // Si el string tiene caracteres como Ã³, Ã¡, etc., significa que UTF-8 se leyó como Latin1
    // Convertimos de Latin1 a UTF-8
    return decodeURIComponent(escape(str));
  } catch {
    return str;
  }
};

// Recorrer recursivamente un objeto y corregir strings
const fixObjectEncoding = (obj: any): any => {
  if (typeof obj === 'string') {
    return fixEncoding(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(fixObjectEncoding);
  }
  if (obj && typeof obj === 'object') {
    const fixed: any = {};
    for (const key of Object.keys(obj)) {
      fixed[key] = fixObjectEncoding(obj[key]);
    }
    return fixed;
  }
  return obj;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json; charset=utf-8',
  },
  responseType: 'json',
  responseEncoding: 'utf8',
  // Usar transformResponse para corregir ANTES del parseo JSON
  transformResponse: [(data) => {
    if (typeof data === 'string') {
      const fixed = fixEncoding(data);
      try {
        return JSON.parse(fixed);
      } catch {
        return data;
      }
    }
    return data;
  }],
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor adicional para corregir cualquier objeto ya parseado
api.interceptors.response.use(
  (response) => {
    // Corregir recursivamente todos los strings en la respuesta
    response.data = fixObjectEncoding(response.data);
    return response;
  },
  (error) => Promise.reject(error)
);

export default api;