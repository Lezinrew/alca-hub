import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter,
  Star,
  Clock,
  DollarSign,
  MapPin,
  Users,
  Calendar
} from 'lucide-react';

const ProviderServices = () => {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const categories = [
    { value: 'all', label: 'Todas as categorias' },
    { value: 'limpeza', label: 'Limpeza' },
    { value: 'manutencao', label: 'Manutenção' },
    { value: 'pintura', label: 'Pintura' },
    { value: 'jardinagem', label: 'Jardinagem' },
    { value: 'eletrica', label: 'Elétrica' },
    { value: 'hidraulica', label: 'Hidráulica' }
  ];

  useEffect(() => {
    // Simular carregamento de dados
    const loadServices = async () => {
      setIsLoading(true);
      
      setTimeout(() => {
        setServices([
          {
            id: 1,
            title: 'Limpeza Residencial Completa',
            category: 'limpeza',
            description: 'Limpeza completa de residências, incluindo todos os cômodos, móveis e eletrodomésticos.',
            price: 120.00,
            duration: '4 horas',
            rating: 4.8,
            totalBookings: 45,
            status: 'active',
            images: ['/images/limpeza1.jpg', '/images/limpeza2.jpg'],
            availability: {
              monday: { start: '08:00', end: '18:00' },
              tuesday: { start: '08:00', end: '18:00' },
              wednesday: { start: '08:00', end: '18:00' },
              thursday: { start: '08:00', end: '18:00' },
              friday: { start: '08:00', end: '18:00' },
              saturday: { start: '08:00', end: '16:00' },
              sunday: { start: '09:00', end: '15:00' }
            }
          },
          {
            id: 2,
            title: 'Manutenção Elétrica',
            category: 'eletrica',
            description: 'Serviços de manutenção elétrica residencial e comercial.',
            price: 150.00,
            duration: '2 horas',
            rating: 4.9,
            totalBookings: 23,
            status: 'active',
            images: ['/images/eletrica1.jpg'],
            availability: {
              monday: { start: '07:00', end: '17:00' },
              tuesday: { start: '07:00', end: '17:00' },
              wednesday: { start: '07:00', end: '17:00' },
              thursday: { start: '07:00', end: '17:00' },
              friday: { start: '07:00', end: '17:00' },
              saturday: { start: '08:00', end: '14:00' },
              sunday: { start: '09:00', end: '13:00' }
            }
          },
          {
            id: 3,
            title: 'Pintura de Paredes',
            category: 'pintura',
            description: 'Pintura de paredes internas e externas com materiais de qualidade.',
            price: 200.00,
            duration: '6 horas',
            rating: 4.7,
            totalBookings: 18,
            status: 'inactive',
            images: ['/images/pintura1.jpg', '/images/pintura2.jpg'],
            availability: {
              monday: { start: '08:00', end: '18:00' },
              tuesday: { start: '08:00', end: '18:00' },
              wednesday: { start: '08:00', end: '18:00' },
              thursday: { start: '08:00', end: '18:00' },
              friday: { start: '08:00', end: '18:00' },
              saturday: { start: '09:00', end: '17:00' },
              sunday: { start: '10:00', end: '16:00' }
            }
          }
        ]);
        setIsLoading(false);
      }, 1000);
    };

    loadServices();
  }, []);

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || service.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const ServiceCard = ({ service }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {service.title}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {service.description}
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 mr-1" />
                R$ {service.price.toFixed(2)}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {service.duration}
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-1" />
                {service.rating}
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {service.totalBookings} agendamentos
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              service.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {service.status === 'active' ? 'Ativo' : 'Inativo'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setEditingService(service)}
              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Edit className="w-4 h-4 mr-1" />
              Editar
            </button>
            <button className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Eye className="w-4 h-4 mr-1" />
              Visualizar
            </button>
            <button className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50">
              <Trash2 className="w-4 h-4 mr-1" />
              Excluir
            </button>
          </div>
          <div className="text-sm text-gray-500">
            {categories.find(cat => cat.value === service.category)?.label}
          </div>
        </div>
      </div>
    </div>
  );

  const ServiceModal = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingService ? 'Editar Serviço' : 'Novo Serviço'}
          </h3>
          
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título do Serviço
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Limpeza Residencial"
                defaultValue={editingService?.title || ''}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                {categories.slice(1).map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descreva o serviço oferecido..."
                defaultValue={editingService?.description || ''}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="120.00"
                  defaultValue={editingService?.price || ''}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duração
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="4 horas"
                  defaultValue={editingService?.duration || ''}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setEditingService(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                {editingService ? 'Salvar Alterações' : 'Criar Serviço'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando serviços...</p>
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
                Meus Serviços
              </h1>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Serviço
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar serviços..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="sm:w-64">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="space-y-6">
          {filteredServices.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Settings className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum serviço encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterCategory !== 'all' 
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Comece criando seu primeiro serviço.'
                }
              </p>
              {!searchTerm && filterCategory === 'all' && (
                <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Serviço
                </button>
              )}
            </div>
          ) : (
            filteredServices.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && <ServiceModal />}
    </div>
  );
};

export default ProviderServices;
