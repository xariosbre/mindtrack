import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Registra os componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Reports = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState(null);

  // Filtros do relatório
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedHabitIds, setSelectedHabitIds] = useState([]);

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const response = await api.get('/habits');
        if (response.status === 200) {
          setHabits(response.data);
        }
      } catch (err) {
        console.error('Erro ao buscar hábitos para relatórios:', err.response?.data || err.message);
        setError('Erro ao carregar hábitos para seleção.');
      }
    };
    fetchHabits();
  }, []);

  const handleHabitSelection = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedHabitIds([...selectedHabitIds, parseInt(value)]);
    } else {
      setSelectedHabitIds(selectedHabitIds.filter(id => id !== parseInt(value)));
    }
  };

  const generateReport = async () => {
    setLoading(true);
    setError('');
    setReportData(null);

    if (!startDate || !endDate || selectedHabitIds.length === 0) {
      setError('Por favor, selecione um período e pelo menos um hábito.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/reports/correlation_report', {
        params: {
          start_date: startDate,
          end_date: endDate,
          habit_ids: selectedHabitIds.join(','),
        },
      });

      if (response.status === 200) {
        setReportData(response.data);
      }
    } catch (err) {
      console.error('Erro ao gerar relatório de correlação:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Erro ao gerar relatório. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Preparar dados para o gráfico de correlação (exemplo: barras de humor médio por hábito)
  const correlationChartData = {
    labels: reportData ? Object.keys(reportData.correlation_summary) : [],
    datasets: [
      {
        label: 'Média de Humor em Dias de Hábito Concluído',
        data: reportData ? Object.values(reportData.correlation_summary).map(item => item.average_mood_on_completed_days) : [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const correlationChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Correlação: Humor vs. Hábitos Concluídos',
      },
    },
    scales: {
      y: {
        min: 1,
        max: 5,
        ticks: {
          stepSize: 1,
        },
        title: {
          display: true,
          text: 'Média de Humor (1-5)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Hábito',
        },
      },
    },
  };

  if (loading && !reportData) { // Mostra spinner apenas se ainda não há dados de relatório
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
        <LoadingSpinner size="lg" />
        <p className="ml-4 text-lg text-gray-700">Carregando relatórios...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Relatórios e Análises</h1>

      {error && (
        <div className="message-box error max-w-4xl mx-auto mb-6" role="alert">
          {error}
        </div>
      )}

      {/* Seção de Filtros */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Gerar Relatório de Correlação</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Data de Início</label>
            <input
              type="date"
              id="startDate"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Data de Fim</label>
            <input
              type="date"
              id="endDate"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Selecione Hábitos para Análise:</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto border p-3 rounded-md bg-gray-50">
            {habits.length === 0 ? (
              <p className="text-gray-500 col-span-full">Nenhum hábito disponível. Crie hábitos na seção "Hábitos".</p>
            ) : (
              habits.map(habit => (
                <div key={habit.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`habit-${habit.id}`}
                    value={habit.id}
                    checked={selectedHabitIds.includes(habit.id)}
                    onChange={handleHabitSelection}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor={`habit-${habit.id}`} className="ml-2 text-sm text-gray-700">{habit.nome}</label>
                </div>
              ))
            )}
          </div>
        </div>

        <button
          onClick={generateReport}
          className="btn-primary w-full"
          disabled={loading || selectedHabitIds.length === 0}
        >
          {loading ? <LoadingSpinner size="sm" color="white" /> : 'Gerar Relatório'}
        </button>
      </div>

      {/* Seção de Resultados do Relatório */}
      {reportData && (
        <div className="bg-white p-6 rounded-xl shadow-lg max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Resultados do Relatório</h2>
          <p className="text-gray-600 mb-4">Período analisado: {format(new Date(reportData.periodo_inicio), 'dd/MM/yyyy', { locale: ptBR })} a {format(new Date(reportData.periodo_fim), 'dd/MM/yyyy', { locale: ptBR })}</p>

          {Object.keys(reportData.correlation_summary).length > 0 ? (
            <>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Resumo da Correlação</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {Object.entries(reportData.correlation_summary).map(([habitName, data]) => (
                    <li key={habitName}>
                      **{habitName}**: {data.total_completed_days} dias concluídos. Média de humor nesses dias: {data.average_mood_on_completed_days !== null ? data.average_mood_on_completed_days : 'N/A'}.
                    </li>
                  ))}
                </ul>
              </div>

              <div className="chart-container">
                <Bar data={correlationChartData} options={correlationChartOptions} />
              </div>
            </>
          ) : (
            <p className="text-gray-600 text-center">Nenhum dado de correlação encontrado para os filtros selecionados.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;