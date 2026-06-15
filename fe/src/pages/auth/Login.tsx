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
          <h2>Iniciar sesión</h2>
          {error && <div className="error">{error}</div>}
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            autoComplete="email"
          />
          <div className="password-input-wrapper">
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
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                  <line x1="21" y1="3" x2="3" y2="21" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
          <div className="links">
            <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
            <Link to="/register">Registrarse</Link>
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default Login;