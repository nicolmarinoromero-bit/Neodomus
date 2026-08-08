import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaBoxesStacked,
  FaCalendarCheck,
  FaUsers,
  FaChartLine,
  FaWallet,
  FaCircleCheck,
  FaXmark,
  FaUserGear,
  FaBagShopping,
  FaArrowRight,
  FaBell,
  FaArrowTrendUp,
  FaRotate,
  FaCircleInfo,
  FaBolt,
  FaEnvelopeOpenText,
} from 'react-icons/fa6';
import '@styles/admin-panel.css';
import '@styles/dashboard-admin.css';
import api from '@services/api';
import type { SolicitudCuenta, ReporteResumen, ProductoAdmin } from '../../types';

interface PaginaProductos {
  total: number;
  data: ProductoAdmin[];
}

const AccesosRapidos = [
  {
    to: '/admin/productos',
    icon: <FaBoxesStacked />,
    label: 'Productos',
    desc: 'Catálogo y stock',
  },
  {
    to: '/admin/tecnicos',
    icon: <FaUserGear />,
    label: 'Técnicos',
    desc: 'Equipo de instalación',
  },
  {
    to: '/admin/instalaciones',
    icon: <FaCalendarCheck />,
    label: 'Instalaciones',
    desc: 'Citas y agenda',
  },
  {
    to: '/admin/clientes',
    icon: <FaUsers />,
    label: 'Clientes',
    desc: 'Cuentas registradas',
  },
  {
    to: '/admin/consultas',
    icon: <FaEnvelopeOpenText />,
    label: 'Solicitudes',
    desc: 'Consultas de soporte',
  },
  {
    to: '/admin/reportes',
    icon: <FaChartLine />,
    label: 'Reportes',
    desc: 'Estadísticas del negocio',
  },
  {
    to: '/admin/notificaciones',
    icon: <FaBell />,
    label: 'Notificaciones',
    desc: 'Avisos y aprobaciones',
  },
];

