import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProviderFilters from '../../components/ProviderFilters';

// Mock do useToast
vi.mock('../../hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

describe('ProviderFilters', () => {
  const defaultProps = {
    filters: {
      categoria: '',
      radius: 10,
      especialidade: '',
      disponibilidade: 'todos'
    },
    setFilters: vi.fn(),
    onApplyFilters: vi.fn(),
    loading: false,
    showFilters: true,
    setShowFilters: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render filter toggle button', () => {
    render(<ProviderFilters {...defaultProps} showFilters={false} />);
    
    expect(screen.getByText('Filtros')).toBeInTheDocument();
  });

  it('should show active filters count badge when filters are active', () => {
    const propsWithFilters = {
      ...defaultProps,
      filters: {
        categoria: 'limpeza',
        radius: 10,
        especialidade: 'eletrica',
        disponibilidade: 'online'
      }
    };

    render(<ProviderFilters {...propsWithFilters} showFilters={false} />);
    
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should render filters panel when showFilters is true', () => {
    render(<ProviderFilters {...defaultProps} />);
    
    expect(screen.getByText('Filtros Avançados')).toBeInTheDocument();
    expect(screen.getByText('Categoria de Serviço')).toBeInTheDocument();
    expect(screen.getByText('Especialidade')).toBeInTheDocument();
    expect(screen.getByText('Status de Disponibilidade')).toBeInTheDocument();
    expect(screen.getByText('Raio de busca: 10km')).toBeInTheDocument();
  });

  it('should update categoria filter when selected', async () => {
    render(<ProviderFilters {...defaultProps} />);
    
    const categoriaSelect = screen.getByDisplayValue('Todas as categorias');
    fireEvent.click(categoriaSelect);
    
    await waitFor(() => {
      const limpezaOption = screen.getByText('🧹 Limpeza');
      fireEvent.click(limpezaOption);
    });

    expect(defaultProps.setFilters).toHaveBeenCalledWith({
      categoria: 'limpeza',
      radius: 10,
      especialidade: '',
      disponibilidade: 'todos'
    });
  });

  it('should update especialidade filter when selected', async () => {
    render(<ProviderFilters {...defaultProps} />);
    
    const especialidadeSelect = screen.getByDisplayValue('Todas as especialidades');
    fireEvent.click(especialidadeSelect);
    
    await waitFor(() => {
      const eletricaOption = screen.getByText('⚡ Elétrica');
      fireEvent.click(eletricaOption);
    });

    expect(defaultProps.setFilters).toHaveBeenCalledWith({
      categoria: '',
      radius: 10,
      especialidade: 'eletrica',
      disponibilidade: 'todos'
    });
  });

  it('should update disponibilidade filter when selected', async () => {
    render(<ProviderFilters {...defaultProps} />);
    
    const disponibilidadeSelect = screen.getByDisplayValue('🔄 Todos os status');
    fireEvent.click(disponibilidadeSelect);
    
    await waitFor(() => {
      const onlineOption = screen.getByText('🟢 Online');
      fireEvent.click(onlineOption);
    });

    expect(defaultProps.setFilters).toHaveBeenCalledWith({
      categoria: '',
      radius: 10,
      especialidade: '',
      disponibilidade: 'online'
    });
  });

  it('should update radius when slider is moved', () => {
    render(<ProviderFilters {...defaultProps} />);
    
    const radiusSlider = screen.getByRole('slider');
    fireEvent.change(radiusSlider, { target: { value: '25' } });

    expect(defaultProps.setFilters).toHaveBeenCalledWith({
      categoria: '',
      radius: 25,
      especialidade: '',
      disponibilidade: 'todos'
    });
  });

  it('should call onApplyFilters when apply button is clicked', () => {
    render(<ProviderFilters {...defaultProps} />);
    
    const applyButton = screen.getByText('Aplicar Filtros');
    fireEvent.click(applyButton);

    expect(defaultProps.onApplyFilters).toHaveBeenCalled();
  });

  it('should show loading state on apply button when loading', () => {
    render(<ProviderFilters {...defaultProps} loading={true} />);
    
    expect(screen.getByText('Buscando...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Buscando...' })).toBeDisabled();
  });

  it('should clear all filters when clear button is clicked', () => {
    const propsWithFilters = {
      ...defaultProps,
      filters: {
        categoria: 'limpeza',
        radius: 15,
        especialidade: 'eletrica',
        disponibilidade: 'online'
      }
    };

    render(<ProviderFilters {...propsWithFilters} />);
    
    const clearButton = screen.getByText('Limpar');
    fireEvent.click(clearButton);

    expect(defaultProps.setFilters).toHaveBeenCalledWith({
      categoria: '',
      radius: 10,
      especialidade: '',
      disponibilidade: 'todos'
    });
  });

  it('should show active filters badges when filters are applied', () => {
    const propsWithFilters = {
      ...defaultProps,
      filters: {
        categoria: 'limpeza',
        radius: 10,
        especialidade: 'eletrica',
        disponibilidade: 'online'
      }
    };

    render(<ProviderFilters {...propsWithFilters} />);
    
    expect(screen.getByText('🧹 Limpeza')).toBeInTheDocument();
    expect(screen.getByText('⚡ Elétrica')).toBeInTheDocument();
    expect(screen.getByText('🟢 Online')).toBeInTheDocument();
  });

  it('should remove individual filter when X is clicked on badge', () => {
    const propsWithFilters = {
      ...defaultProps,
      filters: {
        categoria: 'limpeza',
        radius: 10,
        especialidade: '',
        disponibilidade: 'todos'
      }
    };

    render(<ProviderFilters {...propsWithFilters} />);
    
    const limpezaBadge = screen.getByText('🧹 Limpeza');
    const xButton = limpezaBadge.parentElement.querySelector('svg');
    fireEvent.click(xButton);

    expect(defaultProps.setFilters).toHaveBeenCalledWith({
      categoria: '',
      radius: 10,
      especialidade: '',
      disponibilidade: 'todos'
    });
  });

  it('should close filters panel when X button is clicked', () => {
    render(<ProviderFilters {...defaultProps} />);
    
    const closeButton = screen.getByRole('button', { name: '' }); // X button
    fireEvent.click(closeButton);

    expect(defaultProps.setShowFilters).toHaveBeenCalledWith(false);
  });

  it('should not show clear button when no filters are active', () => {
    render(<ProviderFilters {...defaultProps} />);
    
    expect(screen.queryByText('Limpar')).not.toBeInTheDocument();
  });

  it('should not show active filters section when no filters are active', () => {
    render(<ProviderFilters {...defaultProps} />);
    
    expect(screen.queryByText('Filtros ativos:')).not.toBeInTheDocument();
  });

  it('should show correct radius value in label', () => {
    const propsWithRadius = {
      ...defaultProps,
      filters: {
        categoria: '',
        radius: 25,
        especialidade: '',
        disponibilidade: 'todos'
      }
    };

    render(<ProviderFilters {...propsWithRadius} />);
    
    expect(screen.getByText('Raio de busca: 25km')).toBeInTheDocument();
  });

  it('should render all especialidade options', () => {
    render(<ProviderFilters {...defaultProps} />);
    
    const especialidadeSelect = screen.getByDisplayValue('Todas as especialidades');
    fireEvent.click(especialidadeSelect);
    
    expect(screen.getByText('⚡ Elétrica')).toBeInTheDocument();
    expect(screen.getByText('🚰 Encanamento')).toBeInTheDocument();
    expect(screen.getByText('🧹 Limpeza')).toBeInTheDocument();
    expect(screen.getByText('🔧 Manutenção')).toBeInTheDocument();
    expect(screen.getByText('🌱 Jardinagem')).toBeInTheDocument();
    expect(screen.getByText('🎨 Pintura')).toBeInTheDocument();
    expect(screen.getByText('❄️ Ar Condicionado')).toBeInTheDocument();
    expect(screen.getByText('🔒 Segurança')).toBeInTheDocument();
    expect(screen.getByText('💻 Informática')).toBeInTheDocument();
  });

  it('should render all categoria options', () => {
    render(<ProviderFilters {...defaultProps} />);
    
    const categoriaSelect = screen.getByDisplayValue('Todas as categorias');
    fireEvent.click(categoriaSelect);
    
    expect(screen.getByText('🧹 Limpeza')).toBeInTheDocument();
    expect(screen.getByText('🔧 Manutenção')).toBeInTheDocument();
    expect(screen.getByText('🌱 Jardinagem')).toBeInTheDocument();
    expect(screen.getByText('🎨 Pintura')).toBeInTheDocument();
    expect(screen.getByText('⚡ Elétrica')).toBeInTheDocument();
    expect(screen.getByText('🚰 Encanamento')).toBeInTheDocument();
  });

  it('should render all disponibilidade options', () => {
    render(<ProviderFilters {...defaultProps} />);
    
    const disponibilidadeSelect = screen.getByDisplayValue('🔄 Todos os status');
    fireEvent.click(disponibilidadeSelect);
    
    expect(screen.getByText('🔄 Todos os status')).toBeInTheDocument();
    expect(screen.getByText('🟢 Online')).toBeInTheDocument();
    expect(screen.getByText('🔴 Indisponível')).toBeInTheDocument();
  });
});
