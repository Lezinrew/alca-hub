#!/bin/bash

# Monitor de Mudanças - Alça Hub
# Detecta mudanças e avisa quando restart é necessário

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Função para log
log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Verificar se inotify-tools está instalado
check_inotify() {
    if ! command -v inotifywait &> /dev/null; then
        log "Instalando inotify-tools..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            if command -v brew &> /dev/null; then
                brew install inotify-tools
            else
                error "Homebrew não encontrado. Instale inotify-tools manualmente."
                exit 1
            fi
        else
            # Linux
            sudo apt-get update && sudo apt-get install -y inotify-tools
        fi
    fi
}

# Função para detectar tipo de mudança
detect_change_type() {
    local file="$1"
    
    # Backend changes
    if [[ "$file" == *"/backend/"* ]]; then
        if [[ "$file" == *".py" ]] || [[ "$file" == *"requirements.txt" ]] || [[ "$file" == *"Dockerfile"* ]]; then
            echo "backend"
        fi
    fi
    
    # Frontend changes
    if [[ "$file" == *"/frontend/"* ]]; then
        if [[ "$file" == *".js" ]] || [[ "$file" == *".jsx" ]] || [[ "$file" == *".ts" ]] || [[ "$file" == *".tsx" ]] || [[ "$file" == *"package.json" ]]; then
            echo "frontend"
        fi
    fi
    
    # Docker changes
    if [[ "$file" == *"docker-compose"* ]] || [[ "$file" == *"Dockerfile"* ]]; then
        echo "docker"
    fi
    
    # Environment changes
    if [[ "$file" == *".env"* ]]; then
        echo "environment"
    fi
}

# Função para reiniciar serviço
restart_service() {
    local service="$1"
    
    warning "🔄 Reiniciando serviço: $service"
    docker compose -f docker-compose.dev.yml restart "$service"
    
    # Aguardar serviço ficar saudável
    log "Aguardando $service ficar saudável..."
    sleep 5
    
    # Verificar saúde
    case "$service" in
        "backend")
            if curl -f http://localhost:8000/ping > /dev/null 2>&1; then
                success "✅ Backend reiniciado com sucesso"
            else
                warning "⚠️ Backend pode não estar totalmente pronto ainda"
            fi
            ;;
        "frontend")
            if curl -f http://localhost:3000 > /dev/null 2>&1; then
                success "✅ Frontend reiniciado com sucesso"
            else
                warning "⚠️ Frontend pode não estar totalmente pronto ainda"
            fi
            ;;
        "mongo")
            if docker exec alca-hub-mongo-dev mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
                success "✅ MongoDB reiniciado com sucesso"
            else
                warning "⚠️ MongoDB pode não estar totalmente pronto ainda"
            fi
            ;;
    esac
}

# Função para mostrar aviso de restart
show_restart_warning() {
    local change_type="$1"
    local file="$2"
    
    echo ""
    echo "🚨 MUDANÇA DETECTADA 🚨"
    echo "========================"
    echo "📁 Arquivo: $file"
    echo "🔧 Tipo: $change_type"
    echo ""
    
    case "$change_type" in
        "backend")
            warning "⚠️  MUDANÇA NO BACKEND DETECTADA"
            echo "   • Arquivos Python (.py)"
            echo "   • Requirements (requirements.txt)"
            echo "   • Dockerfile do backend"
            echo ""
            echo "🔄 AÇÃO NECESSÁRIA:"
            echo "   docker compose -f docker-compose.dev.yml restart backend"
            echo ""
            ;;
        "frontend")
            warning "⚠️  MUDANÇA NO FRONTEND DETECTADA"
            echo "   • Arquivos JavaScript/TypeScript (.js, .jsx, .ts, .tsx)"
            echo "   • Package.json"
            echo ""
            echo "🔄 AÇÃO:"
            echo "   • Hot reload deve atualizar automaticamente"
            echo "   • Se não funcionar: docker compose -f docker-compose.dev.yml restart frontend"
            echo ""
            ;;
        "docker")
            warning "⚠️  MUDANÇA NA CONFIGURAÇÃO DOCKER DETECTADA"
            echo "   • Docker Compose"
            echo "   • Dockerfiles"
            echo ""
            echo "🔄 AÇÃO NECESSÁRIA:"
            echo "   docker compose -f docker-compose.dev.yml down"
            echo "   docker compose -f docker-compose.dev.yml up -d"
            echo ""
            ;;
        "environment")
            warning "⚠️  MUDANÇA NO ARQUIVO .ENV DETECTADA"
            echo "   • Variáveis de ambiente alteradas"
            echo ""
            echo "🔄 AÇÃO NECESSÁRIA:"
            echo "   docker compose -f docker-compose.dev.yml restart"
            echo ""
            ;;
    esac
    
    echo "💡 DICA: Use 'docker compose -f docker-compose.dev.yml logs -f' para ver logs"
    echo "🛑 Para parar: Ctrl+C"
    echo ""
}

# Função principal de monitoramento
monitor() {
    log "🔍 Iniciando monitoramento de mudanças..."
    log "📁 Monitorando: ./backend, ./frontend, ./docker-compose*.yml, ./.env"
    echo ""
    warning "Pressione Ctrl+C para parar o monitoramento"
    echo ""
    
    # Monitorar mudanças
    inotifywait -m -r -e modify,create,delete,move \
        ./backend \
        ./frontend \
        ./docker-compose*.yml \
        ./.env \
        --format '%w%f %e' | while read file event; do
        
        # Ignorar arquivos temporários
        if [[ "$file" == *"__pycache__"* ]] || [[ "$file" == *".git"* ]] || [[ "$file" == *"node_modules"* ]]; then
            continue
        fi
        
        # Detectar tipo de mudança
        change_type=$(detect_change_type "$file")
        
        if [ -n "$change_type" ]; then
            show_restart_warning "$change_type" "$file"
            
            # Auto-restart para mudanças críticas
            case "$change_type" in
                "backend")
                    log "🔄 Auto-reiniciando backend..."
                    restart_service "backend"
                    ;;
                "docker"|"environment")
                    warning "🛑 Mudança crítica detectada!"
                    echo "   Reinicie manualmente com:"
                    echo "   docker compose -f docker-compose.dev.yml down && docker compose -f docker-compose.dev.yml up -d"
                    ;;
            esac
        fi
    done
}

# Função para mostrar ajuda
show_help() {
    echo "🔍 Monitor de Mudanças - Alça Hub"
    echo "=================================="
    echo ""
    echo "USO:"
    echo "  ./monitor.sh              # Iniciar monitoramento"
    echo "  ./monitor.sh --help       # Mostrar esta ajuda"
    echo ""
    echo "FUNCIONALIDADES:"
    echo "  • Detecta mudanças em arquivos Python, JS, Docker"
    echo "  • Avisa quando restart é necessário"
    echo "  • Auto-reinicia backend quando necessário"
    echo "  • Mostra instruções para mudanças críticas"
    echo ""
    echo "ARQUIVOS MONITORADOS:"
    echo "  • ./backend/              # Código Python"
    echo "  • ./frontend/             # Código React"
    echo "  • docker-compose*.yml     # Configuração Docker"
    echo "  • .env                    # Variáveis de ambiente"
    echo ""
}

# Verificar argumentos
if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
    show_help
    exit 0
fi

# Verificar dependências
check_inotify

# Iniciar monitoramento
monitor
