import { useState } from 'react';
import { FaKey, FaCheck, FaEye, FaEyeSlash } from 'react-icons/fa6';
import api from '@services/api';
import SectionHeader from './SectionHeader';
import { NotifyFn } from './PersonalTab';

interface PasswordTabProps {
  notify: NotifyFn;
}

const strengthContrasena = (value: string): { etiqueta: string; clase: number; ratio: number } => {
  let puntos = 0;
  if (value.length >= 6) puntos += 1;
  if (value.length >= 10) puntos += 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) puntos += 1;
  if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) puntos += 1;
  const etiquetas = ['Muy corta', 'Débil', 'Aceptable', 'Buena', 'Excelente'];
  const ratio = (Math.min(puntos, 4) + 1) / 5;
  return { etiqueta: etiquetas[Math.min(puntos, etiquetas.length - 1)], clase: puntos, ratio };
};

const PasswordTab = ({ notify }: PasswordTabProps) => {
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const fortaleza = strengthContrasena(nueva);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nueva !== confirmar) {
      notify('Las nuevas contraseñas no coinciden', 'error');
      return;
    }
    if (nueva.length < 6) {
      notify('La nueva contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }
    if (actual === nueva) {
      notify('La nueva contraseña debe ser diferente a la actual', 'error');
      return;
    }
    setGuardando(true);
    try {
      await api.post('/auth/change-password', {
        current_password: actual,
        new_password: nueva,
      });
      notify('Contraseña actualizada correctamente', 'success');
      setActual('');
      setNueva('');
      setConfirmar('');
    } catch (err) {
      const msg = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail;
      notify(msg || 'Error al cambiar la contraseña', 'error');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="pf-tab">
      <SectionHeader
        icon={<FaKey />}
        title="Cambiar contraseña"
        subtitle="Actualiza tu contraseña. Debe tener al menos 6 caracteres."
      />

      <form className="pf-form pf-form-limited" onSubmit={handleSubmit}>
        <div className="pf-form-group">
          <label className="pf-form-label" htmlFor="pf-pass-actual">Contraseña actual</label>
          <div className="pf-input-wrap">
            <input
              id="pf-pass-actual"
              className="pf-form-input"
              type={mostrar ? 'text' : 'password'}
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
        </div>
        <div className="pf-form-group">
          <label className="pf-form-label" htmlFor="pf-pass-nueva">Nueva contraseña</label>
          <div className="pf-input-wrap">
            <input
              id="pf-pass-nueva"
              className="pf-form-input"
              type={mostrar ? 'text' : 'password'}
              value={nueva}
              onChange={(e) => setNueva(e.target.value)}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className="pf-eye"
              onClick={() => setMostrar((v) => !v)}
              aria-label={mostrar ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {mostrar ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {nueva && (
            <div className="pf-strength">
              <div className="pf-strength-bar">
                <span style={{ width: `${fortaleza.ratio * 100}%` }} className={`lvl-${fortaleza.clase}`} />
              </div>
              <span className="pf-strength-label">{fortaleza.etiqueta}</span>
            </div>
          )}
        </div>
        <div className="pf-form-group">
          <label className="pf-form-label" htmlFor="pf-pass-confirmar">Confirmar nueva contraseña</label>
          <div className="pf-input-wrap">
            <input
              id="pf-pass-confirmar"
              className="pf-form-input"
              type={mostrar ? 'text' : 'password'}
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
        </div>
        <div className="pf-form-actions">
          <button type="submit" className="pf-btn pf-btn-primary" disabled={guardando}>
            <FaCheck /> {guardando ? 'Actualizando…' : 'Actualizar contraseña'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PasswordTab;