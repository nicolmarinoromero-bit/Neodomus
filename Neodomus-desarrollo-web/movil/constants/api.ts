/**
 * Configuración central de conexión con el backend NEODOMUS.
 *
 * ÚNICA fuente de la URL del backend en toda la app móvil.
 *
 * La URL base se lee desde la variable de entorno `EXPO_PUBLIC_API_URL`
 * (archivo `.env` / `.env.local` del proyecto móvil). Si no está definida,
 * se usa un valor por defecto según la plataforma:
 *   - Emulador Android:  10.0.2.2 (alias del host)
 *   - iOS Simulator / Web: localhost
 *
 * Para un teléfono físico define en `.env`:
 *   EXPO_PUBLIC_API_URL=http://<IP-LAN-DEL-PC>:8000/api/v1
 *
 * IMPORTANTE: tras modificar `.env` reinicia Metro con `--clear`
 * (pnpm start --clear) para que la variable se incruste en el bundle.
 *
 * Todos los recursos (imágenes, PDFs, evidencias) se resuelven a partir de
 * esta misma base mediante `resolveMediaUrl`.
 */
import { Platform } from "react-native";

const ENV_API_URL = process.env.EXPO_PUBLIC_API_URL;

const DEFAULT_API_URL =
  Platform.OS === "android" ? "http://10.0.2.2:8000/api/v1" : "http://localhost:8000/api/v1";

export const API_URL = (ENV_API_URL || DEFAULT_API_URL).replace(/\/+$/, "");

if (__DEV__) {
  if (!ENV_API_URL) {
    console.warn(
      `[API] EXPO_PUBLIC_API_URL no está definido. Usando valor por defecto: ${API_URL}. ` +
        "Para un teléfono físico crea el archivo movil/.env con EXPO_PUBLIC_API_URL=http://<IP-LAN-DEL-PC>:8000/api/v1 y reinicia Metro con --clear."
    );
  } else {
    console.log(`[API] Backend configurado en: ${API_URL}`);
  }
}

/** Origen (host base) del backend: protocolo + host + puerto, sin /api/v1. */
export const API_HOST = (() => {
  try {
    const u = new URL(API_URL);
    return u.origin;
  } catch {
    return API_URL;
  }
})();

/**
 * Convierte una URL de recurso del backend en una URL accesible desde el
 * dispositivo:
 *  - "/uploads/xxx.jpg"  ->  http://<host>/uploads/xxx.jpg
 *  - "uploads/xxx.jpg"   ->  http://<host>/uploads/xxx.jpg
 *  - "http://localhost:8000/uploads/xxx.jpg" -> usa el host real configurado
 *  - URL completa válida -> se conserva tal cual
 */
export function resolveMediaUrl(url?: string | null): string | null {
  if (!url) return null;
  const value = String(url).trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) {
    try {
      const parsed = new URL(value);
      if (
        parsed.hostname === "localhost" ||
        parsed.hostname === "127.0.0.1" ||
        parsed.hostname === "0.0.0.0" ||
        parsed.hostname === "10.0.2.2"
      ) {
        return value.replace(parsed.origin, API_HOST);
      }
      return value;
    } catch {
      return value;
    }
  }
  return `${API_HOST}/${value.replace(/^\/+/, "")}`;
}
