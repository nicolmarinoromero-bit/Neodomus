export interface LoginResponse {
  access_token: string;
  token_type: string;
  rol: string;
  nombre: string;
}

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol?: string;
  tipo?: 'cliente' | 'usuario';
}

/* ── Módulo administrador ─────────────────────────────────── */

export interface SolicitudCuenta {
  id: number;
  id_cliente: number;
  tipo: 'inhabilitar' | 'habilitar';
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  motivo?: string | null;
  created_at?: string | null;
  resuelta_at?: string | null;
  cliente_nombre: string;
  cliente_email: string;
}

export interface EmpleadoAdmin {
  id_usuario: number;
  first_name: string;
  last_name: string;
  id_tipo_documento_u?: number | null;
  documento_usuario?: number | null;
  telefono_usuario?: number | null;
  email: string;
  is_active: boolean;
  id_rol_u?: number | null;
  created_at: string;
}

export interface ClienteAdmin {
  id_cliente: number;
  first_name: string;
  last_name: string;
  id_tipo_documento_c?: number | null;
  documento_cliente?: number | null;
  telefono_cliente?: number | null;
  email: string;
  address?: string | null;
  is_active: boolean;
  created_at?: string | null;
  pedidos_count?: number;
  citas_count?: number;
}

export interface CitaAdmin {
  id_cita: number;
  id_cliente: number;
  id_tecnico?: number | null;
  nombre_tecnico?: string | null;
  tipo_servicio: string;
  fecha: string;
  hora: string;
  direccion: string;
  descripcion?: string | null;
  estado: string;
  created_at?: string | null;
  cliente_nombre?: string | null;
  cliente_email?: string | null;
}

export interface VarianteAdmin {
  id: number;
  nombre: string;
  hex?: string | null;
  imagen_url?: string | null;
  stock: number;
}

export interface ProductoAdmin {
  id_producto: number;
  nombre_producto: string;
  referencia_producto?: string | null;
  precio_compra_producto?: number | null;
  precio_venta_producto: number;
  fecha_registro_producto?: string | null;
  imagen_url?: string | null;
  id_cate_pr?: number | null;
  nombre_categoria?: string | null;
  id_proveedor_pr?: number | null;
  nombre_proveedor?: string | null;
  descripcion_producto?: string | null;
  colores_producto?: string | null;
  estado_producto: string;
  stock_producto: number;
  stock_estado: 'disponible' | 'bajo' | 'agotado';
  stock_minimo: number;
  variantes?: VarianteAdmin[];
}

export interface ProveedorAdmin {
  id_proveedor: number;
  nombre_proveedor: string;
  contacto_proveedor?: string | null;
  telefono_proveedor?: string | null;
  correo_proveedor?: string | null;
  direccion_proveedor?: string | null;
}

export interface TecnicoAdmin {
  id_tecnico: number;
  id_usuario: number;
  first_name: string;
  last_name: string;
  email: string;
  telefono_usuario?: number | null;
  documento_usuario?: number | null;
  certificacion_t?: string | null;
  cargo_t?: string | null;
  is_active: boolean;
  created_at?: string | null;
}

export interface ReporteResumen {
  ventas_total: number;
  pedidos_total: number;
  pedidos_por_mes: { mes: string; cantidad: number; ventas: number }[];
  productos_mas_vendidos: { nombre_producto: string; cantidad: number; total: number }[];
  clientes_total: number;
  citas_total: number;
  citas_por_estado: { Pendiente: number; Confirmada: number; Finalizada: number; Cancelada: number };
  citas_por_mes: { mes: string; cantidad: number }[];
  tecnicos_total: number;
  tecnicos_activos: number;
  productos_total: number;
  productos_activos: number;
  solicitudes_pendientes: number;
}

export interface CategoriaAdmin {
  id_categoria: number;
  nombre_categoria: string;
  descripcion: string;
}

export interface ConsultaAdmin {
  id: number;
  nombre_usuario: string;
  email_usuario: string;
  asunto: string;
  mensaje: string;
  categoria?: string | null;
  estado: 'pendiente' | 'respondida';
  respuesta?: string | null;
  created_at?: string | null;
  responded_at?: string | null;
}