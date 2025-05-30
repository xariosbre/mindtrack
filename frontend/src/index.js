import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css'; // Importa estilos globais
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './context/AuthContext'; // Importa o AuthProvider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Envolve o aplicativo com o AuthProvider para disponibilizar o contexto de autenticação */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

// Se você quiser começar a medir o desempenho no seu aplicativo, passe uma função
// para registrar os resultados (por exemplo: reportWebVitals(console.log))
// ou envie para um endpoint de análise. Saiba mais: https://bit.ly/CRA-vitals
reportWebVitals();