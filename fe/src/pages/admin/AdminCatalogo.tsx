import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaTags, FaCircleInfo, FaArrowRight } from 'react-icons/fa6';
import '@styles/admin-panel.css';
import '@styles/dashboard-admin.css';
import api from '@services/api';
import type { CategoriaAdmin, ProductoAdmin } from '../../types';

interface PaginaProductos {
  total: number;
  data: ProductoAdmin[];
}

const AdminCatalogo = () => {
  const [categorias, setCategorias] = useState<CategoriaAdmin[]>([]);
  const [productos, setProductos] = useState<ProductoAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
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
  }, []);

  const conteoPorCategoria = (id: number) =>
    productos.filter((p) => p.id_cate_pr === id).length;

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
            Categorías de productos disponibles en la tienda NeoDomus.
          </p>
        </div>
        <div className="ap-header-right">
          <span className="welcome-badge">
            <FaTags />
            {categorias.length} categorías
          </span>
        </div>
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
      ) : categorias.length === 0 ? (
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
                  <div className={`an-icon cuenta`}>
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
      )}
    </motion.section>
  );
};

export default AdminCatalogo;
