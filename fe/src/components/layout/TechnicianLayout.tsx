import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import AmbientBackground from './AmbientBackground';
import TechnicianNavbar from './TechnicianNavbar';
import TechnicianSidebar from './TechnicianSidebar';
import AdminFooter from './AdminFooter';
import '@styles/admin-panel.css';

const TechnicianLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const cerrarSidebar = () => setSidebarOpen(false);

  return (
    <div className="admin-layout">
      <AmbientBackground />

      <TechnicianNavbar onMenuToggle={() => setSidebarOpen((v) => !v)} />

      <div className="admin-body">
        <div
          className={`admin-backdrop ${sidebarOpen ? 'show' : ''}`}
          onClick={cerrarSidebar}
          aria-hidden="true"
        />

        <TechnicianSidebar open={sidebarOpen} onNavigate={cerrarSidebar} />

        <main className="admin-content">
          <Outlet />
        </main>
      </div>

      <AdminFooter />
    </div>
  );
};

export default TechnicianLayout;
