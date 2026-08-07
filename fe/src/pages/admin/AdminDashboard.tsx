import { useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import '@styles/dashboard-admin.css';
import {
  FiBox,
  FiCalendar,
  FiHeadphones,
  FiUser,
  FiFileText,
  FiCheckCircle,
  FiX,
  FiUserX,
  FiRefreshCw
} from "react-icons/fi";
import api from '@services/api';

// Importación de imágenes
import fondo2 from '@assets/images/Fondo2.png';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

interface SolicitudCuenta {
  id: number;
  tipo: string;
  estado: string;
  motivo?: string | null;
  created_at?: string | null;
  cliente_nombre: string;
  cliente_email: string;
}

const AdminDashboard = () => {
  const [solicitudes, setSolicitudes] = useState<SolicitudCuenta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [resolviendoId, setResolviendoId] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const cargarSolicitudes = async () => {
    setCargando(true);
    try {
      const res = await api.get<SolicitudCuenta[]>('/admin/account-requests');
      setSolicitudes(res.data);
    } catch (err) {
      console.error('Error cargando solicitudes:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const resolver = async (id: number, accion: 'aprobar' | 'rechazar') => {
    setResolviendoId(id);
    setMensaje(null);
    try {
      await api.put(`/admin/account-requests/${id}/${accion}`);
      setMensaje({ type: 'ok', text: accion === 'aprobar' ? 'Solicitud aprobada' : 'Solicitud rechazada' });
      await cargarSolicitudes();
    } catch (err: any) {
      setMensaje({ type: 'err', text: err.response?.data?.detail || 'No se pudo procesar la solicitud' });
    } finally {
      setResolviendoId(null);
    }
  };

  const tipoLabel = (tipo: string) => (tipo === 'habilitar' ? 'Habilitación' : 'Inhabilitación');

  return (
    <>
      <div className="admin-bg-layer" style={{ backgroundImage: `url(${fondo2})` }} />
      <motion.section
        className="admin-container"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="welcome-banner">
          <div className="welcome-content">
            <h1>
              ¡Bienvenido, <span>Administrador</span>!
            </h1>
            <p>
              Gestiona los servicios, productos y soporte de la
              plataforma desde un solo lugar.
            </p>
          </div>
        </div>

        <div className="novedades-card">
          <h2>Novedades</h2>

          <div className="novedad-item">
            <div className="novedad-left">
              <div className="icon-circle">
                <FiBox />
              </div>
              <div>
                <h3>Nuevo producto agregado</h3>
                <p>Cámara Inteligente HD</p>
              </div>
            </div>
            <span>Hace 1 hora</span>
          </div>

          <div className="novedad-item">
            <div className="novedad-left">
              <div className="icon-circle">
                <FiCalendar />
              </div>
              <div>
                <h3>Instalación programada</h3>
                <p>18 de junio - 9:00 AM</p>
              </div>
            </div>
            <span>Hace 2 horas</span>
          </div>

          <div className="novedad-item">
            <div className="novedad-left">
              <div className="icon-circle">
                <FiHeadphones />
              </div>
              <div>
                <h3>Nuevo caso de soporte</h3>
                <p>Cliente reporta falla de conexión</p>
              </div>
            </div>
            <span>Hace 3 horas</span>
          </div>

          <div className="novedad-item">
            <div className="novedad-left">
              <div className="icon-circle">
                <FiUser />
              </div>
              <div>
                <h3>Nuevo técnico registrado</h3>
                <p>Carlos Ramírez</p>
              </div>
            </div>
            <span>Hace 5 horas</span>
          </div>

          <div className="novedad-item">
            <div className="novedad-left">
              <div className="icon-circle">
                <FiFileText />
              </div>
              <div>
                <h3>Nuevo pedido recibido</h3>
                <p>Pedido #0254</p>
              </div>
            </div>
            <span>Hace 6 horas</span>
          </div>
        </div>

        {/* ── Solicitudes de cuenta ─────────────────────────────── */}
        <div className="card admin-solicitudes">
          <div className="admin-solicitudes-head">
            <h2><FiUserX /> Solicitudes de cuenta</h2>
            <button type="button" className="solicitud-refresh" onClick={cargarSolicitudes} disabled={cargando} title="Actualizar">
              <FiRefreshCw className={cargando ? 'spin' : ''} />
            </button>
          </div>

          {mensaje && <div className={`solicitud-msg ${mensaje.type}`}>{mensaje.text}</div>}

          {cargando ? (
            <p className="solicitudes-vacio">Cargando solicitudes...</p>
          ) : solicitudes.length === 0 ? (
            <p className="solicitudes-vacio">No hay solicitudes de inhabilitación o habilitación pendientes.</p>
          ) : (
            <div className="solicitudes-list">
              {solicitudes.map((s) => {
                const pendiente = s.estado === 'pendiente';
                return (
                  <div key={s.id} className={`solicitud-item ${s.estado}`}>
                    <div className="solicitud-info">
                      <strong>{s.cliente_nombre}</strong>
                      <span className="solicitud-email">{s.cliente_email}</span>
                      <span className={`solicitud-badge tipo-${s.tipo}`}>{tipoLabel(s.tipo)}</span>
                      <span className={`solicitud-badge estado-${s.estado}`}>{s.estado}</span>
                      {s.motivo && <p className="solicitud-motivo">{s.motivo}</p>}
                    </div>
                    {pendiente && (
                      <div className="solicitud-acciones">
                        <button
                          type="button"
                          className="solicitud-btn ok"
                          disabled={resolviendoId === s.id}
                          onClick={() => resolver(s.id, 'aprobar')}
                        >
                          <FiCheckCircle /> Aprobar
                        </button>
                        <button
                          type="button"
                          className="solicitud-btn no"
                          disabled={resolviendoId === s.id}
                          onClick={() => resolver(s.id, 'rechazar')}
                        >
                          <FiX /> Rechazar
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.section>
    </>
  );
};

export default AdminDashboard;