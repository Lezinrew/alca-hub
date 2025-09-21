# 🚀 Guia de Instalação - Alça Hub

## 📋 Pré-requisitos

### **Sistema Operacional**
- **Linux**: Ubuntu 20.04+ (recomendado)
- **macOS**: 10.15+ (Catalina ou superior)
- **Windows**: 10+ com WSL2 (recomendado)

### **Software Necessário**
- **Python**: 3.9+ (recomendado 3.11)
- **Node.js**: 18+ (recomendado 20+)
- **MongoDB**: 7.0+
- **Git**: 2.30+
- **Yarn**: 1.22+ (ou npm 8+)

### **Ferramentas de Desenvolvimento**
- **VS Code**: Editor recomendado
- **Docker**: Para containerização (opcional)
- **Postman**: Para testes de API (opcional)

## 🔧 Instalação Passo a Passo

### **1. Clone do Repositório**

```bash
# Clone o repositório
git clone https://github.com/Lezinrew/alca-hub.git
cd alca-hub

# Verifique a estrutura
ls -la
```

### **2. Configuração do Backend**

#### **2.1. Ambiente Virtual**
```bash
# Navegue para a pasta backend
cd backend

# Crie o ambiente virtual
python -m venv venv

# Ative o ambiente virtual
# Linux/macOS:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Verifique a instalação
python --version
pip --version
```

#### **2.2. Instalação de Dependências**
```bash
# Atualize o pip
pip install --upgrade pip

# Instale as dependências
pip install -r requirements.txt

# Verifique as dependências instaladas
pip list
```

#### **2.3. Configuração de Variáveis de Ambiente**
```bash
# Crie o arquivo .env
touch .env

# Adicione as configurações (substitua pelos seus valores)
cat > .env << EOF
# Banco de dados
MONGO_URL=mongodb://localhost:27017
DB_NAME=alca_hub

# Autenticação
JWT_SECRET_KEY=sua_chave_secreta_jwt_aqui
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=seu_token_aqui
MERCADO_PAGO_PUBLIC_KEY=sua_chave_publica_aqui
MERCADO_PAGO_WEBHOOK_SECRET=seu_webhook_secret_aqui

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Ambiente
ENVIRONMENT=development
DEBUG=True
LOG_LEVEL=INFO
EOF
```

#### **2.4. Execução do Backend**
```bash
# Execute o servidor de desenvolvimento
uvicorn server:app --reload --host 0.0.0.0 --port 8000

# Ou execute com configurações específicas
uvicorn server:app --reload --host 0.0.0.0 --port 8000 --log-level info
```

### **3. Configuração do Frontend**

#### **3.1. Navegação para o Frontend**
```bash
# Volte para a raiz do projeto
cd ..

# Navegue para o frontend
cd frontend

# Verifique a estrutura
ls -la
```

#### **3.2. Instalação de Dependências**
```bash
# Instale as dependências com Yarn (recomendado)
yarn install

# Ou com npm
npm install

# Verifique as dependências
yarn list --depth=0
```

#### **3.3. Configuração de Variáveis de Ambiente**
```bash
# Crie o arquivo .env
touch .env

# Adicione as configurações
cat > .env << EOF
# API Backend
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=Alça Hub
VITE_APP_VERSION=1.0.0

# Ambiente
VITE_NODE_ENV=development
VITE_DEBUG=true

# Recaptcha (opcional)
VITE_RECAPTCHA_SITE_KEY=sua_chave_recaptcha_aqui

# Analytics (opcional)
VITE_GA_TRACKING_ID=seu_google_analytics_id_aqui
EOF
```

#### **3.4. Execução do Frontend**
```bash
# Execute o servidor de desenvolvimento
yarn dev

# Ou com npm
npm run dev

# Acesse: http://localhost:5173
```

### **4. Configuração do MongoDB**

#### **4.1. Instalação do MongoDB**
```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS com Homebrew
brew install mongodb-community

# Windows
# Baixe do site oficial: https://www.mongodb.com/try/download/community
```

#### **4.2. Inicialização do MongoDB**
```bash
# Inicie o serviço MongoDB
sudo systemctl start mongod

# Verifique o status
sudo systemctl status mongod

# Acesse o shell do MongoDB
mongosh
```

#### **4.3. Criação do Banco de Dados**
```javascript
// No shell do MongoDB
use alca_hub

// Crie as coleções iniciais
db.createCollection("users")
db.createCollection("services")
db.createCollection("bookings")
db.createCollection("payments")

// Verifique as coleções
show collections
```

