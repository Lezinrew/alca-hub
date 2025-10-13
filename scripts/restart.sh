#!/bin/bash

# Script de Restart dos Serviços - Alça Hub
# ===========================================

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se estamos no diretório correto
if [ ! -f "docker-compose.yml" ]; then
    error "Execute este script no diretório raiz do projeto"
    exit 1
fi

log "🔄 Iniciando restart dos serviços do Alça Hub..."

# Verificar se há serviços rodando
if ! docker-compose ps | grep -q "Up"; then
    warning "Nenhum serviço está rodando. Iniciando serviços..."
    docker-compose up -d
    success "Serviços iniciados"
    exit 0
fi

# Mostrar status atual
log "📊 Status atual dos serviços:"
docker-compose ps

echo ""
read -p "Deseja continuar com o restart? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log "Operação cancelada"
    exit 0
fi

# Restart dos serviços
log "🛑 Parando serviços..."

if [ "$1" = "--force" ]; then
    log "Forçando parada dos serviços..."
    docker-compose kill
    docker-compose rm -f
else
    docker-compose down
fi

success "Serviços parados"

# Aguardar um pouco
log "⏳ Aguardando 5 segundos..."
sleep 5

# Iniciar serviços
log "🚀 Iniciando serviços..."

if [ -f "env.production" ]; then
    docker-compose --env-file env.production up -d
else
    docker-compose up -d
fi

success "Serviços iniciados"

# Aguardar serviços ficarem prontos
log "⏳ Aguardando serviços ficarem prontos..."

# Aguardar MongoDB
log "Aguardando MongoDB..."
timeout 30 bash -c 'until docker-compose exec mongo mongosh --eval "db.runCommand({ping: 1})" > /dev/null 2>&1; do sleep 2; done'
success "MongoDB pronto"

# Aguardar Backend
log "Aguardando Backend..."
timeout 30 bash -c 'until curl -f http://localhost:8000/health > /dev/null 2>&1; do sleep 2; done'
success "Backend pronto"

# Aguardar Frontend
log "Aguardando Frontend..."
timeout 30 bash -c 'until curl -f http://localhost:3000 > /dev/null 2>&1; do sleep 2; done'
success "Frontend pronto"

# Verificar saúde dos serviços
log "🏥 Verificando saúde dos serviços..."

# Verificar MongoDB
if docker-compose exec mongo mongosh --eval "db.runCommand({ping: 1})" > /dev/null 2>&1; then
    success "MongoDB: OK"
else
    error "MongoDB: FALHA"
fi

# Verificar Backend
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    success "Backend: OK"
else
    error "Backend: FALHA"
fi

# Verificar Frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    success "Frontend: OK"
else
    error "Frontend: FALHA"
fi

# Mostrar status final
log "📊 Status final dos serviços:"
docker-compose ps

log "🌐 URLs dos serviços:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:8000"
echo "  MongoDB:  mongodb://localhost:27017"
echo "  API Docs: http://localhost:8000/docs"

success "🎉 Restart concluído com sucesso!"

log "📋 Comandos úteis:"
echo "  Status: ./scripts/status.sh"
echo "  Logs:   ./scripts/logs.sh"
echo "  Deploy: ./scripts/deploy.sh"
