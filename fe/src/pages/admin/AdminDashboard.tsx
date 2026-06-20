import { motion, Variants } from 'framer-motion';
import '@styles/dashboard-admin.css';
import {
  FiBox,
  FiCalendar,
  FiHeadphones,
  FiUser,
  FiFileText
} from "react-icons/fi";

// Importación de imágenes
import fondo2 from '@assets/images/Fondo2.png';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const AdminDashboard = () => {
  return (
    <>
      <div className="admin-bg-layer" style={{ backgroundImage: `url(${fondo2})` }} />
      <motion.section
  className="admin-container"
  initial="hidden"
  animate="visible"
  variants={containerVariants}
>
  <div className="welcome-banner">

    <div className="welcome-content">

      <h1>
        ¡Bienvenido, <span>Administrador</span>!
      </h1>

      <p>
        Gestiona los servicios, productos y soporte de la
        plataforma desde un solo lugar.
      </p>

    </div>


  </div>

  <div className="novedades-card">

    <h2>Novedades</h2>

    <div className="novedad-item">

  <div className="novedad-left">

    <div className="icon-circle">
      <FiBox />
    </div>

    <div>
      <h3>Nuevo producto agregado</h3>
      <p>Cámara Inteligente HD</p>
    </div>

  </div>

  <span>Hace 1 hora</span>

</div>

    <div className="novedad-item">

  <div className="novedad-left">

    <div className="icon-circle">
      <FiCalendar />
    </div>

    <div>
      <h3>Instalación programada</h3>
      <p>18 de junio - 9:00 AM</p>
    </div>

  </div>

  <span>Hace 2 horas</span>

</div>

    <div className="novedad-item">

  <div className="novedad-left">

    <div className="icon-circle">
      <FiHeadphones />
    </div>

    <div>
      <h3>Nuevo caso de soporte</h3>
      <p>Cliente reporta falla de conexión</p>
    </div>

  </div>

  <span>Hace 3 horas</span>

</div>

    <div className="novedad-item">

  <div className="novedad-left">

    <div className="icon-circle">
      <FiUser />
    </div>

    <div>
      <h3>Nuevo técnico registrado</h3>
      <p>Carlos Ramírez</p>
    </div>

  </div>

  <span>Hace 5 horas</span>

</div>
    <div className="novedad-item">

  <div className="novedad-left">

    <div className="icon-circle">
      <FiFileText />
    </div>

    <div>
      <h3>Nuevo pedido recibido</h3>
      <p>Pedido #0254</p>
    </div>

  </div>

  <span>Hace 6 horas</span>

</div>

  </div>

</motion.section>
    </>
  );
};

export default AdminDashboard;