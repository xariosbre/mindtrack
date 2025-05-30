import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext'; // Para obter o ID do admin logado

const AdminPanel = () => {
  const { user: currentAdminUser } = useAuth(); // Obtém o usuário admin logado
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/user/admin/users');
      if (response.status === 200) {
        setUsers(response.data);
      }
    } catch (err) {
      console.error('Erro ao buscar usuários:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Erro ao carregar lista de usuários.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    if (userId === currentAdminUser.id && newRole !== 'admin') {
      setError('Você não pode mudar sua própria função de administrador.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const response = await api.put(`/user/admin/users/${userId}`, { tipo_usuario: newRole });
      if (response.status === 200) {
        setSuccessMessage(response.data.message);
        fetchUsers(); // Recarrega a lista de usuários
      }
    } catch (err) {
      console.error('Erro ao atualizar função do usuário:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Erro ao atualizar função.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId, isActive) => {
    if (userId === currentAdminUser.id && isActive === false) {
      setError('Você não pode desativar sua própria conta de administrador.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const response = await api.put(`/user/admin/users/${userId}`, { ativo: isActive });
      if (response.status === 200) {
        setSuccessMessage(response.data.message);
        fetchUsers(); // Recarrega a lista de usuários
      }
    } catch (err) {
      console.error('Erro ao atualizar status do usuário:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Erro ao atualizar status.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
        <LoadingSpinner size="lg" />
        <p className="ml-4 text-lg text-gray-700">Carregando painel de administração...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-lg my-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Painel de Administração</h1>

      {error && (
        <div className="message-box error" role="alert">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="message-box success" role="alert">
          {successMessage}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">ID</th>
              <th className="py-3 px-6 text-left">Nome</th>
              <th className="py-3 px-6 text-left">Email</th>
              <th className="py-3 px-6 text-left">Tipo de Usuário</th>
              <th className="py-3 px-6 text-left">Status</th>
              <th className="py-3 px-6 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm font-light">
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-6 text-left whitespace-nowrap">{user.id}</td>
                <td className="py-3 px-6 text-left">{user.nome}</td>
                <td className="py-3 px-6 text-left">{user.email}</td>
                <td className="py-3 px-6 text-left">
                  <select
                    value={user.tipo_usuario}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                    disabled={user.id === currentAdminUser.id} // Impede que o admin mude sua própria função
                  >
                    <option value="usuario">Usuário</option>
                    <option value="admin">Administrador</option>
                  </select>
                </td>
                <td className="py-3 px-6 text-left">
                  <span className={`py-1 px-3 rounded-full text-xs font-semibold ${user.ativo ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                    {user.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="py-3 px-6 text-center">
                  <button
                    onClick={() => handleStatusChange(user.id, !user.ativo)}
                    className={`font-semibold py-1 px-3 rounded-lg transition duration-200 ${user.ativo ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                    disabled={user.id === currentAdminUser.id} // Impede que o admin desative a própria conta
                  >
                    {user.ativo ? 'Desativar' : 'Ativar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;