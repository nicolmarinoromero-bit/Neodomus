import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaArrowLeft,
  FaBoxOpen,
  FaCircleInfo,
  FaPen,
  FaTrash,
  FaFloppyDisk,
  FaXmark,
  FaTriangleExclamation,
  FaCirclePlus,
} from 'react-icons/fa6';
import '@styles/admin-panel.css';
import '@styles/dashboard-admin.css';
import api from '@services/api';
import { STOCK_MINIMO, badgeStock, textoStock } from '../../constants';
import type { ProductoAdmin, CategoriaAdmin, ProveedorAdmin, VarianteAdmin } from '../../types';

interface EstadoForm {
  nombre_producto: string;
  referencia_producto: string;
  precio_venta_producto: string;
  precio_compra_producto: string;
  id_cate_pr: string;
  id_proveedor_pr: string;
  imagen_url: string;
  colores_producto: string;
  stock_producto: string;
  estado_producto: string;
  descripcion_producto: string;
}

interface VarianteForm {
  id: number | null;
  nombre: string;
  hex: string;
  imagen_url: string;
  stock: string;
}

const VARIANTE_VACIA = (): VarianteForm => ({
  id: null,
  nombre: '',
  hex: '#d4a54b',
  imagen_url: '',
  stock: '0',
});

const VACIO: EstadoForm = {
  nombre_producto: '',
  referencia_producto: '',
  precio_venta_producto: '',
  precio_compra_producto: '',
  id_cate_pr: '',
  id_proveedor_pr: '',
  imagen_url: '',
  colores_producto: '',
  stock_producto: '0',
  estado_producto: 'activo',
  descripcion_producto: '',
};

