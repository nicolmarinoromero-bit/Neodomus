import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams} from 'react-router-dom';
import api from '@services/api';
import Navbar from '@components/layout/Navbar';
import Footer from '@components/layout/Footer';
import '@styles/verifyCode.css';
import fondoImg from '@assets/images/Fondo2.png';


const VerifyCode = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  
  // Iniciamos en 600 segundos para simular los 10:00 minutos exactos de la imagen
  const [countdown, setCountdown] = useState(600);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Formateador para ver los segundos como MM:SS (Ej: 09:59)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Ingresa el código de 6 dígitos');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/verify-code', { email, code: fullCode });
      navigate(`/reset-password?token=${fullCode}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Código inválido o expirado');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (countdown > 480) return; // Permite reenvío si ya pasaron al menos 2 min, por ejemplo.
    setResendLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccessMsg('Se ha enviado un nuevo código a tu correo');
      setCountdown(600); // Resetea a 10 minutos
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al reenviar el código');
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) {
    return (
      <>
        <Navbar />
        <div className="login-container" style={{ backgroundImage: `url(${fondoImg})` }}>
          <div className="login-form">
            <h2>Error</h2>
            <p className="instruction-text">No se proporcionó un correo electrónico válido.</p>
            <div className="forgot-back-to-login">
              <button type="button" onClick={() => navigate('/forgot-password')} className="forgot-back-link">
                <span className="forgot-back-arrow">←</span> Volver
              </button>
            </div>
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
        <form onSubmit={handleVerify} className="login-form">
          
          {/* Avatar de sobre con candado dorado */}
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

          <h2>Código de seguridad</h2>
          <p className="forgot-instruction-text">
            Ingresa el código de 6 dígitos enviado a <br />
            <span className="user-email">{email}</span>
          </p>

          {error && <div className="error-message">{error}</div>}
          {successMsg && <div className="success-message">{successMsg}</div>}
          
          {/* Grilla de las 6 cajitas OTP */}
          <div className="otp-grid">
            {code.map((digit, i) => (
              <input
                key={i}
                type="text"
                maxLength={1}
                placeholder="-"
                value={digit}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  const newCode = [...code];
                  newCode[i] = val;
                  setCode(newCode);
                  if (val && i < 5) {
                    const nextInput = document.querySelectorAll('.otp-grid input')[i + 1] as HTMLInputElement;
                    nextInput?.focus();
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && !digit && i > 0) {
                    const prevInput = document.querySelectorAll('.otp-grid input')[i - 1] as HTMLInputElement;
                    prevInput?.focus();
                  }
                }}
                disabled={loading}
                autoComplete="one-time-code"
              />
            ))}
          </div>

          {/* Reloj indicador de expiración */}
          <div className="expiration-container">
            <svg className="shield-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>El código expirará en <span className="brand-gold">{formatTime(countdown)} min</span></span>
          </div>

          {/* Botón Principal con elementos integrados */}
          <button type="submit" className="btn-verify-submit" disabled={loading}>
            <svg className="btn-shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 11 11 13 15 9" />
            </svg>
            <span>{loading ? 'Confirmando...' : 'Confirmar código'}</span>
            <span className="btn-arrow">→</span>
          </button>
          
          {/* Separador de Reenvío */}
          <div className="login-divider">
            <div className="divider-circle"></div>
          </div>

          {/* Acción de Reenvío */}
          <div className="resend-action-container">
            <p className="no-account-text" style={{ marginBottom: '4px' }}>¿No recibiste el código?</p>
            <a
              href="#"
              onClick={handleResend}
              className={`resend-action-link ${resendLoading ? 'disabled' : ''}`}
              style={{ pointerEvents: resendLoading ? 'none' : 'auto' }}
            >
              <svg className="retry-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
              </svg>
              <span>{resendLoading ? 'Reenviando...' : 'Reenviar código'}</span>
            </a>
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

export default VerifyCode;