import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import {
  FaUserPen, FaLock, FaBox, FaTruck, FaStar, FaScrewdriverWrench,
  FaCreditCard, FaGlobe, FaBell, FaRightFromBracket, FaXmark, FaCheck,
  FaCamera, FaUser, FaFloppyDisk, FaHeart,
} from 'react-icons/fa6';
import type { ReactNode } from 'react';
import '@styles/perfil-cliente.css';
import fondoImg from '@assets/images/Fondo2.png';
import perfilIcon from '@assets/images/perfil.png';

import SectionHeader from '@components/profile/SectionHeader';

import OrdersTab from '@components/profile/OrdersTab';
import MessagesTab from '@components/profile/MessagesTab';
import ReviewsTab from '@components/profile/ReviewsTab';
import TechniciansTab from '@components/profile/TechniciansTab';
import PaymentsTab from '@components/profile/PaymentsTab';
import LanguageTab from '@components/profile/LanguageTab';
import NotificationsTab from '@components/profile/NotificationsTab';
import PasswordTab from '@components/profile/PasswordTab';

import { getAvatar, getMensajes, PF_AVATAR_KEY } from '@utils/profileStorage';
import api from '@services/api';

interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
  badge?: number;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

type ToastState = { msg: string; tipo: 'success' | 'error' | 'info' } | null;

interface ClientProfile {
  first_name: string;
  last_name: string;
  email: string;
  telefono_cliente?: number | null;
  address?: string | null;
}

interface Producto {
  id_producto: number;
  nombre_producto: string;
  precio_venta_producto: number;
  imagen_url?: string | null;
  id_cate_pr?: number;
  nombre_categoria?: string;
}

const FAVORITOS_KEY = 'neodomus_favoritos';

type TabId = 'perfil' | 'contrasena' | 'pedidos' | 'mensajes' | 'resenas' | 'tecnicos' | 'pagos' | 'idioma' | 'notificaciones' | 'favoritos';

