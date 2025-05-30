import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { validateEmail, isNotEmpty } from '../utils/validation';

const Profile = () => {
  const { user, setUser, loading: authLoading, verifyToken } = useAuth(); // Obtém o usuário e funções do AuthContext
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState(null); // Para o arquivo de imagem
  const [profilePicturePreview, setProfilePicturePreview] = useState(''); // Para a URL da pré-visualização
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false); // Estado de carregamento para o formulário

  useEffect(() => {
    if (user) {
      setName(user.nome || '');
      setEmail(user.email || '');
      setProfilePicturePreview(user.foto_perfil ? `http://127.0.0.1:5000/uploads/profile_pics/${user.foto_perfil}` : 'https://placehold.co/150x150/e0e0e0/ffffff?text=Sem+Foto');
    }
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setProfilePicturePreview(URL.createObjectURL(file)); // Cria URL para pré-visualização
    } else {
      setProfilePicture(null);
      setProfilePicturePreview(user?.foto_perfil ? `http://127.0.0.1:5000/uploads/profile_pics/${user.foto_perfil}` : 'https://placehold.co/150x150/e0e0e0/ffffff?text=Sem+Foto');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!isNotEmpty(name)) {
      setError('O nome não pode ser vazio.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Por favor, insira um email válido.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('nome', name);
      formData.append('email', email);
      if (profilePicture) {
        formData.append('foto_perfil', profilePicture);
      }

      const response = await api.put('/user/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Importante para upload de arquivo
        },
      });

      if (response.status === 200) {
        setSuccessMessage(response.data.message);
        setUser(response.data.user); // Atualiza o usuário no contexto
        // Opcional: re-verificar o token para garantir que o usuário está atualizado
        await verifyToken();
      }
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
        <LoadingSpinner size="lg" />
        <p className="ml-4 text-lg text-gray-700">Carregando perfil...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg my-8">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Meu Perfil</h2>

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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center mb-6">
          <img
            src={profilePicturePreview}
            alt="Foto de Perfil"
            className="w-32 h-32 rounded-full object-cover border-4 border-indigo-200 shadow-md"
            onError={(e) => {
              e.target.onerror = null; // Evita loop de erro
              e.target.src = 'https://placehold.co/150x150/e0e0e0/ffffff?text=Sem+Foto'; // Fallback
            }}
          />
          <label htmlFor="profile-picture-upload" className="mt-4 cursor-pointer bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 transition duration-200 shadow-sm">
            Alterar Foto
          </label>
          <input
            id="profile-picture-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
          <input
            type="text"
            id="name"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            id="email"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 font-semibold"
            disabled={loading}
          >
            {loading ? <LoadingSpinner size="sm" color="white" /> : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;