import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '@contexts/AuthContext';
import { AuthModalProvider } from '@contexts/AuthModalContext';
import { CartProvider } from '@contexts/CartContext';
import { IdiomaProvider } from '@i18n/IdiomaContext';
import App from './App';
import './styles/navbar.css'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <IdiomaProvider>
          <AuthProvider>
            <AuthModalProvider>
              <CartProvider>
                <App />
              </CartProvider>
            </AuthModalProvider>
          </AuthProvider>
        </IdiomaProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);