import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "@assets/images/Logo.jpg";
import defaultPerfil from "@assets/images/perfil.png";
import "../../styles/technician-navbar.css";

const TechnicalNavbar = () => {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const handler = () => forceUpdate(v => v + 1);
    window.addEventListener('technical-profile-updated', handler);

    return () =>
      window.removeEventListener(
        'technical-profile-updated',
        handler
      );
  }, []);

  const avatar =
    localStorage.getItem('technicalAvatar') ||
    defaultPerfil;

  const userName = (() => {
    try {
      const stored = localStorage.getItem('user');

      if (stored) {
        return (
          JSON.parse(stored).nombre ||
          'Técnico'
        );
      }
    } catch {}

    return 'Técnico';
  })();

  return (
    <header className="admin-navbar">

      <div className="navbar-logo">
        <img src={logo} alt="NeoDomus" />

        <div className="logo-text">
          <h2>NEODOMUS</h2>
          <span>TÉCNICO</span>
        </div>
      </div>

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

          <Link
            to="/perfil/tecnico"
            className="profile-section"
          >
            <img
              src={avatar}
              alt="Perfil"
              className="profile-image"
            />

            <div className="profile-info">
              <h4>{userName}</h4>
              <span>Técnico</span>
            </div>

            <span className="arrow">
              ⌄
            </span>
          </Link>

        </div>

      </div>

    </header>
  );
};

export default TechnicalNavbar;