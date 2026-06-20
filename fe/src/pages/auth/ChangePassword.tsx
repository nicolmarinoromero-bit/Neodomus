import { useState, useEffect } from 'react';
import { useAuth } from '@contexts/AuthContext';
import api from '@services/api';
import '@styles/login.css'; // Reutiliza estilos del login (ajusta si quieres uno específico)

const ChangePassword = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Limpiar mensajes después de 5 segundos
  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // Validaciones adicionales
    if (newPassword !== confirmPassword) {
      setError('Las nuevas contraseñas no coinciden');
      return;
    }
    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (currentPassword === newPassword) {
      setError('La nueva contraseña debe ser diferente a la actual');
      return;
    }

    try {
      await api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setMessage('Contraseña actualizada correctamente');
      // Limpiar formulario
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Error al cambiar contraseña';
      setError(errorMsg);
    }
  };

  return (
    <>
      <div className="login-container">
        <form onSubmit={handleSubmit} className="login-form">
          <h2>Cambiar contraseña</h2>
          {message && <div className="success">{message}</div>}
          {error && <div className="error">{error}</div>}
          
          <input
            type="password"
            placeholder="Contraseña actual"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
          
          <input
            type="password"
            placeholder="Confirmar nueva contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          
          <button type="submit">Actualizar</button>
        </form>
      </div>
    </>
  );
};

export default ChangePassword;