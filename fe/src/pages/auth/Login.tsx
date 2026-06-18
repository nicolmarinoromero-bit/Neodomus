import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import Navbar from '@components/layout/Navbar';
import Footer from '@components/layout/Footer';
import '@styles/login.css';
import fondoImg from '@assets/images/Fondo2.png';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user?.rol) {
      const rol = user.rol;
      if (rol === 'administrador' || rol === 'admin') {
        navigate('/dashboard/admin', { replace: true });
      } else if (rol === 'cliente') {
        navigate('/dashboard/cliente', { replace: true });
      } else if (rol === 'tecnico') {
        navigate('/dashboard/tecnico', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="login-container" style={{ backgroundImage: `url(${fondoImg})` }}>
        <form onSubmit={handleSubmit} className="login-form">
          
          {/* Avatar Icon Superior */}
          <div className="login-avatar-container">
            <div className="login-avatar-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="#ffd700" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          </div>

          <h2>Iniciar sesión</h2>
          <p className="welcome-text">Bienvenido de nuevo a <span className="brand-gold">NEODOMUS</span></p>

          {error && <div className="error-message">{error}</div>}
          
          {/* Input de Correo con Icono */}
          <div className="login-input-wrapper">
            <span className="input-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#ffd700" strokeWidth="1.5">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </span>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>

          {/* Input de Contraseña con Iconos */}
          <div className="login-input-wrapper">
            <span className="input-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#ffd700" strokeWidth="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="login-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                  <line x1="21" y1="3" x2="3" y2="21" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          {/* Botón de Ingreso Principal */}
          <button type="submit" className="btn-login-submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>

          {/* Opciones Intermedias: Recordarme & Olvido */}
          <div className="login-options-row">
            <label className="remember-me-label">
              <input 
                type="checkbox" 
                checked={rememberMe} 
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              <span>Recordarme</span>
            </label>
            <Link to="/forgot-password" className="forgot-password-link">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {/* Separador con Círculo Central */}
          <div className="login-divider">
            <div className="divider-circle"></div>
          </div>

          {/* Enlace Inferior para Registrarse */}
          <div className="register-redirect-section">
            <span className="no-account-text">¿No tienes una cuenta?</span>
            <Link to="/register" className="register-gold-link">Registrarse</Link>
          </div>

        </form>
      </div>
      <Footer />
    </>
  );
};

export default Login;