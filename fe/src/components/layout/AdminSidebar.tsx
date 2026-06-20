import { NavLink } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  FiHome, FiBox, FiTag, FiUser, FiTool,
  FiHeadphones, FiUsers, FiBarChart2, FiSettings, FiLogOut
} from "react-icons/fi";
import "../../styles/admin-sidebar.css";

const AdminSidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const links = [
    { to: "/dashboard/admin", icon: <FiHome />, label: "Inicio" },
    { to: "/admin/productos", icon: <FiBox />, label: "Productos" },
    { to: "/admin/catalogo", icon: <FiTag />, label: "Catálogo" },
    { to: "/admin/tecnicos", icon: <FiUser />, label: "Técnicos" },
    { to: "/admin/instalaciones", icon: <FiTool />, label: "Instalaciones" },
    { to: "/admin/soporte", icon: <FiHeadphones />, label: "Soporte" },
    { to: "/admin/clientes", icon: <FiUsers />, label: "Clientes" },
    { to: "/admin/reportes", icon: <FiBarChart2 />, label: "Reportes" },
    { to: "/admin/configuracion", icon: <FiSettings />, label: "Configuración" },
  ];

  return (
    <aside className="admin-sidebar">
      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          >
            <span className="sidebar-icon">{link.icon}</span>
            <span className="sidebar-label">{link.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-divider" />
      <button className="sidebar-logout" onClick={handleLogout}>
        <FiLogOut />
        <span>Cerrar sesión</span>
      </button>
    </aside>
  );
};

export default AdminSidebar;