// src/pages/auth/Register.tsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '@services/api';
import Navbar from '@components/layout/Navbar';
import Footer from '@components/layout/Footer';
import '@styles/register.css';
import fondoImg from '@assets/images/Fondo2.png';   
import avatarImg from '@assets/images/registro.jpeg';    

interface FormData {
  nombre: string;
  apellido: string;
  tipo_documento: number;
  documento: string;
  telefono: string;
  direccion: string;
  correo: string;
  contraseña: string;
}

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    nombre: '', apellido: '', tipo_documento: 1, documento: '', telefono: '',
    direccion: '', correo: '', contraseña: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === 'contraseña') {
      setPasswordErrors({
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /\d/.test(value),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(value),
      });
    }
  };

  const validateForm = () => {
    const passwordValid = 
      passwordErrors.length &&
      passwordErrors.uppercase &&
      passwordErrors.lowercase &&
      passwordErrors.number &&
      passwordErrors.special;
    if (!passwordValid) {
      setError('La contraseña no cumple los requisitos. Revisa la lista.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.correo)) {
      setError('Correo electrónico inválido');
      return false;
    }
    if (formData.documento.length < 5 || isNaN(Number(formData.documento))) {
      setError('Documento inválido (mínimo 5 dígitos numéricos)');
      return false;
    }
    if (formData.telefono.length < 7 || isNaN(Number(formData.telefono))) {
      setError('Teléfono inválido (mínimo 7 dígitos)');
      return false;
    }
    if (formData.nombre.trim().length < 2 || formData.apellido.trim().length < 2) {
      setError('Nombre y apellido deben tener al menos 2 caracteres');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validateForm()) return;
    setLoading(true);
    try {
      await api.post('/auth/register/client', {
        first_name: formData.nombre,
        last_name: formData.apellido,
        email: formData.correo,
        password: formData.contraseña,
        id_tipo_documento_c: parseInt(formData.tipo_documento as any),
        documento_cliente: parseInt(formData.documento),
        telefono_cliente: parseInt(formData.telefono),
        address: formData.direccion,
      });
      setSuccess('Registro exitoso. Revisa tu correo para el código de verificación.');
      setTimeout(() => {
        navigate(`/verify-email?email=${encodeURIComponent(formData.correo)}`);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="register-container" style={{ backgroundImage: `url(${fondoImg})` }}>
        <form onSubmit={handleSubmit} className="register-form">
          <div className="avatar-header-container">
            <div className="avatar-circle">
              <img src={avatarImg} alt="Avatar" className="avatar-image" />
              <div className="avatar-plus-badge">+</div>
            </div>
          </div>

          <h2>Crear cuenta</h2>
          
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
          
          <div className="form-grid">
            <input name="nombre" placeholder="Nombre" onChange={handleChange} required disabled={loading} />
            <input name="apellido" placeholder="Apellido" onChange={handleChange} required disabled={loading} />
            
            <div className="select-wrapper">
              <select name="tipo_documento" onChange={handleChange} disabled={loading}>
                <option value="1">Seleccionar</option>
                <option value="2">CC</option>
                <option value="3">CE</option>
              </select>
            </div>

            <input name="documento" placeholder="Documento" onChange={handleChange} required disabled={loading} />
            <input name="telefono" placeholder="Teléfono" onChange={handleChange} required disabled={loading} />
            {/* 🔥 Dirección antes que correo */}
            <input name="direccion" placeholder="Dirección" onChange={handleChange} required disabled={loading} />
            <input name="correo" type="email" placeholder="Correo" onChange={handleChange} required disabled={loading} />
            
            <div className="password-input-wrapper">
              <input
                name="contraseña"
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                onChange={handleChange}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                    <line x1="21" y1="3" x2="3" y2="21"></line>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="password-requirements">
            <p className="requirement-title">La contraseña debe contener:</p>
            <ul>
              <li className={passwordErrors.length ? 'valid' : 'invalid'}>
                {passwordErrors.length ? '✓' : '✗'} Al menos 8 caracteres
              </li>
              <li className={passwordErrors.uppercase ? 'valid' : 'invalid'}>
                {passwordErrors.uppercase ? '✓' : '✗'} Al menos una mayúscula
              </li>
              <li className={passwordErrors.lowercase ? 'valid' : 'invalid'}>
                {passwordErrors.lowercase ? '✓' : '✗'} Al menos una minúscula
              </li>
              <li className={passwordErrors.number ? 'valid' : 'invalid'}>
                {passwordErrors.number ? '✓' : '✗'} Al menos un número
              </li>
              <li className={passwordErrors.special ? 'valid' : 'invalid'}>
                {passwordErrors.special ? '✓' : '✗'} Al menos un carácter especial (!@#$%^&*)
              </li>
            </ul>
          </div>
          
          <button type="submit" className="btn-register-submit" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
          
          <div className="links">
            <span>¿Ya tienes una cuenta? </span>
            <Link to="/login" className="login-accent-link">Iniciar Sesión</Link>
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default Register;