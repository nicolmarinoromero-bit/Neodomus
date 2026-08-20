import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '@services/api';
import type { SolicitudCuenta } from '../../types';
import AmbientBackground from './AmbientBackground';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';
import AdminFooter from './AdminFooter';
import '@styles/admin-panel.css';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendientes, setPendientes] = useState(0);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.get<SolicitudCuenta[]>('/admin/account-requests');
        setPendientes(res.data.filter((s) => s.estado === 'pendiente').length);
      } catch {
        setPendientes(0);
      }
    };
    cargar();
    window.addEventListener('admin-solicitudes-updated', cargar);
    return () => window.removeEventListener('admin-solicitudes-updated', cargar);
  }, []);

  const cerrarSidebar = () => setSidebarOpen(false);

  return (
    <div className="admin-layout">
      <AmbientBackground />

      <AdminNavbar onMenuToggle={() => setSidebarOpen((v) => !v)} pendientes={pendientes} />

      <div className="admin-body">
        <div
          className={`admin-backdrop ${sidebarOpen ? 'show' : ''}`}
          onClick={cerrarSidebar}
          aria-hidden="true"
        />
        <AdminSidebar
          open={sidebarOpen}
          pendientes={pendientes}
          onNavigate={cerrarSidebar}
        />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>

      <AdminFooter />
    </div>
  );
};

export default AdminLayout;
