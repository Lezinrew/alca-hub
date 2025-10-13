#!/bin/bash

# Script de Visualização de Logs - Alça Hub
# ===========================================

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para mostrar ajuda
show_help() {
    echo "Uso: $0 [SERVIÇO] [OPÇÕES]"
    echo ""
    echo "Serviços disponíveis:"
    echo "  all       - Todos os serviços"
    echo "  backend   - Apenas backend"
    echo "  frontend  - Apenas frontend"
    echo "  mongo     - Apenas MongoDB"
    echo ""
    echo "Opções:"
    echo "  -f, --follow    - Seguir logs em tempo real"
    echo "  -n, --lines N   - Mostrar N linhas (padrão: 50)"
    echo "  -e, --errors    - Mostrar apenas erros"
    echo "  -h, --help      - Mostrar esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0 all -f"
    echo "  $0 backend --follow"
    echo "  $0 --errors"
}

# Valores padrão
SERVICE="all"
FOLLOW=false
LINES=50
ERRORS_ONLY=false

# Processar argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        all|backend|frontend|mongo)
            SERVICE="$1"
            shift
            ;;
        -f|--follow)
            FOLLOW=true
            shift
            ;;
        -n|--lines)
            LINES="$2"
            shift 2
            ;;
        -e|--errors)
            ERRORS_ONLY=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Opção desconhecida: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

echo -e "${BLUE}📝 Logs do Alça Hub${NC}"
echo "===================="

# Verificar se Docker Compose está rodando
if ! docker-compose ps | grep -q "Up"; then
    echo -e "${RED}❌ Nenhum serviço está rodando${NC}"
    echo "Execute: docker-compose up -d"
    exit 1
fi

# Função para mostrar logs
show_logs() {
    local service=$1
    local follow=$2
    local lines=$3
    local errors_only=$4
    
    if [ "$service" = "all" ]; then
        if [ "$follow" = true ]; then
            docker-compose logs -f --tail=$lines
        else
            docker-compose logs --tail=$lines
        fi
    else
        if [ "$follow" = true ]; then
            docker-compose logs -f --tail=$lines $service
        else
            docker-compose logs --tail=$lines $service
        fi
    fi
}

# Mostrar logs
if [ "$ERRORS_ONLY" = true ]; then
    echo -e "${YELLOW}⚠️  Mostrando apenas erros${NC}"
    if [ "$FOLLOW" = true ]; then
        docker-compose logs -f | grep -i error
    else
        docker-compose logs --tail=$LINES | grep -i error
    fi
else
    if [ "$FOLLOW" = true ]; then
        echo -e "${BLUE}🔄 Seguindo logs em tempo real... (Ctrl+C para sair)${NC}"
        show_logs $SERVICE true $LINES false
    else
        echo -e "${BLUE}📄 Mostrando últimas $LINES linhas${NC}"
        show_logs $SERVICE false $LINES false
    fi
fi
