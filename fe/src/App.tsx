// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from '@components/layout/PrivateRoute';
import HomePage from '@pages/Home/Home';
import InfoSectionsContainer from '@pages/Home/InfoSectionsContainer';
import Login from '@pages/auth/Login';
import Register from '@pages/auth/Register';
import ForgotPassword from '@pages/auth/ForgotPassword';
import VerifyCode from '@pages/auth/VerifyCode';
import ResetPassword from '@pages/auth/ResetPassword';
import VerifyEmail from '@pages/auth/VerifyEmail';
import ChangePassword from '@pages/auth/ChangePassword';
import ClientDashboard from '@pages/cliente/ClientDashboard';
import AdminDashboard from '@pages/admin/AdminDashboard';
import TechnicianDashboard from '@pages/tecnico/TechnicianDashboard';
import ClientePerfil from '@pages/cliente/ClientePerfil';
import AdminPerfil from '@pages/admin/AdminPerfil';
import TecnicoPerfil from '@pages/tecnico/TecnicoPerfil';
import ProductosPublicos from '@pages/public/ProductosPublicos';  // ← componente público
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';
import TechnicianLayout from './components/layout/TechnicianLayout';

function App() {
  return (
    <Routes>
      {/* Ruta padre que aplica el layout global */}
      <Route element={<MainLayout />}>
        {/* Home con Navbar y Footer globales */}
        <Route path="/" element={<HomePage />} />
        {/* Rutas públicas */}
        <Route path="/info" element={<InfoSectionsContainer />} />
        <Route path="/productos" element={<ProductosPublicos />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-code" element={<VerifyCode />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Rutas protegidas (cliente) */}
       <Route element={<PrivateRoute />}>
    <Route path="/dashboard/cliente" element={<ClientDashboard />} />
    <Route path="/perfil/cliente" element={<ClientePerfil />} />
    <Route path="/cambiar-password" element={<ChangePassword />} />
  </Route>
</Route>

    {/* Layout de técnico (sin Navbar global) */}
<Route element={<PrivateRoute />}>
  <Route element={<TechnicianLayout />}>
    <Route path="/dashboard/tecnico" element={<TechnicianDashboard />} />
    <Route path="/perfil/tecnico" element={<TecnicoPerfil />} />
  </Route>
</Route>

    {/* Layout de administrador (sin Navbar global) */}
<Route element={<PrivateRoute />}>
  <Route element={<AdminLayout />}>
    <Route path="/dashboard/admin" element={<AdminDashboard />} />
    <Route path="/perfil/admin" element={<AdminPerfil />} />
  </Route>
</Route>

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;