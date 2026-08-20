import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBoxOpen, FaCircleInfo, FaPlus, FaMagnifyingGlass, FaXmark } from 'react-icons/fa6';
import '@styles/admin-panel.css';
import '@styles/dashboard-admin.css';
import api from '@services/api';
import { badgeStock, textoStock } from '../../constants';
import type { ProductoAdmin } from '../../types';

interface PaginaProductos {
  total: number;
  data: ProductoAdmin[];
}

const AdminProductos = () => {
  const [productos, setProductos] = useState<ProductoAdmin[]>([]);
  const [total, setTotal] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoriaId = searchParams.get('categoria');

  const cargar = async (search = '') => {
    setCargando(true);
    setError(false);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (search.trim()) params.set('search', search.trim());
      if (categoriaId && /^\d+$/.test(categoriaId)) params.set('categoria', categoriaId);
      const res = await api.get<PaginaProductos>(`/productos/?${params.toString()}`);
      setProductos(res.data.data || []);
      setTotal(res.data.total ?? 0);
    } catch {
      setError(true);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar('');
    const handler = () => cargar('');
    window.addEventListener('admin-producto-updated', handler);
    return () => window.removeEventListener('admin-producto-updated', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    cargar('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriaId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    cargar(busqueda.trim());
  };

  const formatoPrecio = (valor: number) => `$${valor.toLocaleString('es-CO')}`;

  return (
    <motion.section
      className="admin-panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="ap-header">
        <div>
          <h1 className="ap-title">Productos</h1>
          <p className="ap-subtitle">
            {total > 0
              ? `${total} productos en el catálogo de la tienda`
              : 'Gestiona el catálogo de productos de NeoDomus.'}
          </p>
        </div>
        <div className="ap-header-right">
          <Link to="/admin/productos/nuevo" className="ap-btn ap-btn-primary">
            <FaPlus /> Nuevo producto
          </Link>
        </div>
      </div>

      <div className="ap-filters" style={{ marginBottom: 20 }}>
        <form className="ap-search" onSubmit={handleSearch}>
          <FaMagnifyingGlass />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </form>
        <button type="submit" className="ap-btn ap-btn-ghost" onClick={handleSearch}>
          Buscar
        </button>
        {categoriaId && (
          <button
            type="button"
            className="ap-badge info"
            style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7 }}
            onClick={() => {
              setBusqueda('');
              navigate('/admin/productos');
            }}
            title="Quitar filtro de categoría"
          >
            Categoría: {productos[0]?.nombre_categoria || 'seleccionada'} <FaXmark />
          </button>
        )}
      </div>

      {cargando ? (
        <div className="ap-card">
          <div className="ap-states">
            <span className="ap-loader" />
            <h3>Cargando productos</h3>
            <p>Consultando el catálogo...</p>
          </div>
        </div>
      ) : error ? (
        <div className="ap-card">
          <div className="ap-states error">
            <div className="ap-states-icon">
              <FaCircleInfo />
            </div>
            <h3>No se pudieron cargar los productos</h3>
            <p>Verifica tu conexión e inténtalo nuevamente.</p>
            <button type="button" className="ap-btn ap-btn-ghost" onClick={() => cargar('')}>
              Reintentar
            </button>
          </div>
        </div>
      ) : productos.length === 0 ? (
        <div className="ap-card">
          <div className="ap-states">
            <div className="ap-states-icon">
              <FaBoxOpen />
            </div>
            <h3>{busqueda || categoriaId ? 'Sin resultados' : 'No hay productos'}</h3>
            <p>
              {busqueda
                ? `No se encontraron productos para "${busqueda.trim()}".`
                : categoriaId
                  ? 'No hay productos registrados en esta categoría.'
                  : 'El catálogo aún no tiene productos registrados.'}
            </p>
            {!busqueda && !categoriaId && (
              <Link to="/admin/productos/nuevo" className="ap-btn ap-btn-primary">
                <FaPlus /> Crear el primer producto
              </Link>
            )}
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
                  <th>Estado</th>
                  <th>Precio</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((producto) => (
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
                          <span>ID {producto.id_producto}</span>
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
                      <span className={`ap-badge ${producto.estado_producto === 'activo' ? 'ok' : 'err'}`}>
                        {producto.estado_producto === 'activo' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: '#ffd98a' }}>{formatoPrecio(producto.precio_venta_producto)}</strong>{' '}
                      <span className="muted">COP</span>
                    </td>
                    <td>
                      <Link to={`/admin/productos/${producto.id_producto}`} className="ap-btn ap-btn-ghost">
                        Gestionar
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

export default AdminProductos;