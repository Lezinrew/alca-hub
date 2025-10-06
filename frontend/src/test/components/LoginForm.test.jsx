// Testes do componente LoginForm - Alça Hub
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import LoginForm from '../../components/LoginForm'
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

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockToast.mockClear()
  })

  test('renderiza formulário de login corretamente', () => {
    renderWithProviders(<LoginForm />)
    
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
    expect(screen.getByText(/esqueceu a senha/i)).toBeInTheDocument()
    expect(screen.getByText(/cadastre-se/i)).toBeInTheDocument()
  })

  test('valida formato de email em tempo real', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/e-mail/i)
    
    // Email inválido
    await user.type(emailInput, 'email_invalido')
    await user.tab()
    
    expect(screen.getByText(/formato de e-mail inválido/i)).toBeInTheDocument()
    
    // Email válido
    await user.clear(emailInput)
    await user.type(emailInput, 'teste@exemplo.com')
    await user.tab()
    
    expect(screen.queryByText(/formato de e-mail inválido/i)).not.toBeInTheDocument()
  })

  test('mostra sugestões de domínio para email', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/e-mail/i)
    
    await user.type(emailInput, 'teste@')
    await user.tab()
    
    expect(screen.getByText(/teste@gmail.com/i)).toBeInTheDocument()
    expect(screen.getByText(/teste@hotmail.com/i)).toBeInTheDocument()
  })

  test('submete formulário com dados válidos', async () => {
    const user = userEvent.setup()
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        access_token: 'mock_token_123',
        user: {
          id: '123',
          email: 'teste@exemplo.com',
          nome: 'Usuário Teste',
          tipo: 'morador'
        }
      }
    })

    renderWithProviders(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/e-mail/i)
    const passwordInput = screen.getByLabelText(/senha/i)
    const submitButton = screen.getByRole('button', { name: /entrar/i })
    
    await user.type(emailInput, 'teste@exemplo.com')
    await user.type(passwordInput, 'senha123456')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/login',
        {
          email: 'teste@exemplo.com',
          senha: 'senha123456'
        }
      )
    })
  })

  test('trata erro de credenciais inválidas', async () => {
    const user = userEvent.setup()
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        status: 401,
        data: { detail: 'Email ou senha incorretos' }
      }
    })

    renderWithProviders(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/e-mail/i)
    const passwordInput = screen.getByLabelText(/senha/i)
    const submitButton = screen.getByRole('button', { name: /entrar/i })
    
    await user.type(emailInput, 'teste@exemplo.com')
    await user.type(passwordInput, 'senha_errada')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Erro no login',
        description: 'Email ou senha incorretos'
      })
    })
  })

  test('trata erro de rate limiting', async () => {
    const user = userEvent.setup()
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        status: 429,
        data: { detail: 'Muitas tentativas de login. Tente novamente em 5 minutos.' }
      }
    })

    renderWithProviders(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/e-mail/i)
    const passwordInput = screen.getByLabelText(/senha/i)
    const submitButton = screen.getByRole('button', { name: /entrar/i })
    
    await user.type(emailInput, 'rate_limited@exemplo.com')
    await user.type(passwordInput, 'senha123456')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Muitas tentativas',
        description: 'Muitas tentativas de login. Tente novamente em 5 minutos.'
      })
    })
  })

  test('mostra estado de carregamento durante login', async () => {
    const user = userEvent.setup()
    mockedAxios.post.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)))

    renderWithProviders(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/e-mail/i)
    const passwordInput = screen.getByLabelText(/senha/i)
    const submitButton = screen.getByRole('button', { name: /entrar/i })
    
    await user.type(emailInput, 'teste@exemplo.com')
    await user.type(passwordInput, 'senha123456')
    await user.click(submitButton)
    
    expect(screen.getByRole('button', { name: /carregando/i })).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  test('valida campos obrigatórios', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginForm />)
    
    const submitButton = screen.getByRole('button', { name: /entrar/i })
    await user.click(submitButton)
    
    expect(screen.getByText(/e-mail é obrigatório/i)).toBeInTheDocument()
    expect(screen.getByText(/senha é obrigatória/i)).toBeInTheDocument()
  })

  test('navega para página de cadastro', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginForm />)
    
    const cadastroLink = screen.getByText(/cadastre-se/i)
    await user.click(cadastroLink)
    
    // Verificar se a navegação foi chamada (mock do useNavigate)
    expect(cadastroLink.closest('a')).toHaveAttribute('href', '/register')
  })

  test('navega para página de recuperação de senha', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginForm />)
    
    const forgotPasswordLink = screen.getByText(/esqueceu a senha/i)
    await user.click(forgotPasswordLink)
    
    expect(forgotPasswordLink.closest('a')).toHaveAttribute('href', '/forgot-password')
  })

  test('alterna visibilidade da senha', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginForm />)
    
    const passwordInput = screen.getByLabelText(/senha/i)
    const toggleButton = screen.getByRole('button', { name: /mostrar senha/i })
    
    expect(passwordInput).toHaveAttribute('type', 'password')
    
    await user.click(toggleButton)
    
    expect(passwordInput).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: /ocultar senha/i })).toBeInTheDocument()
  })

  test('limpa formulário após login bem-sucedido', async () => {
    const user = userEvent.setup()
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        access_token: 'mock_token_123',
        user: {
          id: '123',
          email: 'teste@exemplo.com',
          nome: 'Usuário Teste',
          tipo: 'morador'
        }
      }
    })

    renderWithProviders(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/e-mail/i)
    const passwordInput = screen.getByLabelText(/senha/i)
    const submitButton = screen.getByRole('button', { name: /entrar/i })
    
    await user.type(emailInput, 'teste@exemplo.com')
    await user.type(passwordInput, 'senha123456')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(emailInput).toHaveValue('')
      expect(passwordInput).toHaveValue('')
    })
  })
})
