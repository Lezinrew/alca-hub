# 🚀 Alça Hub - Plataforma de Serviços

> Plataforma completa para conectar prestadores de serviços com clientes, incluindo sistema de pagamentos, chat em tempo real e notificações.

## 📋 Índice

- [🚀 Início Rápido](#-início-rápido)
- [🛠️ Desenvolvimento](#️-desenvolvimento)
- [📱 Mobile](#-mobile)
- [📦 Deploy em VPS](#-deploy-em-vps)
- [🏗️ Arquitetura](#️-arquitetura)
- [📚 Documentação](#-documentação)
- [🧪 Testes](#-testes)
- [🔧 Configuração](#-configuração)

## 🚀 Início Rápido

### Pré-requisitos

- **Docker** e **Docker Compose**
- **Node.js 18+** (para desenvolvimento local)
- **Python 3.11+** (para desenvolvimento local)

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/alca-hub.git
cd alca-hub

# 2. Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# 3. Inicie a aplicação
./start.sh
```

### Acesso

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Documentação API**: http://localhost:8000/docs

## 🛠️ Desenvolvimento

### Modo Desenvolvimento com Hot Reload

```bash
# Iniciar desenvolvimento com hot reload
./dev.sh

# Monitorar mudanças automaticamente
./monitor.sh
```

### Estrutura do Projeto

```
alca-hub/
├── backend/                 # API FastAPI
│   ├── auth/               # Autenticação e autorização
│   ├── chat/               # Sistema de chat
│   ├── notifications/      # Sistema de notificações
│   ├── reviews/            # Sistema de avaliações
│   ├── server.py           # Servidor principal
│   └── requirements.txt    # Dependências Python
├── frontend/               # Interface React Web
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── utils/         # Utilitários
│   │   └── test/          # Testes
│   └── package.json        # Dependências Node.js
├── mobile/                 # Apps Mobile (iOS & Android)
│   ├── ios/               # Projeto iOS nativo (Capacitor)
│   ├── android/           # Projeto Android nativo (Capacitor)
│   ├── docs/              # Documentação mobile
│   ├── Makefile           # Comandos de desenvolvimento mobile
│   └── README.md          # Guia específico mobile
├── docs/                   # Documentação geral
├── docker-compose.yml      # Produção
├── docker-compose.dev.yml  # Desenvolvimento
├── dev.sh                  # Script de desenvolvimento
├── monitor.sh              # Monitor de mudanças
└── start.sh                # Script de produção
```

### Comandos de Desenvolvimento

```bash
# Desenvolvimento com hot reload
./dev.sh

# Monitorar mudanças
./monitor.sh

# Testes backend
docker compose exec backend pytest

# Testes frontend
docker compose exec frontend yarn test

# Logs em tempo real
docker compose logs -f

# Reiniciar serviço específico
docker compose restart backend
docker compose restart frontend
```

## 📱 Mobile

O AlcaHub possui aplicativos nativos para iOS e Android, construídos com Capacitor. Todo o código mobile está organizado no diretório [mobile/](mobile/).

### Requisitos Mobile

- **iOS**: macOS 13.0+, Xcode 15.0+, CocoaPods 1.15+
- **Android**: JDK 17+, Android Studio Hedgehog+, Android SDK 34+
- **Comum**: Fastlane 2.217+, Ruby 3.0+

### Comandos Principais Mobile

```bash
# Navegar para o diretório mobile
cd mobile

# Ver todos os comandos disponíveis
make help

# Setup inicial
make install          # Instalar dependências
make setup-ios        # Configurar iOS
make setup-android    # Configurar Android

# Desenvolvimento
make run-ios          # Executar no simulador iOS
make run-android      # Executar no emulador Android

# Build
make build-ios-debug
make build-android-debug

# Deploy
make deploy-ios-testflight
make deploy-android-internal

# Limpar builds
make clean
```

### Estrutura Mobile

```
mobile/
├── ios/                    # Projeto iOS nativo
│   ├── App/               # Código Swift
│   ├── Config/            # Configurações Debug/Release
│   └── fastlane/          # Automação iOS
├── android/               # Projeto Android nativo
│   ├── app/              # Código Kotlin/Java
│   └── fastlane/         # Automação Android
└── docs/                 # Documentação mobile
```

Para mais detalhes, consulte o [README Mobile](mobile/README.md).

## 📦 Deploy em VPS

### Opções de VPS Recomendadas

#### 1. **DigitalOcean** (Recomendado)
- **Droplet**: $6/mês (1GB RAM, 1 CPU)
- **Ubuntu 22.04 LTS**
- **Região**: São Paulo (menor latência)

#### 2. **Linode**
- **Nanode**: $5/mês (1GB RAM, 1 CPU)
- **Ubuntu 22.04 LTS**

#### 3. **Vultr**
- **Regular Performance**: $6/mês (1GB RAM, 1 CPU)
- **Ubuntu 22.04 LTS**

#### 4. **AWS EC2**
- **t3.micro**: $8.50/mês (1GB RAM, 1 CPU)
- **Ubuntu 22.04 LTS**

### Configuração da VPS

#### Passo 1: Configurar Servidor

```bash
# Conectar via SSH
ssh root@SEU_IP_VPS

# Atualizar sistema
apt update && apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Adicionar usuário ao grupo docker
usermod -aG docker $USER
```

#### Passo 2: Configurar Aplicação

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/alca-hub.git
cd alca-hub

# Configurar variáveis de ambiente
cp .env.example .env
nano .env
```

#### Passo 3: Configurar Domínio (Opcional)

```bash
# Instalar Nginx
apt install nginx -y

# Configurar SSL com Let's Encrypt
apt install certbot python3-certbot-nginx -y
certbot --nginx -d seu-dominio.com
```

#### Passo 4: Deploy

```bash
# Iniciar aplicação
./start.sh

# Verificar status
docker compose ps

# Configurar auto-start
systemctl enable docker
```

### Configuração de Produção

#### Arquivo `.env` para Produção

```env
# Configurações de Produção
SECRET_KEY=sua-chave-secreta-super-segura-aqui
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=senha-super-segura
MONGO_DATABASE=alca_hub_prod
DEBUG=0
ENV=production

# Mercado Pago (Produção)
MERCADO_PAGO_ACCESS_TOKEN=seu-token-producao
MERCADO_PAGO_PUBLIC_KEY=sua-chave-publica-producao
WEBHOOK_SECRET=seu-webhook-secret

# CORS (Configurar com seu domínio)
CORS_ORIGINS=https://seu-dominio.com,https://www.seu-dominio.com
```

#### Docker Compose para Produção

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  mongo:
    image: mongo:latest
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_ROOT_USERNAME}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
      MONGO_INITDB_DATABASE: ${MONGO_DATABASE}
    volumes:
      - mongo_data:/data/db
    networks:
      - alca-hub-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: unless-stopped
    environment:
      - MONGO_URL=mongodb://mongo:27017
      - DB_NAME=${MONGO_DATABASE}
      - SECRET_KEY=${SECRET_KEY}
      - MERCADO_PAGO_ACCESS_TOKEN=${MERCADO_PAGO_ACCESS_TOKEN}
      - MERCADO_PAGO_PUBLIC_KEY=${MERCADO_PAGO_PUBLIC_KEY}
      - WEBHOOK_SECRET=${WEBHOOK_SECRET}
      - CORS_ORIGINS=${CORS_ORIGINS}
      - DEBUG=${DEBUG}
      - ENV=${ENV}
    ports:
      - "8000:8000"
    networks:
      - alca-hub-network
    depends_on:
      - mongo

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    restart: unless-stopped
    environment:
      - REACT_APP_BACKEND_URL=https://api.seu-dominio.com
      - NODE_ENV=production
    ports:
      - "3000:3000"
    networks:
      - alca-hub-network
    depends_on:
      - backend

volumes:
  mongo_data:
    driver: local

networks:
  alca-hub-network:
    driver: bridge
```

## 🏗️ Arquitetura

### Stack Tecnológica

#### Backend
- **FastAPI** - Framework web moderno
- **Python 3.11** - Linguagem principal
- **MongoDB** - Banco de dados NoSQL
- **JWT** - Autenticação
- **WebSockets** - Chat em tempo real
- **Pytest** - Testes

#### Frontend
- **React 18** - Biblioteca de interface
- **Vite** - Build tool
- **Tailwind CSS** - Framework de estilos
- **Radix UI** - Componentes acessíveis
- **Vitest** - Testes

#### Infraestrutura
- **Docker** - Containerização
- **Docker Compose** - Orquestração
- **Nginx** - Proxy reverso (produção)
- **Let's Encrypt** - SSL/TLS

### Fluxo de Dados

```
Cliente → Frontend (React) → Backend (FastAPI) → MongoDB
                ↓
         WebSockets (Chat/Notificações)
                ↓
         Mercado Pago (Pagamentos)
```

## 📚 Documentação

### API Endpoints

#### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Perfil do usuário

#### Serviços
- `GET /api/providers` - Listar prestadores
- `GET /api/providers/{id}` - Detalhes do prestador
- `POST /api/providers` - Criar prestador

#### Chat
- `GET /api/chat/rooms` - Salas de chat
- `POST /api/chat/rooms` - Criar sala
- `GET /api/chat/rooms/{id}/messages` - Mensagens

#### Notificações
- `GET /api/notifications` - Notificações do usuário
- `PUT /api/notifications/{id}/read` - Marcar como lida

### Componentes Frontend

#### LoginForm
- Validação de email com sugestões
- Autenticação JWT
- Estados de loading e erro

#### ProviderFilters
- Filtros por categoria e especialidade
- Busca por localização
- Paginação

#### ChatInterface
- Mensagens em tempo real
- WebSocket connection
- Notificações push

## 🧪 Testes

### Backend
```bash
# Executar todos os testes
docker compose exec backend pytest

# Testes com coverage
docker compose exec backend pytest --cov=.

# Testes específicos
docker compose exec backend pytest tests/test_auth.py
```

### Frontend
```bash
# Executar todos os testes
docker compose exec frontend yarn test

# Testes com coverage
docker compose exec frontend yarn test --coverage

# Testes em modo watch
docker compose exec frontend yarn test --watch
```

### Testes de Integração
```bash
# Testes end-to-end
docker compose exec backend pytest tests/integration/
```

## 🔧 Configuração

### Variáveis de Ambiente

#### Desenvolvimento
```env
SECRET_KEY=dev-secret-change-me
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=password123
MONGO_DATABASE=alca_hub
DEBUG=1
ENV=dev
```

#### Produção
```env
SECRET_KEY=sua-chave-super-segura
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=senha-super-segura
MONGO_DATABASE=alca_hub_prod
DEBUG=0
ENV=production
CORS_ORIGINS=https://seu-dominio.com
```

### Configuração do MongoDB

```javascript
// Índices recomendados
db.users.createIndex({ "email": 1 }, { unique: true })
db.providers.createIndex({ "location": "2dsphere" })
db.messages.createIndex({ "room_id": 1, "created_at": -1 })
db.notifications.createIndex({ "user_id": 1, "read": 1 })
```

### Configuração do Nginx (Produção)

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🚀 Scripts Disponíveis

### Desenvolvimento
- `./dev.sh` - Iniciar desenvolvimento com hot reload
- `./monitor.sh` - Monitorar mudanças de arquivos
- `./start.sh` - Iniciar aplicação em produção

### Utilitários
- `docker compose logs -f` - Ver logs em tempo real
- `docker compose ps` - Status dos serviços
- `docker compose restart [service]` - Reiniciar serviço

## 📞 Suporte

### Problemas Comuns

#### 1. Porta já em uso
```bash
# Verificar processos usando as portas
lsof -i :3000
lsof -i :8000
lsof -i :27017

# Parar processos
kill -9 PID
```

#### 2. Problemas de permissão
```bash
# Dar permissão aos scripts
chmod +x *.sh

# Dar permissão ao Docker
sudo usermod -aG docker $USER
```

#### 3. Problemas de memória
```bash
# Limpar containers antigos
docker system prune -a

# Limpar volumes não utilizados
docker volume prune
```

### Logs e Debugging

```bash
# Logs do backend
docker compose logs backend

# Logs do frontend
docker compose logs frontend

# Logs do MongoDB
docker compose logs mongo

# Logs de todos os serviços
docker compose logs -f
```

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

**Desenvolvido com ❤️ para conectar pessoas e serviços**