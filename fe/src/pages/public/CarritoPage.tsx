import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaTrashCan, FaCartShopping, FaCircleCheck, FaExclamation } from 'react-icons/fa6';
import { useCart } from '@contexts/CartContext';
import { useIdioma } from '@i18n/IdiomaContext';
import '@styles/carrito.css';

const CarritoPage = () => {
  const navigate = useNavigate();
  const { t } = useIdioma();
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCart();
  const [toast, setToast] = useState<{ msg: string; tipo: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, tipo: 'success' | 'error' = 'success') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFinalizar = () => {
    if (items.length === 0) {
      showToast(t('carrito.toastVacio'), 'error');
      return;
    }
    clearCart();
    showToast(t('carrito.gracias'));
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
            <h1>{t('carrito.miCarrito')}</h1>
            <p>
              {totalItems > 0
                ? (totalItems === 1 ? t('carrito.unProducto', { n: totalItems }) : t('carrito.variosProductos', { n: totalItems }))
                : t('carrito.aunVacio')}
            </p>
          </div>
          <button type="button" className="carrito-back-btn" onClick={() => navigate('/productos')}>
            <FaArrowLeft /> {t('carrito.volverProductos')}
          </button>
        </header>

        {items.length === 0 ? (
          <div className="carrito-vacio">
            <FaCartShopping className="carrito-vacio-icon" />
            <h2>{t('carrito.vacio')}</h2>
            <p>{t('carrito.vacioExterior')}</p>
            <button type="button" className="carrito-vacio-btn" onClick={() => navigate('/productos')}>
              {t('carrito.explorar')}
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
                      {item.color && <span className="carrito-item-color">{t('carrito.color', { color: item.color })}</span>}
                      <span className="carrito-item-precio-unit">
                        ${item.precio_venta_producto.toLocaleString()} COP {t('carrito.unidad')}
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
                        aria-label={t('carrito.eliminarProducto')}
                        title={t('carrito.eliminar')}
                      >
                        <FaTrashCan />
                      </button>
                    </div>
                  </article>
                );
              })}

              <button type="button" className="carrito-clear" onClick={clearCart}>
                {t('carrito.vaciar')}
              </button>
            </div>

            <aside className="carrito-resumen">
              <h2>{t('carrito.resumen')}</h2>
              <div className="carrito-resumen-row">
                <span>{t('carrito.productos')} ({totalItems})</span>
                <span>${totalPrice.toLocaleString()} COP</span>
              </div>
              <div className="carrito-resumen-row">
                <span>{t('carrito.envio')}</span>
                <span>{t('carrito.seCalculaFinalizar')}</span>
              </div>
              <div className="carrito-resumen-total">
                <span>{t('carrito.total')}</span>
                <span>${totalPrice.toLocaleString()} COP</span>
              </div>
              <button type="button" className="carrito-finalizar-btn" onClick={handleFinalizar}>
                {t('carrito.finalizarCompra')}
              </button>
              <p className="carrito-resumen-hint">{t('carrito.hintPago')}</p>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
};

export default CarritoPage;
