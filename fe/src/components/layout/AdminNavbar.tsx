import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaBell, FaChevronDown, FaRightFromBracket, FaUserPen } from 'react-icons/fa6';
import { useAuth } from '@contexts/AuthContext';
import logo from '@assets/images/Logo.jpg';
import defaultPerfil from '@assets/images/perfil.png';
import "../../styles/admin-navbar.css";

interface AdminNavbarProps {
  onMenuToggle: () => void;
  pendientes: number;
}

const AdminNavbar = ({ onMenuToggle, pendientes }: AdminNavbarProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const handler = () => forceUpdate(v => v + 1);
    window.addEventListener('admin-profile-updated', handler);
    return () => window.removeEventListener('admin-profile-updated', handler);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const avatar = localStorage.getItem('adminAvatar') || defaultPerfil;
  const userData = (() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          nombre: parsed.nombre || 'Administrador',
          correo: parsed.correo || 'admin@neodomus.com',
        };
      }
    } catch {}
    return { nombre: 'Administrador', correo: 'admin@neodomus.com' };
  })();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="admin-navbar">
      <div className="anr-inner">
        <button
          type="button"
          className="anr-menu-btn"
          onClick={onMenuToggle}
          aria-label="Abrir menú"
          title="Abrir menú"
        >
          <FaBars />
        </button>

        <Link to="/dashboard/admin" className="anr-brand" title="Panel de administración">
          <img src={logo} alt="NeoDomus" />
          <div>
            <span className="anr-brand-name">NEODOMUS</span>
            <span className="anr-brand-sub">Administrador</span>
          </div>
        </Link>

        <div className="anr-spacer" />

        <div className="anr-actions">
          <Link
            to="/admin/notificaciones"
            className="anr-icon-btn"
            aria-label="Notificaciones"
            title="Notificaciones"
          >
            <FaBell />
            {pendientes > 0 && <span className="anr-badge">{pendientes}</span>}
          </Link>

          <span className="anr-sep" />

          <div className="anr-profile" ref={dropdownRef}>
            <button
              type="button"
              className={`anr-user-btn ${open ? 'open' : ''}`}
              onClick={() => setOpen(v => !v)}
              aria-expanded={open}
              aria-label="Menú de perfil"
            >
              <img src={avatar} alt={`Perfil de ${userData.nombre}`} className="anr-avatar" />
              <span className="anr-user-info">
                <span className="anr-user-name">{userData.nombre}</span>
                <span className="anr-user-role">Administrador</span>
              </span>
              <FaChevronDown className="anr-chevron" />
            </button>

            <div className={`anr-dropdown ${open ? 'open' : ''}`}>
              <div className="anr-dd-head">
                <div className="anr-dd-name">{userData.nombre}</div>
                <div className="anr-dd-mail">{userData.correo}</div>
              </div>
              <Link to="/perfil/admin" className="anr-dd-item" onClick={() => setOpen(false)}>
                <FaUserPen /> Editar perfil
              </Link>
              <div className="anr-dd-sep" />
              <button type="button" className="anr-dd-item danger" onClick={handleLogout}>
                <FaRightFromBracket /> Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;