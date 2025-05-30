import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { format, subDays, addDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const MoodTracker = () => {
  const [moodAssessments, setMoodAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Estados para o formulário de avaliação de humor
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [moodNote, setMoodNote] = useState('');
  const [observations, setObservations] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentAssessmentId, setCurrentAssessmentId] = useState(null);

  const fetchMoodAssessments = async () => {
    setLoading(true);
    setError('');
    try {
      const today = new Date();
      const threeMonthsAgo = subDays(today, 90); // Busca avaliações dos últimos 3 meses

      const startDate = format(threeMonthsAgo, 'yyyy-MM-dd');
      const endDate = format(today, 'yyyy-MM-dd');

      const response = await api.get('/mood/by_date_range', {
        params: { start_date: startDate, end_date: endDate }
      });

      if (response.status === 200) {
        setMoodAssessments(response.data);
      }
    } catch (err) {
      console.error('Erro ao buscar avaliações de humor:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Erro ao carregar avaliações de humor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoodAssessments();
  }, []);

  // Preenche o formulário se já houver uma avaliação para a data selecionada
  useEffect(() => {
    const existing = moodAssessments.find(
      (assessment) => format(new Date(assessment.data_avaliacao), 'yyyy-MM-dd') === selectedDate
    );
    if (existing) {
      setIsEditing(true);
      setCurrentAssessmentId(existing.id);
      setMoodNote(existing.nota_humor);
      setObservations(existing.observacoes || '');
    } else {
      resetForm();
    }
  }, [selectedDate, moodAssessments]);


  const resetForm = () => {
    setIsEditing(false);
    setCurrentAssessmentId(null);
    setMoodNote('');
    setObservations('');
    setError('');
    setSuccessMessage('');
  };

  const handleMoodSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!moodNote || moodNote < 1 || moodNote > 5) {
      setError('A nota de humor deve ser entre 1 e 5.');
      return;
    }

    setLoading(true);
    try {
      const moodData = {
        data_avaliacao: selectedDate,
        nota_humor: parseInt(moodNote),
        observacoes: observations.trim() || null,
      };

      let response;
      if (isEditing) {
        response = await api.put(`/mood/${currentAssessmentId}`, moodData);
      } else {
        response = await api.post('/mood', moodData);
      }

      if (response.status === 200 || response.status === 201) {
        setSuccessMessage(response.data.message);
        fetchMoodAssessments(); // Recarrega a lista
        resetForm(); // Limpa o formulário após o envio
      }
    } catch (err) {
      console.error('Erro ao salvar avaliação de humor:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Erro ao salvar avaliação de humor. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMood = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta avaliação de humor?')) {
      setLoading(true);
      setError('');
      setSuccessMessage('');
      try {
        const response = await api.delete(`/mood/${id}`);
        if (response.status === 200) {
          setSuccessMessage(response.data.message);
          fetchMoodAssessments(); // Recarrega a lista
          resetForm(); // Limpa o formulário caso a avaliação excluída fosse a selecionada
        }
      } catch (err) {
        console.error('Erro ao excluir avaliação de humor:', err.response?.data || err.message);
        setError(err.response?.data?.error || 'Erro ao excluir avaliação de humor. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Função para obter a cor com base na nota de humor
  const getMoodColor = (note) => {
    switch (note) {
      case 1: return 'bg-red-500'; // Muito Ruim
      case 2: return 'bg-orange-400'; // Ruim
      case 3: return 'bg-yellow-400'; // Neutro
      case 4: return 'bg-lime-500'; // Bom
      case 5: return 'bg-green-600'; // Excelente
      default: return 'bg-gray-300';
    }
  };

  if (loading && moodAssessments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
        <LoadingSpinner size="lg" />
        <p className="ml-4 text-lg text-gray-700">Carregando humor...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Registro de Humor Diário</h1>

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

      {/* Formulário de Avaliação de Humor */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          {isEditing ? 'Editar Avaliação de Humor' : 'Avaliar Humor'} para {format(new Date(selectedDate), 'dd/MM/yyyy', { locale: ptBR })}
        </h2>
        <form onSubmit={handleMoodSubmit} className="space-y-4">
          <div>
            <label htmlFor="assessmentDate" className="block text-sm font-medium text-gray-700">Data da Avaliação</label>
            <input
              type="date"
              id="assessmentDate"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={format(new Date(), 'yyyy-MM-dd')} // Não permite datas futuras
              required
            />
          </div>
          <div>
            <label htmlFor="moodNote" className="block text-sm font-medium text-gray-700">Nota de Humor (1-5)</label>
            <input
              type="number"
              id="moodNote"
              min="1"
              max="5"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={moodNote}
              onChange={(e) => setMoodNote(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="observations" className="block text-sm font-medium text-gray-700">Observações (Opcional)</label>
            <textarea
              id="observations"
              rows="3"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
            ></textarea>
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
              {loading ? <LoadingSpinner size="sm" color="white" /> : (isEditing ? 'Atualizar Avaliação' : 'Adicionar Avaliação')}
            </button>
          </div>
        </form>
      </div>

      {/* Calendário/Lista de Avaliações de Humor */}
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Histórico de Humor</h2>
        {moodAssessments.length === 0 ? (
          <p className="text-gray-600 text-center">Nenhuma avaliação de humor registrada ainda.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {moodAssessments
              .sort((a, b) => new Date(b.data_avaliacao) - new Date(a.data_avaliacao)) // Ordena por data mais recente
              .map((assessment) => (
                <div
                  key={assessment.id}
                  className={`border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col justify-between ${getMoodColor(assessment.nota_humor)} bg-opacity-70`}
                  onClick={() => {
                    setSelectedDate(format(new Date(assessment.data_avaliacao), 'yyyy-MM-dd'));
                  }}
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {format(new Date(assessment.data_avaliacao), 'dd/MM/yyyy', { locale: ptBR })}
                    </h3>
                    <p className="text-xl font-bold text-gray-900 mb-2">Nota: {assessment.nota_humor}</p>
                    {assessment.observacoes && <p className="text-sm text-gray-800">{assessment.observacoes}</p>}
                  </div>
                  <div className="mt-4 flex space-x-2 justify-end">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteMood(assessment.id); }} // Evita clique no pai
                      className="btn-danger text-sm"
                    >
                      Excluir
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

export default MoodTracker;