import { useState, useEffect } from 'react';
import {
  FaCalendarCheck,
  FaCalendarDays,
  FaCircleExclamation,
  FaClock,
  FaLocationDot,
  FaPhone,
  FaScrewdriverWrench,
  FaUserTie,
} from 'react-icons/fa6';
import { useIdioma } from '@i18n/IdiomaContext';
import api from '@services/api';
import '@styles/admin-panel.css';

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
  nombre_tecnico?: string | null;
}

const ESTADOS_ACTIVAS = ['Pendiente', 'Confirmada'];

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

const TecnicoCitas = () => {
  const { idioma, t } = useIdioma();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchCitas();
    const interval = setInterval(fetchCitas, 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activas = citas
    .filter((c) => ESTADOS_ACTIVAS.includes(c.estado))
    .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));

  const formatFecha = (fecha: string) => {
    const d = new Date(`${fecha}T00:00:00`);
    return d.toLocaleDateString(idioma === 'en' ? 'en-US' : 'es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="admin-panel">
      <header className="ap-header">
        <div>
          <h1 className="ap-title"><FaCalendarCheck /> {t('tec.misCitas')}</h1>
          <p className="ap-subtitle">{t('tec.misCitasSub')}</p>
        </div>
        <div className="ap-header-right">
          <span className="ap-badge info">{activas.length}</span>
        </div>
      </header>

      <div className="ap-card" style={{ marginTop: 8 }}>
        {loading ? (
          <div className="ap-states">
            <span className="ap-loader" />
            <h3>{t('tec.cargandoCitas')}</h3>
          </div>
        ) : activas.length === 0 ? (
          <div className="ap-states">
            <div className="ap-states-icon"><FaCalendarDays /></div>
            <h3>{t('tec.vacioCitas')}</h3>
            <p>{t('tec.vacioCitasHint')}</p>
          </div>
        ) : (
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead>
                <tr>
                  <th>{t('tec.cliente')}</th>
                  <th>{t('tec.fecha')}</th>
                  <th>{t('tec.hora')}</th>
                  <th>{t('tec.motivo')}</th>
                  <th>{t('tec.tecnico')}</th>
                  <th>{t('tec.estado')}</th>
                </tr>
              </thead>
              <tbody>
                {activas.map((cita) => (
                  <tr key={cita.id_cita}>
                    <td>
                      <strong>{cita.cliente}</strong>
                      {cita.telefono ? <div className="muted"><FaPhone /> {cita.telefono}</div> : null}
                    </td>
                    <td>
                      <FaCalendarDays /> {formatFecha(cita.fecha)}
                    </td>
                    <td>
                      <FaClock /> {cita.hora}
                    </td>
                    <td>
                      <FaScrewdriverWrench /> {t(TIPO_SERVICIO[cita.tipo_servicio] || 'citas.servicioGeneral')}
                      {cita.descripcion ? (
                        <div className="muted" style={{ marginTop: 4 }}>{cita.descripcion}</div>
                      ) : null}
                      <div className="muted" style={{ marginTop: 4 }}>
                        <FaLocationDot /> {cita.direccion}
                      </div>
                    </td>
                    <td>
                      <FaUserTie /> {cita.nombre_tecnico || t('tec.tecnico')}
                    </td>
                    <td>
                      <span className={`ap-badge ${ESTADO_BADGE[cita.estado] || 'neutral'}`}>
                        {t(`citas.${cita.estado.toLowerCase()}`)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {activas.length > 0 && (
        <div className="ap-card" style={{ marginTop: 20, borderLeft: '4px solid #d4a54b' }}>
          <p style={{ margin: 0, color: '#dcdcdc', fontSize: '0.9rem' }}>
            <FaCircleExclamation style={{ marginRight: 8, color: '#d4a54b' }} />
            {t('tec.tienesPendientes', { n: activas.length })}
          </p>
        </div>
      )}
    </div>
  );
};

export default TecnicoCitas;