## 🐳 Instalação com Docker

### **1. Docker Compose**
```bash
# Na raiz do projeto
docker-compose up -d

# Verifique os containers
docker-compose ps

# Logs dos containers
docker-compose logs -f
```

### **2. Dockerfile Personalizado**
```dockerfile
# Backend Dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 🔍 Verificação da Instalação

### **1. Testes de Conectividade**
```bash
# Teste o backend
curl http://localhost:8000/health

# Teste o frontend
curl http://localhost:5173

# Teste o MongoDB
mongosh --eval "db.adminCommand('ping')"
```

### **2. Testes de Funcionalidade**
```bash
# Teste a API
curl -X GET http://localhost:8000/api/health

# Teste a autenticação
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

### **3. Testes de Interface**
```bash
# Abra o navegador
open http://localhost:5173

# Verifique o console do navegador
# Pressione F12 para abrir as ferramentas de desenvolvedor
```

## 🛠️ Configurações Avançadas

### **1. Configuração de Proxy**
```nginx
# nginx.conf
server {
    listen 80;
    server_name localhost;
    
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location / {
        proxy_pass http://localhost:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### **2. Configuração de SSL**
```bash
# Gere certificados SSL
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Configure HTTPS
# Adicione ao .env:
HTTPS=true
SSL_CERT_PATH=./cert.pem
SSL_KEY_PATH=./key.pem
```

### **3. Configuração de Logs**
```python
# logging.conf
[loggers]
keys=root,alca_hub

[handlers]
keys=consoleHandler,fileHandler

[formatters]
keys=simpleFormatter

[logger_root]
level=DEBUG
handlers=consoleHandler

[logger_alca_hub]
level=DEBUG
handlers=consoleHandler,fileHandler
qualname=alca_hub
propagate=0

[handler_consoleHandler]
class=StreamHandler
level=DEBUG
formatter=simpleFormatter
args=(sys.stdout,)

[handler_fileHandler]
class=FileHandler
level=DEBUG
formatter=simpleFormatter
args=('alca_hub.log',)

[formatter_simpleFormatter]
format=%(asctime)s - %(name)s - %(levelname)s - %(message)s
```

## 🚨 Solução de Problemas

### **1. Problemas Comuns**

#### **Erro: Porta já em uso**
```bash
# Encontre o processo usando a porta
lsof -i :8000
lsof -i :5173

# Mate o processo
kill -9 <PID>
```

#### **Erro: Dependências não encontradas**
```bash
# Limpe o cache
yarn cache clean
npm cache clean --force

# Reinstale as dependências
rm -rf node_modules package-lock.json
yarn install
```

#### **Erro: MongoDB não conecta**
```bash
# Verifique se o MongoDB está rodando
sudo systemctl status mongod

# Reinicie o serviço
sudo systemctl restart mongod

# Verifique os logs
sudo journalctl -u mongod
```

### **2. Logs e Debugging**
```bash
# Logs do backend
tail -f backend/logs/app.log

# Logs do frontend
yarn dev --verbose

# Logs do MongoDB
tail -f /var/log/mongodb/mongod.log
```

### **3. Performance**
```bash
# Monitor de recursos
htop

# Uso de memória
free -h

# Uso de disco
df -h
```

## 📚 Documentação Adicional

### **1. Links Úteis**
- [Documentação FastAPI](https://fastapi.tiangolo.com/)
- [Documentação React](https://reactjs.org/docs/)
- [Documentação MongoDB](https://docs.mongodb.com/)
- [Documentação Tailwind CSS](https://tailwindcss.com/docs)

### **2. Ferramentas de Desenvolvimento**
- [VS Code Extensions](https://code.visualstudio.com/docs/editor/extension-marketplace)
- [Postman Collection](https://www.postman.com/)
- [MongoDB Compass](https://www.mongodb.com/products/compass)

### **3. Comunidade**
- [GitHub Issues](https://github.com/Lezinrew/alca-hub/issues)
- [Discord Server](https://discord.gg/alcahub)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/alca-hub)

---

## 🎉 Instalação Concluída!

Parabéns! Você configurou com sucesso o ambiente de desenvolvimento do Alça Hub. 

### **Próximos Passos:**
1. **Explore a aplicação**: Navegue pelas funcionalidades
2. **Leia a documentação**: Familiarize-se com a API
3. **Contribua**: Faça melhorias e reporte bugs
4. **Compartilhe**: Ajude outros desenvolvedores

**Bem-vindo à comunidade Alça Hub! 🚀**
