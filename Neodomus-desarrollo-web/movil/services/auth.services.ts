import { apiFetch } from "./api";
import { saveSession, clearSession, getSessionUser, SessionUser } from "./session";

export type LoginResult = {
  access_token: string;
  refresh_token: string;
  token_type?: string;
  user_type?: string;
  rol?: string;
  password_reset_required?: boolean;
};

export type PerfilUsuario = {
  id?: number;
  email?: string;
  first_name?: string;
  last_name?: string;
  nombre?: string;
  rol?: string;
  user_type?: string;
  [key: string]: unknown;
};

export const VALIDAR_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const VALIDAR_PASSWORD = (v: string) => {
  if (v.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
  if (!/[A-Z]/.test(v)) return "La contraseña debe contener una mayúscula.";
  if (!/[a-z]/.test(v)) return "La contraseña debe contener una minúscula.";
  if (!/\d/.test(v)) return "La contraseña debe contener un número.";
  return null;
};

export const esRolAdmin = (rol?: string | null) =>
  !rol || /admin|administrador/i.test(rol);

export const esRolTecnico = (rol?: string | null) => /tecnic|empleado/i.test(rol ?? "");

export const login = async (correo: string, password: string): Promise<LoginResult> => {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: correo.trim(), password }),
  });
};

export const registerClient = async (payload: Record<string, unknown>): Promise<any> => {
  return apiFetch("/auth/register/client", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const verifyEmail = async (code: string): Promise<any> => {
  return apiFetch(`/auth/verify-email?code=${encodeURIComponent(code)}`, {
    method: "POST",
  });
};

export const resendVerification = async (email: string): Promise<any> => {
  return apiFetch("/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify({ email: email.trim() }),
  });
};

export const forgotPassword = async (email: string): Promise<any> => {
  return apiFetch("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email: email.trim() }),
  });
};

export const verifyCode = async (email: string, code: string): Promise<any> => {
  return apiFetch("/auth/verify-code", {
    method: "POST",
    body: JSON.stringify({ email: email.trim(), code }),
  });
};

export const resetPassword = async (token: string, newPassword: string): Promise<any> => {
  return apiFetch("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, new_password: newPassword }),
  });
};

export const solicitarHabilitacion = async (email: string, password: string): Promise<any> => {
  return apiFetch("/auth/solicitar-habilitacion", {
    method: "POST",
    body: JSON.stringify({ email: email.trim(), password }),
  });
};

/** Obtiene el perfil del usuario autenticado según su user_type. */
export const obtenerPerfil = async (userType: string): Promise<PerfilUsuario> => {
  const data = await apiFetch(userType === "employee" ? "/users/me" : "/clients/me");
  return data as PerfilUsuario;
};

/** Guarda la sesión completa: tokens + datos del perfil real del backend. */
export const guardarSesion = async (data: LoginResult, emailFallback = "") => {
  const userType = data.user_type ?? "client";
  let perfil: PerfilUsuario = {};
  try {
    perfil = await obtenerPerfil(userType);
  } catch {
    // Si el perfil no se puede obtener, usamos los datos del login.
  }
  const rol =
    perfil.rol ??
    data.rol ??
    (userType === "employee" ? "empleado" : "cliente");

  const nombre = perfil.nombre || `${perfil.first_name || ""} ${perfil.last_name || ""}`.trim();

  const idUsuario =
    (perfil.id_cliente as number | string | undefined) ??
    (perfil.id_usuario as number | string | undefined) ??
    (perfil.id as number | string | undefined);

  const user: SessionUser = {
    id: idUsuario,
    email: perfil.email || emailFallback || "",
    nombre: nombre || emailFallback.split("@")[0] || "",
    rol,
    user_type: userType,
    first_name: perfil.first_name,
    last_name: perfil.last_name,
    password_reset_required: data.password_reset_required ?? false,
  };
  await saveSession(data.access_token, data.refresh_token, user);
  return user;
};

export const cerrarSesion = async () => {
  await clearSession();
};

export const enmascararCorreo = (email: string): string => {
  const limpio = (email || "").trim();
  const [local, dominio] = limpio.split("@");
  if (!dominio) return limpio;
  const visible = local.length <= 3 ? local.slice(0, 1) : local.slice(0, 3);
  return `${visible}****@${dominio}`;
};

export { getSessionUser };