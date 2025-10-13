import React, { useState, useEffect, memo } from 'react';
import { Calendar, Clock, MapPin, Star, CheckCircle, User, Phone, MessageCircle, Filter, Eye, ThumbsUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { COMPLETED_SERVICES, getServiceStats, getServicesByCategory } from '../data/completedServices';

const ServiceHistory = () => {
  const [services, setServices] = useState([]);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento dos dados
    const loadServices = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const serviceStats = getServiceStats();
      setStats(serviceStats);
      
      const filteredServices = getServicesByCategory(filter);
      setServices(filteredServices);
      
      setLoading(false);
    };

    loadServices();
  }, [filter]);

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

  const categories = [
    { key: 'all', label: 'Todos' },
    { key: 'Limpeza Residencial', label: 'Limpeza Residencial' },
    { key: 'Organização', label: 'Organização' },
    { key: 'Limpeza Pós-Obra', label: 'Limpeza Pós-Obra' },
    { key: 'Limpeza Comercial', label: 'Limpeza Comercial' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando histórico de serviços...</p>
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
            Histórico de Serviços
          </h1>
          <p className="text-gray-600">
            Veja todos os serviços que você já contratou e finalizou
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Serviços Concluídos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avaliação Média</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating}/5</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtrar por categoria:</span>
            <div className="flex space-x-2">
              {categories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setFilter(category.key)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filter === category.key
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de Serviços */}
        <div className="space-y-4">
          <AnimatePresence>
            {services.map((service) => (
              <motion.div
                key={service.id}
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
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="text-sm font-medium text-gray-500">
                            {service.id}
                          </span>
                        </div>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Concluído
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(service.price)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {service.duration}h de serviço
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Informações do Serviço */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {service.service.name}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {service.service.description}
                        </p>
                        
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            {formatDate(service.date)}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-2" />
                            {service.time}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            {service.address}
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
                            src={service.professional.avatar}
                            alt={service.professional.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium text-gray-900">
                              {service.professional.name}
                            </p>
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                              <span className="text-sm text-gray-600">
                                {service.professional.rating}
                              </span>
                            </div>
                          </div>
                        </div>

                        {service.notes && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-600">
                              <strong>Observações:</strong> {service.notes}
                            </p>
                          </div>
                        )}

                        {service.review && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center mb-2">
                              <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                              <span className="text-sm font-medium text-gray-900">
                                Sua avaliação: {service.rating}/5
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              "{service.review}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="ml-6 flex flex-col space-y-2">
                    <button className="flex items-center px-3 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors">
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalhes
                    </button>
                    
                    <button className="flex items-center px-3 py-2 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors">
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      Contratar Novamente
                    </button>
                    
                    <button className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Contatar
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {services.length === 0 && (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum serviço encontrado
              </h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? 'Você ainda não finalizou nenhum serviço.'
                  : `Não há serviços concluídos na categoria "${filter}".`
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(ServiceHistory);
