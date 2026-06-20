import perfilIcon from '@assets/images/perfil.png';
import '@styles/perfil.css';
import fondoImg from '@assets/images/Fondo2.png';


const AdminPerfil = () => {
  return (
    <div
      className="perfil-page"
      style={{ backgroundImage: `url(${fondoImg})` }}
    >
      <div className="perfil-header">
        <h1>Mi Perfil</h1>
        <p>Gestiona tu información personal.</p>
      </div>

      <div className="perfil-grid">

        <div className="perfil-card-left">

          <div className="perfil-avatar-section">

            <div className="perfil-avatar-wrapper">
              <img
                src={perfilIcon}
                alt="Perfil"
                className="perfil-avatar"
              />

              <button className="edit-avatar">
                ✎
              </button>
            </div>

            <h2>Administrador</h2>

            <span className="perfil-email">
              admin@neodomus.com
            </span>

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
              value="Administrador"
            />
          </div>

          <div className="form-group">
            <label>Correo electrónico</label>
            <input
              type="email"
              value="admin@neodomus.com"
            />
          </div>

          <div className="form-group">
            <label>Teléfono</label>
            <input
              type="text"
              value="+57 300 123 4567"
            />
          </div>

          <div className="form-group">
            <label>Rol</label>
            <input
              type="text"
              value="Administrador"
  
            />
          </div>

          <button className="guardar-btn">
            Guardar cambios
          </button>

        </div>

      </div>
    </div>
  );
};

export default AdminPerfil;