// Testes do Componente Button - Alça Hub Design System
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Button } from '../components/Button'

describe('Button Component', () => {
  // Testes básicos
  test('renderiza corretamente', () => {
    render(<Button>Clique aqui</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByText('Clique aqui')).toBeInTheDocument()
  })

  test('aceita diferentes variantes', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-primary-500')

    rerender(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-secondary-100')

    rerender(<Button variant="outline">Outline</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-transparent')

    rerender(<Button variant="ghost">Ghost</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-transparent')

    rerender(<Button variant="destructive">Destructive</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-error-500')

    rerender(<Button variant="success">Success</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-success-500')
  })

  test('aceita diferentes tamanhos', () => {
    const { rerender } = render(<Button size="xs">XS</Button>)
    expect(screen.getByRole('button')).toHaveClass('px-2 py-1 text-xs')

    rerender(<Button size="sm">SM</Button>)
    expect(screen.getByRole('button')).toHaveClass('px-3 py-1.5 text-sm')

    rerender(<Button size="md">MD</Button>)
    expect(screen.getByRole('button')).toHaveClass('px-4 py-2 text-base')

    rerender(<Button size="lg">LG</Button>)
    expect(screen.getByRole('button')).toHaveClass('px-6 py-3 text-lg')

    rerender(<Button size="xl">XL</Button>)
    expect(screen.getByRole('button')).toHaveClass('px-8 py-4 text-xl')
  })

  // Testes de estado
  test('renderiza estado desabilitado', () => {
    render(<Button disabled>Desabilitado</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('cursor-not-allowed')
  })

  test('renderiza estado de loading', () => {
    render(<Button loading>Loading</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('relative overflow-hidden')
  })

  test('renderiza largura total', () => {
    render(<Button fullWidth>Largura total</Button>)
    expect(screen.getByRole('button')).toHaveClass('w-full')
  })

  // Testes de interação
  test('chama onClick quando clicado', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Clique</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('não chama onClick quando desabilitado', () => {
    const handleClick = jest.fn()
    render(<Button disabled onClick={handleClick}>Desabilitado</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  test('não chama onClick quando em loading', () => {
    const handleClick = jest.fn()
    render(<Button loading onClick={handleClick}>Loading</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  // Testes de ícones
  test('renderiza ícone à esquerda', () => {
    const icon = <span data-testid="icon">🔍</span>
    render(<Button icon={icon} iconPosition="left">Com ícone</Button>)
    
    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByText('Com ícone')).toBeInTheDocument()
  })

  test('renderiza ícone à direita', () => {
    const icon = <span data-testid="icon">🔍</span>
    render(<Button icon={icon} iconPosition="right">Com ícone</Button>)
    
    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByText('Com ícone')).toBeInTheDocument()
  })

  // Testes de acessibilidade
  test('tem role button', () => {
    render(<Button>Botão</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  test('é focado com Tab', () => {
    render(<Button>Focável</Button>)
    const button = screen.getByRole('button')
    button.focus()
    expect(button).toHaveFocus()
  })

  test('é ativado com Enter', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Ativável</Button>)
    
    const button = screen.getByRole('button')
    button.focus()
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })
    expect(handleClick).toHaveBeenCalled()
  })

  test('é ativado com Space', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Ativável</Button>)
    
    const button = screen.getByRole('button')
    button.focus()
    fireEvent.keyDown(button, { key: ' ', code: 'Space' })
    expect(handleClick).toHaveBeenCalled()
  })

  // Testes de classes CSS
  test('aplica classes customizadas', () => {
    render(<Button className="custom-class">Custom</Button>)
    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })

  test('aplica classes base corretas', () => {
    render(<Button>Base</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center')
  })

  // Testes de props
  test('aceita props adicionais', () => {
    render(<Button data-testid="custom-button" aria-label="Botão customizado">Custom</Button>)
    
    const button = screen.getByTestId('custom-button')
    expect(button).toHaveAttribute('aria-label', 'Botão customizado')
  })

  test('aceita ref', () => {
    const ref = React.createRef()
    render(<Button ref={ref}>Com ref</Button>)
    
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  // Testes de loading
  test('mostra spinner quando em loading', async () => {
    render(<Button loading>Loading</Button>)
    
    await waitFor(() => {
      const spinner = screen.getByRole('button').querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })
  })

  test('esconde conteúdo quando em loading', () => {
    render(<Button loading>Loading</Button>)
    
    const button = screen.getByRole('button')
    const content = button.querySelector('.opacity-0')
    expect(content).toBeInTheDocument()
  })

  // Testes de variantes específicas
  test('variante primary tem cores corretas', () => {
    render(<Button variant="primary">Primary</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-primary-500', 'text-white', 'border-primary-500')
  })

  test('variante secondary tem cores corretas', () => {
    render(<Button variant="secondary">Secondary</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-secondary-100', 'text-secondary-900', 'border-secondary-200')
  })

  test('variante outline tem cores corretas', () => {
    render(<Button variant="outline">Outline</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-transparent', 'text-primary-500', 'border-primary-500')
  })

  test('variante ghost tem cores corretas', () => {
    render(<Button variant="ghost">Ghost</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-transparent', 'text-primary-500', 'border-transparent')
  })

  test('variante destructive tem cores corretas', () => {
    render(<Button variant="destructive">Destructive</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-error-500', 'text-white', 'border-error-500')
  })

  test('variante success tem cores corretas', () => {
    render(<Button variant="success">Success</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-success-500', 'text-white', 'border-success-500')
  })

  // Testes de estados desabilitados
  test('variante primary desabilitada tem cores corretas', () => {
    render(<Button variant="primary" disabled>Primary Disabled</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-primary-300', 'text-white', 'border-primary-300')
  })

  test('variante secondary desabilitada tem cores corretas', () => {
    render(<Button variant="secondary" disabled>Secondary Disabled</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-secondary-50', 'text-secondary-400', 'border-secondary-100')
  })

  // Testes de tamanhos específicos
  test('tamanho xs tem classes corretas', () => {
    render(<Button size="xs">XS</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('px-2', 'py-1', 'text-xs')
  })

  test('tamanho sm tem classes corretas', () => {
    render(<Button size="sm">SM</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm')
  })

  test('tamanho md tem classes corretas', () => {
    render(<Button size="md">MD</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('px-4', 'py-2', 'text-base')
  })

  test('tamanho lg tem classes corretas', () => {
    render(<Button size="lg">LG</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('px-6', 'py-3', 'text-lg')
  })

  test('tamanho xl tem classes corretas', () => {
    render(<Button size="xl">XL</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('px-8', 'py-4', 'text-xl')
  })
})
