import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import ProductosPublicos from '@pages/public/ProductosPublicos';
import '@styles/auth-modal.css';

const AuthModalLayout = () => {
  const navigate = useNavigate();

  const close = () => navigate('/productos');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <>
      <ProductosPublicos />
      <div className="auth-modal-overlay" onClick={close}>
        <button
          type="button"
          className="auth-modal-close"
          onClick={(e) => {
            e.stopPropagation();
            close();
          }}
          aria-label="Cerrar"
        >
          <span aria-hidden="true">&times;</span>
        </button>
        <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default AuthModalLayout;