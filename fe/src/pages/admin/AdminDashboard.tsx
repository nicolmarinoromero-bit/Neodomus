import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaBoxesStacked,
  FaCalendarCheck,
  FaUsers,
  FaChartLine,
  FaWallet,
  FaUserGear,
  FaBagShopping,
  FaArrowRight,
  FaBell,
  FaArrowTrendUp,
  FaRotate,
  FaCircleInfo,
  FaBolt,
  FaEnvelopeOpenText,
  FaTruckField,
  FaUserShield,
} from 'react-icons/fa6';
import '@styles/admin-panel.css';
import '@styles/dashboard-admin.css';
import api from '@services/api';
import type { ReporteResumen } from '../../types';


const AccesosRapidos = [
  {
    to: '/admin/productos',
    icon: <FaBoxesStacked />,
    label: 'Catálogo',
    desc: 'Catálogo de productos',
  },
  {
    to: '/admin/proveedores',
    icon: <FaTruckField />,
    label: 'Proveedores',
    desc: 'Proveedores y reabastecimiento',
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
    label: 'Citas',
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
  {
    to: '/perfil/admin',
    icon: <FaUserShield />,
    label: 'Mi perfil',
    desc: 'Datos de tu cuenta',
  },
];

const formatoPesos = (v: number) => `$${Math.round(v).toLocaleString('es-CO')}`;
const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const AdminDashboard = () => {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [datos, setDatos] = useState<ReporteResumen | null>(null);

  const cargar = async () => {
    setCargando(true);
    setError(false);
    try {
      const report = await api.get<ReporteResumen>('/reports/resumen');
      setDatos(report.data);
    } catch {
      setError(true);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

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
                <FaCalendarCheck /> Citas
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
                      if (!p.mes) return null;
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
            </div>
          </div>
        </>
      )}
    </motion.section>
  );
};

export default AdminDashboard;