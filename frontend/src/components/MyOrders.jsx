import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Star, CheckCircle, XCircle, AlertCircle, User, Phone, MessageCircle, Eye, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { ORDERS_DATA, getOrderStats, getOrdersByStatus, addNewOrder } from '../data/orders';

const MyOrders = () => {
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Aplicar filtro da URL
  useEffect(() => {
    const urlFilter = searchParams.get('filter');
    if (urlFilter) {
      setFilter(urlFilter);
    }
  }, [searchParams]);

  useEffect(() => {
    // Carregar dados do localStorage e dados simulados
    const loadOrders = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Carregar dados do localStorage
      const savedOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
      console.log('Saved orders from localStorage:', savedOrders);
      
      // Combinar com dados simulados (evitar duplicatas)
      const existingIds = savedOrders.map(order => order.id);
      const newSimulatedOrders = ORDERS_DATA.filter(order => !existingIds.includes(order.id));
      const allOrders = [...savedOrders, ...newSimulatedOrders];
      
      console.log('All orders combined:', allOrders);
      
      // Salvar todos os pedidos no localStorage
      localStorage.setItem('userOrders', JSON.stringify(allOrders));
      
      const orderStats = getOrderStats(allOrders);
      setStats(orderStats);
      
      const filteredOrders = getOrdersByStatus(allOrders, filter);
      setOrders(filteredOrders);
      
      console.log('Filtered orders:', filteredOrders);
      
      setLoading(false);
    };

    loadOrders();
  }, [filter]);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pendente':
        return {
          label: 'Pendente',
          color: 'text-yellow-600 bg-yellow-100',
          icon: AlertCircle
        };
      case 'confirmado':
        return {
          label: 'Confirmado',
          color: 'text-blue-600 bg-blue-100',
          icon: Clock
        };
      case 'concluido':
        return {
          label: 'Concluído',
          color: 'text-green-600 bg-green-100',
          icon: CheckCircle
        };
      case 'cancelado':
        return {
          label: 'Cancelado',
          color: 'text-red-600 bg-red-100',
          icon: XCircle
        };
      default:
        return {
          label: 'Desconhecido',
          color: 'text-gray-600 bg-gray-100',
          icon: AlertCircle
        };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando seus pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Meus Pedidos
          </h1>
          <p className="text-gray-600">
            Gerencie todos os seus pedidos e agendamentos
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Botão de Teste */}
        <div className="mb-6">
          <button
            onClick={() => {
              const testOrder = addNewOrder({
                professional: {
                  id: "1",
                  name: "João Silva",
                  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
                  rating: 4.8
                },
                service: {
                  name: "Limpeza Residencial Teste",
                  category: "Limpeza Residencial",
                  description: "Agendamento de teste criado automaticamente"
                },
                date: new Date().toISOString().split('T')[0],
                time: "14:00 - 16:00",
                duration: 2,
                price: 160,
                payment_status: "pending",
                address: "Endereço de Teste, 123",
                notes: "Este é um agendamento de teste criado para demonstrar a funcionalidade."
              });
              alert(`Agendamento de teste criado com ID: ${testOrder.id}`);
              // Recarregar a página para mostrar o novo agendamento
              window.location.reload();
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + Criar Agendamento de Teste
          </button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Calendar className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Concluídos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Confirmados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.confirmed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtrar por status:</span>
            <div className="flex space-x-2">
              {[
                { key: 'all', label: 'Todos' },
                { key: 'pendente', label: 'Pendentes' },
                { key: 'confirmado', label: 'Confirmados' },
                { key: 'concluido', label: 'Concluídos' },
                { key: 'cancelado', label: 'Cancelados' }
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => setFilter(option.key)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filter === option.key
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de Pedidos */}
        <div className="space-y-4">
          <AnimatePresence>
            {orders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <StatusIcon className="w-5 h-5 text-gray-500" />
                            <span className="text-sm font-medium text-gray-500">
                              {order.id}
                            </span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            {formatCurrency(order.price)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.duration}h de serviço
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Informações do Serviço */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {order.service.name}
                          </h3>
                          <p className="text-gray-600 mb-4">
                            {order.service.description}
                          </p>
                          
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="w-4 h-4 mr-2" />
                              {formatDate(order.date)}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="w-4 h-4 mr-2" />
                              {order.time}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mr-2" />
                              {order.address}
                            </div>
                          </div>
                        </div>

                        {/* Informações do Profissional */}
                        <div>
                          <h4 className="text-md font-semibold text-gray-900 mb-3">
                            Profissional
                          </h4>
                          <div className="flex items-center space-x-3 mb-4">
                            <img
                              src={order.professional.avatar}
                              alt={order.professional.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                              <p className="font-medium text-gray-900">
                                {order.professional.name}
                              </p>
                              <div className="flex items-center">
                                <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                                <span className="text-sm text-gray-600">
                                  {order.professional.rating}
                                </span>
                              </div>
                            </div>
                          </div>

                          {order.notes && (
                            <div className="mb-4">
                              <p className="text-sm text-gray-600">
                                <strong>Observações:</strong> {order.notes}
                              </p>
                            </div>
                          )}

                          {order.review && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-center mb-2">
                                <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                                <span className="text-sm font-medium text-gray-900">
                                  Sua avaliação: {order.rating}/5
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                "{order.review}"
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="ml-6 flex flex-col space-y-2">
                      <button 
                        onClick={() => handleViewDetails(order)}
                        className="flex items-center px-3 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </button>
                      
                      {order.status === 'pendente' && (
                        <button className="flex items-center px-3 py-2 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Confirmar
                        </button>
                      )}
                      
                      {order.status === 'confirmado' && (
                        <button className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Contatar
                        </button>
                      )}
                      
                      {order.status === 'concluido' && !order.review && (
                        <button className="flex items-center px-3 py-2 text-sm font-medium text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 rounded-lg transition-colors">
                          <Star className="w-4 h-4 mr-2" />
                          Avaliar
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {orders.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum pedido encontrado
              </h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? 'Você ainda não fez nenhum pedido.'
                  : `Não há pedidos com status "${filter}".`
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalhes */}
      {showDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Detalhes do Pedido</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Informações do Pedido */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Informações do Pedido</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">ID do Pedido</p>
                      <p className="font-medium">{selectedOrder.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusInfo(selectedOrder.status).color}`}>
                        {getStatusInfo(selectedOrder.status).label}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Data</p>
                      <p className="font-medium">{selectedOrder.date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Horário</p>
                      <p className="font-medium">{selectedOrder.time}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Duração</p>
                      <p className="font-medium">{selectedOrder.duration}h</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Preço</p>
                      <p className="font-medium text-green-600">R$ {selectedOrder.price.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Informações do Serviço */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Serviço</h3>
                  <div>
                    <p className="font-medium text-gray-900">{selectedOrder.service.name}</p>
                    <p className="text-sm text-gray-600 mt-1">{selectedOrder.service.description}</p>
                    <p className="text-sm text-indigo-600 mt-2">{selectedOrder.service.category}</p>
                  </div>
                </div>

                {/* Informações do Profissional */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Profissional</h3>
                  <div className="flex items-center space-x-4">
                    <img
                      src={selectedOrder.professional.avatar}
                      alt={selectedOrder.professional.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{selectedOrder.professional.name}</p>
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">{selectedOrder.professional.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Endereço */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Endereço</h3>
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <p className="text-gray-700">{selectedOrder.address}</p>
                  </div>
                </div>

                {/* Observações */}
                {selectedOrder.notes && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Observações</h3>
                    <p className="text-gray-700">{selectedOrder.notes}</p>
                  </div>
                )}

                {/* Avaliação */}
                {selectedOrder.rating && selectedOrder.review && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Sua Avaliação</h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm text-gray-600">Nota:</span>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= selectedOrder.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">({selectedOrder.rating}/5)</span>
                    </div>
                    <p className="text-gray-700 italic">"{selectedOrder.review}"</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
