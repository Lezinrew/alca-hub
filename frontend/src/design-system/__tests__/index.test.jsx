// Testes de Integração do Design System - Alça Hub
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { 
  Button, 
  Input, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalContent,
  ModalFooter,
  useModal
} from '../components'

describe('Design System Integration', () => {
  // Testes de integração entre componentes
  test('Button e Input funcionam juntos', () => {
    const handleSubmit = jest.fn()
    
    render(
      <div>
        <Input label="Nome" placeholder="Digite seu nome" />
        <Button onClick={handleSubmit}>Enviar</Button>
      </div>
    )
    
    const input = screen.getByRole('textbox')
    const button = screen.getByRole('button')
    
    fireEvent.change(input, { target: { value: 'João' } })
    fireEvent.click(button)
    
    expect(handleSubmit).toHaveBeenCalled()
  })

  test('Card com Modal funcionam juntos', () => {
    const TestComponent = () => {
      const { isOpen, open, close } = useModal()
      
      return (
        <div>
          <Card clickable onClick={open}>
            <CardHeader>
              <CardTitle>Clique para abrir modal</CardTitle>
            </CardHeader>
          </Card>
          
          <Modal isOpen={isOpen} onClose={close}>
            <ModalHeader>
              <ModalTitle>Modal Aberto</ModalTitle>
            </ModalHeader>
            <ModalContent>
              <p>Conteúdo do modal</p>
            </ModalContent>
            <ModalFooter>
              <Button onClick={close}>Fechar</Button>
            </ModalFooter>
          </Modal>
        </div>
      )
    }
    
    render(<TestComponent />)
    
    // Clica no card para abrir modal
    fireEvent.click(screen.getByText('Clique para abrir modal'))
    
    // Verifica se modal foi aberto
    expect(screen.getByText('Modal Aberto')).toBeInTheDocument()
    expect(screen.getByText('Conteúdo do modal')).toBeInTheDocument()
    
    // Clica no botão para fechar modal
    fireEvent.click(screen.getByText('Fechar'))
    
    // Verifica se modal foi fechado
    expect(screen.queryByText('Modal Aberto')).not.toBeInTheDocument()
  })

  test('Input com validação e Button funcionam juntos', () => {
    const TestComponent = () => {
      const [value, setValue] = React.useState('')
      const [error, setError] = React.useState('')
      
      const handleSubmit = () => {
        if (!value) {
          setError('Campo obrigatório')
        } else {
          setError('')
        }
      }
      
      return (
        <div>
          <Input
            label="Email"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            error={error}
            placeholder="Digite seu email"
          />
          <Button onClick={handleSubmit}>Validar</Button>
        </div>
      )
    }
    
    render(<TestComponent />)
    
    const input = screen.getByRole('textbox')
    const button = screen.getByRole('button')
    
    // Tenta enviar sem valor
    fireEvent.click(button)
    expect(screen.getByText('Campo obrigatório')).toBeInTheDocument()
    
    // Digita valor e envia
    fireEvent.change(input, { target: { value: 'teste@email.com' } })
    fireEvent.click(button)
    expect(screen.queryByText('Campo obrigatório')).not.toBeInTheDocument()
  })

  test('Card com Input e Button funcionam juntos', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Formulário</CardTitle>
          <CardDescription>Preencha os campos abaixo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input label="Nome" placeholder="Digite seu nome" />
            <Input label="Email" placeholder="Digite seu email" />
          </div>
        </CardContent>
        <CardFooter>
          <Button>Enviar</Button>
        </CardFooter>
      </Card>
    )
    
    expect(screen.getByText('Formulário')).toBeInTheDocument()
    expect(screen.getByText('Preencha os campos abaixo')).toBeInTheDocument()
    expect(screen.getByLabelText('Nome')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  test('Modal com formulário completo funciona', () => {
    const TestComponent = () => {
      const { isOpen, open, close } = useModal()
      const [formData, setFormData] = React.useState({ name: '', email: '' })
      
      const handleSubmit = (e) => {
        e.preventDefault()
        console.log('Formulário enviado:', formData)
        close()
      }
      
      return (
        <div>
          <Button onClick={open}>Abrir Formulário</Button>
          
          <Modal isOpen={isOpen} onClose={close} title="Formulário de Contato">
            <form onSubmit={handleSubmit}>
              <ModalContent>
                <div className="space-y-4">
                  <Input
                    label="Nome"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Digite seu nome"
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Digite seu email"
                  />
                </div>
              </ModalContent>
              <ModalFooter>
                <Button type="button" variant="outline" onClick={close}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Enviar
                </Button>
              </ModalFooter>
            </form>
          </Modal>
        </div>
      )
    }
    
    render(<TestComponent />)
    
    // Abre modal
    fireEvent.click(screen.getByText('Abrir Formulário'))
    
    // Verifica se modal foi aberto
    expect(screen.getByText('Formulário de Contato')).toBeInTheDocument()
    expect(screen.getByLabelText('Nome')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    
    // Preenche formulário
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'João' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'joao@email.com' } })
    
    // Envia formulário
    fireEvent.click(screen.getByText('Enviar'))
    
    // Verifica se modal foi fechado
    expect(screen.queryByText('Formulário de Contato')).not.toBeInTheDocument()
  })

  test('Componentes mantêm consistência visual', () => {
    render(
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Título do Card</CardTitle>
            <CardDescription>Descrição do card</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input label="Campo 1" placeholder="Digite algo" />
              <Input label="Campo 2" placeholder="Digite algo mais" />
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="primary">Ação Principal</Button>
            <Button variant="outline">Ação Secundária</Button>
          </CardFooter>
        </Card>
      </div>
    )
    
    // Verifica se todos os componentes estão presentes
    expect(screen.getByText('Título do Card')).toBeInTheDocument()
    expect(screen.getByText('Descrição do card')).toBeInTheDocument()
    expect(screen.getByLabelText('Campo 1')).toBeInTheDocument()
    expect(screen.getByLabelText('Campo 2')).toBeInTheDocument()
    expect(screen.getByText('Ação Principal')).toBeInTheDocument()
    expect(screen.getByText('Ação Secundária')).toBeInTheDocument()
  })

  test('Componentes respondem a eventos corretamente', () => {
    const handleCardClick = jest.fn()
    const handleButtonClick = jest.fn()
    const handleInputChange = jest.fn()
    
    render(
      <Card clickable onClick={handleCardClick}>
        <CardContent>
          <Input onChange={handleInputChange} placeholder="Digite algo" />
          <Button onClick={handleButtonClick}>Clique aqui</Button>
        </CardContent>
      </Card>
    )
    
    // Clica no card
    fireEvent.click(screen.getByText('Clique aqui').closest('div').parentElement)
    expect(handleCardClick).toHaveBeenCalled()
    
    // Clica no botão
    fireEvent.click(screen.getByText('Clique aqui'))
    expect(handleButtonClick).toHaveBeenCalled()
    
    // Digita no input
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'teste' } })
    expect(handleInputChange).toHaveBeenCalled()
  })

  test('Componentes mantêm acessibilidade', () => {
    render(
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Título Acessível</CardTitle>
          </CardHeader>
          <CardContent>
            <Input label="Campo Acessível" placeholder="Digite algo" />
          </CardContent>
          <CardFooter>
            <Button aria-label="Botão acessível">Ação</Button>
          </CardFooter>
        </Card>
      </div>
    )
    
    // Verifica se elementos têm roles corretos
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    
    // Verifica se labels estão associados
    expect(screen.getByLabelText('Campo Acessível')).toBeInTheDocument()
    
    // Verifica se botão tem aria-label
    expect(screen.getByLabelText('Botão acessível')).toBeInTheDocument()
  })

  test('Componentes funcionam com diferentes tamanhos', () => {
    render(
      <div className="space-y-4">
        <Card size="sm">
          <CardContent>
            <Input size="sm" placeholder="Small" />
            <Button size="sm">Small</Button>
          </CardContent>
        </Card>
        
        <Card size="md">
          <CardContent>
            <Input size="md" placeholder="Medium" />
            <Button size="md">Medium</Button>
          </CardContent>
        </Card>
        
        <Card size="lg">
          <CardContent>
            <Input size="lg" placeholder="Large" />
            <Button size="lg">Large</Button>
          </CardContent>
        </Card>
      </div>
    )
    
    // Verifica se todos os tamanhos estão presentes
    expect(screen.getByPlaceholderText('Small')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Medium')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Large')).toBeInTheDocument()
    expect(screen.getByText('Small')).toBeInTheDocument()
    expect(screen.getByText('Medium')).toBeInTheDocument()
    expect(screen.getByText('Large')).toBeInTheDocument()
  })

  test('Componentes funcionam com diferentes variantes', () => {
    render(
      <div className="space-y-4">
        <Card variant="default">
          <CardContent>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
          </CardContent>
        </Card>
        
        <Card variant="elevated">
          <CardContent>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
          </CardContent>
        </Card>
      </div>
    )
    
    // Verifica se todas as variantes estão presentes
    expect(screen.getByText('Primary')).toBeInTheDocument()
    expect(screen.getByText('Secondary')).toBeInTheDocument()
    expect(screen.getByText('Outline')).toBeInTheDocument()
    expect(screen.getByText('Ghost')).toBeInTheDocument()
  })
})
