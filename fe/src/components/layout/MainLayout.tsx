import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const MainLayout = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        {/* El Outlet renderiza la página que corresponda según la ruta */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;