import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
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
import { ptBR } from 'date-fns/locale'; // Importa o locale para português

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

const Dashboard = () => {
  const { user } = useAuth();
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        const today = new Date();
        const oneWeekAgo = subDays(today, 6); // Últimos 7 dias, incluindo hoje

        const startDate = format(oneWeekAgo, 'yyyy-MM-dd');
        const endDate = format(today, 'yyyy-MM-dd');

        const response = await api.get('/reports/dashboard_summary', {
          params: { start_date: startDate, end_date: endDate }
        });

        if (response.status === 200) {
          setSummaryData(response.data);
        }
      } catch (err) {
        console.error('Erro ao buscar dados do dashboard:', err.response?.data || err.message);
        setError(err.response?.data?.error || 'Erro ao carregar dados do dashboard.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Preparar dados para o gráfico de humor (linha)
  const moodChartData = {
    labels: summaryData ? Object.keys(summaryData.media_humor_por_dia).sort() : [],
    datasets: [
      {
        label: 'Média de Humor Diário',
        data: summaryData ? Object.keys(summaryData.media_humor_por_dia).sort().map(date => summaryData.media_humor_por_dia[date]) : [],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const moodChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Tendência de Humor Semanal',
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
          text: 'Nota de Humor (1-5)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Data',
        },
        ticks: {
          callback: function(value, index, values) {
            // Formata a data para exibir no eixo X
            return format(new Date(this.getLabelForValue(value)), 'dd/MM', { locale: ptBR });
          }
        }
      }
    },
  };

  // Preparar dados para o gráfico de hábitos (barras)
  const habitChartData = {
    labels: summaryData ? Object.keys(summaryData.habitos_concluidos_por_dia).sort() : [],
    datasets: [
      {
        label: 'Hábitos Concluídos por Dia',
        data: summaryData ? Object.keys(summaryData.habitos_concluidos_por_dia).sort().map(date => summaryData.habitos_concluidos_por_dia[date]) : [],
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  const habitChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Conclusão de Hábitos por Dia',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
        title: {
          display: true,
          text: 'Número de Hábitos Concluídos',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Data',
        },
        ticks: {
          callback: function(value, index, values) {
            return format(new Date(this.getLabelForValue(value)), 'dd/MM', { locale: ptBR });
          }
        }
      }
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
        <LoadingSpinner size="lg" />
        <p className="ml-4 text-lg text-gray-700">Carregando dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="message-box error max-w-lg mx-auto my-8">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Dashboard de Progresso</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Total de Hábitos Ativos</h3>
          <p className="text-5xl font-bold text-indigo-600">{summaryData?.total_habitos_ativos}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Total de Metas Ativas</h3>
          <p className="text-5xl font-bold text-green-600">{summaryData?.total_metas_ativas}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Média de Humor (Últimos 7 dias)</h3>
          <p className="text-5xl font-bold text-purple-600">
            {summaryData?.media_humor_por_dia && Object.values(summaryData.media_humor_por_dia).filter(n => n !== null).length > 0
              ? (Object.values(summaryData.media_humor_por_dia).filter(n => n !== null).reduce((acc, curr) => acc + curr, 0) / Object.values(summaryData.media_humor_por_dia).filter(n => n !== null).length).toFixed(1)
              : 'N/A'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <Line data={moodChartData} options={moodChartOptions} />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <Bar data={habitChartData} options={habitChartOptions} />
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Insights e Dicas</h3>
        {summaryData?.insights && summaryData.insights.length > 0 ? (
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            {summaryData.insights.map((insight, index) => (
              <li key={index}>{insight}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">Nenhum insight disponível ainda. Continue registrando seus hábitos e humor para obter análises!</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;