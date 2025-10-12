# 🐳 Docker Setup - Alça Hub

Este documento explica como configurar e executar o Alça Hub usando Docker e Docker Compose.

## 📋 Pré-requisitos

- Docker 20.10+
- Docker Compose 2.0+
- 4GB RAM disponível
- 10GB espaço em disco

## 🚀 Início Rápido

### 1. Clone o repositório
```bash
git clone <repository-url>
cd alca-hub
```

### 2. Configure as variáveis de ambiente
```bash
cp env.example .env
# Edite o arquivo .env com suas configurações
```

### 3. Execute o script de inicialização
```bash
./start.sh
```

## 🔧 Comandos Disponíveis

### Script de Inicialização
```bash
# Modo padrão (produção)
./start.sh

# Modo desenvolvimento
./start.sh dev

# Parar serviços
./start.sh stop

# Ver logs
./start.sh logs

# Limpar tudo
./start.sh clean
```

### Docker Compose Manual
```bash
# Iniciar todos os serviços
docker-compose up -d

# Iniciar em modo desenvolvimento
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Parar serviços
docker-compose down

# Rebuild e iniciar
docker-compose up --build

# Ver logs
docker-compose logs -f

# Ver status
docker-compose ps
```

## 🏗️ Arquitetura dos Serviços

### Backend (FastAPI)
- **Porta:** 8000
- **Health Check:** http://localhost:8000/ping
- **Hot Reload:** Modo desenvolvimento
- **Logs:** Volume `backend_logs`

### Frontend (React)
- **Porta:** 3000
- **Health Check:** http://localhost:3000/health
- **Hot Reload:** Modo desenvolvimento
- **Build:** Otimizado para produção

### MongoDB
- **Porta:** 27017
- **Health Check:** Comando `mongosh`
- **Dados:** Volume `mongo_data`
- **Config:** Volume `mongo_config`

## 🌐 Acessos

| Serviço | URL | Descrição |
|---------|-----|-----------|
| Frontend | http://localhost:3000 | Interface do usuário |
| Backend API | http://localhost:8000 | API REST |
| Backend Docs | http://localhost:8000/docs | Documentação Swagger |
| MongoDB | mongodb://localhost:27017 | Banco de dados |

## 📁 Estrutura de Volumes

```
alca-hub/
├── mongo_data/          # Dados do MongoDB
├── mongo_config/        # Configuração do MongoDB
└── backend_logs/        # Logs do backend
```

## 🔧 Configurações

### Variáveis de Ambiente (.env)

```bash
# Banco de dados
MONGO_URL=mongodb://mongo:27017
MONGO_DATABASE=alca_hub
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=password123

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=seu_token
MERCADO_PAGO_PUBLIC_KEY=sua_chave
WEBHOOK_SECRET=seu_secret

# Ambiente
DEBUG=0
ENV=dev
CORS_ORIGINS=http://localhost:3000

# Frontend
REACT_APP_BACKEND_URL=http://localhost:8000
NODE_ENV=development
```

## 🐛 Troubleshooting

### Problemas Comuns

1. **Porta já em uso**
   ```bash
   # Verificar processos usando as portas
   lsof -i :3000
   lsof -i :8000
   lsof -i :27017
   ```

2. **Erro de permissão**
   ```bash
   # Dar permissão ao script
   chmod +x start.sh
   ```

3. **Containers não iniciam**
   ```bash
   # Limpar e rebuild
   docker-compose down --volumes
   docker-compose up --build
   ```

4. **Problemas de rede**
   ```bash
   # Verificar networks
   docker network ls
   docker network inspect alca-hub-network
   ```

### Logs e Debug

```bash
# Ver logs de todos os serviços
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongo

# Entrar no container
docker-compose exec backend bash
docker-compose exec frontend sh
docker-compose exec mongo mongosh
```

## 🔒 Segurança

### Produção
- Use senhas fortes para MongoDB
- Configure HTTPS
- Use secrets do Docker
- Configure firewall

### Desenvolvimento
- MongoDB sem autenticação
- CORS liberado
- Debug habilitado

## 📊 Monitoramento

### Health Checks
- Backend: `curl http://localhost:8000/ping`
- Frontend: `curl http://localhost:3000/health`
- MongoDB: `mongosh --eval "db.adminCommand('ping')"`

### Métricas
```bash
# Uso de recursos
docker stats

# Espaço em disco
docker system df

# Volumes
docker volume ls
```

## 🚀 Deploy em Produção

### 1. Configurar variáveis de produção
```bash
# Editar .env para produção
ENV=production
DEBUG=0
MONGO_ROOT_PASSWORD=senha_forte
```

### 2. Usar docker-compose.prod.yml
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 3. Configurar proxy reverso (Nginx)
```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    
    location / {
        proxy_pass http://localhost:3000;
    }
    
    location /api/ {
        proxy_pass http://localhost:8000;
    }
}
```

## 📚 Comandos Úteis

```bash
# Backup do banco
docker-compose exec mongo mongodump --out /backup

# Restore do banco
docker-compose exec mongo mongorestore /backup

# Limpar sistema Docker
docker system prune -a

# Ver imagens
docker images

# Remover imagens não utilizadas
docker image prune
```

## 🤝 Contribuição

1. Faça fork do projeto
2. Crie uma branch para sua feature
3. Teste com Docker
4. Faça commit das mudanças
5. Abra um Pull Request

## 📞 Suporte

- Issues no GitHub
- Documentação: [Link para docs]
- Email: suporte@alcahub.com
