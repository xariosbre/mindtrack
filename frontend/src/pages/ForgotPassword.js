import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { validateEmail, validatePassword, passwordsMatch } from '../utils/validation';

const ForgotPassword = () => {
  const { token } = useParams(); // Captura o token da URL se for uma rota de redefinição
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Determina se a página está no modo de solicitação de redefinição ou de redefinição efetiva
  const isResetMode = !!token;

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!validateEmail(email)) {
      setError('Por favor, insira um email válido.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/forgot_password', { email });
      setSuccessMessage(response.data.message || 'Se o email estiver cadastrado, um link de redefinição será enviado para sua caixa de entrada.');
      setEmail(''); // Limpa o campo de email
    } catch (err) {
      console.error('Erro ao solicitar redefinição:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Erro ao solicitar redefinição. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!validatePassword(newPassword)) {
      setError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (!passwordsMatch(newPassword, confirmPassword)) {
      setError('A nova senha e a confirmação não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/reset_password', {
        token: token,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      if (response.status === 200) {
        setSuccessMessage(response.data.message || 'Senha redefinida com sucesso! Você já pode fazer login com a nova senha.');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          navigate('/login'); // Redireciona para o login após sucesso
        }, 3000);
      }
    } catch (err) {
      console.error('Erro ao redefinir senha:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Erro ao redefinir senha. O link pode ser inválido ou ter expirado.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Se estiver no modo de redefinição e não houver token, redireciona
    if (!token && isResetMode) {
      navigate('/forgot-password');
    }
  }, [token, isResetMode, navigate]);


  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-160px)] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isResetMode ? 'Redefinir sua Senha' : 'Esqueceu sua Senha?'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isResetMode ? 'Insira sua nova senha abaixo.' : 'Insira seu email para redefinir sua senha.'}
          </p>
        </div>

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

        {isResetMode ? (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="new-password" className="sr-only">Nova Senha</label>
                <input
                  id="new-password"
                  name="new-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Nova Senha"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="confirm-new-password" className="sr-only">Confirmar Nova Senha</label>
                <input
                  id="confirm-new-password"
                  name="confirm-new-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Confirmar Nova Senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
                disabled={loading}
              >
                {loading ? (
                  <LoadingSpinner size="sm" color="white" />
                ) : (
                  'Redefinir Senha'
                )}
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleRequestReset}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">Endereço de Email</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Endereço de Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
                disabled={loading}
              >
                {loading ? (
                  <LoadingSpinner size="sm" color="white" />
                ) : (
                  'Enviar Link de Redefinição'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;