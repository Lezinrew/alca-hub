// Testes do Componente Input - Alça Hub Design System
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Input } from '../components/Input'

describe('Input Component', () => {
  // Testes básicos
  test('renderiza corretamente', () => {
    render(<Input placeholder="Digite aqui" />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Digite aqui')).toBeInTheDocument()
  })

  test('renderiza com label', () => {
    render(<Input label="Nome" placeholder="Digite seu nome" />)
    expect(screen.getByLabelText('Nome')).toBeInTheDocument()
    expect(screen.getByText('Nome')).toBeInTheDocument()
  })

  test('renderiza com label obrigatório', () => {
    render(<Input label="Nome" required placeholder="Digite seu nome" />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  // Testes de tipos
  test('renderiza tipo text por padrão', () => {
    render(<Input placeholder="Texto" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text')
  })

  test('renderiza tipo password', () => {
    render(<Input type="password" placeholder="Senha" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'password')
  })

  test('renderiza tipo email', () => {
    render(<Input type="email" placeholder="Email" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')
  })

  test('renderiza tipo number', () => {
    render(<Input type="number" placeholder="Número" />)
    expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number')
  })

  // Testes de variantes
  test('renderiza variante default', () => {
    render(<Input placeholder="Default" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-neutral-300')
  })

  test('renderiza variante filled', () => {
    render(<Input variant="filled" placeholder="Filled" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('bg-neutral-100')
  })

  test('renderiza variante outlined', () => {
    render(<Input variant="outlined" placeholder="Outlined" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-2')
  })

  // Testes de tamanhos
  test('renderiza tamanho sm', () => {
    render(<Input size="sm" placeholder="Small" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('px-3 py-2 text-sm')
  })

  test('renderiza tamanho md', () => {
    render(<Input size="md" placeholder="Medium" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('px-4 py-3 text-base')
  })

  test('renderiza tamanho lg', () => {
    render(<Input size="lg" placeholder="Large" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('px-5 py-4 text-lg')
  })

  // Testes de estado
  test('renderiza estado desabilitado', () => {
    render(<Input disabled placeholder="Desabilitado" />)
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
    expect(input).toHaveClass('cursor-not-allowed')
  })

  test('renderiza estado de erro', () => {
    render(<Input error="Campo obrigatório" placeholder="Com erro" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-error-500')
    expect(screen.getByText('Campo obrigatório')).toBeInTheDocument()
  })

  test('renderiza estado de sucesso', () => {
    render(<Input success placeholder="Com sucesso" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-success-500')
  })

  // Testes de interação
  test('chama onChange quando digitado', () => {
    const handleChange = jest.fn()
    render(<Input onChange={handleChange} placeholder="Digite" />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'teste' } })
    expect(handleChange).toHaveBeenCalled()
  })

  test('chama onFocus quando focado', () => {
    const handleFocus = jest.fn()
    render(<Input onFocus={handleFocus} placeholder="Foco" />)
    
    const input = screen.getByRole('textbox')
    fireEvent.focus(input)
    expect(handleFocus).toHaveBeenCalled()
  })

  test('chama onBlur quando perde foco', () => {
    const handleBlur = jest.fn()
    render(<Input onBlur={handleBlur} placeholder="Blur" />)
    
    const input = screen.getByRole('textbox')
    fireEvent.blur(input)
    expect(handleBlur).toHaveBeenCalled()
  })

  // Testes de ícones
  test('renderiza ícone à esquerda', () => {
    const icon = <span data-testid="left-icon">🔍</span>
    render(<Input icon={icon} iconPosition="left" placeholder="Com ícone" />)
    
    expect(screen.getByTestId('left-icon')).toBeInTheDocument()
  })

  test('renderiza ícone à direita', () => {
    const icon = <span data-testid="right-icon">🔍</span>
    render(<Input icon={icon} iconPosition="right" placeholder="Com ícone" />)
    
    expect(screen.getByTestId('right-icon')).toBeInTheDocument()
  })

  // Testes de senha
  test('mostra/oculta senha', () => {
    render(<Input type="password" placeholder="Senha" />)
    const input = screen.getByRole('textbox')
    const toggleButton = screen.getByRole('button')
    
    // Inicialmente oculta
    expect(input).toHaveAttribute('type', 'password')
    
    // Clica para mostrar
    fireEvent.click(toggleButton)
    expect(input).toHaveAttribute('type', 'text')
    
    // Clica para ocultar
    fireEvent.click(toggleButton)
    expect(input).toHaveAttribute('type', 'password')
  })

  // Testes de helper text
  test('renderiza helper text', () => {
    render(<Input helperText="Texto de ajuda" placeholder="Com ajuda" />)
    expect(screen.getByText('Texto de ajuda')).toBeInTheDocument()
  })

  test('renderiza helper text de erro', () => {
    render(<Input error="Erro" helperText="Texto de ajuda" placeholder="Com erro" />)
    expect(screen.getByText('Erro')).toBeInTheDocument()
  })

  // Testes de acessibilidade
  test('tem label associado', () => {
    render(<Input label="Nome" placeholder="Digite seu nome" />)
    const input = screen.getByLabelText('Nome')
    expect(input).toBeInTheDocument()
  })

  test('tem aria-describedby para helper text', () => {
    render(<Input helperText="Texto de ajuda" placeholder="Com ajuda" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-describedby')
  })

  test('tem aria-invalid para erro', () => {
    render(<Input error="Erro" placeholder="Com erro" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  // Testes de classes CSS
  test('aplica classes customizadas', () => {
    render(<Input className="custom-class" placeholder="Custom" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-class')
  })

  test('aplica classes base corretas', () => {
    render(<Input placeholder="Base" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('block', 'w-full', 'rounded-md')
  })

  // Testes de props
  test('aceita props adicionais', () => {
    render(<Input data-testid="custom-input" aria-label="Input customizado" placeholder="Custom" />)
    
    const input = screen.getByTestId('custom-input')
    expect(input).toHaveAttribute('aria-label', 'Input customizado')
  })

  test('aceita ref', () => {
    const ref = React.createRef()
    render(<Input ref={ref} placeholder="Com ref" />)
    
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  // Testes de largura total
  test('renderiza largura total', () => {
    render(<Input fullWidth placeholder="Largura total" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('w-full')
  })

  // Testes de variantes específicas
  test('variante default tem classes corretas', () => {
    render(<Input variant="default" placeholder="Default" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-neutral-300')
  })

  test('variante filled tem classes corretas', () => {
    render(<Input variant="filled" placeholder="Filled" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('bg-neutral-100', 'border-transparent')
  })

  test('variante outlined tem classes corretas', () => {
    render(<Input variant="outlined" placeholder="Outlined" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-2', 'bg-transparent')
  })

  // Testes de estados específicos
  test('estado de erro tem classes corretas', () => {
    render(<Input error="Erro" placeholder="Com erro" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-error-500')
  })

  test('estado de sucesso tem classes corretas', () => {
    render(<Input success placeholder="Com sucesso" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-success-500')
  })

  test('estado desabilitado tem classes corretas', () => {
    render(<Input disabled placeholder="Desabilitado" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('cursor-not-allowed')
  })

  // Testes de ícones específicos
  test('ícone à esquerda tem classes corretas', () => {
    const icon = <span data-testid="icon">🔍</span>
    render(<Input icon={icon} iconPosition="left" placeholder="Com ícone" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('pl-10')
  })

  test('ícone à direita tem classes corretas', () => {
    const icon = <span data-testid="icon">🔍</span>
    render(<Input icon={icon} iconPosition="right" placeholder="Com ícone" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('pr-10')
  })

  // Testes de senha específicos
  test('tipo password tem botão de toggle', () => {
    render(<Input type="password" placeholder="Senha" />)
    const toggleButton = screen.getByRole('button')
    expect(toggleButton).toBeInTheDocument()
  })

  test('botão de toggle tem tabIndex -1', () => {
    render(<Input type="password" placeholder="Senha" />)
    const toggleButton = screen.getByRole('button')
    expect(toggleButton).toHaveAttribute('tabIndex', '-1')
  })

  // Testes de helper text específicos
  test('helper text tem cor correta', () => {
    render(<Input helperText="Texto de ajuda" placeholder="Com ajuda" />)
    const helperText = screen.getByText('Texto de ajuda')
    expect(helperText).toHaveClass('text-neutral-500')
  })

  test('helper text de erro tem cor correta', () => {
    render(<Input error="Erro" placeholder="Com erro" />)
    const errorText = screen.getByText('Erro')
    expect(errorText).toHaveClass('text-error-600')
  })
})
