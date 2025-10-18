// Testes do Componente Card - Alça Hub Design System
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/Card'

describe('Card Component', () => {
  // Testes básicos
  test('renderiza corretamente', () => {
    render(<Card>Conteúdo do card</Card>)
    expect(screen.getByText('Conteúdo do card')).toBeInTheDocument()
  })

  test('renderiza com subcomponentes', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Título</CardTitle>
          <CardDescription>Descrição</CardDescription>
        </CardHeader>
        <CardContent>Conteúdo</CardContent>
        <CardFooter>Rodapé</CardFooter>
      </Card>
    )
    
    expect(screen.getByText('Título')).toBeInTheDocument()
    expect(screen.getByText('Descrição')).toBeInTheDocument()
    expect(screen.getByText('Conteúdo')).toBeInTheDocument()
    expect(screen.getByText('Rodapé')).toBeInTheDocument()
  })

  // Testes de variantes
  test('renderiza variante default', () => {
    render(<Card variant="default">Default</Card>)
    const card = screen.getByText('Default').closest('div')
    expect(card).toHaveClass('bg-white', 'border-neutral-200')
  })

  test('renderiza variante elevated', () => {
    render(<Card variant="elevated">Elevated</Card>)
    const card = screen.getByText('Elevated').closest('div')
    expect(card).toHaveClass('bg-white', 'shadow-lg', 'border-0')
  })

  test('renderiza variante outlined', () => {
    render(<Card variant="outlined">Outlined</Card>)
    const card = screen.getByText('Outlined').closest('div')
    expect(card).toHaveClass('bg-transparent', 'border-2', 'border-neutral-300')
  })

  test('renderiza variante filled', () => {
    render(<Card variant="filled">Filled</Card>)
    const card = screen.getByText('Filled').closest('div')
    expect(card).toHaveClass('bg-neutral-50', 'border-neutral-200')
  })

  test('renderiza variante glass', () => {
    render(<Card variant="glass">Glass</Card>)
    const card = screen.getByText('Glass').closest('div')
    expect(card).toHaveClass('bg-white/80', 'backdrop-blur-sm', 'border-white/20')
  })

  test('renderiza variante gradient', () => {
    render(<Card variant="gradient">Gradient</Card>)
    const card = screen.getByText('Gradient').closest('div')
    expect(card).toHaveClass('bg-gradient-to-br', 'from-primary-50', 'to-secondary-50')
  })

  // Testes de tamanhos
  test('renderiza tamanho sm', () => {
    render(<Card size="sm">Small</Card>)
    const card = screen.getByText('Small').closest('div')
    expect(card).toHaveClass('p-4')
  })

  test('renderiza tamanho md', () => {
    render(<Card size="md">Medium</Card>)
    const card = screen.getByText('Medium').closest('div')
    expect(card).toHaveClass('p-6')
  })

  test('renderiza tamanho lg', () => {
    render(<Card size="lg">Large</Card>)
    const card = screen.getByText('Large').closest('div')
    expect(card).toHaveClass('p-8')
  })

  test('renderiza tamanho xl', () => {
    render(<Card size="xl">Extra Large</Card>)
    const card = screen.getByText('Extra Large').closest('div')
    expect(card).toHaveClass('p-10')
  })

  // Testes de estado
  test('renderiza estado hover', () => {
    render(<Card hover>Hover</Card>)
    const card = screen.getByText('Hover').closest('div')
    expect(card).toHaveClass('hover:shadow-md', 'hover:scale-[1.02]')
  })

  test('renderiza estado clickable', () => {
    render(<Card clickable>Clickable</Card>)
    const card = screen.getByText('Clickable').closest('div')
    expect(card).toHaveClass('cursor-pointer', 'hover:shadow-md')
  })

  test('renderiza estado loading', () => {
    render(<Card loading>Loading</Card>)
    const card = screen.getByText('Loading').closest('div')
    expect(card).toHaveClass('relative', 'overflow-hidden')
  })

  // Testes de interação
  test('chama onClick quando clicado', () => {
    const handleClick = jest.fn()
    render(<Card onClick={handleClick}>Clickable</Card>)
    
    const card = screen.getByText('Clickable').closest('div')
    fireEvent.click(card)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('não chama onClick quando não clickable', () => {
    const handleClick = jest.fn()
    render(<Card onClick={handleClick}>Not Clickable</Card>)
    
    const card = screen.getByText('Not Clickable').closest('div')
    fireEvent.click(card)
    expect(handleClick).not.toHaveBeenCalled()
  })

  // Testes de subcomponentes
  test('CardHeader renderiza corretamente', () => {
    render(
      <Card>
        <CardHeader>Header</CardHeader>
      </Card>
    )
    expect(screen.getByText('Header')).toBeInTheDocument()
  })

  test('CardTitle renderiza corretamente', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Título</CardTitle>
        </CardHeader>
      </Card>
    )
    expect(screen.getByText('Título')).toBeInTheDocument()
  })

  test('CardDescription renderiza corretamente', () => {
    render(
      <Card>
        <CardHeader>
          <CardDescription>Descrição</CardDescription>
        </CardHeader>
      </Card>
    )
    expect(screen.getByText('Descrição')).toBeInTheDocument()
  })

  test('CardContent renderiza corretamente', () => {
    render(
      <Card>
        <CardContent>Conteúdo</CardContent>
      </Card>
    )
    expect(screen.getByText('Conteúdo')).toBeInTheDocument()
  })

  test('CardFooter renderiza corretamente', () => {
    render(
      <Card>
        <CardFooter>Rodapé</CardFooter>
      </Card>
    )
    expect(screen.getByText('Rodapé')).toBeInTheDocument()
  })

  // Testes de classes CSS
  test('aplica classes customizadas', () => {
    render(<Card className="custom-class">Custom</Card>)
    const card = screen.getByText('Custom').closest('div')
    expect(card).toHaveClass('custom-class')
  })

  test('aplica classes base corretas', () => {
    render(<Card>Base</Card>)
    const card = screen.getByText('Base').closest('div')
    expect(card).toHaveClass('rounded-lg', 'transition-all', 'duration-200')
  })

  // Testes de props
  test('aceita props adicionais', () => {
    render(<Card data-testid="custom-card" aria-label="Card customizado">Custom</Card>)
    
    const card = screen.getByTestId('custom-card')
    expect(card).toHaveAttribute('aria-label', 'Card customizado')
  })

  test('aceita ref', () => {
    const ref = React.createRef()
    render(<Card ref={ref}>Com ref</Card>)
    
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  // Testes de subcomponentes específicos
  test('CardHeader tem classes corretas', () => {
    render(
      <Card>
        <CardHeader>Header</CardHeader>
      </Card>
    )
    const header = screen.getByText('Header')
    expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'pb-4')
  })

  test('CardTitle tem classes corretas', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Título</CardTitle>
        </CardHeader>
      </Card>
    )
    const title = screen.getByText('Título')
    expect(title).toHaveClass('text-lg', 'font-semibold', 'leading-none', 'tracking-tight')
  })

  test('CardDescription tem classes corretas', () => {
    render(
      <Card>
        <CardHeader>
          <CardDescription>Descrição</CardDescription>
        </CardHeader>
      </Card>
    )
    const description = screen.getByText('Descrição')
    expect(description).toHaveClass('text-sm', 'text-neutral-500')
  })

  test('CardContent tem classes corretas', () => {
    render(
      <Card>
        <CardContent>Conteúdo</CardContent>
      </Card>
    )
    const content = screen.getByText('Conteúdo')
    expect(content).toHaveClass('pt-0')
  })

  test('CardFooter tem classes corretas', () => {
    render(
      <Card>
        <CardFooter>Rodapé</CardFooter>
      </Card>
    )
    const footer = screen.getByText('Rodapé')
    expect(footer).toHaveClass('flex', 'items-center', 'pt-4')
  })

  // Testes de variantes específicas
  test('variante default tem classes corretas', () => {
    render(<Card variant="default">Default</Card>)
    const card = screen.getByText('Default').closest('div')
    expect(card).toHaveClass('bg-white', 'border', 'border-neutral-200')
  })

  test('variante elevated tem classes corretas', () => {
    render(<Card variant="elevated">Elevated</Card>)
    const card = screen.getByText('Elevated').closest('div')
    expect(card).toHaveClass('bg-white', 'shadow-lg', 'border-0')
  })

  test('variante outlined tem classes corretas', () => {
    render(<Card variant="outlined">Outlined</Card>)
    const card = screen.getByText('Outlined').closest('div')
    expect(card).toHaveClass('bg-transparent', 'border-2', 'border-neutral-300')
  })

  test('variante filled tem classes corretas', () => {
    render(<Card variant="filled">Filled</Card>)
    const card = screen.getByText('Filled').closest('div')
    expect(card).toHaveClass('bg-neutral-50', 'border', 'border-neutral-200')
  })

  test('variante glass tem classes corretas', () => {
    render(<Card variant="glass">Glass</Card>)
    const card = screen.getByText('Glass').closest('div')
    expect(card).toHaveClass('bg-white/80', 'backdrop-blur-sm', 'border', 'border-white/20')
  })

  test('variante gradient tem classes corretas', () => {
    render(<Card variant="gradient">Gradient</Card>)
    const card = screen.getByText('Gradient').closest('div')
    expect(card).toHaveClass('bg-gradient-to-br', 'from-primary-50', 'to-secondary-50', 'border', 'border-primary-200')
  })

  // Testes de tamanhos específicos
  test('tamanho sm tem classes corretas', () => {
    render(<Card size="sm">Small</Card>)
    const card = screen.getByText('Small').closest('div')
    expect(card).toHaveClass('p-4')
  })

  test('tamanho md tem classes corretas', () => {
    render(<Card size="md">Medium</Card>)
    const card = screen.getByText('Medium').closest('div')
    expect(card).toHaveClass('p-6')
  })

  test('tamanho lg tem classes corretas', () => {
    render(<Card size="lg">Large</Card>)
    const card = screen.getByText('Large').closest('div')
    expect(card).toHaveClass('p-8')
  })

  test('tamanho xl tem classes corretas', () => {
    render(<Card size="xl">Extra Large</Card>)
    const card = screen.getByText('Extra Large').closest('div')
    expect(card).toHaveClass('p-10')
  })

  // Testes de estados específicos
  test('estado hover tem classes corretas', () => {
    render(<Card hover>Hover</Card>)
    const card = screen.getByText('Hover').closest('div')
    expect(card).toHaveClass('hover:shadow-md', 'hover:scale-[1.02]')
  })

  test('estado clickable tem classes corretas', () => {
    render(<Card clickable>Clickable</Card>)
    const card = screen.getByText('Clickable').closest('div')
    expect(card).toHaveClass('cursor-pointer', 'hover:shadow-md')
  })

  test('estado loading tem classes corretas', () => {
    render(<Card loading>Loading</Card>)
    const card = screen.getByText('Loading').closest('div')
    expect(card).toHaveClass('relative', 'overflow-hidden')
  })
})
