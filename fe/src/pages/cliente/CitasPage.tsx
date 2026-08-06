import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import {
  FaScrewdriverWrench, FaComment, FaCircleCheck, FaArrowLeft,
  FaExclamation, FaCheck, FaChevronDown
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

const CitasPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<CitaForm>({
    tipo_servicio: '',
    fecha: '',
    hora: '',
    direccion: '',
    descripcion: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; tipo: 'success' | 'error' } | null>(null);
  const [horasDisponibles, setHorasDisponibles] = useState<string[]>([]);

  const hoy = new Date().toISOString().split('T')[0];

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
    if (form.descripcion.trim().length < 20) {
      setToast({ msg: 'La descripción debe tener al menos 20 caracteres', tipo: 'error' });
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

  const tiposServicio: { value: TipoServicio; label: string }[] = [
    { value: 'instalacion', label: 'Instalación' },
    { value: 'mantenimiento', label: 'Mantenimiento' },
    { value: 'reparacion', label: 'Reparación' },
    { value: 'revision', label: 'Revisión técnica' },
  ];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="citas-page app-glass">
      <main className="citas-main">
        <header className="citas-header">
          <button className="citas-back-btn" onClick={() => navigate('/productos')}>
            <FaArrowLeft /> Volver a Productos
          </button>
          <div className="citas-header-content">
            <h1 className="citas-title">Agendar cita</h1>
            <p className="citas-subtitle">
              Programa tu servicio en minutos. Completa la información y <span className="citas-subtitle-accent">NeoDomus</span> se encargará del resto.
            </p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="citas-form" noValidate>

          {/* Tarjeta: detalles del servicio */}
          <div className="citas-card">
            <div className="citas-card-title">
              <span className="citas-card-icon"><FaScrewdriverWrench /></span>
              <div className="citas-card-heading">
                <h2>Detalles del servicio</h2>
                <p>Selecciona qué necesitas y cuándo te conviene.</p>
              </div>
            </div>

            <div className="citas-grid">
              <div className="citas-field">
                <label className="citas-label" htmlFor="citas-tipo">Tipo de servicio</label>
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
                    <option value="" disabled>Selecciona el tipo de servicio</option>
                    {tiposServicio.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <FaChevronDown className="citas-select-chevron" />
                </div>
              </div>

              <div className="citas-field">
                <label className="citas-label" htmlFor="citas-fecha">Fecha de la cita</label>
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
                <p className="citas-hint">Lunes a viernes, de 8:00 a. m. a 6:00 p. m.</p>
              </div>

              <div className="citas-field">
                <label className="citas-label" htmlFor="citas-hora">Hora de la cita</label>
                {form.fecha && horasDisponibles.length === 0 ? (
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
                      >
                        {hora}
                      </button>
                    ))}
                  </div>
                )}
                {!form.fecha && <p className="citas-hint">Elige una fecha para ver los horarios disponibles.</p>}
              </div>

              <div className="citas-field">
                <label className="citas-label" htmlFor="citas-direccion">Dirección del servicio</label>
                <input
                  type="text"
                  id="citas-direccion"
                  name="direccion"
                  value={form.direccion}
                  onChange={handleChange}
                  className="citas-input"
                  required
                  aria-required="true"
                  placeholder="Calle, número, barrio, ciudad..."
                />
                <p className="citas-hint">Lugar donde se realizará el servicio.</p>
              </div>
            </div>
          </div>

          {/* Tarjeta: descripción */}
          <div className="citas-card">
            <div className="citas-card-title">
              <span className="citas-card-icon"><FaComment /></span>
              <div className="citas-card-heading">
                <h2>Describe tu solicitud</h2>
                <p>Cuanto más detalle proporciones, mejor preparado llegará el técnico.</p>
              </div>
            </div>

            <div className="citas-grid">
              <div className="citas-field citas-field-full">
                <label className="citas-label" htmlFor="citas-descripcion">Descripción del servicio o problema</label>
                <div className="citas-textarea-wrap">
                  <textarea
                    id="citas-descripcion"
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
                <p className="citas-hint">Mínimo 20 caracteres.</p>
              </div>
            </div>
          </div>

          <div className="citas-form-actions">
            <button type="button" className="citas-btn citas-btn-ghost" onClick={() => navigate('/productos')}>
              <FaArrowLeft /> Cancelar
            </button>
            <button type="submit" className="citas-btn citas-btn-primary" disabled={submitting}>
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
            {toast.tipo === 'success' ? <FaCircleCheck /> : <FaExclamation />}
            <span>{toast.msg}</span>
          </div>
        )}
      </main>
    </div>
  );
};

export default CitasPage;