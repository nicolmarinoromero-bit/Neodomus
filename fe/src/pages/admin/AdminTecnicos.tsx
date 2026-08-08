import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaUserGear,
  FaCircleInfo,
  FaPlus,
  FaMagnifyingGlass,
  FaPen,
  FaUserSlash,
  FaKey,
  FaTriangleExclamation,
  FaCircleCheck,
  FaIdCard,
} from 'react-icons/fa6';
import '@styles/admin-panel.css';
import '@styles/dashboard-admin.css';
import api from '@services/api';
import type { TecnicoAdmin } from '../../types';

interface FormTecnico {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  telefono: string;
  documento: string;
  certificacion: string;
  cargo: string;
  is_active: boolean;
}

const VACIO: FormTecnico = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  telefono: '',
  documento: '',
  certificacion: '',
  cargo: 'Junior',
  is_active: true,
};

const CARGOS = ['Junior', 'Semi Senior', 'Senior'];

const AdminTecnicos = () => {
  const [tecnicos, setTecnicos] = useState<TecnicoAdmin[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [modal, setModal] = useState<null | 'crear' | 'editar'>(null);
  const [editando, setEditando] = useState<TecnicoAdmin | null>(null);
  const [form, setForm] = useState<FormTecnico>(VACIO);
  const [guardando, setGuardando] = useState(false);
  const [toast, setToast] = useState<{ msg: string; tipo: 'ok' | 'err' } | null>(null);
  const [cambiarPass, setCambiarPass] = useState(false);

  const cargar = async () => {
    setCargando(true);
    setError(false);
    try {
      const res = await api.get<TecnicoAdmin[]>('/tecnicos');
      setTecnicos(res.data || []);
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

  const abrirCrear = () => {
    setForm({ ...VACIO });
    setCambiarPass(false);
    setModal('crear');
  };

  const abrirEditar = (t: TecnicoAdmin) => {
    setEditando(t);
    setCambiarPass(false);
    setForm({
      first_name: t.first_name,
      last_name: t.last_name,
      email: t.email,
      password: '',
      telefono: t.telefono_usuario?.toString() || '',
      documento: t.documento_usuario?.toString() || '',
      certificacion: t.certificacion_t || '',
      cargo: t.cargo_t || 'Junior',
      is_active: t.is_active,
    });
    setModal('editar');
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      if (modal === 'crear') {
        if (form.password.length < 6) {
          notify('La contraseña debe tener al menos 6 caracteres', 'err');
          setGuardando(false);
          return;
        }
        const payload: Record<string, unknown> = {
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim(),
          password: form.password,
          id_rol: 2,
        };
        if (form.telefono.trim()) payload.telefono_usuario = parseInt(form.telefono.replace(/\D/g, ''), 10);
        if (form.documento.trim()) payload.documento_usuario = parseInt(form.documento.replace(/\D/g, ''), 10);
        if (form.certificacion.trim()) payload.certificacion = form.certificacion.trim();
        if (form.cargo.trim()) payload.cargo = form.cargo.trim();
        await api.post('/users', payload);
        notify(`Técnico registrado. Accede con ${form.email} y la contraseña creada.`);
      } else if (editando) {
        if (cambiarPass && form.password.length < 6) {
          notify('La contraseña debe tener al menos 6 caracteres', 'err');
          setGuardando(false);
          return;
        }
        const payload: Record<string, unknown> = {
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim(),
          certificacion: form.certificacion.trim() || null,
          cargo: form.cargo.trim() || null,
        };
        if (cambiarPass) payload.password = form.password;
        if (form.telefono.trim()) payload.telefono_usuario = parseInt(form.telefono.replace(/\D/g, ''), 10);
        if (form.documento.trim()) payload.documento_usuario = parseInt(form.documento.replace(/\D/g, ''), 10);
        await api.put(`/users/${editando.id_usuario}`, payload);
        notify('Técnico actualizado correctamente');
      }
      setModal(null);
      await cargar();
    } catch (err: any) {
      const msg = err.response?.data?.detail;
      notify(typeof msg === 'string' ? msg : 'Error al guardar el técnico', 'err');
    } finally {
      setGuardando(false);
    }
  };

  const desactivar = async (t: TecnicoAdmin) => {
    try {
      await api.delete(`/users/${t.id_usuario}`);
      notify(`${nombreMayus(t)} desactivado`, 'err');
      await cargar();
    } catch (err: any) {
      const msg = err.response?.data?.detail;
      notify(typeof msg === 'string' ? msg : 'No se pudo desactivar', 'err');
    }
  };

  const filtrados = tecnicos.filter((t) => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return true;
    return (
      t.first_name.toLowerCase().includes(q) ||
      t.last_name.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      (t.certificacion_t || '').toLowerCase().includes(q)
    );
  });

  const iniciales = (t: TecnicoAdmin) =>
    `${(t.first_name || '?')[0]}${(t.last_name || '')[0]}`.toUpperCase();

  const nombreMayus = (t: TecnicoAdmin) => `${t.first_name || ''} ${t.last_name || ''}`.trim().toUpperCase();

  return (
    <motion.section
      className="admin-panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="ap-header">
        <div>
          <h1 className="ap-title">Técnicos</h1>
          <p className="ap-subtitle">
            {tecnicos.length > 0
              ? `${tecnicos.length} técnicos registrados en el sistema`
              : 'Usuarios con rol de técnico registrados en el sistema.'}
          </p>
        </div>
        <div className="ap-header-right">
          <button type="button" className="ap-btn ap-btn-primary" onClick={abrirCrear}>
            <FaPlus /> Registrar técnico
          </button>
        </div>
      </div>

      <div className="ap-filters" style={{ marginBottom: 20 }}>
        <form className="ap-search" onSubmit={(e) => e.preventDefault()}>
          <FaMagnifyingGlass />
          <input
            type="text"
            placeholder="Buscar por nombre, correo o especialidad..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </form>
      </div>

      {cargando ? (
        <div className="ap-card">
          <div className="ap-states">
            <span className="ap-loader" />
            <h3>Cargando técnicos</h3>
            <p>Consultando los usuarios registrados...</p>
          </div>
        </div>
      ) : error ? (
        <div className="ap-card">
          <div className="ap-states error">
            <div className="ap-states-icon">
              <FaCircleInfo />
            </div>
            <h3>No se pudieron cargar los técnicos</h3>
            <p>Verifica tu conexión e inténtalo nuevamente.</p>
            <button type="button" className="ap-btn ap-btn-ghost" onClick={cargar}>
              Reintentar
            </button>
          </div>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="ap-card">
          <div className="ap-states">
            <div className="ap-states-icon">
              <FaUserGear />
            </div>
            <h3>{busqueda ? 'Sin resultados' : 'No hay técnicos registrados'}</h3>
            <p>
              {busqueda
                ? `No se encontraron técnicos para "${busqueda.trim()}".`
                : 'Registra el primer técnico con sus credenciales de acceso.'}
            </p>
            {!busqueda && (
              <button type="button" className="ap-btn ap-btn-primary" onClick={abrirCrear}>
                <FaPlus /> Registrar técnico
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="ap-grid">
          {filtrados.map((t) => (
            <div className="ap-grid-item" key={t.id_tecnico}>
              <div className="ap-grid-item-top">
                <span className="ap-initials">{iniciales(t)}</span>
                <span className={`ap-badge ${t.is_active ? 'ok' : 'err'}`}>
                  {t.is_active ? 'Disponible' : 'Inactivo'}
                </span>
              </div>
              <div>
                <h3>{nombreMayus(t)}</h3>
                <p>{t.email}</p>
              </div>
              <div className="ap-def-list" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
                <div className="ap-def">
                  <div className="ap-def-label">Especialidad</div>
                  <div className="ap-def-value">{t.certificacion_t || '—'}</div>
                </div>
                <div className="ap-def">
                  <div className="ap-def-label">Nivel</div>
                  <div className="ap-def-value ap-tec-nivel">{t.cargo_t || '—'}</div>
                </div>
                <div className="ap-def">
                  <div className="ap-def-label">Teléfono</div>
                  <div className="ap-def-value">{t.telefono_usuario ? `+${t.telefono_usuario}` : '—'}</div>
                </div>
              </div>
              <div className="ap-form-row" style={{ marginTop: 6 }}>
                <button type="button" className="ap-btn ap-btn-ghost" onClick={() => abrirEditar(t)}>
                  <FaPen /> Editar
                </button>
                {t.is_active && (
                  <button
                    type="button"
                    className="ap-btn ap-btn-danger"
                    onClick={() => desactivar(t)}
                    title={`Desactivar a ${t.first_name}`}
                  >
                    <FaUserSlash /> Desactivar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="ap-modal-overlay" onClick={() => setModal(null)}>
          <div
            className="ap-modal"
            style={{ maxWidth: 560 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>
              {modal === 'crear' ? (
                <>
                  <FaIdCard style={{ color: '#ffd98a', marginRight: 8 }} /> Registrar nuevo técnico
                </>
              ) : (
                <>
                  <FaPen style={{ color: '#ffd98a', marginRight: 8 }} /> Editar técnico
                </>
              )}
            </h3>
            <p>
              {modal === 'crear'
                ? 'El técnico recibirá las credenciales que definas para acceder al sistema.'
                : 'Actualiza los datos del técnico. La contraseña solo se cambia si la indicas.'}
            </p>

            <form onSubmit={guardar} className="ap-form-grid" style={{ marginTop: 4 }}>
              <div className="ap-form-group">
                <label className="ap-form-label" htmlFor="tf-nombre">Nombre *</label>
                <input
                  id="tf-nombre"
                  className="ap-form-input"
                  type="text"
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  required
                />
              </div>
              <div className="ap-form-group">
                <label className="ap-form-label" htmlFor="tf-apellido">Apellidos *</label>
                <input
                  id="tf-apellido"
                  className="ap-form-input"
                  type="text"
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  required
                />
              </div>
              <div className="ap-form-group">
                <label className="ap-form-label" htmlFor="tf-email">Correo (usuario) *</label>
                <input
                  id="tf-email"
                  className="ap-form-input"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  disabled={modal === 'editar'}
                />
              </div>
              <div className="ap-form-group">
                <label className="ap-form-label" htmlFor="tf-pass">
                  {modal === 'crear' ? 'Contraseña de acceso *' : 'Nueva contraseña'}
                </label>
                <input
                  id="tf-pass"
                  className="ap-form-input"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={modal === 'editar' ? 'Dejar vacía para no cambiarla' : ''}
                  minLength={modal === 'crear' ? 6 : undefined}
                  required={modal === 'crear'}
                />
                {modal === 'editar' && (
                  <label className="ap-form-hint" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input type="checkbox" checked={cambiarPass} onChange={(e) => setCambiarPass(e.target.checked)} />
                    Cambiar la contraseña de acceso
                  </label>
                )}
              </div>
              <div className="ap-form-group">
                <label className="ap-form-label" htmlFor="tf-tel">Teléfono</label>
                <input
                  id="tf-tel"
                  className="ap-form-input"
                  type="tel"
                  value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                />
              </div>
              <div className="ap-form-group">
                <label className="ap-form-label" htmlFor="tf-doc">Documento</label>
                <input
                  id="tf-doc"
                  className="ap-form-input"
                  type="text"
                  value={form.documento}
                  onChange={(e) => setForm({ ...form, documento: e.target.value })}
                />
              </div>
              <div className="ap-form-group full">
                <label className="ap-form-label" htmlFor="tf-cer">Especialidad / certificación</label>
                <input
                  id="tf-cer"
                  className="ap-form-input"
                  type="text"
                  value={form.certificacion}
                  onChange={(e) => setForm({ ...form, certificacion: e.target.value })}
                  placeholder="Ej: Certificación en Instalación de Domótica"
                />
              </div>
              <div className="ap-form-group">
                <label className="ap-form-label" htmlFor="tf-cargo">Nivel / cargo</label>
                <select
                  id="tf-cargo"
                  className="ap-form-select"
                  value={form.cargo}
                  onChange={(e) => setForm({ ...form, cargo: e.target.value })}
                >
                  {CARGOS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="ap-form-row" style={{ gridColumn: '1 / -1', justifyContent: 'flex-end' }}>
                <button type="button" className="ap-btn ap-btn-ghost" onClick={() => setModal(null)} disabled={guardando}>
                  Cancelar
                </button>
                <button type="submit" className="ap-btn ap-btn-primary" disabled={guardando}>
                  <FaCircleCheck /> {guardando ? 'Guardando...' : modal === 'crear' ? 'Crear técnico' : 'Guardar cambios'}
                </button>
              </div>
            </form>

            {modal === 'editar' && (
              <div className="ap-mini-item" style={{ marginTop: 8 }}>
                <span className="ap-mini-icon">
                  <FaKey />
                </span>
                <div className="ap-mini-info">
                  <div className="ap-mini-title">Estado de la cuenta</div>
                  <div className="ap-mini-sub">
                    {form.is_active ? 'El técnico puede iniciar sesión actualmente.' : 'La cuenta está desactivada.'}
                  </div>
                </div>
              </div>
            )}
          </div>
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

export default AdminTecnicos;