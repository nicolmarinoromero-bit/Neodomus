import { useEffect } from 'react';
import { useAuthModal } from '@contexts/AuthModalContext';
import Login from '@pages/auth/Login';
import Register from '@pages/auth/Register';
import ForgotPassword from '@pages/auth/ForgotPassword';
import VerifyCode from '@pages/auth/VerifyCode';
import ResetPassword from '@pages/auth/ResetPassword';
import VerifyEmail from '@pages/auth/VerifyEmail';
import '@styles/auth-modal.css';

const AuthModalHost = () => {
  const { step, closeAuth } = useAuthModal();

  useEffect(() => {
    if (!step) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAuth();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [step, closeAuth]);

  if (!step) return null;

  return (
    <div className="auth-modal-overlay" onClick={closeAuth}>
      <button
        type="button"
        className="auth-modal-close"
        onClick={(e) => {
          e.stopPropagation();
          closeAuth();
        }}
        aria-label="Cerrar"
      >
        <span aria-hidden="true">&times;</span>
      </button>
      <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
        {step === 'ingresar' && <Login />}
        {step === 'registro' && <Register />}
        {step === 'recuperar' && <ForgotPassword />}
        {step === 'verificar-codigo' && <VerifyCode />}
        {step === 'verificar-email' && <VerifyEmail />}
        {step === 'restablecer' && <ResetPassword />}
      </div>
    </div>
  );
};

export default AuthModalHost;
