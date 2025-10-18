import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Star, 
  Calendar,
  Clock,
  BarChart3,
  PieChart,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';

const ProviderReports = () => {
  const [reports, setReports] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  const periods = [
    { value: '7d', label: 'Últimos 7 dias' },
    { value: '30d', label: 'Últimos 30 dias' },
    { value: '90d', label: 'Últimos 90 dias' },
    { value: '1y', label: 'Último ano' }
  ];

  const metrics = [
    { value: 'revenue', label: 'Receita' },
    { value: 'bookings', label: 'Agendamentos' },
    { value: 'clients', label: 'Clientes' },
    { value: 'rating', label: 'Avaliações' }
  ];

  useEffect(() => {
    // Simular carregamento de dados
    const loadReports = async () => {
      setIsLoading(true);
      
      setTimeout(() => {
        setReports({
          overview: {
            totalRevenue: 12450.00,
            totalBookings: 89,
            totalClients: 156,
            averageRating: 4.8,
            revenueGrowth: 15.2,
            bookingsGrowth: 8.5,
            clientsGrowth: 12.3,
            ratingGrowth: 0.3
          },
          revenue: {
            current: 2450.00,
            previous: 2120.00,
            growth: 15.2,
            chart: [
              { month: 'Jan', value: 1800 },
              { month: 'Fev', value: 2100 },
              { month: 'Mar', value: 1950 },
              { month: 'Abr', value: 2300 },
              { month: 'Mai', value: 2450 },
              { month: 'Jun', value: 2200 }
            ]
          },
          bookings: {
            current: 18,
            previous: 15,
            growth: 20.0,
            byStatus: {
              completed: 12,
              pending: 4,
              cancelled: 2
            },
            byService: [
              { service: 'Limpeza Residencial', count: 8, revenue: 960.00 },
              { service: 'Manutenção Elétrica', count: 5, revenue: 750.00 },
              { service: 'Pintura', count: 3, revenue: 600.00 },
              { service: 'Jardinagem', count: 2, revenue: 160.00 }
            ]
          },
          clients: {
            new: 8,
            returning: 10,
            total: 156,
            retention: 85.2,
            demographics: {
              age: {
                '18-25': 15,
                '26-35': 45,
                '36-45': 38,
                '46-55': 32,
                '55+': 26
              },
              gender: {
                male: 78,
                female: 78
              }
            }
          },
          ratings: {
            average: 4.8,
            total: 89,
            distribution: {
              5: 65,
              4: 18,
              3: 4,
              2: 1,
              1: 1
            },
            recent: [
              {
                client: 'Maria Silva',
                rating: 5,
                comment: 'Excelente trabalho! Muito profissional.',
                date: '2024-01-15'
              },
              {
                client: 'João Santos',
                rating: 4,
                comment: 'Bom serviço, recomendo.',
                date: '2024-01-14'
              },
              {
                client: 'Ana Costa',
                rating: 5,
                comment: 'Superou minhas expectativas!',
                date: '2024-01-13'
              }
            ]
          }
        });
        setIsLoading(false);
      }, 1000);
    };

    loadReports();
  }, [selectedPeriod]);

  const MetricCard = ({ title, value, icon: Icon, color, growth, trend }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {growth && (
            <div className="flex items-center mt-1">
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {growth}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const ChartCard = ({ title, children, className = "" }) => (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );

  const SimpleBarChart = ({ data, height = 200 }) => {
    const maxValue = Math.max(...data.map(item => item.value));
    
    return (
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className="w-20 text-sm text-gray-600">{item.month}</div>
            <div className="flex-1 mx-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
            </div>
            <div className="w-16 text-sm font-medium text-gray-900 text-right">
              R$ {item.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const PieChart = ({ data, colors }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    return (
      <div className="flex items-center justify-center">
        <div className="relative w-48 h-48">
          <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const circumference = 2 * Math.PI * 45;
              const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -((data.slice(0, index).reduce((sum, d) => sum + d.value, 0) / total) * circumference);
              
              return (
                <circle
                  key={index}
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={colors[index % colors.length]}
                  strokeWidth="8"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando relatórios...</p>
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
                Relatórios e Analytics
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                {periods.map(period => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Métrica Principal
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
              >
                {metrics.map(metric => (
                  <option key={metric.value} value={metric.value}>
                    {metric.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Receita Total"
            value={`R$ ${reports.overview?.totalRevenue?.toLocaleString() || '0'}`}
            icon={DollarSign}
            color="bg-green-500"
            growth={reports.overview?.revenueGrowth}
            trend="up"
          />
          <MetricCard
            title="Agendamentos"
            value={reports.overview?.totalBookings || '0'}
            icon={Calendar}
            color="bg-blue-500"
            growth={reports.overview?.bookingsGrowth}
            trend="up"
          />
          <MetricCard
            title="Clientes"
            value={reports.overview?.totalClients || '0'}
            icon={Users}
            color="bg-purple-500"
            growth={reports.overview?.clientsGrowth}
            trend="up"
          />
          <MetricCard
            title="Avaliação Média"
            value={reports.overview?.averageRating || '0'}
            icon={Star}
            color="bg-yellow-500"
            growth={reports.overview?.ratingGrowth}
            trend="up"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <ChartCard title="Evolução da Receita">
            <SimpleBarChart data={reports.revenue?.chart || []} />
          </ChartCard>

          {/* Bookings by Status */}
          <ChartCard title="Agendamentos por Status">
            <PieChart 
              data={[
                { label: 'Concluídos', value: reports.bookings?.byStatus?.completed || 0 },
                { label: 'Pendentes', value: reports.bookings?.byStatus?.pending || 0 },
                { label: 'Cancelados', value: reports.bookings?.byStatus?.cancelled || 0 }
              ]}
              colors={['#10B981', '#F59E0B', '#EF4444']}
            />
          </ChartCard>
        </div>

        {/* Services Performance */}
        <ChartCard title="Performance por Serviço" className="mb-8">
          <div className="space-y-4">
            {reports.bookings?.byService?.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{service.service}</h4>
                  <p className="text-sm text-gray-600">{service.count} agendamentos</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    R$ {service.revenue.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">Receita</p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Recent Ratings */}
        <ChartCard title="Avaliações Recentes">
          <div className="space-y-4">
            {reports.ratings?.recent?.map((rating, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{rating.client}</h4>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < rating.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                          fill={i < rating.rating ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{rating.comment}</p>
                  <p className="text-xs text-gray-500">{rating.date}</p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default ProviderReports;
