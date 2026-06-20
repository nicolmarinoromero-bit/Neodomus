import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "@assets/images/Logo.jpg";
import defaultPerfil from "@assets/images/perfil.png";
import "../../styles/admin-navbar.css";

const AdminNavbar = () => {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const handler = () => forceUpdate(v => v + 1);
    window.addEventListener('admin-profile-updated', handler);
    return () => window.removeEventListener('admin-profile-updated', handler);
  }, []);

  const avatar = localStorage.getItem('adminAvatar') || defaultPerfil;
  const userName = (() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) return JSON.parse(stored).nombre || 'Administrador';
    } catch {}
    return 'Administrador';
  })();

  return (
    <header className="admin-navbar">
      {/* Logo */}
      <div className="navbar-logo">
        <img src={logo} alt="NeoDomus" />

        <div className="logo-text">
          <h2>NEODOMUS</h2>
          <span>ADMINISTRADOR</span>
        </div>
      </div>

      {/* Parte derecha */}
      <div className="navbar-content">
        <div className="navbar-left">
          <button className="menu-btn">
            ☰
          </button>

          <div className="search-box">
            <input
              type="text"
              placeholder="Buscar..."
            />
          </div>
        </div>

        <div className="navbar-right">
          <div className="notification">
            🔔
            <span className="badge">3</span>
          </div>

          <Link to="/perfil/admin" className="profile-section">
            <img
              src={avatar}
              alt="Perfil"
              className="profile-image"
            />

            <div className="profile-info">
              <h4>{userName}</h4>
              <span>Admin</span>
            </div>

            <span className="arrow">⌄</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;