const Perfil = () => {
  const { user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabId) || 'perfil';
  const [activo, setActivo] = useState<TabId>(initialTab);
  const [toast, setToast] = useState<ToastState>(null);
  const [tick, setTick] = useState(0);
  const [confirmarSalida, setConfirmarSalida] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado para favoritos
  const [favoritos, setFavoritos] = useState<Set<number>>(() => {
    try {
      const raw = localStorage.getItem(FAVORITOS_KEY);
      return new Set<number>(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set<number>();
    }
  });
  const [productosFavoritos, setProductosFavoritos] = useState<Producto[]>([]);
  const [favoritosLoading, setFavoritosLoading] = useState(true);

  // Estado para edición de perfil
  const [avatar, setAvatarState] = useState<string>(getAvatar() || perfilIcon);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const sync = () => setTick((t) => t + 1);
    window.addEventListener('client-profile-updated', sync);
    return () => window.removeEventListener('client-profile-updated', sync);
  }, []);

  useEffect(() => {
    const savedAvatar = getAvatar();
    if (savedAvatar) setAvatarState(savedAvatar);
  }, []);

  // Cargar productos favoritos
  useEffect(() => {
    const fetchFavoritos = async () => {
      if (favoritos.size === 0) {
        setProductosFavoritos([]);
        setFavoritosLoading(false);
        return;
      }
      setFavoritosLoading(true);
      try {
        const res = await api.get('/productos/?limit=100');
        const productosArray = res.data.data || [];
        const favoritosFiltrados = productosArray.filter((p: Producto) => favoritos.has(p.id_producto));
        setProductosFavoritos(favoritosFiltrados);
      } catch (err) {
        console.error('Error cargando favoritos:', err);
        setProductosFavoritos([]);
      } finally {
        setFavoritosLoading(false);
      }
    };
    fetchFavoritos();
  }, [favoritos]);

  // Cargar datos del perfil desde API
  useEffect(() => {
    const syncFromContext = () => {
      const partes = (user?.nombre || '').trim().split(' ');
      setNombre(partes[0] || '');
      setApellido(partes.slice(1).join(' ') || '');
      setEmail(user?.correo || '');
    };
    syncFromContext();

    api
      .get<ClientProfile>('/clients/me')
      .then((res) => {
        setNombre(res.data.first_name || '');
        setApellido(res.data.last_name || '');
        setEmail(res.data.email || '');
        setTelefono(res.data.telefono_cliente ? String(res.data.telefono_cliente) : '');
        setDireccion(res.data.address || '');
      })
      .catch((err) => {
        if (err.response?.status === 403) syncFromContext();
      });
  }, [user]);

  const noLeidas = useMemo(() => getMensajes().filter((m) => !m.leido).length, [tick]);

  const notify = (msg: string, tipo: 'success' | 'error' | 'info' = 'success') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3200);
  };

  const nombreCompleto = user?.nombre || 'Nombre Apellido';
  const correoUsuario = user?.correo || 'correo@ejemplo.com';

  const grupos: NavGroup[] = useMemo(
    () => [
      {
        label: 'Cuenta',
        items: [
          { id: 'perfil', label: 'Mi perfil', icon: <FaUser /> },
          { id: 'contrasena', label: 'Cambiar contraseña', icon: <FaLock /> },
        ],
      },
      {
        label: 'Mi actividad',
        items: [
          { id: 'pedidos', label: 'Mis pedidos', icon: <FaBox /> },
          { id: 'favoritos', label: 'Mis favoritos', icon: <FaHeart /> },
          { id: 'mensajes', label: 'Mis mensajes', icon: <FaTruck />, badge: noLeidas },
          { id: 'resenas', label: 'Mis reseñas', icon: <FaStar /> },
          { id: 'tecnicos', label: 'Mis técnicos', icon: <FaScrewdriverWrench /> },
        ],
      },
      {
        label: 'Preferencias',
        items: [
          { id: 'pagos', label: 'Métodos de pago', icon: <FaCreditCard /> },
          { id: 'idioma', label: 'Idioma', icon: <FaGlobe /> },
          { id: 'notificaciones', label: 'Notificaciones', icon: <FaBell /> },
        ],
      },
    ],
    [noLeidas]
  );

  const tituloSeccion = useMemo(() => {
    for (const g of grupos) {
      const item = g.items.find((i) => i.id === activo);
      if (item) return item.label;
    }
    return 'Mi perfil';
  }, [grupos, activo]);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
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
      setAvatarState(dataUrl);
      localStorage.setItem(PF_AVATAR_KEY, dataUrl);
      window.dispatchEvent(new CustomEvent('client-profile-updated'));
      notify('Foto de perfil actualizada', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      notify('Ingresa un correo electrónico válido', 'error');
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
      if (telefono.trim()) payload.telefono_cliente = telNum;
      if (direccion.trim()) payload.address = direccion.trim();
      await api.put('/clients/me', payload);

      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        parsed.nombre = `${nombre.trim()} ${apellido.trim()}`.trim();
        parsed.correo = email.trim();
        localStorage.setItem('user', JSON.stringify(parsed));
      }
      window.dispatchEvent(new CustomEvent('client-profile-updated'));
      notify('Cambios guardados correctamente', 'success');
    } catch (err) {
      console.error(err);
      notify('Error al guardar los cambios', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const renderPerfilTab = () => (
    <div className="pf-tab">
      <SectionHeader
        icon={<FaUserPen />}
        title="Mi perfil"
        subtitle="Visualiza y edita tu información personal y foto de perfil."
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
          <span>PNG o JPG, máximo 4 MB.</span>
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

      <form onSubmit={handleSaveProfile} className="pf-form">
        <div className="pf-form-grid">
          <div className="pf-form-group">
            <label className="pf-form-label" htmlFor="pf-nombre">Nombre</label>
            <input
              id="pf-nombre"
              className="pf-form-input"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              required
            />
          </div>
          <div className="pf-form-group">
            <label className="pf-form-label" htmlFor="pf-apellido">Apellidos</label>
            <input
              id="pf-apellido"
              className="pf-form-input"
              type="text"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              placeholder="Tus apellidos"
              required
            />
          </div>
          <div className="pf-form-group">
            <label className="pf-form-label" htmlFor="pf-email">Correo electrónico</label>
            <input
              id="pf-email"
              className="pf-form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="pf-form-group">
            <label className="pf-form-label" htmlFor="pf-telefono">Teléfono</label>
            <input
              id="pf-telefono"
              className="pf-form-input"
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Ej: 3001234567"
            />
          </div>
          <div className="pf-form-group pf-form-span">
            <label className="pf-form-label" htmlFor="pf-direccion">Dirección de residencia</label>
            <input
              id="pf-direccion"
              className="pf-form-input"
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Calle, carrera, número y complemento"
            />
          </div>
        </div>
        <div className="pf-form-actions">
          <button type="submit" className="pf-btn pf-btn-primary" disabled={guardando}>
            <FaFloppyDisk /> {guardando ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderFavoritosTab = () => (
    <div className="pf-tab">
      <SectionHeader
        icon={<FaHeart />}
        title="Mis favoritos"
        subtitle="Productos que has guardado para comprarlos más tarde."
      />

      {favoritosLoading ? (
        <div className="pf-empty">
          <div className="pf-empty-icon">⏳</div>
          <p>Cargando favoritos...</p>
        </div>
      ) : productosFavoritos.length === 0 ? (
        <div className="pf-empty">
          <div className="pf-empty-icon">
            <FaHeart />
          </div>
          <p>No tienes productos en favoritos aún.</p>
          <p style={{ fontSize: '0.8rem', marginTop: '8px' }}>Navega por el catálogo y marca productos con el corazón.</p>
        </div>
      ) : (
        <div className="pf-favoritos-grid">
          {productosFavoritos.map((producto) => (
            <div key={producto.id_producto} className="pf-favorito-card">
              <div className="pf-favorito-img-wrap">
                <img
                  src={producto.imagen_url || `/productos/${producto.id_producto}.jpg`}
                  alt={producto.nombre_producto}
                  className="pf-favorito-img"
                  loading="lazy"
                  onError={(e) => (e.currentTarget.src = '/productos/default.png')}
                />
                <button
                  type="button"
                  className="pf-favorito-remove"
                  onClick={() => {
                    const next = new Set(favoritos);
                    next.delete(producto.id_producto);
                    setFavoritos(next);
                    localStorage.setItem(FAVORITOS_KEY, JSON.stringify([...next]));
                    notify('Eliminado de favoritos', 'info');
                  }}
                  aria-label="Quitar de favoritos"
                  title="Quitar de favoritos"
                >
                  <FaHeart style={{ color: '#e5484d' }} />
                </button>
              </div>
              <div className="pf-favorito-info">
                <h3 className="pf-favorito-nombre">{producto.nombre_producto}</h3>
                {producto.nombre_categoria && (
                  <span className="pf-favorito-categoria">{producto.nombre_categoria}</span>
                )}
                <div className="pf-favorito-precio">
                  <span className="pf-favorito-monto">${producto.precio_venta_producto.toLocaleString()}</span>
                  <span className="pf-favorito-sufijo">COP</span>
                </div>
                <button
                  type="button"
                  className="pf-btn pf-btn-primary pf-favorito-comprar"
                  onClick={() => window.location.href = `/productos`}
                >
                  Ver producto
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="perfil-layout" style={{ backgroundImage: `url(${fondoImg})` }}>
      <div className="perfil-overlay" />
      <div className="perfil-shell">
        {/* ── Navegación lateral ─────────────────────────────── */}
        <aside className="perfil-sidebar">
          <div className="pf-usuario-card">
            <span className="pf-avatar-wrap">
              <img src={avatar} alt="Tu foto de perfil" className="pf-avatar-img" />
            </span>
            <strong className="pf-usuario-nombre">{nombreCompleto}</strong>
            <span className="pf-usuario-correo">{correoUsuario}</span>
            <span className="pf-rol-badge">Cuenta de cliente</span>
          </div>

          <nav className="pf-nav" aria-label="Secciones del perfil">
            {grupos.map((grupo) => (
              <div className="pf-nav-group" key={grupo.label}>
                <span className="pf-nav-group-title">{grupo.label}</span>
                {grupo.items.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    className={`pf-nav-item ${activo === item.id ? 'active' : ''}`}
                    onClick={() => setActivo(item.id as TabId)}
                  >
                    <span className="pf-nav-icon">{item.icon}</span>
                    <span className="pf-nav-label">{item.label}</span>
                    {item.badge ? <span className="pf-nav-badge">{item.badge}</span> : null}
                  </button>
                ))}
              </div>
            ))}
          </nav>

          <button type="button" className="pf-logout-btn" onClick={() => setConfirmarSalida(true)}>
            <FaRightFromBracket /> Cerrar sesión
          </button>
        </aside>

        {/* ── Contenido ─────────────────────────────────────── */}
        <main className="perfil-content">
          <header className="pf-content-header">
            <div>
              <h1 className="pf-content-title">Mi perfil</h1>
              <p className="pf-content-subtitle">Administra tu cuenta y tus actividades en un solo lugar.</p>
            </div>
            <span className="pf-breadcrumb">{tituloSeccion}</span>
          </header>

          <AnimatePresence mode="wait">
            <motion.section
              key={activo}
              className="pf-card"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {activo === 'perfil' && renderPerfilTab()}
              {activo === 'favoritos' && renderFavoritosTab()}
              {activo === 'contrasena' && <PasswordTab notify={notify} />}
              {activo === 'pedidos' && <OrdersTab notify={notify} />}
              {activo === 'mensajes' && <MessagesTab onDataChanged={() => setTick((t) => t + 1)} />}
              {activo === 'resenas' && <ReviewsTab notify={notify} />}
              {activo === 'tecnicos' && <TechniciansTab notify={notify} />}
              {activo === 'pagos' && <PaymentsTab notify={notify} />}
              {activo === 'idioma' && <LanguageTab notify={notify} />}
              {activo === 'notificaciones' && <NotificationsTab notify={notify} />}
            </motion.section>
          </AnimatePresence>
        </main>
      </div>

      {/* ── Toast ───────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className={`pf-toast ${toast.tipo}`}
            initial={{ opacity: 0, y: -24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.96 }}
          >
            {toast.tipo === 'error' ? <FaXmark /> : <FaCheck />}
            <span>{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal cerrar sesión ─────────────────────────────── */}
      {confirmarSalida && (
        <div className="pf-modal-backdrop" onClick={() => setConfirmarSalida(false)}>
          <div className="pf-modal pf-modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="pf-modal-header">
              <h3>Cerrar sesión</h3>
              <button type="button" className="pf-modal-close" onClick={() => setConfirmarSalida(false)} aria-label="Cerrar">×</button>
            </div>
            <p className="pf-modal-text">¿Seguro que deseas cerrar tu sesión? Deberás iniciar sesión nuevamente para acceder a tu cuenta.</p>
            <div className="pf-form-actions">
              <button type="button" className="pf-btn pf-btn-ghost" onClick={() => setConfirmarSalida(false)}>Cancelar</button>
              <button type="button" className="pf-btn pf-btn-danger" onClick={handleLogout}>
                <FaRightFromBracket /> Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Perfil;