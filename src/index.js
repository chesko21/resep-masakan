import React from 'react';
import { createRoot } from 'react-dom/client'; 
import './styles/tailwind.css';
import App from './App';
import './services/firebase';

const rootElement = document.getElementById('root');

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
