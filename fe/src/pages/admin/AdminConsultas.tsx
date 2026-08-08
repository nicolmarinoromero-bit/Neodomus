import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCircleInfo,
  FaCircleCheck,
  FaRotate,
  FaTriangleExclamation,
  FaClock,
  FaEnvelopeOpenText,
  FaPaperPlane,
} from 'react-icons/fa6';
import '@styles/admin-panel.css';
import '@styles/dashboard-admin.css';
import api from '@services/api';
import { CATEGORIAS_CONSULTA_ORDER, nombreCategoria, badgeCategoria } from '../../constants';
import type { ConsultaAdmin } from '../../types';

type Filtro = 'todas' | 'pendiente' | 'respondida';
type FiltroCategoria = 'todas' | string;

const AdminConsultas = () => {
  const [consultas, setConsultas] = useState<ConsultaAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [filtroCategoria, setFiltroCategoria] = useState<FiltroCategoria>('todas');
  const [seleccionada, setSeleccionada] = useState<ConsultaAdmin | null>(null);
  const [respuesta, setRespuesta] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [toast, setToast] = useState<{ msg: string; tipo: 'ok' | 'err' } | null>(null);

  const cargar = async () => {
    setCargando(true);
    setError(false);
    try {
      const res = await api.get<ConsultaAdmin[]>('/admin/consultas');
      setConsultas(res.data || []);
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

  const abrirConsulta = (c: ConsultaAdmin) => {
    setSeleccionada(c);
    setRespuesta(c.respuesta || '');
  };

  const guardarRespuesta = async () => {
    if (!seleccionada) return;
    if (!respuesta.trim()) {
      notify('Escribe una respuesta antes de guardar', 'err');
      return;
    }
    setGuardando(true);
    try {
      const res = await api.put<ConsultaAdmin>(`/admin/consultas/${seleccionada.id}`, {
        estado: 'respondida',
        respuesta: respuesta.trim(),
      });
      setConsultas((prev) => prev.map((c) => (c.id === res.data.id ? res.data : c)));
      setSeleccionada(null);
      notify('Respuesta enviada al usuario');
    } catch (err: any) {
      const msg = err.response?.data?.detail;
      notify(typeof msg === 'string' ? msg : 'No se pudo guardar la respuesta', 'err');
    } finally {
      setGuardando(false);
    }
  };

  const reabrir = async () => {
    if (!seleccionada) return;
    setGuardando(true);
    try {
      const res = await api.put<ConsultaAdmin>(`/admin/consultas/${seleccionada.id}`, {
        estado: 'pendiente',
        respuesta: '',
      });
      setConsultas((prev) => prev.map((c) => (c.id === res.data.id ? res.data : c)));
      setSeleccionada(null);
      notify('Consulta marcada como pendiente');
    } catch (err: any) {
      const msg = err.response?.data?.detail;
      notify(typeof msg === 'string' ? msg : 'No se pudo actualizar la consulta', 'err');
    } finally {
      setGuardando(false);
    }
  };

  const pendientes = consultas.filter((c) => c.estado === 'pendiente').length;
  const hayCategorias = consultas.some((c) => c.categoria);
  const filtradas = consultas.filter(
    (c) =>
      (filtro === 'todas' || c.estado === filtro) &&
      (filtroCategoria === 'todas' || c.categoria === filtroCategoria),
  );

  const fechaLegible = (fecha?: string | null) => {
    if (!fecha) return '';
    try {
      return new Date(fecha).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '';
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
          <h1 className="ap-title">Solicitudes</h1>
          <p className="ap-subtitle">
            Consultas de soporte enviadas por visitantes y usuarios de la plataforma.
          </p>
        </div>
        <div className="ap-header-right">
          <button type="button" className="ap-btn ap-btn-ghost" onClick={cargar} disabled={cargando}>
            <FaRotate className={cargando ? 'spin' : ''} /> Actualizar
          </button>
        </div>
      </div>

      <div className="ap-pills">
        <button
          type="button"
          className={`ap-pill ${filtro === 'todas' ? 'active' : ''}`}
          onClick={() => setFiltro('todas')}
        >
          Todas <span className="ap-pill-count">{consultas.length}</span>
        </button>
        <button
          type="button"
          className={`ap-pill ${filtro === 'pendiente' ? 'active' : ''}`}
          onClick={() => setFiltro('pendiente')}
        >
          Pendientes <span className="ap-pill-count">{pendientes}</span>
        </button>
        <button
          type="button"
          className={`ap-pill ${filtro === 'respondida' ? 'active' : ''}`}
          onClick={() => setFiltro('respondida')}
        >
          Respondidas <span className="ap-pill-count">{consultas.length - pendientes}</span>
        </button>
      </div>

      {hayCategorias && (
        <div className="ap-pills" style={{ marginTop: 10 }}>
          <button
            type="button"
            className={`ap-pill ${filtroCategoria === 'todas' ? 'active' : ''}`}
            onClick={() => setFiltroCategoria('todas')}
          >
            Todas las categorías
          </button>
          {CATEGORIAS_CONSULTA_ORDER.map((cat) => {
            const cant = consultas.filter((c) => c.categoria === cat).length;
            if (cant === 0) return null;
            return (
              <button
                type="button"
                key={cat}
                className={`ap-pill ${filtroCategoria === cat ? 'active' : ''}`}
                onClick={() => setFiltroCategoria(cat)}
              >
                {nombreCategoria(cat)} <span className="ap-pill-count">{cant}</span>
              </button>
            );
          })}
        </div>
      )}

      {cargando ? (
        <div className="ap-card">
          <div className="ap-states">
            <span className="ap-loader" />
            <h3>Cargando solicitudes</h3>
            <p>Consultando los mensajes recibidos...</p>
          </div>
        </div>
      ) : error ? (
        <div className="ap-card">
          <div className="ap-states error">
            <div className="ap-states-icon">
              <FaCircleInfo />
            </div>
            <h3>No se pudieron cargar las solicitudes</h3>
            <button type="button" className="ap-btn ap-btn-ghost" onClick={cargar}>
              Reintentar
            </button>
          </div>
        </div>
      ) : filtradas.length === 0 ? (
        <div className="ap-card">
          <div className="ap-states">
            <div className="ap-states-icon">
              <FaEnvelopeOpenText />
            </div>
            <h3>{filtro === 'todas' ? 'No hay solicitudes' : 'Sin solicitudes en este estado'}</h3>
            <p>
              {filtro === 'todas'
                ? 'Las consultas enviadas desde la sección de ayuda llegarán aquí.'
                : 'Cambia de filtro para ver las demás consultas.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="an-list">
          {filtradas.map((c) => (
            <article className={`an-item ${c.estado === 'pendiente' ? 'unread' : ''}`} key={c.id}>
              <span className={`an-icon ${c.estado === 'pendiente' ? 'cita' : 'cuenta'}`}>
                {c.estado === 'pendiente' ? <FaClock /> : <FaCircleCheck />}
              </span>
              <div className="an-body">
                <div className="an-top">
                  <strong>{c.asunto}</strong>
                  <span className={`ap-badge ${badgeCategoria(c.categoria)}`}>
                    {nombreCategoria(c.categoria)}
                  </span>
                  <span className={`ap-badge ${c.estado === 'pendiente' ? 'warn' : 'ok'}`}>{c.estado}</span>
                  <span className="solicitud-email">{fechaLegible(c.created_at)}</span>
                </div>
                <p style={{ margin: '6px 0', color: '#9f9f9f', fontSize: '0.82rem' }}>
                  {c.nombre_usuario} · {c.email_usuario}
                </p>
                <p className="an-msg" style={{ margin: 0, color: '#dcdcdc', fontSize: '0.84rem' }}>
                  {c.mensaje}
                </p>
                {c.respuesta && (
                  <p className="an-resp" style={{ margin: '8px 0 0', color: '#8fb98f', fontSize: '0.82rem' }}>
                    <FaPaperPlane style={{ marginRight: 6 }} /> Respuesta: {c.respuesta}
                  </p>
                )}
                <div className="ap-form-row" style={{ marginTop: 12 }}>
                  <button type="button" className="ap-btn ap-btn-primary" onClick={() => abrirConsulta(c)}>
                    <FaPaperPlane /> {c.estado === 'pendiente' ? 'Responder' : 'Ver / editar respuesta'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <AnimatePresence>
        {seleccionada && (
          <motion.div
            className="ap-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSeleccionada(null)}
          >
            <motion.div
              className="ap-modal"
              style={{ maxWidth: 640 }}
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>
                <FaEnvelopeOpenText style={{ color: '#ffd98a', marginRight: 8 }} /> {seleccionada.asunto}
              </h3>
              <div className="ap-mini-item" style={{ margin: '14px 0' }}>
                <span className="ap-mini-icon">
                  <FaEnvelopeOpenText />
                </span>
                <div className="ap-mini-info">
                  <div className="ap-mini-title">{seleccionada.nombre_usuario}</div>
                  <div className="ap-mini-sub">
                    {seleccionada.email_usuario} · {fechaLegible(seleccionada.created_at)}
                  </div>
                </div>
                <span className={`ap-badge ${badgeCategoria(seleccionada.categoria)}`}>
                  {nombreCategoria(seleccionada.categoria)}
                </span>
                <span className={`ap-badge ${seleccionada.estado === 'pendiente' ? 'warn' : 'ok'}`}>
                  {seleccionada.estado}
                </span>
              </div>
              <div className="ap-card ap-prod-desc" style={{ padding: '14px 16px' }}>
                <p style={{ margin: 0, color: '#e6e6e6', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  {seleccionada.mensaje}
                </p>
              </div>
              <div className="ap-form-group" style={{ marginTop: 14 }}>
                <label className="ap-form-label" htmlFor="c-respuesta">Tu respuesta para el usuario</label>
<textarea
                  id="c-respuesta"
                  className="ap-form-textarea"
                  rows={4}
                  value={respuesta}
                  onChange={(e) => setRespuesta(e.target.value)}
                  placeholder="Escribe la respuesta que recibirá el usuario por correo..."
                />
              </div>
              <div className="ap-form-row" style={{ justifyContent: 'flex-end', marginTop: 14 }}>
                <button type="button" className="ap-btn ap-btn-ghost" onClick={() => setSeleccionada(null)} disabled={guardando}>
                  Cancelar
                </button>
                {seleccionada.estado === 'respondida' && (
                  <button type="button" className="ap-btn ap-btn-ghost" onClick={reabrir} disabled={guardando}>
                    Marcar como pendiente
                  </button>
                )}
                <button type="button" className="ap-btn ap-btn-primary" onClick={guardarRespuesta} disabled={guardando}>
                  <FaPaperPlane /> {guardando ? 'Guardando...' : 'Guardar respuesta'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {toast && (
        <div className={`ap-toast ${toast.tipo}`}>
          {toast.tipo === 'ok' ? <FaCircleCheck /> : <FaTriangleExclamation />}
          {toast.msg}
        </div>
      )}
    </motion.section>
  );
};

export default AdminConsultas;