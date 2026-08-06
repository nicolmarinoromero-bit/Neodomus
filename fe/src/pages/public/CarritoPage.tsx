import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaTrashCan, FaCartShopping, FaCircleCheck, FaExclamation } from 'react-icons/fa6';
import { useCart } from '@contexts/CartContext';
import '@styles/carrito.css';

const CarritoPage = () => {
  const navigate = useNavigate();
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCart();
  const [toast, setToast] = useState<{ msg: string; tipo: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, tipo: 'success' | 'error' = 'success') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFinalizar = () => {
    if (items.length === 0) {
      showToast('Tu carrito está vacío', 'error');
      return;
    }
    clearCart();
    showToast('¡Gracias por tu compra! Tu pedido ha sido registrado');
  };

  return (
    <div className="carrito-page app-glass">
      {toast && (
        <div className={`carrito-toast ${toast.tipo}`}>
          {toast.tipo === 'success' ? <FaCircleCheck /> : <FaExclamation />}
          <span>{toast.msg}</span>
        </div>
      )}

      <main className="carrito-main">
        <header className="carrito-header">
          <div>
            <h1>Mi carrito</h1>
            <p>
              {totalItems > 0
                ? `${totalItems} ${totalItems === 1 ? 'producto' : 'productos'} en tu carrito`
                : 'Aún no tienes productos en tu carrito'}
            </p>
          </div>
          <button type="button" className="carrito-back-btn" onClick={() => navigate('/productos')}>
            <FaArrowLeft /> Volver a productos
          </button>
        </header>

        {items.length === 0 ? (
          <div className="carrito-vacio">
            <FaCartShopping className="carrito-vacio-icon" />
            <h2>Tu carrito está vacío</h2>
            <p>Explora nuestro catálogo y encuentra lo que necesitas para tu hogar inteligente.</p>
            <button type="button" className="carrito-vacio-btn" onClick={() => navigate('/productos')}>
              Explorar productos
            </button>
          </div>
        ) : (
          <div className="carrito-layout">
            <div className="carrito-items">
              {items.map(item => {
                const key = item.color ? `${item.id_producto}-${item.color.toLowerCase()}` : `${item.id_producto}`;
                return (
                  <article key={key} className="carrito-item">
                    <Link to={`/producto/${item.id_producto}`} className="carrito-item-img">
                      <img
                        src={item.imagen}
                        alt={item.nombre_producto}
                        onError={(e) => (e.currentTarget.src = '/productos/default.png')}
                      />
                    </Link>

                    <div className="carrito-item-info">
                      <Link to={`/producto/${item.id_producto}`} className="carrito-item-nombre">
                        {item.nombre_producto}
                      </Link>
                      {item.color && <span className="carrito-item-color">Color: {item.color}</span>}
                      <span className="carrito-item-precio-unit">
                        ${item.precio_venta_producto.toLocaleString()} COP / unidad
                      </span>
                    </div>

                    <div className="carrito-item-controls">
                      <div className="carrito-cantidad">
                        <button
                          type="button"
                          onClick={() => updateQuantity(key, item.cantidad - 1)}
                          aria-label="Reducir cantidad"
                        >
                          −
                        </button>
                        <span>{item.cantidad}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(key, item.cantidad + 1)}
                          aria-label="Aumentar cantidad"
                        >
                          +
                        </button>
                      </div>

                      <span className="carrito-item-subtotal">
                        ${(item.precio_venta_producto * item.cantidad).toLocaleString()} COP
                      </span>

                      <button
                        type="button"
                        className="carrito-item-remove"
                        onClick={() => removeItem(key)}
                        aria-label="Eliminar producto"
                        title="Eliminar del carrito"
                      >
                        <FaTrashCan />
                      </button>
                    </div>
                  </article>
                );
              })}

              <button type="button" className="carrito-clear" onClick={clearCart}>
                Vaciar carrito
              </button>
            </div>

            <aside className="carrito-resumen">
              <h2>Resumen del pedido</h2>
              <div className="carrito-resumen-row">
                <span>Productos ({totalItems})</span>
                <span>${totalPrice.toLocaleString()} COP</span>
              </div>
              <div className="carrito-resumen-row">
                <span>Envío</span>
                <span>Se calcula al finalizar</span>
              </div>
              <div className="carrito-resumen-total">
                <span>Total</span>
                <span>${totalPrice.toLocaleString()} COP</span>
              </div>
              <button type="button" className="carrito-finalizar-btn" onClick={handleFinalizar}>
                Finalizar compra
              </button>
              <p className="carrito-resumen-hint">El pago se confirmará al enviar tu pedido.</p>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
};

export default CarritoPage;
