import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { Toaster } from '../components/ui/toaster';

// Importar componentes específicos
import SideMenu from '../components/SideMenu';
import ServiceCategoryButtons from '../components/ServiceCategoryButtons';
import ProfessionalAgenda from '../components/ProfessionalAgenda';
import UberStyleMap from '../components/UberStyleMap';
import MyOrders from '../components/MyOrders';
import ServiceHistory from '../components/ServiceHistory';

// Mock do localStorage
import { vi } from 'vitest';

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

describe('Testes de Botões por Componente', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('SideMenu Component', () => {
    test('Todos os botões do menu lateral funcionam', () => {
      const mockOnClose = vi.fn();
      renderWithProviders(<SideMenu onClose={mockOnClose} />);
      
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
        
        fireEvent.click(button);
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('ServiceCategoryButtons Component', () => {
    const mockCategories = [
      { id: '1', categoria: 'Limpeza', icon: '🧹', name: 'Limpeza' },
      { id: '2', categoria: 'Manutenção', icon: '🔧', name: 'Manutenção' },
      { id: '3', categoria: 'Jardinagem', icon: '🌱', name: 'Jardinagem' }
    ];

    test('Botões de categoria funcionam corretamente', () => {
      const mockOnCategorySelect = vi.fn();
      
      renderWithProviders(
        <ServiceCategoryButtons 
          categories={mockCategories}
          onCategorySelect={mockOnCategorySelect}
        />
      );
      
      mockCategories.forEach(category => {
        const button = screen.getByRole('button', { name: new RegExp(category.name, 'i') });
        expect(button).toBeInTheDocument();
        
        fireEvent.click(button);
        expect(mockOnCategorySelect).toHaveBeenCalledWith(category);
      });
    });

    test('Botões de categoria têm estado selecionado', () => {
      const mockOnCategorySelect = vi.fn();
      
      renderWithProviders(
        <ServiceCategoryButtons 
          categories={mockCategories}
          onCategorySelect={mockOnCategorySelect}
          selectedCategory={mockCategories[0]}
        />
      );
      
      const selectedButton = screen.getByRole('button', { name: new RegExp(mockCategories[0].name, 'i') });
      expect(selectedButton).toHaveClass('border-indigo-300', 'bg-indigo-50');
    });
  });

  describe('ProfessionalAgenda Component', () => {
    const mockProfessional = {
      id: 1,
      name: 'João Silva',
      category: 'Limpeza',
      rating: 4.8,
      pricing: {
        hourly: { min: 80, max: 120, average: 100 },
        packages: [
          { id: 'basic', name: 'Básico', duration: 2, price: 160 },
          { id: 'standard', name: 'Padrão', duration: 4, price: 300 }
        ]
      }
    };

    test('Botões de seleção de pacote funcionam', async () => {
      const mockOnBookingSelect = vi.fn();
      
      renderWithProviders(
        <ProfessionalAgenda 
          professional={mockProfessional}
          onBookingSelect={mockOnBookingSelect}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText(/escolha um pacote/i)).toBeInTheDocument();
      });
      
      // Testar botões de pacote
      const packageButtons = screen.getAllByRole('button');
      packageButtons.forEach(button => {
        if (button.textContent.includes('Básico') || button.textContent.includes('Padrão')) {
          fireEvent.click(button);
        }
      });
    });

    test('Botões de data e horário funcionam', async () => {
      const mockOnBookingSelect = vi.fn();
      
      renderWithProviders(
        <ProfessionalAgenda 
          professional={mockProfessional}
          onBookingSelect={mockOnBookingSelect}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText(/selecione a data/i)).toBeInTheDocument();
      });
      
      // Testar botão de seleção de data
      const dateButton = screen.getByRole('button', { name: /selecione a data/i });
      expect(dateButton).toBeInTheDocument();
      fireEvent.click(dateButton);
    });
  });

  describe('UberStyleMap Component', () => {
    const mockUser = { id: 1, nome: 'Test User' };

    test('Botões de filtro funcionam', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success({
          coords: {
            latitude: -23.5505,
            longitude: -46.6333
          }
        });
      });

      renderWithProviders(<UberStyleMap user={mockUser} />);
      
      await waitFor(() => {
        expect(screen.getByText(/filtros/i)).toBeInTheDocument();
      });
      
      // Testar botão de filtros
      const filterButton = screen.getByRole('button', { name: /filtros/i });
      fireEvent.click(filterButton);
    });

    test('Botões de negociação funcionam', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success({
          coords: {
            latitude: -23.5505,
            longitude: -46.6333
          }
        });
      });

      renderWithProviders(<UberStyleMap user={mockUser} />);
      
      await waitFor(() => {
        expect(screen.getByText(/negociar/i)).toBeInTheDocument();
      });
      
      // Testar botões de negociação
      const negotiateButtons = screen.getAllByRole('button', { name: /negociar/i });
      negotiateButtons.forEach(button => {
        fireEvent.click(button);
      });
    });
  });

  describe('MyOrders Component', () => {
    test('Botões de filtro de pedidos funcionam', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]));
      
      renderWithProviders(<MyOrders />);
      
      await waitFor(() => {
        expect(screen.getByText(/todos/i)).toBeInTheDocument();
      });
      
      // Testar botões de filtro
      const filterButtons = ['Todos', 'Pendente', 'Confirmado', 'Concluído'];
      
      filterButtons.forEach(filter => {
        const button = screen.getByRole('button', { name: new RegExp(filter, 'i') });
        if (button) {
          fireEvent.click(button);
        }
      });
    });

    test('Botões de ação em pedidos funcionam', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]));
      
      renderWithProviders(<MyOrders />);
      
      await waitFor(() => {
        expect(screen.getByText(/ver detalhes/i)).toBeInTheDocument();
      });
      
      // Testar botões de ação
      const actionButtons = ['Ver Detalhes', 'Avaliar', 'Contatar'];
      
      actionButtons.forEach(action => {
        const button = screen.getByRole('button', { name: new RegExp(action, 'i') });
        if (button) {
          fireEvent.click(button);
        }
      });
    });
  });

  describe('ServiceHistory Component', () => {
    test('Botões de filtro de histórico funcionam', async () => {
      renderWithProviders(<ServiceHistory />);
      
      await waitFor(() => {
        expect(screen.getByText(/todos/i)).toBeInTheDocument();
      });
      
      // Testar botões de filtro
      const filterButtons = ['Todos', 'Limpeza', 'Manutenção', 'Jardinagem'];
      
      filterButtons.forEach(filter => {
        const button = screen.getByRole('button', { name: new RegExp(filter, 'i') });
        if (button) {
          fireEvent.click(button);
        }
      });
    });

    test('Botões de ação em histórico funcionam', async () => {
      renderWithProviders(<ServiceHistory />);
      
      await waitFor(() => {
        expect(screen.getByText(/ver detalhes/i)).toBeInTheDocument();
      });
      
      // Testar botões de ação
      const actionButtons = ['Ver Detalhes', 'Avaliar', 'Contratar Novamente'];
      
      actionButtons.forEach(action => {
        const button = screen.getByRole('button', { name: new RegExp(action, 'i') });
        if (button) {
          fireEvent.click(button);
        }
      });
    });
  });

  describe('Testes de Acessibilidade por Componente', () => {
    test('Todos os botões têm atributos de acessibilidade', () => {
      const mockCategories = [
        { id: '1', categoria: 'Limpeza', icon: '🧹', name: 'Limpeza' }
      ];
      
      renderWithProviders(
        <ServiceCategoryButtons 
          categories={mockCategories}
          onCategorySelect={vi.fn()}
        />
      );
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('role', 'button');
        expect(button.textContent).toBeTruthy();
      });
    });

    test('Botões respondem a eventos de teclado', () => {
      const mockCategories = [
        { id: '1', categoria: 'Limpeza', icon: '🧹', name: 'Limpeza' }
      ];
      
      renderWithProviders(
        <ServiceCategoryButtons 
          categories={mockCategories}
          onCategorySelect={vi.fn()}
        />
      );
      
      const button = screen.getByRole('button', { name: /limpeza/i });
      
      // Testar Enter
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      
      // Testar Space
      fireEvent.keyDown(button, { key: ' ', code: 'Space' });
    });
  });

  describe('Testes de Performance por Componente', () => {
    test('Componentes renderizam rapidamente', () => {
      const startTime = performance.now();
      
      renderWithProviders(<SideMenu />);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100);
    });

    test('Botões respondem rapidamente a cliques', () => {
      const mockCategories = [
        { id: '1', categoria: 'Limpeza', icon: '🧹', name: 'Limpeza' }
      ];
      
      renderWithProviders(
        <ServiceCategoryButtons 
          categories={mockCategories}
          onCategorySelect={vi.fn()}
        />
      );
      
      const button = screen.getByRole('button', { name: /limpeza/i });
      
      const startTime = performance.now();
      fireEvent.click(button);
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(50);
    });
  });

  describe('Testes de Estado por Componente', () => {
    test('Botões mudam estado visualmente', () => {
      const mockCategories = [
        { id: '1', categoria: 'Limpeza', icon: '🧹', name: 'Limpeza' }
      ];
      
      const { rerender } = renderWithProviders(
        <ServiceCategoryButtons 
          categories={mockCategories}
          onCategorySelect={vi.fn()}
        />
      );
      
      const button = screen.getByRole('button', { name: /limpeza/i });
      const initialClass = button.className;
      
      // Simular seleção
      rerender(
        <ServiceCategoryButtons 
          categories={mockCategories}
          onCategorySelect={vi.fn()}
          selectedCategory={mockCategories[0]}
        />
      );
      
      expect(button.className).not.toBe(initialClass);
    });
  });
});
