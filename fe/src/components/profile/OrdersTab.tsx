import { useState } from 'react';
import { FaBoxOpen, FaChevronDown, FaChevronUp, FaLocationDot } from 'react-icons/fa6';
import { getPedidos, saveItem, PF_PEDIDOS_KEY, Pedido, EstadoPedido } from '@utils/profileStorage';
import SectionHeader from './SectionHeader';
import { NotifyFn } from './PersonalTab';

const estadoClase: Record<EstadoPedido, string> = {
  Procesando: 'procesando',
  Enviado: 'enviado',
  Entregado: 'entregado',
  Cancelado: 'cancelado',
};

const formatoPeso = (value: number) =>
  value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

const OrdersTab = ({ notify }: { notify: NotifyFn }) => {
  const [pedidos, setPedidos] = useState<Pedido[]>(getPedidos());
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleEstadoChange = (id: string, nuevo: EstadoPedido) => {
    const next = pedidos.map((p) => (p.id === id ? { ...p, estado: nuevo } : p));
    setPedidos(next);
    saveItem(PF_PEDIDOS_KEY, next);
    notify(`Estado del pedido ${id} actualizado a “${nuevo}”`, 'success');
  };

  return (
    <div className="pf-tab">
      <SectionHeader
        icon={<FaBoxOpen />}
        title="Mis pedidos"
        subtitle="Consulta el historial de tus compras y su estado."
      />

      {pedidos.length === 0 ? (
        <div className="pf-empty">
          <span className="pf-empty-icon"><FaBoxOpen /></span>
          <p>No tienes pedidos todavía. Cuando realices una compra, aparecerá aquí.</p>
        </div>
      ) : (
        <div className="pf-orders-list">
          {pedidos.map((pedido) => {
            const abierto = expanded === pedido.id;
            return (
              <div className="pf-order" key={pedido.id}>
                <div className="pf-order-top">
                  <div className="pf-order-id-col">
                    <span className="pf-order-id">{pedido.id}</span>
                    <span className="pf-order-folio">Factura {pedido.folio} · {pedido.fecha}</span>
                  </div>
                  <div className="pf-order-stats">
                    <select
                      className={`pf-status-badge ${estadoClase[pedido.estado]}`}
                      value={pedido.estado}
                      onChange={(e) => handleEstadoChange(pedido.id, e.target.value as EstadoPedido)}
                      aria-label={`Estado del pedido ${pedido.id}`}
                      title="Cambiar estado"
                    >
                      <option value="Procesando">Procesando</option>
                      <option value="Enviado">Enviado</option>
                      <option value="Entregado">Entregado</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                    <span className="pf-order-total">{formatoPeso(pedido.total)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="pf-order-toggle"
                  onClick={() => setExpanded(abierto ? null : pedido.id)}
                >
                  {abierto ? <FaChevronUp /> : <FaChevronDown />}
                  {abierto ? 'Ocultar detalle' : 'Ver detalle del pedido'}
                </button>

                {abierto && (
                  <div className="pf-order-details">
                    <div className="pf-order-items">
                      {pedido.items.map((item, idx) => (
                        <div className="pf-order-item" key={idx}>
                          <span className="pf-order-item-name">{item.nombre}</span>
                          <span className="pf-order-item-qty">× {item.cantidad}</span>
                          <span className="pf-order-item-price">{formatoPeso(item.precio)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pf-order-detail-footer">
                      <span className="pf-order-shipping">
                        <FaLocationDot /> Envío a tu dirección registrada
                      </span>
                      <strong className="pf-order-total-big">Total: {formatoPeso(pedido.total)}</strong>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersTab;