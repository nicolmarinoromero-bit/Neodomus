import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import {
  FiHome,
  FiCalendar,
  FiClock,
  FiUsers,
  FiMessageSquare,
  FiLogOut
} from "react-icons/fi";

import "../../styles/technicician-sidebar.css";

const TechnicalSidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const links = [
    {
      to: "/dashboard/tecnico",
      icon: <FiHome />,
      label: "Inicio"
    },
    {
      to: "/tecnico/citas",
      icon: <FiCalendar />,
      label: "Mis citas"
    },
    {
      to: "/tecnico/historial",
      icon: <FiClock />,
      label: "Historial"
    },
    {
      to: "/tecnico/clientes",
      icon: <FiUsers />,
      label: "Clientes"
    },
    {
      to: "/tecnico/mensajes",
      icon: <FiMessageSquare />,
      label: "Mensajes"
    }
  ];

  return (
    <aside className="admin-sidebar">
      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar-icon">
              {link.icon}
            </span>

            <span className="sidebar-label">
              {link.label}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-divider" />

      <button
        className="sidebar-logout"
        onClick={handleLogout}
      >
        <FiLogOut />
        <span>Cerrar sesión</span>
      </button>
    </aside>
  );
};

export default TechnicalSidebar;