import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { isNotEmpty } from '../utils/validation';
import { format } from 'date-fns';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [habits, setHabits] = useState([]); // Para metas de hábito
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Estados para o formulário de criação/edição de metas
  const [isEditing, setIsEditing] = useState(false);
  const [currentGoal, setCurrentGoal] = useState(null);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [goalType, setGoalType] = useState('custom'); // 'habito', 'humor', 'custom'
  const [goalValue, setGoalValue] = useState('');
  const [goalPeriod, setGoalPeriod] = useState('diario');
  const [goalStartDate, setGoalStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [goalEndDate, setGoalEndDate] = useState('');
  const [goalHabitId, setGoalHabitId] = useState('');
  const [goalActive, setGoalActive] = useState(true);
  const [goalNotifications, setGoalNotifications] = useState(true);

  const fetchGoalsAndHabits = async () => {
    setLoading(true);
    setError('');
    try {
      const [goalsRes, habitsRes] = await Promise.all([
        api.get('/goals'),
        api.get('/habits') // Para popular o dropdown de hábitos
      ]);

      if (goalsRes.status === 200) {
        setGoals(goalsRes.data);
      }
      if (habitsRes.status === 200) {
        setHabits(habitsRes.data);
        if (habitsRes.data.length > 0) {
          setGoalHabitId(habitsRes.data[0].id); // Define o primeiro hábito como padrão para metas de hábito
        }
      }
    } catch (err) {
      console.error('Erro ao buscar metas/hábitos:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Erro ao carregar metas ou hábitos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoalsAndHabits();
  }, []);

  const resetForm = () => {
    setIsEditing(false);
    setCurrentGoal(null);
    setGoalTitle('');
    setGoalDescription('');
    setGoalType('custom');
    setGoalValue('');
    setGoalPeriod('diario');
    setGoalStartDate(format(new Date(), 'yyyy-MM-dd'));
    setGoalEndDate('');
    setGoalHabitId(habits.length > 0 ? habits[0].id : '');
    setGoalActive(true);
    setGoalNotifications(true);
    setError('');
    setSuccessMessage('');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!isNotEmpty(goalTitle)) {
      setError('O título da meta é obrigatório.');
      return;
    }
    if (!goalValue || isNaN(goalValue)) {
      setError('O valor da meta é obrigatório e deve ser um número.');
      return;
    }
    if (goalType === 'habito' && !goalHabitId) {
      setError('Para metas de hábito, um hábito deve ser selecionado.');
      return;
    }
    if (new Date(goalStartDate) > new Date(goalEndDate) && goalEndDate) {
      setError('A data de início não pode ser posterior à data de fim.');
      return;
    }

    setLoading(true);
    try {
      const goalData = {
        titulo: goalTitle,
        descricao: goalDescription.trim() || null,
        tipo_meta: goalType,
        valor_meta: parseFloat(goalValue),
        periodo: goalPeriod,
        data_inicio: goalStartDate,
        data_fim: goalEndDate || null,
        habito_id: goalType === 'habito' ? parseInt(goalHabitId) : null,
        ativa: goalActive,
        notificacoes: goalNotifications,
      };

      let response;
      if (isEditing) {
        response = await api.put(`/goals/${currentGoal.id}`, goalData);
      } else {
        response = await api.post('/goals', goalData);
      }

      if (response.status === 200 || response.status === 201) {
        setSuccessMessage(response.data.message);
        resetForm();
        fetchGoalsAndHabits(); // Recarrega a lista de metas
      }
    } catch (err) {
      console.error('Erro ao salvar meta:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Erro ao salvar meta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (goal) => {
    setIsEditing(true);
    setCurrentGoal(goal);
    setGoalTitle(goal.titulo);
    setGoalDescription(goal.descricao || '');
    setGoalType(goal.tipo_meta);
    setGoalValue(goal.valor_meta);
    setGoalPeriod(goal.periodo);
    setGoalStartDate(format(new Date(goal.data_inicio), 'yyyy-MM-dd'));
    setGoalEndDate(goal.data_fim ? format(new Date(goal.data_fim), 'yyyy-MM-dd') : '');
    setGoalHabitId(goal.habito_id || (habits.length > 0 ? habits[0].id : ''));
    setGoalActive(goal.ativa);
    setGoalNotifications(goal.notificacoes);
    setSuccessMessage('');
    setError('');
  };

  const handleDelete = async (goalId) => {
    if (window.confirm('Tem certeza que deseja desativar esta meta? Ela não será mais acompanhada.')) {
      setLoading(true);
      setError('');
      setSuccessMessage('');
      try {
        const response = await api.delete(`/goals/${goalId}`);
        if (response.status === 200) {
          setSuccessMessage(response.data.message);
          fetchGoalsAndHabits(); // Recarrega a lista
        }
      } catch (err) {
        console.error('Erro ao desativar meta:', err.response?.data || err.message);
        setError(err.response?.data?.error || 'Erro ao desativar meta. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && goals.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
        <LoadingSpinner size="lg" />
        <p className="ml-4 text-lg text-gray-700">Carregando metas...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Minhas Metas</h1>

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

      {/* Formulário de Criação/Edição de Meta */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">{isEditing ? 'Editar Meta' : 'Definir Nova Meta'}</h2>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label htmlFor="goalTitle" className="block text-sm font-medium text-gray-700">Título da Meta</label>
            <input
              type="text"
              id="goalTitle"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="goalDescription" className="block text-sm font-medium text-gray-700">Descrição (Opcional)</label>
            <textarea
              id="goalDescription"
              rows="2"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={goalDescription}
              onChange={(e) => setGoalDescription(e.target.value)}
            ></textarea>
          </div>
          <div>
            <label htmlFor="goalType" className="block text-sm font-medium text-gray-700">Tipo de Meta</label>
            <select
              id="goalType"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={goalType}
              onChange={(e) => setGoalType(e.target.value)}
              required
            >
              <option value="custom">Meta Personalizada</option>
              <option value="habito">Meta de Hábito</option>
              <option value="humor">Meta de Humor</option>
            </select>
          </div>

          {goalType === 'habito' && (
            <div>
              <label htmlFor="goalHabitId" className="block text-sm font-medium text-gray-700">Hábito Associado</label>
              <select
                id="goalHabitId"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={goalHabitId}
                onChange={(e) => setGoalHabitId(e.target.value)}
                required={goalType === 'habito'}
              >
                <option value="">Selecione um hábito</option>
                {habits.map(habit => (
                  <option key={habit.id} value={habit.id}>{habit.nome}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="goalValue" className="block text-sm font-medium text-gray-700">Valor da Meta</label>
              <input
                type="number"
                id="goalValue"
                step="0.01"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={goalValue}
                onChange={(e) => setGoalValue(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="goalPeriod" className="block text-sm font-medium text-gray-700">Período</label>
              <select
                id="goalPeriod"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={goalPeriod}
                onChange={(e) => setGoalPeriod(e.target.value)}
              >
                <option value="diario">Diário</option>
                <option value="semanal">Semanal</option>
                <option value="mensal">Mensal</option>
                <option value="anual">Anual</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="goalStartDate" className="block text-sm font-medium text-gray-700">Data de Início</label>
              <input
                type="date"
                id="goalStartDate"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={goalStartDate}
                onChange={(e) => setGoalStartDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="goalEndDate" className="block text-sm font-medium text-gray-700">Data de Fim (Opcional)</label>
              <input
                type="date"
                id="goalEndDate"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={goalEndDate}
                onChange={(e) => setGoalEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <input
              type="checkbox"
              id="goalActive"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              checked={goalActive}
              onChange={(e) => setGoalActive(e.target.checked)}
            />
            <label htmlFor="goalActive" className="text-sm font-medium text-gray-700">Meta Ativa</label>
            <input
              type="checkbox"
              id="goalNotifications"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              checked={goalNotifications}
              onChange={(e) => setGoalNotifications(e.target.checked)}
            />
            <label htmlFor="goalNotifications" className="text-sm font-medium text-gray-700">Receber Notificações</label>
          </div>

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
              {loading ? <LoadingSpinner size="sm" color="white" /> : (isEditing ? 'Salvar Alterações' : 'Definir Meta')}
            </button>
          </div>
        </form>
      </div>

      {/* Lista de Metas */}
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Minhas Metas Ativas</h2>
        {goals.length === 0 ? (
          <p className="text-gray-600 text-center">Você ainda não tem metas definidas. Crie uma acima!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => (
              <div key={goal.id} className="border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-indigo-700">{goal.titulo}</h3>
                  {goal.descricao && <p className="text-sm text-gray-500 mb-1">{goal.descricao}</p>}
                  <p className="text-sm text-gray-600">Tipo: {goal.tipo_meta === 'habito' ? 'Hábito' : goal.tipo_meta === 'humor' ? 'Humor' : 'Personalizada'}</p>
                  {goal.habito_id && <p className="text-sm text-gray-600">Hábito: {habits.find(h => h.id === goal.habito_id)?.nome || 'N/A'}</p>}
                  <p className="text-sm text-gray-600">Valor da Meta: {goal.valor_meta}</p>
                  <p className="text-sm text-gray-600">Período: {goal.periodo}</p>
                  <p className="text-sm text-gray-600">Início: {format(new Date(goal.data_inicio), 'dd/MM/yyyy', { locale: ptBR })}</p>
                  {goal.data_fim && <p className="text-sm text-gray-600">Fim: {format(new Date(goal.data_fim), 'dd/MM/yyyy', { locale: ptBR })}</p>}
                  <p className="text-sm text-gray-600">Status: {goal.ativa ? 'Ativa' : 'Inativa'}</p>
                  <p className="text-sm text-gray-600">Notificações: {goal.notificacoes ? 'Sim' : 'Não'}</p>
                </div>
                <div className="mt-4 flex space-x-2 justify-end">
                  <button
                    onClick={() => handleEdit(goal)}
                    className="btn-secondary text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
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

export default Goals;