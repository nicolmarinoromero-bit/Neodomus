// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from '@components/layout/PrivateRoute';
import HomePage from '@pages/Home/Home';
import InfoSectionsContainer from '@pages/Home/InfoSectionsContainer';
import AuthModalLayout from '@components/auth/AuthModalLayout';
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
import Perfil from '@pages/cliente/Perfil';
import TecnicosPage from '@pages/cliente/TecnicosPage';
import CitasPage from '@pages/cliente/CitasPage';
import AyudaPage from '@pages/cliente/AyudaPage';
import AdminPerfil from '@pages/admin/AdminPerfil';
import TecnicoPerfil from '@pages/tecnico/TecnicoPerfil';
import ProductosPublicos from '@pages/public/ProductosPublicos';
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';
import TechnicianLayout from './components/layout/TechnicianLayout';

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<ProductosPublicos />} />
        <Route path="/productos" element={<ProductosPublicos />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/info" element={<InfoSectionsContainer />} />

        <Route element={<AuthModalLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-code" element={<VerifyCode />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Route>

        <Route element={<PrivateRoute />}>
          <Route path="/dashboard/cliente" element={<ClientDashboard />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/cliente/Tecnicos" element={<TecnicosPage />} />
          <Route path="/cliente/citas" element={<CitasPage />} />
          <Route path="/cliente/Ayuda" element={<AyudaPage />} />
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
  );
}

export default App;