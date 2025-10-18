#!/bin/bash

# Script de Desenvolvimento - Alça Hub
# Desenvolvimento em tempo real com hot reload

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Função para verificar se Docker está rodando
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        error "Docker não está rodando. Inicie o Docker Desktop primeiro."
        exit 1
    fi
    success "Docker está rodando"
}

# Função para verificar arquivo .env
check_env() {
    if [ ! -f .env ]; then
        warning "Arquivo .env não encontrado. Criando arquivo .env de exemplo..."
        cat > .env << EOF
# Configurações do Alça Hub
SECRET_KEY=dev-secret-change-me-in-production
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=password123
MONGO_DATABASE=alca_hub
DEBUG=1
ENV=dev

# Mercado Pago (opcional)
MERCADO_PAGO_ACCESS_TOKEN=
MERCADO_PAGO_PUBLIC_KEY=
WEBHOOK_SECRET=
EOF
        success "Arquivo .env criado com configurações padrão"
    else
        success "Arquivo .env encontrado"
    fi
}

# Função para limpar containers antigos
cleanup() {
    log "Limpando containers antigos..."
    docker compose -f docker-compose.dev.yml down --remove-orphans 2>/dev/null || true
    success "Containers antigos removidos"
}

# Função para construir imagens
build_images() {
    log "Construindo imagens de desenvolvimento..."
    docker compose -f docker-compose.dev.yml build --no-cache
    success "Imagens construídas com sucesso"
}

# Função para iniciar serviços
start_services() {
    log "Iniciando serviços de desenvolvimento..."
    docker compose -f docker-compose.dev.yml up -d
    
    # Aguardar serviços ficarem saudáveis
    log "Aguardando serviços ficarem prontos..."
    sleep 10
    
    # Verificar saúde dos serviços
    check_health
}

# Função para verificar saúde dos serviços
check_health() {
    log "Verificando saúde dos serviços..."
    
    # Verificar MongoDB
    if docker exec alca-hub-mongo-dev mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        success "MongoDB está saudável"
    else
        error "MongoDB não está respondendo"
        return 1
    fi
    
    # Verificar Backend
    if curl -f http://localhost:8000/ping > /dev/null 2>&1; then
        success "Backend está saudável"
    else
        error "Backend não está respondendo"
        return 1
    fi
    
    # Verificar Frontend
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        success "Frontend está saudável"
    else
        error "Frontend não está respondendo"
        return 1
    fi
}

# Função para mostrar status
show_status() {
    echo ""
    echo "🚀 Alça Hub - Desenvolvimento"
    echo "================================"
    echo "📊 Status dos Serviços:"
    docker compose -f docker-compose.dev.yml ps
    echo ""
    echo "🌐 URLs de Acesso:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend:  http://localhost:8000"
    echo "  MongoDB:  mongodb://localhost:27017"
    echo ""
    echo "📝 Logs em tempo real:"
    echo "  docker compose -f docker-compose.dev.yml logs -f"
    echo ""
    echo "🔄 Para reiniciar um serviço:"
    echo "  docker compose -f docker-compose.dev.yml restart [service]"
    echo ""
    echo "🛑 Para parar tudo:"
    echo "  docker compose -f docker-compose.dev.yml down"
    echo ""
}

# Função para monitorar mudanças
monitor_changes() {
    log "Iniciando monitoramento de mudanças..."
    warning "Pressione Ctrl+C para parar o monitoramento"
    
    # Monitorar mudanças nos arquivos
    while true; do
        if inotifywait -r -e modify,create,delete ./backend ./frontend 2>/dev/null; then
            log "Mudança detectada! Verificando se restart é necessário..."
            
            # Verificar se é mudança no backend
            if [ -f "./backend/server.py" ] || [ -f "./backend/requirements.txt" ]; then
                warning "Mudança no backend detectada. Reiniciando backend..."
                docker compose -f docker-compose.dev.yml restart backend
                success "Backend reiniciado"
            fi
            
            # Verificar se é mudança no frontend
            if [ -f "./frontend/src" ] || [ -f "./frontend/package.json" ]; then
                warning "Mudança no frontend detectada. Frontend com hot reload deve atualizar automaticamente."
            fi
            
            sleep 2
        fi
    done
}

# Função principal
main() {
    echo "🚀 Iniciando Alça Hub - Modo Desenvolvimento"
    echo "============================================="
    
    # Verificações iniciais
    check_docker
    check_env
    
    # Limpeza e construção
    cleanup
    build_images
    
    # Iniciar serviços
    start_services
    
    # Mostrar status
    show_status
    
    # Perguntar se quer monitorar mudanças
    echo "Deseja iniciar o monitoramento de mudanças? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        monitor_changes
    else
        success "Desenvolvimento iniciado! Acesse http://localhost:3000"
        log "Para ver logs: docker compose -f docker-compose.dev.yml logs -f"
        log "Para parar: docker compose -f docker-compose.dev.yml down"
    fi
}

# Executar função principal
main "$@"
