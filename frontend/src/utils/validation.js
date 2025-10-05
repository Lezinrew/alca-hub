/**
 * Utilitários de validação para o Alça Hub
 * AHSW-14: Tela de login com validação de e-mail
 */

/**
 * Valida se o e-mail tem formato válido
 * @param {string} email - E-mail a ser validado
 * @returns {boolean} - true se válido, false caso contrário
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Regex mais robusta para validação de e-mail
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  return emailRegex.test(email.trim());
};

/**
 * Valida se o e-mail tem domínio válido
 * @param {string} email - E-mail a ser validado
 * @returns {boolean} - true se domínio válido, false caso contrário
 */
export const hasValidDomain = (email) => {
  if (!isValidEmail(email)) {
    return false;
  }

  const domain = email.split('@')[1];
  const validDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
    'uol.com.br', 'bol.com.br', 'terra.com.br', 'ig.com.br',
    'globo.com', 'r7.com', 'folha.com.br', 'estadao.com.br'
  ];

  // Aceita domínios conhecidos ou domínios com pelo menos 2 caracteres
  return validDomains.includes(domain.toLowerCase()) || domain.length >= 2;
};

/**
 * Valida se a senha atende aos critérios mínimos
 * @param {string} password - Senha a ser validada
 * @returns {object} - { isValid: boolean, errors: string[] }
 */
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password || password.length < 6) {
    errors.push('A senha deve ter pelo menos 6 caracteres');
  }
  
  if (password && password.length > 0 && password.length < 6) {
    errors.push('Senha muito curta');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valida o formulário de login completo
 * @param {object} formData - { email: string, password: string }
 * @returns {object} - { isValid: boolean, errors: object }
 */
export const validateLoginForm = (formData) => {
  const errors = {};

  // Validação do e-mail
  if (!formData.email || formData.email.trim() === '') {
    errors.email = 'E-mail é obrigatório';
  } else if (!isValidEmail(formData.email)) {
    errors.email = 'Formato de e-mail inválido';
  } else if (!hasValidDomain(formData.email)) {
    errors.email = 'Domínio de e-mail inválido';
  }

  // Validação da senha
  if (!formData.password || formData.password.trim() === '') {
    errors.password = 'Senha é obrigatória';
  } else {
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors[0];
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Formata o e-mail para exibição
 * @param {string} email - E-mail a ser formatado
 * @returns {string} - E-mail formatado
 */
export const formatEmail = (email) => {
  if (!email) return '';
  return email.trim().toLowerCase();
};

/**
 * Obtém sugestões de correção para e-mail
 * @param {string} email - E-mail com possível erro
 * @returns {string[]} - Array de sugestões
 */
export const getEmailSuggestions = (email) => {
  if (!email || !email.includes('@')) {
    return [];
  }

  const [localPart, domain] = email.split('@');
  const suggestions = [];

  // Sugestões de domínios comuns
  const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  
  commonDomains.forEach(commonDomain => {
    if (domain && commonDomain.startsWith(domain.toLowerCase())) {
      suggestions.push(`${localPart}@${commonDomain}`);
    }
  });

  return suggestions.slice(0, 3); // Máximo 3 sugestões
};
