import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Check, 
  X, 
  Calendar, 
  MessageSquare, 
  DollarSign, 
  Star,
  AlertCircle,
  Info,
  CheckCircle,
  Clock,
  Filter,
  MarkAsRead
} from 'lucide-react';

const ProviderNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);

  const filters = [
    { value: 'all', label: 'Todas' },
    { value: 'unread', label: 'Não lidas' },
    { value: 'bookings', label: 'Agendamentos' },
    { value: 'messages', label: 'Mensagens' },
    { value: 'payments', label: 'Pagamentos' },
    { value: 'reviews', label: 'Avaliações' }
  ];

  useEffect(() => {
    // Simular carregamento de dados
    const loadNotifications = async () => {
      setIsLoading(true);
      
      setTimeout(() => {
        const mockNotifications = [
          {
            id: 1,
            type: 'booking',
            title: 'Novo agendamento confirmado',
            message: 'Maria Silva agendou um serviço de Limpeza Residencial para 15/01 às 14h',
            timestamp: '10:30',
            isRead: false,
            priority: 'high',
            action: 'Ver detalhes'
          },
          {
            id: 2,
            type: 'message',
            title: 'Nova mensagem recebida',
            message: 'João Santos enviou uma mensagem sobre o serviço de Manutenção Elétrica',
            timestamp: '09:15',
            isRead: false,
            priority: 'medium',
            action: 'Responder'
          },
          {
            id: 3,
            type: 'payment',
            title: 'Pagamento recebido',
            message: 'Pagamento de R$ 120,00 recebido de Ana Costa',
            timestamp: '08:45',
            isRead: true,
            priority: 'high',
            action: 'Ver comprovante'
          },
          {
            id: 4,
            type: 'review',
            title: 'Nova avaliação recebida',
            message: 'Carlos Oliveira avaliou seu serviço com 5 estrelas',
            timestamp: 'Ontem',
            isRead: true,
            priority: 'medium',
            action: 'Ver avaliação'
          },
          {
            id: 5,
            type: 'booking',
            title: 'Agendamento cancelado',
            message: 'Pedro Santos cancelou o agendamento de 16/01',
            timestamp: 'Ontem',
            isRead: true,
            priority: 'low',
            action: 'Ver detalhes'
          },
          {
            id: 6,
            type: 'system',
            title: 'Manutenção programada',
            message: 'O sistema passará por manutenção no domingo às 02h',
            timestamp: '2 dias atrás',
            isRead: true,
            priority: 'low',
            action: 'Mais informações'
          }
        ];

        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
        setIsLoading(false);
      }, 1000);
    };

    loadNotifications();
  }, []);

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.isRead;
    return notification.type === filter;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking':
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-green-600" />;
      case 'payment':
        return <DollarSign className="w-5 h-5 text-yellow-600" />;
      case 'review':
        return <Star className="w-5 h-5 text-purple-600" />;
      case 'system':
        return <Info className="w-5 h-5 text-gray-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-gray-500 bg-gray-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id 
        ? { ...notification, isRead: true }
        : notification
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => 
      ({ ...notification, isRead: true })
    ));
    setUnreadCount(0);
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const NotificationItem = ({ notification }) => (
    <div className={`p-4 border-l-4 ${getPriorityColor(notification.priority)} ${
      !notification.isRead ? 'bg-blue-50' : 'bg-white'
    } border-b border-gray-200`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">
              {notification.title}
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">{notification.timestamp}</span>
              {!notification.isRead && (
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
          <div className="flex items-center justify-between mt-3">
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              {notification.action}
            </button>
            <div className="flex items-center space-x-2">
              {!notification.isRead && (
                <button
                  onClick={() => markAsRead(notification.id)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="Marcar como lida"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => deleteNotification(notification.id)}
                className="p-1 text-gray-400 hover:text-red-600"
                title="Excluir"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando notificações...</p>
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
                Notificações
              </h1>
              {unreadCount > 0 && (
                <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {unreadCount} não lidas
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <MarkAsRead className="w-4 h-4 mr-2" />
                  Marcar todas como lidas
                </button>
              )}
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
                Filtrar por tipo
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                {filters.map(filterOption => (
                  <option key={filterOption.value} value={filterOption.value}>
                    {filterOption.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:w-64">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estatísticas
              </label>
              <div className="text-sm text-gray-600">
                <div>Total: {notifications.length}</div>
                <div>Não lidas: {unreadCount}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Bell className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma notificação encontrada
              </h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? 'Você não possui notificações ainda.'
                  : 'Nenhuma notificação corresponde ao filtro selecionado.'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        {notifications.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Resumo das Notificações
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {notifications.filter(n => n.type === 'booking').length}
                </div>
                <div className="text-sm text-gray-600">Agendamentos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {notifications.filter(n => n.type === 'message').length}
                </div>
                <div className="text-sm text-gray-600">Mensagens</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {notifications.filter(n => n.type === 'payment').length}
                </div>
                <div className="text-sm text-gray-600">Pagamentos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {notifications.filter(n => n.type === 'review').length}
                </div>
                <div className="text-sm text-gray-600">Avaliações</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderNotifications;
