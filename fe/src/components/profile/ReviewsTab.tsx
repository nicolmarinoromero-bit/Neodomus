import { useState } from 'react';
import { FaRegStar, FaStar, FaTrashCan, FaPlus } from 'react-icons/fa6';
import { getResenas, saveItem, PF_RESENAS_KEY, Resena } from '@utils/profileStorage';
import SectionHeader from './SectionHeader';
import { NotifyFn } from './PersonalTab';

const productosSugeridos = [
  'Kit domótica NeoDomus Smart Home',
  'Cámara IP 4K exterior',
  'Sensor de movimiento Wi-Fi',
  'Enchufe inteligente Wi-Fi',
];

const ReviewsTab = ({ notify }: { notify: NotifyFn }) => {
  const [resenas, setResenas] = useState<Resena[]>(getResenas());
  const [mostrarForm, setMostrarForm] = useState(false);
  const [producto, setProducto] = useState(productosSugeridos[0]);
  const [calificacion, setCalificacion] = useState(5);
  const [comentario, setComentario] = useState('');

  const eliminar = (id: string) => {
    const next = resenas.filter((r) => r.id !== id);
    setResenas(next);
    saveItem(PF_RESENAS_KEY, next);
    notify('Reseña eliminada', 'info');
  };

  const agregar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comentario.trim()) {
      notify('Escribe un comentario para tu reseña', 'error');
      return;
    }
    const nueva: Resena = {
      id: `r-${Date.now()}`,
      producto,
      productoImg: '/productos/1.jpg',
      calificacion,
      comentario: comentario.trim(),
      fecha: new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }),
    };
    const next = [nueva, ...resenas];
    setResenas(next);
    saveItem(PF_RESENAS_KEY, next);
    setComentario('');
    setProducto(productosSugeridos[0]);
    setCalificacion(5);
    setMostrarForm(false);
    notify('Reseña publicada correctamente', 'success');
  };

  return (
    <div className="pf-tab">
      <SectionHeader
        icon={<FaStar />}
        title="Mis reseñas"
        subtitle="Las opiniones que has dejado sobre nuestros productos y servicios."
        action={
          <button
            type="button"
            className="pf-btn pf-btn-primary"
            onClick={() => setMostrarForm((v) => !v)}
          >
            {mostrarForm ? (
              'Cancelar'
            ) : (
              <>
                <FaPlus /> Escribir reseña
              </>
            )}
          </button>
        }
      />

      {mostrarForm && (
        <form className="pf-review-form" onSubmit={agregar}>
          <div className="pf-form-grid">
            <div className="pf-form-group">
              <label className="pf-form-label" htmlFor="pf-res-producto">Producto</label>
              <select
                id="pf-res-producto"
                className="pf-form-input"
                value={producto}
                onChange={(e) => setProducto(e.target.value)}
              >
                {productosSugeridos.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="pf-form-group">
              <label className="pf-form-label">Calificación</label>
              <div className="pf-rating-input">
                {[...Array(5)].map((_, i) => (
                  <button
                    type="button"
                    key={i}
                    className={i < calificacion ? 'on' : ''}
                    onClick={() => setCalificacion(i + 1)}
                    aria-label={`${i + 1} estrellas`}
                  >
                    <FaStar />
                  </button>
                ))}
              </div>
            </div>
            <div className="pf-form-group pf-form-span">
              <label className="pf-form-label" htmlFor="pf-res-comentario">Tu experiencia</label>
              <textarea
                id="pf-res-comentario"
                className="pf-form-input pf-textarea"
                rows={3}
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Cuéntanos qué te pareció el producto…"
              />
            </div>
          </div>
          <div className="pf-form-actions">
            <button type="submit" className="pf-btn pf-btn-primary">Publicar reseña</button>
          </div>
        </form>
      )}

      {resenas.length === 0 ? (
        <div className="pf-empty">
          <span className="pf-empty-icon"><FaRegStar /></span>
          <p>Aún no has publicado reseñas.</p>
        </div>
      ) : (
        <div className="pf-review-list">
          {resenas.map((resena) => (
            <div className="pf-review-item" key={resena.id}>
              <div className="pf-review-main">
                <span className="pf-review-img">
                  <img
                    src={resena.productoImg}
                    alt={resena.producto}
                    onError={(e) => { e.currentTarget.style.opacity = '0.12'; }}
                  />
                  <span className="pf-stars pf-stars-overlay">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className={i < resena.calificacion ? 'on' : 'off'} />
                    ))}
                  </span>
                </span>
                <div className="pf-review-body">
                  <div className="pf-review-top">
                    <strong className="pf-review-producto">{resena.producto}</strong>
                    <span className="pf-review-fecha">{resena.fecha}</span>
                  </div>
                  <p className="pf-review-comentario">{resena.comentario}</p>
                </div>
              </div>
              <div className="pf-review-actions">
                <button
                  type="button"
                  className="pf-icon-btn danger"
                  onClick={() => eliminar(resena.id)}
                  title="Eliminar reseña"
                >
                  <FaTrashCan />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsTab;