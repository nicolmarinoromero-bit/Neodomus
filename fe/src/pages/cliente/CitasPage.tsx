import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { useIdioma } from '@i18n/IdiomaContext';
import {
  FaScrewdriverWrench, FaComment, FaCircleCheck, FaArrowLeft,
  FaExclamation, FaCheck, FaChevronDown, FaCalendarDays, FaList,
  FaClock, FaLocationDot, FaPenToSquare, FaXmark, FaCircleXmark,
  FaUserTie, FaCircleCheck as FaCircleCheckFilled,
} from 'react-icons/fa6';
import '@styles/citas.css';
import api from '@services/api';

type TipoServicio = 'instalacion' | 'reparacion' | 'mantenimiento' | 'revision';

interface CitaForm {
  tipo_servicio: TipoServicio | '';
  fecha: string;
  hora: string;
  direccion: string;
  descripcion: string;
}

interface Cita {
  id_cita: number;
  tipo_servicio: string;
  fecha: string;
  hora: string;
  direccion: string;
  descripcion?: string | null;
  id_tecnico?: number | null;
  nombre_tecnico?: string | null;
  estado: 'Pendiente' | 'Confirmada' | 'Finalizada' | 'Cancelada';
}

interface Tecnico {
  id: number;
  nombre: string;
  apellido: string;
  foto_url?: string | null;
  especialidad: string;
  anios_experiencia: number;
  calificacion: number;
  disponible: boolean;
}

const TIPO_TRAD: Record<string, string> = {
  instalacion: 'citas.instalacion',
  mantenimiento: 'citas.mantenimiento',
  reparacion: 'citas.reparacion',
  revision: 'citas.revisionTecnica',
};

const FORM_VACIO: CitaForm = {
  tipo_servicio: '',
  fecha: '',
  hora: '',
  direccion: '',
  descripcion: '',
};

const HORAS_48 = 48 * 60 * 60 * 1000;

const tecnicosMock: Tecnico[] = [
  { id: 1, nombre: 'Carlos', apellido: 'Mendoza', foto_url: null, especialidad: 'Domótica', anios_experiencia: 8, calificacion: 4.9, disponible: true },
  { id: 2, nombre: 'Andrés', apellido: 'Rojas', foto_url: null, especialidad: 'Automatización', anios_experiencia: 6, calificacion: 4.8, disponible: true },
  { id: 3, nombre: 'María', apellido: 'Torres', foto_url: null, especialidad: 'Iluminación inteligente', anios_experiencia: 5, calificacion: 4.7, disponible: false },
  { id: 4, nombre: 'Javier', apellido: 'Silva', foto_url: null, especialidad: 'Seguridad', anios_experiencia: 10, calificacion: 5.0, disponible: true },
  { id: 5, nombre: 'Laura', apellido: 'García', foto_url: null, especialidad: 'Energía solar', anios_experiencia: 7, calificacion: 4.6, disponible: true },
  { id: 6, nombre: 'Roberto', apellido: 'Castro', foto_url: null, especialidad: 'Climatización', anios_experiencia: 9, calificacion: 4.8, disponible: true },
];

