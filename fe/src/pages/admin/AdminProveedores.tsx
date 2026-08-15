import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaTruckField, FaCircleInfo, FaPlus, FaXmark, FaTriangleExclamation, FaCircleCheck, FaBoxesStacked, FaPen } from 'react-icons/fa6';
import '@styles/admin-panel.css';
import '@styles/dashboard-admin.css';
import api from '@services/api';
import type { ProveedorAdmin, ProductoAdmin } from '../../types';

interface PaginaProductos {
  total: number;
  data: ProductoAdmin[];
}

const VACIO = {
  nombre_proveedor: '',
  contacto_proveedor: '',
  telefono_proveedor: '',
  correo_proveedor: '',
  direccion_proveedor: '',
};

const AdminProveedores = () => {
  const [proveedores, setProveedores] = useState<ProveedorAdmin[]>([]);
  const [productos, setProductos] = useState<ProductoAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [mostrarNuevo, setMostrarNuevo] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState(VACIO);
  const [guardando, setGuardando] = useState(false);
  const [toast, setToast] = useState<{ msg: string; tipo: 'ok' | 'err' } | null>(null);

  const cargar = async () => {
    setCargando(true);
    setError(false);
    try {
      const [resProv, resPro] = await Promise.all([
        api.get<ProveedorAdmin[]>('/productos/proveedores'),
        api.get<PaginaProductos>('/productos/?limit=100'),
      ]);
      setProveedores(resProv.data || []);
      setProductos(resPro.data.data || []);
    } catch {
      setError(true);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
    const handler = () => cargar();
    window.addEventListener('admin-producto-updated', handler);
    return () => window.removeEventListener('admin-producto-updated', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const notify = (msg: string, tipo: 'ok' | 'err' = 'ok') => {
    setToast({ msg, tipo });
    window.setTimeout(() => setToast(null), 3200);
  };

  const setCampo = (campo: keyof typeof VACIO, valor: string) =>
    setForm((prev) => ({ ...prev, [campo]: valor }));

  const crearProveedor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre_proveedor.trim()) {
      notify('El nombre del proveedor es obligatorio', 'err');
      return;
    }
    setGuardando(true);
    try {
      if (editandoId !== null) {
        await api.put(`/productos/proveedores/${editandoId}`, {
          nombre_proveedor: form.nombre_proveedor.trim(),
          contacto_proveedor: form.contacto_proveedor.trim() || null,
          telefono_proveedor: form.telefono_proveedor.trim() || null,
          correo_proveedor: form.correo_proveedor.trim() || null,
          direccion_proveedor: form.direccion_proveedor.trim() || null,
        });
        notify('Proveedor actualizado correctamente');
      } else {
        await api.post('/productos/proveedores', {
          nombre_proveedor: form.nombre_proveedor.trim(),
          contacto_proveedor: form.contacto_proveedor.trim() || null,
          telefono_proveedor: form.telefono_proveedor.trim() || null,
          correo_proveedor: form.correo_proveedor.trim() || null,
          direccion_proveedor: form.direccion_proveedor.trim() || null,
        });
        notify('Proveedor agregado correctamente');
      }
      setMostrarNuevo(false);
      setEditandoId(null);
      setForm(VACIO);
      await cargar();
    } catch (err: any) {
      notify(err.response?.data?.detail || 'No se pudo guardar el proveedor', 'err');
    } finally {
      setGuardando(false);
    }
  };

  const abrirEdicion = (prov: ProveedorAdmin) => {
    setForm({
      nombre_proveedor: prov.nombre_proveedor || '',
      contacto_proveedor: prov.contacto_proveedor || '',
      telefono_proveedor: prov.telefono_proveedor || '',
      correo_proveedor: prov.correo_proveedor || '',
      direccion_proveedor: prov.direccion_proveedor || '',
    });
    setEditandoId(prov.id_proveedor);
    setMostrarNuevo(true);
  };

  const resumen = (idProveedor: number | null | undefined) => {
    const lista = productos.filter((p) => p.id_proveedor_pr === idProveedor);
    return {
      cantidad: lista.length,
      stock: lista.reduce((sum, p) => sum + (p.stock_producto || 0), 0),
    };
  };

  return (
    <motion.section
      className="admin-panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="ap-header">
        <div>
          <h1 className="ap-title">Proveedores</h1>
          <p className="ap-subtitle">
            Proveedores registrados, cuántos productos manejan y su stock para solicitar reabastecimiento.
          </p>
        </div>
        <div className="ap-header-right">
          <button type="button" className="ap-btn ap-btn-primary" onClick={() => setMostrarNuevo(true)}>
            <FaPlus /> Nuevo proveedor
          </button>
        </div>
      </div>

      {cargando ? (
        <div className="ap-card">
          <div className="ap-states">
            <span className="ap-loader" />
            <h3>Cargando proveedores</h3>
            <p>Consultando proveedores y productos...</p>
          </div>
        </div>
      ) : error ? (
        <div className="ap-card">
          <div className="ap-states error">
            <div className="ap-states-icon">
              <FaCircleInfo />
            </div>
            <h3>No se pudieron cargar los proveedores</h3>
            <p>Verifica tu conexión e inténtalo nuevamente.</p>
            <button type="button" className="ap-btn ap-btn-ghost" onClick={cargar}>
              Reintentar
            </button>
          </div>
        </div>
      ) : proveedores.length === 0 ? (
        <div className="ap-card">
          <div className="ap-states">
            <div className="ap-states-icon">
              <FaTruckField />
            </div>
            <h3>No hay proveedores registrados</h3>
            <p>Agrega tu primer proveedor para asociar productos a sus marcas.</p>
          </div>
        </div>
      ) : (
        <div className="ap-card">
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead>
                <tr>
                  <th>Proveedor</th>
                  <th>Contacto</th>
                  <th>Teléfono / Correo</th>
                  <th>Productos</th>
                  <th>Stock total</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {proveedores.map((prov) => {
                  const r = resumen(prov.id_proveedor);
                  return (
                    <tr key={prov.id_proveedor}>
                      <td>
                        <div className="ap-cell-user">
                          <div className="an-icon cuenta" style={{ width: 38, height: 38, fontSize: 16 }}>
                            <FaTruckField />
                          </div>
                          <div>
                            <strong>{prov.nombre_proveedor}</strong>
                            {prov.direccion_proveedor && <span>{prov.direccion_proveedor}</span>}
                          </div>
                        </div>
                      </td>
                      <td>{prov.contacto_proveedor || <span className="muted">—</span>}</td>
                      <td>
                        {prov.telefono_proveedor && <div>{prov.telefono_proveedor}</div>}
                        {prov.correo_proveedor && <div className="muted" style={{ fontSize: 12 }}>{prov.correo_proveedor}</div>}
                        {!prov.telefono_proveedor && !prov.correo_proveedor && <span className="muted">—</span>}
                      </td>
                      <td>
                        <span className="ap-badge info">
                          <FaBoxesStacked style={{ marginRight: 6 }} />
                          {r.cantidad} producto{r.cantidad === 1 ? '' : 's'}
                        </span>
                      </td>
                      <td>
                        <span className="ap-badge ok">{r.stock} u.</span>
                      </td>
                      <td>
                        <div className="ap-table-acciones">
                          <button type="button" className="ap-btn ap-btn-ghost" onClick={() => abrirEdicion(prov)}>
                            <FaPen /> Editar
                          </button>
                          <Link to={`/admin/productos?proveedor=${prov.id_proveedor}`} className="ap-btn ap-btn-ghost">
                            Ver productos
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {mostrarNuevo && (
        <div className="ap-modal-overlay">
          <form className="ap-modal" onSubmit={crearProveedor} onClick={(e) => e.stopPropagation()}>
            <h3>
              <FaTruckField style={{ color: '#ffd98a', marginRight: 8 }} />
              {editandoId !== null ? 'Editar proveedor' : 'Nuevo proveedor'}
            </h3>
            <div className="ap-form-group">
              <label className="ap-form-label" htmlFor="apf-nombre">Nombre *</label>
              <input
                id="apf-nombre"
                className="ap-form-input"
                type="text"
                value={form.nombre_proveedor}
                onChange={(e) => setCampo('nombre_proveedor', e.target.value)}
                placeholder="Ej: Proveedora Olímpica"
              />
            </div>
            <div className="ap-form-group">
              <label className="ap-form-label" htmlFor="apf-contacto">Contacto</label>
              <input
                id="apf-contacto"
                className="ap-form-input"
                type="text"
                value={form.contacto_proveedor}
                onChange={(e) => setCampo('contacto_proveedor', e.target.value)}
                placeholder="Nombre de la persona de contacto"
              />
            </div>
            <div className="ap-form-group">
              <label className="ap-form-label" htmlFor="apf-tel">Teléfono</label>
              <input
                id="apf-tel"
                className="ap-form-input"
                type="text"
                value={form.telefono_proveedor}
                onChange={(e) => setCampo('telefono_proveedor', e.target.value.replace(/\D/g, ''))}
                placeholder="+57 300 000 0000"
              />
            </div>
            <div className="ap-form-group">
              <label className="ap-form-label" htmlFor="apf-correo">Correo</label>
              <input
                id="apf-correo"
                className="ap-form-input"
                type="email"
                value={form.correo_proveedor}
                onChange={(e) => setCampo('correo_proveedor', e.target.value)}
                placeholder="contacto@proveedor.com"
              />
            </div>
            <div className="ap-form-group">
              <label className="ap-form-label" htmlFor="apf-dir">Dirección</label>
              <input
                id="apf-dir"
                className="ap-form-input"
                type="text"
                value={form.direccion_proveedor}
                onChange={(e) => setCampo('direccion_proveedor', e.target.value)}
                placeholder="Calle 123 #45-67, Bogotá"
              />
            </div>
            <div className="ap-modal-actions">
              <button type="button" className="ap-btn ap-btn-ghost" onClick={() => { setMostrarNuevo(false); setEditandoId(null); setForm(VACIO); }} disabled={guardando}>
                <FaXmark /> Cancelar
              </button>
              <button type="submit" className="ap-btn ap-btn-primary" disabled={guardando}>
                <FaPen /> {guardando ? 'Guardando...' : editandoId !== null ? 'Guardar cambios' : 'Agregar proveedor'}
              </button>
            </div>
          </form>
        </div>
      )}

      {toast && (
        <div className={`ap-toast ${toast.tipo}`}>
          {toast.tipo === 'ok' ? <FaCircleCheck /> : <FaTriangleExclamation />}
          {toast.msg}
        </div>
      )}
    </motion.section>
  );
};

export default AdminProveedores;
