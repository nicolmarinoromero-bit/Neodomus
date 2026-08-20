import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaChartLine,
  FaCircleInfo,
  FaCircleCheck,
  FaRotate,
  FaWallet,
  FaBoxesStacked,
  FaUsers,
  FaClock,
  FaUserGear,
  FaBagShopping,
  FaCalendarCheck,
  FaArrowTrendUp,
  FaXmark,
  FaTriangleExclamation,
} from 'react-icons/fa6';
import '@styles/admin-panel.css';
import '@styles/dashboard-admin.css';
import api from '@services/api';
import type { ReporteResumen } from '../../types';

const MESES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

const AdminReportes = () => {
  const [datos, setDatos] = useState<ReporteResumen | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  const cargar = async () => {
    setCargando(true);
    setError(false);
    try {
      const res = await api.get<ReporteResumen>('/reports/resumen');
      setDatos(res.data);
    } catch {
      setError(true);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const formatoPesos = (v: number) => `$${Math.round(v).toLocaleString('es-CO')}`;

  const mesLabel = (mes: string) => {
    const [y, m] = mes.split('-');
    return `${MESES[(parseInt(m, 10) || 1) - 1] ?? m} ${y}`;
  };

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
          <h1 className="ap-title">Reportes</h1>
          <p className="ap-subtitle">Estadísticas actualizadas con los datos reales del sistema.</p>
        </div>
        <div className="ap-header-right">
          <button type="button" className="ap-btn ap-btn-ghost" onClick={cargar} disabled={cargando}>
            <FaRotate className={cargando ? 'spin' : ''} /> Actualizar
          </button>
        </div>
      </div>

      {cargando ? (
        <div className="ap-card">
          <div className="ap-states">
            <span className="ap-loader" />
            <h3>Generando reportes</h3>
            <p>Calculando las estadísticas del sistema...</p>
          </div>
        </div>
      ) : error ? (
        <div className="ap-card">
          <div className="ap-states error">
            <div className="ap-states-icon">
              <FaCircleInfo />
            </div>
            <h3>No se pudieron generar los reportes</h3>
            <p>Verifica tu conexión e inténtalo nuevamente.</p>
            <button type="button" className="ap-btn ap-btn-ghost" onClick={cargar}>
              Reintentar
            </button>
          </div>
        </div>
      ) : datos ? (
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
              <div className="ap-mini-sub">
                {datos.citas_por_estado.Pendiente} pendientes · {datos.citas_por_estado.Confirmada} confirmadas ·{' '}
                {datos.citas_por_estado.Finalizada} finalizadas
              </div>
            </div>
            <div className="ap-card ap-kpi">
              <div className="ap-kpi-label">
                <FaUserGear /> Técnicos
              </div>
              <div className="ap-kpi-value">
                {datos.tecnicos_activos}
                <span style={{ fontSize: '0.9rem', color: '#9f9f9f', fontWeight: 600 }}>
                  {' '}
                  / {datos.tecnicos_total}
                </span>
              </div>
              <div className="ap-mini-sub">activos en el sistema</div>
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
                </div>
                {datos.pedidos_por_mes.length === 0 ? (
                  <p className="solicitudes-vacio">Aún no hay ventas registradas para graficar.</p>
                ) : (
                  <div className="ap-chart-wrap">
                    {datos.pedidos_por_mes.map((p) => (
                      <div className="ap-chart-bar-row" key={p.mes}>
                        <span className="ap-chart-row-mes">{mesLabel(p.mes)}</span>
                        <div
                          className="ap-chart-bar"
                          style={{ width: `${Math.max((p.ventas / maxVentas) * 100, 3)}%` }}
                        />
                        <span className="ap-chart-row-val">{formatoPesos(p.ventas)}</span>
                      </div>
                    ))}
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
                    {datos.productos_mas_vendidos.map((p, i) => (
                      <div className="ap-mini-item" key={p.nombre_producto}>
                        <span className="ap-mini-icon">{i + 1}</span>
                        <div className="ap-mini-info">
                          <div className="ap-mini-title">{p.nombre_producto}</div>
                          <div className="ap-mini-sub">{p.cantidad} unidad(es) vendida(s)</div>
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
                    <FaCalendarCheck /> Citas por estado
                  </h2>
                </div>
                <div className="ap-mini">
                  <div className="ap-mini-item">
                    <span className="ap-mini-icon" style={{ color: '#ffd700', borderColor: 'rgba(255,215,0,0.4)' }}>
                      <FaClock />
                    </span>
                    <div className="ap-mini-info">
                      <div className="ap-mini-title">Pendientes</div>
                      <div className="ap-mini-sub">Por confirmar o finalizar</div>
                    </div>
                    <span className="ap-mini-val">{datos.citas_por_estado.Pendiente}</span>
                  </div>
                  <div className="ap-mini-item">
                    <span className="ap-mini-icon" style={{ color: '#8ab4f8', borderColor: 'rgba(138,180,248,0.4)' }}>
                      <FaCircleCheck />
                    </span>
                    <div className="ap-mini-info">
                      <div className="ap-mini-title">Confirmadas</div>
                      <div className="ap-mini-sub">Con fecha y técnico asignado</div>
                    </div>
                    <span className="ap-mini-val">{datos.citas_por_estado.Confirmada}</span>
                  </div>
                  <div className="ap-mini-item">
                    <span className="ap-mini-icon" style={{ color: '#46d06f', borderColor: 'rgba(70,160,67,0.4)' }}>
                      <FaCircleCheck />
                    </span>
                    <div className="ap-mini-info">
                      <div className="ap-mini-title">Finalizadas</div>
                      <div className="ap-mini-sub">Instalaciones completadas</div>
                    </div>
                    <span className="ap-mini-val">{datos.citas_por_estado.Finalizada}</span>
                  </div>
                  <div className="ap-mini-item">
                    <span className="ap-mini-icon" style={{ color: '#ff8f93', borderColor: 'rgba(229,72,77,0.4)' }}>
                      <FaXmark />
                    </span>
                    <div className="ap-mini-info">
                      <div className="ap-mini-title">Canceladas</div>
                      <div className="ap-mini-sub">Canceladas por el cliente</div>
                    </div>
                    <span className="ap-mini-val">{datos.citas_por_estado.Cancelada}</span>
                  </div>
                </div>
              </div>

              <div className="ap-card">
                <div className="ap-card-head">
                  <h2>
                    <FaUsers /> Resumen del sistema
                  </h2>
                </div>
                <div className="ap-mini">
                  <div className="ap-mini-item">
                    <span className="ap-mini-icon">
                      <FaUsers />
                    </span>
                    <div className="ap-mini-info">
                      <div className="ap-mini-title">Clientes</div>
                      <div className="ap-mini-sub">Cuentas registradas</div>
                    </div>
                    <span className="ap-mini-val">{datos.clientes_total}</span>
                  </div>
                  <div className="ap-mini-item">
                    <span className="ap-mini-icon">
                      <FaUserGear />
                    </span>
                    <div className="ap-mini-info">
                      <div className="ap-mini-title">Técnicos activos</div>
                      <div className="ap-mini-sub">Con acceso al sistema</div>
                    </div>
                    <span className="ap-mini-val">{datos.tecnicos_activos}</span>
                  </div>
                  <div className="ap-mini-item">
                    <span className="ap-mini-icon">
                      <FaTriangleExclamation />
                    </span>
                    <div className="ap-mini-info">
                      <div className="ap-mini-title">Solicitudes pendientes</div>
                      <div className="ap-mini-sub">Por revisar en el dashboard</div>
                    </div>
                    <span className="ap-mini-val">{datos.solicitudes_pendientes}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </motion.section>
  );
};

export default AdminReportes;