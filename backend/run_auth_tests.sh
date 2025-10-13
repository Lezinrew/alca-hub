#!/bin/bash

# Script para executar testes de autenticação - Alça Hub
# AHSW-20: Testes automatizados de autenticação

echo "🧪 Executando Testes de Autenticação - AHSW-20"
echo "=============================================="

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
if [ ! -f "server.py" ]; then
    show_error "Execute este script a partir do diretório backend/"
    exit 1
fi

# Verificar se o ambiente virtual existe
if [ ! -d "venv" ]; then
    show_warning "Ambiente virtual não encontrado. Criando..."
    python3 -m venv venv
fi

# Ativar ambiente virtual
show_status "Ativando ambiente virtual..."
source venv/bin/activate

# Instalar dependências se necessário
show_status "Verificando dependências..."
pip install -q -r requirements.txt

# Executar testes unitários de autenticação
show_status "Executando testes unitários de autenticação..."
pytest tests/unit/test_auth.py -v --tb=short --cov=. --cov-report=term-missing --cov-report=html:htmlcov_auth

if [ $? -eq 0 ]; then
    show_success "Testes unitários de autenticação passaram!"
else
    show_error "Alguns testes unitários falharam"
    exit 1
fi

# Executar testes de integração de autenticação
show_status "Executando testes de integração de autenticação..."
pytest tests/integration/test_auth_integration.py -v --tb=short --cov=. --cov-report=term-missing --cov-report=html:htmlcov_auth_integration

if [ $? -eq 0 ]; then
    show_success "Testes de integração de autenticação passaram!"
else
    show_error "Alguns testes de integração falharam"
    exit 1
fi

# Executar todos os testes de autenticação com cobertura
show_status "Executando todos os testes de autenticação com cobertura..."
pytest tests/unit/test_auth.py tests/integration/test_auth_integration.py \
    -v --tb=short --cov=. --cov-report=term-missing --cov-report=html:htmlcov_auth_complete \
    --cov-fail-under=80

if [ $? -eq 0 ]; then
    show_success "Todos os testes de autenticação passaram com cobertura >= 80%!"
else
    show_error "Cobertura insuficiente ou testes falharam"
    exit 1
fi

# Executar testes específicos por funcionalidade
show_status "Executando testes de login..."
pytest tests/unit/test_auth.py::TestAuthIntegration::test_login_flow_success -v

show_status "Executando testes de cadastro..."
pytest tests/unit/test_auth.py::TestAuthIntegration::test_register_flow_success -v

show_status "Executando testes de recuperação de senha..."
pytest tests/unit/test_auth.py::TestPasswordRecovery::test_forgot_password_success -v
pytest tests/unit/test_auth.py::TestPasswordRecovery::test_reset_password_success -v

show_status "Executando testes de rate limiting..."
pytest tests/unit/test_auth.py::TestLoginRateLimiting::test_login_rate_limit_exceeded -v

show_status "Executando testes de OAuth2..."
pytest tests/unit/test_auth.py::TestOAuth2Flow::test_oauth2_token_success -v

# Gerar relatório de cobertura
show_status "Gerando relatório de cobertura..."
if [ -d "htmlcov_auth_complete" ]; then
    show_success "Relatório de cobertura gerado em htmlcov_auth_complete/index.html"
    echo "Abra o arquivo no navegador para visualizar a cobertura detalhada"
fi

# Resumo final
echo ""
echo "📊 RESUMO DOS TESTES DE AUTENTICAÇÃO"
echo "===================================="
echo "✅ Testes unitários: PASSARAM"
echo "✅ Testes de integração: PASSARAM"
echo "✅ Cobertura de código: >= 80%"
echo "✅ Rate limiting: IMPLEMENTADO"
echo "✅ OAuth2/JWT: IMPLEMENTADO"
echo "✅ Recuperação de senha: IMPLEMENTADO"
echo "✅ Validação de senha forte: IMPLEMENTADO"
echo ""
echo "🎉 AHSW-20: Testes automatizados de autenticação CONCLUÍDO!"
echo ""
echo "Para executar testes específicos:"
echo "  pytest tests/unit/test_auth.py::TestPasswordRecovery -v"
echo "  pytest tests/integration/test_auth_integration.py::TestAuthIntegration -v"
echo ""
echo "Para ver cobertura detalhada:"
echo "  open htmlcov_auth_complete/index.html"
