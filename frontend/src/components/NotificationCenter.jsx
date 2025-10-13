// Centro de Notificações - Alça Hub
import React, { useState, useEffect } from 'react';
import { Bell, X, Check, AlertCircle, Info, CheckCircle } from 'lucide-react';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Simular dados de notificações
  const mockNotifications = [
    {
      id: '1',
      type: 'booking_request',
      title: 'Nova solicitação de serviço',
      message: 'Você recebeu uma nova solicitação para limpeza doméstica',
      priority: 'high',
      created_at: new Date().toISOString(),
      read: false,
      data: {
        booking_id: '123',
        service_name: 'Limpeza Doméstica'
      }
    },
    {
      id: '2',
      type: 'payment_received',
      title: 'Pagamento confirmado',
      message: 'Seu pagamento de R$ 150,00 foi processado com sucesso!',
      priority: 'high',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      read: false,
      data: {
        amount: 150.00,
        transaction_id: 'TXN123456'
      }
    },
    {
      id: '3',
      type: 'rating_received',
      title: 'Nova avaliação recebida',
      message: 'Maria Silva avaliou seu serviço com 5 estrelas!',
      priority: 'medium',
      created_at: new Date(Date.now() - 7200000).toISOString(),
      read: true,
      data: {
        rating: 5,
        reviewer_name: 'Maria Silva'
      }
    }
  ];

  useEffect(() => {
    // Carregar notificações
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      // Simular carregamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  const getNotificationIcon = (type, priority) => {
    const iconClass = `w-5 h-5 ${
      priority === 'urgent' ? 'text-red-500' :
      priority === 'high' ? 'text-orange-500' :
      priority === 'medium' ? 'text-blue-500' :
      'text-gray-500'
    }`;

    switch (type) {
      case 'booking_request':
        return <Bell className={iconClass} />;
      case 'payment_received':
        return <CheckCircle className={iconClass} />;
      case 'rating_received':
        return <Info className={iconClass} />;
      case 'security_alert':
        return <AlertCircle className={iconClass} />;
      default:
        return <Bell className={iconClass} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Agora';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min atrás`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="relative">
      {/* Botão de notificações */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Painel de notificações */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Cabeçalho */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Notificações
              </h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Marcar todas como lidas
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Lista de notificações */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Carregando notificações...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Nenhuma notificação
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-l-4 ${getPriorityColor(notification.priority)} ${
                    !notification.read ? 'bg-blue-50' : 'bg-white'
                  } hover:bg-gray-50 transition-colors`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type, notification.priority)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {formatTime(notification.created_at)}
                        </span>
                        {notification.priority === 'urgent' && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                            Urgente
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Rodapé */}
          <div className="p-4 border-t border-gray-200">
            <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
              Ver todas as notificações
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
