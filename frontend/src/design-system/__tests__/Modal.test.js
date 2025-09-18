// Testes do Componente Modal - Alça Hub Design System
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter, useModal } from '../components/Modal'

// Mock do createPortal
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node) => node
}))

describe('Modal Component', () => {
  // Testes básicos
  test('renderiza quando isOpen é true', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()}>
        <div>Conteúdo do modal</div>
      </Modal>
    )
    expect(screen.getByText('Conteúdo do modal')).toBeInTheDocument()
  })

  test('não renderiza quando isOpen é false', () => {
    render(
      <Modal isOpen={false} onClose={jest.fn()}>
        <div>Conteúdo do modal</div>
      </Modal>
    )
    expect(screen.queryByText('Conteúdo do modal')).not.toBeInTheDocument()
  })

  test('renderiza com título', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} title="Título do Modal">
        <div>Conteúdo</div>
      </Modal>
    )
    expect(screen.getByText('Título do Modal')).toBeInTheDocument()
  })

  test('renderiza com descrição', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} description="Descrição do modal">
        <div>Conteúdo</div>
      </Modal>
    )
    expect(screen.getByText('Descrição do modal')).toBeInTheDocument()
  })

  // Testes de tamanhos
  test('renderiza tamanho sm', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} size="sm">
        <div>Small Modal</div>
      </Modal>
    )
    const modal = screen.getByText('Small Modal').closest('div')
    expect(modal).toHaveClass('max-w-md')
  })

  test('renderiza tamanho md', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} size="md">
        <div>Medium Modal</div>
      </Modal>
    )
    const modal = screen.getByText('Medium Modal').closest('div')
    expect(modal).toHaveClass('max-w-lg')
  })

  test('renderiza tamanho lg', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} size="lg">
        <div>Large Modal</div>
      </Modal>
    )
    const modal = screen.getByText('Large Modal').closest('div')
    expect(modal).toHaveClass('max-w-2xl')
  })

  test('renderiza tamanho xl', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} size="xl">
        <div>Extra Large Modal</div>
      </Modal>
    )
    const modal = screen.getByText('Extra Large Modal').closest('div')
    expect(modal).toHaveClass('max-w-4xl')
  })

  test('renderiza tamanho full', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} size="full">
        <div>Full Modal</div>
      </Modal>
    )
    const modal = screen.getByText('Full Modal').closest('div')
    expect(modal).toHaveClass('max-w-full', 'mx-4')
  })

  // Testes de variantes
  test('renderiza variante default', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} variant="default">
        <div>Default Modal</div>
      </Modal>
    )
    const modal = screen.getByText('Default Modal').closest('div')
    expect(modal).toHaveClass('bg-white')
  })

  test('renderiza variante dark', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} variant="dark">
        <div>Dark Modal</div>
      </Modal>
    )
    const modal = screen.getByText('Dark Modal').closest('div')
    expect(modal).toHaveClass('bg-neutral-900', 'text-white')
  })

  test('renderiza variante glass', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} variant="glass">
        <div>Glass Modal</div>
      </Modal>
    )
    const modal = screen.getByText('Glass Modal').closest('div')
    expect(modal).toHaveClass('bg-white/80', 'backdrop-blur-sm')
  })

  test('renderiza variante gradient', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} variant="gradient">
        <div>Gradient Modal</div>
      </Modal>
    )
    const modal = screen.getByText('Gradient Modal').closest('div')
    expect(modal).toHaveClass('bg-gradient-to-br', 'from-primary-50', 'to-secondary-50')
  })

  // Testes de interação
  test('chama onClose quando clica no overlay', () => {
    const handleClose = jest.fn()
    render(
      <Modal isOpen={true} onClose={handleClose} closeOnOverlayClick={true}>
        <div>Modal</div>
      </Modal>
    )
    
    const overlay = screen.getByText('Modal').closest('div').parentElement
    fireEvent.click(overlay)
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  test('não chama onClose quando clica no modal', () => {
    const handleClose = jest.fn()
    render(
      <Modal isOpen={true} onClose={handleClose} closeOnOverlayClick={true}>
        <div>Modal</div>
      </Modal>
    )
    
    const modal = screen.getByText('Modal').closest('div')
    fireEvent.click(modal)
    expect(handleClose).not.toHaveBeenCalled()
  })

  test('chama onClose quando pressiona Escape', () => {
    const handleClose = jest.fn()
    render(
      <Modal isOpen={true} onClose={handleClose} closeOnEscape={true}>
        <div>Modal</div>
      </Modal>
    )
    
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  test('não chama onClose quando closeOnEscape é false', () => {
    const handleClose = jest.fn()
    render(
      <Modal isOpen={true} onClose={handleClose} closeOnEscape={false}>
        <div>Modal</div>
      </Modal>
    )
    
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(handleClose).not.toHaveBeenCalled()
  })

  // Testes de botão de fechar
  test('renderiza botão de fechar por padrão', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()}>
        <div>Modal</div>
      </Modal>
    )
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  test('não renderiza botão de fechar quando showCloseButton é false', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} showCloseButton={false}>
        <div>Modal</div>
      </Modal>
    )
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  test('chama onClose quando clica no botão de fechar', () => {
    const handleClose = jest.fn()
    render(
      <Modal isOpen={true} onClose={handleClose}>
        <div>Modal</div>
      </Modal>
    )
    
    const closeButton = screen.getByRole('button')
    fireEvent.click(closeButton)
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  // Testes de subcomponentes
  test('ModalHeader renderiza corretamente', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()}>
        <ModalHeader>Header</ModalHeader>
      </Modal>
    )
    expect(screen.getByText('Header')).toBeInTheDocument()
  })

  test('ModalTitle renderiza corretamente', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()}>
        <ModalHeader>
          <ModalTitle>Título</ModalTitle>
        </ModalHeader>
      </Modal>
    )
    expect(screen.getByText('Título')).toBeInTheDocument()
  })

  test('ModalDescription renderiza corretamente', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()}>
        <ModalHeader>
          <ModalDescription>Descrição</ModalDescription>
        </ModalHeader>
      </Modal>
    )
    expect(screen.getByText('Descrição')).toBeInTheDocument()
  })

  test('ModalContent renderiza corretamente', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()}>
        <ModalContent>Conteúdo</ModalContent>
      </Modal>
    )
    expect(screen.getByText('Conteúdo')).toBeInTheDocument()
  })

  test('ModalFooter renderiza corretamente', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()}>
        <ModalFooter>Rodapé</ModalFooter>
      </Modal>
    )
    expect(screen.getByText('Rodapé')).toBeInTheDocument()
  })

  // Testes de classes CSS
  test('aplica classes customizadas', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} className="custom-class">
        <div>Custom Modal</div>
      </Modal>
    )
    const modal = screen.getByText('Custom Modal').closest('div')
    expect(modal).toHaveClass('custom-class')
  })

  test('aplica classes base corretas', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()}>
        <div>Base Modal</div>
      </Modal>
    )
    const modal = screen.getByText('Base Modal').closest('div')
    expect(modal).toHaveClass('relative', 'w-full', 'rounded-lg', 'shadow-xl')
  })

  // Testes de props
  test('aceita props adicionais', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} data-testid="custom-modal" aria-label="Modal customizado">
        <div>Custom Modal</div>
      </Modal>
    )
    
    const modal = screen.getByTestId('custom-modal')
    expect(modal).toHaveAttribute('aria-label', 'Modal customizado')
  })

  // Testes de hook useModal
  test('useModal retorna valores corretos', () => {
    const TestComponent = () => {
      const { isOpen, open, close, toggle } = useModal()
      
      return (
        <div>
          <span data-testid="isOpen">{isOpen.toString()}</span>
          <button onClick={open}>Open</button>
          <button onClick={close}>Close</button>
          <button onClick={toggle}>Toggle</button>
        </div>
      )
    }
    
    render(<TestComponent />)
    
    expect(screen.getByTestId('isOpen')).toHaveTextContent('false')
    
    fireEvent.click(screen.getByText('Open'))
    expect(screen.getByTestId('isOpen')).toHaveTextContent('true')
    
    fireEvent.click(screen.getByText('Close'))
    expect(screen.getByTestId('isOpen')).toHaveTextContent('false')
    
    fireEvent.click(screen.getByText('Toggle'))
    expect(screen.getByTestId('isOpen')).toHaveTextContent('true')
  })

  // Testes de acessibilidade
  test('tem role correto', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()}>
        <div>Modal</div>
      </Modal>
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  test('é focado quando aberto', async () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()}>
        <div>Modal</div>
      </Modal>
    )
    
    await waitFor(() => {
      const modal = screen.getByText('Modal').closest('div')
      expect(modal).toHaveFocus()
    })
  })

  // Testes de variantes específicas
  test('variante default tem classes corretas', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} variant="default">
        <div>Default Modal</div>
      </Modal>
    )
    const modal = screen.getByText('Default Modal').closest('div')
    expect(modal).toHaveClass('bg-white')
  })

  test('variante dark tem classes corretas', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} variant="dark">
        <div>Dark Modal</div>
      </Modal>
    )
    const modal = screen.getByText('Dark Modal').closest('div')
    expect(modal).toHaveClass('bg-neutral-900', 'text-white')
  })

  test('variante glass tem classes corretas', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} variant="glass">
        <div>Glass Modal</div>
      </Modal>
    )
    const modal = screen.getByText('Glass Modal').closest('div')
    expect(modal).toHaveClass('bg-white/80', 'backdrop-blur-sm')
  })

  test('variante gradient tem classes corretas', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} variant="gradient">
        <div>Gradient Modal</div>
      </Modal>
    )
    const modal = screen.getByText('Gradient Modal').closest('div')
    expect(modal).toHaveClass('bg-gradient-to-br', 'from-primary-50', 'to-secondary-50')
  })

  // Testes de tamanhos específicos
  test('tamanho sm tem classes corretas', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} size="sm">
        <div>Small Modal</div>
      </Modal>
    )
    const modal = screen.getByText('Small Modal').closest('div')
    expect(modal).toHaveClass('max-w-md')
  })

  test('tamanho md tem classes corretas', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} size="md">
        <div>Medium Modal</div>
      </Modal>
    )
    const modal = screen.getByText('Medium Modal').closest('div')
    expect(modal).toHaveClass('max-w-lg')
  })

  test('tamanho lg tem classes corretas', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} size="lg">
        <div>Large Modal</div>
      </Modal>
    )
    const modal = screen.getByText('Large Modal').closest('div')
    expect(modal).toHaveClass('max-w-2xl')
  })

  test('tamanho xl tem classes corretas', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} size="xl">
        <div>Extra Large Modal</div>
      </Modal>
    )
    const modal = screen.getByText('Extra Large Modal').closest('div')
    expect(modal).toHaveClass('max-w-4xl')
  })

  test('tamanho full tem classes corretas', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} size="full">
        <div>Full Modal</div>
      </Modal>
    )
    const modal = screen.getByText('Full Modal').closest('div')
    expect(modal).toHaveClass('max-w-full', 'mx-4')
  })

  // Testes de subcomponentes específicos
  test('ModalHeader tem classes corretas', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()}>
        <ModalHeader>Header</ModalHeader>
      </Modal>
    )
    const header = screen.getByText('Header')
    expect(header).toHaveClass('flex', 'items-center', 'justify-between', 'p-6', 'border-b', 'border-neutral-200')
  })

  test('ModalTitle tem classes corretas', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()}>
        <ModalHeader>
          <ModalTitle>Título</ModalTitle>
        </ModalHeader>
      </Modal>
    )
    const title = screen.getByText('Título')
    expect(title).toHaveClass('text-xl', 'font-semibold', 'text-neutral-900')
  })

  test('ModalDescription tem classes corretas', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()}>
        <ModalHeader>
          <ModalDescription>Descrição</ModalDescription>
        </ModalHeader>
      </Modal>
    )
    const description = screen.getByText('Descrição')
    expect(description).toHaveClass('mt-1', 'text-sm', 'text-neutral-500')
  })

  test('ModalContent tem classes corretas', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()}>
        <ModalContent>Conteúdo</ModalContent>
      </Modal>
    )
    const content = screen.getByText('Conteúdo')
    expect(content).toHaveClass('p-6')
  })

  test('ModalFooter tem classes corretas', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()}>
        <ModalFooter>Rodapé</ModalFooter>
      </Modal>
    )
    const footer = screen.getByText('Rodapé')
    expect(footer).toHaveClass('flex', 'items-center', 'justify-end', 'gap-3', 'p-6', 'border-t', 'border-neutral-200')
  })
})
