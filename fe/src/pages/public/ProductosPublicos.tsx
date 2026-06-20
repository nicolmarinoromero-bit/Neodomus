import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import api from '@services/api';
import '@styles/productos-publicos.css';
import fondoImg from '@assets/images/Fondo2.png';
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



const ProductosPublicos = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);
  const [cartMessage, setCartMessage] = useState('');
  const [cantidades, setCantidades] = useState<
  Record<number, number>
>({});
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

  const handleAddToCart = (id_producto: number) => {
    if (!isAuthenticated) {
      setCartMessage('Debes iniciar sesión para comprar');
      setTimeout(() => setCartMessage(''), 3000);
      setTimeout(() => navigate('/login'), 1500);
      return;
    }
    setCartMessage('Producto agregado (demo)');
    setTimeout(() => setCartMessage(''), 3000);
  };



const disminuirCantidad = (id: number) => {
  setCantidades(prev => ({
    ...prev,
    [id]: Math.max(
      1,
      (prev[id] || 1) - 1
    ),
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
      <main className="productos-page" style={{ backgroundImage: `url(${fondoImg})`, backgroundSize: 'cover' }}>
        <section className="productos">
          <div className="barra-superior">
            <div className="buscador">
             <span className="icono-buscar">
  🔍
</span> 
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
    <p>
      Encuentra todo lo que necesitas para tu hogar inteligente
    </p>
  </div>
</div>
              <div className="productos-grid">
                {currentProductos.map(producto => (
                  <div key={producto.id_producto} className="card-producto">
                    <div className="img-contenedor">
                      <img
                        src={getImagen(producto)}
                        alt={producto.nombre_producto}
                        className="img-producto"
                        onError={(e) => (e.currentTarget.src = '/productos/default.png')}
                      />
                    </div>
                    <div className="info-producto">
                      {/* 🔥 Nombre con estilos inline visibles */}
                      <h3 className="nombre-producto">
                        {producto.nombre_producto}
                      </h3>
                      {producto.nombre_categoria && (
                        <span className="categoria-producto">
                          {producto.nombre_categoria}
                        </span>
                      )}
                      {/* 🔥 Precio con estilo inline visible */}
                      <div className="precio-producto">
                        ${producto.precio_venta_producto.toLocaleString()}
                      </div>
                      <div className="acciones-producto">


  <div className="cantidad-control">

    <button
      type="button"
      onClick={() =>
        disminuirCantidad(producto.id_producto)
      }
    >
      -
    </button>

    <span>
      {cantidades[producto.id_producto] || 1}
    </span>

    <button
      type="button"
      onClick={() =>
        aumentarCantidad(producto.id_producto)
      }
    >
      +
    </button>

  </div>

 <button
  className="btn-agregar"
  onClick={() =>
    handleAddToCart(producto.id_producto)
  }
>
  Agregar al carrito

  <span className="icono-carrito-btn">
    🛒
  </span>
</button>

</div>
                    </div>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
  <div className="paginacion">

    <button
      className="page-nav"
      onClick={() => handlePageChange(currentPage - 1)}
      disabled={currentPage === 1}
    >
      ◀
    </button>

    {getPageNumbers().map((item, idx) => (
      <button
        key={idx}
        className={`page-number ${
          item === currentPage ? 'active' : ''
        }`}
        onClick={() =>
          typeof item === 'number' &&
          handlePageChange(item)
        }
        disabled={item === '...'}
      >
        {item}
      </button>
    ))}

    <button
      className="page-nav"
      onClick={() => handlePageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
    >
      ▶
    </button>

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