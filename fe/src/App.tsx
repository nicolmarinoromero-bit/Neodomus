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

function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<HomePage />} />
      <Route path="/info" element={<InfoSectionsContainer />} />
      <Route path="/productos" element={<ProductosPublicos />} />  {/* ← ruta pública */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-code" element={<VerifyCode />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Rutas protegidas (requieren autenticación) */}
      <Route element={<PrivateRoute />}>
        {/* Dashboards por rol */}
        <Route path="/dashboard/cliente" element={<ClientDashboard />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
        <Route path="/dashboard/tecnico" element={<TechnicianDashboard />} />

        {/* Perfiles por rol */}
        <Route path="/perfil/cliente" element={<ClientePerfil />} />
        <Route path="/perfil/admin" element={<AdminPerfil />} />
        <Route path="/perfil/tecnico" element={<TecnicoPerfil />} />

        {/* Cambiar contraseña */}
        <Route path="/cambiar-password" element={<ChangePassword />} />
      </Route>

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;