import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import TechnicalNavbar from './TechnicianNavbar';
import TechnicalSidebar from './TechnicianSidebar';

const TechnicalLayout = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh'
      }}
    >
      <TechnicalNavbar />

      <main style={{ flex: 1 }}>
        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'stretch'
          }}
        >
          <TechnicalSidebar />

          <main style={{ flex: 1 }}>
            <Outlet />
          </main>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TechnicalLayout;