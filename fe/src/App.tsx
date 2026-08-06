// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from '@components/layout/PrivateRoute';
import ScrollToTop from '@components/layout/ScrollToTop';
import AuthModalHost from '@components/auth/AuthModalHost';
import AuthRouteBridge from '@components/auth/AuthRouteBridge';
import HomePage from '@pages/Home/Home';
import InfoSectionsContainer from '@pages/Home/InfoSectionsContainer';
import ChangePassword from '@pages/auth/ChangePassword';
import ClientDashboard from '@pages/cliente/ClientDashboard';
import AdminDashboard from '@pages/admin/AdminDashboard';
import TechnicianDashboard from '@pages/tecnico/TechnicianDashboard';
import Perfil from '@pages/cliente/Perfil';
import TecnicosPage from '@pages/cliente/TecnicosPage';
import CitasPage from '@pages/cliente/CitasPage';
import AyudaPage from '@pages/cliente/AyudaPage';
import AdminPerfil from '@pages/admin/AdminPerfil';
import TecnicoPerfil from '@pages/tecnico/TecnicoPerfil';
import ProductosPublicos from '@pages/public/ProductosPublicos';
import ProductoDetalle from '@pages/public/ProductoDetalle';
import CarritoPage from '@pages/public/CarritoPage';
import Notificaciones from '@pages/public/Notificaciones';
import TerminosUso from '@pages/legal/TerminosUso';
import PoliticaPrivacidad from '@pages/legal/PoliticaPrivacidad';
import PoliticaCookies from '@pages/legal/PoliticaCookies';
import Contacto from '@pages/legal/Contacto';
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';
import TechnicianLayout from './components/layout/TechnicianLayout';

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<ProductosPublicos />} />
          <Route path="/productos" element={<ProductosPublicos />} />
          <Route path="/producto/:id" element={<ProductoDetalle />} />
          <Route path="/carrito" element={<CarritoPage />} />
          <Route path="/notificaciones" element={<Notificaciones />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/info" element={<InfoSectionsContainer />} />
          <Route path="/ayuda" element={<AyudaPage />} />
          <Route path="/terminos" element={<TerminosUso />} />
          <Route path="/privacidad" element={<PoliticaPrivacidad />} />
          <Route path="/cookies" element={<PoliticaCookies />} />
          <Route path="/contacto" element={<Contacto />} />

          <Route path="/login" element={<AuthRouteBridge step="ingresar" />} />
          <Route path="/register" element={<AuthRouteBridge step="registro" />} />
          <Route path="/forgot-password" element={<AuthRouteBridge step="recuperar" />} />
          <Route path="/verify-code" element={<AuthRouteBridge step="verificar-codigo" />} />
          <Route path="/reset-password" element={<AuthRouteBridge step="restablecer" />} />
          <Route path="/verify-email" element={<AuthRouteBridge step="verificar-email" />} />

          <Route element={<PrivateRoute />}>
            <Route path="/dashboard/cliente" element={<ClientDashboard />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/cliente/tecnicos" element={<TecnicosPage />} />
            <Route path="/cliente/citas" element={<CitasPage />} />
            <Route path="/cliente/ayuda" element={<AyudaPage />} />
            <Route path="/cambiar-password" element={<ChangePassword />} />
          </Route>
        </Route>

        <Route element={<PrivateRoute />}>
          <Route element={<TechnicianLayout />}>
            <Route path="/dashboard/tecnico" element={<TechnicianDashboard />} />
            <Route path="/perfil/tecnico" element={<TecnicoPerfil />} />
          </Route>
        </Route>

        <Route element={<PrivateRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route path="/perfil/admin" element={<AdminPerfil />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <AuthModalHost />
    </>
  );
}

export default App;