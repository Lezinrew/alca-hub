import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Star, 
  Clock, 
  TrendingUp,
  MessageSquare,
  Settings,
  Plus,
  Filter,
  Search
} from 'lucide-react';

const ProviderDashboard = () => {
  const [stats, setStats] = useState({
    totalServices: 0,
    activeBookings: 0,
    monthlyRevenue: 0,
    averageRating: 0,
    totalClients: 0,
    pendingRequests: 0
  });

  const [recentBookings, setRecentBookings] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de dados
    const loadDashboardData = async () => {
      setIsLoading(true);
      
      // Simular dados do prestador
      setTimeout(() => {
        setStats({
          totalServices: 12,
          activeBookings: 8,
          monthlyRevenue: 2450.00,
          averageRating: 4.8,
          totalClients: 156,
          pendingRequests: 3
        });

        setRecentBookings([
          {
            id: 1,
            client: 'Maria Silva',
            service: 'Limpeza Residencial',
            date: '2024-01-15',
            time: '14:00',
            status: 'confirmed',
            value: 120.00
          },
          {
            id: 2,
            client: 'João Santos',
            service: 'Manutenção Elétrica',
            date: '2024-01-16',
            time: '09:00',
            status: 'pending',
            value: 200.00
          },
          {
            id: 3,
            client: 'Ana Costa',
            service: 'Pintura',
            date: '2024-01-17',
            time: '16:00',
            status: 'confirmed',
            value: 350.00
          }
        ]);

        setRecentMessages([
          {
            id: 1,
            client: 'Carlos Oliveira',
            message: 'Olá, gostaria de agendar um serviço...',
            time: '10:30',
            unread: true
          },
          {
            id: 2,
            client: 'Lucia Ferreira',
            message: 'Obrigada pelo excelente trabalho!',
            time: '09:15',
            unread: false
          }
        ]);

        setIsLoading(false);
      }, 1000);
    };

    loadDashboardData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center mt-1">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">{trend}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const BookingCard = ({ booking }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900">{booking.client}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          booking.status === 'confirmed' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {booking.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-1">{booking.service}</p>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center text-gray-500">
          <Calendar className="w-4 h-4 mr-1" />
          {booking.date} às {booking.time}
        </div>
        <span className="font-semibold text-green-600">
          R$ {booking.value.toFixed(2)}
        </span>
      </div>
    </div>
  );

  const MessageCard = ({ message }) => (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${
      message.unread ? 'border-blue-200 bg-blue-50' : ''
    }`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900">{message.client}</h3>
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="w-4 h-4 mr-1" />
          {message.time}
        </div>
      </div>
      <p className="text-sm text-gray-600">{message.message}</p>
      {message.unread && (
        <div className="mt-2">
          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Dashboard do Prestador
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Plus className="w-4 h-4 mr-2" />
                Novo Serviço
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total de Serviços"
            value={stats.totalServices}
            icon={Settings}
            color="bg-blue-500"
            trend="+2 este mês"
          />
          <StatCard
            title="Agendamentos Ativos"
            value={stats.activeBookings}
            icon={Calendar}
            color="bg-green-500"
            trend="+1 hoje"
          />
          <StatCard
            title="Receita Mensal"
            value={`R$ ${stats.monthlyRevenue.toFixed(2)}`}
            icon={DollarSign}
            color="bg-yellow-500"
            trend="+15% vs mês anterior"
          />
          <StatCard
            title="Avaliação Média"
            value={stats.averageRating}
            icon={Star}
            color="bg-purple-500"
            trend="+0.2 pontos"
          />
          <StatCard
            title="Total de Clientes"
            value={stats.totalClients}
            icon={Users}
            color="bg-indigo-500"
            trend="+8 novos"
          />
          <StatCard
            title="Solicitações Pendentes"
            value={stats.pendingRequests}
            icon={Clock}
            color="bg-orange-500"
            trend="2 respondidas hoje"
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Bookings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Agendamentos Recentes
                </h2>
                <button className="text-sm text-blue-600 hover:text-blue-700">
                  Ver todos
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {recentBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          </div>

          {/* Recent Messages */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Mensagens Recentes
                </h2>
                <button className="text-sm text-blue-600 hover:text-blue-700">
                  Ver todas
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {recentMessages.map((message) => (
                <MessageCard key={message.id} message={message} />
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Calendar className="w-5 h-5 text-blue-600 mr-3" />
              <span className="text-sm font-medium">Agendar Serviço</span>
            </button>
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <MessageSquare className="w-5 h-5 text-green-600 mr-3" />
              <span className="text-sm font-medium">Responder Mensagens</span>
            </button>
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <DollarSign className="w-5 h-5 text-yellow-600 mr-3" />
              <span className="text-sm font-medium">Ver Relatórios</span>
            </button>
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Settings className="w-5 h-5 text-gray-600 mr-3" />
              <span className="text-sm font-medium">Configurações</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
