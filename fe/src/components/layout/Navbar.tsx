import { Link } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";

import logo from "@assets/images/Logo.jpg";
import helpIcon from "@assets/images/Icono.png";
import perfilIcon from "@assets/images/perfil.png";

import "../../styles/navbar.css";

const Navbar = () => {
  const { rol } = useAuth();

  const getPerfilPath = () => {
    if (rol === "cliente") return "/perfil/cliente";
    if (rol === "administrador") return "/perfil/admin";
    return "/perfil/tecnico";
  };

  return (
    <div className="neodomus-header">
      <header>
        <div className="navbar">

          {/* Logo */}
          <div className="logo">
            <Link to="/">
              <img src={logo} alt="Logo Neodomus" />
            </Link>

            <Link to="/" className="brand-name">
              NeoDomus
            </Link>
          </div>

          {/* Menú */}
          <nav className="menu">
            {!rol ? (
              <>
                <Link to="/productos">Productos</Link>
                <Link to="/info">Sobre nosotros</Link>

                <Link to="/ayuda" className="icon-link">
                  Ayuda
                  <img src={helpIcon} alt="Ayuda" />
                </Link>
              </>
            ) : (
              <>
                {rol === "cliente" && (
                  <>
                    <Link to="/dashboard/cliente">Inicio</Link>
                    <Link to="/productos">Productos</Link>
                    <Link to="/cliente/Tecnicos">Técnicos</Link>
                    <Link to="/cliente/citas">Citas</Link>
                    <Link to="/cliente/Ayuda">Ayuda</Link>
                  </>
                )}

                {rol === "administrador" && (
                  <>
                    <Link to="/dashboard/admin">Inicio</Link>
                    <Link to="/admin/usuarios">Usuarios</Link>
                    <Link to="/admin/ventas">Ventas</Link>
                    <Link to="/admin/productos">Productos</Link>
                  </>
                )}

                {rol === "tecnico" && (
                  <>
                    <Link to="/dashboard/tecnico">Inicio</Link>
                    <Link to="/tecnico/citas">Citas</Link>
                    <Link to="/tecnico/servicios">Servicios</Link>
                  </>
                )}
              </>
            )}
          </nav>

          {/* Parte derecha */}
          <div className="nav-right">
            {!rol ? (
              <>
                <Link className="btn-register" to="/register">
                  Registrarse
                </Link>

                <Link className="btn-login" to="/login">
                  Iniciar sesión
                </Link>
              </>
            ) : (
              <Link to={getPerfilPath()} className="perfil-link">
                <span>Mi perfil</span>
                <img src={perfilIcon} alt="Perfil" />
              </Link>
            )}
          </div>

        </div>
      </header>
    </div>
  );
};

export default Navbar;