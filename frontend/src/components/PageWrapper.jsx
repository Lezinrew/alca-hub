import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { ArrowLeft, Home } from 'lucide-react';

const PageWrapper = ({ children, showHeader = true, showBackButton = true, showHomeButton = true, title = null }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  const getPageTitle = () => {
    if (title) return title;
    
    const routes = {
      '/busca': 'Buscar Serviços',
      '/agenda': 'Agenda Profissional',
      '/agendamento': 'Novo Agendamento',
      '/servicos': 'Serviços',
      '/mapa': 'Mapa',
      '/meus-pedidos': 'Meus Pedidos',
      '/avaliar': 'Avaliar',
      '/conta': 'Minha Conta',
      '/pagamento': 'Pagamento',
      '/seguranca': 'Segurança'
    };

    // Para rotas dinâmicas como /agenda/1
    if (location.pathname.startsWith('/agenda/')) {
      return 'Agenda Profissional';
    }

    return routes[location.pathname] || '';
  };

  if (!showHeader) {
    return children;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header da Página */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Lado esquerdo - Navegação */}
            <div className="flex items-center space-x-4">
              {/* Botão de voltar */}
              {showBackButton && (
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
              {showHomeButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                  className="p-2 hover:bg-gray-100"
                >
                  <Home className="h-5 w-5" />
                </Button>
              )}

              {/* Título da página */}
              {getPageTitle() && (
                <h1 className="text-xl font-semibold text-gray-900">
                  {getPageTitle()}
                </h1>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo da página */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  );
};

export default PageWrapper;
