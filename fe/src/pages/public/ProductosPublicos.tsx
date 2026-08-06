import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@services/api';
import { useCart } from '@contexts/CartContext';
import '@styles/productos-publicos.css';
import buscadorIcon from '@assets/images/buscador.png';

interface Producto {
  id_producto: number;
  nombre_producto: string;
  precio_venta_producto: number;
  imagen_url?: string | null;
  id_cate_pr?: number;
  nombre_categoria?: string;
}

interface Categoria {
  id_categoria: number;
  nombre_categoria: string;
  descripcion: string;
}

const FAVORITOS_KEY = 'neodomus_favoritos';

const ProductosPublicos = () => {
  const { addItem } = useCart();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);
  const [cartMessage, setCartMessage] = useState('');
  const [cantidades, setCantidades] = useState<Record<number, number>>({});
  const [favoritos, setFavoritos] = useState<Set<number>>(() => {
    try {
      const raw = localStorage.getItem(FAVORITOS_KEY);
      return new Set<number>(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set<number>();
    }
  });

  // Cargar categorías
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await api.get('/productos/categorias');
        setCategorias(res.data);
      } catch (err) {
        console.error('Error cargando categorías:', err);
      }
    };
    fetchCategorias();
  }, []);

  // Cargar productos (todos)
  useEffect(() => {
    const fetchProductos = async () => {
      setLoading(true);
      try {
        const res = await api.get('/productos/?limit=100');
        const productosArray = res.data.data || [];
        setProductos(productosArray);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.detail || 'Error al cargar productos');
      } finally {
        setLoading(false);
      }
    };
    fetchProductos();
  }, []);

  // Filtrar productos
  const productosFiltrados = productos.filter(producto => {
    const matchesSearch = producto.nombre_producto.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = categoriaSeleccionada ? producto.id_cate_pr === categoriaSeleccionada : true;
    return matchesSearch && matchesCategoria;
  });

  // Paginación local
  const totalPages = Math.ceil(productosFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProductos = productosFiltrados.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoriaSeleccionada, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const toggleFavorito = (id: number) => {
    setFavoritos(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem(FAVORITOS_KEY, JSON.stringify([...next]));
      } catch {
        // El almacenamiento no está disponible; la interacción sigue siendo visual
      }
      return next;
    });
  };

  const handleAddToCart = (id: number) => {
    const producto = productos.find(p => p.id_producto === id);
    if (!producto) return;
    addItem(
      {
        id_producto: producto.id_producto,
        nombre_producto: producto.nombre_producto,
        precio_venta_producto: producto.precio_venta_producto,
        imagen: getImagen(producto),
      },
      cantidades[id] || 1
    );
    setCartMessage(`${producto.nombre_producto} agregado al carrito`);
    setTimeout(() => setCartMessage(''), 3000);
  };

  const disminuirCantidad = (id: number) => {
    setCantidades(prev => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) - 1),
    }));
  };

  const aumentarCantidad = (id: number) => {
    setCantidades(prev => ({
      ...prev,
      [id]: (prev[id] || 1) + 1,
    }));
  };

  // Imagen basada en ID
  const getImagen = (producto: Producto) => {
    if (producto.imagen_url) return producto.imagen_url;
    return `/productos/${producto.id_producto}.jpg`;
  };

  const getPageNumbers = (): (number | string)[] => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) range.push(i);
    }
    range.forEach((i) => {
      if (l !== undefined) {
        if (i - l === 2) rangeWithDots.push(l + 1);
        else if (i - l !== 1) rangeWithDots.push('...');
      }
      rangeWithDots.push(i);
      l = i;
    });
    return rangeWithDots;
  };

  if (loading) return <div className="loading">Cargando productos...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <>
      {cartMessage && <div className="cart-toast">{cartMessage}</div>}
      <main className="productos-page">
        <section className="productos">
          <div className="barra-superior">
            <div className="buscador">
              <img src={buscadorIcon} alt="" className="icono-buscar" />
              <input type="text" placeholder="Buscar producto" value={searchTerm} onChange={handleSearchChange} />
            </div>
            <div className="controls-right">
              <select className="select-paginas" value={itemsPerPage} onChange={handleItemsPerPageChange}>
                <option value={8}>8 por página</option>
                <option value={16}>16 por página</option>
                <option value={24}>24 por página</option>
              </select>
              <select
                className="select-categoria"
                value={categoriaSeleccionada || ''}
                onChange={(e) => setCategoriaSeleccionada(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">Todas las categorías</option>
                {categorias.map(cat => (
                  <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre_categoria}</option>
                ))}
              </select>
            </div>
          </div>

          {currentProductos.length === 0 ? (
            <div className="loading">No hay productos que coincidan.</div>
          ) : (
            <>
              <div className="productos-header">
                <div>
                  <h1>Productos</h1>
                  <p>Encuentra todo lo que necesitas para tu hogar inteligente</p>
                </div>
              </div>

              <div className="productos-grid">
                {currentProductos.map(producto => {
                  const esFavorito = favoritos.has(producto.id_producto);
                  return (
                    <div key={producto.id_producto} className="card-producto">
                      <div className="img-contenedor">
                        <button
                          type="button"
                          className={`btn-favorito ${esFavorito ? 'activo' : ''}`}
                          onClick={() => toggleFavorito(producto.id_producto)}
                          aria-label={esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                          title={esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                        </button>
                        <div className="img-producto-wrap">
                          <Link to={`/producto/${producto.id_producto}`} aria-label={`Ver detalle de ${producto.nombre_producto}`}>
                            <img
                              src={getImagen(producto)}
                              alt={producto.nombre_producto}
                              className="img-producto"
                              loading="lazy"
                              onError={(e) => (e.currentTarget.src = '/productos/default.png')}
                            />
                          </Link>
                        </div>
                      </div>
                      <div className="info-producto">
                        <Link to={`/producto/${producto.id_producto}`} className="nombre-producto-link">
                          <h3 className="nombre-producto">{producto.nombre_producto}</h3>
                        </Link>
                        {producto.nombre_categoria && (
                          <span className="categoria-producto">{producto.nombre_categoria}</span>
                        )}
                        <div className="precio-producto">
                          <span className="precio-monto">${producto.precio_venta_producto.toLocaleString()}</span>
                          <span className="precio-sufijo">COP</span>
                        </div>
                        <div className="acciones-producto">
                          <div className="cantidad-control">
                            <button type="button" onClick={() => disminuirCantidad(producto.id_producto)} aria-label="Reducir cantidad">−</button>
                            <span>{cantidades[producto.id_producto] || 1}</span>
                            <button type="button" onClick={() => aumentarCantidad(producto.id_producto)} aria-label="Aumentar cantidad">+</button>
                          </div>
                          <button
                            className="btn-agregar"
                            onClick={() => handleAddToCart(producto.id_producto)}
                          >
                            <span>Agregar al carrito</span>
                            <svg className="icono-carrito" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="9" cy="21" r="1" />
                              <circle cx="20" cy="21" r="1" />
                              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="paginacion">
                  <button className="page-nav" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} aria-label="Página anterior">‹</button>
                  {getPageNumbers().map((item, idx) => (
                    <button
                      key={idx}
                      className={`page-number ${item === currentPage ? 'active' : ''}`}
                      onClick={() => typeof item === 'number' && handlePageChange(item)}
                      disabled={item === '...'}
                    >
                      {item}
                    </button>
                  ))}
                  <button className="page-nav" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Página siguiente">›</button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </>
  );
};

export default ProductosPublicos;