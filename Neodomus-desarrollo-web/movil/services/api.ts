import { API_URL } from "../constants/api";
import {
  getAccessToken,
  getRefreshToken,
  saveSession,
  clearSession,
  getSessionUser,
} from "./session";

export type ApiError = {
  friendly: string;
  status?: number;
  detail?: unknown;
};

type RefreshResponse = {
  access_token: string;
  refresh_token: string;
  token_type?: string;
  user_type?: string;
  rol?: string;
  password_reset_required?: boolean;
};

const TIMEOUT_MS = 15000;

/** Logs de desarrollo: ruta y status de cada petición (sin datos sensibles). */
function logApi(method: string, endpoint: string, status?: number, info?: string) {
  if (!__DEV__) return;
  const linea = `[API] ${method} ${endpoint}`;
  if (status != null) {
    console.log(`${linea}\n[API] Status: ${status}${info ? `\n[API] ${info}` : ""}`);
  } else {
    console.log(`${linea}${info ? `\n[API] ${info}` : ""}`);
  }
}

/** Log de error: nunca imprime contraseñas ni tokens completos. */
function logApiError(method: string, endpoint: string, err: unknown) {
  if (!__DEV__) return;
  if (err instanceof Error && err.name === "AbortError") {
    console.log(`[API] ${method} ${endpoint}\n[API] Error: Timeout (${TIMEOUT_MS}ms)`);
  } else if (err instanceof TypeError) {
    console.log(`[API] ${method} ${endpoint}\n[API] Error: No se pudo conectar (${err.message})`);
  } else {
    console.log(`[API] ${method} ${endpoint}\n[API] Error:`, err);
  }
}

/** Extrae el detalle legible de un body de error de FastAPI. */
function extraerDetalle(data: any): string | undefined {
  const detail = data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((d: any) =>
        typeof d?.msg === "string" ? String(d.msg).split("Value error, ")[1] ?? d.msg : null
      )
      .filter(Boolean)
      .join(". ");
  }
  return undefined;
}

function mensajePorEstado(status: number, detalle?: string): string {
  if (detalle) return detalle;
  switch (status) {
    case 400:
      return "La solicitud no es válida. Revisa los datos e inténtalo de nuevo.";
    case 401:
      return "Tu sesión expiró o no es válida. Inicia sesión de nuevo.";
    case 403:
      return "No tienes permisos para realizar esta acción.";
    case 404:
      return "El recurso solicitado no existe en el servidor.";
    case 422:
      return "Los datos enviados no son válidos. Revisa el formulario.";
    case 429:
      return "Hiciste demasiadas solicitudes. Espera un momento e inténtalo de nuevo.";
    default:
      return "Ocurrió un error inesperado en el servidor. Inténtalo de nuevo.";
  }
}

function errorDeRed(): ApiError {
  return {
    friendly:
      "No pudimos conectar con el servidor. Verifica tu conexión a internet y que el backend esté encendido.",
  };
}

async function intentarRefrescarToken(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as RefreshResponse;
    if (!data?.access_token) return null;
    const usuario = (await getSessionUser()) || {};
    await saveSession(data.access_token, data.refresh_token, usuario);
    return data.access_token;
  } catch {
    return null;
  }
}

/**
 * Realiza una petición al backend NEODOMUS y devuelve el JSON de respuesta.
 * - Adjunta `Authorization: Bearer <token>` automáticamente si hay sesión.
 * - En un 401 intenta renovar el access token y reintenta la petición.
 * - Clasifica los errores: conexión, timeout, 4xx, 5xx, respuesta inesperada.
 * - En desarrollo imprime logs `[API]` (método, ruta, status y respuesta).
 */
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
  _retried = false
): Promise<any> {
  const method = (options.method ?? "GET").toUpperCase();
  const token = await getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controlador.signal,
    });
  } catch (err) {
    clearTimeout(temporizador);
    logApiError(method, endpoint, err);
    throw errorDeRed();
  }
  clearTimeout(temporizador);

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  logApi(method, endpoint, response.status, data != null ? `Response: ${JSON.stringify(data).slice(0, 400)}` : undefined);

  if (response.status === 401 && !_retried && !endpoint.includes("/auth/refresh")) {
    const nuevoToken = await intentarRefrescarToken();
    if (nuevoToken) {
      return apiFetch(endpoint, options, true);
    }
    await clearSession();
  }

  if (!response.ok) {
    const detalle = extraerDetalle(data);
    const err: ApiError = {
      friendly: mensajePorEstado(response.status, detalle),
      status: response.status,
      detail: data?.detail ?? data,
    };
    throw err;
  }

  return data;
}
