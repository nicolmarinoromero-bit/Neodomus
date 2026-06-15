import { Link } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import Navbar from '@components/layout/Navbar';
import Footer from '@components/layout/Footer';
import '@styles/dashboard-admin.css';

// Importación de imágenes
import carritoIcon from '@assets/images/carrito.png';
import ideaIcon from '@assets/images/idea.png';
import herramientasIcon from '@assets/images/herramientas.png';
import horarioIcon from '@assets/images/horario.png';
import tecnico1Img from '@assets/images/tecnico1.png';
import tecnico2Img from '@assets/images/tecnico2.png';
import fondo2 from '@assets/images/Fondo2.png';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" as const } }
};

const AdminDashboard = () => {
  return (
    <>
      <Navbar />
      <motion.section 
        className="admin-container" 
        style={{ backgroundImage: `url(${fondo2})` }}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.h1 variants={itemVariants}>Bienvenido Administrador</motion.h1>

        <motion.div className="grid-top" variants={containerVariants}>
          {[
            { icon: carritoIcon, title: 'Ventas', val: '$ 15M', sub: '8 ventas', to: '/admin/ventas' },
            { icon: ideaIcon, title: 'Productos', val: '24', sub: 'Activos', to: '/admin/productos' },
            { icon: horarioIcon, title: 'Citas', val: '5', sub: 'Pendientes', to: '/admin/citas' },
            { icon: herramientasIcon, title: 'Técnicos', val: '25', sub: 'Activos', to: '/admin/tecnicos' }
          ].map((item, i) => (
            <motion.div key={i} className="card" variants={itemVariants}>
              <Link to={item.to} className="btn-arrow">➜</Link>
              <div className="card-img-box"><img src={item.icon} alt={item.title} /></div>
              <div className="card-text">
                <h3>{item.title}</h3>
                <p className="big">{item.val}</p>
                <span>{item.sub}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="dashboard-grid-main">
          <motion.div variants={containerVariants}>
            <section className="admin-actions">
              <h2>Gestión rápida</h2>
              <div className="grid-inv">
                <div className="inv-card"><Link to="/admin/registrar-tecnico">➕ Registrar técnico</Link></div>
                <div className="inv-card"><Link to="/admin/descuentos">🏷️ Descuentos</Link></div>
                <div className="inv-card"><Link to="/admin/tecnicos">👥 Técnicos</Link></div>
              </div>
            </section>
            <section className="inventario">
              <h2>Inventario</h2>
              <div className="grid-inv">
                {['124 Total', '35 Stock', '3 Bajo Stock'].map((text, i) => (
                  <div key={i} className="inv-card">{text} <Link to="/admin/inventario">➜</Link></div>
                ))}
              </div>
            </section>
          </motion.div>

          <motion.aside className="side" variants={itemVariants}>
            <h2>Técnicos</h2>
            <div className="tech"><img src={tecnico1Img} alt="T1" /> <div><h4>MARIA PEREZ</h4><span>Instalación</span></div></div>
            <div className="tech"><img src={tecnico2Img} alt="T2" /> <div><h4>JOSE GONZALES</h4><span>Mantenimiento</span></div></div>
            <hr className="divider"/>
            <h2>Citas próximas</h2>
            <div className="cita-linea"><span className="hora">4:00 PM</span> <span>Adriana Torres</span></div>
            <div className="cita-linea"><span className="hora">11:00 AM</span> <span>Alejandro Lopez</span></div>
            <Link to="/admin/citas" className="ver-mas">Ver todas las citas ➜</Link>
          </motion.aside>
        </div>
      </motion.section>
      <Footer />
    </>
  );
};

export default AdminDashboard;