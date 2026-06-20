import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '@services/api';

import '@styles/resetpassword.css';

import fondoImg from '@assets/images/Fondo2.png';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Token no válido');
    }

    if (message || error) {
      const timer = setTimeout(() => {
        setMessage('');
        setError('');
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [token, message, error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      setError(
        'La contraseña debe tener al menos 6 caracteres'
      );
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/reset-password', {
        token,
        new_password: newPassword,
      });

      setMessage(
        'Contraseña actualizada correctamente. Redirigiendo al inicio de sesión...'
      );

      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError(
          'Este enlace fue solicitado desde otra IP. Solicita un nuevo restablecimiento.'
        );
      } else {
        setError(
          err.response?.data?.detail ||
            'Error al restablecer la contraseña'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="reset-page-wrapper">

        <div
          className="reset-background-layer"
          style={{
            backgroundImage: `url(${fondoImg})`,
          }}
        />

        <div className="reset-card">

          <h2>Enlace inválido</h2>

          <div className="error-message">
            El enlace ha expirado o no es válido.
          </div>

          <button
            className="btn-reset-submit"
            onClick={() =>
              navigate('/forgot-password')
            }
          >
            Solicitar nuevamente
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="reset-page-wrapper">

      <div
        className="reset-background-layer"
        style={{
          backgroundImage: `url(${fondoImg})`,
        }}
      />

      <form
        onSubmit={handleSubmit}
        className="reset-card"
      >

        <div className="reset-avatar-circle">

          🔒

        </div>

        <h2>Nueva contraseña</h2>

        <p className="reset-description">
          Crea una nueva contraseña segura para
          acceder nuevamente a tu cuenta.
        </p>

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="reset-input-wrapper">
          <input
            type={
              showPassword ? 'text' : 'password'
            }
            placeholder="Nueva contraseña"
            value={newPassword}
            onChange={(e) =>
              setNewPassword(e.target.value)
            }
            required
            disabled={loading}
            autoComplete="new-password"
          />

          <button
            type="button"
            className="password-toggle"
            onClick={() =>
              setShowPassword(!showPassword)
            }
          >
            
          </button>
        </div>

        <div className="reset-input-wrapper">
          <input
            type={
              showConfirmPassword
                ? 'text'
                : 'password'
            }
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(
                e.target.value
              )
            }
            required
            disabled={loading}
            autoComplete="new-password"
          />

          <button
            type="button"
            className="password-toggle"
            onClick={() =>
              setShowConfirmPassword(
                !showConfirmPassword
              )
            }
          >
            
          </button>
        </div>

        <button
          type="submit"
          className="btn-reset-submit"
          disabled={loading}
        >
          {loading
            ? 'Actualizando...'
            : 'Restablecer contraseña'}
        </button>

      </form>
    </div>
  );
};

export default ResetPassword;

