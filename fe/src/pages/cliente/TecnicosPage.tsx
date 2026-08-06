import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { useAuthModal } from '@contexts/AuthModalContext';
import { FaUserTie, FaCheck, FaArrowLeft } from 'react-icons/fa6';
import '@styles/perfil-cliente.css';
import api from '@services/api';

interface Tecnico {
  id: number;
  nombre: string;
  apellido: string;
  foto_url?: string | null;
  especialidad: string;
  anios_experiencia: number;
  calificacion: number;
  disponible: boolean;
  descripcion?: string;
}

const tecnicosMock: Tecnico[] = [
  {
    id: 1,
    nombre: 'Carlos',
    apellido: 'Mendoza',
    foto_url: null,
    especialidad: 'Domótica',
    anios_experiencia: 8,
    calificacion: 4.9,
    disponible: true,
    descripcion: 'Especialista en sistemas de hogar inteligente, automatización de iluminación, climatización y seguridad. Certificado en KNX, Zigbee y Z-Wave.',
  },
  {
    id: 2,
    nombre: 'Andrés',
    apellido: 'Rojas',
    foto_url: null,
    especialidad: 'Automatización',
    anios_experiencia: 6,
    calificacion: 4.8,
    disponible: true,
    descripcion: 'Experto en integración de dispositivos IoT, escenas programadas y control por voz (Alexa, Google Home, Siri).',
  },
  {
    id: 3,
    nombre: 'María',
    apellido: 'Torres',
    foto_url: null,
    especialidad: 'Iluminación inteligente',
    anios_experiencia: 5,
    calificacion: 4.7,
    disponible: false,
    descripcion: 'Diseño e instalación de sistemas de iluminación LED inteligente, control RGB, regulación automática y sensores de presencia.',
  },
  {
    id: 4,
    nombre: 'Javier',
    apellido: 'Silva',
    foto_url: null,
    especialidad: 'Seguridad',
    anios_experiencia: 10,
    calificacion: 5.0,
    disponible: true,
    descripcion: 'Instalación de cámaras IP, sensores de movimiento, cerraduras inteligentes y sistemas de alarma monitoreados 24/7.',
  },
  {
    id: 5,
    nombre: 'Laura',
    apellido: 'García',
    foto_url: null,
    especialidad: 'Energía solar',
    anios_experiencia: 7,
    calificacion: 4.6,
    disponible: true,
    descripcion: 'Sistemas fotovoltaicos residenciales, baterías de respaldo y monitoreo de consumo energético en tiempo real.',
  },
  {
    id: 6,
    nombre: 'Roberto',
    apellido: 'Castro',
    foto_url: null,
    especialidad: 'Climatización',
    anios_experiencia: 9,
    calificacion: 4.8,
    disponible: true,
    descripcion: 'Control inteligente de HVAC, termostatos programables, zonificación térmica y eficiencia energética.',
  },
];

const TecnicosPage = () => {
  const { isAuthenticated } = useAuth();
  const { openAuth } = useAuthModal();
  const navigate = useNavigate();
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTecnicos = async () => {
      setLoading(true);
      try {
        const res = await api.get('/tecnicos');
        const data = res.data.data || res.data || [];
        if (data.length > 0) {
          setTecnicos(data);
        } else {
          setTecnicos(tecnicosMock);
        }
      } catch (err: any) {
        console.warn('API no disponible, usando datos de ejemplo:', err.message);
        setTecnicos(tecnicosMock);
      } finally {
        setLoading(false);
      }
    };
    fetchTecnicos();
  }, []);

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= full) stars.push(<span key={i} className="star-full">★</span>);
      else if (i === full + 1 && half) stars.push(<span key={i} className="star-half">★</span>);
      else stars.push(<span key={i} className="star-empty">☆</span>);
    }
    return stars;
  };

  const handleSeleccionar = (_tecnico: Tecnico) => {
    if (!isAuthenticated) {
      openAuth('ingresar');
      return;
    }
    navigate('/cliente/citas');
  };

  if (loading) return <div className="tecnicos-page-loading">Cargando técnicos...</div>;

  return (
    <div className="tecnicos-page app-glass">
      <main className="tecnicos-main">
        <header className="tecnicos-header">
          <button type="button" className="tecnicos-back-btn" onClick={() => navigate('/productos')}>
            <FaArrowLeft /> Volver a Productos
          </button>
          <div className="tecnicos-header-content">
            <h1 className="tecnicos-title">Nuestros Técnicos</h1>
            <p className="tecnicos-subtitle">Encuentra al profesional ideal para tu proyecto</p>
          </div>
        </header>

        <div className="tecnicos-grid">
          {tecnicos.map((tecnico) => (
            <article key={tecnico.id} className="tecnico-card">
              <div className="tecnico-card-header">
                <div className="tecnico-avatar-wrap">
                  <img
                    src={tecnico.foto_url || '/assets/images/perfil.png'}
                    alt={`${tecnico.nombre} ${tecnico.apellido}`}
                    className="tecnico-avatar"
                    onError={(e) => (e.currentTarget.src = '/assets/images/perfil.png')}
                  />
                  {tecnico.disponible && <span className="tecnico-badge disponible">Disponible</span>}
                  {!tecnico.disponible && <span className="tecnico-badge ocupado">Ocupado</span>}
                </div>
              </div>
              <div className="tecnico-card-body">
                <h3 className="tecnico-nombre">{tecnico.nombre} {tecnico.apellido}</h3>
                <p className="tecnico-especialidad">{tecnico.especialidad}</p>
                <div className="tecnico-meta">
                  <span className="tecnico-meta-item">
                    <FaUserTie /> {tecnico.anios_experiencia}+ años exp.
                  </span>
                  <span className="tecnico-meta-item estrellas">
                    {renderStars(tecnico.calificacion)}
                    <span className="rating-value">{tecnico.calificacion.toFixed(1)}</span>
                  </span>
                </div>
                {tecnico.descripcion && (
                  <p className="tecnico-descripcion">{tecnico.descripcion}</p>
                )}
              </div>
              <div className="tecnico-card-footer">
                <button
                  type="button"
                  className="tecnico-btn tecnico-btn-primary"
                  onClick={() => handleSeleccionar(tecnico)}
                  disabled={!tecnico.disponible || !isAuthenticated}
                >
                  <FaCheck /> {tecnico.disponible ? (isAuthenticated ? 'Seleccionar técnico' : 'Inicia sesión') : 'No disponible'}
                </button>
              </div>
            </article>
          ))}
        </div>

        {tecnicos.length === 0 && (
          <div className="tecnicos-empty">
            <FaUserTie className="tecnicos-empty-icon" />
            <p>No hay técnicos registrados</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default TecnicosPage;