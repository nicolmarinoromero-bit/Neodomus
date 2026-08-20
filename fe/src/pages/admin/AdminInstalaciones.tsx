import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaCalendarCheck,
  FaCircleInfo,
  FaTriangleExclamation,
  FaCircleCheck,
} from 'react-icons/fa6';
import '@styles/admin-panel.css';
import '@styles/dashboard-admin.css';
import api from '@services/api';
import type { CitaAdmin, TecnicoAdmin } from '../../types';
import { nombreCompleto } from '@utils/formatoNombre';

const ESTADOS = ['Pendiente', 'Confirmada', 'Finalizada', 'Cancelada'];

const CLASE_ESTADO: Record<string, string> = {
  Pendiente: 'warn',
  Confirmada: 'info',
  Finalizada: 'ok',
  Cancelada: 'err',
};

const AdminInstalaciones = () => {
  const [citas, setCitas] = useState<CitaAdmin[]>([]);
  const [tecnicos, setTecnicos] = useState<TecnicoAdmin[]>([]);
  const [filtro, setFiltro] = useState('todas');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [guardandoId, setGuardandoId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; tipo: 'ok' | 'err' } | null>(null);

  const cargar = async () => {
    setCargando(true);
    setError(false);
    try {
      const [res, resT] = await Promise.all([
        api.get<CitaAdmin[]>('/citas/all-admin'),
        api.get<TecnicoAdmin[]>('/tecnicos'),
      ]);
      setCitas(res.data || []);
      setTecnicos(resT.data || []);
    } catch {
      setError(true);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const notify = (msg: string, tipo: 'ok' | 'err' = 'ok') => {
    setToast({ msg, tipo });
    window.setTimeout(() => setToast(null), 3200);
  };

  const actualizar = async (cita: CitaAdmin, cambios: { estado?: string; id_tecnico?: number | null }) => {
    setGuardandoId(cita.id_cita);
    try {
      const payload: Record<string, unknown> = {};
      if (cambios.estado !== undefined) payload.estado = cambios.estado;
      if (cambios.id_tecnico !== undefined) {
        payload.id_tecnico = cambios.id_tecnico;
        const t = tecnicos.find((x) => x.id_tecnico === cambios.id_tecnico);
        payload.nombre_tecnico = t ? nombreCompleto(t.first_name, t.last_name) : null;
      }
      const res = await api.put<CitaAdmin>(`/citas/admin/${cita.id_cita}`, payload);
      setCitas((prev) => prev.map((c) => (c.id_cita === cita.id_cita ? res.data : c)));
      notify('Cita actualizada correctamente');
    } catch (err: any) {
      const msg = err.response?.data?.detail;
      notify(typeof msg === 'string' ? msg : 'No se pudo actualizar la cita', 'err');
    } finally {
      setGuardandoId(null);
    }
  };

  const filtradas = citas.filter((c) => (filtro === 'todas' ? true : c.estado === filtro));
  const contadores = ESTADOS.reduce<Record<string, number>>((acc, e) => {
    acc[e] = citas.filter((c) => c.estado === e).length;
    return acc;
  }, {});

  const formatTecnico = (t: TecnicoAdmin) => `${t.first_name || ''} ${t.last_name || ''}`.trim().toUpperCase();

  const formatFecha = (f: string) => {
    try {
      return new Date(`${f}T00:00:00`).toLocaleDateString('es-CO', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return f;
    }
  };

  return (
    <motion.section
      className="admin-panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="ap-header">
        <div>
          <h1 className="ap-title">Instalaciones / Citas</h1>
          <p className="ap-subtitle">
            {citas.length > 0
              ? `${citas.length} citas agendadas por los clientes`
              : 'Citas de instalación y servicio agendadas por los usuarios.'}
          </p>
        </div>
      </div>

      <div className="ap-pills">
        <button type="button" className={`ap-pill ${filtro === 'todas' ? 'active' : ''}`} onClick={() => setFiltro('todas')}>
          Todas <span className="ap-pill-count">{citas.length}</span>
        </button>
        {ESTADOS.map((e) => (
          <button
            key={e}
            type="button"
            className={`ap-pill ${filtro === e ? 'active' : ''}`}
            onClick={() => setFiltro(e)}
          >
            {e} <span className="ap-pill-count">{contadores[e] || 0}</span>
          </button>
        ))}
      </div>

      {cargando ? (
        <div className="ap-card">
          <div className="ap-states">
            <span className="ap-loader" />
            <h3>Cargando citas</h3>
            <p>Consultando las instalaciones agendadas...</p>
          </div>
        </div>
      ) : error ? (
        <div className="ap-card">
          <div className="ap-states error">
            <div className="ap-states-icon">
              <FaCircleInfo />
            </div>
            <h3>No se pudieron cargar las citas</h3>
            <p>Verifica tu conexión e inténtalo nuevamente.</p>
            <button type="button" className="ap-btn ap-btn-ghost" onClick={cargar}>
              Reintentar
            </button>
          </div>
        </div>
      ) : filtradas.length === 0 ? (
        <div className="ap-card">
          <div className="ap-states">
            <div className="ap-states-icon">
              <FaCalendarCheck />
            </div>
            <h3>{filtro === 'todas' ? 'No hay citas registradas' : `Sin citas ${filtro.toLowerCase()}`}</h3>
            <p>
              {filtro === 'todas'
                ? 'Cuando los clientes agenden una instalación o servicio, aparecerá aquí.'
                : `No existen citas con estado "${filtro}".`}
            </p>
          </div>
        </div>
      ) : (
        <div className="ap-grid">
          {filtradas.map((cita) => (
            <div className="ap-grid-item" key={cita.id_cita}>
              <div className="ap-grid-item-top">
                <span className="ap-initials">
                  {(cita.cliente_nombre || '?').split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase()}
                </span>
                <span className={`ap-badge ${CLASE_ESTADO[cita.estado] || 'neutral'}`}>{cita.estado}</span>
              </div>
              <div>
                <h3>{cita.cliente_nombre || 'Cliente'}</h3>
                <p>{cita.cliente_email}</p>
              </div>

              <div className="ap-def-list" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
                <div className="ap-def">
                  <div className="ap-def-label">Servicio</div>
                  <div className="ap-def-value">{cita.tipo_servicio}</div>
                </div>
                <div className="ap-def">
                  <div className="ap-def-label">Fecha</div>
                  <div className="ap-def-value">{formatFecha(cita.fecha)}</div>
                </div>
                <div className="ap-def">
                  <div className="ap-def-label">Hora</div>
                  <div className="ap-def-value">{cita.hora}</div>
                </div>
                <div className="ap-def full">
                  <div className="ap-def-label">Dirección</div>
                  <div className="ap-def-value" style={{ fontSize: '0.82rem' }}>
                    {cita.direccion}
                  </div>
                </div>
                {cita.descripcion && (
                  <div className="ap-def full">
                    <div className="ap-def-label">Descripción</div>
                    <div className="ap-def-value" style={{ fontSize: '0.82rem' }}>
                      {cita.descripcion}
                    </div>
                  </div>
                )}
              </div>

              <div className="ap-form-grid" style={{ marginTop: 8 }}>
                <div className="ap-form-group">
                  <label className="ap-form-label">Estado</label>
                  <select
                    className="ap-form-select"
                    value={cita.estado}
                    disabled={guardandoId === cita.id_cita}
                    onChange={(e) => actualizar(cita, { estado: e.target.value })}
                  >
                    {ESTADOS.map((e) => (
                      <option key={e} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="ap-form-group">
                  <label className="ap-form-label">Técnico asignado</label>
                  <select
                    className="ap-form-select"
                    value={cita.id_tecnico?.toString() || ''}
                    disabled={guardandoId === cita.id_cita}
                    onChange={(e) =>
                      actualizar(cita, { id_tecnico: e.target.value ? parseInt(e.target.value, 10) : null })
                    }
                  >
                    <option value="">Sin asignar</option>
                    {tecnicos.map((t) => (
                      <option key={t.id_tecnico} value={t.id_tecnico}>
                        {formatTecnico(t)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && (
        <div className={`ap-toast ${toast.tipo}`}>
          {toast.tipo === 'ok' ? <FaCircleCheck /> : <FaTriangleExclamation />}
          {toast.msg}
        </div>
      )}
    </motion.section>
  );
};

export default AdminInstalaciones;