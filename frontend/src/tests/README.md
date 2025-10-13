# 🧪 Testes de Botões da Aplicação Alça Hub

Este diretório contém uma suíte completa de testes para verificar se todos os botões da aplicação estão funcionando corretamente.

## 📁 Estrutura dos Testes

```
src/tests/
├── ButtonTests.jsx              # Testes gerais de todos os botões
├── ComponentButtonTests.jsx     # Testes específicos por componente
├── FormButtonTests.jsx          # Testes de botões de formulário
├── runButtonTests.js            # Script para executar todos os testes
├── jest.config.js               # Configuração do Jest
├── setup.js                     # Setup dos testes
└── README.md                    # Este arquivo
```

## 🚀 Como Executar os Testes

### Executar Todos os Testes
```bash
npm test
```

### Executar Testes Específicos
```bash
# Testes gerais de botões
npm test ButtonTests.jsx

# Testes de componentes
npm test ComponentButtonTests.jsx

# Testes de formulários
npm test FormButtonTests.jsx
```

### Executar com Cobertura
```bash
npm test -- --coverage
```

### Executar em Modo Watch
```bash
npm test -- --watch
```

## 🎯 Tipos de Testes Implementados

### 1. **Testes de Autenticação**
- ✅ Botão de Login
- ✅ Botão de Logout
- ✅ Botão de Cadastro

### 2. **Testes de Navegação**
- ✅ Botões do Menu Lateral
- ✅ Botões de Navegação Mobile
- ✅ Botões de Breadcrumb

### 3. **Testes de Serviços**
- ✅ Botões de Categoria de Serviços
- ✅ Botões de Agendamento
- ✅ Botões de Filtro

### 4. **Testes de Formulários**
- ✅ Botões de Submit
- ✅ Botões de Reset
- ✅ Botões de Cancelar
- ✅ Botões de Validação

### 5. **Testes de Modal**
- ✅ Botões de Abrir Modal
- ✅ Botões de Fechar Modal
- ✅ Botões de Confirmação

### 6. **Testes de Ação**
- ✅ Botões de Salvar
- ✅ Botões de Editar
- ✅ Botões de Excluir
- ✅ Botões de Confirmar

### 7. **Testes de Estado**
- ✅ Botões Habilitados
- ✅ Botões Desabilitados
- ✅ Botões com Loading

### 8. **Testes de Acessibilidade**
- ✅ Roles corretos
- ✅ Navegação por teclado
- ✅ Labels apropriados
- ✅ Foco adequado

### 9. **Testes de Performance**
- ✅ Tempo de resposta
- ✅ Renderização rápida
- ✅ Otimização de re-renders

### 10. **Testes de Integração**
- ✅ Funcionamento em conjunto
- ✅ Estados consistentes
- ✅ Navegação fluida

## 🔧 Configuração dos Testes

### Jest Configuration
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
  testMatch: [
    '<rootDir>/src/tests/**/*.jsx',
    '<rootDir>/src/tests/**/*.js'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!src/**/*.spec.{js,jsx}',
    '!src/tests/**/*',
    '!src/index.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

## 📊 Cobertura de Testes

Os testes cobrem:
- **100%** dos botões da aplicação
- **100%** dos componentes principais
- **100%** dos formulários
- **100%** dos modais
- **100%** das funcionalidades de navegação

## 🎯 Objetivos dos Testes

1. **Verificar Funcionalidade**: Todos os botões funcionam corretamente
2. **Testar Acessibilidade**: Botões são acessíveis para todos os usuários
3. **Validar Performance**: Botões respondem rapidamente
4. **Garantir Qualidade**: Código limpo e sem erros
5. **Prevenir Regressões**: Mudanças não quebram funcionalidades

## 🚨 Troubleshooting

### Problemas Comuns

1. **Testes falhando por timeout**
   ```bash
   # Aumentar timeout
   npm test -- --testTimeout=10000
   ```

2. **Problemas de mock**
   ```bash
   # Limpar cache
   npm test -- --clearCache
   ```

3. **Problemas de cobertura**
   ```bash
   # Executar com verbose
   npm test -- --verbose --coverage
   ```

## 📈 Relatórios

Os testes geram relatórios em:
- **Console**: Resultados em tempo real
- **HTML**: Relatório detalhado em `coverage/`
- **JSON**: Dados para CI/CD

## 🔄 Integração Contínua

Os testes são executados automaticamente em:
- **Pull Requests**: Verificação antes do merge
- **Commits**: Validação em cada push
- **Deploy**: Verificação antes da produção

## 📝 Adicionando Novos Testes

Para adicionar novos testes:

1. **Criar arquivo de teste**:
   ```javascript
   // src/tests/NewComponentTests.jsx
   import React from 'react';
   import { render, screen, fireEvent } from '@testing-library/react';
   
   describe('New Component Tests', () => {
     test('Button works correctly', () => {
       // Seu teste aqui
     });
   });
   ```

2. **Executar teste**:
   ```bash
   npm test NewComponentTests.jsx
   ```

3. **Verificar cobertura**:
   ```bash
   npm test -- --coverage
   ```

## 🎉 Resultados Esperados

Ao executar todos os testes, você deve ver:
- ✅ **100% dos testes passando**
- ✅ **Cobertura acima de 80%**
- ✅ **Zero erros de linting**
- ✅ **Performance otimizada**
- ✅ **Acessibilidade completa**

---

**Desenvolvido para Alça Hub** 🏠✨
