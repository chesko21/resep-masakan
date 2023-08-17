import React from 'react';
import ReactDOM from 'react-dom';
import './styles/tailwind.css';
import App from './App';
import './services/firebase';

const rootElement = document.getElementById('root');

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  rootElement
);
