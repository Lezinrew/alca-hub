import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Home, Briefcase, User, Settings } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';
import { API_URL } from '../lib/config';

/**
 * Componente para alternar entre modo morador e prestador
 * Permite que usuários que são ambos possam trocar de modo
 */
const ModeSwitcher = ({ user, onModeChange }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleModeSwitch = async (newMode) => {
    if (newMode === user.tipo_ativo) return;
    
    setLoading(true);
    
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/switch-mode`,
        { tipo_ativo: newMode },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data) {
        // Atualizar dados do usuário no localStorage
        localStorage.setItem('user', JSON.stringify(response.data));
        
        toast({
          title: "Modo alterado com sucesso!",
          description: `Agora você está no modo ${newMode === 'morador' ? 'Morador' : 'Prestador'}`,
        });
        
        // Notificar componente pai sobre a mudança
        onModeChange(response.data);
      }
    } catch (error) {
      console.error('Erro ao alterar modo:', error);
      toast({
        variant: "destructive",
        title: "Erro ao alterar modo",
        description: error.response?.data?.detail || "Tente novamente",
      });
    } finally {
      setLoading(false);
    }
  };

  const getModeIcon = (mode) => {
    switch (mode) {
      case 'morador':
        return <Home className="h-4 w-4" />;
      case 'prestador':
        return <Briefcase className="h-4 w-4" />;
      case 'admin':
        return <Settings className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getModeLabel = (mode) => {
    switch (mode) {
      case 'morador':
        return 'Morador';
      case 'prestador':
        return 'Prestador';
      case 'admin':
        return 'Administrador';
      default:
        return mode;
    }
  };

  const getModeDescription = (mode) => {
    switch (mode) {
      case 'morador':
        return 'Buscar e contratar serviços';
      case 'prestador':
        return 'Oferecer serviços e gerenciar agenda';
      case 'admin':
        return 'Gerenciar sistema e usuários';
      default:
        return '';
    }
  };

  if (!user.tipos || user.tipos.length <= 1) {
    return null; // Não mostrar se usuário tem apenas um tipo
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Modo Atual
            </h3>
            <p className="text-sm text-gray-600">
              Escolha como você quer usar o Alça Hub
            </p>
          </div>
          <Badge 
            variant={user.tipo_ativo === 'morador' ? 'default' : 'secondary'}
            className="flex items-center gap-1"
          >
            {getModeIcon(user.tipo_ativo)}
            {getModeLabel(user.tipo_ativo)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {user.tipos.map((mode) => (
            <motion.div
              key={mode}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant={user.tipo_ativo === mode ? "default" : "outline"}
                className={`w-full h-auto p-4 flex flex-col items-start gap-2 ${
                  user.tipo_ativo === mode 
                    ? 'bg-indigo-600 text-white' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleModeSwitch(mode)}
                disabled={loading}
              >
                <div className="flex items-center gap-2">
                  {getModeIcon(mode)}
                  <span className="font-medium">
                    {getModeLabel(mode)}
                  </span>
                  {user.tipo_ativo === mode && (
                    <Badge variant="secondary" className="ml-auto">
                      Ativo
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-left opacity-80">
                  {getModeDescription(mode)}
                </p>
              </Button>
            </motion.div>
          ))}
        </div>

        {loading && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
              Alterando modo...
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ModeSwitcher;
