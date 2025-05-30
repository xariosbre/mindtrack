import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api'; // Importa a instância do Axios
import { useNavigate } from 'react-router-dom'; // Para redirecionamento

// Cria o contexto de autenticação
const AuthContext = createContext(null);

// Hook personalizado para consumir o contexto de autenticação
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provedor de autenticação
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Armazena os dados do usuário autenticado
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Estado de autenticação
  const [loading, setLoading] = useState(true); // Para indicar se a verificação inicial está em andamento
  const navigate = useNavigate(); // Hook para navegação programática

  // Função para verificar o token JWT ao carregar o aplicativo
  const verifyToken = useCallback(async () => {
    try {
      setLoading(true);
      // A rota /verify_token no backend verifica a validade do cookie JWT
      const response = await api.get('/auth/verify_token');
      if (response.status === 200 && response.data.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      setUser(null);
      setIsAuthenticated(false);
      // Se o token for inválido, expirado ou não existir, o backend retorna 401
      // O interceptor do Axios já pode lidar com o redirecionamento ou você pode fazer aqui.
    } finally {
      setLoading(false);
    }
  }, []);

  // Efeito para verificar o token ao montar o componente (uma vez)
  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  // Função de login
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', { email, senha: password });
      if (response.status === 200 && response.data.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        navigate('/dashboard'); // Redireciona para o dashboard após o login
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      console.error('Erro no login:', error.response?.data || error.message);
      setIsAuthenticated(false);
      return { success: false, error: error.response?.data?.error || 'Erro ao fazer login.' };
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const logout = async () => {
    try {
      setLoading(true);
      await api.post('/auth/logout');
      setUser(null);
      setIsAuthenticated(false);
      navigate('/login'); // Redireciona para a página de login após o logout
      return { success: true, message: 'Logout bem-sucedido.' };
    } catch (error) {
      console.error('Erro no logout:', error.response?.data || error.message);
      return { success: false, error: error.response?.data?.error || 'Erro ao fazer logout.' };
    } finally {
      setLoading(false);
    }
  };

  // Valor do contexto que será disponibilizado para os componentes filhos
  const contextValue = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    verifyToken, // Para re-verificar o token após certas ações (ex: atualização de perfil)
    setUser, // Para atualizar o estado do usuário diretamente (ex: após edição de perfil)
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};