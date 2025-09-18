#!/bin/bash

# Script de inicialização para Alça Hub
# Este script facilita o setup e execução da aplicação

set -e

echo "🚀 Iniciando Alça Hub..."

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

# Verificar se Docker está instalado
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker não está instalado. Por favor, instale o Docker primeiro."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro."
        exit 1
    fi
    
    print_success "Docker e Docker Compose estão instalados"
}

# Verificar se arquivo .env existe
check_env() {
    if [ ! -f .env ]; then
        print_warning "Arquivo .env não encontrado. Criando a partir do exemplo..."
        cp env.example .env
        print_warning "Por favor, edite o arquivo .env com suas configurações antes de continuar."
        print_warning "Pressione Enter para continuar ou Ctrl+C para sair..."
        read
    fi
    print_success "Arquivo .env encontrado"
}

# Função para limpar containers antigos
cleanup() {
    print_message "Limpando containers antigos..."
    docker-compose down --remove-orphans 2>/dev/null || true
    print_success "Containers antigos removidos"
}

# Função para construir as imagens
build_images() {
    print_message "Construindo imagens Docker..."
    docker-compose build --no-cache
    print_success "Imagens construídas com sucesso"
}

# Função para iniciar os serviços
start_services() {
    print_message "Iniciando serviços..."
    docker-compose up -d
    print_success "Serviços iniciados"
}

# Função para verificar saúde dos serviços
check_health() {
    print_message "Verificando saúde dos serviços..."
    
    # Aguardar MongoDB
    print_message "Aguardando MongoDB..."
    sleep 10
    
    # Aguardar Backend
    print_message "Aguardando Backend..."
    sleep 15
    
    # Aguardar Frontend
    print_message "Aguardando Frontend..."
    sleep 10
    
    print_success "Todos os serviços estão rodando"
}

# Função para mostrar status
show_status() {
    echo ""
    print_message "Status dos serviços:"
    docker-compose ps
    
    echo ""
    print_success "🎉 Alça Hub está rodando!"
    echo ""
    echo "📱 Frontend: http://localhost:3000"
    echo "🔧 Backend: http://localhost:8000"
    echo "📊 MongoDB: mongodb://localhost:27017"
    echo ""
    echo "📋 Comandos úteis:"
    echo "  - Ver logs: docker-compose logs -f"
    echo "  - Parar: docker-compose down"
    echo "  - Rebuild: docker-compose up --build"
    echo ""
}

# Função principal
main() {
    echo "🏠 Alça Hub - Sistema de Gestão para Condomínios"
    echo "=================================================="
    echo ""
    
    check_docker
    check_env
    cleanup
    build_images
    start_services
    check_health
    show_status
}

# Verificar argumentos
case "${1:-}" in
    "dev")
        print_message "Iniciando em modo desenvolvimento..."
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
        ;;
    "prod")
        print_message "Iniciando em modo produção..."
        docker-compose up -d
        ;;
    "stop")
        print_message "Parando serviços..."
        docker-compose down
        print_success "Serviços parados"
        ;;
    "logs")
        docker-compose logs -f
        ;;
    "clean")
        print_message "Limpando tudo..."
        docker-compose down --volumes --remove-orphans
        docker system prune -f
        print_success "Limpeza concluída"
        ;;
    *)
        main
        ;;
esac
