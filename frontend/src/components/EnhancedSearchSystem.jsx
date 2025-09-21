import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Star, Clock, User, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PROFESSIONALS_DATA, searchProfessionals, getSearchSuggestions, SERVICE_CATEGORIES } from '../data/professionals';

const EnhancedSearchSystem = ({ onSearchResults, onProfessionalSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    specialty: '',
    priceRange: '',
    rating: '',
    distance: ''
  });
  
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Atualizar sugestões quando a query muda
  useEffect(() => {
    if (searchQuery.length >= 1) {
      const newSuggestions = getSearchSuggestions(searchQuery);
      setSuggestions(newSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  // Fechar sugestões quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Função de busca
  const handleSearch = async (query = searchQuery) => {
    if (!query.trim()) {
      setSearchResults([]);
      onSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const results = searchProfessionals(query);
      setSearchResults(results);
      if (onSearchResults && typeof onSearchResults === 'function') {
        onSearchResults(results);
      }
    } catch (error) {
      console.error('Erro na busca:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Selecionar sugestão
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    handleSearch(suggestion);
  };

  // Limpar busca
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSuggestions(false);
    if (onSearchResults && typeof onSearchResults === 'function') {
      onSearchResults([]);
    }
    searchInputRef.current?.focus();
  };

  // Selecionar profissional
  const handleProfessionalClick = (professional) => {
    if (onProfessionalSelect && typeof onProfessionalSelect === 'function') {
      onProfessionalSelect(professional);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header da Busca */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Encontre o Profissional Ideal
          </h1>
          <p className="text-gray-600 mb-6">
            Busque por especialidade, nome ou tipo de serviço
          </p>

          {/* Campo de Busca */}
          <div className="relative" ref={suggestionsRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Ex: Limpeza Residencial, João Silva, Organização..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                    setShowSuggestions(false);
                  }
                }}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Lista de Sugestões */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1"
                >
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center"
                    >
                      <Search className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-gray-700">{suggestion}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Botão de Busca */}
          <div className="mt-4">
            <button
              onClick={() => handleSearch()}
              disabled={isSearching}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Buscar Profissionais
                </>
              )}
            </button>
          </div>

          {/* Categorias de Serviços */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Buscar por Categoria
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {SERVICE_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSearchQuery(category.name);
                    handleSearch(category.name);
                    setShowSuggestions(false);
                  }}
                  className="p-4 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all duration-200 text-center group"
                >
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                    {category.icon}
                  </div>
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    {category.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {category.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Resultados da Busca */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {searchResults.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {searchResults.length} profissional{searchResults.length !== 1 ? 'is' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
            </h2>
          </div>
        )}

        {searchResults.length === 0 && searchQuery && !isSearching && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum profissional encontrado
            </h3>
            <p className="text-gray-600">
              Tente uma busca diferente ou verifique a ortografia
            </p>
          </div>
        )}

        {/* Lista de Profissionais */}
        <div className="grid gap-6">
          {searchResults.map((professional) => (
            <motion.div
              key={professional.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleProfessionalClick(professional)}
            >
              <div className="flex items-start space-x-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <img
                    src={professional.avatar}
                    alt={professional.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  {professional.isOnline && (
                    <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white -mt-2 ml-12"></div>
                  )}
                </div>

                {/* Informações */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {professional.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-900">
                        {professional.rating}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({professional.reviews} avaliações)
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {professional.distance}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Resposta em {professional.responseTime}
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {professional.experience} de experiência
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex flex-wrap gap-2">
                      {professional.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Taxa de conclusão:</span> {professional.completionRate}%
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Preço:</span> R$ {professional.pricing.hourly.min} - R$ {professional.pricing.hourly.max}/hora
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Estado Inicial */}
        {!searchQuery && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Comece sua busca
            </h3>
            <p className="text-gray-600 mb-6">
              Digite o tipo de serviço ou nome do profissional que você está procurando
            </p>
            
            {/* Sugestões Populares */}
            <div className="flex flex-wrap justify-center gap-2">
              {['Limpeza Residencial', 'Organização', 'Limpeza Comercial'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setSearchQuery(suggestion);
                    handleSearch(suggestion);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedSearchSystem;
