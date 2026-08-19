import { useState } from 'react';
import { FaScrewdriverWrench, FaStar, FaPhone, FaWhatsapp } from 'react-icons/fa6';
import { getTecnicos, saveItem, PF_TECNICOS_KEY, Tecnico } from '@utils/profileStorage';
import SectionHeader from './SectionHeader';
import { NotifyFn } from './PersonalTab';

const initials = (name: string) =>
  name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

const TechniciansTab = ({ notify }: { notify: NotifyFn }) => {
  const [tecnicos, setTecnicos] = useState<Tecnico[]>(getTecnicos());

  const toggleDisponibilidad = (id: string) => {
    const next = tecnicos.map((t) => (t.id === id ? { ...t, disponible: !t.disponible } : t));
    setTecnicos(next);
    saveItem(PF_TECNICOS_KEY, next);
    notify('Disponibilidad del técnico actualizada', 'info');
  };

  return (
    <div className="pf-tab">
      <SectionHeader
        icon={<FaScrewdriverWrench />}
        title="Mis técnicos"
        subtitle="Técnicos asociados a tus instalaciones y servicios contratados."
      />

      {tecnicos.length === 0 ? (
        <div className="pf-empty">
          <span className="pf-empty-icon"><FaScrewdriverWrench /></span>
          <p>No tienes técnicos asignados todavía.</p>
        </div>
      ) : (
        <div className="pf-tech-grid">
          {tecnicos.map((tecnico) => (
            <div className="pf-tech-card" key={tecnico.id}>
              <div className="pf-tech-head">
                <span className="pf-tech-avatar">{initials(tecnico.nombre)}</span>
                <div className="pf-tech-info">
                  <strong className="pf-tech-name">{tecnico.nombre}</strong>
                  <span className="pf-tech-spec">{tecnico.especialidad}</span>
                </div>
                <span className={`pf-tech-status ${tecnico.disponible ? 'on' : 'off'}`}>
                  {tecnico.disponible ? 'Disponible' : 'Ocupado'}
                </span>
              </div>

              <div className="pf-tech-stats">
                <span className="pf-tech-stat">
                  <FaStar className="gold" /> {tecnico.valoracion.toFixed(1)}
                </span>
                <span className="pf-tech-stat">
                  {tecnico.trabajos} <span>trabajos</span>
                </span>
              </div>

              <div className="pf-tech-actions">
                <a className="pf-btn pf-btn-ghost" href={`tel:+57${tecnico.telefono.replace(/\D/g, '')}`}>
                  <FaPhone /> Llamar
                </a>
                <button
                  type="button"
                  className="pf-btn pf-btn-ghost"
                  onClick={() => notify(`Abriendo chat con ${tecnico.nombre}`, 'info')}
                >
                  <FaWhatsapp /> Mensaje
                </button>
              </div>

              <button
                type="button"
                className="pf-tech-toggle"
                onClick={() => toggleDisponibilidad(tecnico.id)}
              >
                {tecnico.disponible ? 'Marcar como ocupado' : 'Marcar como disponible'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TechniciansTab;