import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { MapPin, Users, Star, Clock, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import UberStyleMap from "../components/UberStyleMap";

// Cores por categoria (mesmo do SimpleMap)
const getCategoryColor = (category) => {
  const colors = {
    'Limpeza Residencial': '#3b82f6', // Azul
    'Limpeza Comercial': '#10b981',   // Verde
    'Limpeza Industrial': '#f59e0b',  // Amarelo
    'Organização': '#8b5cf6',        // Roxo
    'Limpeza Pós-Obra': '#ef4444',   // Vermelho
    'Manutenção': '#06b6d4'          // Ciano
  };
  return colors[category] || '#6b7280'; // Cinza padrão
};

// Ícones por categoria
const getCategoryIcon = (category) => {
  const icons = {
    'Limpeza Residencial': '🏠',
    'Limpeza Comercial': '🏢',
    'Limpeza Industrial': '🏭',
    'Organização': '📦',
    'Limpeza Pós-Obra': '🔨',
    'Manutenção': '🔧'
  };
  return icons[category] || '🛠️';
};

export default function Mapa() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [coords, setCoords] = useState(null);
  const navigate = useNavigate();

  const fetchProviders = async (latitude, longitude) => {
    try {
      setLoading(true);
      setError(false);
      
      // Mock providers data com categorias
      const mockProviders = [
        {
          provider_id: "1",
          nome: "João Silva",
          category: "Limpeza Residencial",
          distance_km: 2.5,
          estimated_time_min: 15,
          rating: 4.8,
          services: [
            { id: "1", nome: "Limpeza Residencial", preco_por_hora: 100 },
            { id: "2", nome: "Organização", preco_por_hora: 120 }
          ]
        },
        {
          provider_id: "2", 
          nome: "Maria Santos",
          category: "Limpeza Pós-Obra",
          distance_km: 1.8,
          estimated_time_min: 10,
          rating: 4.9,
          services: [
            { id: "3", nome: "Limpeza Pós-Obra", preco_por_hora: 150 },
            { id: "4", nome: "Limpeza Comercial", preco_por_hora: 130 }
          ]
        },
        {
          provider_id: "3",
          nome: "Carlos Oliveira",
          category: "Limpeza Industrial", 
          distance_km: 3.1,
          estimated_time_min: 20,
          rating: 4.7,
          services: [
            { id: "5", nome: "Limpeza Industrial", preco_por_hora: 200 },
            { id: "6", nome: "Manutenção", preco_por_hora: 180 }
          ]
        }
      ];
      
      setProviders(mockProviders);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const requestGeolocation = () => {
    setError(false);
    if (!navigator.geolocation) {
      setError(true);
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ latitude, longitude });
        fetchProviders(latitude, longitude);
      },
      () => {
        setError(true);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    requestGeolocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <p>🔄 Carregando mapa...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-3">
        <p>❌ Erro ao carregar mapa.</p>
        <Button onClick={requestGeolocation} className="cursor-pointer">Tentar novamente</Button>
      </div>
    );
  }

  if (!providers || providers.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 text-gray-700">
          <MapPin className="h-5 w-5 text-indigo-600" />
          <p>📍 Nenhum prestador encontrado próximo a você.</p>
        </div>
        <div className="mt-3">
          <Button variant="outline" onClick={requestGeolocation} className="cursor-pointer hover:bg-gray-100">Recarregar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mapa dos Prestadores</h1>
            {coords && (
              <p className="text-sm text-gray-500 mt-1">
                Sua localização: {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}
              </p>
            )}
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2"
          >
            <Home className="h-4 w-4" />
            <span>Voltar ao Dashboard</span>
          </Button>
        </div>
      </div>
      
      <div className="flex-1 flex">
        {/* Map */}
        <div className="flex-1">
          <UberStyleMap user={{ nome: "Usuário" }} />
        </div>
        
        {/* Providers List */}
        <div className="w-80 bg-white shadow-lg overflow-y-auto">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Prestadores Próximos</h2>
            <p className="text-sm text-gray-500">{providers.length} prestadores encontrados</p>
          </div>
          
          <div className="p-4 space-y-4">
            {providers.map((p) => (
              <Card 
                key={p.provider_id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/agenda/${p.provider_id}`)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: getCategoryColor(p.category) }}
                    >
                      {getCategoryIcon(p.category)}
                    </div>
                    <div>
                      <div className="font-semibold">{p.nome || "Prestador"}</div>
                      <div className="text-sm text-gray-600">{p.category}</div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-700 space-y-2">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{p.distance_km} km</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>~{p.estimated_time_min} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
                        <span>{p.rating}</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="font-medium mb-1">Serviços:</p>
                      <ul className="list-disc list-inside text-gray-700">
                        {(p.services || []).map((s) => (
                          <li key={s.id}>{s.nome} — R$ {Number(s.preco_por_hora).toFixed(2)}/h</li>
                        ))}
                      </ul>
                    </div>
                    <Button 
                      className="w-full mt-3"
                      style={{ backgroundColor: getCategoryColor(p.category) }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/agenda/${p.provider_id}`);
                      }}
                    >
                      Ver Agenda
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


