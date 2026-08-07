import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaHeart, FaCheck, FaTruckFast, FaShieldHalved, FaRotateLeft } from 'react-icons/fa6';
import api from '@services/api';
import { useCart } from '@contexts/CartContext';
import { useIdioma } from '@i18n/IdiomaContext';
import '@styles/producto-detalle.css';

interface Producto {
  id_producto: number;
  nombre_producto: string;
  precio_venta_producto: number;
  imagen_url?: string | null;
  id_cate_pr?: number;
  nombre_categoria?: string;
}

const FAVORITOS_KEY = 'neodomus_favoritos';

const PALETAS: Record<number, string[]> = {
  1: ['Blanco', 'Negro', 'Gris'],
  2: ['Blanco', 'Negro', 'Plata'],
  3: ['Blanco cálido', 'Blanco frío', 'RGB'],
  4: ['Negro', 'Blanco'],
  5: ['Azul', 'Amarillo', 'Negro'],
  6: ['Blanco', 'Negro'],
  7: ['Negro'],
  8: ['Blanco', 'Negro'],
  9: ['Blanco', 'Gris', 'Negro'],
  10: ['Blanco', 'Gris'],
};

const COLOR_HEX: Record<string, string> = {
  'Blanco': '#f5f5f5',
  'Blanco cálido': '#ffe9c7',
  'Blanco frío': '#e8f4ff',
  'Negro': '#1e1e1e',
  'Gris': '#9e9e9e',
  'Plata': '#c0c0c0',
  'Azul': '#2f6fed',
  'Amarillo': '#f6c344',
  'RGB': 'linear-gradient(135deg, #ff4d4d, #ffd700, #2f6fed, #7c4dff)',
};

const CARACTERISTICAS: Record<number, string[]> = {
  1: [
    'Detección precisa de movimiento',
    'Alcance de hasta 8 metros',
    'Ángulo de detección de 90° a 110°',
    'Alimentación de bajo consumo',
    'Fácil instalación sin obras',
  ],
  2: [
    'Control central de todos tus dispositivos',
    'Compatibilidad con protocolos Wi-Fi y Zigbee',
    'App móvil para gestión remota',
    'Escenas y rutinas programables',
    'Actualizaciones de firmware automáticas',
  ],
  3: [
    'Iluminación regulable y personalizable',
    'Colores RGB y tonos de blanco',
    'Control por app y asistentes de voz',
    'Bajo consumo energético',
    'Larga vida útil de los LEDs',
  ],
  4: [
    'Automatización completa del hogar',
    'Programación de escenas por horarios',
    'Integración con sensores y cámaras',
    'Control por voz (Alexa, Google Home)',
    'Instalación guiada paso a paso',
  ],
  5: [
    'Conectividad de alto rendimiento',
    'Transmisión de datos estable y rápida',
    'Material de alta durabilidad',
    'Compatibilidad con routers estándar',
    'Presentaciones y longitudes variadas',
  ],
  6: [
    'Control de encendido y apagado remoto',
    'Monitoreo de consumo eléctrico',
    'Programación de horarios',
    'Protección contra sobrecargas',
    'Compatibilidad con asistentes de voz',
  ],
  7: [
    'Salida de voltaje estable',
    'Protección contra sobrevoltaje',
    'Alta eficiencia energética',
    'Conexión segura de terminales',
    'Uso continuo y confiable',
  ],
  8: [
    'Vigilancia y monitoreo 24/7',
    'Notificaciones en tiempo real',
    'Visión nocturna',
    'Grabación de alta definición',
    'Fácil configuración desde la app',
  ],
  9: [
    'Control de temperatura inteligente',
    'Programación por horarios y zonas',
    'Ahorro energético automático',
    'Control remoto desde la app',
    'Compatibilidad con asistentes de voz',
  ],
  10: [
    'Panel de control táctil intuitivo',
    'Gestión central de todo el hogar',
    'Pantalla de alta resolución',
    'Escenas personalizadas',
    'Interfaz en español',
  ],
};

