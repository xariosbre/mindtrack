import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { isNotEmpty } from '../utils/validation';

const Habits = () => {
  const [habits, setHabits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Estados para o formulário de criação/edição
  const [isEditing, setIsEditing] = useState(false);
  const [currentHabit, setCurrentHabit] = useState(null);
  const [habitName, setHabitName] = useState('');
  const [habitDescription, setHabitDescription] = useState('');
  const [habitCategory, setHabitCategory] = useState('');
  const [habitMeasurementType, setHabitMeasurementType] = useState('binario');
  const [habitUnit, setHabitUnit] = useState('');
  const [habitDailyGoal, setHabitDailyGoal] = useState('');

  const fetchHabitsAndCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const [habitsRes, categoriesRes] = await Promise.all([
        api.get('/habits'),
        api.get('/habits/categories')
      ]);

      if (habitsRes.status === 200) {
        setHabits(habitsRes.data);
      }
      if (categoriesRes.status === 200) {
        setCategories(categoriesRes.data);
        if (categoriesRes.data.length > 0) {
          setHabitCategory(categoriesRes.data[0].id); // Define a primeira categoria como padrão
        }
      }
    } catch (err) {
      console.error('Erro ao buscar hábitos/categorias:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Erro ao carregar hábitos ou categorias.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabitsAndCategories();
  }, []);

  const resetForm = () => {
    setIsEditing(false);
    setCurrentHabit(null);
    setHabitName('');
    setHabitDescription('');
    setHabitCategory(categories.length > 0 ? categories[0].id : '');
    setHabitMeasurementType('binario');
    setHabitUnit('');
    setHabitDailyGoal('');
    setError('');
    setSuccessMessage('');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!isNotEmpty(habitName)) {
      setError('O nome do hábito é obrigatório.');
      return;
    }
    if (!habitCategory) {
      setError('A categoria do hábito é obrigatória.');
      return;
    }
    if (habitMeasurementType === 'quantitativo' && (!habitDailyGoal || isNaN(habitDailyGoal))) {
      setError('Para hábitos quantitativos, a meta diária é obrigatória e deve ser um número.');
      return;
    }

    setLoading(true);
    try {
      const habitData = {
        nome: habitName,
        descricao: habitDescription,
        categoria_id: parseInt(habitCategory),
        tipo_medicao: habitMeasurementType,
        unidade: habitUnit || null,
        meta_diaria: habitDailyGoal ? parseFloat(habitDailyGoal) : null,
      };

      let response;
      if (isEditing) {
        response = await api.put(`/habits/${currentHabit.id}`, habitData);
      } else {
        response = await api.post('/habits', habitData);
      }

      if (response.status === 200 || response.status === 201) {
        setSuccessMessage(response.data.message);
        resetForm();
        fetchHabitsAndCategories(); // Recarrega a lista de hábitos
      }
    } catch (err) {
      console.error('Erro ao salvar hábito:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Erro ao salvar hábito. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (habit) => {
    setIsEditing(true);
    setCurrentHabit(habit);
    setHabitName(habit.nome);
    setHabitDescription(habit.descricao || '');
    setHabitCategory(habit.categoria_id);
    setHabitMeasurementType(habit.tipo_medicao);
    setHabitUnit(habit.unidade || '');
    setHabitDailyGoal(habit.meta_diaria || '');
    setSuccessMessage('');
    setError('');
  };

  const handleDelete = async (habitId) => {
    if (window.confirm('Tem certeza que deseja desativar este hábito? Ele não será mais exibido no seu dashboard.')) {
      setLoading(true);
      setError('');
      setSuccessMessage('');
      try {
        const response = await api.delete(`/habits/${habitId}`);
        if (response.status === 200) {
          setSuccessMessage(response.data.message);
          fetchHabitsAndCategories(); // Recarrega a lista
        }
      } catch (err) {
        console.error('Erro ao desativar hábito:', err.response?.data || err.message);
        setError(err.response?.data?.error || 'Erro ao desativar hábito. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && habits.length === 0) { // Apenas mostra spinner se não há dados para exibir
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
        <LoadingSpinner size="lg" />
        <p className="ml-4 text-lg text-gray-700">Carregando hábitos...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Meus Hábitos</h1>

      {error && (
        <div className="message-box error max-w-2xl mx-auto mb-6" role="alert">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="message-box success max-w-2xl mx-auto mb-6" role="alert">
          {successMessage}
        </div>
      )}

      {/* Formulário de Criação/Edição de Hábito */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">{isEditing ? 'Editar Hábito' : 'Adicionar Novo Hábito'}</h2>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label htmlFor="habitName" className="block text-sm font-medium text-gray-700">Nome do Hábito</label>
            <input
              type="text"
              id="habitName"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="habitDescription" className="block text-sm font-medium text-gray-700">Descrição (Opcional)</label>
            <textarea
              id="habitDescription"
              rows="3"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={habitDescription}
              onChange={(e) => setHabitDescription(e.target.value)}
            ></textarea>
          </div>
          <div>
            <label htmlFor="habitCategory" className="block text-sm font-medium text-gray-700">Categoria</label>
            <select
              id="habitCategory"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={habitCategory}
              onChange={(e) => setHabitCategory(e.target.value)}
              required
            >
              <option value="">Selecione uma categoria</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="habitMeasurementType" className="block text-sm font-medium text-gray-700">Tipo de Medição</label>
            <select
              id="habitMeasurementType"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={habitMeasurementType}
              onChange={(e) => setHabitMeasurementType(e.target.value)}
            >
              <option value="binario">Binário (Sim/Não)</option>
              <option value="quantitativo">Quantitativo (Valor numérico)</option>
            </select>
          </div>
          {habitMeasurementType === 'quantitativo' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="habitUnit" className="block text-sm font-medium text-gray-700">Unidade (Ex: min, copos)</label>
                <input
                  type="text"
                  id="habitUnit"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={habitUnit}
                  onChange={(e) => setHabitUnit(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="habitDailyGoal" className="block text-sm font-medium text-gray-700">Meta Diária</label>
                <input
                  type="number"
                  id="habitDailyGoal"
                  step="0.01"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={habitDailyGoal}
                  onChange={(e) => setHabitDailyGoal(e.target.value)}
                />
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-4">
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="btn-secondary"
              >
                Cancelar Edição
              </button>
            )}
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? <LoadingSpinner size="sm" color="white" /> : (isEditing ? 'Salvar Alterações' : 'Adicionar Hábito')}
            </button>
          </div>
        </form>
      </div>

      {/* Lista de Hábitos */}
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Meus Hábitos Ativos</h2>
        {habits.length === 0 ? (
          <p className="text-gray-600 text-center">Você ainda não tem hábitos registrados. Adicione um acima!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {habits.map((habit) => (
              <div key={habit.id} className="border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-indigo-700">{habit.nome}</h3>
                  <p className="text-sm text-gray-600 mb-2">Categoria: {habit.categoria_nome}</p>
                  {habit.descricao && <p className="text-sm text-gray-500 mb-2">{habit.descricao}</p>}
                  <p className="text-sm text-gray-500">Tipo: {habit.tipo_medicao === 'binario' ? 'Sim/Não' : 'Quantitativo'}</p>
                  {habit.tipo_medicao === 'quantitativo' && (
                    <p className="text-sm text-gray-500">Meta Diária: {habit.meta_diaria} {habit.unidade}</p>
                  )}
                </div>
                <div className="mt-4 flex space-x-2 justify-end">
                  <button
                    onClick={() => handleEdit(habit)}
                    className="btn-secondary text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(habit.id)}
                    className="btn-danger text-sm"
                  >
                    Desativar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Habits;