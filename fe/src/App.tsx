// src/App.tsx
import { useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import RoleRoute from '@components/layout/RoleRoute';
import ScrollToTop from '@components/layout/ScrollToTop';
import AuthModalHost from '@components/auth/AuthModalHost';
import AuthRouteBridge from '@components/auth/AuthRouteBridge';
import ChatBotWidget from '@components/chat/ChatBotWidget';
import { useAuth } from '@contexts/AuthContext';
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
import AdminNotificaciones from '@pages/admin/AdminNotificaciones';
import AdminProductos from '@pages/admin/AdminProductos';
import AdminProductoDetalle from '@pages/admin/AdminProductoDetalle';
import AdminCatalogo from '@pages/admin/AdminCatalogo';
import AdminTecnicos from '@pages/admin/AdminTecnicos';
import AdminInstalaciones from '@pages/admin/AdminInstalaciones';
import AdminConsultas from '@pages/admin/AdminConsultas';
import AdminClientes from '@pages/admin/AdminClientes';
import AdminProveedores from '@pages/admin/AdminProveedores';
import AdminReportes from '@pages/admin/AdminReportes';
import AdminConfiguracion from '@pages/admin/AdminConfiguracion';
import TecnicoPerfil from '@pages/tecnico/TecnicoPerfil';
import TecnicoCitas from '@pages/tecnico/TecnicoCitas';
import TecnicoHistorial from '@pages/tecnico/TecnicoHistorial';
import TecnicoClientes from '@pages/tecnico/TecnicoClientes';
import TecnicoMensajes from '@pages/tecnico/TecnicoMensajes';
import ProductosPublicos from '@pages/public/ProductosPublicos';
import ProductoDetalle from '@pages/public/ProductoDetalle';
import CarritoPage from '@pages/public/CarritoPage';
import CheckoutPage from '@pages/public/CheckoutPage';
import Notificaciones from '@pages/public/Notificaciones';
import TerminosUso from '@pages/legal/TerminosUso';
import PoliticaPrivacidad from '@pages/legal/PoliticaPrivacidad';
import PoliticaCookies from '@pages/legal/PoliticaCookies';
import Contacto from '@pages/legal/Contacto';
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';
import TechnicianLayout from './components/layout/TechnicianLayout';
import CambioPasswordObligatorio from '@pages/auth/CambioPasswordObligatorio';

const ChatBotGate = () => {
  const { rol, loading } = useAuth();
  if (loading) return null;
  if (rol === 'administrador' || rol === 'tecnico' || rol === 'empleado') return null;
  return <ChatBotWidget />;
};

const SessionGate = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useLocation().pathname;
  const evaluado = useRef(false);

  useEffect(() => {
    if (loading || evaluado.current) return;
    evaluado.current = true;
    if (!isAuthenticated && pathname !== '/home' && pathname !== '/dashboard/cliente') {
      navigate('/home', { replace: true });
    }
  }, [loading, isAuthenticated, navigate, pathname]);

  return null;
};

function App() {
  return (
    <>
      <ScrollToTop />
      <SessionGate />
      <Routes>
        {/* ── Público / visitante ─────────────────────────── */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<ProductosPublicos />} />
          <Route path="/productos" element={<ProductosPublicos />} />
          <Route path="/producto/:id" element={<ProductoDetalle />} />
          <Route path="/carrito" element={<CarritoPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/dashboard/cliente" element={<ClientDashboard />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/info" element={<InfoSectionsContainer />} />
          <Route path="/ayuda" element={<AyudaPage />} />
          <Route path="/terminos" element={<TerminosUso />} />
          <Route path="/privacidad" element={<PoliticaPrivacidad />} />
          <Route path="/cookies" element={<PoliticaCookies />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/notificaciones" element={<Notificaciones />} />

          <Route path="/login" element={<AuthRouteBridge step="ingresar" />} />
          <Route path="/register" element={<AuthRouteBridge step="registro" />} />
          <Route path="/forgot-password" element={<AuthRouteBridge step="recuperar" />} />
          <Route path="/verify-code" element={<AuthRouteBridge step="verificar-codigo" />} />
          <Route path="/reset-password" element={<AuthRouteBridge step="restablecer" />} />
          <Route path="/verify-email" element={<AuthRouteBridge step="verificar-email" />} />
        </Route>

        {/* ── Cambio de contraseña obligatorio (técnico/admin) ── */}
        <Route path="/cambiar-password-obligatorio" element={<CambioPasswordObligatorio />} />

        {/* ── Cliente (contexto usuario) ──────────────────── */}
        <Route element={<RoleRoute allowed={['cliente']} />}>
          <Route element={<MainLayout />}>
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/cliente/tecnicos" element={<TecnicosPage />} />
            <Route path="/cliente/citas" element={<CitasPage />} />
            <Route path="/cliente/ayuda" element={<AyudaPage />} />
            <Route path="/cambiar-password" element={<ChangePassword />} />
          </Route>
        </Route>

        {/* ── Técnico (contexto técnico) ──────────────────── */}
        <Route element={<RoleRoute allowed={['tecnico']} />}>
          <Route element={<TechnicianLayout />}>
            <Route path="/dashboard/tecnico" element={<TechnicianDashboard />} />
            <Route path="/perfil/tecnico" element={<TecnicoPerfil />} />
            <Route path="/tecnico/citas" element={<TecnicoCitas />} />
            <Route path="/tecnico/historial" element={<TecnicoHistorial />} />
            <Route path="/tecnico/clientes" element={<TecnicoClientes />} />
            <Route path="/tecnico/mensajes" element={<TecnicoMensajes />} />
          </Route>
        </Route>

        {/* ── Administrador (contexto admin) ──────────────── */}
        <Route element={<RoleRoute allowed={['administrador']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route path="/perfil/admin" element={<AdminPerfil />} />
            <Route path="/admin/notificaciones" element={<AdminNotificaciones />} />
            <Route path="/admin/productos" element={<AdminProductos />} />
            <Route path="/admin/productos/nuevo" element={<AdminProductoDetalle />} />
            <Route path="/admin/productos/:id" element={<AdminProductoDetalle />} />
            <Route path="/admin/catalogo" element={<AdminCatalogo />} />
            <Route path="/admin/tecnicos" element={<AdminTecnicos />} />
            <Route path="/admin/instalaciones" element={<AdminInstalaciones />} />
            <Route path="/admin/consultas" element={<AdminConsultas />} />
            <Route path="/admin/clientes" element={<AdminClientes />} />
            <Route path="/admin/proveedores" element={<AdminProveedores />} />
            <Route path="/admin/reportes" element={<AdminReportes />} />
            <Route path="/admin/configuracion" element={<AdminConfiguracion />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <AuthModalHost />
      <ChatBotGate />
    </>
  );
}

export default App;