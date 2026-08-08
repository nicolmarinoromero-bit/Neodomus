import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaGear, FaArrowRight, FaUserShield, FaKey, FaGlobe } from 'react-icons/fa6';
import '@styles/admin-panel.css';
import '@styles/dashboard-admin.css';

const AdminConfiguracion = () => (
  <motion.section
    className="admin-panel"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="ap-header">
      <div>
        <h1 className="ap-title">Configuración</h1>
        <p className="ap-subtitle">Preferencias y ajustes del panel de administración de NeoDomus.</p>
      </div>
      <div className="ap-header-right">
        <span className="welcome-badge">
          <FaGear />
          Perfil y preferencias
        </span>
      </div>
    </div>

    <div className="ap-card">
      <div className="ap-card-head">
        <h2>
          <FaGear /> Ajustes disponibles
        </h2>
      </div>
      <div className="ap-grid">
        <Link to="/perfil/admin" className="ap-grid-item" style={{ textDecoration: 'none' }}>
          <div className="ap-grid-item-top">
            <div className="an-icon cuenta">
              <FaUserShield />
            </div>
            <span className="ap-badge ok">Listo</span>
          </div>
          <h3>Mi cuenta</h3>
          <p>Actualiza tu nombre, correo, teléfono y foto de perfil.</p>
          <span className="ap-btn ap-btn-ghost" style={{ marginTop: 'auto' }}>
            Editar perfil <FaArrowRight />
          </span>
        </Link>
        <Link to="/perfil/admin" className="ap-grid-item" style={{ textDecoration: 'none' }}>
          <div className="ap-grid-item-top">
            <div className="an-icon sistema">
              <FaKey />
            </div>
            <span className="ap-badge ok">Listo</span>
          </div>
          <h3>Seguridad</h3>
          <p>Cambia tu contraseña con los requisitos de seguridad de la plataforma.</p>
          <span className="ap-btn ap-btn-ghost" style={{ marginTop: 'auto' }}>
            Cambiar contraseña <FaArrowRight />
          </span>
        </Link>
        <Link to="/perfil/admin" className="ap-grid-item" style={{ textDecoration: 'none' }}>
          <div className="ap-grid-item-top">
            <div className="an-icon cita">
              <FaGlobe />
            </div>
            <span className="ap-badge ok">Listo</span>
          </div>
          <h3>Idioma</h3>
          <p>Selecciona el idioma de la interfaz: español o inglés.</p>
          <span className="ap-btn ap-btn-ghost" style={{ marginTop: 'auto' }}>
            Elegir idioma <FaArrowRight />
          </span>
        </Link>
      </div>
    </div>
  </motion.section>
);

export default AdminConfiguracion;