const CitasPage = () => {
  const { isAuthenticated } = useAuth();
  const { idioma, t } = useIdioma();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [vista, setVista] = useState<'agendar' | 'mis-citas'>('agendar');
  const [form, setForm] = useState<CitaForm>(FORM_VACIO);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; tipo: 'success' | 'error' } | null>(null);
  const [horasDisponibles, setHorasDisponibles] = useState<string[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [citasLoading, setCitasLoading] = useState(false);
  const [confirmarCancelarId, setConfirmarCancelarId] = useState<number | null>(null);

  const [tecnicoSel, setTecnicoSel] = useState<{ id: number; nombre: string } | null>(null);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [tecnicosLoading, setTecnicosLoading] = useState(false);

  const [deTecnicosPage, setDeTecnicosPage] = useState(false);

  const hoy = new Date().toISOString().split('T')[0];

  // Si el usuario viene desde la página Técnicos, asocia el técnico
  useEffect(() => {
    const idParam = searchParams.get('tecnico');
    const nombreParam = searchParams.get('nombre');
    if (idParam) {
      const id = Number(idParam);
      if (id) {
        setTecnicoSel({ id, nombre: nombreParam ? decodeURIComponent(nombreParam) : '' });
        setDeTecnicosPage(true);
      }
    }
  }, [searchParams]);

  // Cargar técnicos (solo para la sección "selecciona técnico" cuando se accede directo)
  useEffect(() => {
    let activo = true;
    const fetchTecnicos = async () => {
      setTecnicosLoading(true);
      try {
        const res = await api.get('/tecnicos');
        const data = res.data.data || res.data || [];
        if (activo) setTecnicos(data.length > 0 ? data : tecnicosMock);
      } catch {
        if (activo) setTecnicos(tecnicosMock);
      } finally {
        if (activo) setTecnicosLoading(false);
      }
    };
    fetchTecnicos();
    return () => {
      activo = false;
    };
  }, []);

  const cargarCitas = useCallback(async () => {
    if (!isAuthenticated) {
      setCitas([]);
      setCitasLoading(false);
      return;
    }
    setCitasLoading(true);
    try {
      const res = await api.get<Cita[]>('/citas/mis-citas');
      setCitas(res.data);
    } catch (err) {
      console.error('Error cargando citas:', err);
    } finally {
      setCitasLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (vista === 'mis-citas') cargarCitas();
  }, [vista, cargarCitas]);

  useEffect(() => {
    if (!form.fecha) {
      setHorasDisponibles([]);
      return;
    }
    const diaSemana = new Date(form.fecha).getDay();
    if (diaSemana === 0 || diaSemana === 6) {
      setHorasDisponibles([]);
      return;
    }
    const horas = [];
    for (let h = 8; h <= 18; h++) {
      horas.push(`${h.toString().padStart(2, '0')}:00`);
      if (h < 18) horas.push(`${h.toString().padStart(2, '0')}:30`);
    }
    setHorasDisponibles(horas);
    if (!horas.includes(form.hora)) setForm(prev => ({ ...prev, hora: '' }));
  }, [form.fecha]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setToast({ msg: t('citas.errorLogin'), tipo: 'error' });
      return;
    }
    if (!form.tipo_servicio || !form.fecha || !form.hora || !form.direccion.trim() || !form.descripcion.trim()) {
      setToast({ msg: t('citas.errorCampos'), tipo: 'error' });
      return;
    }
    if (form.descripcion.trim().length < 20) {
      setToast({ msg: t('citas.errorDescripcion'), tipo: 'error' });
      return;
    }
    const payload = {
      ...form,
      id_tecnico: tecnicoSel?.id ?? null,
      nombre_tecnico: tecnicoSel?.nombre ?? null,
    };
    setSubmitting(true);
    try {
      if (editandoId !== null) {
        await api.put(`/citas/${editandoId}`, payload);
        setToast({ msg: t('citas.exitoActualizada'), tipo: 'success' });
        setEditandoId(null);
        setForm(FORM_VACIO);
      } else {
        await api.post('/citas', payload);
        setToast({ msg: t('citas.exitoAgendada'), tipo: 'success' });
        setForm(prev => ({ ...prev, fecha: '', hora: '', direccion: '', descripcion: '' }));
      }
      cargarCitas();
    } catch (err: any) {
      console.error(err);
      setToast({ msg: err.response?.data?.detail || t('citas.errorGenerico'), tipo: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const iniciarEdicion = (cita: Cita) => {
    setEditandoId(cita.id_cita);
    if (cita.nombre_tecnico) {
      setTecnicoSel({ id: cita.id_tecnico ?? -1, nombre: cita.nombre_tecnico });
    }
    setForm({
      tipo_servicio: cita.tipo_servicio as TipoServicio,
      fecha: cita.fecha,
      hora: cita.hora,
      direccion: cita.direccion,
      descripcion: cita.descripcion || '',
    });
    setVista('agendar');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setForm(FORM_VACIO);
  };

  const cancelarCita = async (id: number) => {
    try {
      await api.delete(`/citas/${id}`);
      setToast({ msg: t('citas.exitoCancelada'), tipo: 'success' });
      cargarCitas();
    } catch (err: any) {
      console.error(err);
      setToast({ msg: err.response?.data?.detail || t('citas.errorGenerico'), tipo: 'error' });
    }
    setConfirmarCancelarId(null);
  };

  const esEditable = (cita: Cita): boolean => {
    if (cita.estado === 'Finalizada' || cita.estado === 'Cancelada') return false;
    const momento = new Date(`${cita.fecha}T${cita.hora}:00`).getTime();
    return momento - Date.now() >= HORAS_48;
  };

  const tiposServicio: { value: TipoServicio; label: string }[] = [
    { value: 'instalacion', label: t('citas.instalacion') },
    { value: 'mantenimiento', label: t('citas.mantenimiento') },
    { value: 'reparacion', label: t('citas.reparacion') },
    { value: 'revision', label: t('citas.revisionTecnica') },
  ];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(idioma === 'en' ? 'en-US' : 'es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const renderBarraTecnico = () => (
    <div className="cita-tecnico-banner">
      <span className="cita-tecnico-banner-icon"><FaUserTie /></span>
      <div>
        <span className="cita-tecnico-banner-label">{t('citas.tecnicoAsociado')}</span>
        <strong>{tecnicoSel?.nombre || t('citas.tecnicoAsignado')}</strong>
      </div>
      {!deTecnicosPage && !editandoId && (
        <button
          type="button"
          className="citas-btn citas-btn-ghost"
          onClick={() => setTecnicoSel(null)}
        >
          <FaXmark /> {t('citas.quitar')}
        </button>
      )}
    </div>
  );

  const renderSeleccionTecnicos = () => (
    <div className="citas-card citas-tecnicos-card">
      <div className="citas-card-title">
        <span className="citas-card-icon"><FaUserTie /></span>
        <div className="citas-card-heading">
          <h2>{t('citas.tituloSeleccionTecnico')}</h2>
          <p>{t('citas.subSeleccionTecnico')}</p>
        </div>
      </div>
      {tecnicosLoading ? (
        <p className="citas-hint">{t('citas.cargandoTecnicos')}</p>
      ) : (
        <div className="citas-tecnicos-list">
          {tecnicos.map((tec) => {
            const seleccionado = tecnicoSel?.id === tec.id;
            return (
              <div
                key={tec.id}
                className={`citas-tecnico-item ${seleccionado ? 'selected' : ''} ${tec.disponible ? '' : 'no-disponible'}`}
              >
                <div className="citas-tecnico-top">
                  <img
                    src={tec.foto_url || '/assets/images/perfil.png'}
                    alt={`${tec.nombre} ${tec.apellido}`}
                    className="citas-tecnico-avatar"
                    onError={(e) => (e.currentTarget.src = '/assets/images/perfil.png')}
                  />
                  <div className="citas-tecnico-info">
                    <strong>{tec.nombre} {tec.apellido}</strong>
                    <span className="citas-tecnico-especialidad">{tec.especialidad}</span>
                    <span className="citas-tecnico-experiencia">{tec.anios_experiencia}+ {t('common.años')}</span>
                  </div>
                </div>
                <div className="citas-tecnico-meta">
                  <span className={`citas-tecnico-estado ${tec.disponible ? 'tec-ok' : 'tec-ocu'}`}>
                    {tec.disponible ? t('citas.tecnicoDisponible') : t('citas.tecnicoOcupado')}
                  </span>
                  <span className="citas-tecnico-rating">★ {tec.calificacion.toFixed(1)}</span>
                </div>
                <div className="citas-tecnico-actions">
                  <button
                    type="button"
                    className={`citas-btn ${seleccionado ? 'citas-btn-confirmado' : 'citas-btn-ghost'}`}
                    onClick={() =>
                      setTecnicoSel(seleccionado ? null : { id: tec.id, nombre: `${tec.nombre} ${tec.apellido}` })
                    }
                    disabled={!tec.disponible}
                  >
                    {seleccionado ? (
                      <><FaCircleCheckFilled /> {t('citas.tecnicoSeleccionado')}</>
                    ) : tec.disponible ? (
                      <><FaCheck /> {t('citas.seleccionarTecnico')}</>
                    ) : (
                      t('citas.tecnicoNoDisponible')
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderMisCitas = () => (
    <div className="citas-list-wrap">
      {!isAuthenticated ? (
        <div className="citas-empty">
          <FaCircleXmark />
          <p>{t('citas.sinAutenticar')}</p>
        </div>
      ) : citasLoading ? (
        <div className="citas-empty">
          <FaCalendarDays />
          <p>{t('citas.cargandoCitas')}</p>
        </div>
      ) : citas.length === 0 ? (
        <div className="citas-empty">
          <FaCalendarDays />
          <p>{t('citas.vacias')}</p>
          <p className="citas-empty-hint">{t('citas.vaciasHint')}</p>
        </div>
      ) : (
        <div className="citas-list">
          {citas.map((cita) => {
            const editable = esEditable(cita);
            return (
              <article key={cita.id_cita} className="cita-card">
                <div className="cita-card-top">
                  <span className="cita-tipo">
                    <FaScrewdriverWrench /> {t(TIPO_TRAD[cita.tipo_servicio] || 'citas.servicioGeneral')}
                  </span>
                  <span className={`cita-estado estado-${cita.estado.toLowerCase()}`}>{t(`citas.${cita.estado.toLowerCase()}`)}</span>
                </div>
                <div className="cita-datos">
                  <span className="cita-dato"><FaCalendarDays /> {formatDate(cita.fecha)}</span>
                  <span className="cita-dato"><FaClock /> {cita.hora}</span>
                  <span className="cita-dato"><FaLocationDot /> {cita.direccion}</span>
                  {cita.nombre_tecnico && (
                    <span className="cita-dato"><FaUserTie /> {cita.nombre_tecnico}</span>
                  )}
                </div>
                {cita.descripcion && <p className="cita-desc">{cita.descripcion}</p>}
                <div className="cita-actions">
                  {editable ? (
                    <>
                      <button type="button" className="citas-btn citas-btn-ghost" onClick={() => iniciarEdicion(cita)}>
                        <FaPenToSquare /> {t('citas.editar')}
                      </button>
                      {confirmarCancelarId === cita.id_cita ? (
                        <button type="button" className="citas-btn citas-btn-danger" onClick={() => cancelarCita(cita.id_cita)}>
                          <FaCheck /> {t('citas.preguntaCancelar')}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="citas-btn citas-btn-danger"
                          onClick={() => {
                            setConfirmarCancelarId(cita.id_cita);
                            setToast(null);
                          }}
                        >
                          <FaXmark /> {t('citas.cancelar')}
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="cita-locked">
                      <FaExclamation />{' '}
                      {cita.estado === 'Finalizada' || cita.estado === 'Cancelada'
                        ? t('citas.yaNoModificable')
                        : t('citas.menos48h')}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="citas-page app-glass">
      <main className="citas-main">
        <header className="citas-header">
          <button className="citas-back-btn" onClick={() => navigate('/productos')}>
            <FaArrowLeft /> {t('citas.volverProductos')}
          </button>
          <div className="citas-header-content">
            <h1 className="citas-title">{t('citas.titulo')}</h1>
            <p className="citas-subtitle">
              {t('citas.subtituloNeoDomus')}
            </p>
          </div>
        </header>

        <div className="citas-tabs" role="tablist" aria-label={t('citas.seccionesLabel')}>
          <button
            type="button"
            role="tab"
            aria-selected={vista === 'agendar'}
            className={`citas-tab-btn ${vista === 'agendar' ? 'active' : ''}`}
            onClick={() => setVista('agendar')}
          >
            <FaCalendarDays /> {t('citas.tabNueva')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={vista === 'mis-citas'}
            className={`citas-tab-btn ${vista === 'mis-citas' ? 'active' : ''}`}
            onClick={() => setVista('mis-citas')}
          >
            <FaList /> {t('citas.tabMis')}
            {citas.length > 0 && <span className="citas-tab-count">{citas.length}</span>}
          </button>
        </div>

        {vista === 'mis-citas' ? (
          renderMisCitas()
        ) : (
          <form onSubmit={handleSubmit} className="citas-form" noValidate>
            {editandoId !== null && (
              <div className="citas-editando">
                <FaPenToSquare />
                <span>{t('citas.editandoCita', { id: editandoId })}</span>
                <button type="button" className="citas-btn citas-btn-ghost" onClick={cancelarEdicion}>
                  <FaXmark /> {t('citas.cancelarEdicion')}
                </button>
              </div>
            )}

            {tecnicoSel !== null && renderBarraTecnico()}

            {/* Tarjeta: detalles del servicio */}
            <div className="citas-card">
              <div className="citas-card-title">
                <span className="citas-card-icon"><FaScrewdriverWrench /></span>
                <div className="citas-card-heading">
                  <h2>{t('citas.detalleServicio')}</h2>
                  <p>{t('citas.detalleServicioSub')}</p>
                </div>
              </div>

              <div className="citas-grid">
                <div className="citas-field">
                  <label className="citas-label" htmlFor="citas-tipo">{t('citas.tipoServicioLabel')}</label>
                  <div className="citas-select-wrap">
                    <select
                      id="citas-tipo"
                      name="tipo_servicio"
                      value={form.tipo_servicio}
                      onChange={handleChange}
                      className="citas-select"
                      required
                      aria-required="true"
                    >
<option value="" disabled>{t('citas.seleccionaTipoServicio')}</option>
                      {tiposServicio.map(tipo => (
                        <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                      ))}
                    </select>
                    <FaChevronDown className="citas-select-chevron" />
                  </div>
                </div>

                <div className="citas-field">
                  <label className="citas-label" htmlFor="citas-fecha">{t('citas.fechaCita')}</label>
                  <input
                    type="date"
                    id="citas-fecha"
                    name="fecha"
                    value={form.fecha}
                    onChange={handleChange}
                    min={hoy}
                    className="citas-input"
                    required
                    aria-required="true"
                  />
                  {form.fecha && (
                    <p className="citas-selected-date">
                      <FaCheck /> {formatDate(form.fecha)}
                    </p>
                  )}
                  <p className="citas-hint">{t('citas.horarioLunVie')}</p>
                </div>

                <div className="citas-field">
                  <label className="citas-label" htmlFor="citas-hora">{t('citas.horaCita')}</label>
                  {form.fecha && horasDisponibles.length === 0 ? (
                    <div className="citas-no-horas">
                      <FaExclamation /> {t('citas.noHorarios')}
                    </div>
                  ) : (
                    <div className="citas-horas-grid" role="radiogroup" aria-label={t('citas.horaCita')}>
                      {horasDisponibles.map((hora) => (
                        <button
                          key={hora}
                          type="button"
                          className={`citas-hora-btn ${form.hora === hora ? 'selected' : ''}`}
                          onClick={() => setForm(prev => ({ ...prev, hora }))}
                        >
                          {hora}
                        </button>
                      ))}
                    </div>
                  )}
                  {!form.fecha && <p className="citas-hint">{t('citas.eligeFechaHoras')}</p>}
                </div>

                <div className="citas-field">
                  <label className="citas-label" htmlFor="citas-direccion">{t('citas.direccionServicio')}</label>
                  <input
                    type="text"
                    id="citas-direccion"
                    name="direccion"
                    value={form.direccion}
                    onChange={handleChange}
                    className="citas-input"
                    required
                    aria-required="true"
                    placeholder={t('citas.placeholderDireccion')}
                  />
                  <p className="citas-hint">{t('citas.lugarServicio')}</p>
                </div>
              </div>
            </div>

            {/* Tarjeta: descripción */}
            <div className="citas-card">
              <div className="citas-card-title">
                <span className="citas-card-icon"><FaComment /></span>
                <div className="citas-card-heading">
                  <h2>{t('citas.describeSolicitud')}</h2>
                  <p>{t('citas.describeSolicitudSub')}</p>
                </div>
              </div>

              <div className="citas-grid">
                <div className="citas-field citas-field-full">
                  <label className="citas-label" htmlFor="citas-descripcion">{t('citas.descripcionLabel')}</label>
                  <div className="citas-textarea-wrap">
                    <textarea
                      id="citas-descripcion"
                      name="descripcion"
                      value={form.descripcion}
                      onChange={handleChange}
                      className="citas-textarea"
                      rows={5}
                      placeholder={t('citas.placeholderDescripcion')}
                      required
                      aria-required="true"
                    />
                    <span className="citas-char-count">{form.descripcion.length} / 500</span>
                  </div>
                  <p className="citas-hint">{t('citas.min20')}</p>
                </div>
              </div>
            </div>

            {/* Solo si el usuario entró directo a Citas (sin técnico preseleccionado) */}
            {tecnicoSel === null && !editandoId && renderSeleccionTecnicos()}

            <div className="citas-form-actions">
              <button type="button" className="citas-btn citas-btn-ghost" onClick={() => navigate('/productos')}>
                <FaArrowLeft /> {t('common.cancelar')}
              </button>
              <button type="submit" className="citas-btn citas-btn-primary" disabled={submitting}>
                {submitting ? (
                  <>
                    <FaCircleCheck style={{ animation: 'spin 1s linear infinite' }} /> {editandoId !== null ? t('citas.guardando') : t('citas.agendando')}
                  </>
                ) : (
                  <>
                    <FaCircleCheck /> {editandoId !== null ? t('citas.guardarCambios') : t('citas.agendar')}
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {toast && (
          <div className={`citas-toast ${toast.tipo}`}>
            {toast.tipo === 'success' ? <FaCircleCheck /> : <FaExclamation />}
            <span>{toast.msg}</span>
          </div>
        )}
      </main>
    </div>
  );
};

export default CitasPage;