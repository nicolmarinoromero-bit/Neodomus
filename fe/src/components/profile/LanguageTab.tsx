import { useState } from 'react';
import { FaGlobe, FaCheck } from 'react-icons/fa6';
import { getIdioma, saveItem, PF_IDIOMA_KEY } from '@utils/profileStorage';
import SectionHeader from './SectionHeader';
import { NotifyFn } from './PersonalTab';

interface Idioma {
  codigo: string;
  nombre: string;
  nativo: string;
  banda: string;
}

const idiomas: Idioma[] = [
  { codigo: 'es', nombre: 'Español', nativo: 'Español', banda: '🇪🇸' },
  { codigo: 'en', nombre: 'English', nativo: 'English', banda: '🇺🇸' },
  { codigo: 'pt', nombre: 'Português', nativo: 'Português', banda: '🇧🇷' },
  { codigo: 'fr', nombre: 'Français', nativo: 'Français', banda: '🇫🇷' },
];

const LanguageTab = ({ notify }: { notify: NotifyFn }) => {
  const [seleccion, setSeleccion] = useState<string>(getIdioma());

  const elegir = (codigo: string) => {
    setSeleccion(codigo);
    saveItem(PF_IDIOMA_KEY, codigo);
    const idioma = idiomas.find((i) => i.codigo === codigo);
    notify(`Idioma cambiado a ${idioma?.nombre || codigo}`, 'success');
  };

  return (
    <div className="pf-tab">
      <SectionHeader
        icon={<FaGlobe />}
        title="Idioma"
        subtitle="Elige el idioma con el que prefieres usar NeoDomus."
      />

      <div className="pf-lang-list">
        {idiomas.map((idioma) => (
          <button
            type="button"
            key={idioma.codigo}
            className={`pf-lang-item ${seleccion === idioma.codigo ? 'active' : ''}`}
            onClick={() => elegir(idioma.codigo)}
          >
            <span className="pf-lang-banda">{idioma.banda}</span>
            <span className="pf-lang-datos">
              <strong className="pf-lang-nombre">{idioma.nombre}</strong>
              <span className="pf-lang-nativo">{idioma.nativo}</span>
            </span>
            {seleccion === idioma.codigo && (
              <span className="pf-lang-check"><FaCheck /></span>
            )}
          </button>
        ))}
      </div>
      <p className="pf-lang-nota">El cambio de idioma se aplicará de inmediato en esta sección.</p>
    </div>
  );
};

export default LanguageTab;