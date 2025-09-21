import React, { useState, useEffect } from 'react';
import { Star, User, Calendar, Clock, MapPin, MessageSquare, Send, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ORDERS_DATA } from '../data/orders';

const ReviewScreen = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Carregar pedidos que podem ser avaliados (concluídos)
    const loadReviewableOrders = () => {
      const savedOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
      const allOrders = [...savedOrders, ...ORDERS_DATA];
      
      // Filtrar apenas pedidos concluídos que ainda não foram avaliados
      const reviewableOrders = allOrders.filter(order => 
        order.status === 'concluido' && !order.rating
      );
      
      setOrders(reviewableOrders);
    };

    loadReviewableOrders();
  }, []);

  const handleOrderSelect = (order) => {
    setSelectedOrder(order);
    setRating(0);
    setHoverRating(0);
    setReview('');
    setSubmitted(false);
  };

  const handleRatingClick = (value) => {
    setRating(value);
  };

  const handleRatingHover = (value) => {
    setHoverRating(value);
  };

  const handleRatingLeave = () => {
    setHoverRating(0);
  };

  const handleSubmitReview = async () => {
    if (!selectedOrder || rating === 0) return;

    setLoading(true);
    
    try {
      // Simular envio da avaliação
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Atualizar o pedido com a avaliação
      const savedOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
      const updatedOrders = savedOrders.map(order => 
        order.id === selectedOrder.id 
          ? { ...order, rating, review, reviewDate: new Date().toISOString() }
          : order
      );
      
      localStorage.setItem('userOrders', JSON.stringify(updatedOrders));
      
      setSubmitted(true);
      
      // Remover o pedido da lista de avaliáveis
      setOrders(prev => prev.filter(order => order.id !== selectedOrder.id));
      
      // Limpar seleção após 2 segundos
      setTimeout(() => {
        setSelectedOrder(null);
        setSubmitted(false);
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'concluido':
        return {
          label: 'Concluído',
          color: 'text-green-600 bg-green-100'
        };
      default:
        return {
          label: status,
          color: 'text-gray-600 bg-gray-100'
        };
    }
  };

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <Star className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Nenhum serviço para avaliar</h2>
          <p className="text-gray-600 mb-6">
            Você não tem serviços concluídos disponíveis para avaliação no momento.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-blue-800 text-sm">
              <strong>Dica:</strong> Após a conclusão de um serviço, você poderá avaliar o profissional aqui.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Avaliar Serviços</h1>
        <p className="text-gray-600">Avalie os profissionais que realizaram serviços para você</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Lista de Pedidos */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Serviços Concluídos</h2>
          <div className="space-y-4">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedOrder?.id === order.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
                onClick={() => handleOrderSelect(order)}
              >
                <div className="flex items-start space-x-4">
                  <img
                    src={order.professional.avatar}
                    alt={order.professional.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{order.professional.name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusInfo(order.status).color}`}>
                        {getStatusInfo(order.status).label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{order.service.name}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {order.date}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {order.time}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Formulário de Avaliação */}
        <div>
          {selectedOrder ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white border border-gray-200 rounded-lg p-6"
            >
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Avaliar Serviço</h3>
                <div className="flex items-center space-x-3">
                  <img
                    src={selectedOrder.professional.avatar}
                    alt={selectedOrder.professional.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{selectedOrder.professional.name}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.service.name}</p>
                  </div>
                </div>
              </div>

              {!submitted ? (
                <>
                  {/* Avaliação por Estrelas */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Como foi sua experiência? *
                    </label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRatingClick(star)}
                          onMouseEnter={() => handleRatingHover(star)}
                          onMouseLeave={handleRatingLeave}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-8 h-8 transition-colors ${
                              star <= (hoverRating || rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      {rating === 0 && 'Clique nas estrelas para avaliar'}
                      {rating === 1 && 'Péssimo'}
                      {rating === 2 && 'Ruim'}
                      {rating === 3 && 'Regular'}
                      {rating === 4 && 'Bom'}
                      {rating === 5 && 'Excelente'}
                    </div>
                  </div>

                  {/* Comentário */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Deixe um comentário (opcional)
                    </label>
                    <textarea
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      placeholder="Conte-nos sobre sua experiência com este profissional..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                      rows={4}
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      {review.length}/500 caracteres
                    </p>
                  </div>

                  {/* Botão de Envio */}
                  <button
                    onClick={handleSubmitReview}
                    disabled={rating === 0 || loading}
                    className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
                      rating === 0 || loading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Enviar Avaliação
                      </>
                    )}
                  </button>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Avaliação Enviada!</h3>
                  <p className="text-gray-600">
                    Obrigado por avaliar o profissional. Sua opinião é muito importante para nós.
                  </p>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Star className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Selecione um serviço</h3>
              <p className="text-gray-600">
                Escolha um serviço concluído da lista ao lado para avaliar o profissional.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewScreen;
