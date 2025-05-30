import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import Habits from './pages/Habits';
import MoodTracker from './pages/MoodTracker';
import Goals from './pages/Goals';
import Reports from './pages/Reports';
import { useAuth } from './context/AuthContext'; // Importa o contexto de autenticação
import LoadingSpinner from './components/LoadingSpinner'; // Importa o spinner

function App() {
  const { loading } = useAuth(); // Obtém o estado de carregamento do AuthContext

  if (loading) {
    // Exibe um spinner de carregamento enquanto o AuthContext está verificando o token inicial
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <LoadingSpinner size="lg" />
        <p className="ml-4 text-lg text-gray-700">Carregando aplicação...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto p-4">
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ForgotPassword />} /> {/* Rota para redefinir senha */}

            {/* Rotas Privadas (requerem autenticação) */}
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Dashboard />} /> {/* HU08 */}
              <Route path="/profile" element={<Profile />} /> {/* HU04 */}
              <Route path="/habits" element={<Habits />} /> {/* HU06, HU11, HU12 */}
              <Route path="/mood-tracker" element={<MoodTracker />} /> {/* HU07, HU13, HU14 */}
              <Route path="/goals" element={<Goals />} /> {/* HU09 */}
              <Route path="/reports" element={<Reports />} /> {/* HU10 */}
            </Route>

            {/* Rotas Privadas para Admin (requerem autenticação e role 'admin') */}
            <Route element={<PrivateRoute allowedRoles={['admin']} />}>
              <Route path="/admin-panel" element={<AdminPanel />} /> {/* HU05 */}
            </Route>

            {/* Redirecionamento padrão para o dashboard após login ou para o login se não autenticado */}
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            {/* Rota para qualquer URL não encontrada, redireciona para o dashboard ou login */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;