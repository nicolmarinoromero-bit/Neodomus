import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaTags, FaCircleInfo, FaBoxOpen, FaPen, FaArrowRight, FaPlus, FaMagnifyingGlass } from 'react-icons/fa6';
import '@styles/admin-panel.css';
import '@styles/dashboard-admin.css';
import api from '@services/api';
import { badgeStock, textoStock } from '../../constants';
import type { CategoriaAdmin, ProductoAdmin } from '../../types';

interface PaginaProductos {
  total: number;
  data: ProductoAdmin[];
}

const AdminCatalogo = () => {
  const [categorias, setCategorias] = useState<CategoriaAdmin[]>([]);
  const [productos, setProductos] = useState<ProductoAdmin[]>([]);
  const [vista, setVista] = useState<'todos' | 'categorias'>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const cargar = () => {
      Promise.all([
        api.get<CategoriaAdmin[]>('/productos/categorias'),
        api.get<PaginaProductos>('/productos/?limit=100'),
      ])
        .then(([resCat, resPro]) => {
          setCategorias(resCat.data || []);
          setProductos(resPro.data.data || []);
        })
        .catch(() => setError(true))
        .finally(() => setCargando(false));
    };
    cargar();
    const handler = () => cargar();
    window.addEventListener('admin-producto-updated', handler);
    return () => window.removeEventListener('admin-producto-updated', handler);
  }, []);

  const conteoPorCategoria = (id: number) => productos.filter((p) => p.id_cate_pr === id).length;
  const formatoPrecio = (valor: number) => `$${valor.toLocaleString('es-CO')}`;

  const q = busqueda.trim().toLowerCase();
  const productosFiltrados = q
    ? productos.filter((p) =>
        `${p.nombre_producto} ${p.marca || ''} ${p.referencia_producto || ''} ${p.nombre_categoria || ''} ID ${p.id_producto}`
          .toLowerCase()
          .includes(q),
      )
    : productos;

  return (
    <motion.section
      className="admin-panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="ap-header">
        <div>
          <h1 className="ap-title">Catálogo</h1>
          <p className="ap-subtitle">
            {vista === 'todos'
              ? 'Todos los productos del catálogo de la tienda.'
              : `${categorias.length} categoría${categorias.length === 1 ? '' : 's'} de productos disponibles en la tienda Neodomus.`}
          </p>
        </div>
        <div className="ap-header-right">
          <span className="welcome-badge">
            <FaTags />
            {categorias.length} categoría{categorias.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      <div className="ap-filters" style={{ marginBottom: 20 }}>
        {vista === 'todos' && (
          <form className="ap-search" onSubmit={(e) => e.preventDefault()}>
            <FaMagnifyingGlass />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </form>
        )}
        <select
          className="ap-filtro-estado"
          value={vista}
          onChange={(e) => setVista(e.target.value as 'todos' | 'categorias')}
          title="Cómo ver el catálogo"
          style={{ minWidth: 220 }}
        >
          <option value="todos">Todos los productos</option>
          <option value="categorias">Por categorías</option>
        </select>
        <Link to="/admin/productos/nuevo" className="ap-btn ap-btn-primary" style={{ marginLeft: 'auto' }}>
          <FaPlus /> Nuevo producto
        </Link>
      </div>

      {cargando ? (
        <div className="ap-card">
          <div className="ap-states">
            <span className="ap-loader" />
            <h3>Cargando catálogo</h3>
            <p>Consultando categorías y productos...</p>
          </div>
        </div>
      ) : error ? (
        <div className="ap-card">
          <div className="ap-states error">
            <div className="ap-states-icon">
              <FaCircleInfo />
            </div>
            <h3>No se pudo cargar el catálogo</h3>
            <p>Verifica tu conexión e inténtalo nuevamente.</p>
            <button type="button" className="ap-btn ap-btn-ghost" onClick={() => window.location.reload()}>
              Reintentar
            </button>
          </div>
        </div>
      ) : vista === 'categorias' ? (
        categorias.length === 0 ? (
          <div className="ap-card">
            <div className="ap-states">
              <div className="ap-states-icon">
                <FaTags />
              </div>
              <h3>No hay categorías registradas</h3>
              <p>El catálogo de categorías se encuentra vacío por el momento.</p>
            </div>
          </div>
        ) : (
          <div className="ap-grid">
            {categorias.map((categoria) => {
              const cantidad = conteoPorCategoria(categoria.id_categoria);
              return (
                <div key={categoria.id_categoria} className="ap-grid-item">
                  <div className="ap-grid-item-top">
                    <div className="an-icon cuenta">
                      <FaTags />
                    </div>
                    <span className="ap-badge info">{cantidad} producto{cantidad === 1 ? '' : 's'}</span>
                  </div>
                  <h3>{categoria.nombre_categoria}</h3>
                  <p>{categoria.descripcion || 'Sin descripción disponible.'}</p>
                  <Link
                    to={`/admin/productos?categoria=${categoria.id_categoria}`}
                    className="ap-btn ap-btn-ghost"
                    style={{ marginTop: 'auto' }}
                  >
                    Ver productos <FaArrowRight />
                  </Link>
                </div>
              );
            })}
          </div>
        )
      ) : q && productosFiltrados.length === 0 ? (
        <div className="ap-card">
          <div className="ap-states">
            <div className="ap-states-icon">
              <FaCircleInfo />
            </div>
            <h3>Sin resultados</h3>
            <p>No hay productos que coincidan con la búsqueda.</p>
          </div>
        </div>
      ) : productos.length === 0 ? (
        <div className="ap-card">
          <div className="ap-states">
            <div className="ap-states-icon">
              <FaBoxOpen />
            </div>
            <h3>No hay productos registrados</h3>
            <p>El catálogo de productos se encuentra vacío por el momento.</p>
            <Link to="/admin/productos/nuevo" className="ap-btn ap-btn-primary">
              Crear el primer producto
            </Link>
          </div>
        </div>
      ) : (
        <div className="ap-card">
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Stock</th>
                  <th>Precio</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.map((producto) => (
                  <tr key={producto.id_producto}>
                    <td>
                      <div className="ap-cell-user">
                        <img
                          src={producto.imagen_url || `/productos/${producto.id_producto}.jpg`}
                          alt={producto.nombre_producto}
                          className="ap-thumb"
                          onError={(e) => (e.currentTarget.src = '/productos/default.png')}
                        />
                        <div>
                          <strong>{producto.nombre_producto}</strong>
                          <span>
                            ID {producto.id_producto}
                            {producto.marca ? ` · ${producto.marca}` : ''}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      {producto.nombre_categoria ? (
                        <span className="ap-badge info">{producto.nombre_categoria}</span>
                      ) : (
                        <span className="ap-badge neutral">Sin categoría</span>
                      )}
                    </td>
                    <td>
                      <span className={`ap-badge ${badgeStock(producto.stock_producto)}`}>
                        {textoStock(producto.stock_producto)}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: '#ffd98a' }}>{formatoPrecio(producto.precio_venta_producto)}</strong>{' '}
                      <span className="muted">COP</span>
                    </td>
                    <td>
                      <Link to={`/admin/productos/${producto.id_producto}`} className="ap-btn ap-btn-ghost">
                        <FaPen /> Gestionar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.section>
  );
};

export default AdminCatalogo;
