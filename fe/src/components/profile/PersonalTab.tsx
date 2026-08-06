import { useState, useEffect, useRef } from 'react';
import { FaUserPen, FaCamera, FaPaperPlane } from 'react-icons/fa6';
import api from '@services/api';
import { useAuth } from '@contexts/AuthContext';
import { getAvatar, setAvatar, PF_AVATAR_KEY } from '@utils/profileStorage';
import perfilIcon from '@assets/images/perfil.png';
import SectionHeader from './SectionHeader';

export type NotifyFn = (message: string, type?: 'success' | 'error' | 'info') => void;

interface PersonalTabProps {
  notify: NotifyFn;
  onProfileChanged: () => void;
}

interface ClientProfile {
  first_name: string;
  last_name: string;
  email: string;
  telefono_cliente?: number | null;
  address?: string | null;
}

const PersonalTab = ({ notify, onProfileChanged }: PersonalTabProps) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatar, setAvatar] = useState<string>(getAvatar() || perfilIcon);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const syncFromContext = () => {
      setNombre(user?.nombre?.split(' ')[0] || '');
      setApellido(user?.nombre?.split(' ').slice(1).join(' ') || '');
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

  useEffect(() => {
    const sync = () => setAvatar(getAvatar() || perfilIcon);
    window.addEventListener('client-profile-updated', sync);
    return () => window.removeEventListener('client-profile-updated', sync);
  }, []);

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
      localStorage.setItem(PF_AVATAR_KEY, dataUrl);
      window.dispatchEvent(new CustomEvent('client-profile-updated'));
      notify('Foto de perfil actualizada', 'success');
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
      onProfileChanged();
      notify('Cambios guardados correctamente', 'success');
    } catch (err) {
      console.error(err);
      notify('Error al guardar los cambios', 'error');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="pf-tab">
      <SectionHeader
        icon={<FaUserPen />}
        title="Editar perfil"
        subtitle="Actualiza tu información personal y foto de perfil."
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

      <form onSubmit={handleSave} className="pf-form">
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
            <FaPaperPlane /> {guardando ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PersonalTab;