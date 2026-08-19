import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@contexts/AuthContext';
import api from '@services/api';
import {
  FaUserShield,
  FaUserPen,
  FaFloppyDisk,
  FaCamera,
  FaLock,
  FaGlobe,
  FaCheck,
  FaXmark,
} from 'react-icons/fa6';
import '@styles/perfil-cliente.css';
import '@styles/admin-panel.css';
import perfilIcon from '@assets/images/perfil.png';

import SectionHeader from '@components/profile/SectionHeader';
import PasswordTab from '@components/profile/PasswordTab';
import LanguageTab from '@components/profile/LanguageTab';

type TabAdmin = 'cuenta' | 'contrasena' | 'idioma';

const PERFIL_KEY = 'adminAvatar';

const AdminPerfil = () => {
  const { user, refreshUserProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activo, setActivo] = useState<TabAdmin>('cuenta');
  const [avatar, setAvatar] = useState<string>(() => localStorage.getItem(PERFIL_KEY) || perfilIcon);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [toast, setToast] = useState<{ msg: string; tipo: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    const partes = (user?.nombre || 'Administrador Sistema').trim().split(' ');
    setNombre(partes[0] || '');
    setApellido(partes.slice(1).join(' ') || '');
    setEmail(user?.correo || '');
  }, [user]);

  useEffect(() => {
    const sync = () => {
      const saved = localStorage.getItem(PERFIL_KEY);
      if (saved) setAvatar(saved);
    };
    window.addEventListener('admin-profile-updated', sync);
    return () => window.removeEventListener('admin-profile-updated', sync);
  }, []);

  const notify = (msg: string, tipo: 'success' | 'error' | 'info' = 'success') => {
    setToast({ msg, tipo });
    window.setTimeout(() => setToast(null), 3200);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      notify('La imagen debe pesar menos de 4 MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setAvatar(dataUrl);
      localStorage.setItem(PERFIL_KEY, dataUrl);
      window.dispatchEvent(new CustomEvent('admin-profile-updated'));
      notify('Foto de perfil actualizada');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      notify('Ingresa un correo electrónico válido', 'error');
      return;
    }
    setGuardando(true);
    try {
      const payload: Record<string, unknown> = {
        first_name: nombre.trim() || 'Administrador',
        last_name: apellido.trim(),
        email: email.trim(),
      };
      const telNum = parseInt(telefono.replace(/\D/g, ''), 10);
      if (telefono.trim()) payload.telefono_usuario = telNum;

      await api.put('/users/me', payload);

      await refreshUserProfile();
      window.dispatchEvent(new CustomEvent('admin-profile-updated'));
      notify('Cambios guardados correctamente');
    } catch (err: any) {
      const msg = err.response?.data?.detail;
      notify(typeof msg === 'string' ? msg : 'Error al guardar los cambios. Intenta de nuevo.', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const nombreCompleto = user?.nombre || 'Administrador';
  const correoUsuario = user?.correo || email || 'admin@neodomus.com';

  const renderCuenta = () => (
    <div className="pf-tab">
      <SectionHeader
        icon={<FaUserPen />}
        title="Información personal"
        subtitle="Gestiona los datos de tu cuenta de administrador."
      />

      <div className="pf-avatar-zone">
        <div className="pf-avatar-big">
          <img src={avatar} alt="Foto de perfil" />
          <button
            type="button"
            className="pf-avatar-camera"
            aria-label="Cambiar foto de perfil"
            onClick={() => fileInputRef.current?.click()}
          >
            <FaCamera />
          </button>
        </div>
        <div className="pf-avatar-text">
          <strong>Foto de perfil</strong>
          <span>Formato JPG, PNG o WEBP. Máximo 4 MB.</span>
          <button
            type="button"
            className="pf-btn pf-btn-ghost"
            onClick={() => fileInputRef.current?.click()}
          >
            <FaCamera /> Cambiar foto
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleAvatarChange}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      <form onSubmit={handleSave} className="pf-form">
        <div className="pf-form-grid">
          <div className="pf-form-group">
            <label className="pf-form-label" htmlFor="a-nombre">Nombre</label>
            <input
              id="a-nombre"
              className="pf-form-input"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              required
            />
          </div>
          <div className="pf-form-group">
            <label className="pf-form-label" htmlFor="a-apellido">Apellidos</label>
            <input
              id="a-apellido"
              className="pf-form-input"
              type="text"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              placeholder="Tus apellidos"
              required
            />
          </div>
          <div className="pf-form-group">
            <label className="pf-form-label" htmlFor="a-email">Correo electrónico</label>
            <input
              id="a-email"
              className="pf-form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="pf-form-group">
            <label className="pf-form-label" htmlFor="a-telefono">Teléfono</label>
            <input
              id="a-telefono"
              className="pf-form-input"
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ''))}
              placeholder="+57 300 000 0000"
            />
          </div>
          <div className="pf-form-group">
            <label className="pf-form-label" htmlFor="a-rol">Rol</label>
            <input id="a-rol" className="pf-form-input" type="text" value="Administrador" disabled />
          </div>
        </div>
        <div className="pf-form-actions">
          <button type="submit" className="pf-btn pf-btn-primary" disabled={guardando}>
            <FaFloppyDisk /> {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );

  const paneContent = () => {
    if (activo === 'contrasena') return <PasswordTab notify={notify} />;
    if (activo === 'idioma') return <LanguageTab notify={notify} />;
    return renderCuenta();
  };

  const navItems: { id: TabAdmin; label: string; icon: React.ReactNode }[] = [
    { id: 'cuenta', label: 'Mi cuenta', icon: <FaUserShield /> },
    { id: 'contrasena', label: 'Cambiar contraseña', icon: <FaLock /> },
    { id: 'idioma', label: 'Idioma', icon: <FaGlobe /> },
  ];

  return (
    <div className="ap-profile">
      <div className="perfil-shell">
        <aside className="perfil-sidebar">
          <div className="pf-usuario-card">
            <span className="pf-avatar-wrap">
              <img src={avatar} alt="Tu foto de perfil" className="pf-avatar-img" />
            </span>
            <strong className="pf-usuario-nombre">{nombreCompleto}</strong>
            <span className="pf-usuario-correo">{correoUsuario}</span>
            <span className="pf-rol-badge">Administrador</span>
          </div>

          <nav className="pf-nav" aria-label="Secciones del perfil">
            {navItems.map((item) => (
              <button
                type="button"
                key={item.id}
                className={`pf-nav-item ${activo === item.id ? 'active' : ''}`}
                onClick={() => setActivo(item.id)}
              >
                <span className="pf-nav-icon">{item.icon}</span>
                <span className="pf-nav-label">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="perfil-content">
          <header className="pf-content-header">
            <div>
              <h1 className="pf-content-title">Mi perfil</h1>
              <p className="pf-content-subtitle">Administra tu información, contraseña y preferencias.</p>
            </div>
            <span className="pf-breadcrumb">Administrador</span>
          </header>

          <AnimatePresence mode="wait">
            <motion.div
              key={activo}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {paneContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            className={`pf-toast ${toast.tipo === 'error' ? 'error' : 'success'}`}
            initial={{ opacity: 0, y: -24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.96 }}
          >
            {toast.tipo === 'error' ? <FaXmark /> : <FaCheck />}
            <span>{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPerfil;