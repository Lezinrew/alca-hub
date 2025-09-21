# Alça Hub 🏠

Sistema completo de gestão de serviços para condomínios, conectando moradores e prestadores de serviços através de uma plataforma moderna e intuitiva.

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-purple.svg)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green.svg)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green.svg)](https://mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-blue.svg)](https://tailwindcss.com/)

## 📋 Visão Geral

O **Alça Hub** é uma plataforma web que facilita a contratação de serviços domésticos e profissionais dentro de condomínios. A aplicação permite que moradores encontrem e contratem prestadores de serviços próximos, enquanto prestadores podem oferecer seus serviços e gerenciar seus agendamentos.

### 🎯 Principais Funcionalidades

#### **Para Moradores:**
- 🔍 **Busca Inteligente** - Encontre serviços por categoria e localização
- 🗺️ **Mapa Interativo** - Visualize prestadores próximos em tempo real
- 📅 **Agendamento Fácil** - Sistema de agendamento intuitivo
- 💳 **Pagamento PIX** - Integração segura com Mercado Pago
- ⭐ **Sistema de Avaliações** - Avalie e comente sobre serviços
- 📱 **Interface Responsiva** - Funciona perfeitamente em mobile e desktop
- 🏠 **Dashboard Personalizado** - Acompanhe seus pedidos e estatísticas

#### **Para Prestadores:**
- 🛠️ **Gestão de Serviços** - Cadastre e gerencie seus serviços
- 📊 **Dashboard Completo** - Controle de agendamentos e faturamento
- 📍 **Geolocalização** - Apareça no mapa para maior visibilidade
- 💰 **Controle Financeiro** - Acompanhe pagamentos e recebimentos
- 📈 **Relatórios** - Estatísticas detalhadas de performance

#### **Para Administradores:**
- 🎛️ **Painel de Controle** - Gestão completa da plataforma
- 👥 **Gestão de Usuários** - Controle de moradores e prestadores
- 📊 **Relatórios Avançados** - Estatísticas e métricas da plataforma
- 🔧 **Configurações** - Personalização da plataforma

## 🛠️ Tecnologias Utilizadas

### **Frontend (React + Vite)**
- **React 19** - Biblioteca moderna para interfaces de usuário
- **Vite 5.0** - Build tool ultra-rápido e moderno
- **React Router 6** - Roteamento declarativo
- **Tailwind CSS 3.3** - Framework CSS utility-first
- **Radix UI** - Componentes acessíveis e customizáveis
- **Framer Motion** - Animações fluidas e performáticas
- **Axios** - Cliente HTTP com interceptors
- **Leaflet** - Mapas interativos e responsivos
- **QRCode** - Geração de códigos QR para pagamentos
- **Lucide React** - Ícones modernos e consistentes

### **Backend (FastAPI + MongoDB)**
- **FastAPI 0.104** - Framework web moderno e rápido
- **MongoDB 7.0** - Banco de dados NoSQL escalável
- **Motor** - Driver assíncrono para MongoDB
- **JWT** - Autenticação e autorização segura
- **Mercado Pago** - Gateway de pagamento brasileiro
- **Pydantic** - Validação e serialização de dados
- **Uvicorn** - Servidor ASGI de alta performance
- **Bcrypt** - Criptografia de senhas
- **CORS** - Configuração de políticas de origem cruzada

## 🚀 Instalação e Configuração

### **Pré-requisitos**
- Python 3.9+ (recomendado 3.11)
- Node.js 18+ (recomendado 20+)
- MongoDB 7.0+
- Yarn ou npm
- Git

### **📱 Aplicativos Mobile**
O Alça Hub também está disponível como aplicativos nativos para Android e iOS! 

**Para gerar o APK Android:**
- 📖 **[Guia Completo Android](docs/mobile/android/GUIA_ANDROID_APK.md)** - Instruções detalhadas para gerar APK
- 🧪 **[Guia de Testes Android](docs/mobile/android/TESTE_ANDROID_CELULAR.md)** - Como testar no celular
- 🔧 **Tecnologia**: Capacitor + React + Android Studio
- 📱 **Compatibilidade**: Android 11+ (API 30+)

**Para gerar o App iOS:**
- 📖 **[Guia Completo iOS](docs/mobile/ios/GUIA_IOS_APP.md)** - Instruções detalhadas para gerar app iOS
- 🧪 **[Guia de Testes iOS](docs/mobile/ios/TESTE_IOS_IPHONE.md)** - Como testar no iPhone
- 🔧 **Tecnologia**: Capacitor + React + Xcode
- 📱 **Compatibilidade**: iOS 15+ (iPhone/iPad)

### **📚 Documentação Completa**
- 📖 **[Índice da Documentação](docs/README.md)** - Navegação completa
- 🚀 **[Guia de Instalação](docs/guides/installation/GUIA_INSTALACAO.md)** - Setup completo
- 📱 **[Mobile](docs/mobile/)** - Apps Android e iOS
- 🔧 **[Desenvolvimento](docs/guides/)** - Guias de desenvolvimento

### **1. Clone o Repositório**
```bash
git clone https://github.com/Lezinrew/alca-hub.git
cd alca-hub
```

### **2. Configuração do Backend**

```bash
# Navegue para a pasta backend
cd backend

# Crie um ambiente virtual
python -m venv venv

# Ative o ambiente virtual
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Instale as dependências
pip install -r requirements.txt
```

**Configure as variáveis de ambiente:**
```bash
# Crie um arquivo .env na pasta backend
MONGO_URL=mongodb://localhost:27017
DB_NAME=alca_hub
MERCADO_PAGO_ACCESS_TOKEN=seu_token_aqui
MERCADO_PAGO_PUBLIC_KEY=sua_chave_publica_aqui
WEBHOOK_SECRET=seu_webhook_secret_aqui
CORS_ORIGINS=http://localhost:5173
JWT_SECRET_KEY=sua_chave_secreta_jwt_aqui
```

**Execute o servidor:**
```bash
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

### **3. Configuração do Frontend**

```bash
# Navegue para a pasta frontend
cd ../frontend

# Instale as dependências
yarn install
# ou
npm install
```

**Configure as variáveis de ambiente:**
```bash
# Crie um arquivo .env na pasta frontend
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=Alça Hub
```

**Execute o servidor de desenvolvimento:**
```bash
yarn dev
# ou
npm run dev
```

### **4. Acesse a Aplicação**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Documentação API**: http://localhost:8000/docs

## 📱 Como Usar

### **Para Moradores**

1. **Cadastro e Login**
   - Acesse a plataforma e crie sua conta
   - Complete seu perfil com informações básicas
   - Ative a geolocalização para encontrar serviços próximos

2. **Buscar Serviços**
   - Use a barra de busca para encontrar serviços específicos
   - Filtre por categoria (limpeza, manutenção, etc.)
   - Visualize prestadores no mapa interativo

3. **Agendar Serviços**
   - Selecione um prestador de sua preferência
   - Escolha data e horário disponíveis
   - Adicione observações específicas se necessário

4. **Pagamento e Avaliação**
   - Pague via PIX de forma segura
   - Avalie o serviço após a conclusão
   - Acompanhe o histórico de pedidos

### **Para Prestadores**

1. **Cadastro de Prestador**
   - Registre-se como prestador de serviços
   - Complete seu perfil profissional
   - Adicione documentos e certificações

2. **Gestão de Serviços**
   - Cadastre seus serviços com preços e descrições
   - Configure horários de disponibilidade
   - Ative a geolocalização para aparecer no mapa

3. **Controle de Agendamentos**
   - Receba notificações de novos agendamentos
   - Confirme ou rejeite solicitações
   - Gerencie sua agenda profissional

4. **Dashboard Financeiro**
   - Acompanhe pagamentos recebidos
   - Visualize relatórios de faturamento
   - Gerencie suas finanças

### **Para Administradores**

1. **Painel Administrativo**
   - Acesse o dashboard administrativo
   - Visualize estatísticas gerais da plataforma
   - Monitore atividade de usuários

2. **Gestão de Usuários**
   - Aprove ou rejeite cadastros de prestadores
   - Gerencie contas de usuários
   - Configure permissões e acessos

3. **Relatórios e Analytics**
   - Exporte dados em CSV
   - Visualize métricas de uso
   - Monitore performance da plataforma

## 🔧 API Endpoints

### **Autenticação**
```
POST   /api/auth/register     # Cadastro de usuário
POST   /api/auth/login        # Login
GET    /api/auth/me           # Dados do usuário atual
POST   /api/auth/logout       # Logout
POST   /api/auth/refresh     # Renovar token
```

### **Usuários**
```
GET    /api/users             # Listar usuários
GET    /api/users/{id}        # Detalhes do usuário
PUT    /api/users/{id}        # Atualizar usuário
DELETE /api/users/{id}        # Deletar usuário
```

### **Serviços**
```
GET    /api/services          # Listar serviços
POST   /api/services          # Criar serviço
GET    /api/services/{id}     # Detalhes do serviço
PUT    /api/services/{id}     # Atualizar serviço
DELETE /api/services/{id}     # Deletar serviço
```

### **Agendamentos**
```
GET    /api/bookings          # Listar agendamentos
POST   /api/bookings          # Criar agendamento
GET    /api/bookings/{id}     # Detalhes do agendamento
PUT    /api/bookings/{id}     # Atualizar agendamento
DELETE /api/bookings/{id}     # Cancelar agendamento
```

### **Pagamentos**
```
POST   /api/payments/pix      # Criar pagamento PIX
GET    /api/payments/{id}     # Status do pagamento
POST   /api/payments/webhook  # Webhook do Mercado Pago
```

### **Mapa e Geolocalização**
```
GET    /api/map/providers-nearby  # Prestadores próximos
POST   /api/map/update-location   # Atualizar localização
```

## 🗂️ Estrutura do Projeto

```
alca-hub/
├── 📁 backend/                    # API FastAPI
│   ├── 📄 server.py              # Servidor principal
│   ├── 📄 requirements.txt       # Dependências Python
│   ├── 📁 auth/                  # Módulo de autenticação
│   │   ├── 📄 routes.py         # Rotas de auth
│   │   ├── 📄 middleware.py     # Middleware de segurança
│   │   └── 📄 security.py       # Configurações de segurança
│   ├── 📁 tests/                # Testes automatizados
│   └── 📁 venv/                 # Ambiente virtual
├── 📁 frontend/                   # Aplicação React
│   ├── 📁 src/
│   │   ├── 📁 components/        # Componentes React
│   │   │   ├── 📄 GlobalHeader.jsx
│   │   │   ├── 📄 EnhancedDashboard.jsx
│   │   │   ├── 📄 MyOrders.jsx
│   │   │   └── 📄 ReviewScreen.jsx
│   │   ├── 📁 pages/            # Páginas da aplicação
│   │   │   ├── 📄 Mapa.jsx
│   │   │   └── 📄 AdminDashboard.jsx
│   │   ├── 📁 hooks/            # Hooks customizados
│   │   ├── 📁 lib/              # Utilitários e configurações
│   │   ├── 📁 data/             # Dados mockados
│   │   └── 📁 contexts/         # Contextos React
│   ├── 📁 android/              # Aplicativo Android (Capacitor)
│   │   ├── 📁 app/              # Código nativo Android
│   │   ├── 📄 build.gradle       # Configuração Gradle
│   │   └── 📄 gradle.properties # Propriedades do projeto
│   ├── 📁 ios/                  # Aplicativo iOS (Capacitor)
│   │   ├── 📁 App/              # Código nativo iOS
│   │   ├── 📄 Podfile           # Configuração CocoaPods
│   │   └── 📄 Info.plist        # Configurações do app
│   ├── 📁 public/               # Arquivos estáticos
│   ├── 📄 package.json          # Dependências Node.js
│   ├── 📄 capacitor.config.json # Configuração Capacitor
│   ├── 📄 vite.config.js        # Configuração do Vite
│   └── 📄 tailwind.config.js   # Configuração do Tailwind
├── 📄 docker-compose.yml         # Configuração Docker
├── 📄 .env.example              # Exemplo de variáveis de ambiente
└── 📄 README.md                # Este arquivo
```

## 🎨 Interface e Design

### **Sistema de Design**
- **Paleta de Cores**: Azul (#3B82F6), Verde (#10B981), Laranja (#F59E0B)
- **Tipografia**: Inter (sans-serif)
- **Componentes**: Radix UI + Tailwind CSS
- **Ícones**: Lucide React
- **Animações**: Framer Motion

### **Responsividade**
- **Mobile First**: Design otimizado para dispositivos móveis
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Grid System**: CSS Grid + Flexbox
- **Componentes Adaptativos**: Interface que se adapta ao tamanho da tela

### **Acessibilidade**
- **ARIA Labels**: Navegação por leitores de tela
- **Contraste**: Cores com contraste adequado
- **Navegação por Teclado**: Suporte completo
- **Foco Visível**: Indicadores de foco claros

## 🔒 Segurança

### **Autenticação e Autorização**
- **JWT Tokens**: Tokens seguros com expiração
- **Refresh Tokens**: Renovação automática de sessões
- **Bcrypt**: Criptografia de senhas
- **Rate Limiting**: Proteção contra ataques de força bruta

### **Validação de Dados**
- **Pydantic**: Validação rigorosa de dados
- **Sanitização**: Limpeza de inputs maliciosos
- **CORS**: Configuração de políticas de origem
- **CSRF Protection**: Proteção contra ataques CSRF

### **Pagamentos**
- **Mercado Pago**: Gateway seguro e confiável
- **Webhook Validation**: Validação de notificações
- **PCI Compliance**: Conformidade com padrões de segurança
- **Criptografia**: Dados sensíveis criptografados

## 🚀 Deploy e Produção

### **Backend (Produção)**
```bash
# Instalar dependências
pip install -r requirements.txt

# Executar com Gunicorn
gunicorn server:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# Com Docker
docker build -t alca-hub-backend .
docker run -p 8000:8000 alca-hub-backend
```

### **Frontend (Produção)**
```bash
# Build da aplicação
yarn build

# Servir com nginx
# Configuração nginx recomendada
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### **Docker Compose**
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - MONGO_URL=mongodb://mongo:27017
    depends_on:
      - mongo
  
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
  
  mongo:
    image: mongo:7.0
    ports:
      - "27017:27017"
```

## 🧪 Testes

### **Backend Tests**
```bash
cd backend
python -m pytest tests/ -v
```

### **Frontend Tests**
```bash
cd frontend
yarn test
```

### **E2E Tests**
```bash
# Instalar Playwright
yarn add -D @playwright/test

# Executar testes E2E
yarn playwright test
```

## 📊 Performance

### **Otimizações Implementadas**
- **Code Splitting**: Carregamento sob demanda
- **Lazy Loading**: Componentes carregados quando necessário
- **Image Optimization**: Imagens otimizadas e responsivas
- **Caching**: Cache inteligente de dados
- **Bundle Optimization**: Bundles otimizados e minificados

### **Métricas de Performance**
- **Lighthouse Score**: 95+ em todas as categorias
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

## 🤝 Contribuição

### **Como Contribuir**
1. **Fork** o projeto
2. **Clone** seu fork: `git clone https://github.com/seu-usuario/alca-hub.git`
3. **Crie** uma branch: `git checkout -b feature/nova-funcionalidade`
4. **Commit** suas mudanças: `git commit -m 'Adiciona nova funcionalidade'`
5. **Push** para a branch: `git push origin feature/nova-funcionalidade`
6. **Abra** um Pull Request

### **Padrões de Código**
- **ESLint**: Configuração rigorosa para JavaScript/React
- **Prettier**: Formatação automática de código
- **Husky**: Git hooks para qualidade de código
- **Conventional Commits**: Padrão de mensagens de commit

### **Estrutura de Commits**
```
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação
refactor: refatoração
test: testes
chore: tarefas de manutenção
```

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte e Contato

### **Canais de Suporte**
- 📧 **Email**: suporte@alcahub.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/Lezinrew/alca-hub/issues)
- 💬 **Discord**: [Servidor da Comunidade](https://discord.gg/alcahub)
- 📱 **WhatsApp**: +55 (11) 99999-9999

### **Documentação Adicional**
- 📚 **Wiki**: [GitHub Wiki](https://github.com/Lezinrew/alca-hub/wiki)
- 🎥 **Vídeos**: [Canal do YouTube](https://youtube.com/alcahub)
- 📖 **Blog**: [Blog Técnico](https://blog.alcahub.com)

## 🎉 Agradecimentos

### **Equipe de Desenvolvimento**
- **Leandro Xavier de Pinho** - Desenvolvedor Full Stack
- **Equipe de Design** - Interface e UX
- **Equipe de QA** - Testes e Qualidade

### **Tecnologias e Comunidade**
- **React Team** - Biblioteca incrível
- **FastAPI Team** - Framework moderno
- **Tailwind CSS** - Framework CSS
- **Comunidade Open Source** - Suporte e contribuições

### **Usuários Beta**
- **Moradores Beta** - Feedback valioso
- **Prestadores Beta** - Testes em produção
- **Administradores Beta** - Validação de funcionalidades

## 🗺️ Roadmap

### **Próximas Funcionalidades**
- [x] **App Mobile Android** - Aplicativo nativo (✅ Implementado)
- [x] **App Mobile iOS** - Aplicativo nativo para iPhone (✅ Implementado)
- [ ] **Chat em Tempo Real** - Comunicação instantânea
- [ ] **Notificações Push** - Alertas mobile
- [ ] **Integração WhatsApp** - Agendamentos via WhatsApp
- [ ] **Sistema de Cupons** - Descontos e promoções
- [ ] **Relatórios Avançados** - Analytics detalhados
- [ ] **API Pública** - Integração com terceiros
- [ ] **IA e Machine Learning** - Recomendações inteligentes

### **Melhorias Planejadas**
- [ ] **Performance** - Otimizações adicionais
- [ ] **Acessibilidade** - Melhorias de acessibilidade
- [ ] **Internacionalização** - Suporte a múltiplos idiomas
- [ ] **Temas** - Modo escuro e personalização
- [ ] **PWA** - Progressive Web App

---

## 🏆 Status do Projeto

![GitHub last commit](https://img.shields.io/github/last-commit/Lezinrew/alca-hub)
![GitHub issues](https://img.shields.io/github/issues/Lezinrew/alca-hub)
![GitHub pull requests](https://img.shields.io/github/issues-pr/Lezinrew/alca-hub)
![GitHub stars](https://img.shields.io/github/stars/Lezinrew/alca-hub)

**Alça Hub** - Conectando pessoas, facilitando serviços! 🏠✨

*Desenvolvido com ❤️ pela equipe Alça Hub*