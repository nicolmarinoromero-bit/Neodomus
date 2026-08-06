import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { 
  FaCalendar, FaClock, FaScrewdriverWrench, FaComment, 
  FaCircleCheck, FaArrowLeft, FaExclamation, FaUserTie, 
  FaHouse, FaLocationDot, FaMagnifyingGlass, FaCheck, FaXmark
} from 'react-icons/fa6';
import '@styles/perfil-cliente.css';
import fondoImg from '@assets/images/Fondo2.png';
import api from '@services/api';

type TipoServicio = 'instalacion' | 'reparacion' | 'mantenimiento' | 'revision';

interface CitaForm {
  tipo_servicio: TipoServicio;
  fecha: string;
  hora: string;
  direccion: string;
  descripcion: string;
  tecnico_id?: number;
}

interface Tecnico {
  id: number;
  nombre: string;
  apellido: string;
  especialidad: string;
  disponible: boolean;
  calificacion?: number;
}

const CitasPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tecnicoIdParam] = useState(searchParams.get('tecnico'));
  
  const [form, setForm] = useState<CitaForm>({
    tipo_servicio: 'instalacion',
    fecha: '',
    hora: '',
    direccion: '',
    descripcion: '',
    tecnico_id: tecnicoIdParam ? parseInt(tecnicoIdParam) : undefined,
  });
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; tipo: 'success' | 'error' } | null>(null);
  const [horasDisponibles, setHorasDisponibles] = useState<string[]>([]);
  const [showTecnicoModal, setShowTecnicoModal] = useState(false);
  const [tecnicoSearch, setTecnicoSearch] = useState('');

  const hoy = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchTecnicos = async () => {
      try {
        const res = await api.get('/tecnicos');
        const data = res.data.data || res.data || [];
        setTecnicos(data.filter((t: Tecnico) => t.disponible));
      } catch (err) {
        console.error(err);
      }
    };
    fetchTecnicos();
  }, []);

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
      setToast({ msg: 'Debes iniciar sesión para agendar una cita', tipo: 'error' });
      return;
    }
    if (!form.tipo_servicio || !form.fecha || !form.hora || !form.direccion.trim() || !form.descripcion.trim()) {
      setToast({ msg: 'Completa todos los campos obligatorios', tipo: 'error' });
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/citas', form);
      setToast({ msg: 'Cita agendada correctamente', tipo: 'success' });
      setForm(prev => ({ ...prev, fecha: '', hora: '', direccion: '', descripcion: '' }));
      setTimeout(() => navigate('/perfil?tab=citas'), 2000);
    } catch (err: any) {
      console.error(err);
      setToast({ msg: err.response?.data?.detail || 'Error al agendar la cita', tipo: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const tiposServicio: { value: TipoServicio; label: string; icon: React.ReactNode; descripcion: string }[] = [
    { value: 'instalacion', label: 'Instalación', icon: <FaScrewdriverWrench />, descripcion: 'Nuevos equipos y sistemas' },
    { value: 'reparacion', label: 'Reparación', icon: <FaHouse />, descripcion: 'Arreglo de equipos existentes' },
    { value: 'mantenimiento', label: 'Mantenimiento', icon: <FaComment />, descripcion: 'Revisiones preventivas' },
    { value: 'revision', label: 'Revisión técnica', icon: <FaMagnifyingGlass />, descripcion: 'Diagnóstico y evaluación' },
  ];

  const tecnicosFiltrados = tecnicos.filter(t => 
    t.nombre.toLowerCase().includes(tecnicoSearch.toLowerCase()) ||
    t.apellido.toLowerCase().includes(tecnicoSearch.toLowerCase()) ||
    t.especialidad.toLowerCase().includes(tecnicoSearch.toLowerCase())
  );

  const handleSelectTecnico = (tecnico: Tecnico) => {
    setForm(prev => ({ ...prev, tecnico_id: tecnico.id }));
    setShowTecnicoModal(false);
    setTecnicoSearch('');
  };

  const clearTecnico = () => {
    setForm(prev => ({ ...prev, tecnico_id: undefined }));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="citas-page" style={{ backgroundImage: `url(${fondoImg})`, backgroundSize: 'cover', minHeight: '100vh' }}>
      <div className="citas-overlay" />
      <main className="citas-main">
        <header className="citas-header">
          <button className="citas-back-btn" onClick={() => navigate('/perfil')}>
            <FaArrowLeft /> Volver al perfil
          </button>
          <div className="citas-header-content">
            <h1 className="citas-title">Agendar Cita</h1>
            <p className="citas-subtitle">Completa los datos para programar tu servicio</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="citas-form" noValidate>
          <div className="citas-form-grid">
            
            {/* Tipo de Servicio */}
            <section className="citas-fieldset">
              <h3 className="citas-fieldset-title">
                <FaScrewdriverWrench /> Tipo de servicio
              </h3>
              <div className="citas-tipos-servicio-grid" role="radiogroup" aria-label="Tipo de servicio">
                {tiposServicio.map(({ value, label, icon, descripcion }) => (
                  <label key={value} className={`citas-tipo-card ${form.tipo_servicio === value ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="tipo_servicio"
                      value={value}
                      checked={form.tipo_servicio === value}
                      onChange={handleChange}
                      className="citas-tipo-radio"
                    />
                    <div className="citas-tipo-card-content">
                      <div className="citas-tipo-icon-wrapper">
                        {icon}
                      </div>
                      <div className="citas-tipo-info">
                        <span className="citas-tipo-label">{label}</span>
                        <span className="citas-tipo-desc">{descripcion}</span>
                      </div>
                      <div className="citas-tipo-check">
                        <FaCheck />
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            {/* Fecha y Hora en fila */}
            <div className="citas-row">
              <section className="citas-fieldset">
                <h3 className="citas-fieldset-title">
                  <FaCalendar /> Fecha de la cita
                </h3>
                <div className="citas-input-wrapper">
                  <FaCalendar className="citas-input-icon" />
                  <input
                    type="date"
                    name="fecha"
                    value={form.fecha}
                    onChange={handleChange}
                    min={hoy}
                    className="citas-input"
                    required
                    aria-required="true"
                    placeholder="Selecciona una fecha"
                  />
                </div>
                {form.fecha && (
                  <p className="citas-selected-date">
                    <FaCheck /> {formatDate(form.fecha)}
                  </p>
                )}
                <p className="citas-hint">Lunes a viernes. No se atiende fines de semana.</p>
              </section>

              <section className="citas-fieldset">
                <h3 className="citas-fieldset-title">
                  <FaClock /> Hora de la cita
                </h3>
                {horasDisponibles.length === 0 && form.fecha ? (
                  <div className="citas-no-horas">
                    <FaExclamation /> No hay horarios disponibles para esta fecha (fin de semana)
                  </div>
                ) : (
                  <div className="citas-horas-grid" role="radiogroup" aria-label="Hora de la cita">
                    {horasDisponibles.map((hora) => (
                      <button
                        key={hora}
                        type="button"
                        className={`citas-hora-btn ${form.hora === hora ? 'selected' : ''}`}
                        onClick={() => setForm(prev => ({ ...prev, hora }))}
                        disabled={!horasDisponibles.length}
                      >
                        {hora}
                      </button>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Dirección */}
            <section className="citas-fieldset citas-fieldset-full">
              <h3 className="citas-fieldset-title">
                <FaLocationDot /> Dirección del servicio
              </h3>
              <div className="citas-input-wrapper">
                <FaLocationDot className="citas-input-icon" />
                <input
                  type="text"
                  name="direccion"
                  value={form.direccion}
                  onChange={handleChange}
                  className="citas-input"
                  required
                  aria-required="true"
                  placeholder="Calle, número, barrio, ciudad, referencia..."
                />
              </div>
              <p className="citas-hint">Ingresa la dirección completa donde se realizará el servicio.</p>
            </section>

            {/* Descripción */}
            <section className="citas-fieldset citas-fieldset-full">
              <h3 className="citas-fieldset-title">
                <FaComment /> Descripción del servicio
              </h3>
              <div className="citas-textarea-wrapper">
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  className="citas-textarea"
                  rows={5}
                  placeholder="Describe detalladamente el problema, la instalación que necesitas, el mantenimiento requerido o lo que necesitas que revise el técnico..."
                  required
                  aria-required="true"
                />
                <span className="citas-char-count">{form.descripcion.length} / 500</span>
              </div>
              <p className="citas-hint">Mínimo 20 caracteres. Cuanto más detalle, mejor preparará el técnico.</p>
            </section>

            {/* Técnico */}
            <section className="citas-fieldset citas-fieldset-full">
              <div className="citas-fieldset-header">
                <h3 className="citas-fieldset-title">
                  <FaUserTie /> Técnico preferido (opcional)
                </h3>
                {form.tecnico_id && (
                  <button
                    type="button"
                    className="citas-clear-tecnico"
                    onClick={clearTecnico}
                    title="Quitar técnico seleccionado"
                  >
                    <FaXmark />
                  </button>
                )}
              </div>
              
              {tecnicos.length > 0 && (
                <>
                  <div className="citas-tecnico-selector">
                    {form.tecnico_id ? (
                      <div className="citas-tecnico-selected">
                        {(() => {
                          const t = tecnicos.find(x => x.id === form.tecnico_id);
                          if (!t) return null;
                          return (
                            <div className="citas-tecnico-card selected">
                              <div className="citas-tecnico-avatar">
                                <FaUserTie />
                              </div>
                              <div className="citas-tecnico-info">
                                <span className="citas-tecnico-nombre">{t.nombre} {t.apellido}</span>
                                <span className="citas-tecnico-especialidad">{t.especialidad}</span>
                              </div>
                              <span className="citas-tecnico-badge">Seleccionado</span>
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="citas-tecnico-placeholder">
                        <FaUserTie className="citas-tecnico-placeholder-icon" />
                        <span>No hay técnico seleccionado</span>
                        <button
                          type="button"
                          className="citas-btn citas-btn-outline"
                          onClick={() => setShowTecnicoModal(true)}
                        >
                          Elegir técnico
                        </button>
                      </div>
                    )}
                  </div>

                  {tecnicos.length > 0 && !form.tecnico_id && (
                    <p className="citas-hint">
                      Selecciona un técnico si tienes preferencia, o déjalo vacío para asignación automática.
                    </p>
                  )}
                </>
              )}
            </section>

          </div>

          <div className="citas-form-actions">
            <button
              type="button"
              className="citas-btn citas-btn-ghost"
              onClick={() => navigate('/perfil')}
            >
              <FaArrowLeft /> Cancelar
            </button>
            <button
              type="submit"
              className="citas-btn citas-btn-primary"
              disabled={submitting || horasDisponibles.length === 0}
            >
              {submitting ? (
                <>
                  <FaCircleCheck style={{ animation: 'spin 1s linear infinite' }} /> Agendando...
                </>
              ) : (
                <>
                  <FaCircleCheck /> Agendar cita
                </>
              )}
            </button>
          </div>
        </form>

        {toast && (
          <div className={`citas-toast ${toast.tipo}`}>
            <FaCircleCheck />
            <span>{toast.msg}</span>
          </div>
        )}

        {/* Modal Técnicos */}
        {showTecnicoModal && (
          <div className="citas-modal-backdrop" onClick={() => setShowTecnicoModal(false)}>
            <div className="citas-modal" onClick={(e) => e.stopPropagation()}>
              <header className="citas-modal-header">
                <h3><FaUserTie /> Seleccionar técnico</h3>
                <button className="citas-modal-close" onClick={() => setShowTecnicoModal(false)}>
                  <FaXmark />
                </button>
              </header>
              <div className="citas-modal-search">
                <FaMagnifyingGlass className="citas-modal-search-icon" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o especialidad..."
                  value={tecnicoSearch}
                  onChange={(e) => setTecnicoSearch(e.target.value)}
                  className="citas-modal-search-input"
                />
              </div>
              <div className="citas-modal-list">
                {tecnicosFiltrados.length === 0 ? (
                  <p className="citas-modal-empty">No se encontraron técnicos</p>
                ) : (
                  tecnicosFiltrados.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className="citas-modal-tecnico"
                      onClick={() => handleSelectTecnico(t)}
                    >
                      <div className="citas-modal-tecnico-avatar">
                        <FaUserTie />
                      </div>
                      <div className="citas-modal-tecnico-info">
                        <span className="citas-modal-tecnico-nombre">{t.nombre} {t.apellido}</span>
                        <span className="citas-modal-tecnico-especialidad">{t.especialidad}</span>
                      </div>
                      {t.calificacion && (
                        <span className="citas-modal-tecnico-rating">
                          <FaCircleCheck /> {t.calificacion.toFixed(1)}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default CitasPage;