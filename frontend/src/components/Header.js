import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Importa o contexto de autenticação

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth(); // Obtém o usuário, estado de autenticação e função de logout
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      console.log('Logout bem-sucedido!');
      navigate('/login'); // Redireciona para a página de login
    } else {
      console.error('Erro ao fazer logout:', result.error);
      // Exibir mensagem de erro para o usuário, se necessário
    }
  };

  return (
    <header className="bg-indigo-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold rounded-lg hover:text-indigo-100 transition duration-200">
          MindTrack
        </Link>
        <nav>
          <ul className="flex space-x-6">
            {isAuthenticated ? (
              <>
                <li>
                  <Link to="/dashboard" className="hover:text-indigo-100 transition duration-200">Dashboard</Link>
                </li>
                <li>
                  <Link to="/habits" className="hover:text-indigo-100 transition duration-200">Hábitos</Link>
                </li>
                <li>
                  <Link to="/mood-tracker" className="hover:text-indigo-100 transition duration-200">Humor</Link>
                </li>
                <li>
                  <Link to="/goals" className="hover:text-indigo-100 transition duration-200">Metas</Link>
                </li>
                <li>
                  <Link to="/reports" className="hover:text-indigo-100 transition duration-200">Relatórios</Link>
                </li>
                {user && user.tipo_usuario === 'admin' && ( // HU05 - Link para AdminPanel
                  <li>
                    <Link to="/admin-panel" className="hover:text-indigo-100 transition duration-200">Admin</Link>
                  </li>
                )}
                <li>
                  <Link to="/profile" className="hover:text-indigo-100 transition duration-200">Perfil ({user?.nome || 'Usuário'})</Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="bg-indigo-700 hover:bg-indigo-800 text-white font-semibold py-1 px-3 rounded-lg transition duration-200"
                  >
                    Sair
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" className="hover:text-indigo-100 transition duration-200">Login</Link>
                </li>
                <li>
                  <Link to="/register" className="bg-indigo-700 hover:bg-indigo-800 text-white font-semibold py-1 px-3 rounded-lg transition duration-200">
                    Cadastre-se
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;