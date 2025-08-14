import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { MapPin, Clock, Star, MessageCircle, Filter, Navigation, Users, Zap } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../hooks/use-toast';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different service types
const createServiceIcon = (categoria, isSelected = false) => {
  const iconMap = {
    limpeza: '🧹',
    manutencao: '🔧',
    jardinagem: '🌱',
    pintura: '🎨',
    eletrica: '⚡',
    encanamento: '🚰',
    outros: '🛠️'
  };

  const emoji = iconMap[categoria] || '🛠️';
  const size = isSelected ? 40 : 30;
  const bgColor = isSelected ? '#3b82f6' : '#10b981';

  return L.divIcon({
    html: `
      <div style="
        background: ${bgColor};
        border: 3px solid white;
        border-radius: 50%;
        width: ${size}px;
        height: ${size}px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${size * 0.6}px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transform: translate(-50%, -50%);
      ">
        ${emoji}
      </div>
    `,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size/2, size/2]
  });
};

// User location icon
const userIcon = L.divIcon({
  html: `
    <div style="
      background: #3b82f6;
      border: 4px solid white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      position: relative;
    ">
      <div style="
        position: absolute;
        top: -5px;
        left: -5px;
        width: 30px;
        height: 30px;
        border: 2px solid #3b82f6;
        border-radius: 50%;
        opacity: 0.3;
        animation: pulse 2s infinite;
      "></div>
    </div>
    <style>
      @keyframes pulse {
        0% { transform: scale(1); opacity: 0.3; }
        50% { transform: scale(1.2); opacity: 0.1; }
        100% { transform: scale(1); opacity: 0.3; }
      }
    </style>
  `,
  className: '',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const UberStyleMap = ({ user }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    categoria: '',
    radius: 10
  });
  const [showFilters, setShowFilters] = useState(false);
  const mapRef = useRef();
  const { toast } = useToast();

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const API = `${BACKEND_URL}/api`;

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          updateUserLocation(location.lat, location.lng);
          loadNearbyProviders(location.lat, location.lng);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to São Paulo center if location access denied
          const defaultLocation = { lat: -23.5505, lng: -46.6333 };
          setUserLocation(defaultLocation);
          loadNearbyProviders(defaultLocation.lat, defaultLocation.lng);
          toast({
            variant: "destructive",
            title: "Localização não disponível",
            description: "Usando localização padrão. Permita acesso à localização para melhor experiência.",
          });
        }
      );
    }
  }, []);

  const updateUserLocation = async (lat, lng) => {
    try {
      await axios.put(`${API}/users/location?latitude=${lat}&longitude=${lng}`);
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const loadNearbyProviders = async (lat, lng) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        latitude: lat,
        longitude: lng,
        radius_km: filters.radius
      });
      
      if (filters.categoria) {
        params.append('categoria', filters.categoria);
      }

      const response = await axios.get(`${API}/map/providers-nearby?${params}`);
      setProviders(response.data.providers);
    } catch (error) {
      console.error('Error loading providers:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar prestadores",
        description: "Não foi possível carregar os prestadores próximos.",
      });
    }
    setLoading(false);
  };

  const handleFilterChange = () => {
    if (userLocation) {
      loadNearbyProviders(userLocation.lat, userLocation.lng);
    }
  };

  const handleNegotiate = async (provider, service) => {
    try {
      const response = await axios.post(`${API}/chat/conversations`, {
        provider_id: provider.provider_id,
        service_id: service.id,
        initial_message: `Olá! Tenho interesse no seu serviço de ${service.nome}. Podemos negociar o valor?`
      });

      toast({
        title: "Conversa iniciada! 💬",
        description: `Você pode negociar diretamente com ${provider.nome}`,
      });

      // Here you would navigate to chat screen
      console.log('Conversation created:', response.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao iniciar conversa",
        description: error.response?.data?.detail || "Tente novamente",
      });
    }
  };

  const getCategoryIcon = (categoria) => {
    const icons = {
      limpeza: '🧹',
      manutencao: '🔧',
      jardinagem: '🌱',
      pintura: '🎨',
      eletrica: '⚡',
      encanamento: '🚰',
      outros: '🛠️'
    };
    return icons[categoria] || '🛠️';
  };

  if (!userLocation) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <Navigation className="h-12 w-12 mx-auto mb-4 animate-spin" />
          <p className="text-lg">Obtendo sua localização...</p>
          <p className="text-sm text-gray-400 mt-2">Permita acesso à localização para continuar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-gray-900 overflow-hidden">
      {/* Map Container */}
      <div className="absolute inset-0">
        <MapContainer
          center={[userLocation.lat, userLocation.lng]}
          zoom={14}
          className="h-full w-full"
          ref={mapRef}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          
          {/* User location marker */}
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold">📍 Você está aqui</p>
                <p className="text-sm text-gray-600">{user.nome}</p>
              </div>
            </Popup>
          </Marker>

          {/* Provider markers */}
          {providers.map((provider) => (
            provider.services.map((service) => (
              <Marker
                key={`${provider.provider_id}-${service.id}`}
                position={[provider.latitude, provider.longitude]}
                icon={createServiceIcon(service.categoria, selectedProvider?.provider_id === provider.provider_id)}
                eventHandlers={{
                  click: () => setSelectedProvider({...provider, selectedService: service})
                }}
              >
                <Popup>
                  <div className="min-w-64">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{getCategoryIcon(service.categoria)}</span>
                      <div>
                        <h3 className="font-semibold">{provider.nome}</h3>
                        <p className="text-sm text-gray-600">{service.nome}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">💰 Preço:</span>
                        <span className="font-semibold">R$ {service.preco_por_hora.toFixed(2)}/h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">⏱️ Tempo:</span>
                        <span className="text-green-600">{provider.estimated_time_min} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">⭐ Avaliação:</span>
                        <span>{service.media_avaliacoes > 0 ? `${service.media_avaliacoes} (${service.total_avaliacoes})` : 'Sem avaliações'}</span>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => handleNegotiate(provider, service)}
                      className="w-full mt-3 bg-blue-600 hover:bg-blue-700"
                      size="sm"
                    >
                      💬 Negociar
                    </Button>
                  </div>
                </Popup>
              </Marker>
            ))
          ))}
        </MapContainer>
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-gray-900 to-transparent p-4">
        <div className="flex items-center justify-between text-white">
          <div>
            <h1 className="text-xl font-bold">🗺️ Encontrar Serviços</h1>
            <p className="text-sm text-gray-300">{providers.length} prestadores próximos</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
          >
            <Filter className="h-4 w-4 mr-1" />
            Filtros
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card className="mt-4 bg-gray-800 border-gray-600">
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Categoria</label>
                <Select value={filters.categoria} onValueChange={(value) => setFilters({...filters, categoria: value})}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="">Todas as categorias</SelectItem>
                    <SelectItem value="limpeza">🧹 Limpeza</SelectItem>
                    <SelectItem value="manutencao">🔧 Manutenção</SelectItem>
                    <SelectItem value="jardinagem">🌱 Jardinagem</SelectItem>
                    <SelectItem value="pintura">🎨 Pintura</SelectItem>
                    <SelectItem value="eletrica">⚡ Elétrica</SelectItem>
                    <SelectItem value="encanamento">🚰 Encanamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Raio de busca: {filters.radius}km</label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={filters.radius}
                  onChange={(e) => setFilters({...filters, radius: parseInt(e.target.value)})}
                  className="w-full"
                />
              </div>
              
              <Button onClick={handleFilterChange} className="w-full" disabled={loading}>
                {loading ? 'Buscando...' : 'Aplicar Filtros'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bottom Sheet - Provider List */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gray-900 border-t border-gray-700 max-h-80 overflow-hidden">
        <div className="p-4">
          <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-4"></div>
          
          {loading ? (
            <div className="text-center py-8">
              <Users className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-pulse" />
              <p className="text-gray-300">Buscando prestadores...</p>
            </div>
          ) : providers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-300">Nenhum prestador encontrado</p>
              <p className="text-sm text-gray-500">Tente aumentar o raio de busca</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {providers.map((provider) => (
                provider.services.map((service) => (
                  <Card 
                    key={`${provider.provider_id}-${service.id}`}
                    className="bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors"
                    onClick={() => setSelectedProvider({...provider, selectedService: service})}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{getCategoryIcon(service.categoria)}</div>
                          <div>
                            <h3 className="font-semibold text-white">{provider.nome}</h3>
                            <p className="text-sm text-gray-300">{service.nome}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-green-400 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {provider.estimated_time_min} min
                              </span>
                              <span className="text-sm text-yellow-400 flex items-center">
                                <Star className="h-3 w-3 mr-1" />
                                {service.media_avaliacoes > 0 ? service.media_avaliacoes : 'Novo'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-bold text-white">R$ {service.preco_por_hora.toFixed(2)}</p>
                          <p className="text-xs text-gray-400">por hora</p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {provider.distance_km.toFixed(1)}km
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 mt-3">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNegotiate(provider, service);
                          }}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm"
                          size="sm"
                        >
                          <MessageCircle className="h-3 w-3 mr-1" />
                          Negociar
                        </Button>
                        <Button
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700 text-sm"
                          size="sm"
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          Agendar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UberStyleMap;