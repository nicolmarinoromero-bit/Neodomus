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
  FaTrashCan,
} from 'react-icons/fa6';
import '@styles/perfil-cliente.css';
import '@styles/admin-panel.css';
import { useIdioma } from '@i18n/IdiomaContext';
import { getAdminAvatar, setAdminAvatar, removeAdminAvatar, getIniciales } from '@utils/profileStorage';

import SectionHeader from '@components/profile/SectionHeader';
import PasswordTab from '@components/profile/PasswordTab';
import LanguageTab from '@components/profile/LanguageTab';

type TabAdmin = 'cuenta' | 'contrasena' | 'idioma';

const AdminPerfil = () => {
  const { t } = useIdioma();
  const { user, refreshUserProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activo, setActivo] = useState<TabAdmin>('cuenta');
  const [avatar, setAvatar] = useState<string | null>(() => getAdminAvatar());
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [toast, setToast] = useState<{ msg: string; tipo: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    const cargarPerfil = async () => {
      setCargando(true);
      try {
        const res = await api.get<{
          first_name: string;
          last_name: string;
          email: string;
          telefono_usuario?: number | null;
        }>('/users/me');
        setNombre(res.data.first_name || '');
        setApellido(res.data.last_name || '');
        setEmail(res.data.email || '');
        setTelefono(res.data.telefono_usuario ? String(res.data.telefono_usuario) : '');
      } catch (err) {
        console.error('Error cargando el perfil del administrador:', err);
        const partes = (user?.nombre || 'Administrador Sistema').trim().split(' ');
        setNombre(partes[0] || '');
        setApellido(partes.slice(1).join(' ') || '');
        setEmail(user?.correo || '');
      } finally {
        setCargando(false);
      }
    };
    cargarPerfil();
  }, [user]);

  useEffect(() => {
    const sync = () => {
      const saved = getAdminAvatar();
      setAvatar(saved);
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
      notify(t('adm.perfil.fotoPesada'), 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setAvatar(dataUrl);
      setAdminAvatar(dataUrl);
      notify(t('adm.perfil.fotoActualizada'));
    };
    reader.readAsDataURL(file);
  };

  const handleEliminarFoto = () => {
    setAvatar(null);
    removeAdminAvatar();
    notify(t('adm.perfil.fotoEliminada'));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      notify(t('adm.perfil.correoInvalido'), 'error');
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
      notify(t('adm.perfil.cambiosGuardados'));
    } catch (err: any) {
      const msg = err.response?.data?.detail;
      if (Array.isArray(msg)) {
        notify(
          msg.map((m: any) => (typeof m === 'string' ? m : m.msg || '')).filter(Boolean).join(' · '),
          'error',
        );
      } else if (typeof msg === 'string') {
        notify(msg, 'error');
      } else {
        notify(t('adm.perfil.errorGuardar'), 'error');
      }
    } finally {
      setGuardando(false);
    }
  };

  const nombreCompleto = (nombre || apellido) ? `${nombre} ${apellido}`.trim() : user?.nombre || t('adm.perfil.administrador');
  const correoUsuario = user?.correo || email || 'admin@neodomus.com';

  const renderCuenta = () => (
    <div className="pf-tab">
      <SectionHeader
        icon={<FaUserPen />}
        title={t('adm.perfil.informacionPersonal')}
        subtitle={t('adm.perfil.subInformacionPersonal')}
      />

      <div className="pf-avatar-zone">
        <div className="pf-avatar-big">
          {avatar ? (
            <img src={avatar} alt={t('adm.perfil.fotoPerfil')} />
          ) : (
            <span className="pf-avatar-iniciales" aria-hidden="true">{getIniciales(nombreCompleto)}</span>
          )}
          <button
            type="button"
            className="pf-avatar-camera"
            aria-label={t('adm.perfil.cambiarFoto')}
            onClick={() => fileInputRef.current?.click()}
          >
            <FaCamera />
          </button>
        </div>
        <div className="pf-avatar-text">
          <strong>{t('adm.perfil.fotoPerfil')}</strong>
          <span>{t('adm.perfil.fotoPerfilHint')}</span>
          <button
            type="button"
            className="pf-btn pf-btn-ghost"
            onClick={() => fileInputRef.current?.click()}
          >
            <FaCamera /> {t('adm.perfil.cambiarFoto')}
          </button>
          {avatar && (
            <button type="button" className="pf-btn pf-btn-danger" onClick={handleEliminarFoto}>
              <FaTrashCan /> {t('adm.perfil.eliminarFoto')}
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleAvatarChange}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {cargando ? (
        <div className="ap-states">
          <div className="ap-loader" />
          <p className="ap-state-text">{t('adm.perfil.cargandoDatos')}</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="pf-form">
        <div className="pf-form-grid">
          <div className="pf-form-group">
            <label className="pf-form-label" htmlFor="a-nombre">{t('adm.perfil.nombre')}</label>
            <input
              id="a-nombre"
              className="pf-form-input"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder={t('adm.perfil.nombrePlaceholder')}
              required
            />
          </div>
          <div className="pf-form-group">
            <label className="pf-form-label" htmlFor="a-apellido">{t('adm.perfil.apellido')}</label>
            <input
              id="a-apellido"
              className="pf-form-input"
              type="text"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              placeholder={t('adm.perfil.apellidoPlaceholder')}
              required
            />
          </div>
          <div className="pf-form-group">
            <label className="pf-form-label" htmlFor="a-email">{t('adm.perfil.correo')}</label>
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
            <label className="pf-form-label" htmlFor="a-telefono">{t('adm.perfil.telefono')}</label>
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
            <label className="pf-form-label" htmlFor="a-rol">{t('adm.perfil.rol')}</label>
            <input id="a-rol" className="pf-form-input" type="text" value={t('adm.perfil.administrador')} disabled />
          </div>
        </div>
        <div className="pf-form-actions">
          <button type="submit" className="pf-btn pf-btn-primary" disabled={guardando}>
            <FaFloppyDisk /> {guardando ? t('adm.perfil.guardando') : t('adm.perfil.guardarCambios')}
          </button>
        </div>
      </form>
      )}
    </div>
  );

  const paneContent = () => {
    if (activo === 'contrasena') return <PasswordTab notify={notify} />;
    if (activo === 'idioma') return <LanguageTab notify={notify} />;
    return renderCuenta();
  };

  const navItems: { id: TabAdmin; label: string; icon: React.ReactNode }[] = [
    { id: 'cuenta', label: t('adm.perfil.miCuenta'), icon: <FaUserShield /> },
    { id: 'contrasena', label: t('adm.perfil.cambiarContrasena'), icon: <FaLock /> },
    { id: 'idioma', label: t('adm.perfil.idioma'), icon: <FaGlobe /> },
  ];

  return (
    <div className="ap-profile">
      <div className="perfil-shell">
        <aside className="perfil-sidebar">
          <div className="pf-usuario-card">
            <span className="pf-avatar-wrap">
              {avatar ? (
                <img src={avatar} alt={t('adm.perfil.fotoPerfil')} className="pf-avatar-img" />
              ) : (
                <span className="pf-avatar-img pf-avatar-img-iniciales" aria-hidden="true">
                  {getIniciales(nombreCompleto)}
                </span>
              )}
            </span>
            <strong className="pf-usuario-nombre">{nombreCompleto}</strong>
            <span className="pf-usuario-correo">{correoUsuario}</span>
            <span className="pf-rol-badge">{t('adm.perfil.administrador')}</span>
          </div>

          <nav className="pf-nav" aria-label={t('adm.perfil.seccionesLabel')}>
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
              <h1 className="pf-content-title">{t('adm.perfil.miPerfil')}</h1>
              <p className="pf-content-subtitle">{t('adm.perfil.subMiPerfil')}</p>
            </div>
            <span className="pf-breadcrumb">{t('adm.perfil.administrador')}</span>
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