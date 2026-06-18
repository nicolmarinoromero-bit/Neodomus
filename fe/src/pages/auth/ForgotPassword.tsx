import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@services/api';
import Navbar from '@components/layout/Navbar';
import Footer from '@components/layout/Footer';
import '@styles/login.css';
import fondoImg from '@assets/images/Fondo2.png';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    setLoading(true);
    setMessage('');
    setError('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Correo electrónico inválido');
      setLoading(false);
      return;
    }
    try {
      await api.post('/auth/forgot-password', { email });
      setMessage('Código enviado. Redirigiendo...');
      setTimeout(() => navigate(`/verify-code?email=${encodeURIComponent(email)}`), 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al enviar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="login-container" style={{ backgroundImage: `url(${fondoImg})` }}>
        <form onSubmit={handleSubmit} className="login-form">
          
          {/* Icono Superior de Correo con Candado */}
          <div className="login-avatar-container">
            <div className="forgot-avatar-circle">
              <svg className="forgot-mail-svg" viewBox="0 0 24 24" fill="none" stroke="#ffd700" strokeWidth="1.5">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <div className="lock-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
            </div>
          </div>

          <h2>Recuperar contraseña</h2>
          <p className="forgot-instruction-text">
            Ingresa tu correo electrónico y te enviaremos un <span className="brand-gold">código</span> para restablecer tu contraseña.
          </p>

          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}
          
          {/* Input de Correo con Icono Interno */}
          <div className="login-input-wrapper">
            <span className="input-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#ffd700" strokeWidth="1.5">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </span>
            <input 
              type="email" 
              placeholder="Tu correo electrónico" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              disabled={loading} 
              autoComplete="email" 
            />
          </div>

          {/* Botón de Enviar Código Centrado con Icono */}
          <button type="submit" className="btn-forgot-submit" disabled={loading}>
            <svg className="btn-send-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            <span>{loading ? 'Enviando...' : 'Enviar código'}</span>
          </button>

          {/* Sección de Mensaje de Seguridad Inferior */}
          <div className="forgot-security-notice">
            <svg className="notice-shield-icon" viewBox="0 0 24 24" fill="none" stroke="#ffd700" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 11 11 13 15 9" />
            </svg>
            <p>
              Te enviaremos un <span className="brand-gold">código seguro</span> a tu correo para que puedas recuperar tu cuenta.
            </p>
          </div>

          {/* Enlace Volver al Inicio de Sesión */}
          <div className="forgot-back-to-login">
            <button type="button" onClick={() => navigate('/login')} className="forgot-back-link">
              <span className="forgot-back-arrow">←</span> Volver al inicio de sesión
            </button>
          </div>

        </form>
      </div>
      <Footer />
    </>
  );
};

export default ForgotPassword;