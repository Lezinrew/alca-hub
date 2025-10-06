import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Target, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useToast } from '../hooks/use-toast';
import { API_URL } from '../lib/config';
import axios from 'axios';

const UserLocationManager = ({ user, onLocationUpdate }) => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('unknown');
  const { toast } = useToast();

  useEffect(() => {
    checkLocationPermission();
    if (user.latitude && user.longitude) {
      setLocation({
        lat: user.latitude,
        lng: user.longitude
      });
    }
  }, [user]);

  const checkLocationPermission = async () => {
    if (!navigator.geolocation) {
      setPermissionStatus('not-supported');
      return;
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      setPermissionStatus(permission.state);
    } catch (error) {
      setPermissionStatus('unknown');
    }
  };

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "Geolocalização não suportada",
        description: "Seu navegador não suporta geolocalização.",
      });
      return;
    }

    setLoading(true);
    
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });

      const newLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy
      };

      setLocation(newLocation);
      
      // Update location on server
      await updateLocationOnServer(newLocation.lat, newLocation.lng);
      
      toast({
        title: "Localização atualizada! 📍",
        description: "Sua localização foi atualizada com sucesso.",
      });

    } catch (error) {
      console.error('Erro ao obter localização:', error);
      
      let errorMessage = "Erro ao obter localização.";
      if (error.code === 1) {
        errorMessage = "Permissão de localização negada. Ative nas configurações do navegador.";
      } else if (error.code === 2) {
        errorMessage = "Localização indisponível. Verifique sua conexão.";
      } else if (error.code === 3) {
        errorMessage = "Timeout ao obter localização. Tente novamente.";
      }

      toast({
        variant: "destructive",
        title: "Erro de localização",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateLocationOnServer = async (lat, lng) => {
    try {
      setUpdating(true);
      
      const response = await axios.put(
        `${API_URL}/api/profile/location`,
        {
          latitude: lat,
          longitude: lng
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (onLocationUpdate) {
        onLocationUpdate({ latitude: lat, longitude: lng });
      }

      console.log('Localização atualizada no servidor:', response.data);
    } catch (error) {
      console.error('Erro ao atualizar localização no servidor:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar localização",
        description: "Não foi possível salvar sua localização no servidor.",
      });
    } finally {
      setUpdating(false);
    }
  };

  const formatCoordinates = (lat, lng) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  const getAccuracyText = (accuracy) => {
    if (accuracy < 10) return "Muito precisa";
    if (accuracy < 50) return "Precisa";
    if (accuracy < 100) return "Moderada";
    return "Imprecisa";
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy < 10) return "text-green-600 bg-green-100";
    if (accuracy < 50) return "text-blue-600 bg-blue-100";
    if (accuracy < 100) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getPermissionStatusInfo = () => {
    switch (permissionStatus) {
      case 'granted':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-600" />,
          text: 'Permitido',
          color: 'text-green-600 bg-green-100'
        };
      case 'denied':
        return {
          icon: <AlertCircle className="h-5 w-5 text-red-600" />,
          text: 'Negado',
          color: 'text-red-600 bg-red-100'
        };
      case 'prompt':
        return {
          icon: <AlertCircle className="h-5 w-5 text-yellow-600" />,
          text: 'Solicitar',
          color: 'text-yellow-600 bg-yellow-100'
        };
      default:
        return {
          icon: <AlertCircle className="h-5 w-5 text-gray-600" />,
          text: 'Desconhecido',
          color: 'text-gray-600 bg-gray-100'
        };
    }
  };

  const permissionInfo = getPermissionStatusInfo();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Localização</h2>
        <Button 
          onClick={getCurrentLocation} 
          disabled={loading || updating}
          className="flex items-center space-x-2"
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
          {loading ? 'Obtendo...' : 'Atualizar Localização'}
        </Button>
      </div>

      {/* Status da permissão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Status da Permissão</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3">
            {permissionInfo.icon}
            <Badge className={permissionInfo.color}>
              {permissionInfo.text}
            </Badge>
            <span className="text-sm text-gray-600">
              {permissionStatus === 'denied' && 'Ative a localização nas configurações do navegador'}
              {permissionStatus === 'prompt' && 'Clique em "Atualizar Localização" para permitir'}
              {permissionStatus === 'granted' && 'Localização permitida'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Localização atual */}
      {location ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Localização Atual</span>
                {updating && (
                  <Badge variant="outline" className="ml-auto">
                    <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                    Salvando...
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Coordenadas</label>
                  <p className="text-lg font-mono">
                    {formatCoordinates(location.lat, location.lng)}
                  </p>
                </div>
                
                {location.accuracy && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Precisão</label>
                    <div className="flex items-center space-x-2">
                      <p className="text-lg">{Math.round(location.accuracy)}m</p>
                      <Badge className={getAccuracyColor(location.accuracy)}>
                        {getAccuracyText(location.accuracy)}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Como usar sua localização:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Encontrar prestadores próximos a você</li>
                  <li>• Receber ofertas de serviços na sua região</li>
                  <li>• Facilitar o agendamento de serviços</li>
                  <li>• Melhorar a experiência de busca</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <MapPin className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma localização definida
            </h3>
            <p className="text-gray-500 mb-4">
              Clique em "Atualizar Localização" para definir sua posição atual.
            </p>
            <Button onClick={getCurrentLocation} disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Obtendo localização...
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4 mr-2" />
                  Definir Localização
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Informações sobre privacidade */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Privacidade e Segurança</h4>
              <p className="text-sm text-blue-700">
                Sua localização é usada apenas para encontrar prestadores próximos e melhorar sua experiência. 
                Não compartilhamos sua localização com terceiros e você pode desativar a qualquer momento.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserLocationManager;
