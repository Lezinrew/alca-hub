# Alca Hub

Uma plataforma completa de gestão de serviços para condomínios, conectando moradores e prestadores de serviços através de uma interface moderna e intuitiva.

## 🚀 Features

- **Autenticação Segura** - Sistema de login com JWT e refresh tokens
- **Agendamento em Tempo Real** - Sistema de agendamento intuitivo e responsivo
- **Mapa Interativo** - Visualização de prestadores próximos com geolocalização
- **Pagamentos PIX** - Integração segura com Mercado Pago
- **Sistema de Avaliações** - Avalie e comente sobre serviços prestados
- **Dashboard Administrativo** - Painel completo para gestão da plataforma
- **Apps Mobile** - Aplicativos nativos para Android e iOS
- **Rate Limiting** - Proteção contra ataques de força bruta
- **Logs de Segurança** - Auditoria completa de eventos de segurança

## 🛠️ Tech Stack

**Frontend:** React (Vite), TailwindCSS, Framer Motion, Radix UI
**Backend:** FastAPI (Python), MongoDB, Motor (Async MongoDB Driver)
**Banco de Dados:** MongoDB 7.0
**Infraestrutura:** Docker, Docker Compose
**Mobile:** Capacitor (Android/iOS)
**Pagamentos:** Mercado Pago API
**Segurança:** JWT, Bcrypt, Rate Limiting, CORS

## ⚙️ Começando (Getting Started)

Siga estes passos para ter o ambiente de desenvolvimento rodando localmente.

### Pré-requisitos:

- Docker e Docker Compose
- Python 3.9+
- Node.js 18+ e Yarn
- Git

### Instalação:

1. **Clone o repositório:**
```bash
git clone https://github.com/Lezinrew/alca-hub.git
cd alca-hub
```

2. **Configure o Backend (Python):**
```bash
python3 -m venv .venv
source .venv/bin/activate  # Linux/Mac
# ou
.venv\Scripts\activate     # Windows

pip install -r requirements.txt
pip install -r requirements-dev.txt
```

3. **Configure o Frontend (React):**
```bash
cd frontend
yarn install
cd ..
```

4. **Variáveis de Ambiente:**
```bash
cp .env.example .env
```

**Nota:** Abra o arquivo `.env` e preencha com as variáveis necessárias.

5. **Inicie os serviços com Docker:**
```bash
docker-compose up -d --build
```

## 🚀 Inicialização Rápida

Para uma inicialização mais rápida, use o script automatizado:

```bash
chmod +x start.sh
./start.sh
```

## 📱 Acessos

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Documentação API:** http://localhost:8000/docs
- **MongoDB:** mongodb://localhost:27017

## 🧪 Testes

### Backend Tests
```bash
cd backend
python -m pytest tests/ -v
```

### Frontend Tests
```bash
cd frontend
yarn test
```

### E2E Tests
```bash
cd frontend
yarn playwright test
```

## 📖 Documentação

Toda a documentação detalhada do projeto, incluindo guias de arquitetura, deploy e contribuição, pode ser encontrada na pasta [docs/](docs/).

### Guias Principais:
- 📖 **[Guia de Instalação](docs/guides/installation/GUIA_INSTALACAO.md)**
- 🚀 **[Guia de Deploy](GUIA_DEPLOY_SERVIDOR.md)**
- 📱 **[Mobile Apps](docs/mobile/)**
- 🐳 **[Docker Setup](DOCKER.md)**

## 🔧 Desenvolvimento

### Estrutura do Projeto
```
alca-hub/
├── 📁 backend/                 # API FastAPI
│   ├── 📁 auth/               # Módulo de autenticação
│   ├── 📁 tests/              # Testes automatizados
│   └── 📄 requirements.txt    # Dependências Python
├── 📁 frontend/               # Aplicação React
│   ├── 📁 src/                # Código fonte
│   ├── 📁 android/            # App Android
│   ├── 📁 ios/                # App iOS
│   └── 📄 package.json        # Dependências Node.js
├── 📁 docs/                   # Documentação
└── 📄 docker-compose.yml      # Orquestração de serviços
```

### Comandos Úteis

```bash
# Ver logs dos serviços
docker-compose logs -f

# Parar todos os serviços
docker-compose down

# Rebuild completo
docker-compose up --build

# Executar testes
./run_tests.sh

# Gerar APK Android
./generate_apk.sh
```

## 🔒 Segurança

- **Autenticação JWT** com refresh tokens
- **Rate Limiting** para proteção contra ataques
- **Criptografia Bcrypt** para senhas
- **Headers de Segurança** (CORS, CSP, etc.)
- **Logs de Auditoria** para eventos de segurança
- **Validação de Dados** com Pydantic

## 📊 Performance

- **Lighthouse Score:** 95+ em todas as categorias
- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s
- **Cumulative Layout Shift:** < 0.1

## 🤝 Contribuição

1. **Fork** o projeto
2. **Clone** seu fork: `git clone https://github.com/seu-usuario/alca-hub.git`
3. **Crie** uma branch: `git checkout -b feature/nova-funcionalidade`
4. **Commit** suas mudanças: `git commit -m 'feat: adiciona nova funcionalidade'`
5. **Push** para a branch: `git push origin feature/nova-funcionalidade`
6. **Abra** um Pull Request

### Padrões de Código
- **ESLint** + **Prettier** para JavaScript/React
- **Black** + **Flake8** para Python
- **Conventional Commits** para mensagens de commit
- **Husky** para git hooks

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

- 📧 **Email:** suporte@alcahub.com
- 🐛 **Issues:** [GitHub Issues](https://github.com/Lezinrew/alca-hub/issues)
- 💬 **Discord:** [Servidor da Comunidade](https://discord.gg/alcahub)

---

**Alça Hub** - Conectando pessoas, facilitando serviços! 🏠✨

*Desenvolvido com ❤️ pela equipe Alça Hub*