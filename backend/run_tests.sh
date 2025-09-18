#!/bin/bash

# Script para executar testes - Alça Hub Backend
# Este script facilita a execução de diferentes tipos de testes

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_message() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Função para verificar se o ambiente virtual está ativo
check_venv() {
    if [[ "$VIRTUAL_ENV" == "" ]]; then
        print_warning "Ambiente virtual não detectado. Ativando..."
        if [ -d "venv" ]; then
            source venv/bin/activate
            print_success "Ambiente virtual ativado"
        else
            print_error "Ambiente virtual não encontrado. Execute 'python -m venv venv' primeiro."
            exit 1
        fi
    else
        print_success "Ambiente virtual ativo: $VIRTUAL_ENV"
    fi
}

# Função para instalar dependências
install_dependencies() {
    print_message "Instalando dependências de teste..."
    pip install -r requirements.txt
    print_success "Dependências instaladas"
}

# Função para executar todos os testes
run_all_tests() {
    print_message "Executando todos os testes..."
    pytest tests/ -v --cov=. --cov-report=html:htmlcov --cov-report=term-missing
    print_success "Todos os testes executados"
}

# Função para executar testes unitários
run_unit_tests() {
    print_message "Executando testes unitários..."
    pytest tests/unit/ -v -m "unit"
    print_success "Testes unitários executados"
}

# Função para executar testes de integração
run_integration_tests() {
    print_message "Executando testes de integração..."
    pytest tests/integration/ -v -m "integration"
    print_success "Testes de integração executados"
}

# Função para executar testes de autenticação
run_auth_tests() {
    print_message "Executando testes de autenticação..."
    pytest tests/ -v -m "auth"
    print_success "Testes de autenticação executados"
}

# Função para executar testes de usuários
run_user_tests() {
    print_message "Executando testes de usuários..."
    pytest tests/ -v -m "user"
    print_success "Testes de usuários executados"
}

# Função para executar testes com cobertura
run_coverage_tests() {
    print_message "Executando testes com cobertura..."
    pytest tests/ --cov=. --cov-report=html:htmlcov --cov-report=term-missing --cov-fail-under=80
    print_success "Testes com cobertura executados"
}

# Função para executar testes em modo verbose
run_verbose_tests() {
    print_message "Executando testes em modo verbose..."
    pytest tests/ -v -s
    print_success "Testes verbose executados"
}

# Função para executar testes específicos
run_specific_test() {
    local test_file="$1"
    print_message "Executando teste específico: $test_file"
    pytest "$test_file" -v
    print_success "Teste específico executado"
}

# Função para limpar cache de testes
clean_test_cache() {
    print_message "Limpando cache de testes..."
    pytest --cache-clear
    rm -rf .pytest_cache
    rm -rf htmlcov
    print_success "Cache limpo"
}

# Função para executar linting
run_linting() {
    print_message "Executando linting..."
    flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
    flake8 . --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics
    print_success "Linting executado"
}

# Função para executar formatação
run_formatting() {
    print_message "Executando formatação de código..."
    black . --check
    isort . --check-only
    print_success "Formatação verificada"
}

# Função para executar type checking
run_type_checking() {
    print_message "Executando verificação de tipos..."
    mypy . --ignore-missing-imports
    print_success "Verificação de tipos executada"
}

# Função para executar todos os checks
run_all_checks() {
    print_message "Executando todos os checks..."
    run_linting
    run_formatting
    run_type_checking
    run_all_tests
    print_success "Todos os checks executados"
}

# Função para mostrar ajuda
show_help() {
    echo "🧪 Script de Testes - Alça Hub Backend"
    echo "======================================"
    echo ""
    echo "Uso: ./run_tests.sh [comando]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  all          - Executar todos os testes"
    echo "  unit         - Executar apenas testes unitários"
    echo "  integration  - Executar apenas testes de integração"
    echo "  auth         - Executar apenas testes de autenticação"
    echo "  user         - Executar apenas testes de usuários"
    echo "  coverage     - Executar testes com cobertura"
    echo "  verbose      - Executar testes em modo verbose"
    echo "  specific     - Executar teste específico (ex: ./run_tests.sh specific tests/unit/test_auth.py)"
    echo "  clean        - Limpar cache de testes"
    echo "  lint         - Executar linting"
    echo "  format       - Verificar formatação"
    echo "  types        - Verificar tipos"
    echo "  checks       - Executar todos os checks"
    echo "  install      - Instalar dependências"
    echo "  help         - Mostrar esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  ./run_tests.sh all"
    echo "  ./run_tests.sh unit"
    echo "  ./run_tests.sh specific tests/unit/test_auth.py"
    echo "  ./run_tests.sh coverage"
}

# Função principal
main() {
    echo "🧪 Alça Hub - Script de Testes"
    echo "==============================="
    echo ""
    
    check_venv
    
    case "${1:-help}" in
        "all")
            install_dependencies
            run_all_tests
            ;;
        "unit")
            install_dependencies
            run_unit_tests
            ;;
        "integration")
            install_dependencies
            run_integration_tests
            ;;
        "auth")
            install_dependencies
            run_auth_tests
            ;;
        "user")
            install_dependencies
            run_user_tests
            ;;
        "coverage")
            install_dependencies
            run_coverage_tests
            ;;
        "verbose")
            install_dependencies
            run_verbose_tests
            ;;
        "specific")
            if [ -z "$2" ]; then
                print_error "Especifique o arquivo de teste. Ex: ./run_tests.sh specific tests/unit/test_auth.py"
                exit 1
            fi
            install_dependencies
            run_specific_test "$2"
            ;;
        "clean")
            clean_test_cache
            ;;
        "lint")
            install_dependencies
            run_linting
            ;;
        "format")
            install_dependencies
            run_formatting
            ;;
        "types")
            install_dependencies
            run_type_checking
            ;;
        "checks")
            install_dependencies
            run_all_checks
            ;;
        "install")
            install_dependencies
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Executar função principal
main "$@"
