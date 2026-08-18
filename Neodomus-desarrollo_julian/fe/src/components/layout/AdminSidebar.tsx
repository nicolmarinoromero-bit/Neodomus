import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import {
  FaHouse,
  FaBell,
  FaTags,
  FaUserGear,
  FaCalendarCheck,
  FaEnvelopeOpenText,
  FaUsers,
  FaChartColumn,
  FaGear,
  FaRightFromBracket,
  FaUserShield,
  FaTruckField,
} from "react-icons/fa6";
import "../../styles/admin-sidebar.css";

interface AdminSidebarProps {
  open: boolean;
  pendientes: number;
  onNavigate?: () => void;
}

interface Seccion {
  titulo: string;
  links: { to: string; icon: React.ReactNode; label: string; badge?: number }[];
}

const AdminSidebar = ({ open, pendientes, onNavigate }: AdminSidebarProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const secciones: Seccion[] = [
    {
      titulo: "Panel",
      links: [
        { to: "/dashboard/admin", icon: <FaHouse />, label: "Inicio" },
        {
          to: "/admin/notificaciones",
          icon: <FaBell />,
          label: "Notificaciones",
          badge: pendientes,
        },
      ],
    },
    {
      titulo: "Gestión",
      links: [
        { to: "/admin/catalogo", icon: <FaTags />, label: "Catálogo" },
        { to: "/admin/tecnicos", icon: <FaUserGear />, label: "Técnicos" },
        { to: "/admin/instalaciones", icon: <FaCalendarCheck />, label: "Citas" },
        { to: "/admin/clientes", icon: <FaUsers />, label: "Clientes" },
        { to: "/admin/proveedores", icon: <FaTruckField />, label: "Proveedores" },
      ],
    },
    {
      titulo: "Sistema",
      links: [
        { to: "/admin/consultas", icon: <FaEnvelopeOpenText />, label: "Solicitudes" },
        { to: "/admin/reportes", icon: <FaChartColumn />, label: "Reportes" },
        { to: "/admin/configuracion", icon: <FaGear />, label: "Configuración" },
        { to: "/perfil/admin", icon: <FaUserShield />, label: "Mi perfil" },
      ],
    },
  ];

  return (
    <aside className={`admin-sidebar ${open ? 'open' : ''}`}>
      <nav className="sidebar-nav" aria-label="Menú de administración">
        {secciones.map((seccion) => (
          <div key={seccion.titulo}>
            <span className="sidebar-section-title">{seccion.titulo}</span>
            {seccion.links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onNavigate}
                className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
              >
                <span className="sidebar-icon">{link.icon}</span>
                <span className="sidebar-label">{link.label}</span>
                {link.badge ? <span className="sidebar-badge">{link.badge}</span> : null}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-divider" />

      <button className="sidebar-logout" onClick={handleLogout}>
        <FaRightFromBracket />
        <span>Cerrar sesión</span>
      </button>
    </aside>
  );
};

export default AdminSidebar;