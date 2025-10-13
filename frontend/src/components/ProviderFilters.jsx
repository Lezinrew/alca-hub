import React from 'react';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { X, Filter } from 'lucide-react';

const ProviderFilters = ({ 
  filters, 
  setFilters, 
  onApplyFilters, 
  loading, 
  showFilters, 
  setShowFilters 
}) => {
  const especialidades = [
    { value: 'eletrica', label: '⚡ Elétrica', color: 'bg-yellow-900 text-yellow-200' },
    { value: 'encanamento', label: '🚰 Encanamento', color: 'bg-blue-900 text-blue-200' },
    { value: 'limpeza', label: '🧹 Limpeza', color: 'bg-green-900 text-green-200' },
    { value: 'manutencao', label: '🔧 Manutenção', color: 'bg-orange-900 text-orange-200' },
    { value: 'jardinagem', label: '🌱 Jardinagem', color: 'bg-emerald-900 text-emerald-200' },
    { value: 'pintura', label: '🎨 Pintura', color: 'bg-purple-900 text-purple-200' },
    { value: 'ar-condicionado', label: '❄️ Ar Condicionado', color: 'bg-cyan-900 text-cyan-200' },
    { value: 'seguranca', label: '🔒 Segurança', color: 'bg-red-900 text-red-200' },
    { value: 'informatica', label: '💻 Informática', color: 'bg-indigo-900 text-indigo-200' }
  ];

  const categorias = [
    { value: 'limpeza', label: '🧹 Limpeza' },
    { value: 'manutencao', label: '🔧 Manutenção' },
    { value: 'jardinagem', label: '🌱 Jardinagem' },
    { value: 'pintura', label: '🎨 Pintura' },
    { value: 'eletrica', label: '⚡ Elétrica' },
    { value: 'encanamento', label: '🚰 Encanamento' }
  ];

  const disponibilidades = [
    { value: 'todos', label: '🔄 Todos os status' },
    { value: 'online', label: '🟢 Online' },
    { value: 'indisponivel', label: '🔴 Indisponível' }
  ];

  const clearFilters = () => {
    setFilters({
      categoria: '',
      radius: 10,
      especialidade: '',
      disponibilidade: 'todos'
    });
  };

  const hasActiveFilters = filters.categoria || filters.especialidade || filters.disponibilidade !== 'todos';

  return (
    <>
      {/* Filter Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowFilters(!showFilters)}
        className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700 relative"
      >
        <Filter className="h-4 w-4 mr-1" />
        Filtros
        {hasActiveFilters && (
          <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
            {[filters.categoria, filters.especialidade, filters.disponibilidade !== 'todos' ? 1 : 0].filter(Boolean).length}
          </Badge>
        )}
      </Button>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="mt-4 bg-gray-800 border-gray-600">
          <CardContent className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Filtros Avançados</h3>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Limpar
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Categoria Filter */}
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Categoria de Serviço</label>
              <Select value={filters.categoria} onValueChange={(value) => setFilters({...filters, categoria: value})}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="">Todas as categorias</SelectItem>
                  {categorias.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Especialidade Filter */}
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Especialidade</label>
              <Select value={filters.especialidade} onValueChange={(value) => setFilters({...filters, especialidade: value})}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Todas as especialidades" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="">Todas as especialidades</SelectItem>
                  {especialidades.map((esp) => (
                    <SelectItem key={esp.value} value={esp.value}>
                      {esp.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Disponibilidade Filter */}
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Status de Disponibilidade</label>
              <Select value={filters.disponibilidade} onValueChange={(value) => setFilters({...filters, disponibilidade: value})}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {disponibilidades.map((disp) => (
                    <SelectItem key={disp.value} value={disp.value}>
                      {disp.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Raio de Busca */}
            <div>
              <label className="text-sm text-gray-300 mb-2 block">
                Raio de busca: {filters.radius}km
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={filters.radius}
                onChange={(e) => setFilters({...filters, radius: parseInt(e.target.value)})}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(filters.radius / 50) * 100}%, #374151 ${(filters.radius / 50) * 100}%, #374151 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1km</span>
                <span>25km</span>
                <span>50km</span>
              </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="pt-2 border-t border-gray-700">
                <p className="text-sm text-gray-300 mb-2">Filtros ativos:</p>
                <div className="flex flex-wrap gap-2">
                  {filters.categoria && (
                    <Badge variant="secondary" className="bg-blue-900 text-blue-200">
                      {categorias.find(c => c.value === filters.categoria)?.label}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => setFilters({...filters, categoria: ''})}
                      />
                    </Badge>
                  )}
                  {filters.especialidade && (
                    <Badge variant="secondary" className="bg-green-900 text-green-200">
                      {especialidades.find(e => e.value === filters.especialidade)?.label}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => setFilters({...filters, especialidade: ''})}
                      />
                    </Badge>
                  )}
                  {filters.disponibilidade !== 'todos' && (
                    <Badge variant="secondary" className="bg-purple-900 text-purple-200">
                      {disponibilidades.find(d => d.value === filters.disponibilidade)?.label}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => setFilters({...filters, disponibilidade: 'todos'})}
                      />
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Apply Button */}
            <Button 
              onClick={onApplyFilters} 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Buscando...' : 'Aplicar Filtros'}
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default ProviderFilters;
