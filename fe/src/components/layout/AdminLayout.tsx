import { Outlet } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import Footer from './Footer';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh'
      }}
    >
      <AdminNavbar />

      <main style={{ flex: 1 }}>
        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'stretch'
          }}
        >
          <AdminSidebar />

          <main style={{ flex: 1 }}>
            <Outlet />
          </main>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminLayout;