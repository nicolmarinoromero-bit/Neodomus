import { useAuth } from '@contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '@components/layout/Navbar';
import Footer from '@components/layout/Footer';
import '@styles/perfil.css';
import fondoImg from '@assets/images/Fondo2.png';

const TecnicoPerfil = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <Navbar />
      <div className="perfil-container" style={{ backgroundImage: `url(${fondoImg})` }}>
        <div className="perfil-card">
          <h2>Mi perfil (Técnico)</h2>
          <div className="perfil-info">
            <p><strong>Nombre:</strong> {user?.nombre || 'Técnico'}</p>
            <p><strong>Correo:</strong> {user?.correo || ''}</p>
            <p><strong>Rol:</strong> {user?.rol || 'tecnico'}</p>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            Cerrar sesión
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TecnicoPerfil;