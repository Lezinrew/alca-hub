# 🚀 Guia de Instalação - Alca Hub

Este guia fornece instruções completas para instalar e configurar o projeto Alca Hub em diferentes ambientes.

## 📋 Pré-requisitos

### **Sistema Operacional**
- **macOS** 12.0+ (recomendado)
- **Linux** Ubuntu 20.04+ ou similar
- **Windows** 10+ com WSL2

### **Software Necessário**
- **Python** 3.9+ (recomendado 3.11)
- **Node.js** 18+ (recomendado 20+)
- **MongoDB** 7.0+
- **Git** 2.30+
- **Yarn** ou **npm**

### **Ferramentas Opcionais**
- **Docker** (para containerização)
- **Android Studio** (para apps mobile)
- **Xcode** (para apps iOS)

## 🛠️ Instalação Completa

### **1. Clone do Repositório**

```bash
# Clone o repositório
git clone https://github.com/Lezinrew/alca-hub.git
cd alca-hub

# Verificar se está na branch correta
git branch
```

### **2. Configuração do Backend**

#### **2.1 Instalar Python e Dependências**

```bash
# Navegar para o backend
cd backend

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt
```

#### **2.2 Configurar Variáveis de Ambiente**

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar variáveis (use seu editor preferido)
nano .env
```

**Configuração mínima do .env:**
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=alca_hub
MERCADO_PAGO_ACCESS_TOKEN=seu_token_aqui
MERCADO_PAGO_PUBLIC_KEY=sua_chave_publica_aqui
WEBHOOK_SECRET=seu_webhook_secret_aqui
CORS_ORIGINS=http://localhost:5173
JWT_SECRET_KEY=sua_chave_secreta_jwt_aqui
```

#### **2.3 Instalar e Configurar MongoDB**

**Opção 1: MongoDB Local**
```bash
# macOS com Homebrew
brew install mongodb-community

# Iniciar MongoDB
brew services start mongodb-community

# Verificar se está rodando
mongosh --eval "db.runCommand('ping')"
```

**Opção 2: MongoDB com Docker**
```bash
# Usar o docker-compose incluído
docker-compose up -d mongo
```

### **3. Configuração do Frontend**

#### **3.1 Instalar Node.js e Dependências**

```bash
# Navegar para o frontend
cd ../frontend

# Instalar dependências
yarn install
# ou
npm install
```

#### **3.2 Configurar Variáveis de Ambiente**

```bash
# Criar arquivo .env
echo "VITE_API_URL=http://localhost:8000" > .env
echo "VITE_APP_NAME=Alca Hub" >> .env
```

### **4. Executar a Aplicação**

#### **4.1 Iniciar o Backend**

```bash
# No terminal 1
cd backend
source venv/bin/activate  # Linux/macOS
# ou
venv\Scripts\activate     # Windows

uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

#### **4.2 Iniciar o Frontend**

```bash
# No terminal 2
cd frontend
yarn dev
# ou
npm run dev
```

#### **4.3 Verificar Instalação**

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Documentação API**: http://localhost:8000/docs

## 🐳 Instalação com Docker

### **1. Usar Docker Compose**

```bash
# Na raiz do projeto
docker-compose up -d

# Verificar containers
docker-compose ps
```

### **2. Configurar Variáveis de Ambiente**

```bash
# Copiar arquivo de exemplo
cp env.example .env

# Editar variáveis
nano .env
```

### **3. Acessar a Aplicação**

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **MongoDB**: localhost:27017

## 📱 Instalação para Mobile

### **Android**

```bash
# Instalar Capacitor
cd frontend
npm install @capacitor/core @capacitor/cli @capacitor/android

# Configurar projeto
npx cap init "Alca Hub" "com.alca.hub" --web-dir=dist
npx cap add android

# Build e sincronizar
npm run build
npx cap sync android

# Abrir no Android Studio
npx cap open android
```

### **iOS**

```bash
# Instalar Capacitor iOS
npm install @capacitor/ios

# Adicionar plataforma iOS
npx cap add ios

# Build e sincronizar
npm run build
npx cap sync ios

# Abrir no Xcode
npx cap open ios
```

## 🔧 Configurações Avançadas

### **1. Configuração de Produção**

#### **Backend (Produção)**
```bash
# Instalar Gunicorn
pip install gunicorn

# Executar com Gunicorn
gunicorn server:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

