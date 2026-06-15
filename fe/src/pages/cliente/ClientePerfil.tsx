import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '@components/layout/Navbar';
import Footer from '@components/layout/Footer';
import '@styles/perfil.css';
import fondoImg from '@assets/images/Fondo2.png';

const ClientePerfil = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('perfil');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const clienteData = {
    nombre: user?.nombre || 'Nombre Apellido',
    correo: user?.correo || 'correo@ejemplo.com',
    telefono: '300 123 4567',
    direccion: 'KR 189 A BIS # 89B - 70'
  };

  const menuItems = [
    { id: 'perfil', label: 'Editar Perfil', icon: '✏️' },
    { id: 'pedidos', label: 'Pedidos', icon: '📦' },
    { id: 'mensajes', label: 'Mensajes', icon: '💬' },
    { id: 'reseñas', label: 'Reseñas', icon: '⭐' },
    { id: 'tecnicos', label: 'Técnicos', icon: '🔧' },
    { id: 'pagos', label: 'Métodos de pago', icon: '💳' },
    { id: 'idioma', label: 'Idioma', icon: '🌐' },
    { id: 'notificaciones', label: 'Notificaciones', icon: '🔔' },
    { id: 'Cambiar contraseña', label: 'Cambiar contraseña', icon: '🔑' },
  ];

  return (
    <>
      <Navbar />
      <div className="perfil-container" style={{ backgroundImage: `url(${fondoImg})` }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="perfil-wrapper"
        >
          {/* Sidebar */}
          <aside className="perfil-sidebar">
            <div className="perfil-avatar">
              <div className="avatar-circle">👤</div>
              <h3>Mi cuenta</h3>
            </div>
            <nav className="perfil-menu">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  className={`menu-item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <span className="menu-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
              <button 
                className="menu-item" 
                onClick={handleLogout} 
                style={{ marginTop: '20px', color: '#ff4d4d' }}
              >
                <span className="menu-icon">🚪</span>
                <span>Salir</span>
              </button>
            </nav>
          </aside>

          {/* Main content */}
          <main className="perfil-main">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'perfil' ? (
                  <div className="perfil-info-card">
                    <h2>Editar Perfil</h2>
                    <div className="info-field">
                      <label>Nombre y Apellidos:</label>
                      <p>{clienteData.nombre}</p>
                    </div>
                    <div className="info-field">
                      <label>Correo Electrónico:</label>
                      <p>{clienteData.correo}</p>
                    </div>
                    <div className="info-field">
                      <label>Número de Teléfono:</label>
                      <p>{clienteData.telefono}</p>
                    </div>
                    <div className="info-field">
                      <label>Dirección:</label>
                      <p>{clienteData.direccion}</p>
                    </div>
                  </div>
                ) : (
                  <div className="placeholder-content">
                    <h2>{menuItems.find(i => i.id === activeTab)?.label}</h2>
                    <p>Módulo en construcción...</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </motion.div>
      </div>
      <Footer />
    </>
  );
};

export default ClientePerfil;