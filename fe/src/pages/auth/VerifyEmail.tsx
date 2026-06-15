// src/pages/auth/VerifyEmail.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '@services/api';
import Navbar from '@components/layout/Navbar';
import Footer from '@components/layout/Footer';
import '@styles/login.css';
import fondoImg from '@assets/images/Fondo2.png';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!email) navigate('/register');
  }, [email, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !canResend) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('El código debe tener 6 dígitos');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await api.post('/auth/verify-email', null, { params: { code } });
      setMessage('¡Email verificado correctamente! Redirigiendo al login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Código inválido o expirado');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!canResend) return;
    setCanResend(false);
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await api.post('/auth/resend-verification', { email });
      setMessage('Se ha enviado un nuevo código a tu correo.');
      setCountdown(30);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al reenviar el código');
      setCanResend(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="login-container" style={{ backgroundImage: `url(${fondoImg})` }}>
        <form onSubmit={handleVerify} className="login-form">
          <h2>Verificación de cuenta</h2>
          <p>Ingresa el código de 6 dígitos que recibiste en <strong>{email}</strong></p>
          {message && <div className="success">{message}</div>}
          {error && <div className="error">{error}</div>}
          <input
            type="text"
            maxLength={6}
            placeholder="Código de 6 dígitos"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            disabled={loading}
            autoFocus
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Verificando...' : 'Verificar'}
          </button>
          
          {/* Enlace de reenvío (estilo link) */}
          <div className="resend-container">
            <a
              href="#"
              onClick={handleResend}
              className={`resend-link ${!canResend ? 'disabled' : ''}`}
              style={{
                pointerEvents: !canResend ? 'none' : 'auto',
                opacity: !canResend ? 0.6 : 1,
              }}
            >
              {!canResend ? `Reenviar en ${countdown}s` : 'Reenviar código'}
            </a>
          </div>

          <div className="links single-link">
            <Link to="/login">Volver al inicio de sesión</Link>
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default VerifyEmail;