// src/components/layout/Navbar.tsx
import { Link } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import logo from '@assets/images/Logo.jpg';
import helpIcon from '@assets/images/Icono.png';
import perfilIcon from '@assets/images/perfil.png';
import '@styles/navbar.css';

const Navbar = () => {
  const { rol } = useAuth();

  // Ruta de perfil según rol
  const getPerfilPath = () => {
    if (rol === 'cliente') return '/perfil/cliente';
    if (rol === 'administrador') return '/perfil/admin';
    return '/perfil/tecnico';
  };

  // Navbar público (no autenticado)
  if (!rol) {
    return (
      <header>
        <div className="navbar">
          <div className="logo">
            <Link to="/"><img src={logo} alt="Logo Neodomus" /></Link>
          </div>
          <nav className="menu">
            <Link to="/productos">Productos</Link>
            <Link to="/info">Sobre nosotros</Link>
            <Link to="/ayuda" className="icon-link">
              Ayuda <img src={helpIcon} alt="ayuda" />
            </Link>
          </nav>
          <div className="nav-right">
            <Link to="/register">Registrarse</Link>
            <Link to="/login">Iniciar sesión</Link>
          </div>
        </div>
      </header>
    );
  }

  // Navbar autenticado (sin enlace a cambiar contraseña)
  return (
    <header>
      <div className="navbar">
        <div className="logo">
          <Link to="/"><img src={logo} alt="Logo Neodomus" /></Link>
        </div>
        <nav className="menu">
          {rol === 'cliente' && (
            <>
              <Link to="/dashboard/cliente">Productos</Link>
              <Link to="/cliente/Tecnicos">Técnicos</Link>
              <Link to="/cliente/citas">Citas</Link>
              <Link to="/cliente/agendar-cita">Agendar cita</Link>
              <Link to="/cliente/mis-compras">Mis compras</Link>
              <Link to="/cliente/Ayuda">Ayuda</Link>
            </>
          )}
          {rol === 'administrador' && (
            <>
              <Link to="/dashboard/admin">Inicio</Link>
              <Link to="/admin/Ventas">Ventas</Link>
              <Link to="/admin/inventarios">Inventario</Link>
              <Link to="/admin/registrar-tecnico">Técnicos</Link>
            </>
          )}
          {rol === 'tecnico' && (
            <>
              <Link to="/dashboard/tecnico">Inicio</Link>
              <Link to="/tecnico/disponibilidad">Citas realizadas</Link>
              <Link to="/tecnico/evidencias">Evidencias</Link>
              <Link to="/tecnico/ruta">Rutas</Link>
              <Link to="/tecnico/pagos">Pagos</Link>
            </>
          )}
          {/* El enlace a "Cambiar contraseña" se ha eliminado porque estará en la página de perfil */}
        </nav>
        <div className="nav-right">
          <Link to={getPerfilPath()} className="perfil-link">
            <span>Mi perfil</span>
            <img src={perfilIcon} alt="perfil" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;