import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '@services/api';
import Navbar from '@components/layout/Navbar';
import Footer from '@components/layout/Footer';
import '@styles/login.css';
import fondoImg from '@assets/images/Fondo2.png';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) setError('Token no válido');
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
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { token, new_password: newPassword });
      setMessage('Contraseña actualizada correctamente. Redirigiendo al login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Este enlace fue solicitado desde otra IP. Solicita un nuevo restablecimiento.');
      } else {
        setError(err.response?.data?.detail || 'Error al restablecer la contraseña');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <>
        <Navbar />
        <div className="login-container" style={{ backgroundImage: `url(${fondoImg})` }}>
          <div className="login-form">
            <div className="error">Token inválido o expirado</div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="login-container" style={{ backgroundImage: `url(${fondoImg})` }}>
        <form onSubmit={handleSubmit} className="login-form">
          <h2>Nueva contraseña</h2>
          {message && <div className="success">{message}</div>}
          {error && <div className="error">{error}</div>}
          <input type="password" placeholder="Nueva contraseña" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required disabled={loading} autoComplete="new-password" />
          <input type="password" placeholder="Confirmar contraseña" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={loading} autoComplete="new-password" />
          <button type="submit" disabled={loading}>{loading ? 'Actualizando...' : 'Restablecer'}</button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default ResetPassword;