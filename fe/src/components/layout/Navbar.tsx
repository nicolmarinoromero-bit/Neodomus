import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import { useAuthModal } from "@contexts/AuthModalContext";
import { useCart } from "@contexts/CartContext";
import { useState, useRef, useEffect } from "react";
import { FaRightFromBracket, FaCartShopping, FaBell } from "react-icons/fa6";
import { getAvatar } from "@utils/profileStorage";

import logo from "@assets/images/Logo.jpg";
import helpIcon from "@assets/images/Icono.png";
import perfilIcon from "@assets/images/perfil.png";

import "../../styles/navbar.css";

const Navbar = () => {
  const { user, rol, logout } = useAuth();
  const { openAuth } = useAuthModal();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [avatar, setAvatar] = useState<string>(perfilIcon);

  const getPerfilPath = () => {
    if (rol === "cliente") return "/perfil";
    if (rol === "administrador") return "/perfil/admin";
    return "/perfil/tecnico";
  };

  useEffect(() => {
    const savedAvatar = getAvatar();
    if (savedAvatar) setAvatar(savedAvatar);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setShowDropdown(false);
  };

  const nombreCompleto = user?.nombre || 'Usuario';
  const esFemenino = nombreCompleto.toLowerCase().endsWith('a') || false;

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="neodomus-header">
      <header>
        <div className="navbar">

          {/* Logo - Solo el logo principal */}
          <div className="logo">
            <Link to="/home">
              <img src={logo} alt="Logo Neodomus" />
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
                    <Link to="/productos">Productos</Link>
                    <Link to="/cliente/tecnicos">Técnicos</Link>
                    <Link to="/cliente/citas">Citas</Link>
                    <Link to="/cliente/ayuda">Ayuda</Link>
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
            <button
              type="button"
              className="notif-button"
              onClick={() => navigate('/notificaciones')}
              aria-label="Notificaciones"
              title="Ver notificaciones"
            >
              <FaBell className="notif-icon" />
            </button>

            <button
              type="button"
              className="cart-button"
              onClick={() => navigate('/carrito')}
              aria-label="Carrito de compras"
              title="Ver carrito"
            >
              <FaCartShopping className="cart-icon" />
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </button>

            {!rol ? (
              <>
                <button type="button" className="btn-register" onClick={() => openAuth('registro')}>
                  Registrarse
                </button>

                <button type="button" className="btn-login" onClick={() => openAuth('ingresar')}>
                  Iniciar sesión
                </button>
              </>
            ) : (
              <div className="user-menu" ref={dropdownRef}>
                <div className="user-welcome" onClick={toggleDropdown}>
                  <div className="welcome-text">
                    <span className="welcome-greeting">{esFemenino ? 'Bienvenida' : 'Bienvenido'}</span>
                    <span className="welcome-name">{nombreCompleto}</span>
                  </div>
                  <img
                    src={avatar}
                    alt={`Perfil de ${nombreCompleto}`}
                    className="user-avatar"
                  />
                </div>

                {showDropdown && (
                  <div className="user-dropdown">
                    <Link to={getPerfilPath()} className="dropdown-item" onClick={() => setShowDropdown(false)}>
                      Mi perfil
                    </Link>
                    <button type="button" className="dropdown-item dropdown-logout" onClick={handleLogout}>
                      <FaRightFromBracket /> Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </header>
    </div>
  );
};

export default Navbar;