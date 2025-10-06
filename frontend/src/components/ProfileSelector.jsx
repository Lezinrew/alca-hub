import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Briefcase, Settings, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useToast } from '../hooks/use-toast';
import { API_URL } from '../lib/config';
import axios from 'axios';

const ProfileSelector = ({ user, onProfileSelected }) => {
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleProfileSelect = async (profileType) => {
    setLoading(true);
    
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/switch-mode`,
        { tipo_ativo: profileType },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        // Atualizar dados do usuário no localStorage
        localStorage.setItem('user', JSON.stringify(response.data));
        
        toast({
          title: "Perfil selecionado! 🎉",
          description: `Bem-vindo ao modo ${getProfileName(profileType)}!`,
        });
        
        // Chamar callback para navegar
        onProfileSelected(response.data);
      }
    } catch (error) {
      console.error('Erro ao selecionar perfil:', error);
      toast({
        variant: "destructive",
        title: "Erro ao selecionar perfil",
        description: "Não foi possível selecionar o perfil. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getProfileIcon = (type) => {
    switch (type) {
      case 'morador':
        return <Home className="h-8 w-8 text-blue-600" />;
      case 'prestador':
        return <Briefcase className="h-8 w-8 text-green-600" />;
      case 'admin':
        return <Settings className="h-8 w-8 text-purple-600" />;
      default:
        return <Home className="h-8 w-8 text-gray-600" />;
    }
  };

  const getProfileName = (type) => {
    switch (type) {
      case 'morador':
        return 'Morador';
      case 'prestador':
        return 'Prestador';
      case 'admin':
        return 'Administrador';
      default:
        return 'Usuário';
    }
  };

  const getProfileDescription = (type) => {
    switch (type) {
      case 'morador':
        return 'Buscar e contratar serviços para sua casa';
      case 'prestador':
        return 'Oferecer serviços e gerenciar sua agenda';
      case 'admin':
        return 'Gerenciar sistema e usuários';
      default:
        return 'Acessar funcionalidades básicas';
    }
  };

  const getProfileColor = (type) => {
    switch (type) {
      case 'morador':
        return 'border-blue-200 bg-blue-50 hover:bg-blue-100';
      case 'prestador':
        return 'border-green-200 bg-green-50 hover:bg-green-100';
      case 'admin':
        return 'border-purple-200 bg-purple-50 hover:bg-purple-100';
      default:
        return 'border-gray-200 bg-gray-50 hover:bg-gray-100';
    }
  };

  const getProfileBadgeColor = (type) => {
    switch (type) {
      case 'morador':
        return 'bg-blue-100 text-blue-800';
      case 'prestador':
        return 'bg-green-100 text-green-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProfileEmoji = (type) => {
    switch (type) {
      case 'morador':
        return '🏠';
      case 'prestador':
        return '🔧';
      case 'admin':
        return '👑';
      default:
        return '👤';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full mb-4"
          >
            <CheckCircle className="h-8 w-8 text-white" />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bem-vindo, {user.nome ? user.nome.split(' ')[0] : 'Usuário'}! 👋
          </h1>
          <p className="text-lg text-gray-600">
            Escolha como você quer usar o Alça Hub hoje
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {user.tipos.map((profileType, index) => (
            <motion.div
              key={profileType}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
            >
              <Card 
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${getProfileColor(profileType)} ${
                  selectedProfile === profileType ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedProfile(profileType)}
              >
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    {getProfileIcon(profileType)}
                  </div>
                  
                  <CardTitle className="flex items-center justify-center gap-2">
                    <span className="text-2xl">{getProfileEmoji(profileType)}</span>
                    <span>{getProfileName(profileType)}</span>
                  </CardTitle>
                  
                  <Badge className={`w-fit mx-auto ${getProfileBadgeColor(profileType)}`}>
                    {profileType === 'morador' ? 'Buscar Serviços' : 
                     profileType === 'prestador' ? 'Oferecer Serviços' : 
                     'Gerenciar Sistema'}
                  </Badge>
                </CardHeader>
                
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-6">
                    {getProfileDescription(profileType)}
                  </p>
                  
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProfileSelect(profileType);
                    }}
                    disabled={loading}
                    className={`w-full ${
                      profileType === 'morador' ? 'bg-blue-600 hover:bg-blue-700' :
                      profileType === 'prestador' ? 'bg-green-600 hover:bg-green-700' :
                      'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    {loading && selectedProfile === profileType ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Selecionando...
                      </>
                    ) : (
                      <>
                        Continuar
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-gray-500">
            Você pode alterar seu perfil a qualquer momento nas configurações
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ProfileSelector;
