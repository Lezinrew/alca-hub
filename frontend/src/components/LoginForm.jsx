import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { 
  isValidEmail, 
  hasValidDomain, 
  validateLoginForm, 
  formatEmail, 
  getEmailSuggestions 
} from '../utils/validation';

/**
 * Componente de Login com Validação de E-mail
 * AHSW-14: Tela de login com validação de e-mail
 */
const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Validação em tempo real do e-mail
  useEffect(() => {
    if (touched.email && formData.email) {
      const suggestions = getEmailSuggestions(formData.email);
      setEmailSuggestions(suggestions);
      // Exibir sugestões sempre que houver sugestões
      setShowSuggestions(suggestions.length > 0);
    } else {
      setEmailSuggestions([]);
      setShowSuggestions(false);
    }
  }, [formData.email, touched.email]);

  // Validação em tempo real
  useEffect(() => {
    if (touched.email || touched.password) {
      const validation = validateLoginForm(formData);
      setErrors(validation.errors);
    }
  }, [formData, touched]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Marcar campo como tocado
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));

    // Limpar erro específico quando usuário começa a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleEmailBlur = () => {
    setTouched(prev => ({ ...prev, email: true }));
    setShowSuggestions(false);
  };

  const handleEmailFocus = () => {
    // Sempre mostrar sugestões se há sugestões disponíveis e email não é válido
    if (emailSuggestions.length > 0 && !isValidEmail(formData.email)) {
      setShowSuggestions(true);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setFormData(prev => ({
      ...prev,
      email: suggestion
    }));
    setShowSuggestions(false);
    setEmailSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Marcar todos os campos como tocados
    setTouched({ email: true, password: true });

    // Validar formulário completo
    const validation = validateLoginForm(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      toast({
        variant: "destructive",
        title: "Erro de validação",
        description: "Por favor, corrija os erros no formulário",
      });
      return;
    }

    setLoading(true);

    try {
      const result = await login(formatEmail(formData.email), formData.password);
      
      if (result.success) {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao Alça Hub",
        });
        navigate('/dashboard');
      } else {
        toast({
          variant: "destructive",
          title: "Erro no login",
          description: result.error || "E-mail ou senha incorretos",
        });
      }
    } catch (error) {
      // Tratamento específico de erros
      let errorMessage = "Ocorreu um erro inesperado. Tente novamente.";
      let errorTitle = "Erro no login";

      if (error.response) {
        // Erro de resposta HTTP
        const status = error.response.status;
        switch (status) {
          case 401:
            errorMessage = "E-mail ou senha incorretos";
            break;
          case 429:
            errorMessage = "Muitas tentativas de login. Tente novamente em alguns minutos.";
            break;
          case 500:
            errorMessage = "Erro interno do servidor. Tente novamente mais tarde.";
            break;
          case 503:
            errorMessage = "Serviço temporariamente indisponível. Tente novamente em alguns minutos.";
            break;
          default:
            errorMessage = error.response.data?.detail || errorMessage;
        }
      } else if (error.request) {
        // Erro de rede
        errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
        errorTitle = "Erro de Conexão";
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = "Erro de rede. Verifique sua conexão.";
        errorTitle = "Erro de Rede";
      } else if (error.message.includes('timeout')) {
        errorMessage = "Tempo limite excedido. Tente novamente.";
        errorTitle = "Timeout";
      }

      toast({
        variant: "destructive",
        title: errorTitle,
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Determina o status de validação do email baseado no estado atual do campo.
   * 
   * @returns {string|null} Status do email:
   *   - 'valid': Email válido e com domínio válido
   *   - 'invalid': Email contém @ mas é inválido
   *   - null: Campo não foi tocado, está vazio, ou não contém @
   * 
   * @description
   * Esta função avalia o status do email considerando:
   * - Se o campo foi tocado pelo usuário (touched.email)
   * - Se há conteúdo no campo (formData.email)
   * - Se o email é válido (isValidEmail)
   * - Se o domínio é válido (hasValidDomain)
   * - Se contém o caractere @ (para mostrar status de invalidez)
   * 
   * @example
   * // Email válido
   * getEmailStatus() // returns 'valid'
   * 
   * // Email inválido com @
   * getEmailStatus() // returns 'invalid'
   * 
   * // Campo vazio ou não tocado
   * getEmailStatus() // returns null
   */
  const getEmailStatus = () => {
    if (!touched.email || !formData.email) return null;
    
    if (isValidEmail(formData.email) && hasValidDomain(formData.email)) {
      return 'valid';
    }
    // Considerar inválido se tiver '@' OU for um texto mais longo claramente inválido
    if (formData.email.includes('@') || formData.email.length >= 8) {
      return 'invalid';
    }
    return null;
  };

  const emailStatus = getEmailStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center space-y-2">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <CardTitle className="text-3xl font-bold text-indigo-900">
                Alça Hub
              </CardTitle>
            </motion.div>
            <CardDescription className="text-gray-600">
              Entre na sua conta para continuar
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit} noValidate>
            <CardContent className="space-y-6">
              {/* Campo de E-mail */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  E-mail
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={handleEmailBlur}
                    onFocus={handleEmailFocus}
                    placeholder="seu@email.com"
                    autoComplete="email"
                    className={`pl-10 pr-10 ${
                      emailStatus === 'valid'
                        ? 'border-green-500 focus:border-green-500'
                        : emailStatus === 'invalid'
                        ? 'border-red-500 focus:border-red-500'
                        : ''
                    }`}
                    required
                  />
                  
                  {/* Ícone de status do e-mail */}
                  {emailStatus && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {emailStatus === 'valid' ? (
                        <CheckCircle data-testid="email-status-icon" className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle data-testid="email-status-icon" className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>

                {/* Mensagem de erro do e-mail */}
                <AnimatePresence>
                  {errors.email && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center space-x-1 text-red-600 text-sm"
                    >
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors.email}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Sugestões de e-mail */}
                <AnimatePresence>
                  {showSuggestions && emailSuggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-white border border-gray-200 rounded-md shadow-lg p-2 space-y-1"
                    >
                      <p className="text-xs text-gray-500 px-2">Você quis dizer:</p>
                      {emailSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full text-left px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Campo de Senha */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Sua senha"
                    autoComplete="current-password"
                    className={`pl-10 pr-10 ${
                      errors.password ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Mensagem de erro da senha */}
                <AnimatePresence>
                  {errors.password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center space-x-1 text-red-600 text-sm"
                    >
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors.password}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>

              <div className="text-center space-y-2">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline"
                >
                  Esqueceu a senha?
                </Link>
                <p className="text-sm text-gray-600">
                  Não tem conta?{' '}
                  <Link 
                    to="/register" 
                    className="text-indigo-600 hover:text-indigo-700 hover:underline font-medium"
                  >
                    Cadastre-se
                  </Link>
                </p>
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginForm;
