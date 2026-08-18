import { useState, useEffect } from 'react';
import {
  FaCalendarCheck,
  FaCalendarDays,
  FaCircleExclamation,
  FaClock,
  FaEnvelope,
  FaIdCard,
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
  email?: string | null;
  documento_tipo?: string | null;
  documento_numero?: number | null;
  descripcion?: string | null;
  id_tecnico?: number | null;
  nombre_tecnico?: string | null;
  costo_cita?: number | null;
  id_comision_c?: number | null;
  comision_porcentaje?: number | null;
  comision_valor?: number | null;
}

const ESTADOS_ACTIVAS = ['Pendiente', 'Confirmada'];

const POR_PAGINA = 6;

const TIPO_SERVICIO: Record<string, string> = {
  instalacion: 'citas.instalacion',
  reparacion: 'citas.reparacion',
  mantenimiento: 'citas.mantenimiento',
  revision: 'citas.revisionTecnica',
  soporte: 'citas.soporte',
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
  const [pagina, setPagina] = useState(1);

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

  const totalPaginas = Math.max(1, Math.ceil(activas.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const citasPagina = activas.slice(
    (paginaActual - 1) * POR_PAGINA,
    paginaActual * POR_PAGINA,
  );

  const formatFecha = (fecha: string) => {
    const d = new Date(`${fecha}T00:00:00`);
    return d.toLocaleDateString(idioma === 'en' ? 'en-US' : 'es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatMoneda = (valor: number) =>
    valor.toLocaleString(idioma === 'en' ? 'en-US' : 'es-CO', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

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
                  <th>{t('tec.comision')}</th>
                  <th>{t('tec.tecnico')}</th>
                  <th>{t('tec.estado')}</th>
                </tr>
              </thead>
              <tbody>
                {citasPagina.map((cita) => (
                  <tr key={cita.id_cita}>
                    <td>
                      <strong>{cita.cliente}</strong>
                      {cita.documento_numero ? (
                        <div className="muted"><FaIdCard /> {cita.documento_tipo || 'CC'} {cita.documento_numero}</div>
                      ) : null}
                      {cita.telefono ? <div className="muted"><FaPhone /> {cita.telefono}</div> : null}
                      {cita.email ? <div className="muted"><FaEnvelope /> {cita.email}</div> : null}
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
                      {cita.costo_cita != null ? (
                        <div className="muted" style={{ marginTop: 4 }}>
                          {formatMoneda(cita.costo_cita)}
                        </div>
                      ) : null}
                    </td>
                    <td>
                      {cita.comision_valor != null ? (
                        <>
                          <span className="ap-badge ok">
                            {t('tec.comision')} {cita.comision_porcentaje != null ? `${cita.comision_porcentaje}%` : ''}
                          </span>
                          <div className="muted" style={{ marginTop: 4, whiteSpace: 'nowrap' }}>
                            {formatMoneda(cita.comision_valor)}
                          </div>
                        </>
                      ) : (
                        <span className="muted">{t('tec.sinComision')}</span>
                      )}
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

        {!loading && totalPaginas > 1 && (
          <div className="ap-paginacion">
            <button
              type="button"
              className="ap-page-btn"
              disabled={paginaActual === 1}
              onClick={() => setPagina(paginaActual - 1)}
            >
              ‹ {t('tec.anterior')}
            </button>
            <div className="ap-page-nums">
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`ap-page-btn ${n === paginaActual ? 'active' : ''}`}
                  onClick={() => setPagina(n)}
                >
                  {n}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="ap-page-btn"
              disabled={paginaActual === totalPaginas}
              onClick={() => setPagina(paginaActual + 1)}
            >
              {t('tec.siguiente')} ›
            </button>
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
