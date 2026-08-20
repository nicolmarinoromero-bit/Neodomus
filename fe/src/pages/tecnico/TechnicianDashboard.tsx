import { useState, useEffect } from 'react';
import {
  FaBell,
  FaCalendarCheck,
  FaCalendarDays,
  FaCalendarWeek,
  FaCircleCheck,
  FaCircleExclamation,
  FaClock,
  FaClockRotateLeft,
  FaLocationDot,
  FaPhone,
  FaScrewdriverWrench,
  FaSun,
  FaUserTie,
  FaXmark,
} from 'react-icons/fa6';
import { useAuth } from '@contexts/AuthContext';
import { useIdioma } from '@i18n/IdiomaContext';
import api from '@services/api';
import '@styles/admin-panel.css';
import '@styles/dashboard-admin.css';

interface Cita {
  id_cita: number;
  fecha: string;
  hora: string;
  estado: string;
  tipo_servicio: string;
  cliente: string;
  direccion: string;
  telefono?: number | null;
  descripcion?: string | null;
  id_tecnico?: number | null;
}

type Toast = { msg: string; tipo: 'success' | 'error' } | null;

const ESTADOS_PROGRAMADA = ['Pendiente', 'Confirmada'];

const TIPO_SERVICIO: Record<string, string> = {
  instalacion: 'citas.instalacion',
  reparacion: 'citas.reparacion',
  mantenimiento: 'citas.mantenimiento',
  revision: 'citas.revisionTecnica',
};

const ESTADO_BADGE: Record<string, string> = {
  Pendiente: 'pendiente',
  Confirmada: 'info',
  Finalizada: 'ok',
  Cancelada: 'err',
};

const fechaLocal = (): string => {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
};

