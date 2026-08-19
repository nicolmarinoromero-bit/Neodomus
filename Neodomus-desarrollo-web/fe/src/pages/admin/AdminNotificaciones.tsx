import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUserPlus,
  FaCalendarCheck,
  FaUserSlash,
  FaBoxArchive,
  FaBoxOpen,
  FaCircleInfo,
  FaBell,
  FaArrowRight,
  FaTruckFast,
} from 'react-icons/fa6';
import '@styles/admin-panel.css';
import '@styles/dashboard-admin.css';
import { useAdminNotificaciones, type TipoNotificacion } from '../../hooks/useAdminNotificaciones';

const FILTROS: { id: 'todas' | TipoNotificacion; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'cuenta', label: 'Solicitudes de cuenta' },
  { id: 'stock', label: 'Stock' },
];

const ICONO_TIPO: Record<TipoNotificacion, React.ReactNode> = {
  cuenta: <FaUserSlash />,
  registro: <FaUserPlus />,
  cita: <FaCalendarCheck />,
  pedido: <FaBoxArchive />,
  stock: <FaBoxOpen />,
  sistema: <FaCircleInfo />,
  entrega: <FaTruckFast />,
};

const ETIQUETA_TIPO: Record<TipoNotificacion, string> = {
  cuenta: 'Solicitud de cuenta',
  registro: 'Nuevo registro',
  cita: 'Cita e instalación',
  pedido: 'Pedido',
  stock: 'Stock agotado',
  sistema: 'Sistema',
  entrega: 'Entrega',
};

const AdminNotificaciones = () => {
  const { notificaciones, cargando, noLeidas, recargar } = useAdminNotificaciones();
  const [filtro, setFiltro] = useState<'todas' | TipoNotificacion>('todas');

  const visibles = useMemo(
    () => (filtro === 'todas' ? notificaciones : notificaciones.filter((n) => n.tipo === filtro)),
    [notificaciones, filtro]
  );

  const conteo = (tipo: 'todas' | TipoNotificacion) =>
    tipo === 'todas' ? notificaciones.length : notificaciones.filter((n) => n.tipo === tipo).length;

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
            Solicitudes de cuenta y alertas de stock de productos.
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
      ) : visibles.length === 0 ? (
        <div className="ap-card">
          <div className="ap-states">
            <div className="ap-states-icon">
              <FaBell />
            </div>
            <h3>No hay notificaciones</h3>
            <p>No hay novedades en esta categoría por el momento.</p>
            <button type="button" className="ap-btn ap-btn-ghost" onClick={() => recargar()}>
              Actualizar
            </button>
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
