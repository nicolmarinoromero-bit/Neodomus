import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import '@styles/login.css';
import fondoImg from '@assets/images/Fondo2.png';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

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
      
      {/* Contenedor principal con el fondo desenfocado */}
      <div className="login-page-wrapper">
        <div 
          className="login-background-layer" 
          style={{ backgroundImage: `url(${fondoImg})` }} 
        />

        <form onSubmit={handleSubmit} className="login-card">
          
          {/* Avatar Icon Superior */}
          <div className="login-avatar-container">
            <div className="login-avatar-circle">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ffd700" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          </div>

          <h2>Iniciar sesión</h2>
          <p className="welcome-text">Bienvenido de nuevo a <span className="brand-gold">NEODOMUS</span></p>

          {error && <div className="error-message">{error}</div>}
          
          {/* Input de Correo */}
          <div className="login-input-wrapper">
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

          {/* Input de Contraseña */}
<div className="login-input-wrapper">
  <input
    type={showPassword ? 'text' : 'password'}
    placeholder="Contraseña"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
  />
  <button
    type="button"
    className="login-password-toggle"
    onClick={() => setShowPassword(!showPassword)}
  >
    {/* Icono SVG que podemos pintar de blanco */}
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {showPassword ? (
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
      ) : (
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      )}
    </svg>
  </button>
</div>

          <button type="submit" className="btn-login-submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>

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

          <div className="login-divider">
            <div className="divider-circle"></div>
          </div>

          <div className="register-redirect-section">
            <span>¿No tienes una cuenta?</span>
            <Link to="/register" className="register-gold-link">Registrarse</Link>
          </div>

        </form>
      </div>
      
    </>
  );
};

export default Login;