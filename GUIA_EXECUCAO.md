# 🚀 GUIA DE EXECUÇÃO - ALÇA HUB

## 📋 Pré-requisitos

- Python 3.9+
- MongoDB 4.4+
- Node.js 16+ (para frontend)
- Git

---

## 🔧 1. SETUP INICIAL

### **1.1 Clonar e Preparar Ambiente**

```bash
# Navegar até o projeto
cd /Users/lezinrew/Projetos/alca-hub

# Criar ambiente virtual Python
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# ou
venv\Scripts\activate  # Windows

# Instalar dependências do backend
cd backend
pip install -r requirements.txt

# Voltar ao root
cd ..
```

### **1.2 Configurar Variáveis de Ambiente**

```bash
# Copiar arquivo de exemplo
cp env.example .env

# Editar .env com suas configurações
# Principais variáveis:
# MONGO_URL=mongodb://localhost:27017
# DB_NAME=alca_hub
# SECRET_KEY=sua-chave-secreta-aqui
# MERCADOPAGO_ACCESS_TOKEN=seu-token-aqui
```

### **1.3 Iniciar MongoDB**

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod

# Docker
docker run -d -p 27017:27017 --name mongodb mongo:4.4

# Verificar se está rodando
mongosh --eval "db.adminCommand('ping')"
```

---

## ✅ 2. EXECUTAR TESTES

### **2.1 Testes Unitários**

```bash
cd backend

# Executar todos os testes
pytest

# Com verbose
pytest -v

# Com cobertura
pytest --cov=. --cov-report=html

# Apenas testes unitários
pytest tests/unit/ -v
```

**Resultado Esperado:**
```
tests/unit/test_rate_limiting.py ......                 [100%]

====== 6 passed in 2.34s ======
```

### **2.2 Testes de Integração (Beanie ODM)**

```bash
# Certifique-se de que MongoDB está rodando!

# Executar testes de integração
pytest tests/integration/test_beanie_models.py -v

# Com cobertura
pytest tests/integration/test_beanie_models.py --cov=models --cov-report=html
```

**Resultado Esperado:**
```
tests/integration/test_beanie_models.py::test_create_service PASSED    [ 2%]
tests/integration/test_beanie_models.py::test_service_soft_delete PASSED [ 5%]
...
tests/integration/test_beanie_models.py::test_query_bookings_by_status PASSED [100%]

====== 35 passed in 8.52s ======
```

### **2.3 Ver Relatório de Cobertura**

```bash
# Abrir relatório HTML
open htmlcov/index.html  # macOS
xdg-open htmlcov/index.html  # Linux
start htmlcov/index.html  # Windows
```

---

## 🚀 3. EXECUTAR SERVIDOR

### **3.1 Modo Desenvolvimento**

```bash
cd backend

# Iniciar servidor com hot-reload
uvicorn server:app --reload --host 0.0.0.0 --port 8000

# Ou usando o script de desenvolvimento
cd ..
./dev.sh
```

**Resultado Esperado:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using StatReload
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
✅ Beanie ODM inicializado
INFO:     Application startup complete.
```

### **3.2 Modo Produção**

```bash
# Usar o script de produção
./prod.sh

# Ou manualmente com Gunicorn
cd backend
gunicorn server:app -w 4 -k uvicorn.workers.UvicornWorker \
         --bind 0.0.0.0:8000 \
         --timeout 120 \
         --access-logfile - \
         --error-logfile -
```

### **3.3 Verificar se Está Rodando**

```bash
# Health check
curl http://localhost:8000/ping

# Resultado esperado:
# {"message":"pong"}

# Documentação API
open http://localhost:8000/docs  # Swagger UI
open http://localhost:8000/redoc  # ReDoc
```

---

## 📊 4. TESTES DE PERFORMANCE (LOCUST)

### **4.1 Instalação do Locust**

```bash
cd backend

# Instalar Locust (já está em requirements.txt)
pip install locust>=2.15.0

# Verificar instalação
locust --version
```

### **4.2 Executar com Interface Web**

```bash
# Iniciar Locust com UI
locust -f tests/performance/locustfile.py --host=http://localhost:8000

# Abrir navegador em: http://localhost:8089
# Configurar:
# - Number of users: 100
# - Spawn rate: 10 users/second
# - Host: http://localhost:8000
# - Clicar em "Start swarming"
```

**Interface Web:**
```
┌────────────────────────────────────────┐
│  Locust                                │
├────────────────────────────────────────┤
│  Total users: 100                      │
│  RPS: 45.2                             │
│  Failures: 0.0%                        │
│                                        │
│  [Charts] [Statistics] [Failures]     │
└────────────────────────────────────────┘
```

