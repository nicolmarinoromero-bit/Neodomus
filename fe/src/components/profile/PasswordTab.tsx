import { useState } from 'react';
import { FaKey, FaCheck, FaXmark, FaEye, FaEyeSlash } from 'react-icons/fa6';
import api from '@services/api';
import SectionHeader from './SectionHeader';
import { NotifyFn } from './PersonalTab';

interface PasswordTabProps {
  notify: NotifyFn;
}

interface PasswordReqs {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
}

const REQ_SPECIAL = /[!@#$%^&*(),.?":{}|<>]/;

const evaluarRequisitos = (value: string): PasswordReqs => ({
  length: value.length >= 8,
  uppercase: /[A-Z]/.test(value),
  lowercase: /[a-z]/.test(value),
  number: /\d/.test(value),
  special: REQ_SPECIAL.test(value),
});

const REQUISITOS: { key: keyof PasswordReqs; label: string }[] = [
  { key: 'length', label: 'Mínimo 8 caracteres' },
  { key: 'uppercase', label: 'Al menos una mayúscula' },
  { key: 'lowercase', label: 'Al menos una minúscula' },
  { key: 'number', label: 'Al menos un número' },
  { key: 'special', label: 'Al menos un símbolo (!@#$…)' },
];

const bloquearPegado = (e: React.ClipboardEvent<HTMLInputElement>) => e.preventDefault();

const PasswordTab = ({ notify }: PasswordTabProps) => {
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const reqs = evaluarRequisitos(nueva);
  const todosValidos = Object.values(reqs).every(Boolean);
  const botonListo =
    actual.trim().length > 0 &&
    todosValidos &&
    confirmar.length > 0 &&
    nueva === confirmar &&
    nueva !== actual;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!botonListo) {
      notify('Completa todas las validaciones de la contraseña', 'error');
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
        subtitle="Debe tener al menos 8 caracteres, mayúsculas, minúsculas, números y símbolos. No se permite copiar ni pegar."
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
              onCopy={bloquearPegado}
              onPaste={bloquearPegado}
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
              onCopy={bloquearPegado}
              onPaste={bloquearPegado}
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
            <div className="pf-pass-requirements">
              <p className="pf-pass-requirements-title">La contraseña debe cumplir:</p>
              <ul>
                {REQUISITOS.map((req) => (
                  <li key={req.key} className={reqs[req.key] ? 'valid' : 'invalid'}>
                    {reqs[req.key] ? <FaCheck /> : <FaXmark />} {req.label}
                  </li>
                ))}
              </ul>
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
              onCopy={bloquearPegado}
              onPaste={bloquearPegado}
              required
              autoComplete="new-password"
            />
          </div>
          {confirmar && nueva !== confirmar && (
            <p className="pf-pass-match-error">Las contraseñas no coinciden</p>
          )}
        </div>
        <div className="pf-form-actions">
          <button type="submit" className="pf-btn pf-btn-primary" disabled={guardando || !botonListo}>
            <FaCheck /> {guardando ? 'Actualizando…' : 'Actualizar contraseña'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PasswordTab;
