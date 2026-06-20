import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@contexts/AuthContext';
import api from '@services/api';
import perfilIcon from '@assets/images/perfil.png';
import '@styles/perfil.css';
import fondoImg from '@assets/images/Fondo2.png';

const AdminPerfil = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatar, setAvatar] = useState<string>(localStorage.getItem('adminAvatar') || perfilIcon);
  const [nombre, setNombre] = useState(user?.nombre || 'Administrador');
  const [email, setEmail] = useState(user?.correo || 'admin@neodomus.com');
  const [telefono, setTelefono] = useState('+57 300 123 4567');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (user) {
      setNombre(user.nombre || 'Administrador');
      setEmail(user.correo || '');
    }
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setAvatar(dataUrl);
        localStorage.setItem('adminAvatar', dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setMensaje('');
    try {
      await api.put('/users/me', {
        first_name: nombre.split(' ')[0],
        last_name: nombre.split(' ').slice(1).join(' ') || '',
        email,
        telefono_usuario: parseInt(telefono.replace(/\D/g, '')) || undefined,
      });
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        parsed.nombre = nombre;
        parsed.correo = email;
        localStorage.setItem('user', JSON.stringify(parsed));
      }
      window.dispatchEvent(new CustomEvent('admin-profile-updated'));
      setMensaje('Cambios guardados correctamente');
      setTimeout(() => setMensaje(''), 3000);
    } catch {
      setMensaje('Error al guardar. Intenta de nuevo.');
      setTimeout(() => setMensaje(''), 3000);
    }
  };

  return (
    <>
      <div className="perfil-bg-layer" style={{ backgroundImage: `url(${fondoImg})` }} />
      <div className="perfil-page">
        <div className="perfil-header">
          <h1>Mi Perfil</h1>
          <p>Gestiona tu información personal.</p>
        </div>

        {mensaje && <div className="perfil-toast">{mensaje}</div>}

        <div className="perfil-grid">

          <div className="perfil-card-left">

            <div className="perfil-avatar-section">

              <div className="perfil-avatar-wrapper">
                <img
                  src={avatar}
                  alt="Perfil"
                  className="perfil-avatar"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
                <button className="edit-avatar" onClick={() => fileInputRef.current?.click()}>
                  ✎
                </button>
              </div>

              <h2>Administrador</h2>

              <span className="perfil-email">{email}</span>

            </div>

            <div className="perfil-stats">

              <div className="stat-item">
                <h4>Fecha de registro</h4>
                <p>18 Junio 2024</p>
              </div>

              <div className="stat-item">
                <h4>Último acceso</h4>
                <p>Hoy 09:45 AM</p>
              </div>

              <div className="stat-item">
                <h4>Rol</h4>
                <p>Administrador</p>
              </div>

            </div>

          </div>

          <div className="perfil-card-right">

            <h2>Información Personal</h2>

            <div className="form-group">
              <label>Nombre completo</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Teléfono</label>
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Rol</label>
              <input
                type="text"
                value="Administrador"
                disabled
              />
            </div>

            <button className="guardar-btn" onClick={handleSave}>
              Guardar cambios
            </button>

          </div>

        </div>
      </div>
    </>
  );
};

export default AdminPerfil;