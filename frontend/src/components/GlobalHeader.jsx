import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { ArrowLeft, Home, Menu, User, LogOut, ToggleLeft, ToggleRight } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from './ui/sheet';
import SideMenu from './SideMenu';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';
import { API_URL } from '../lib/config';

const GlobalHeader = ({ onMenuToggle, showMenuButton = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, setUser } = useAuth();
  const { toast } = useToast();
  const [switchingMode, setSwitchingMode] = useState(false);

  // Função para alternar modo de usuário
  const handleModeSwitch = async (newMode) => {
    if (!user.tipos || user.tipos.length <= 1) return;
    
    try {
      setSwitchingMode(true);
      const response = await axios.post(
        `${API_URL}/api/auth/switch-mode`,
        { tipo_ativo: newMode },
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
        setUser(response.data);
        
        toast({
          title: "Modo alterado!",
          description: `Agora você está no modo ${newMode === 'morador' ? 'Morador' : newMode === 'prestador' ? 'Prestador' : 'Administrador'}`,
        });
        
        // Recarregar a página para aplicar as mudanças
        window.location.reload();
      }
    } catch (error) {
      console.error('Erro ao alterar modo:', error);
      toast({
        variant: "destructive",
        title: "Erro ao alterar modo",
        description: error.response?.data?.detail || "Tente novamente",
      });
    } finally {
      setSwitchingMode(false);
    }
  };

  // Função para obter o título da página baseado na rota
  const getPageTitle = (pathname) => {
    const routes = {
      '/dashboard': '',
      '/busca': 'Buscar Serviços',
      '/agenda': 'Agenda Profissional',
      '/agendamento': 'Novo Agendamento',
      '/servicos': 'Serviços',
      '/mapa': 'Mapa',
      '/meus-pedidos': 'Meus Pedidos',
      '/avaliar': 'Avaliar',
      '/conta': 'Minha Conta',
      '/pagamento': 'Pagamento',
      '/seguranca': 'Segurança',
      '/login': 'Login',
      '/register': 'Cadastro',
      '/forgot-password': 'Recuperar Senha'
    };

    // Para rotas dinâmicas como /agenda/1
    if (pathname.startsWith('/agenda/')) {
      return 'Agenda Profissional';
    }

    return routes[pathname] || '';
  };

  // Função para verificar se deve mostrar o botão de voltar
  const shouldShowBackButton = () => {
    const noBackRoutes = ['/dashboard', '/login', '/register', '/forgot-password'];
    return !noBackRoutes.includes(location.pathname);
  };

  // Função para obter o breadcrumb
  const getBreadcrumb = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [];

    // Adicionar Home apenas se não estivermos na página inicial
    if (location.pathname !== '/dashboard' && location.pathname !== '/dashboard/inicio') {
      breadcrumbs.push({ label: 'Home', path: '/dashboard' });
    }

    // Adicionar segmentos do caminho
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Pular segmentos numéricos (IDs)
      if (!/^\d+$/.test(segment)) {
        const label = getPageTitle(currentPath);
        if (label !== 'Alça Hub') {
          breadcrumbs.push({
            label,
            path: currentPath,
            isLast: index === pathSegments.length - 1
          });
        }
      }
    });

    return breadcrumbs;
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const breadcrumbs = getBreadcrumb();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Lado esquerdo - Menu e Navegação */}
          <div className="flex items-center space-x-4">
            
            {/* Botão do menu (hambúrguer) */}
            {showMenuButton && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 hover:bg-gray-100"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <SheetClose asChild>
                    <div>
                      <SideMenu onNavigate={(p) => navigate(p)} onClose={() => {}} />
                    </div>
                  </SheetClose>
                </SheetContent>
              </Sheet>
            )}

            {/* Botão de voltar */}
            {shouldShowBackButton() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="p-2 hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}

            {/* Botão Home */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100"
            >
              <Home className="h-5 w-5" />
            </Button>

            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
              <nav className="hidden md:flex items-center space-x-2 text-sm">
                {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && (
                    <span className="text-gray-400 mx-2">/</span>
                  )}
                  {crumb.isLast ? (
                    <span className="text-gray-900 font-medium">
                      {crumb.label}
                    </span>
                  ) : (
                    <button
                      onClick={() => navigate(crumb.path)}
                      className="text-gray-600 hover:text-gray-900 hover:underline"
                    >
                      {crumb.label}
                    </button>
                  )}
                </div>
              ))}
              </nav>
            )}
          </div>

          {/* Centro - Logo e Título */}
          <div className="flex items-center space-x-2">
            <img src="/logo-alca-hub.png" alt="Logo Alça Hub" className="h-8" />
            <span className="text-xl font-bold text-gray-900">Alça Hub</span>
          </div>

          {/* Lado direito - Título da página e usuário */}
          <div className="flex items-center space-x-4">
            {/* Título da página (mobile) */}
            {getPageTitle(location.pathname) && (
              <div className="md:hidden">
                <h1 className="text-lg font-semibold text-gray-900">
                  {getPageTitle(location.pathname)}
                </h1>
              </div>
            )}

            {/* Título da página (desktop) */}
            {getPageTitle(location.pathname) && (
              <div className="hidden md:block">
                <h1 className="text-xl font-semibold text-gray-900">
                  {getPageTitle(location.pathname)}
                </h1>
              </div>
            )}

            {/* Informações do usuário */}
            {user && (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  {user.tipos && user.tipos.length > 1 ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-gray-500 capitalize hover:text-gray-700 hover:bg-gray-100 p-1 h-auto cursor-pointer"
                      onClick={() => {
                        // Encontrar o próximo tipo na lista
                        const currentIndex = user.tipos.indexOf(user.tipo_ativo || user.tipo);
                        const nextIndex = (currentIndex + 1) % user.tipos.length;
                        const nextType = user.tipos[nextIndex];
                        
                        // Chamar a função de troca de modo
                        handleModeSwitch(nextType);
                      }}
                      disabled={switchingMode}
                      title={`Clique para alternar para ${user.tipos.find(t => t !== (user.tipo_ativo || user.tipo)) || 'outro perfil'}`}
                    >
                      {switchingMode ? (
                        <div className="flex items-center gap-1">
                          <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-500"></div>
                          <span>Alterando...</span>
                        </div>
                      ) : (
                        `${user.tipo_ativo || user.tipo} (clique)`
                      )}
                    </Button>
                  ) : (
                    <p className="text-xs text-gray-500 capitalize">
                      {user.tipo_ativo || user.tipo}
                    </p>
                  )}
                </div>

                {/* Botão de alternância de modo */}
                {user.tipos && user.tipos.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleModeSwitch}
                    disabled={switchingMode}
                    className="p-2 hover:bg-gray-100 text-blue-600 hover:text-blue-700"
                    title={`Alternar para modo ${user.tipo_ativo === 'morador' ? 'Prestador' : 'Morador'}`}
                  >
                    {switchingMode ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    ) : user.tipo_ativo === 'morador' ? (
                      <ToggleRight className="h-4 w-4" />
                    ) : (
                      <ToggleLeft className="h-4 w-4" />
                    )}
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/conta')}
                  className="p-2 hover:bg-gray-100"
                >
                  {user.foto_url ? (
                    <img 
                      src={user.foto_url} 
                      alt="Foto do perfil" 
                      className="h-5 w-5 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleLogout}
                  className="px-3"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Breadcrumbs mobile */}
        <div className="md:hidden pb-2">
          <nav className="flex items-center space-x-2 text-sm overflow-x-auto">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center flex-shrink-0">
                {index > 0 && (
                  <span className="text-gray-400 mx-1">/</span>
                )}
                {crumb.isLast ? (
                  <span className="text-gray-900 font-medium">
                    {crumb.label}
                  </span>
                ) : (
                  <button
                    onClick={() => navigate(crumb.path)}
                    className="text-gray-600 hover:text-gray-900 hover:underline whitespace-nowrap"
                  >
                    {crumb.label}
                  </button>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default GlobalHeader;