const ProductoDetalle = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { t } = useIdioma();

  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [color, setColor] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [esFavorito, setEsFavorito] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  useEffect(() => {
    const fetchProducto = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/productos/${id}`);
        setProducto(res.data);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.detail || 'Producto no encontrado');
      } finally {
        setLoading(false);
      }
    };
    fetchProducto();
  }, [id]);

  useEffect(() => {
    if (!producto) return;
    try {
      const raw = localStorage.getItem(FAVORITOS_KEY);
      const favs: number[] = raw ? JSON.parse(raw) : [];
      setEsFavorito(favs.includes(producto.id_producto));
    } catch {
      setEsFavorito(false);
    }
  }, [producto]);

  useEffect(() => {
    if (producto) {
      const paleta = PALETAS[producto.id_cate_pr ?? 0] || ['Blanco', 'Negro', 'Gris'];
      setColor(paleta[0]);
    }
  }, [producto]);

  if (loading) return <div className="detalle-loading">Cargando producto...</div>;
  if (error || !producto)
    return (
      <div className="detalle-error">
        <p>{error || 'Producto no encontrado'}</p>
        <button type="button" className="detalle-back-btn" onClick={() => navigate('/productos')}>
          <FaArrowLeft /> Volver a productos
        </button>
      </div>
    );

  const imagen = producto.imagen_url || `/productos/${producto.id_producto}.jpg`;
  const paleta = PALETAS[producto.id_cate_pr ?? 0] || ['Blanco', 'Negro', 'Gris'];
  const caracteristicas = CARACTERISTICAS[producto.id_cate_pr ?? 0] || CARACTERISTICAS[1];
  const categoria = producto.nombre_categoria || 'Producto';

  const descripcion = `El ${producto.nombre_producto} pertenece a la categoría de ${categoria}. Diseñado para integrarse a la perfección en tu hogar inteligente, combina tecnología confiable con una instalación sencilla, garantizando el mejor rendimiento y la máxima comodidad para tu espacio.`;

  const toggleFavorito = () => {
    try {
      const raw = localStorage.getItem(FAVORITOS_KEY);
      const favs: number[] = raw ? JSON.parse(raw) : [];
      const next = esFavorito
        ? favs.filter(f => f !== producto.id_producto)
        : [...favs, producto.id_producto];
      localStorage.setItem(FAVORITOS_KEY, JSON.stringify(next));
      setEsFavorito(!esFavorito);
      showToast(esFavorito ? 'Producto eliminado de favoritos' : 'Producto agregado a favoritos');
    } catch {
      // Almacenamiento no disponible
    }
  };

  const handleAgregarAlCarrito = () => {
    addItem(
      {
        id_producto: producto.id_producto,
        nombre_producto: producto.nombre_producto,
        precio_venta_producto: producto.precio_venta_producto,
        imagen,
        color,
      },
      cantidad
    );
    showToast(`${cantidad} x ${producto.nombre_producto} ${t('productos.agregadoAlCarrito')}`);
  };

  return (
    <div className="detalle-page app-glass">
      {toast && <div className="detalle-toast">{toast}</div>}
      <main className="detalle-main">
        <button type="button" className="detalle-back-btn" onClick={() => navigate('/productos')}>
          <FaArrowLeft /> {t('carrito.volverProductos')}
        </button>

        <nav className="detalle-breadcrumb" aria-label={t('detalle.ruta')}>
          <Link to="/productos">{t('nav.productos')}</Link>
          <span className="detalle-breadcrumb-sep">/</span>
          <span className="detalle-breadcrumb-cat">{categoria}</span>
          <span className="detalle-breadcrumb-sep">/</span>
          <span>{producto.nombre_producto}</span>
        </nav>

        <div className="detalle-layout">
          <div className="detalle-imagen-card">
            <button
              type="button"
              className={`detalle-fav-btn ${esFavorito ? 'activo' : ''}`}
              onClick={toggleFavorito}
              aria-label={esFavorito ? t('productos.quitarFavoritos') : t('productos.agregarFavoritos')}
              title={esFavorito ? t('productos.quitarFavoritos') : t('productos.agregarFavoritos')}
            >
              <FaHeart />
            </button>
            <img
              src={imagen}
              alt={producto.nombre_producto}
              onError={(e) => (e.currentTarget.src = '/productos/default.png')}
            />
          </div>

          <div className="detalle-info">
            <span className="detalle-categoria">{categoria}</span>
            <h1 className="detalle-nombre">{producto.nombre_producto}</h1>

            <div className="detalle-precio">
              <span className="detalle-precio-monto">
                ${producto.precio_venta_producto.toLocaleString()}
              </span>
              <span className="detalle-precio-sufijo">COP</span>
            </div>

            <div className="detalle-disponibilidad">
              <FaCheck /> Disponible
            </div>

            <p className="detalle-descripcion">{descripcion}</p>

            <div className="detalle-caracteristicas">
              <h3>Características principales</h3>
              <ul>
                {caracteristicas.map(f => (
                  <li key={f}>
                    <FaCheck /> {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="detalle-compra">
              <div className="detalle-colores">
                <span className="detalle-label">Color: <strong>{color}</strong></span>
                <div className="detalle-colores-swatches">
                  {paleta.map(c => (
                    <button
                      key={c}
                      type="button"
                      className={`detalle-swatch ${color === c ? 'activo' : ''}`}
                      onClick={() => setColor(c)}
                      aria-label={`Color ${c}`}
                      title={c}
                    >
                      <span
                        className="detalle-swatch-circle"
                        style={COLOR_HEX[c]?.startsWith('linear') ? { background: COLOR_HEX[c] } : { background: COLOR_HEX[c] || '#ccc' }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="detalle-cantidad-row">
                <div className="detalle-cantidad">
                  <button
                    type="button"
                    onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                    aria-label="Reducir cantidad"
                  >
                    −
                  </button>
                  <span>{cantidad}</span>
                  <button
                    type="button"
                    onClick={() => setCantidad(cantidad + 1)}
                    aria-label="Aumentar cantidad"
                  >
                    +
                  </button>
                </div>

                <button type="button" className="detalle-agregar-btn" onClick={handleAgregarAlCarrito}>
                  Agregar al carrito
                </button>

                <button
                  type="button"
                  className={`detalle-favorito-btn ${esFavorito ? 'activo' : ''}`}
                  onClick={toggleFavorito}
                >
                  <FaHeart />
                </button>
              </div>

              <p className="detalle-subtotal">
                Subtotal: <strong>${(producto.precio_venta_producto * cantidad).toLocaleString()} COP</strong>
              </p>
            </div>

            <div className="detalle-beneficios">
              <div className="detalle-beneficio">
                <FaTruckFast />
                <span>Envío seguro a todo el país</span>
              </div>
              <div className="detalle-beneficio">
                <FaShieldHalved />
                <span>Garantía oficial Neodomus</span>
              </div>
              <div className="detalle-beneficio">
                <FaRotateLeft />
                <span>Instalación profesional disponible</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductoDetalle;
