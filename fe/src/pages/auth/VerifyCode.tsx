import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '@services/api';
import Navbar from '@components/layout/Navbar';
import Footer from '@components/layout/Footer';
import '@styles/login.css';
import fondoImg from '@assets/images/Fondo2.png';

const VerifyCode = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

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

  const handleResend = async () => {
    if (countdown > 0) return;
    setResendLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccessMsg('Se ha enviado un nuevo código a tu correo');
      setCountdown(30);
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
            <p>No se proporcionó un correo electrónico.</p>
            <Link to="/forgot-password">Volver</Link>
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
          <h2>Código de seguridad</h2>
          <p>Ingresa el código de 6 dígitos enviado a <strong>{email}</strong></p>
          {error && <div className="error">{error}</div>}
          {successMsg && <div className="success">{successMsg}</div>}
          <div className="code-inputs">
            {code.map((digit, i) => (
              <input
                key={i}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  const newCode = [...code];
                  newCode[i] = val;
                  setCode(newCode);
                  if (val && i < 5) {
                    const nextInput = document.querySelectorAll('.code-inputs input')[i + 1] as HTMLInputElement;
                    nextInput?.focus();
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && !digit && i > 0) {
                    const prevInput = document.querySelectorAll('.code-inputs input')[i - 1] as HTMLInputElement;
                    prevInput?.focus();
                  }
                }}
                disabled={loading}
              />
            ))}
          </div>
          <button type="submit" disabled={loading}>{loading ? 'Verificando...' : 'Confirmar'}</button>
          <div className="resend-container">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading || countdown > 0}
              className="btn-resend"
            >
              {countdown > 0 ? `Reenviar en ${countdown}s` : (resendLoading ? 'Enviando...' : 'Reenviar código')}
            </button>
          </div>
          <div className="links">
            <Link to="/login">Volver al inicio de sesión</Link>
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default VerifyCode;