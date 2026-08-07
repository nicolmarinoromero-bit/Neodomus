import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@contexts/AuthContext';
import { AuthModalProvider } from '@contexts/AuthModalContext';
import { CartProvider } from '@contexts/CartContext';
import { IdiomaProvider } from '@i18n/IdiomaContext';
import App from './App';
import './styles/navbar.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <IdiomaProvider>
        <AuthProvider>
          <AuthModalProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </AuthModalProvider>
        </AuthProvider>
      </IdiomaProvider>
    </BrowserRouter>
  </React.StrictMode>
);