#### **Frontend (Produção)**
```bash
# Build da aplicação
yarn build

# Servir com nginx (configuração recomendada)
# Ver nginx.conf no projeto
```

### **2. Configuração de Desenvolvimento**

#### **Hot Reload**
```bash
# Backend com reload automático
uvicorn server:app --reload --host 0.0.0.0 --port 8000

# Frontend com hot reload
yarn dev
```

#### **Debug**
```bash
# Backend com debug
uvicorn server:app --reload --host 0.0.0.0 --port 8000 --log-level debug

# Frontend com debug
yarn dev --debug
```

### **3. Configuração de Banco de Dados**

#### **MongoDB Local**
```bash
# Criar banco e usuário
mongosh
use alca_hub
db.createUser({
  user: "alca_user",
  pwd: "senha_segura",
  roles: ["readWrite"]
})
```

#### **MongoDB Atlas (Cloud)**
```bash
# Configurar string de conexão
MONGO_URL=mongodb+srv://usuario:senha@cluster.mongodb.net/alca_hub?retryWrites=true&w=majority
```

## 🧪 Configuração de Testes

### **1. Instalar Dependências de Teste**

```bash
# Backend
cd backend
pip install pytest pytest-asyncio httpx

# Frontend
cd ../frontend
yarn add -D @testing-library/react @testing-library/jest-dom vitest
```

### **2. Executar Testes**

```bash
# Testes do backend
cd backend
python -m pytest tests/ -v

# Testes do frontend
cd ../frontend
yarn test
```

### **3. Testes E2E**

```bash
# Instalar Playwright
yarn add -D @playwright/test

# Executar testes E2E
yarn playwright test
```

## 🔍 Verificação da Instalação

### **1. Checklist de Verificação**

- [ ] **Backend rodando**: http://localhost:8000/docs
- [ ] **Frontend rodando**: http://localhost:5173
- [ ] **MongoDB conectado**: Sem erros de conexão
- [ ] **API funcionando**: Endpoints respondendo
- [ ] **Interface carregando**: Página principal visível

### **2. Testes Básicos**

```bash
# Testar API
curl http://localhost:8000/health

# Testar frontend
curl http://localhost:5173

# Testar MongoDB
mongosh --eval "db.runCommand('ping')"
```

### **3. Logs de Verificação**

```bash
# Ver logs do backend
tail -f backend/logs/app.log

# Ver logs do frontend
# Verificar console do navegador

# Ver logs do MongoDB
tail -f /var/log/mongodb/mongod.log
```

## 🆘 Solução de Problemas

### **Problema 1: Porta já em uso**
```bash
# Verificar processos usando a porta
lsof -i :8000
lsof -i :5173

# Matar processo se necessário
kill -9 PID_DO_PROCESSO
```

### **Problema 2: MongoDB não conecta**
```bash
# Verificar se MongoDB está rodando
brew services list | grep mongodb

# Reiniciar MongoDB
brew services restart mongodb-community
```

### **Problema 3: Dependências não instalam**
```bash
# Limpar cache
pip cache purge
npm cache clean --force
yarn cache clean

# Reinstalar
pip install -r requirements.txt
yarn install
```

### **Problema 4: Permissões de arquivo**
```bash
# Corrigir permissões
chmod +x scripts/*.sh
chown -R $USER:$USER .
```

## 📊 Monitoramento

### **1. Health Checks**

```bash
# Backend health
curl http://localhost:8000/health

# Frontend health
curl http://localhost:5173

# MongoDB health
mongosh --eval "db.runCommand('ping')"
```

### **2. Métricas de Performance**

```bash
# CPU e memória
htop

# Uso de disco
df -h

# Logs em tempo real
tail -f logs/*.log
```

## 🎯 Próximos Passos

### **Após Instalação**
1. **Configurar Banco**: Criar dados iniciais
2. **Configurar Usuários**: Criar usuários de teste
3. **Configurar Serviços**: Adicionar serviços de exemplo
4. **Testar Funcionalidades**: Verificar todas as funcionalidades

### **Para Produção**
1. **Configurar HTTPS**: Certificados SSL
2. **Configurar Backup**: Backup do banco de dados
3. **Configurar Monitoramento**: Logs e métricas
4. **Configurar CI/CD**: Pipeline de deploy

---

**💡 Dica**: Mantenha sempre as dependências atualizadas e faça backup regular do banco de dados.

**🆘 Suporte**: Se encontrar problemas, consulte a documentação específica ou abra uma issue no GitHub.