### **4.3 Executar Headless (Sem Interface)**

```bash
# Load Test: 1000 usuários, 50/s, 5 minutos
locust -f tests/performance/locustfile.py \
       --host=http://localhost:8000 \
       --users 1000 \
       --spawn-rate 50 \
       --run-time 5m \
       --headless \
       --html=reports/load_test_report.html \
       --csv=reports/load_test

# Stress Test: 2000 usuários, 100/s, 3 minutos
locust -f tests/performance/locustfile.py \
       --host=http://localhost:8000 \
       --users 2000 \
       --spawn-rate 100 \
       --run-time 3m \
       --headless \
       --html=reports/stress_test_report.html

# Spike Test: 5000 usuários, 500/s, 1 minuto
locust -f tests/performance/locustfile.py \
       --host=http://localhost:8000 \
       --users 5000 \
       --spawn-rate 500 \
       --run-time 1m \
       --headless \
       --html=reports/spike_test_report.html
```

**Resultado Esperado (Headless):**
```
[2025-10-14 10:30:00,000] INFO/locust.main: Starting Locust 2.15.0
[2025-10-14 10:30:00,100] INFO/locust.runners: Spawning 1000 users at rate 50.0 users/s
[2025-10-14 10:30:20,200] INFO/locust.runners: All users spawned
...
[2025-10-14 10:35:00,000] INFO/locust.runners: Stopping 1000 users

Name                                      # reqs      # fails  |     Avg     Min     Max  Median  |   req/s failures/s
-------------------------------------------------------------------------------------------------------------------
GET /api/providers                         12453         0(0%)  |     234      45     890     210  |  41.51     0.00
POST /api/auth/register                     2103         0(0%)  |     342      89    1234     310  |   7.01     0.00
...
-------------------------------------------------------------------------------------------------------------------
Aggregated                                 25032         0(0%)  |     267      45    1890     230  |  83.44     0.00

Response time percentiles (approximated):
Type        Name                                              50%    66%    75%    80%    90%    95%    98%    99%  99.9% 99.99%   100%
----------------------------------------------------------------------------------------------------------------------------------------
GET         /api/providers                                    210    250    280    300    380    450    650    780   1200   1800    890
POST        /api/auth/register                                310    360    400    430    520    620    850   1000   1800   2500   1234
...
```

### **4.4 Analisar Resultados**

```bash
# Abrir relatório HTML
open reports/load_test_report.html

# Ver CSV
cat reports/load_test_stats.csv
cat reports/load_test_stats_history.csv
cat reports/load_test_failures.csv
```

**Métricas a Validar:**
- ✅ P95 < 500ms
- ✅ P99 < 1000ms
- ✅ RPS > 500
- ✅ Error rate < 0.1%
- ✅ Availability > 99.9%

---

## 🗄️ 5. TRABALHAR COM BEANIE ODM

### **5.1 Inicializar Beanie no Server**

```python
# backend/server.py
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from models.user import User
from models.service import Service
from models.booking import Booking
from models.payment import Payment

@app.on_event("startup")
async def startup_event():
    """Inicializar Beanie ao iniciar aplicação"""
    client = AsyncIOMotorClient(os.getenv("MONGO_URL"))

    await init_beanie(
        database=client[os.getenv("DB_NAME")],
        document_models=[
            User,
            Service,
            Booking,
            Payment
        ]
    )

    print("✅ Beanie ODM inicializado")
```

### **5.2 Exemplos de Uso**

#### **Criar Serviço**

```python
from models.service import Service
from core.enums import ServiceStatus

# Criar serviço
service = Service(
    prestador_id="prestador-123",
    titulo="Limpeza Residencial",
    descricao="Limpeza completa de residências",
    categoria="limpeza",
    preco_base=150.0,
    duracao_estimada=180,
    latitude=-23.5505,
    longitude=-46.6333
)

await service.insert()
print(f"Serviço criado: {service.id}")
```

#### **Buscar Serviços**

```python
from repositories.service_repository import ServiceRepository

repo = ServiceRepository()

# Buscar por categoria
services = await repo.find_by_categoria("limpeza", ativo=True, limit=10)

# Buscar próximos (geolocalização)
nearby = await repo.find_nearby(
    lat=-23.5505,
    lon=-46.6333,
    radius_km=10,
    categoria="limpeza"
)

# Buscar top-rated
top_rated = await repo.find_top_rated(limit=10, min_rating=4.0)
```

#### **Criar Agendamento**

