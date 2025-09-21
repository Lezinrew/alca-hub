import React, { useState, useEffect } from 'react';
import { Search, Star, Clock, DollarSign, Plus, Filter, Heart, Trash2, Edit } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

const ServiceManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [favoriteServices, setFavoriteServices] = useState([]);
  const [recentServices, setRecentServices] = useState([]);

  // Categorias de serviços
  const categories = [
    'Todas',
    'Limpeza Residencial',
    'Limpeza Comercial', 
    'Limpeza Industrial',
    'Organização',
    'Limpeza Pós-Obra',
    'Manutenção'
  ];

  // Serviços disponíveis (mock data)
  const availableServices = [
    {
      id: 1,
      name: 'Limpeza Residencial Completa',
      category: 'Limpeza Residencial',
      description: 'Limpeza completa da residência incluindo todos os cômodos',
      basePrice: 100,
      duration: 4,
      rating: 4.8,
      isFavorite: false,
      isRecent: true,
      lastUsed: '2024-01-15'
    },
    {
      id: 2,
      name: 'Organização de Ambientes',
      category: 'Organização',
      description: 'Organização e arrumação de ambientes residenciais',
      basePrice: 80,
      duration: 3,
      rating: 4.9,
      isFavorite: true,
      isRecent: true,
      lastUsed: '2024-01-10'
    },
    {
      id: 3,
      name: 'Limpeza Pós-Obra',
      category: 'Limpeza Pós-Obra',
      description: 'Limpeza especializada após reformas e construções',
      basePrice: 150,
      duration: 6,
      rating: 4.7,
      isFavorite: false,
      isRecent: false,
      lastUsed: '2023-12-20'
    },
    {
      id: 4,
      name: 'Limpeza Comercial',
      category: 'Limpeza Comercial',
      description: 'Limpeza de escritórios e estabelecimentos comerciais',
      basePrice: 120,
      duration: 5,
      rating: 4.6,
      isFavorite: true,
      isRecent: false,
      lastUsed: '2023-11-15'
    },
    {
      id: 5,
      name: 'Manutenção Preventiva',
      category: 'Manutenção',
      description: 'Manutenção preventiva de equipamentos e sistemas',
      basePrice: 200,
      duration: 8,
      rating: 4.9,
      isFavorite: false,
      isRecent: true,
      lastUsed: '2024-01-12'
    }
  ];

  // Carregar dados iniciais
  useEffect(() => {
    const favorites = availableServices.filter(service => service.isFavorite);
    const recent = availableServices.filter(service => service.isRecent);
    setFavoriteServices(favorites);
    setRecentServices(recent);
  }, []);

  // Filtrar serviços
  const filteredServices = availableServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Toggle favorito
  const toggleFavorite = (serviceId) => {
    setFavoriteServices(prev => {
      const service = availableServices.find(s => s.id === serviceId);
      const isCurrentlyFavorite = prev.some(s => s.id === serviceId);
      
      if (isCurrentlyFavorite) {
        return prev.filter(s => s.id !== serviceId);
      } else {
        return [...prev, service];
      }
    });
  };

  // Adicionar aos recentes
  const addToRecent = (service) => {
    setRecentServices(prev => {
      const exists = prev.some(s => s.id === service.id);
      if (!exists) {
        return [service, ...prev.slice(0, 4)]; // Manter apenas os 5 mais recentes
      }
      return prev;
    });
  };

  // Usar serviço
  const useService = (service) => {
    addToRecent(service);
    // Aqui você pode navegar para o agendamento ou abrir um modal
    console.log('Usando serviço:', service);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestão de Serviços</h1>
        <p className="text-gray-600">Gerencie seus serviços favoritos e encontre novos por categoria</p>
      </div>

      {/* Busca e Filtros */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Buscar serviços..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Serviços Favoritos */}
      {favoriteServices.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-900">Serviços Favoritos</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteServices.map(service => (
              <Card key={service.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(service.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </Button>
                  </div>
                  <Badge variant="secondary">{service.category}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{service.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{service.duration}h</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-green-600">
                      R$ {service.basePrice}/h
                    </span>
                    <Button
                      onClick={() => useService(service)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Usar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Serviços Recentes */}
      {recentServices.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900">Usados Recentemente</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentServices.map(service => (
              <Card key={service.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(service.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Badge variant="secondary">{service.category}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{service.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{service.duration}h</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-green-600">
                      R$ {service.basePrice}/h
                    </span>
                    <Button
                      onClick={() => useService(service)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Usar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Todos os Serviços */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h2 className="text-xl font-semibold text-gray-900">
            {selectedCategory === 'Todas' ? 'Todos os Serviços' : `Serviços de ${selectedCategory}`}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map(service => (
            <Card key={service.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(service.id)}
                    className={`${
                      favoriteServices.some(fav => fav.id === service.id)
                        ? 'text-red-500 hover:text-red-700'
                        : 'text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${
                      favoriteServices.some(fav => fav.id === service.id) ? 'fill-current' : ''
                    }`} />
                  </Button>
                </div>
                <Badge variant="secondary">{service.category}</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{service.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{service.duration}h</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-green-600">
                    R$ {service.basePrice}/h
                  </span>
                  <Button
                    onClick={() => useService(service)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Usar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Nenhum resultado */}
      {filteredServices.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum serviço encontrado</h3>
          <p className="text-gray-600 mb-4">
            Tente ajustar os filtros ou termo de busca
          </p>
          <Button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('Todas');
            }}
            variant="outline"
          >
            Limpar Filtros
          </Button>
        </div>
      )}
    </div>
  );
};

export default ServiceManagement;