const AdminProductoDetalle = () => {
  const { id } = useParams<{ id: string }>();
  const esNuevo = !id || id === 'nuevo';
  const navigate = useNavigate();

  const [producto, setProducto] = useState<ProductoAdmin | null>(null);
  const [categorias, setCategorias] = useState<CategoriaAdmin[]>([]);
  const [proveedores, setProveedores] = useState<ProveedorAdmin[]>([]);
  const [form, setForm] = useState<EstadoForm>(VACIO);
  const [variantesForm, setVariantesForm] = useState<VarianteForm[]>([]);
  const [editar, setEditar] = useState(esNuevo);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(false);
  const [toast, setToast] = useState<{ msg: string; tipo: 'ok' | 'err' } | null>(null);
  const [confirmarBorrar, setConfirmarBorrar] = useState(false);

  const cargar = async () => {
    setCargando(true);
    setError(false);
    try {
      const [cats, prov] = await Promise.all([
        api.get<CategoriaAdmin[]>('/productos/categorias'),
        api.get<ProveedorAdmin[]>('/productos/proveedores'),
      ]);
      setCategorias(cats.data || []);
      setProveedores(prov.data || []);
      if (!esNuevo) {
        const res = await api.get<ProductoAdmin>(`/productos/${id}`);
        setProducto(res.data);
        setVariantesForm(
          (res.data.variantes || []).map((v: VarianteAdmin) => ({
            id: v.id,
            nombre: v.nombre,
            hex: v.hex || '#d4a54b',
            imagen_url: v.imagen_url || '',
            stock: String(v.stock ?? 0),
          })),
        );
        setForm({
          nombre_producto: res.data.nombre_producto || '',
          referencia_producto: res.data.referencia_producto || '',
          precio_venta_producto: res.data.precio_venta_producto?.toString() || '',
          precio_compra_producto: res.data.precio_compra_producto?.toString() || '',
          id_cate_pr: res.data.id_cate_pr?.toString() || '',
          id_proveedor_pr: res.data.id_proveedor_pr?.toString() || '',
          imagen_url: res.data.imagen_url || '',
          colores_producto: res.data.colores_producto || '',
          stock_producto: res.data.stock_producto?.toString() || '0',
          estado_producto: res.data.estado_producto || 'activo',
          descripcion_producto: res.data.descripcion_producto || '',
        });
      }
    } catch {
      setError(true);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const notify = (msg: string, tipo: 'ok' | 'err' = 'ok') => {
    setToast({ msg, tipo });
    window.setTimeout(() => setToast(null), 3200);
  };

  const setCampo = (campo: keyof EstadoForm, valor: string) =>
    setForm((prev) => ({ ...prev, [campo]: valor }));

  const colores = form.colores_producto
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);

  const validar = () => {
    if (!form.nombre_producto.trim()) return 'El nombre del producto es obligatorio';
    const precio = parseFloat(form.precio_venta_producto);
    if (!precio || precio <= 0) return 'Ingresa un precio de venta válido';
    const stock = parseInt(form.stock_producto, 10);
    if (Number.isNaN(stock) || stock < 0) return 'El stock debe ser un número mayor o igual a 0';
    return null;
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    const invalido = validar();
    if (invalido) {
      notify(invalido, 'err');
      return;
    }
    setGuardando(true);
    try {
      const payload = {
        nombre_producto: form.nombre_producto.trim(),
        referencia_producto: form.referencia_producto.trim() || null,
        precio_venta_producto: parseFloat(form.precio_venta_producto),
        precio_compra_producto: form.precio_compra_producto ? parseFloat(form.precio_compra_producto) : null,
        id_cate_pr: form.id_cate_pr ? parseInt(form.id_cate_pr, 10) : null,
        id_proveedor_pr: form.id_proveedor_pr ? parseInt(form.id_proveedor_pr, 10) : null,
        imagen_url: form.imagen_url.trim() || null,
        colores_producto: form.colores_producto.trim() || null,
        stock_producto: parseInt(form.stock_producto, 10),
        estado_producto: form.estado_producto,
        descripcion_producto: form.descripcion_producto.trim() || null,
      };
      if (esNuevo) {
        await api.post('/productos', payload);
        notify('Producto creado correctamente');
      } else {
        await api.put(`/productos/${id}`, payload);
        notify('Producto actualizado correctamente');
      }
      window.dispatchEvent(new CustomEvent('admin-producto-updated'));
      setEditar(false);
      await cargar();
    } catch (err: any) {
      const msg = err.response?.data?.detail;
      notify(typeof msg === 'string' ? msg : 'Error al guardar el producto', 'err');
    } finally {
      setGuardando(false);
    }
  };

  const setVariante = (i: number, campo: keyof VarianteForm, valor: string) =>
    setVariantesForm((prev) => prev.map((v, j) => (j === i ? { ...v, [campo]: valor } : v)));

  const agregarVariante = () => setVariantesForm((prev) => [...prev, VARIANTE_VACIA()]);

  const quitarVariante = async (i: number, v: VarianteForm) => {
    if (v.id && !esNuevo) {
      setGuardando(true);
      try {
        await api.delete(`/productos/${id}/variantes/${v.id}`);
        notify('Variante eliminada');
      } catch (err: any) {
        const msg = err.response?.data?.detail;
        notify(typeof msg === 'string' ? msg : 'No se pudo eliminar la variante', 'err');
        setGuardando(false);
        return;
      } finally {
        setGuardando(false);
      }
    }
    setVariantesForm((prev) => prev.filter((_, j) => j !== i));
  };

  const guardarVariante = async (v: VarianteForm) => {
    if (!v.nombre.trim()) {
      notify('El nombre de la variante es obligatorio', 'err');
      return;
    }
    const stock = parseInt(v.stock, 10);
    if (Number.isNaN(stock) || stock < 0) {
      notify('El stock de la variante debe ser un número mayor o igual a 0', 'err');
      return;
    }
    setGuardando(true);
    try {
      const payload = {
        nombre: v.nombre.trim(),
        hex: v.hex.trim() || null,
        imagen_url: v.imagen_url.trim() || null,
        stock,
      };
      if (v.id) {
        const res = await api.put<VarianteAdmin>(`/productos/${id}/variantes/${v.id}`, payload);
        setVariantesForm((prev) =>
          prev.map((x) =>
            x.id === res.data.id
              ? { ...x, id: res.data.id, nombre: res.data.nombre, hex: res.data.hex || '', imagen_url: res.data.imagen_url || '', stock: String(res.data.stock) }
              : x,
          ),
        );
        notify('Variante actualizada');
      } else {
        const res = await api.post<VarianteAdmin>(`/productos/${id}/variantes`, payload);
        setVariantesForm((prev) =>
          prev.map((x) =>
            x.id === null && x.nombre === payload.nombre
              ? { ...x, id: res.data.id }
              : x,
          ),
        );
        notify('Variante creada correctamente');
      }
      window.dispatchEvent(new CustomEvent('admin-producto-updated'));
    } catch (err: any) {
      const msg = err.response?.data?.detail;
      notify(typeof msg === 'string' ? msg : 'Error al guardar la variante', 'err');
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async () => {
    setGuardando(true);
    try {
      const res = await api.delete(`/productos/${id}`);
      window.dispatchEvent(new CustomEvent('admin-producto-updated'));
      notify(res.data?.msg || 'Producto eliminado');
      window.setTimeout(() => navigate('/admin/productos', { replace: true }), 600);
    } catch (err: any) {
      const msg = err.response?.data?.detail;
      notify(typeof msg === 'string' ? msg : 'No se pudo eliminar el producto', 'err');
      setConfirmarBorrar(false);
    } finally {
      setGuardando(false);
    }
  };

  const formatoPrecio = (valor: number) => `$${valor.toLocaleString('es-CO')}`;

  return (
    <motion.section
      className="admin-panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link to="/admin/productos" className="ap-back-link">
        <FaArrowLeft /> Volver a productos
      </Link>

      <div className="ap-header">
        <div>
          <h1 className="ap-title">{esNuevo ? 'Nuevo producto' : producto?.nombre_producto || 'Producto'}</h1>
          <p className="ap-subtitle">
            {esNuevo
              ? 'Agrega un nuevo producto al catálogo de la tienda.'
              : 'Gestiona la información del producto y su disponibilidad en la tienda.'}
          </p>
        </div>
        {!esNuevo && !editar && producto && (
          <div className="ap-header-actions">
            <button type="button" className="ap-btn ap-btn-primary" onClick={() => setEditar(true)}>
              <FaPen /> Editar producto
            </button>
            <button type="button" className="ap-btn ap-btn-danger" onClick={() => setConfirmarBorrar(true)}>
              <FaTrash /> Eliminar
            </button>
          </div>
        )}
      </div>

      {cargando ? (
        <div className="ap-card">
          <div className="ap-states">
            <span className="ap-loader" />
            <h3>Cargando producto</h3>
            <p>Consultando la información del catálogo...</p>
          </div>
        </div>
      ) : error ? (
        <div className="ap-card">
          <div className="ap-states error">
            <div className="ap-states-icon">
              <FaCircleInfo />
            </div>
            <h3>No se pudo cargar el producto</h3>
            <p>Verifica tu conexión e inténtalo nuevamente.</p>
            <button type="button" className="ap-btn ap-btn-ghost" onClick={cargar}>
              Reintentar
            </button>
          </div>
        </div>
      ) : editar ? (
        <form onSubmit={guardar} className="ap-card">
          <div className="ap-card-head">
            <h2>{esNuevo ? <><FaCirclePlus /> Nuevo producto</> : <><FaPen /> Editando producto</>}</h2>
          </div>

          <div className="ap-form-grid">
            <div className="ap-form-group full">
              <label className="ap-form-label" htmlFor="apf-nombre">Nombre *</label>
              <input
                id="apf-nombre"
                className="ap-form-input"
                type="text"
                value={form.nombre_producto}
                onChange={(e) => setCampo('nombre_producto', e.target.value)}
                placeholder="Ej: Sensor de movimiento PIR"
              />
            </div>

            <div className="ap-form-group">
              <label className="ap-form-label" htmlFor="apf-ref">Referencia</label>
              <input
                id="apf-ref"
                className="ap-form-input"
                type="text"
                value={form.referencia_producto}
                onChange={(e) => setCampo('referencia_producto', e.target.value)}
                placeholder="Ej: smi-001"
              />
              <span className="ap-form-hint">Se genera automáticamente si la dejas vacía.</span>
            </div>

            <div className="ap-form-group">
              <label className="ap-form-label" htmlFor="apf-cat">Categoría</label>
              <select
                id="apf-cat"
                className="ap-form-select"
                value={form.id_cate_pr}
                onChange={(e) => setCampo('id_cate_pr', e.target.value)}
              >
                <option value="">Sin categoría</option>
                {categorias.map((c) => (
                  <option key={c.id_categoria} value={c.id_categoria}>
                    {c.nombre_categoria}
                  </option>
                ))}
              </select>
            </div>

            <div className="ap-form-group">
              <label className="ap-form-label" htmlFor="apf-prov">Proveedor</label>
              <select
                id="apf-prov"
                className="ap-form-select"
                value={form.id_proveedor_pr}
                onChange={(e) => setCampo('id_proveedor_pr', e.target.value)}
              >
                <option value="">Sin proveedor</option>
                {proveedores.map((p) => (
                  <option key={p.id_proveedor} value={p.id_proveedor}>
                    {p.nombre_proveedor}
                  </option>
                ))}
              </select>
            </div>

            <div className="ap-form-group">
              <label className="ap-form-label" htmlFor="apf-pv">Precio de venta (COP) *</label>
              <input
                id="apf-pv"
                className="ap-form-input"
                type="number"
                min="0"
                step="0.01"
                value={form.precio_venta_producto}
                onChange={(e) => setCampo('precio_venta_producto', e.target.value)}
                placeholder="70000"
              />
            </div>

            <div className="ap-form-group">
              <label className="ap-form-label" htmlFor="apf-pc">Precio de compra (COP)</label>
              <input
                id="apf-pc"
                className="ap-form-input"
                type="number"
                min="0"
                step="0.01"
                value={form.precio_compra_producto}
                onChange={(e) => setCampo('precio_compra_producto', e.target.value)}
                placeholder="45000"
              />
            </div>

            <div className="ap-form-group">
              <label className="ap-form-label" htmlFor="apf-stock">Stock / Cantidad *</label>
<input
                    id="apf-stock"
                    className="ap-form-input"
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock_producto}
                    onChange={(e) => setCampo('stock_producto', e.target.value)}
                  />
                  <span className="ap-form-hint">
                    Stock bajo por debajo de {STOCK_MINIMO} unidades.
                  </span>
            </div>

            <div className="ap-form-group">
              <label className="ap-form-label" htmlFor="apf-estado">Estado</label>
              <select
                id="apf-estado"
                className="ap-form-select"
                value={form.estado_producto}
                onChange={(e) => setCampo('estado_producto', e.target.value)}
              >
                <option value="activo">Activo (visible en la tienda)</option>
                <option value="inactivo">Inactivo (oculto en la tienda)</option>
              </select>
            </div>

            <div className="ap-form-group full">
              <label className="ap-form-label" htmlFor="apf-img">Imagen (URL)</label>
              <input
                id="apf-img"
                className="ap-form-input"
                type="url"
                value={form.imagen_url}
                onChange={(e) => setCampo('imagen_url', e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              {form.imagen_url && (
                <img
                  src={form.imagen_url}
                  alt="Vista previa"
                  className="ap-thumb"
                  style={{ width: 80, height: 80, marginTop: 8, background: '#222' }}
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              )}
            </div>

            <div className="ap-form-group full">
              <label className="ap-form-label" htmlFor="apf-colores">Colores disponibles</label>
              <input
                id="apf-colores"
                className="ap-form-input"
                type="text"
                value={form.colores_producto}
                onChange={(e) => setCampo('colores_producto', e.target.value)}
                placeholder="Blanco, Negro, Gris"
              />
              {colores.length > 0 && (
                <div className="ap-colores" style={{ marginTop: 8 }}>
                  {colores.map((color, i) => (
                    <span key={i} className="ap-cchip" style={{ ['--chip-color' as never]: color } as React.CSSProperties}>
                      {color}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="ap-form-group full">
              <label className="ap-form-label">Variantes de color (imagen y stock por variante)</label>
              <div className="ap-variantes">
                {variantesForm.length === 0 && (
                  <span className="ap-form-hint">
                    Sin variantes: el producto usará su imagen y stock general. Agrega una variante si lo deseas.
                  </span>
                )}
                {variantesForm.map((v, i) => (
                  <div className="ap-variante-row" key={i}>
                    <input
                      className="ap-form-input"
                      type="text"
                      placeholder="Color (Ej: Blanco)"
                      value={v.nombre}
                      onChange={(e) => setVariante(i, 'nombre', e.target.value)}
                    />
                    <input
                      className="ap-form-input"
                      type="color"
                      title="Color"
                      value={/^#[0-9a-fA-F]{6}$/.test(v.hex) ? v.hex : '#d4a54b'}
                      onChange={(e) => setVariante(i, 'hex', e.target.value)}
                    />
                    <input
                      className="ap-form-input"
                      type="text"
                      placeholder="Imagen de la variante (URL)"
                      value={v.imagen_url}
                      onChange={(e) => setVariante(i, 'imagen_url', e.target.value)}
                    />
                    <input
                      className="ap-form-input"
                      type="number"
                      min="0"
                      placeholder="Stock"
                      value={v.stock}
                      onChange={(e) => setVariante(i, 'stock', e.target.value)}
                    />
                    <div className="ap-variante-acciones">
                      <button
                        type="button"
                        className="ap-btn ap-btn-ghost"
                        disabled={guardando || esNuevo}
                        title={esNuevo ? 'Guarda primero el producto para agregar variantes' : undefined}
                        onClick={() => guardarVariante(v)}
                      >
                        <FaFloppyDisk /> Guardar
                      </button>
                      <button
                        type="button"
                        className="ap-btn ap-btn-danger"
                        disabled={guardando}
                        onClick={() => quitarVariante(i, v)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="ap-btn ap-btn-ghost"
                  style={{ alignSelf: 'flex-start' }}
                  onClick={agregarVariante}
                  disabled={esNuevo}
                >
                  <FaCirclePlus /> Agregar variante
                </button>
              </div>
            </div>

            <div className="ap-form-group full">
              <label className="ap-form-label" htmlFor="apf-desc">Descripción</label>
              <textarea
                id="apf-desc"
                className="ap-form-textarea"
                value={form.descripcion_producto}
                onChange={(e) => setCampo('descripcion_producto', e.target.value)}
                placeholder="Describe el producto para la tienda..."
              />
            </div>
          </div>

          <div className="ap-form-row">
            <button
              type="button"
              className="ap-btn ap-btn-ghost"
              onClick={() => {
                setEditar(esNuevo);
                if (!esNuevo) navigate('/admin/productos', { replace: true });
              }}
              disabled={guardando}
            >
              <FaXmark /> Cancelar
            </button>
            <button type="submit" className="ap-btn ap-btn-primary" disabled={guardando}>
              <FaFloppyDisk /> {guardando ? 'Guardando...' : esNuevo ? 'Crear producto' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      ) : producto ? (
        <div className="ap-card">
          <div className="ap-prod-layout">
            {producto.imagen_url ? (
              <img
                src={producto.imagen_url}
                alt={producto.nombre_producto}
                className="ap-prod-img"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            ) : (
              <div className="ap-prod-fallback">
                <FaBoxOpen />
                <span style={{ fontSize: '0.8rem' }}>Sin imagen</span>
              </div>
            )}

            <div className="ap-prod-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span className={`ap-badge ${producto.estado_producto === 'activo' ? 'ok' : 'err'}`}>
                  {producto.estado_producto === 'activo' ? 'Activo en tienda' : 'Inactivo'}
                </span>
                {producto.nombre_categoria && <span className="ap-badge info">{producto.nombre_categoria}</span>}
                <span className={`ap-badge ${badgeStock(producto.stock_producto)}`}>
                  {textoStock(producto.stock_producto)}
                </span>
              </div>

              <span className="ap-prod-price">{formatoPrecio(producto.precio_venta_producto)}</span>

              {producto.descripcion_producto && <p className="ap-prod-desc">{producto.descripcion_producto}</p>}

              <div className="ap-def-list">
                <div className="ap-def">
                  <div className="ap-def-label">Referencia</div>
                  <div className="ap-def-value">{producto.referencia_producto || '—'}</div>
                </div>
                <div className="ap-def">
                  <div className="ap-def-label">ID</div>
                  <div className="ap-def-value">#{producto.id_producto}</div>
                </div>
                <div className="ap-def">
                  <div className="ap-def-label">Proveedor</div>
                  <div className="ap-def-value">{producto.nombre_proveedor || '—'}</div>
                </div>
                <div className="ap-def">
                  <div className="ap-def-label">Precio de compra</div>
                  <div className="ap-def-value">
                    {producto.precio_compra_producto ? formatoPrecio(producto.precio_compra_producto) : '—'}
                  </div>
                </div>
                <div className="ap-def">
                  <div className="ap-def-label">Stock</div>
                  <div className="ap-def-value">
                    {producto.stock_producto} unidades
                    {producto.stock_producto > 0 && producto.stock_producto < STOCK_MINIMO && (
                      <span className="ap-badge warn" style={{ marginLeft: 8 }}>
                        Bajo (mínimo {STOCK_MINIMO})
                      </span>
                    )}
                  </div>
                </div>
                <div className="ap-def">
                  <div className="ap-def-label">Registrado</div>
                  <div className="ap-def-value">
                    {producto.fecha_registro_producto
                      ? new Date(producto.fecha_registro_producto).toLocaleDateString('es-CO')
                      : '—'}
                  </div>
                </div>
              </div>

              {colores.length > 0 && (
                <div>
                  <span className="ap-def-label">Colores disponibles</span>
                  <div className="ap-colores" style={{ marginTop: 8 }}>
                    {colores.map((color, i) => (
                      <span key={i} className="ap-cchip" style={{ ['--chip-color' as never]: color } as React.CSSProperties}>
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {producto.variantes && producto.variantes.length > 0 && (
                <div>
                  <span className="ap-def-label">Variantes ({producto.variantes.length})</span>
                  <div className="ap-colores" style={{ marginTop: 8 }}>
                    {producto.variantes.map((v) => (
                      <span
                        key={v.id}
                        className="ap-cchip"
                        style={{ ['--chip-color' as never]: v.hex || '#d4a54b' } as React.CSSProperties}
                      >
                        {v.nombre} · {v.stock} u.
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {confirmarBorrar && (
        <div className="ap-modal-overlay" onClick={() => setConfirmarBorrar(false)}>
          <div className="ap-modal" onClick={(e) => e.stopPropagation()}>
            <h3>
              <FaTriangleExclamation style={{ color: '#ff8f93', marginRight: 8 }} />
              ¿Eliminar este producto?
            </h3>
            <p>
              <strong>{producto?.nombre_producto}</strong> dejará de estar disponible en la tienda.
              Si el producto tiene historial de pedidos, se desactivará en lugar de eliminarse.
              Esta acción no se puede deshacer.
            </p>
            <div className="ap-modal-actions">
              <button type="button" className="ap-btn ap-btn-ghost" onClick={() => setConfirmarBorrar(false)} disabled={guardando}>
                Cancelar
              </button>
              <button type="button" className="ap-btn ap-btn-danger" onClick={eliminar} disabled={guardando}>
                <FaTrash /> {guardando ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`ap-toast ${toast.tipo}`}>
          {toast.tipo === 'ok' ? <FaCircleInfo /> : <FaTriangleExclamation />}
          {toast.msg}
        </div>
      )}
    </motion.section>
  );
};

export default AdminProductoDetalle;