import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@contexts/AuthContext';
import { useIdioma } from '@i18n/IdiomaContext';
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

type TabTecnico = 'cuenta' | 'contrasena' | 'idioma';

const PERFIL_KEY = 'technicalAvatar';

interface PerfilTecnico {
  first_name: string;
  last_name: string;
  email: string;
  telefono_usuario?: number | null;
  documento_usuario?: number | null;
  certificacion_t?: string | null;
  cargo_t?: string | null;
  created_at?: string;
}

const TechnicalPerfil = () => {
  const { user, refreshUserProfile } = useAuth();
  const { t } = useIdioma();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activo, setActivo] = useState<TabTecnico>('cuenta');
  const [avatar, setAvatar] = useState<string>(() => localStorage.getItem(PERFIL_KEY) || perfilIcon);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [documento, setDocumento] = useState('');
  const [certificacion, setCertificacion] = useState('');
  const [cargo, setCargo] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [toast, setToast] = useState<{ msg: string; tipo: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    const cargarPerfil = async () => {
      setCargando(true);
      try {
        const res = await api.get<PerfilTecnico>('/users/me');
        setNombre(res.data.first_name || '');
        setApellido(res.data.last_name || '');
        setEmail(res.data.email || '');
        setTelefono(res.data.telefono_usuario ? String(res.data.telefono_usuario) : '');
        setDocumento(res.data.documento_usuario ? String(res.data.documento_usuario) : '');
        setCertificacion(res.data.certificacion_t || '');
        setCargo(res.data.cargo_t || '');
      } catch (err) {
        console.error('Error cargando perfil del técnico:', err);
        const partes = (user?.nombre || t('tec.tecnico')).trim().split(' ');
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
      const saved = localStorage.getItem(PERFIL_KEY);
      if (saved) setAvatar(saved);
    };
    window.addEventListener('technical-profile-updated', sync);
    return () => window.removeEventListener('technical-profile-updated', sync);
  }, []);

  const notify = (msg: string, tipo: 'success' | 'error' | 'info' = 'success') => {
    setToast({ msg, tipo });
    window.setTimeout(() => setToast(null), 3200);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      notify(t('tec.fotoPesada'), 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setAvatar(dataUrl);
      localStorage.setItem(PERFIL_KEY, dataUrl);
      window.dispatchEvent(new CustomEvent('technical-profile-updated'));
      notify(t('tec.fotoActualizada'));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !apellido.trim()) {
      notify(t('tec.nombreObligatorio'), 'error');
      return;
    }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      notify(t('tec.correoInvalido'), 'error');
      return;
    }
    if (telefono.trim() && !/^[+\d][\d\s()-]{6,}$/.test(telefono.trim())) {
      notify(t('tec.telefonoInvalido'), 'error');
      return;
    }
    setGuardando(true);
    try {
      const payload: Record<string, unknown> = {
        first_name: nombre.trim(),
        last_name: apellido.trim(),
        email: email.trim(),
      };
      const telNum = parseInt(telefono.replace(/\D/g, ''), 10);
      if (telefono.trim()) payload.telefono_usuario = telNum;
      const docNum = parseInt(documento.replace(/\D/g, ''), 10);
      if (documento.trim()) payload.documento_usuario = docNum;
      payload.certificacion_t = certificacion.trim();
      payload.cargo_t = cargo.trim();

      await api.put('/users/me', payload);

      await refreshUserProfile();
      window.dispatchEvent(new CustomEvent('technical-profile-updated'));
      notify(t('tec.cambiosGuardados'));
    } catch (err: any) {
      const msg = err.response?.data?.detail;
      notify(typeof msg === 'string' ? msg : t('tec.errorGuardar'), 'error');
    } finally {
      setGuardando(false);
    }
  };

  const nombreCompleto = `${nombre} ${apellido}`.trim() || user?.nombre || t('tec.tecnico');
  const correoUsuario = email || user?.correo || '';

  const renderCuenta = () => (
    <div className="pf-tab">
      <SectionHeader
        icon={<FaUserPen />}
        title={t('tec.informacionPersonal')}
        subtitle={t('tec.subInformacionPersonal')}
      />

      <div className="pf-avatar-zone">
        <div className="pf-avatar-big">
          <img src={avatar} alt={t('tec.fotoPerfil')} />
          <button
            type="button"
            className="pf-avatar-camera"
            aria-label={t('tec.cambiarFoto')}
            onClick={() => fileInputRef.current?.click()}
          >
            <FaCamera />
          </button>
        </div>
        <div className="pf-avatar-text">
          <strong>{t('tec.fotoPerfil')}</strong>
          <span>{t('tec.fotoPerfilHint')}</span>
          <button
            type="button"
            className="pf-btn pf-btn-ghost"
            onClick={() => fileInputRef.current?.click()}
          >
            <FaCamera /> {t('tec.cambiarFoto')}
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

      {cargando ? (
        <div className="ap-states">
          <div className="ap-loader" />
          <p className="ap-state-text">{t('tec.cargandoDatos')}</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="pf-form">
          <div className="pf-form-grid">
            <div className="pf-form-group">
              <label className="pf-form-label" htmlFor="t-nombre">{t('tec.nombre')}</label>
              <input
                id="t-nombre"
                className="pf-form-input"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder={t('tec.placeholderNombre')}
                required
              />
            </div>
            <div className="pf-form-group">
              <label className="pf-form-label" htmlFor="t-apellido">{t('tec.apellidos')}</label>
              <input
                id="t-apellido"
                className="pf-form-input"
                type="text"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                placeholder={t('tec.placeholderApellidos')}
                required
              />
            </div>
          </div>
          <div className="pf-form-grid">
            <div className="pf-form-group">
              <label className="pf-form-label" htmlFor="t-email">{t('tec.correo')}</label>
              <input
                id="t-email"
                className="pf-form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="pf-form-group">
              <label className="pf-form-label" htmlFor="t-telefono">{t('tec.telefono')}</label>
              <input
                id="t-telefono"
                className="pf-form-input"
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ''))}
                placeholder={t('tec.placeholderTelefono')}
              />
            </div>
          </div>
          <div className="pf-form-grid">
            <div className="pf-form-group">
              <label className="pf-form-label" htmlFor="t-documento">{t('tec.documento')}</label>
              <input
                id="t-documento"
                className="pf-form-input"
                type="text"
                value={documento}
                onChange={(e) => setDocumento(e.target.value.replace(/\D/g, ''))}
                placeholder={t('tec.placeholderDocumento')}
              />
            </div>
            <div className="pf-form-group">
              <label className="pf-form-label" htmlFor="t-especialidad">{t('tec.especialidad')}</label>
              <input
                id="t-especialidad"
                className="pf-form-input"
                type="text"
                value={certificacion}
                onChange={(e) => setCertificacion(e.target.value)}
                placeholder={t('tec.placeholderEspecialidad')}
              />
            </div>
          </div>
          <div className="pf-form-grid">
            <div className="pf-form-group">
              <label className="pf-form-label" htmlFor="t-cargo">{t('tec.cargo')}</label>
              <input
                id="t-cargo"
                className="pf-form-input"
                type="text"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                placeholder={t('tec.placeholderCargo')}
              />
            </div>
            <div className="pf-form-group">
              <label className="pf-form-label" htmlFor="t-rol">{t('tec.rol')}</label>
              <input id="t-rol" className="pf-form-input" type="text" value={t('tec.tecnico')} disabled />
            </div>
          </div>
          <div className="pf-form-actions">
            <button type="submit" className="pf-btn pf-btn-primary" disabled={guardando}>
              <FaFloppyDisk /> {guardando ? t('tec.guardando') : t('tec.guardarCambios')}
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

  const navItems: { id: TabTecnico; label: string; icon: React.ReactNode }[] = [
    { id: 'cuenta', label: t('tec.miCuenta'), icon: <FaUserShield /> },
    { id: 'contrasena', label: t('tec.cambiarContrasena'), icon: <FaLock /> },
    { id: 'idioma', label: t('tec.idioma'), icon: <FaGlobe /> },
  ];

  return (
    <div className="ap-profile">
      <div className="perfil-shell">
        <aside className="perfil-sidebar">
          <div className="pf-usuario-card">
            <span className="pf-avatar-wrap">
              <img src={avatar} alt={t('tec.fotoPerfil')} className="pf-avatar-img" />
            </span>
            <strong className="pf-usuario-nombre">{nombreCompleto}</strong>
            <span className="pf-usuario-correo">{correoUsuario}</span>
            <span className="pf-rol-badge">{t('tec.tecnico')}</span>
          </div>

          <nav className="pf-nav" aria-label={t('perfil.seccionesLabel')}>
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
              <h1 className="pf-content-title">{t('tec.perfilTitulo')}</h1>
              <p className="pf-content-subtitle">{t('tec.perfilSubtitulo')}</p>
            </div>
            <span className="pf-breadcrumb">{t('tec.tecnico')}</span>
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

export default TechnicalPerfil;
