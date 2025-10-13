// Testes dos componentes de recuperação de senha - Alça Hub
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

describe('Password Recovery Components', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockToast.mockClear()
  })

  describe('ForgotPassword Component', () => {
    test('renderiza formulário de recuperação de senha', () => {
      renderWithProviders(<App />)
      
      // Navegar para página de recuperação
      const forgotPasswordLink = screen.getByText(/esqueceu a senha/i)
      fireEvent.click(forgotPasswordLink)
      
      expect(screen.getByText(/recuperar senha/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /enviar código/i })).toBeInTheDocument()
      expect(screen.getByText(/voltar ao login/i)).toBeInTheDocument()
    })

    test('valida campo de email obrigatório', async () => {
      const user = userEvent.setup()
      renderWithProviders(<App />)
      
      const forgotPasswordLink = screen.getByText(/esqueceu a senha/i)
      await user.click(forgotPasswordLink)
      
      const submitButton = screen.getByRole('button', { name: /enviar código/i })
      await user.click(submitButton)
      
      expect(screen.getByText(/e-mail é obrigatório/i)).toBeInTheDocument()
    })

    test('valida formato de email', async () => {
      const user = userEvent.setup()
      renderWithProviders(<App />)
      
      const forgotPasswordLink = screen.getByText(/esqueceu a senha/i)
      await user.click(forgotPasswordLink)
      
      const emailInput = screen.getByLabelText(/e-mail/i)
      await user.type(emailInput, 'email_invalido')
      await user.tab()
      
      expect(screen.getByText(/formato de e-mail inválido/i)).toBeInTheDocument()
    })

    test('envia solicitação de recuperação com sucesso', async () => {
      const user = userEvent.setup()
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          message: 'Código enviado para seu email'
        }
      })

      renderWithProviders(<App />)
      
      const forgotPasswordLink = screen.getByText(/esqueceu a senha/i)
      await user.click(forgotPasswordLink)
      
      const emailInput = screen.getByLabelText(/e-mail/i)
      const submitButton = screen.getByRole('button', { name: /enviar código/i })
      
      await user.type(emailInput, 'teste@exemplo.com')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          'http://localhost:8000/api/auth/forgot-password',
          { email: 'teste@exemplo.com' }
        )
      })
    })

    test('trata erro de usuário não encontrado', async () => {
      const user = userEvent.setup()
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          status: 404,
          data: { detail: 'Usuário não encontrado' }
        }
      })

      renderWithProviders(<App />)
      
      const forgotPasswordLink = screen.getByText(/esqueceu a senha/i)
      await user.click(forgotPasswordLink)
      
      const emailInput = screen.getByLabelText(/e-mail/i)
      const submitButton = screen.getByRole('button', { name: /enviar código/i })
      
      await user.type(emailInput, 'inexistente@exemplo.com')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: 'Erro na recuperação',
          description: 'Usuário não encontrado'
        })
      })
    })

    test('trata erro de cooldown', async () => {
      const user = userEvent.setup()
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          status: 429,
          data: { detail: 'Você acabou de solicitar um código. Por favor, aguarde 60 segundos antes de tentar novamente!' }
        }
      })

      renderWithProviders(<App />)
      
      const forgotPasswordLink = screen.getByText(/esqueceu a senha/i)
      await user.click(forgotPasswordLink)
      
      const emailInput = screen.getByLabelText(/e-mail/i)
      const submitButton = screen.getByRole('button', { name: /enviar código/i })
      
      await user.type(emailInput, 'cooldown@exemplo.com')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: 'Aguarde um momento',
          description: 'Você acabou de solicitar um código. Por favor, aguarde 60 segundos antes de tentar novamente!'
        })
      })
    })

    test('mostra estado de carregamento', async () => {
      const user = userEvent.setup()
      mockedAxios.post.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)))

      renderWithProviders(<App />)
      
      const forgotPasswordLink = screen.getByText(/esqueceu a senha/i)
      await user.click(forgotPasswordLink)
      
      const emailInput = screen.getByLabelText(/e-mail/i)
      const submitButton = screen.getByRole('button', { name: /enviar código/i })
      
      await user.type(emailInput, 'teste@exemplo.com')
      await user.click(submitButton)
      
      expect(screen.getByRole('button', { name: /enviando/i })).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })
  })

  describe('ResetPassword Component', () => {
    test('renderiza formulário de redefinição de senha', () => {
      renderWithProviders(<App />)
      
      // Simular acesso direto à página de reset (com token na URL)
      window.history.pushState({}, '', '/reset-password?token=valid_token_123')
      
      expect(screen.getByText(/redefinir senha/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/nova senha/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/confirmar nova senha/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /redefinir senha/i })).toBeInTheDocument()
    })

    test('valida campos obrigatórios', async () => {
      const user = userEvent.setup()
      renderWithProviders(<App />)
      
      window.history.pushState({}, '', '/reset-password?token=valid_token_123')
      
      const submitButton = screen.getByRole('button', { name: /redefinir senha/i })
      await user.click(submitButton)
      
      expect(screen.getByText(/nova senha é obrigatória/i)).toBeInTheDocument()
      expect(screen.getByText(/confirmação de senha é obrigatória/i)).toBeInTheDocument()
    })

    test('valida força da nova senha', async () => {
      const user = userEvent.setup()
      renderWithProviders(<App />)
      
      window.history.pushState({}, '', '/reset-password?token=valid_token_123')
      
      const passwordInput = screen.getByLabelText(/nova senha/i)
      const confirmPasswordInput = screen.getByLabelText(/confirmar nova senha/i)
      const submitButton = screen.getByRole('button', { name: /redefinir senha/i })
      
      // Senha fraca
      await user.type(passwordInput, '123')
      await user.type(confirmPasswordInput, '123')
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
      
      window.history.pushState({}, '', '/reset-password?token=valid_token_123')
      
      const passwordInput = screen.getByLabelText(/nova senha/i)
      const confirmPasswordInput = screen.getByLabelText(/confirmar nova senha/i)
      const submitButton = screen.getByRole('button', { name: /redefinir senha/i })
      
      // Senhas diferentes
      await user.type(passwordInput, 'nova_senha123456!')
      await user.type(confirmPasswordInput, 'senha_diferente')
      await user.click(submitButton)
      
      expect(screen.getByText(/senhas não coincidem/i)).toBeInTheDocument()
    })

    test('redefine senha com sucesso', async () => {
      const user = userEvent.setup()
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          message: 'Senha redefinida com sucesso'
        }
      })

      renderWithProviders(<App />)
      
      window.history.pushState({}, '', '/reset-password?token=valid_token_123')
      
      const passwordInput = screen.getByLabelText(/nova senha/i)
      const confirmPasswordInput = screen.getByLabelText(/confirmar nova senha/i)
      const submitButton = screen.getByRole('button', { name: /redefinir senha/i })
      
      await user.type(passwordInput, 'nova_senha123456!')
      await user.type(confirmPasswordInput, 'nova_senha123456!')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          'http://localhost:8000/api/auth/reset-password',
          {
            token: 'valid_token_123',
            new_password: 'nova_senha123456!'
          }
        )
      })
    })

    test('trata erro de token inválido', async () => {
      const user = userEvent.setup()
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          status: 400,
          data: { detail: 'Token inválido ou expirado' }
        }
      })

      renderWithProviders(<App />)
      
      window.history.pushState({}, '', '/reset-password?token=invalid_token')
      
      const passwordInput = screen.getByLabelText(/nova senha/i)
      const confirmPasswordInput = screen.getByLabelText(/confirmar nova senha/i)
      const submitButton = screen.getByRole('button', { name: /redefinir senha/i })
      
      await user.type(passwordInput, 'nova_senha123456!')
      await user.type(confirmPasswordInput, 'nova_senha123456!')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: 'Erro na redefinição',
          description: 'Token inválido ou expirado'
        })
      })
    })

    test('mostra estado de carregamento', async () => {
      const user = userEvent.setup()
      mockedAxios.post.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)))

      renderWithProviders(<App />)
      
      window.history.pushState({}, '', '/reset-password?token=valid_token_123')
      
      const passwordInput = screen.getByLabelText(/nova senha/i)
      const confirmPasswordInput = screen.getByLabelText(/confirmar nova senha/i)
      const submitButton = screen.getByRole('button', { name: /redefinir senha/i })
      
      await user.type(passwordInput, 'nova_senha123456!')
      await user.type(confirmPasswordInput, 'nova_senha123456!')
      await user.click(submitButton)
      
      expect(screen.getByRole('button', { name: /redefinindo/i })).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })

    test('redireciona para login após sucesso', async () => {
      const user = userEvent.setup()
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          message: 'Senha redefinida com sucesso'
        }
      })

      renderWithProviders(<App />)
      
      window.history.pushState({}, '', '/reset-password?token=valid_token_123')
      
      const passwordInput = screen.getByLabelText(/nova senha/i)
      const confirmPasswordInput = screen.getByLabelText(/confirmar nova senha/i)
      const submitButton = screen.getByRole('button', { name: /redefinir senha/i })
      
      await user.type(passwordInput, 'nova_senha123456!')
      await user.type(confirmPasswordInput, 'nova_senha123456!')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Senha redefinida',
          description: 'Sua senha foi redefinida com sucesso. Faça login com sua nova senha.'
        })
      })
    })
  })
})