```python
from models.booking import Booking
from datetime import datetime, timedelta

# Criar agendamento
booking = Booking(
    service_id=service.id,
    prestador_id="prestador-123",
    morador_id="morador-456",
    data_agendamento=datetime.utcnow() + timedelta(days=1),
    horario_inicio="09:00",
    horario_fim="12:00",
    endereco="Rua Teste, 123",
    valor_acordado=150.0
)

await booking.insert()

# Confirmar por prestador
await booking.confirm("prestador")

# Confirmar por morador
await booking.confirm("morador")

# Iniciar
await booking.start()

# Concluir
await booking.complete()

# Avaliar
await booking.rate("morador", 5.0, "Excelente serviço!")
```

#### **Processar Pagamento**

```python
from models.payment import Payment
from core.enums import PaymentStatus

# Criar pagamento
payment = Payment(
    booking_id=booking.id,
    service_id=service.id,
    prestador_id="prestador-123",
    morador_id="morador-456",
    valor_servico=150.0,
    taxa_plataforma=10.0,  # 10%
    metodo_pagamento="pix"
)

await payment.insert()
print(f"Pagamento criado: {payment.id}")
print(f"Valor total: R$ {payment.valor_total}")
print(f"Prestador recebe: R$ {payment.valor_prestador}")
print(f"Plataforma recebe: R$ {payment.valor_taxa}")

# Marcar como pago
await payment.mark_as_paid(
    gateway_payment_id="mp-12345",
    comprovante_url="https://example.com/comprovante.pdf"
)
```

---

## 🐳 6. EXECUTAR COM DOCKER

### **6.1 Docker Compose (Desenvolvimento)**

```bash
# Subir todos os serviços
docker-compose -f docker-compose.dev.yml up -d

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f

# Parar serviços
docker-compose -f docker-compose.dev.yml down

# Rebuild
docker-compose -f docker-compose.dev.yml up -d --build
```

### **6.2 Docker Compose (Produção)**

```bash
# Subir em produção
docker-compose -f docker-compose.prod.yml up -d

# Ver status
docker-compose -f docker-compose.prod.yml ps

# Escalar backend
docker-compose -f docker-compose.prod.yml up -d --scale backend=4
```

---

## 🔍 7. MONITORAMENTO E DEBUG

### **7.1 Ver Logs Estruturados**

```bash
# Logs do backend
tail -f backend/logs/app.log

# Filtrar por nível
grep "ERROR" backend/logs/app.log
grep "WARNING" backend/logs/app.log

# Logs de segurança
grep "security_event" backend/logs/app.log | jq .

# Logs de usuários
grep "user_action" backend/logs/app.log | jq .
```

### **7.2 Monitorar MongoDB**

```bash
# Conectar ao MongoDB
mongosh

# Ver databases
show dbs

# Usar database
use alca_hub

# Ver collections
show collections

# Ver serviços
db.services.find().pretty()

# Ver agendamentos pendentes
db.bookings.find({status: "pendente"}).pretty()

# Ver pagamentos pagos
db.payments.find({status: "pago"}).pretty()

# Estatísticas
db.services.countDocuments()
db.bookings.countDocuments()
db.payments.countDocuments()
```

### **7.3 Verificar Índices**

```bash
# Conectar ao MongoDB
mongosh

use alca_hub

# Ver índices de serviços
db.services.getIndexes()

# Ver índices de agendamentos
db.bookings.getIndexes()

# Ver índices de pagamentos
db.payments.getIndexes()

# Analisar performance de query
db.services.find({categoria: "limpeza"}).explain("executionStats")
```

---

## 🐛 8. TROUBLESHOOTING

### **8.1 Problema: Testes Falhando**

```bash
# Verificar se MongoDB está rodando
mongosh --eval "db.adminCommand('ping')"

# Limpar banco de testes
mongosh alca_hub_test --eval "db.dropDatabase()"

# Reexecutar testes
pytest tests/integration/test_beanie_models.py -v
```

### **8.2 Problema: Locust Não Conecta**

```bash
# Verificar se servidor está rodando
curl http://localhost:8000/ping

# Verificar se porta está livre
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Reiniciar servidor
pkill -f uvicorn
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

### **8.3 Problema: Beanie Não Inicializa**

```bash
# Verificar logs
tail -f backend/logs/app.log

# Verificar se models estão corretos
python3 -c "from models.service import Service; print(Service.Settings.name)"

# Verificar MongoDB connection
python3 -c "from motor.motor_asyncio import AsyncIOMotorClient; client = AsyncIOMotorClient('mongodb://localhost:27017'); print(client.list_database_names())"
```

### **8.4 Problema: Performance Ruim**

```bash
# Verificar índices
mongosh alca_hub --eval "db.services.getIndexes()"

