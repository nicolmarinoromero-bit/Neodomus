/**
 * Paleta e identidad visual NEODOMUS para la app móvil.
 * Espejo de la identidad web: negro, blanco, rosa palo y dorado.
 */

export const Neo = {
  // Fondo general (negro profundo)
  fondo: '#0b0b0d',
  fondoSuave: '#121215',
  // Tarjetas y contenedores
  tarjeta: '#16161a',
  tarjetaBorde: 'rgba(212, 165, 75, 0.28)',
  tarjetaBordeSuave: 'rgba(255, 255, 255, 0.08)',
  // Texto
  texto: '#ffffff',
  textoSuave: '#bdbdbd',
  textoTenue: 'rgba(255, 255, 255, 0.45)',
  // Dorado / amarillo (acento principal)
  oro: '#d4a54b',
  oroClaro: '#ffd98a',
  // Rosa palo (acento secundario)
  rosa: '#e7a3b8',
  rosaSuave: 'rgba(231, 163, 184, 0.16)',
  // Estados
  error: '#ff6b6b',
  errorFondo: 'rgba(255, 107, 107, 0.12)',
  exito: '#7bd88f',
  exitoFondo: 'rgba(123, 216, 143, 0.12)',
  // Inputs
  inputFondo: '#1b1b1f',
  inputBorde: 'rgba(255, 255, 255, 0.1)',
  inputPlaceholder: '#6b6b6b',
};

export const Colors = {
  light: {
    text: Neo.texto,
    background: Neo.fondo,
    tint: Neo.oro,
    icon: Neo.textoSuave,
    tabIconDefault: Neo.textoTenue,
    tabIconSelected: Neo.oro,
  },
  dark: {
    text: Neo.texto,
    background: Neo.fondo,
    tint: Neo.oro,
    icon: Neo.textoSuave,
    tabIconDefault: Neo.textoTenue,
    tabIconSelected: Neo.oro,
  },
};

export const Fonts = {
  sans: 'normal',
  serif: 'serif',
  rounded: 'normal',
  mono: 'monospace',
};