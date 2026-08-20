import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUserPlus,
  FaCalendarCheck,
  FaUserSlash,
  FaBoxArchive,
  FaCircleInfo,
  FaBell,
  FaArrowRight,
} from 'react-icons/fa6';
import '@styles/admin-panel.css';
import '@styles/dashboard-admin.css';
import api from '@services/api';
import type { SolicitudCuenta } from '../../types';

type TipoNotificacion = 'cuenta' | 'registro' | 'cita' | 'pedido' | 'sistema';

interface NotifAdmin {
  id: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  accion?: { to: string; label: string };
}

const FILTROS: { id: 'todas' | TipoNotificacion; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'cuenta', label: 'Solicitudes de cuenta' },
  { id: 'registro', label: 'Nuevos registros' },
  { id: 'cita', label: 'Citas' },
  { id: 'pedido', label: 'Pedidos' },
  { id: 'sistema', label: 'Sistema' },
];

const ICONO_TIPO: Record<TipoNotificacion, React.ReactNode> = {
  cuenta: <FaUserSlash />,
  registro: <FaUserPlus />,
  cita: <FaCalendarCheck />,
  pedido: <FaBoxArchive />,
  sistema: <FaCircleInfo />,
};

const ETIQUETA_TIPO: Record<TipoNotificacion, string> = {
  cuenta: 'Solicitud de cuenta',
  registro: 'Nuevo registro',
  cita: 'Cita e instalación',
  pedido: 'Pedido',
  sistema: 'Sistema',
};

const NOTIFICACIONES_DEMO: NotifAdmin[] = [
  {
    id: 'demo-1',
    tipo: 'registro',
    titulo: 'Nuevo usuario registrado',
    mensaje: 'Un nuevo cliente creó su cuenta en la plataforma y ya puede acceder al catálogo.',
    fecha: 'Hoy · 9:40 a. m.',
    leida: true,
    accion: { to: '/admin/clientes', label: 'Ver clientes' },
  },
  {
    id: 'demo-2',
    tipo: 'cita',
    titulo: 'Nueva cita programada',
    mensaje: 'Se agendó una instalación domótica para el próximo fin de semana.',
    fecha: 'Hoy · 8:15 a. m.',
    leida: false,
    accion: { to: '/admin/instalaciones', label: 'Ver instalaciones' },
  },
  {
    id: 'demo-3',
    tipo: 'pedido',
    titulo: 'Nuevo pedido recibido',
    mensaje: 'Un cliente realizó un pedido en la tienda y está listo para procesarse.',
    fecha: 'Ayer · 6:30 p. m.',
    leida: false,
    accion: { to: '/admin/productos', label: 'Gestionar catálogo' },
  },
  {
    id: 'demo-4',
    tipo: 'sistema',
    titulo: 'Mensaje del sistema',
    mensaje: 'Se recomienda revisar los reportes semanales y el estado general de la plataforma.',
    fecha: 'Ayer · 2:00 p. m.',
    leida: true,
    accion: { to: '/admin/reportes', label: 'Ver reportes' },
  },
];

const AdminNotificaciones = () => {
  const [solicitudes, setSolicitudes] = useState<SolicitudCuenta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [filtro, setFiltro] = useState<'todas' | TipoNotificacion>('todas');

  const cargar = () => {
    setCargando(true);
    setError(false);
    api
      .get<SolicitudCuenta[]>('/admin/account-requests')
      .then((res) => setSolicitudes(res.data))
      .catch(() => setError(true))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargar();
  }, []);

  const notificacionesCuentas: NotifAdmin[] = useMemo(
    () =>
      solicitudes.map((s) => ({
        id: `cuenta-${s.id}`,
        tipo: 'cuenta' as TipoNotificacion,
        titulo:
          s.tipo === 'habilitar'
            ? `Solicitud para habilitar la cuenta de ${s.cliente_nombre}`
            : `Solicitud para inhabilitar la cuenta de ${s.cliente_nombre}`,
        mensaje: s.motivo
          ? `Motivo: ${s.motivo}`
          : 'El cliente envió la solicitud sin especificar un motivo.',
        fecha: s.created_at
          ? new Date(s.created_at).toLocaleDateString('es-CO', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : '',
        leida: s.estado !== 'pendiente',
        accion: { to: '/dashboard/admin', label: 'Revisar en el dashboard' },
      })),
    [solicitudes]
  );

  const todas = useMemo(() => [...notificacionesCuentas, ...NOTIFICACIONES_DEMO], [notificacionesCuentas]);
  const visibles = filtro === 'todas' ? todas : todas.filter((n) => n.tipo === filtro);
  const noLeidas = todas.filter((n) => !n.leida).length;

  const conteo = (tipo: 'todas' | TipoNotificacion) =>
    tipo === 'todas' ? todas.length : todas.filter((n) => n.tipo === tipo).length;

  return (
    <motion.section
      className="admin-panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="ap-header">
        <div>
          <h1 className="ap-title">Notificaciones</h1>
          <p className="ap-subtitle">
            Solicitudes de cuenta, nuevos registros, citas, pedidos y mensajes del sistema.
          </p>
        </div>
        <div className="ap-header-right">
          <span className="welcome-badge">
            <FaBell />
            {noLeidas} sin leer
          </span>
        </div>
      </div>

      <div className="ap-pills">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`ap-pill ${filtro === f.id ? 'active' : ''}`}
            onClick={() => setFiltro(f.id)}
          >
            {f.label}
            <span className="ap-pill-count">{conteo(f.id)}</span>
          </button>
        ))}
      </div>

      {cargando ? (
        <div className="ap-card">
          <div className="ap-states">
            <span className="ap-loader" />
            <h3>Cargando notificaciones</h3>
            <p>Obteniendo la actividad reciente del panel...</p>
          </div>
        </div>
      ) : error ? (
        <div className="ap-card">
          <div className="ap-states error">
            <div className="ap-states-icon">
              <FaCircleInfo />
            </div>
            <h3>No se pudieron cargar las notificaciones</h3>
            <p>Verifica tu conexión e inténtalo nuevamente.</p>
            <button type="button" className="ap-btn ap-btn-ghost" onClick={cargar}>
              Reintentar
            </button>
          </div>
        </div>
      ) : visibles.length === 0 ? (
        <div className="ap-card">
          <div className="ap-states">
            <div className="ap-states-icon">
              <FaBell />
            </div>
            <h3>No hay notificaciones</h3>
            <p>No hay novedades en esta categoría por el momento.</p>
          </div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={filtro}
            className="an-list"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {visibles.map((notificacion) => (
              <article
                key={notificacion.id}
                className={`an-item ${notificacion.tipo} ${notificacion.leida ? '' : 'unread'}`}
              >
                <div className={`an-icon ${notificacion.tipo}`}>{ICONO_TIPO[notificacion.tipo]}</div>
                <div className="an-body">
                  <div className="an-top">
                    <span className="an-type">{ETIQUETA_TIPO[notificacion.tipo]}</span>
                    {!notificacion.leida && <span className="ap-badge warn">Nueva</span>}
                    {notificacion.fecha && <span className="an-fecha">{notificacion.fecha}</span>}
                  </div>
                  <h3 className="an-title">{notificacion.titulo}</h3>
                  <p className="an-msg">{notificacion.mensaje}</p>
                  {notificacion.accion && (
                    <div className="an-actions">
                      <Link to={notificacion.accion.to} className="ap-btn ap-btn-ghost">
                        {notificacion.accion.label} <FaArrowRight />
                      </Link>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </motion.section>
  );
};

export default AdminNotificaciones;