# Analisar queries lentas
mongosh alca_hub --eval "db.setProfilingLevel(2)"
mongosh alca_hub --eval "db.system.profile.find().sort({ts:-1}).limit(5).pretty()"

# Ver estatísticas de collections
mongosh alca_hub --eval "db.services.stats()"
```

---

## 📝 9. COMANDOS ÚTEIS

### **9.1 Limpar Ambiente**

```bash
# Limpar banco de dados de teste
mongosh alca_hub_test --eval "db.dropDatabase()"

# Limpar cache do Python
find . -type d -name "__pycache__" -exec rm -r {} +
find . -type f -name "*.pyc" -delete

# Limpar relatórios de testes
rm -rf htmlcov/ .coverage .pytest_cache/ reports/
```

### **9.2 Backup do Banco**

```bash
# Backup completo
mongodump --db alca_hub --out backup/$(date +%Y%m%d)

# Restaurar backup
mongorestore --db alca_hub backup/20251014/alca_hub/
```

### **9.3 Verificar Saúde do Sistema**

```bash
# Backend
curl http://localhost:8000/ping

# MongoDB
mongosh --eval "db.adminCommand('ping')"

# Frontend
curl http://localhost:3000

# Todos de uma vez
./monitor.sh
```

---

## 📚 10. REFERÊNCIAS RÁPIDAS

### **Documentação**

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Beanie Docs](https://roman-right.github.io/beanie/)
- [Locust Docs](https://docs.locust.io/)
- [Pydantic Docs](https://docs.pydantic.dev/)
- [MongoDB Docs](https://docs.mongodb.com/)

### **Arquivos de Documentação Interna**

- [RESUMO_EXECUTIVO_COMPLETO.md](RESUMO_EXECUTIVO_COMPLETO.md)
- [FASE3_EXECUTADA_RESUMO.md](FASE3_EXECUTADA_RESUMO.md)
- [MIGRACAO_BEANIE_ODM.md](MIGRACAO_BEANIE_ODM.md)
- [ARQUITETURA_REFATORADA.md](ARQUITETURA_REFATORADA.md)
- [backend/tests/performance/README.md](backend/tests/performance/README.md)

### **Estrutura de Diretórios**

```
alca-hub/
├── backend/
│   ├── models/              # Beanie Document models
│   │   ├── user.py
│   │   ├── service.py       ✅ NOVO
│   │   ├── booking.py       ✅ NOVO
│   │   └── payment.py       ✅ NOVO
│   │
│   ├── repositories/        # Data access layer
│   │   ├── base.py
│   │   ├── user_repository.py
│   │   ├── service_repository.py   ✅ NOVO
│   │   ├── booking_repository.py   ✅ NOVO
│   │   └── payment_repository.py   ✅ NOVO
│   │
│   ├── services/            # Business logic
│   │   └── user_service.py
│   │
│   ├── core/                # Core utilities
│   │   ├── enums.py         ✅ NOVO
│   │   └── dependencies.py  ✅ NOVO
│   │
│   └── tests/
│       ├── unit/
│       │   └── test_rate_limiting.py  ✅ NOVO
│       │
│       ├── integration/
│       │   └── test_beanie_models.py  ✅ NOVO
│       │
│       └── performance/
│           ├── locustfile.py          ✅ NOVO
│           └── README.md              ✅ NOVO
│
└── docs/
    ├── RESUMO_EXECUTIVO_COMPLETO.md   ✅ NOVO
    ├── FASE3_EXECUTADA_RESUMO.md      ✅ NOVO
    ├── MIGRACAO_BEANIE_ODM.md         ✅ NOVO
    └── GUIA_EXECUCAO.md               ✅ NOVO (VOCÊ ESTÁ AQUI!)
```

---

## ✅ CHECKLIST DE VALIDAÇÃO

### **Antes de Commit**

- [ ] Todos os testes passam (`pytest`)
- [ ] Cobertura > 90% (`pytest --cov`)
- [ ] Linting OK (`flake8`, `black`, `isort`)
- [ ] Type checking OK (`mypy`)
- [ ] Performance tests executados
- [ ] Documentação atualizada

### **Antes de Deploy**

- [ ] Testes de integração passam
- [ ] Testes de performance validados (P95 < 500ms, P99 < 1s)
- [ ] Logs estruturados funcionando
- [ ] Rate limiting configurado
- [ ] Backup do banco de dados
- [ ] Rollback plan definido
- [ ] Monitoramento configurado

---

**Preparado por:** Claude 3.5 Sonnet
**Data:** 14 de outubro de 2025
**Versão:** 1.0.0

**Dúvidas?** Consulte [RESUMO_EXECUTIVO_COMPLETO.md](RESUMO_EXECUTIVO_COMPLETO.md)
