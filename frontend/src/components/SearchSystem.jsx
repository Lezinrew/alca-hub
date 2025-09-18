// Sistema de Busca Avançado - Alça Hub
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Search, Filter, MapPin, Clock, Star, Users, Calendar, DollarSign } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const SearchSystem = ({ onSearchResults, onProfessionalSelect }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [filters, setFilters] = useState({
    priceRange: [0, 1000],
    rating: 0,
    distance: 10,
    availability: 'all'
  })
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])
  const [suggestions, setSuggestions] = useState([])

  // Categorias de serviços
  const serviceCategories = [
    { id: 'all', name: 'Todos os Serviços', icon: '🔧' },
    { id: 'cleaning', name: 'Limpeza', icon: '🧹' },
    { id: 'maintenance', name: 'Manutenção', icon: '🔨' },
    { id: 'delivery', name: 'Entrega', icon: '📦' },
    { id: 'beauty', name: 'Beleza', icon: '💄' },
    { id: 'health', name: 'Saúde', icon: '🏥' },
    { id: 'education', name: 'Educação', icon: '📚' },
    { id: 'technology', name: 'Tecnologia', icon: '💻' },
    { id: 'transport', name: 'Transporte', icon: '🚗' },
    { id: 'food', name: 'Alimentação', icon: '🍽️' }
  ]

  // Serviços de exemplo (em produção viria da API)
  const mockServices = [
    {
      id: 1,
      name: 'Limpeza Residencial',
      category: 'cleaning',
      professional: {
        id: 1,
        name: 'Maria Silva',
        rating: 4.8,
        reviews: 156,
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        distance: 2.5,
        isOnline: true
      },
      price: {
        min: 80,
        max: 120,
        average: 100,
        currency: 'BRL'
      },
      description: 'Limpeza completa da residência com produtos eco-friendly',
      tags: ['limpeza', 'casa', 'eco-friendly'],
      availability: {
        nextAvailable: '2024-01-15',
        slots: ['09:00', '14:00', '16:00']
      },
      rating: 4.8,
      reviews: 156
    },
    {
      id: 2,
      name: 'Manutenção de Computadores',
      category: 'technology',
      professional: {
        id: 2,
        name: 'João Santos',
        rating: 4.9,
        reviews: 89,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        distance: 1.8,
        isOnline: true
      },
      price: {
        min: 120,
        max: 200,
        average: 160,
        currency: 'BRL'
      },
      description: 'Manutenção e reparo de computadores e notebooks',
      tags: ['tecnologia', 'computador', 'reparo'],
      availability: {
        nextAvailable: '2024-01-16',
        slots: ['10:00', '15:00']
      },
      rating: 4.9,
      reviews: 89
    },
    {
      id: 3,
      name: 'Aula Particular de Matemática',
      category: 'education',
      professional: {
        id: 3,
        name: 'Ana Costa',
        rating: 4.7,
        reviews: 203,
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        distance: 3.2,
        isOnline: false
      },
      price: {
        min: 60,
        max: 80,
        average: 70,
        currency: 'BRL'
      },
      description: 'Aulas particulares de matemática para ensino médio',
      tags: ['educação', 'matemática', 'aula particular'],
      availability: {
        nextAvailable: '2024-01-17',
        slots: ['14:00', '16:00', '18:00']
      },
      rating: 4.7,
      reviews: 203
    }
  ]

  // Buscar serviços
  const searchServices = useCallback(async (query, category, filters) => {
    setIsSearching(true)
    
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 800))
    
    let results = mockServices.filter(service => {
      const matchesQuery = !query || 
        service.name.toLowerCase().includes(query.toLowerCase()) ||
        service.description.toLowerCase().includes(query.toLowerCase()) ||
        service.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      
      const matchesCategory = !category || category === 'all' || service.category === category
      
      const matchesPrice = service.price.average >= filters.priceRange[0] && 
                          service.price.average <= filters.priceRange[1]
      
      const matchesRating = service.rating >= filters.rating
      
      return matchesQuery && matchesCategory && matchesPrice && matchesRating
    })
    
    // Ordenar por relevância
    results.sort((a, b) => {
      if (a.professional.distance !== b.professional.distance) {
        return a.professional.distance - b.professional.distance
      }
      return b.rating - a.rating
    })
    
    setSearchResults(results)
    setIsSearching(false)
    
    // Salvar busca recente
    if (query) {
      setRecentSearches(prev => {
        const newSearches = [query, ...prev.filter(s => s !== query)].slice(0, 5)
        localStorage.setItem('recentSearches', JSON.stringify(newSearches))
        return newSearches
      })
    }
    
    onSearchResults?.(results)
  }, [onSearchResults])

  // Carregar buscas recentes
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Gerar sugestões
  useEffect(() => {
    if (searchQuery.length > 2) {
      const suggestions = mockServices
        .filter(service => 
          service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .slice(0, 5)
        .map(service => service.name)
      
      setSuggestions(suggestions)
    } else {
      setSuggestions([])
    }
  }, [searchQuery])

  // Executar busca
  const handleSearch = useCallback(() => {
    searchServices(searchQuery, selectedCategory, filters)
  }, [searchQuery, selectedCategory, filters, searchServices])

  // Selecionar profissional
  const handleProfessionalSelect = useCallback((service) => {
    onProfessionalSelect?.(service)
  }, [onProfessionalSelect])

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Barra de Busca Principal */}
      <div className="relative mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar serviços... (ex: limpeza, manutenção, aula particular)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
          >
            {isSearching ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {/* Sugestões */}
        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-2"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchQuery(suggestion)
                    handleSearch()
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  {suggestion}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Categoria */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoria
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {serviceCategories.map(category => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Faixa de Preço */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preço: R$ {filters.priceRange[0]} - R$ {filters.priceRange[1]}
          </label>
          <input
            type="range"
            min="0"
            max="1000"
            step="10"
            value={filters.priceRange[1]}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              priceRange: [prev.priceRange[0], parseInt(e.target.value)]
            }))}
            className="w-full"
          />
        </div>

        {/* Avaliação Mínima */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Avaliação: {filters.rating}+ ⭐
          </label>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={filters.rating}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              rating: parseFloat(e.target.value)
            }))}
            className="w-full"
          />
        </div>

        {/* Distância */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Distância: {filters.distance}km
          </label>
          <input
            type="range"
            min="1"
            max="50"
            step="1"
            value={filters.distance}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              distance: parseInt(e.target.value)
            }))}
            className="w-full"
          />
        </div>
      </div>

      {/* Buscas Recentes */}
      {recentSearches.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Buscas Recentes</h3>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => {
                  setSearchQuery(search)
                  handleSearch()
                }}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Resultados da Busca */}
      <div className="space-y-4">
        {searchResults.map((service) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {service.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">
                      {service.rating} ({service.reviews} avaliações)
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">{service.description}</p>
                
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    <span>R$ {service.price.average}/hora</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{service.professional.distance}km</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Próximo: {service.availability.nextAvailable}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-3">
                <div className="flex items-center gap-2">
                  <img
                    src={service.professional.avatar}
                    alt={service.professional.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {service.professional.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {service.professional.reviews} avaliações
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleProfessionalSelect(service)}
                  className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Ver Agenda
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {searchResults.length === 0 && !isSearching && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum serviço encontrado
          </h3>
          <p className="text-gray-500">
            Tente ajustar os filtros ou usar termos diferentes
          </p>
        </div>
      )}
    </div>
  )
}

export default SearchSystem
