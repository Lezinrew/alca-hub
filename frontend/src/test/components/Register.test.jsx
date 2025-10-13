// Testes do componente Register - Alça Hub
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import App from '../../App'
import axios from 'axios'

// Mock do axios
vi.mock('axios')
const mockedAxios = axios

// Mock do useToast
const mockToast = vi.fn()
vi.mock('../../hooks/useToast', () => ({
  useToast: () => mockToast
}))

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockToast.mockClear()
  })

  test('renderiza formulário de cadastro corretamente', () => {
    renderWithProviders(<App />)
    
    // Navegar para página de cadastro
    const cadastroLink = screen.getByText(/cadastre-se/i)
    fireEvent.click(cadastroLink)
    
    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/cpf/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/telefone/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/endereço/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirmar senha/i)).toBeInTheDocument()
    expect(screen.getByText(/aceito os termos de uso/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /criar conta/i })).toBeInTheDocument()
  })

  test('valida campos obrigatórios', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)
    
    const cadastroLink = screen.getByText(/cadastre-se/i)
    await user.click(cadastroLink)
    
    const submitButton = screen.getByRole('button', { name: /criar conta/i })
    await user.click(submitButton)
    
    expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument()
    expect(screen.getByText(/e-mail é obrigatório/i)).toBeInTheDocument()
    expect(screen.getByText(/cpf é obrigatório/i)).toBeInTheDocument()
    expect(screen.getByText(/telefone é obrigatório/i)).toBeInTheDocument()
    expect(screen.getByText(/endereço é obrigatório/i)).toBeInTheDocument()
    expect(screen.getByText(/senha é obrigatória/i)).toBeInTheDocument()
  })

  test('valida formato de email', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)
    
    const cadastroLink = screen.getByText(/cadastre-se/i)
    await user.click(cadastroLink)
    
    const emailInput = screen.getByLabelText(/e-mail/i)
    await user.type(emailInput, 'email_invalido')
    await user.tab()
    
    expect(screen.getByText(/formato de e-mail inválido/i)).toBeInTheDocument()
  })

  test('valida força da senha', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)
    
    const cadastroLink = screen.getByText(/cadastre-se/i)
    await user.click(cadastroLink)
    
    const passwordInput = screen.getByLabelText(/senha/i)
    const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i)
    const submitButton = screen.getByRole('button', { name: /criar conta/i })
    
    // Preencher outros campos obrigatórios
    await user.type(screen.getByLabelText(/nome completo/i), 'João Silva')
    await user.type(screen.getByLabelText(/e-mail/i), 'joao@exemplo.com')
    await user.type(screen.getByLabelText(/cpf/i), '12345678901')
    await user.type(screen.getByLabelText(/telefone/i), '11999999999')
    await user.type(screen.getByLabelText(/endereço/i), 'Rua Teste, 123')
    await user.type(screen.getByLabelText(/tipo/i), 'morador')
    
    // Senha fraca
    await user.type(passwordInput, '123')
    await user.type(confirmPasswordInput, '123')
    await user.click(screen.getByLabelText(/aceito os termos de uso/i))
    await user.click(submitButton)
    
    expect(mockToast).toHaveBeenCalledWith({
      variant: 'destructive',
      title: 'Senha fraca',
      description: 'A senha deve ter no mínimo 8 caracteres, incluir ao menos 1 número e 1 símbolo.'
    })
  })

  test('valida confirmação de senha', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)
    
    const cadastroLink = screen.getByText(/cadastre-se/i)
    await user.click(cadastroLink)
    
    const passwordInput = screen.getByLabelText(/senha/i)
    const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i)
    const submitButton = screen.getByRole('button', { name: /criar conta/i })
    
    // Preencher outros campos obrigatórios
    await user.type(screen.getByLabelText(/nome completo/i), 'João Silva')
    await user.type(screen.getByLabelText(/e-mail/i), 'joao@exemplo.com')
    await user.type(screen.getByLabelText(/cpf/i), '12345678901')
    await user.type(screen.getByLabelText(/telefone/i), '11999999999')
    await user.type(screen.getByLabelText(/endereço/i), 'Rua Teste, 123')
    await user.type(screen.getByLabelText(/tipo/i), 'morador')
    
    // Senhas diferentes
    await user.type(passwordInput, 'senha123456!')
    await user.type(confirmPasswordInput, 'senha_diferente')
    await user.click(screen.getByLabelText(/aceito os termos de uso/i))
    await user.click(submitButton)
    
    expect(screen.getByText(/senhas não coincidem/i)).toBeInTheDocument()
  })

  test('valida aceite dos termos de uso', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)
    
    const cadastroLink = screen.getByText(/cadastre-se/i)
    await user.click(cadastroLink)
    
    const submitButton = screen.getByRole('button', { name: /criar conta/i })
    
    // Preencher todos os campos sem aceitar termos
    await user.type(screen.getByLabelText(/nome completo/i), 'João Silva')
    await user.type(screen.getByLabelText(/e-mail/i), 'joao@exemplo.com')
    await user.type(screen.getByLabelText(/cpf/i), '12345678901')
    await user.type(screen.getByLabelText(/telefone/i), '11999999999')
    await user.type(screen.getByLabelText(/endereço/i), 'Rua Teste, 123')
    await user.type(screen.getByLabelText(/tipo/i), 'morador')
    await user.type(screen.getByLabelText(/senha/i), 'senha123456!')
    await user.type(screen.getByLabelText(/confirmar senha/i), 'senha123456!')
    
    await user.click(submitButton)
    
    expect(mockToast).toHaveBeenCalledWith({
      variant: 'destructive',
      title: 'Erro no cadastro',
      description: 'Você precisa aceitar os Termos de Uso para criar sua conta.'
    })
  })

  test('cadastra usuário com sucesso', async () => {
    const user = userEvent.setup()
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        message: 'Usuário criado com sucesso',
        user: {
          id: '123',
          email: 'joao@exemplo.com',
          nome: 'João Silva',
          tipo: 'morador'
        }
      }
    })

    renderWithProviders(<App />)
    
    const cadastroLink = screen.getByText(/cadastre-se/i)
    await user.click(cadastroLink)
    
    // Preencher formulário
    await user.type(screen.getByLabelText(/nome completo/i), 'João Silva')
    await user.type(screen.getByLabelText(/e-mail/i), 'joao@exemplo.com')
    await user.type(screen.getByLabelText(/cpf/i), '12345678901')
    await user.type(screen.getByLabelText(/telefone/i), '11999999999')
    await user.type(screen.getByLabelText(/endereço/i), 'Rua Teste, 123')
    await user.type(screen.getByLabelText(/tipo/i), 'morador')
    await user.type(screen.getByLabelText(/senha/i), 'senha123456!')
    await user.type(screen.getByLabelText(/confirmar senha/i), 'senha123456!')
    await user.click(screen.getByLabelText(/aceito os termos de uso/i))
    
    const submitButton = screen.getByRole('button', { name: /criar conta/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/register',
        expect.objectContaining({
          nome: 'João Silva',
          email: 'joao@exemplo.com',
          cpf: '12345678901',
          telefone: '11999999999',
          endereco: 'Rua Teste, 123',
          tipos: ['morador'],
          senha: 'senha123456!',
          aceitou_termos: true
        })
      )
    })
  })

  test('trata erro de email duplicado', async () => {
    const user = userEvent.setup()
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        status: 400,
        data: { detail: 'Email já cadastrado' }
      }
    })

    renderWithProviders(<App />)
    
    const cadastroLink = screen.getByText(/cadastre-se/i)
    await user.click(cadastroLink)
    
    // Preencher formulário com email duplicado
    await user.type(screen.getByLabelText(/nome completo/i), 'João Silva')
    await user.type(screen.getByLabelText(/e-mail/i), 'duplicado@exemplo.com')
    await user.type(screen.getByLabelText(/cpf/i), '12345678901')
    await user.type(screen.getByLabelText(/telefone/i), '11999999999')
    await user.type(screen.getByLabelText(/endereço/i), 'Rua Teste, 123')
    await user.type(screen.getByLabelText(/tipo/i), 'morador')
    await user.type(screen.getByLabelText(/senha/i), 'senha123456!')
    await user.type(screen.getByLabelText(/confirmar senha/i), 'senha123456!')
    await user.click(screen.getByLabelText(/aceito os termos de uso/i))
    
    const submitButton = screen.getByRole('button', { name: /criar conta/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Erro no cadastro',
        description: 'Email já cadastrado'
      })
    })
  })

  test('mostra modal de termos de uso', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)
    
    const cadastroLink = screen.getByText(/cadastre-se/i)
    await user.click(cadastroLink)
    
    const termosLink = screen.getByText(/termos de uso/i)
    await user.click(termosLink)
    
    expect(screen.getByText(/termos e condições/i)).toBeInTheDocument()
    expect(screen.getByText(/armazenamento de informações bancárias/i)).toBeInTheDocument()
    expect(screen.getByText(/geolocalização/i)).toBeInTheDocument()
    expect(screen.getByText(/maior idade penal/i)).toBeInTheDocument()
  })

  test('fecha modal de termos de uso', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)
    
    const cadastroLink = screen.getByText(/cadastre-se/i)
    await user.click(cadastroLink)
    
    const termosLink = screen.getByText(/termos de uso/i)
    await user.click(termosLink)
    
    const closeButton = screen.getByRole('button', { name: /fechar/i })
    await user.click(closeButton)
    
    expect(screen.queryByText(/termos e condições/i)).not.toBeInTheDocument()
  })

  test('mostra estado de carregamento durante cadastro', async () => {
    const user = userEvent.setup()
    mockedAxios.post.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)))

    renderWithProviders(<App />)
    
    const cadastroLink = screen.getByText(/cadastre-se/i)
    await user.click(cadastroLink)
    
    // Preencher formulário
    await user.type(screen.getByLabelText(/nome completo/i), 'João Silva')
    await user.type(screen.getByLabelText(/e-mail/i), 'joao@exemplo.com')
    await user.type(screen.getByLabelText(/cpf/i), '12345678901')
    await user.type(screen.getByLabelText(/telefone/i), '11999999999')
    await user.type(screen.getByLabelText(/endereço/i), 'Rua Teste, 123')
    await user.type(screen.getByLabelText(/tipo/i), 'morador')
    await user.type(screen.getByLabelText(/senha/i), 'senha123456!')
    await user.type(screen.getByLabelText(/confirmar senha/i), 'senha123456!')
    await user.click(screen.getByLabelText(/aceito os termos de uso/i))
    
    const submitButton = screen.getByRole('button', { name: /criar conta/i })
    await user.click(submitButton)
    
    expect(screen.getByRole('button', { name: /criando conta/i })).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })
})