const formatoPesos = (v: number) => `$${Math.round(v).toLocaleString('es-CO')}`;
const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const AdminDashboard = () => {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [datos, setDatos] = useState<ReporteResumen | null>(null);
  const [solicitudes, setSolicitudes] = useState<SolicitudCuenta[]>([]);
  const [resolviendoId, setResolviendoId] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [stockAlertas, setStockAlertas] = useState<{ agotados: number; bajos: number } | null>(null);

  const cargar = async () => {
    setCargando(true);
    setError(false);
    try {
      const [report, reqs, prods] = await Promise.all([
        api.get<ReporteResumen>('/reports/resumen'),
        api.get<SolicitudCuenta[]>('/admin/account-requests'),
        api.get<PaginaProductos>('/productos/?limit=100&estado=activo'),
      ]);
      setDatos(report.data);
      setSolicitudes(reqs.data);
      const activos = prods.data.data || [];
      setStockAlertas({
        agotados: activos.filter((p) => p.stock_producto <= 0).length,
        bajos: activos.filter((p) => p.stock_producto > 0 && p.stock_producto < p.stock_minimo).length,
      });
    } catch {
      setError(true);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const resolver = async (id: number, accion: 'aprobar' | 'rechazar') => {
    setResolviendoId(id);
    setMensaje(null);
    try {
      await api.put(`/admin/account-requests/${id}/${accion}`);
      setMensaje({ type: 'ok', text: accion === 'aprobar' ? 'Solicitud aprobada' : 'Solicitud rechazada' });
      const res = await api.get<SolicitudCuenta[]>('/admin/account-requests');
      setSolicitudes(res.data);
      window.dispatchEvent(new CustomEvent('admin-solicitudes-updated'));
    } catch (err: any) {
      setMensaje({ type: 'err', text: err.response?.data?.detail || 'No se pudo procesar la solicitud' });
    } finally {
      setResolviendoId(null);
    }
  };

  const pendientes = solicitudes.filter((s) => s.estado === 'pendiente');
  const ultimasPendientes = pendientes.slice(0, 4);
  const hoy = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const maxVentas = Math.max(...(datos?.pedidos_por_mes ?? []).map((p) => p.ventas), 0) || 1;

  return (
    <motion.section
      className="admin-panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="ap-header">
        <div>
          <h1 className="ap-title">Panel de control</h1>
          <p className="ap-subtitle">Resumen del negocio · {hoy}</p>
        </div>
        <div className="ap-header-right">
          <button type="button" className="ap-btn ap-btn-ghost" onClick={cargar} disabled={cargando}>
            <FaRotate className={cargando ? 'spin' : ''} /> Actualizar
          </button>
        </div>
      </div>

      {error ? (
        <div className="ap-card">
          <div className="ap-states error">
            <div className="ap-states-icon">
              <FaCircleInfo />
            </div>
            <h3>No se pudo cargar el panel</h3>
            <button type="button" className="ap-btn ap-btn-ghost" onClick={cargar}>
              Reintentar
            </button>
          </div>
        </div>
      ) : cargando || !datos ? (
        <div className="ap-card">
          <div className="ap-states">
            <span className="ap-loader" />
            <h3>Cargando panel</h3>
          </div>
        </div>
      ) : (
        <>
          <div className="ap-kpis">
            <div className="ap-card ap-kpi">
              <div className="ap-kpi-label">
                <FaWallet /> Ventas totales
              </div>
              <div className="ap-kpi-value">{formatoPesos(datos.ventas_total)}</div>
              <div className="ap-mini-sub">{datos.pedidos_total} pedidos registrados</div>
            </div>
            <div className="ap-card ap-kpi">
              <div className="ap-kpi-label">
                <FaBagShopping /> Pedidos
              </div>
              <div className="ap-kpi-value">{datos.pedidos_total}</div>
              <div className="ap-mini-sub">
                {datos.pedidos_por_mes.length > 0 ? 'Con histórico mensual' : 'Sin pedidos aún'}
              </div>
            </div>
            <div className="ap-card ap-kpi">
              <div className="ap-kpi-label">
                <FaUsers /> Clientes registrados
              </div>
              <div className="ap-kpi-value">{datos.clientes_total}</div>
            </div>
            <div className="ap-card ap-kpi">
              <div className="ap-kpi-label">
                <FaCalendarCheck /> Citas / instalaciones
              </div>
              <div className="ap-kpi-value">{datos.citas_total}</div>
              <div className="ap-mini-sub">{datos.citas_por_estado.Pendiente} pendientes en el módulo</div>
            </div>
            <div className="ap-card ap-kpi">
              <div className="ap-kpi-label">
                <FaUserGear /> Técnicos
              </div>
              <div className="ap-kpi-value">
                {datos.tecnicos_activos}
                <span style={{ fontSize: '0.9rem', color: '#9f9f9f', fontWeight: 600 }}>
                  {' '}
                  / {datos.tecnicos_total} activos
                </span>
              </div>
            </div>
            <div className="ap-card ap-kpi">
              <div className="ap-kpi-label">
                <FaBoxesStacked /> Productos
              </div>
              <div className="ap-kpi-value">{datos.productos_total}</div>
              <div className="ap-mini-sub">{datos.productos_activos} activos en tienda</div>
            </div>
          </div>

          <div className="admin-dash-grid">
            <div className="admin-dash-col">
              <div className="ap-card">
                <div className="ap-card-head">
                  <h2>
                    <FaChartLine /> Ventas por mes
                  </h2>
                  <Link to="/admin/reportes" className="ap-btn ap-btn-ghost">
                    Ver reportes <FaArrowRight />
                  </Link>
                </div>
                {datos.pedidos_por_mes.length === 0 ? (
                  <p className="solicitudes-vacio">Aún no hay ventas registradas para graficar.</p>
                ) : (
                  <div className="ap-chart-wrap">
                    {datos.pedidos_por_mes.map((p) => {
                      const [y, m] = p.mes.split('-');
                      return (
                        <div className="ap-chart-bar-row" key={p.mes}>
                          <span className="ap-chart-row-mes">{`${MESES[(parseInt(m, 10) || 1) - 1]} ${y}`}</span>
                          <div
                            className="ap-chart-bar"
                            style={{ width: `${Math.max((p.ventas / maxVentas) * 100, 3)}%` }}
                          />
                          <span className="ap-chart-row-val">{formatoPesos(p.ventas)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="ap-card">
                <div className="ap-card-head">
                  <h2>
                    <FaArrowTrendUp /> Productos más vendidos
                  </h2>
                </div>
                {datos.productos_mas_vendidos.length === 0 ? (
                  <p className="solicitudes-vacio">Aún no hay ventas de productos registradas.</p>
                ) : (
                  <div className="ap-mini">
                    {datos.productos_mas_vendidos.slice(0, 5).map((p, i) => (
                      <div className="ap-mini-item" key={p.nombre_producto}>
                        <span className="ap-mini-icon">{i + 1}</span>
                        <div className="ap-mini-info">
                          <div className="ap-mini-title">{p.nombre_producto}</div>
                          <div className="ap-mini-sub">{p.cantidad} unidad(es)</div>
                        </div>
                        <span className="ap-mini-val">{formatoPesos(p.total)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="admin-dash-col">
              {(stockAlertas && (stockAlertas.agotados > 0 || stockAlertas.bajos > 0)) && (
                <div className="ap-card">
                  <div className="ap-card-head">
                    <h2>
                      <FaBolt /> Alertas de stock
                    </h2>
                  </div>
                  <div className="ap-mini">
                    {stockAlertas.agotados > 0 && (
                      <div className="ap-mini-item">
                        <span className="ap-mini-icon" style={{ color: '#ff8f93' }}>
                          {stockAlertas.agotados}
                        </span>
                        <div className="ap-mini-info">
                          <div className="ap-mini-title">Productos agotados</div>
                          <div className="ap-mini-sub">Requieren reposición</div>
                        </div>
                      </div>
                    )}
                    {stockAlertas.bajos > 0 && (
                      <div className="ap-mini-item">
                        <span className="ap-mini-icon" style={{ color: '#ffd98a' }}>
                          {stockAlertas.bajos}
                        </span>
                        <div className="ap-mini-info">
                          <div className="ap-mini-title">Stock bajo</div>
                          <div className="ap-mini-sub">Por debajo del mínimo</div>
                        </div>
                      </div>
                    )}
                  </div>
                  <Link to="/admin/productos" className="ap-btn ap-btn-ghost ap-btn-block">
                    Revisar inventario <FaArrowRight />
                  </Link>
                </div>
              )}

              <div className="ap-card">
                <div className="ap-card-head">
                  <h2>
                    <FaBolt /> Accesos rápidos
                  </h2>
                </div>
                <div className="ap-acciones">
                  {AccesosRapidos.map((a) => (
                    <Link to={a.to} className="ap-accion" key={a.to}>
                      <span className="ap-accion-icon">{a.icon}</span>
                      <span>
                        <strong>{a.label}</strong>
                        <em>{a.desc}</em>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="ap-card">
                <div className="ap-card-head">
                  <h2>
                    <FaBell /> Solicitudes de cuenta
                  </h2>
                </div>
                {mensaje && <div className={`solicitud-msg ${mensaje.type}`}>{mensaje.text}</div>}
                {ultimasPendientes.length === 0 ? (
                  <p className="solicitudes-vacio">
                    <FaCircleCheck />
                    No hay solicitudes de inhabilitación o habilitación pendientes.
                  </p>
                ) : (
                  <div className="solicitudes-list">
                    {ultimasPendientes.map((s) => (
                      <div key={s.id} className="solicitud-item pendiente">
                        <div className="solicitud-info">
                          <strong>{s.cliente_nombre}</strong>
                          <span className="solicitud-email">{s.cliente_email}</span>
                          <span className={`solicitud-badge tipo-${s.tipo}`}>
                            {s.tipo === 'habilitar' ? 'Habilitación' : 'Inhabilitación'}
                          </span>
                          <div className="solicitud-acciones">
                            <button
                              type="button"
                              className="solicitud-btn ok"
                              disabled={resolviendoId === s.id}
                              onClick={() => resolver(s.id, 'aprobar')}
                            >
                              <FaCircleCheck /> Aprobar
                            </button>
                            <button
                              type="button"
                              className="solicitud-btn no"
                              disabled={resolviendoId === s.id}
                              onClick={() => resolver(s.id, 'rechazar')}
                            >
                              <FaXmark /> Rechazar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {pendientes.length > 4 && (
                  <Link to="/admin/notificaciones" className="ap-btn ap-btn-ghost ap-btn-block">
                    Ver las {pendientes.length} solicitudes en Notificaciones <FaArrowRight />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </motion.section>
  );
};

export default AdminDashboard;