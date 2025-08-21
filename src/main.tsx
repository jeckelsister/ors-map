import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import './index.css';

// Register service worker for performance optimizations
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/ors-map/sw.js')
      .then((registration) => {
        // Service worker registered successfully
        registration.update();
      })
      .catch(() => {
        // Service worker registration failed
      });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
