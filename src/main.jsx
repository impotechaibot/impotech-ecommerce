import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { StoreProvider } from './context/StoreContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <StoreProvider>
        <App />
        <Toaster
          position="top-center"
          toastOptions={{
            style: { background: '#17171d', color: '#f4f4f6', border: '1px solid #26262e' },
          }}
        />
      </StoreProvider>
    </BrowserRouter>
  </React.StrictMode>
);
