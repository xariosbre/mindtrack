import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner'; // Importa o spinner de carregamento

const PrivateRoute = ({ allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth(); // Obtém o estado de autenticação e o usuário

  if (loading) {
    // Exibe um spinner enquanto a verificação de autenticação está em andamento
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <LoadingSpinner size="lg" />
        <p className="ml-4 text-lg text-gray-700">Carregando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Se não estiver autenticado, redireciona para a página de login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.tipo_usuario)) {
    // Se o usuário não tiver a permissão necessária (HU05), redireciona para uma página de acesso negado ou dashboard
    console.warn(`Acesso negado para o usuário ${user.email} com tipo ${user.tipo_usuario}. Requer: ${allowedRoles.join(', ')}`);
    return <Navigate to="/dashboard" replace />; // Ou uma página de erro 403
  }

  // Se estiver autenticado e tiver permissão, renderiza os componentes filhos
  return <Outlet />;
};

export default PrivateRoute;