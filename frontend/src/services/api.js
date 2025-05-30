// mindtrack/frontend/src/services/api.js

import axios from 'axios';

// URL base do seu backend Flask.
// Certifique-se de que esta URL corresponda ao host e porta onde seu backend está rodando.
// No seu caso, é 127.0.0.1:5000
const API_BASE_URL = 'http://127.0.0.1:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Importante para enviar e receber cookies (JWT)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token JWT aos cabeçalhos de requisição
// Isso é útil se você estiver armazenando o token no localStorage/sessionStorage
// No seu caso, com `withCredentials: true`, o Flask-JWT-Extended deve gerenciar o cookie automaticamente.
// No entanto, se você optar por enviar o token no cabeçalho 'Authorization', este interceptor seria necessário.
/*
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token'); // Ou sessionStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
*/

// Interceptor para lidar com erros de resposta, especialmente 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Se for um erro 401 (Não Autorizado), você pode:
      // 1. Redirecionar para a página de login
      // 2. Limpar o contexto de autenticação
      // 3. Mostrar uma mensagem para o usuário
      console.error('Erro 401: Não autorizado. Redirecionando para o login...');
      // Exemplo de redirecionamento (assumindo que você tem acesso ao history ou router)
      // window.location.href = '/login'; // Redirecionamento forçado
      // Ou, se usando AuthContext, você pode ter uma função para deslogar:
      // import { useAuth } from '../context/AuthContext';
      // const { logout } = useAuth(); logout();
    }
    return Promise.reject(error);
  }
);

export default api;