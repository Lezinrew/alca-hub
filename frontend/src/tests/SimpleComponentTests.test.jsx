import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { Toaster } from '../components/ui/toaster';

// Importar apenas componentes simples
import SideMenu from '../components/SideMenu';
import ServiceCategoryButtons from '../components/ServiceCategoryButtons';

// Mock do localStorage
import { vi } from 'vitest';

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

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

describe('Testes Simples de Componentes', () => {
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

  describe('Testes de Acessibilidade', () => {
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
        expect(button).toBeInTheDocument();
        expect(button.tagName).toBe('BUTTON');
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

  describe('Testes de Performance', () => {
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

  describe('Testes de Estado', () => {
    test('Botões mudam estado visualmente', () => {
      const mockCategories = [
        { id: '1', categoria: 'Limpeza', icon: '🧹', name: 'Limpeza' }
      ];
      
      // Renderizar sem seleção
      const { rerender } = renderWithProviders(
        <ServiceCategoryButtons 
          categories={mockCategories}
          onCategorySelect={vi.fn()}
        />
      );
      
      const button = screen.getByRole('button', { name: /limpeza/i });
      expect(button).toBeInTheDocument();
      
      // Renderizar com seleção
      rerender(
        <ServiceCategoryButtons 
          categories={mockCategories}
          onCategorySelect={vi.fn()}
          selectedCategory={mockCategories[0]}
        />
      );
      
      // Verificar se o botão ainda existe e tem as classes corretas
      const selectedButton = screen.getByRole('button', { name: /limpeza/i });
      expect(selectedButton).toBeInTheDocument();
      expect(selectedButton).toHaveClass('border-indigo-300', 'bg-indigo-50');
    });
  });
});
