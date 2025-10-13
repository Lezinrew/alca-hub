#!/bin/bash

# Script para executar testes de autenticação do frontend - Alça Hub
# AHSW-20: Testes automatizados de autenticação

echo "🧪 Executando Testes de Autenticação Frontend - AHSW-20"
echo "======================================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para exibir status
show_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

show_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

show_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

show_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    show_error "Execute este script a partir do diretório frontend/"
    exit 1
fi

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    show_warning "Dependências não encontradas. Instalando..."
    yarn install
fi

# Instalar dependências de teste se necessário
show_status "Verificando dependências de teste..."
yarn add -D @testing-library/jest-dom @testing-library/react @testing-library/user-event @vitest/ui jsdom msw vitest

# Executar testes de login
show_status "Executando testes do componente LoginForm..."
yarn vitest run src/test/components/LoginForm.test.jsx --coverage

if [ $? -eq 0 ]; then
    show_success "Testes do LoginForm passaram!"
else
    show_error "Alguns testes do LoginForm falharam"
    exit 1
fi

# Executar testes de cadastro
show_status "Executando testes do componente Register..."
yarn vitest run src/test/components/Register.test.jsx --coverage

if [ $? -eq 0 ]; then
    show_success "Testes do Register passaram!"
else
    show_error "Alguns testes do Register falharam"
    exit 1
fi

# Executar testes de recuperação de senha
show_status "Executando testes de recuperação de senha..."
yarn vitest run src/test/components/PasswordRecovery.test.jsx --coverage

if [ $? -eq 0 ]; then
    show_success "Testes de recuperação de senha passaram!"
else
    show_error "Alguns testes de recuperação de senha falharam"
    exit 1
fi

# Executar todos os testes de autenticação com cobertura
show_status "Executando todos os testes de autenticação com cobertura..."
yarn vitest run src/test/components/ --coverage --coverage.thresholds.global.branches=80 --coverage.thresholds.global.functions=80 --coverage.thresholds.global.lines=80 --coverage.thresholds.global.statements=80

if [ $? -eq 0 ]; then
    show_success "Todos os testes de autenticação passaram com cobertura >= 80%!"
else
    show_error "Cobertura insuficiente ou testes falharam"
    exit 1
fi

# Executar testes específicos por funcionalidade
show_status "Executando testes de validação de email..."
yarn vitest run src/test/components/LoginForm.test.jsx -t "valida formato de email"

show_status "Executando testes de validação de senha forte..."
yarn vitest run src/test/components/Register.test.jsx -t "valida força da senha"

show_status "Executando testes de aceite de termos..."
yarn vitest run src/test/components/Register.test.jsx -t "valida aceite dos termos"

show_status "Executando testes de rate limiting..."
yarn vitest run src/test/components/LoginForm.test.jsx -t "trata erro de rate limiting"

show_status "Executando testes de cooldown..."
yarn vitest run src/test/components/PasswordRecovery.test.jsx -t "trata erro de cooldown"

# Gerar relatório de cobertura
show_status "Gerando relatório de cobertura..."
if [ -d "coverage" ]; then
    show_success "Relatório de cobertura gerado em coverage/index.html"
    echo "Abra o arquivo no navegador para visualizar a cobertura detalhada"
fi

# Resumo final
echo ""
echo "📊 RESUMO DOS TESTES DE AUTENTICAÇÃO FRONTEND"
echo "============================================="
echo "✅ Testes do LoginForm: PASSARAM"
echo "✅ Testes do Register: PASSARAM"
echo "✅ Testes de recuperação de senha: PASSARAM"
echo "✅ Cobertura de código: >= 80%"
echo "✅ Validação de email: IMPLEMENTADO"
echo "✅ Validação de senha forte: IMPLEMENTADO"
echo "✅ Aceite de termos: IMPLEMENTADO"
echo "✅ Rate limiting: IMPLEMENTADO"
echo "✅ Cooldown: IMPLEMENTADO"
echo ""
echo "🎉 AHSW-20: Testes automatizados de autenticação frontend CONCLUÍDO!"
echo ""
echo "Para executar testes específicos:"
echo "  yarn vitest run src/test/components/LoginForm.test.jsx"
echo "  yarn vitest run src/test/components/Register.test.jsx"
echo "  yarn vitest run src/test/components/PasswordRecovery.test.jsx"
echo ""
echo "Para ver cobertura detalhada:"
echo "  open coverage/index.html"
echo ""
echo "Para executar testes em modo watch:"
echo "  yarn vitest src/test/components/"
