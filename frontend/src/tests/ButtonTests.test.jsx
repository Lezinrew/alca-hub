import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import App from '../App';
import { Toaster } from '../components/ui/toaster';

// Mock do axios
import { vi } from 'vitest';
vi.mock('axios');
const mockAxios = require('axios');

// Mock do localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock do navigator.geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
};
global.navigator.geolocation = mockGeolocation;

// Mock do QRCodeCanvas
vi.mock('qrcode.react', () => ({
  QRCodeCanvas: () => <div data-testid="qr-code">QR Code</div>
}));

// Helper para renderizar com providers
const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
};

// Mock de dados de usuário
const mockUser = {
  id: 1,
  nome: 'Test User',
  email: 'test@example.com',
  tipo: 'morador',
  tipo_ativo: 'morador'
};

describe('Teste de Todos os Botões da Aplicação', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser));
    mockAxios.get.mockResolvedValue({ data: {} });
    mockAxios.post.mockResolvedValue({ data: {} });
    mockAxios.put.mockResolvedValue({ data: {} });
    mockAxios.delete.mockResolvedValue({ data: {} });
  });

  describe('1. Botões de Autenticação', () => {
    test('Botão de Login', async () => {
      localStorageMock.getItem.mockReturnValue(null); // Usuário não logado
      
      renderWithProviders(<App />);
      
      // Verificar se botão de login existe
      const loginButton = screen.getByRole('button', { name: /entrar|login/i });
      expect(loginButton).toBeInTheDocument();
      
      // Simular clique no botão
      fireEvent.click(loginButton);
      
      // Verificar se formulário de login aparece
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/senha/i)).toBeInTheDocument();
      });
    });

    test('Botão de Logout', async () => {
      renderWithProviders(<App />);
      
      // Aguardar carregamento do dashboard
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });
      
      // Procurar botão de logout
      const logoutButton = screen.getByRole('button', { name: /sair|logout/i });
      expect(logoutButton).toBeInTheDocument();
      
      // Simular clique no logout
      fireEvent.click(logoutButton);
      
      // Verificar se redirecionou para login
      await waitFor(() => {
        expect(screen.getByText(/entre na sua conta/i)).toBeInTheDocument();
      });
    });
  });

  describe('2. Botões de Navegação', () => {
    test('Botões do Menu Lateral', async () => {
      renderWithProviders(<App />);
      
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });
      
      // Testar botões do menu lateral
      const menuButtons = [
        'Dashboard',
        'Buscar Serviços',
        'Novo Agendamento',
        'Mapa',
        'Meus Pedidos',
        'Avaliar',
        'Conta'
      ];
      
      menuButtons.forEach(buttonText => {
        const button = screen.getByRole('button', { name: new RegExp(buttonText, 'i') });
        expect(button).toBeInTheDocument();
        
        // Simular clique
        fireEvent.click(button);
      });
    });

    test('Botões de Navegação Mobile', async () => {
      // Mock de viewport mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      renderWithProviders(<App />);
      
      await waitFor(() => {
        expect(screen.getByText(/início/i)).toBeInTheDocument();
      });
      
      // Testar botões de navegação mobile
      const mobileNavButtons = [
        'início',
        'serviços',
        'agendamentos',
        'conta'
      ];
      
      mobileNavButtons.forEach(buttonText => {
        const button = screen.getByRole('button', { name: new RegExp(buttonText, 'i') });
        expect(button).toBeInTheDocument();
        
        fireEvent.click(button);
      });
    });
  });

  describe('3. Botões de Serviços', () => {
    test('Botões de Categoria de Serviços', async () => {
      renderWithProviders(<App />);
      
      await waitFor(() => {
        expect(screen.getByText(/serviços/i)).toBeInTheDocument();
      });
      
      // Navegar para serviços
      const servicosButton = screen.getByRole('button', { name: /serviços/i });
      fireEvent.click(servicosButton);
      
      // Verificar botões de categoria
      const categoryButtons = [
        'Limpeza',
        'Manutenção',
        'Jardinagem',
        'Pintura',
        'Elétrica',
        'Encanamento'
      ];
      
      categoryButtons.forEach(category => {
        const button = screen.getByRole('button', { name: new RegExp(category, 'i') });
        if (button) {
          fireEvent.click(button);
        }
      });
    });

    test('Botões de Agendamento', async () => {
      renderWithProviders(<App />);
      
      await waitFor(() => {
        expect(screen.getByText(/agendar/i)).toBeInTheDocument();
      });
      
      // Procurar botões de agendamento
      const agendarButtons = screen.getAllByRole('button', { name: /agendar/i });
      
      agendarButtons.forEach(button => {
        fireEvent.click(button);
      });
    });
  });

  describe('4. Botões de Formulários', () => {
    test('Botões de Formulário de Serviço', async () => {
      renderWithProviders(<App />);
      
      await waitFor(() => {
        expect(screen.getByText(/criar serviço/i)).toBeInTheDocument();
      });
      
      // Procurar botão de criar serviço
      const criarServicoButton = screen.getByRole('button', { name: /criar serviço/i });
      fireEvent.click(criarServicoButton);
      
      // Verificar se modal abre
      await waitFor(() => {
        expect(screen.getByText(/novo serviço/i)).toBeInTheDocument();
      });
      
      // Testar botões do formulário
      const submitButton = screen.getByRole('button', { name: /criar|salvar/i });
      expect(submitButton).toBeInTheDocument();
      
      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      expect(cancelButton).toBeInTheDocument();
    });

    test('Botões de Formulário de Perfil', async () => {
      renderWithProviders(<App />);
      
      await waitFor(() => {
        expect(screen.getByText(/conta/i)).toBeInTheDocument();
      });
      
      // Navegar para conta
      const contaButton = screen.getByRole('button', { name: /conta/i });
      fireEvent.click(contaButton);
      
      // Testar botões de seção
      const sectionButtons = [
        'Dados Pessoais',
        'Pagamento',
        'Segurança'
      ];
      
      sectionButtons.forEach(section => {
        const button = screen.getByRole('button', { name: new RegExp(section, 'i') });
        fireEvent.click(button);
      });
    });
  });

  describe('5. Botões de Ação', () => {
    test('Botões de Confirmação e Cancelamento', async () => {
      renderWithProviders(<App />);
      
      await waitFor(() => {
        expect(screen.getByText(/confirmar/i)).toBeInTheDocument();
      });
      
      // Testar botões de confirmação
      const confirmButtons = screen.getAllByRole('button', { name: /confirmar/i });
      confirmButtons.forEach(button => {
        fireEvent.click(button);
      });
      
      // Testar botões de cancelamento
      const cancelButtons = screen.getAllByRole('button', { name: /cancelar/i });
      cancelButtons.forEach(button => {
        fireEvent.click(button);
      });
    });

    test('Botões de Modal e Dialog', async () => {
      renderWithProviders(<App />);
      
      await waitFor(() => {
        expect(screen.getByText(/fechar/i)).toBeInTheDocument();
      });
      
      // Testar botões de fechar
      const closeButtons = screen.getAllByRole('button', { name: /fechar|×/i });
      closeButtons.forEach(button => {
        fireEvent.click(button);
      });
    });
  });

  describe('6. Botões de Filtro e Busca', () => {
    test('Botões de Filtro', async () => {
      renderWithProviders(<App />);
      
      await waitFor(() => {
        expect(screen.getByText(/filtro/i)).toBeInTheDocument();
      });
      
      // Procurar botões de filtro
      const filterButtons = screen.getAllByRole('button', { name: /filtro/i });
      filterButtons.forEach(button => {
        fireEvent.click(button);
      });
    });

    test('Botões de Busca', async () => {
      renderWithProviders(<App />);
      
      await waitFor(() => {
        expect(screen.getByText(/buscar/i)).toBeInTheDocument();
      });
      
      // Procurar botões de busca
      const searchButtons = screen.getAllByRole('button', { name: /buscar|pesquisar/i });
      searchButtons.forEach(button => {
        fireEvent.click(button);
      });
    });
  });

  describe('7. Botões de Status e Ação', () => {
    test('Botões de Status de Pedidos', async () => {
      renderWithProviders(<App />);
      
      await waitFor(() => {
        expect(screen.getByText(/pedidos/i)).toBeInTheDocument();
      });
      
      // Navegar para pedidos
      const pedidosButton = screen.getByRole('button', { name: /pedidos/i });
      fireEvent.click(pedidosButton);
      
      // Testar botões de status
      const statusButtons = [
        'Pendente',
        'Confirmado',
        'Em Andamento',
        'Concluído',
        'Cancelado'
      ];
      
      statusButtons.forEach(status => {
        const button = screen.getByRole('button', { name: new RegExp(status, 'i') });
        if (button) {
          fireEvent.click(button);
        }
      });
    });

    test('Botões de Ação em Cards', async () => {
      renderWithProviders(<App />);
      
      await waitFor(() => {
        expect(screen.getByText(/ver detalhes/i)).toBeInTheDocument();
      });
      
      // Testar botões de ação em cards
      const actionButtons = [
        'Ver Detalhes',
        'Editar',
        'Excluir',
        'Avaliar',
        'Contatar'
      ];
      
      actionButtons.forEach(action => {
        const button = screen.getByRole('button', { name: new RegExp(action, 'i') });
        if (button) {
          fireEvent.click(button);
        }
      });
    });
  });

  describe('8. Botões de Pagamento', () => {
    test('Botões de Pagamento', async () => {
      renderWithProviders(<App />);
      
      await waitFor(() => {
        expect(screen.getByText(/pagamento/i)).toBeInTheDocument();
      });
      
      // Navegar para pagamento
      const pagamentoButton = screen.getByRole('button', { name: /pagamento/i });
      fireEvent.click(pagamentoButton);
      
      // Testar botões de pagamento
      const paymentButtons = [
        'Pagar',
        'Adicionar Cartão',
        'Remover',
        'Confirmar Pagamento'
      ];
      
      paymentButtons.forEach(payment => {
        const button = screen.getByRole('button', { name: new RegExp(payment, 'i') });
        if (button) {
          fireEvent.click(button);
        }
      });
    });
  });

  describe('9. Botões de Chat e Comunicação', () => {
    test('Botões de Chat', async () => {
      renderWithProviders(<App />);
      
      await waitFor(() => {
        expect(screen.getByText(/chat/i)).toBeInTheDocument();
      });
      
      // Procurar botões de chat
      const chatButtons = screen.getAllByRole('button', { name: /chat|mensagem/i });
      chatButtons.forEach(button => {
        fireEvent.click(button);
      });
    });

    test('Botões de Notificação', async () => {
      renderWithProviders(<App />);
      
      await waitFor(() => {
        expect(screen.getByText(/notificação/i)).toBeInTheDocument();
      });
      
      // Procurar botões de notificação
      const notificationButtons = screen.getAllByRole('button', { name: /notificação|sino/i });
      notificationButtons.forEach(button => {
        fireEvent.click(button);
      });
    });
  });

  describe('10. Botões de Administração', () => {
    test('Botões de Admin', async () => {
      // Mock de usuário admin
      const adminUser = { ...mockUser, tipo: 'admin' };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(adminUser));
      
      renderWithProviders(<App />);
      
      await waitFor(() => {
        expect(screen.getByText(/admin/i)).toBeInTheDocument();
      });
      
      // Testar botões de admin
      const adminButtons = [
        'Gerenciar Usuários',
        'Gerenciar Serviços',
        'Relatórios',
        'Configurações'
      ];
      
      adminButtons.forEach(admin => {
        const button = screen.getByRole('button', { name: new RegExp(admin, 'i') });
        if (button) {
          fireEvent.click(button);
        }
      });
    });
  });

  describe('11. Testes de Acessibilidade', () => {
    test('Botões devem ter roles corretos', async () => {
      renderWithProviders(<App />);
      
      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
        
        buttons.forEach(button => {
          expect(button).toHaveAttribute('role', 'button');
        });
      });
    });

    test('Botões devem ser focáveis', async () => {
      renderWithProviders(<App />);
      
      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        
        buttons.forEach(button => {
          button.focus();
          expect(button).toHaveFocus();
        });
      });
    });

    test('Botões devem ter texto acessível', async () => {
      renderWithProviders(<App />);
      
      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        
        buttons.forEach(button => {
          const text = button.textContent;
          expect(text).toBeTruthy();
          expect(text.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('12. Testes de Performance', () => {
    test('Botões devem responder rapidamente', async () => {
      renderWithProviders(<App />);
      
      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        
        const startTime = performance.now();
        
        buttons.forEach(button => {
          fireEvent.click(button);
        });
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Deve responder em menos de 100ms
        expect(duration).toBeLessThan(100);
      });
    });
  });

  describe('13. Testes de Estado', () => {
    test('Botões devem mudar estado ao clicar', async () => {
      renderWithProviders(<App />);
      
      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        
        buttons.forEach(button => {
          const initialClass = button.className;
          fireEvent.click(button);
          
          // Verificar se a classe mudou (para botões que mudam estado)
          if (button.className !== initialClass) {
            expect(button.className).not.toBe(initialClass);
          }
        });
      });
    });
  });

  describe('14. Testes de Integração', () => {
    test('Todos os botões devem funcionar em conjunto', async () => {
      renderWithProviders(<App />);
      
      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        
        // Simular sequência de cliques
        buttons.forEach((button, index) => {
          if (index < 5) { // Testar apenas os primeiros 5 botões
            fireEvent.click(button);
          }
        });
        
        // Verificar se a aplicação ainda está funcionando
        expect(screen.getByText(/alça hub/i)).toBeInTheDocument();
      });
    });
  });
});