const TechnicianDashboard = () => {
  const { user } = useAuth();
  const { idioma, t } = useIdioma();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [toast, setToast] = useState<Toast>(null);

  useEffect(() => {
    fetchCitas();
    const interval = setInterval(fetchCitas, 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCitas = async () => {
    try {
      const res = await api.get('/tecnicos/mis-citas');
      setCitas(res.data);
    } catch (err) {
      console.error('Error al cargar citas:', err);
    } finally {
      setLoading(false);
    }
  };

  const notificar = (msg: string, tipo: 'success' | 'error' = 'success') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3500);
  };

  const actualizarEstado = async (id_cita: number, nuevoEstado: string) => {
    setUpdatingId(id_cita);
    try {
      await api.put(`/tecnicos/citas/${id_cita}/estado`, { estado: nuevoEstado });
      notificar(
        nuevoEstado === 'Cancelada' ? t('tec.citaCancelada') : t('tec.citaCompletada')
      );
      await fetchCitas();
      setModalOpen(false);
    } catch (err: any) {
      console.error(err);
      notificar(err.response?.data?.detail || t('tec.errorEstado'), 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const openModal = (cita: Cita) => {
    setSelectedCita(cita);
    setModalOpen(true);
  };

  const hoy = fechaLocal();
  const citasHoy = citas.filter((c) => c.fecha === hoy);
  const citasProximas = citas.filter(
    (c) => c.fecha > hoy && ESTADOS_PROGRAMADA.includes(c.estado)
  );
  const citasProgramadas = citas.filter((c) => ESTADOS_PROGRAMADA.includes(c.estado));
  const citasCompletadas = citas.filter((c) => c.estado === 'Finalizada');
  const historial = citas
    .filter((c) => c.estado === 'Finalizada' || c.estado === 'Cancelada')
    .slice(0, 5);

  const fechaHoyTexto = new Date().toLocaleDateString(idioma === 'en' ? 'en-US' : 'es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const renderCitaRow = (cita: Cita) => (
    <div key={cita.id_cita} className="novedad-item">
      <div className="novedad-left">
        <div className="icon-circle"><FaUserTie /></div>
        <div>
          <h3>{cita.cliente}</h3>
          <p>
            <FaScrewdriverWrench style={{ marginRight: 6 }} />
            {t(TIPO_SERVICIO[cita.tipo_servicio] || 'citas.servicioGeneral')}
          </p>
          <p>
            <FaLocationDot style={{ marginRight: 6 }} />
            {cita.direccion}
          </p>
          {cita.telefono ? (
            <p>
              <FaPhone style={{ marginRight: 6 }} />
              {cita.telefono}
            </p>
          ) : null}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
        <span className="novedad-fecha"><FaClock /> {cita.hora}</span>
        <span className={`ap-badge ${ESTADO_BADGE[cita.estado] || 'neutral'}`}>
          {t(`citas.${cita.estado.toLowerCase()}`)}
        </span>
        <button type="button" className="ap-btn ap-btn-primary" onClick={() => openModal(cita)}>
          {t('tec.ver')}
        </button>
      </div>
    </div>
  );

  const renderEmpty = (icon: React.ReactNode, titulo: string, hint: string) => (
    <div className="ap-states">
      <div className="ap-states-icon">{icon}</div>
      <h3>{titulo}</h3>
      <p>{hint}</p>
    </div>
  );

  return (
    <div className="admin-panel">
      <header className="ap-header">
        <div>
          <h1 className="ap-title">
            {t('tec.bienvenida', { nombre: user?.nombre?.split(' ')[0] || t('tec.tecnico') })}
          </h1>
          <p className="ap-subtitle">{t('tec.resumenJornada')}</p>
        </div>

        <div className="ap-header-right">
          <span className="welcome-badge">
            <FaCalendarCheck />
            {fechaHoyTexto}
          </span>
        </div>
      </header>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon"><FaCalendarCheck /></div>
          <div className="admin-stat-info">
            <div className="admin-stat-value">{citas.length}</div>
            <div className="admin-stat-label">{t('tec.citasAsignadas')}</div>
            <div className="admin-stat-hint">{t('tec.totalAgenda')}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon"><FaSun /></div>
          <div className="admin-stat-info">
            <div className="admin-stat-value">{citasHoy.length}</div>
            <div className="admin-stat-label">{t('tec.citasHoy')}</div>
            <div className="admin-stat-hint">{t('tec.agendaDia')}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon"><FaClock /></div>
          <div className="admin-stat-info">
            <div className="admin-stat-value">{citasProgramadas.length}</div>
            <div className="admin-stat-label">{t('tec.pendientes')}</div>
            <div className="admin-stat-hint">{t('tec.porAtender')}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon"><FaCircleCheck /></div>
          <div className="admin-stat-info">
            <div className="admin-stat-value">{citasCompletadas.length}</div>
            <div className="admin-stat-label">{t('tec.completadas')}</div>
            <div className="admin-stat-hint">{t('tec.trabajosFinalizados')}</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="ap-states">
          <span className="ap-loader" />
          <h3>{t('tec.cargandoCitas')}</h3>
        </div>
      ) : (
        <div className="ap-grid">
          <div className="ap-card" style={{ borderLeft: '4px solid #d4a54b' }}>
            <div className="ap-card-head">
              <h2><FaCalendarDays /> {t('tec.citasDelDia')}</h2>
            </div>

            {citasHoy.length === 0 ? (
              renderEmpty(
                <FaCalendarDays />,
                t('tec.sinCitasHoy'),
                t('tec.sinCitasHoyHint')
              )
            ) : (
              citasHoy.map(renderCitaRow)
            )}
          </div>

          <div className="ap-card">
            <div className="ap-card-head">
              <h2><FaCalendarWeek /> {t('tec.proximasCitas')}</h2>
            </div>

            {citasProximas.length === 0 ? (
              renderEmpty(
                <FaCalendarWeek />,
                t('tec.sinProximas'),
                t('tec.sinProximasHint')
              )
            ) : (
              citasProximas.map(renderCitaRow)
            )}
          </div>
        </div>
      )}

      <div className="ap-card" style={{ marginTop: 20 }}>
        <div className="ap-card-head">
          <h2><FaClockRotateLeft /> {t('tec.historialReciente')}</h2>
        </div>
        {historial.length === 0 ? (
          <p style={{ margin: 0, color: '#bdbdbd' }}>{t('tec.sinHistorial')}</p>
        ) : (
          historial.map(renderCitaRow)
        )}
      </div>

      <div className="ap-card" style={{ marginTop: 20, borderLeft: '4px solid #d4a54b' }}>
        <p style={{ margin: 0, color: '#dcdcdc', fontSize: '0.9rem' }}>
          <FaBell style={{ marginRight: 8, color: '#d4a54b' }} />
          {t('tec.tienesPendientes', { n: citasProgramadas.length })}
        </p>
      </div>

      {modalOpen && selectedCita && (
        <div className="ap-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="ap-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{t('tec.detalleCita')}</h3>

            <div className="ap-def-list">
              <div className="ap-def">
                <div className="ap-def-label">{t('tec.cliente')}</div>
                <div className="ap-def-value"><FaUserTie /> {selectedCita.cliente}</div>
              </div>
              <div className="ap-def">
                <div className="ap-def-label">{t('tec.telefono')}</div>
                <div className="ap-def-value">
                  <FaPhone /> {selectedCita.telefono ? String(selectedCita.telefono) : t('tec.noRegistrado')}
                </div>
              </div>
              <div className="ap-def full">
                <div className="ap-def-label">{t('tec.direccion')}</div>
                <div className="ap-def-value"><FaLocationDot /> {selectedCita.direccion}</div>
              </div>
              <div className="ap-def">
                <div className="ap-def-label">{t('tec.fecha')}</div>
                <div className="ap-def-value"><FaCalendarDays /> {selectedCita.fecha}</div>
              </div>
              <div className="ap-def">
                <div className="ap-def-label">{t('tec.hora')}</div>
                <div className="ap-def-value"><FaClock /> {selectedCita.hora}</div>
              </div>
              <div className="ap-def full">
                <div className="ap-def-label">{t('tec.servicio')}</div>
                <div className="ap-def-value">
                  {t(TIPO_SERVICIO[selectedCita.tipo_servicio] || 'citas.servicioGeneral')}
                </div>
              </div>
              <div className="ap-def full">
                <div className="ap-def-label">{t('tec.estado')}</div>
                <div className="ap-def-value">
                  <span className={`ap-badge ${ESTADO_BADGE[selectedCita.estado] || 'neutral'}`}>
                    {t(`citas.${selectedCita.estado.toLowerCase()}`)}
                  </span>
                </div>
              </div>
              {selectedCita.descripcion && (
                <div className="ap-def full">
                  <div className="ap-def-label">{t('tec.descripcion')}</div>
                  <div className="ap-def-value">{selectedCita.descripcion}</div>
                </div>
              )}
            </div>

            <div className="ap-modal-actions">
              <button
                type="button"
                className="ap-btn ap-btn-primary"
                disabled={updatingId === selectedCita.id_cita}
                onClick={() => actualizarEstado(selectedCita.id_cita, 'Finalizada')}
              >
                <FaCircleCheck />
                {updatingId === selectedCita.id_cita ? t('tec.procesando') : t('tec.completar')}
              </button>

              <button
                type="button"
                className="ap-btn ap-btn-danger"
                disabled={updatingId === selectedCita.id_cita}
                onClick={() => actualizarEstado(selectedCita.id_cita, 'Cancelada')}
              >
                <FaXmark />
                {updatingId === selectedCita.id_cita ? t('tec.procesando') : t('tec.cancelar')}
              </button>

              <button type="button" className="ap-btn ap-btn-ghost" onClick={() => setModalOpen(false)}>
                {t('tec.cerrar')}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`ap-toast ${toast.tipo === 'error' ? 'err' : 'ok'}`}>
          {toast.tipo === 'error' ? <FaCircleExclamation /> : <FaCircleCheck />}
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  );
};

export default TechnicianDashboard;
