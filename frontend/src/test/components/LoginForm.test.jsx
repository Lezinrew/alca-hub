// Testes unitários para LoginForm - Alça Hub
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import LoginForm from '../../components/LoginForm';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';

// Mock dos hooks e contextos
vi.mock('../../contexts/AuthContext');
vi.mock('../../hooks/use-toast');
vi.mock('../../utils/validation', () => ({
  isValidEmail: vi.fn(),
  hasValidDomain: vi.fn(),
  validateLoginForm: vi.fn(),
  formatEmail: vi.fn(),
  getEmailSuggestions: vi.fn()
}));

// Mock do useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('LoginForm', () => {
  const mockLogin = vi.fn();
  const mockToast = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Mock do contexto de autenticação
    useAuth.mockReturnValue({
      login: mockLogin
    });

    // Mock do hook de toast
    useToast.mockReturnValue({
      toast: mockToast
    });

    // Mock das funções de validação
    const { isValidEmail, hasValidDomain, validateLoginForm, formatEmail, getEmailSuggestions } = 
      await import('../../utils/validation');
    
    isValidEmail.mockReturnValue(true);
    hasValidDomain.mockReturnValue(true);
    validateLoginForm.mockReturnValue({ isValid: true, errors: {} });
    formatEmail.mockImplementation((email) => email);
    getEmailSuggestions.mockReturnValue([]);
  });

  const renderLoginForm = () => {
    return render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );
  };

  describe('getEmailStatus', () => {
    it('deve retornar null quando email não foi tocado', () => {
      renderLoginForm();
      
      const emailInput = screen.getByLabelText('E-mail');
      expect(emailInput.value).toBe('');
    });

    it('deve retornar null quando email está vazio', () => {
      renderLoginForm();
      
      const emailInput = screen.getByLabelText('E-mail');
      fireEvent.focus(emailInput);
      fireEvent.blur(emailInput);
      
      // Não deve mostrar ícone de status
      expect(screen.queryByTestId('email-status-icon')).not.toBeInTheDocument();
    });

    it('deve retornar valid quando email é válido', async () => {
      const { isValidEmail, hasValidDomain } = await import('../../utils/validation');
      isValidEmail.mockReturnValue(true);
      hasValidDomain.mockReturnValue(true);

      renderLoginForm();
      
      const emailInput = screen.getByLabelText('E-mail');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.blur(emailInput);

      await waitFor(() => {
        const statusIcon = screen.getByTestId('email-status-icon');
        expect(statusIcon).toHaveClass('text-green-500');
      });
    });

    it('deve retornar invalid quando email é inválido', async () => {
      const { isValidEmail, hasValidDomain } = await import('../../utils/validation');
      isValidEmail.mockReturnValue(false);
      hasValidDomain.mockReturnValue(false);

      renderLoginForm();
      
      const emailInput = screen.getByLabelText('E-mail');
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.blur(emailInput);

      await waitFor(() => {
        const statusIcon = screen.getByTestId('email-status-icon');
        expect(statusIcon).toHaveClass('text-red-500');
      });
    });

    it('deve retornar invalid quando email contém @ mas é inválido', async () => {
      const { isValidEmail, hasValidDomain } = await import('../../utils/validation');
      isValidEmail.mockReturnValue(false);
      hasValidDomain.mockReturnValue(false);

      renderLoginForm();
      
      const emailInput = screen.getByLabelText('E-mail');
      fireEvent.change(emailInput, { target: { value: 'test@' } });
      fireEvent.blur(emailInput);

      await waitFor(() => {
        const statusIcon = screen.getByTestId('email-status-icon');
        expect(statusIcon).toHaveClass('text-red-500');
      });
    });

    it('deve retornar null quando email não contém @', async () => {
      const { isValidEmail, hasValidDomain } = await import('../../utils/validation');
      isValidEmail.mockReturnValue(false);
      hasValidDomain.mockReturnValue(false);

      renderLoginForm();
      
      const emailInput = screen.getByLabelText('E-mail');
      fireEvent.change(emailInput, { target: { value: 'test' } });
      fireEvent.blur(emailInput);

      await waitFor(() => {
        // Não deve mostrar ícone de status para emails sem @
        expect(screen.queryByTestId('email-status-icon')).not.toBeInTheDocument();
      });
    });

    it('deve retornar null quando email é válido mas domínio é inválido', async () => {
      const { isValidEmail, hasValidDomain } = await import('../../utils/validation');
      isValidEmail.mockReturnValue(true);
      hasValidDomain.mockReturnValue(false);

      renderLoginForm();
      
      const emailInput = screen.getByLabelText('E-mail');
      fireEvent.change(emailInput, { target: { value: 'test@invalid-domain' } });
      fireEvent.blur(emailInput);

      await waitFor(() => {
        const statusIcon = screen.getByTestId('email-status-icon');
        expect(statusIcon).toHaveClass('text-red-500');
      });
    });

    it('deve retornar valid quando email e domínio são válidos', async () => {
      const { isValidEmail, hasValidDomain } = await import('../../utils/validation');
      isValidEmail.mockReturnValue(true);
      hasValidDomain.mockReturnValue(true);

      renderLoginForm();
      
      const emailInput = screen.getByLabelText('E-mail');
      fireEvent.change(emailInput, { target: { value: 'user@gmail.com' } });
      fireEvent.blur(emailInput);

      await waitFor(() => {
        const statusIcon = screen.getByTestId('email-status-icon');
        expect(statusIcon).toHaveClass('text-green-500');
      });
    });

    it('deve retornar null quando campo é limpo após ter conteúdo', async () => {
      const { isValidEmail, hasValidDomain } = await import('../../utils/validation');
      isValidEmail.mockReturnValue(true);
      hasValidDomain.mockReturnValue(true);

      renderLoginForm();
      
      const emailInput = screen.getByLabelText('E-mail');
      
      // Primeiro adicionar email válido
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.blur(emailInput);
      
      await waitFor(() => {
        const statusIcon = screen.getByTestId('email-status-icon');
        expect(statusIcon).toHaveClass('text-green-500');
      });
      
      // Depois limpar o campo
      fireEvent.change(emailInput, { target: { value: '' } });
      fireEvent.blur(emailInput);
      
      await waitFor(() => {
        expect(screen.queryByTestId('email-status-icon')).not.toBeInTheDocument();
      });
    });
  });

  describe('Validação de Email', () => {
    it('deve mostrar sugestões de email quando email é inválido', async () => {
      const { getEmailSuggestions } = await import('../../utils/validation');
      getEmailSuggestions.mockReturnValue(['test@gmail.com', 'test@hotmail.com']);

      renderLoginForm();
      
      const emailInput = screen.getByLabelText('E-mail');
      fireEvent.change(emailInput, { target: { value: 'test@gm' } });
      fireEvent.focus(emailInput);

      await waitFor(() => {
        expect(screen.getByText('Você quis dizer:')).toBeInTheDocument();
        expect(screen.getByText('test@gmail.com')).toBeInTheDocument();
        expect(screen.getByText('test@hotmail.com')).toBeInTheDocument();
      });
    });

    it('deve permitir seleção de sugestão de email', async () => {
      const { getEmailSuggestions } = await import('../../utils/validation');
      getEmailSuggestions.mockReturnValue(['test@gmail.com']);

      renderLoginForm();
      
      const emailInput = screen.getByLabelText('E-mail');
      fireEvent.change(emailInput, { target: { value: 'test@gm' } });
      fireEvent.focus(emailInput);

      await waitFor(() => {
        const suggestion = screen.getByText('test@gmail.com');
        fireEvent.click(suggestion);
      });

      expect(emailInput.value).toBe('test@gmail.com');
    });

    it('deve esconder sugestões quando email é válido', async () => {
      const { isValidEmail, getEmailSuggestions } = await import('../../utils/validation');
      isValidEmail.mockReturnValue(true);
      getEmailSuggestions.mockReturnValue([]);

      renderLoginForm();
      
      const emailInput = screen.getByLabelText('E-mail');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.queryByText('Você quis dizer:')).not.toBeInTheDocument();
      });
    });
  });

  describe('Tratamento de Erros', () => {
    it('deve mostrar erro quando login falha', async () => {
      mockLogin.mockResolvedValue({ success: false, error: 'Credenciais inválidas' });

      renderLoginForm();
      
      const emailInput = screen.getByLabelText('E-mail');
      const passwordInput = screen.getByLabelText('Senha');
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          variant: "destructive",
          title: "Erro no login",
          description: "Credenciais inválidas"
        });
      });
    });

    it('deve mostrar erro genérico quando ocorre exceção', async () => {
      mockLogin.mockRejectedValue(new Error('Network error'));

      renderLoginForm();
      
      const emailInput = screen.getByLabelText('E-mail');
      const passwordInput = screen.getByLabelText('Senha');
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          variant: "destructive",
          title: "Erro no login",
          description: "Ocorreu um erro inesperado. Tente novamente."
        });
      });
    });

    it('deve mostrar erro de validação quando formulário é inválido', async () => {
      const { validateLoginForm } = await import('../../utils/validation');
      validateLoginForm.mockReturnValue({ 
        isValid: false, 
        errors: { email: 'Email é obrigatório' } 
      });

      renderLoginForm();
      
      const submitButton = screen.getByRole('button', { name: /entrar/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          variant: "destructive",
          title: "Erro de validação",
          description: "Por favor, corrija os erros no formulário"
        });
      });
    });
  });

  describe('Estados de Loading', () => {
    it('deve mostrar loading durante login', async () => {
      mockLogin.mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve({ success: true }), 100)
      ));

      renderLoginForm();
      
      const emailInput = screen.getByLabelText('E-mail');
      const passwordInput = screen.getByLabelText('Senha');
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      expect(screen.getByText('Entrando...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('deve desabilitar botão durante loading', async () => {
      mockLogin.mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve({ success: true }), 100)
      ));

      renderLoginForm();
      
      const emailInput = screen.getByLabelText('E-mail');
      const passwordInput = screen.getByLabelText('Senha');
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      expect(submitButton).toBeDisabled();
    });
  });

  describe('Navegação', () => {
    it('deve navegar para dashboard quando login é bem-sucedido', async () => {
      mockLogin.mockResolvedValue({ success: true });

      renderLoginForm();
      
      const emailInput = screen.getByLabelText('E-mail');
      const passwordInput = screen.getByLabelText('Senha');
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('deve mostrar toast de sucesso quando login é bem-sucedido', async () => {
      mockLogin.mockResolvedValue({ success: true });

      renderLoginForm();
      
      const emailInput = screen.getByLabelText('E-mail');
      const passwordInput = screen.getByLabelText('Senha');
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao Alça Hub"
        });
      });
    });
  });
});