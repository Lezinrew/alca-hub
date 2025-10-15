# 🚀 Testes de Performance - Alça Hub

## 📋 Visão Geral

Suite completa de testes de performance usando **Locust** para validar escalabilidade e identificar gargalos.

---

## 🎯 Objetivos

1. **Load Testing**: Validar comportamento sob carga normal (100-1000 usuários)
2. **Stress Testing**: Identificar limites do sistema (1000-5000 usuários)
3. **Spike Testing**: Testar resiliência a picos de carga
4. **Soak Testing**: Validar estabilidade em longo prazo (24h)

---

## 📦 Instalação

### **1. Instalar Locust**

```bash
# Adicionar ao requirements.txt
echo "locust>=2.15.0" >> backend/requirements.txt

# Instalar
pip install locust>=2.15.0
```

### **2. Verificar Instalação**

```bash
locust --version
# Output: locust 2.15.0
```

---

## 🚀 Execução dos Testes

### **Teste 1: Load Test Básico (Interface Web)**

```bash
# Navegar para diretório de testes
cd backend/tests/performance

# Iniciar Locust com interface web
locust -f locustfile.py --host=http://localhost:8000

# Acessar interface: http://localhost:8089
# Configurar:
# - Number of users: 100
# - Spawn rate: 10 users/second
# - Host: http://localhost:8000
```

**Métricas Esperadas (100 usuários):**
- ✅ RPS (Requests/s): 50-100 req/s
- ✅ Latência média: < 200ms
- ✅ P95: < 500ms
- ✅ P99: < 1000ms
- ✅ Taxa de erro: < 1%

---

### **Teste 2: Load Test Headless (Automatizado)**

```bash
# Load test com 500 usuários por 5 minutos
locust -f locustfile.py \\
    --host=http://localhost:8000 \\
    --users 500 \\
    --spawn-rate 25 \\
    --run-time 5m \\
    --headless \\
    --html report_load_500users.html \\
    --csv report_load_500users

# Resultados salvos em:
# - report_load_500users.html (relatório visual)
# - report_load_500users_stats.csv (estatísticas)
# - report_load_500users_failures.csv (falhas)
```

**Métricas Esperadas (500 usuários):**
- ✅ RPS: 200-300 req/s
- ✅ Latência média: < 300ms
- ✅ P95: < 800ms
- ✅ P99: < 1500ms
- ✅ Taxa de erro: < 2%

---

### **Teste 3: Stress Test (Identificar Limites)**

```bash
# Stress test gradual até 2000 usuários
locust -f locustfile.py \\
    --host=http://localhost:8000 \\
    --users 2000 \\
    --spawn-rate 50 \\
    --run-time 10m \\
    --headless \\
    --html report_stress_2000users.html

# O teste aumentará gradualmente de 0 a 2000 usuários
# Observar em que ponto o sistema degrada
```

**Critérios de Falha:**
- ❌ Latência P95 > 2000ms
- ❌ Taxa de erro > 5%
- ❌ CPU > 90% sustentado
- ❌ Memória > 90%

---

### **Teste 4: Spike Test (Picos de Carga)**

```bash
# Simular pico súbito de 0 para 1000 usuários
locust -f locustfile.py \\
    --host=http://localhost:8000 \\
    --users 1000 \\
    --spawn-rate 1000 \\
    --run-time 3m \\
    --headless \\
    --html report_spike_1000users.html

# Spawn rate = 1000: todos os usuários entram em 1 segundo
```

**Métricas de Resiliência:**
- ✅ Sistema não cai
- ✅ Rate limiting funciona (429 errors ok)
- ✅ Recuperação em < 30s após pico
- ✅ Sem vazamento de memória

---

### **Teste 5: Soak Test (Longo Prazo)**

```bash
# Teste de 24 horas com carga moderada
locust -f locustfile.py \\
    --host=http://localhost:8000 \\
    --users 200 \\
    --spawn-rate 20 \\
    --run-time 24h \\
    --headless \\
    --html report_soak_24h.html

# Executar em background
nohup locust -f locustfile.py ... > locust.log 2>&1 &
```

**Critérios de Estabilidade:**
- ✅ Latência estável (não aumenta com tempo)
- ✅ Memória estável (sem vazamentos)
- ✅ Taxa de erro constante
- ✅ CPU estável

---

## 📊 Cenários de Teste

### **Cenário 1: Horário de Pico**
Simula tráfego durante horário comercial (9h-18h)

```bash
locust -f locustfile.py \\
    --host=http://localhost:8000 \\
    --users 800 \\
    --spawn-rate 40 \\
    --run-time 1h \\
    --headless
```

### **Cenário 2: Black Friday**
Simula evento com tráfego 10x maior

```bash
locust -f locustfile.py \\
    --host=http://localhost:8000 \\
    --users 5000 \\
    --spawn-rate 100 \\
    --run-time 30m \\
    --headless
```

### **Cenário 3: Manutenção**
Valida funcionalidade com recursos reduzidos

```bash
# Limitar CPU/memória do container
docker update --cpus="1" --memory="512m" alca-hub-backend

# Executar teste
locust -f locustfile.py \\
    --host=http://localhost:8000 \\
    --users 100 \\
    --spawn-rate 10 \\
    --run-time 10m
```

---

## 📈 Métricas e KPIs

### **SLA (Service Level Agreement)**

| Métrica | Target | Crítico |
|---------|--------|---------|
| **Disponibilidade** | 99.9% | 99.5% |
| **Latência P95** | < 500ms | < 1000ms |
| **Latência P99** | < 1000ms | < 2000ms |
| **Taxa de Erro** | < 0.1% | < 1% |
| **RPS** | > 100 req/s | > 50 req/s |

### **Recursos (Single Server)**

| Recurso | Normal | Peak | Crítico |
|---------|--------|------|---------|
| **CPU** | < 50% | < 70% | < 90% |
| **Memória** | < 60% | < 80% | < 90% |
| **Disco I/O** | < 50% | < 70% | < 90% |
| **Network** | < 40% | < 60% | < 80% |

---

## 🔍 Análise de Resultados

### **1. Analisar Relatório HTML**

```bash
# Abrir relatório no navegador
open report_load_500users.html

# Métricas importantes:
# - Total Requests
# - Failures
# - Median Response Time
# - 95th/99th percentile
# - Requests/s
```

### **2. Analisar CSV**

```bash
# Ver estatísticas
cat report_load_500users_stats.csv | column -t -s,

# Ver falhas
cat report_load_500users_failures.csv
```

### **3. Identificar Gargalos**

**Sintomas de Gargalos:**
- ❌ Latência crescente com carga
- ❌ Taxa de erro aumentando
- ❌ RPS não escala linearmente
- ❌ Timeouts frequentes

**Possíveis Causas:**
1. **Banco de Dados**
   - Queries lentas
   - Falta de índices
   - Connection pool saturado

2. **API**
   - Endpoints lentos
   - Bloqueio I/O síncrono
   - Processamento pesado

3. **Infraestrutura**
   - CPU saturada
   - Memória insuficiente
   - Network bandwidth

---

## 🎯 Baseline de Performance

### **Estabelecer Baseline**

```bash
# 1. Executar teste com carga leve
locust -f locustfile.py --host=http://localhost:8000 \\
    --users 50 --spawn-rate 5 --run-time 5m --headless \\
    --html baseline_50users.html

# 2. Salvar métricas
echo "Baseline established on $(date)" > baseline_metrics.txt
grep "Requests/s" baseline_50users.html >> baseline_metrics.txt
grep "Response Time" baseline_50users.html >> baseline_metrics.txt

# 3. Comparar testes futuros com baseline
```

### **Regressão de Performance**

Execute baseline após cada deploy para detectar regressões:

```bash
# CI/CD: Falhar se P95 > 2x baseline
if [ $p95_current -gt $((p95_baseline * 2)) ]; then
    echo "❌ Performance regression detected!"
    exit 1
fi
```

---

## 🐛 Debugging de Performance

### **1. Profiling com cProfile**

```python
# backend/server.py
import cProfile
import pstats

@app.middleware("http")
async def profile_middleware(request, call_next):
    profiler = cProfile.Profile()
    profiler.enable()

    response = await call_next(request)

    profiler.disable()
    stats = pstats.Stats(profiler)
    stats.sort_stats('cumulative')
    stats.print_stats(10)  # Top 10 funções

    return response
```

### **2. Monitoring em Tempo Real**

```bash
# Terminal 1: Executar teste
locust -f locustfile.py --host=http://localhost:8000

# Terminal 2: Monitorar recursos
watch -n 1 'docker stats alca-hub-backend --no-stream'

# Terminal 3: Monitorar logs
docker logs -f alca-hub-backend | grep "ERROR\|WARNING"
```

### **3. Análise de Queries Lentas**

```python
# Habilitar query logging no MongoDB
# mongod.conf
systemLog:
  verbosity: 1
  component:
    query:
      verbosity: 2

# Analisar slow queries
db.system.profile.find().sort({millis: -1}).limit(10)
```

---

## 📚 Referências

- [Locust Documentation](https://docs.locust.io/)
- [Performance Testing Best Practices](https://loadninja.com/articles/performance-testing-best-practices/)
- [SLA/SLO Guidelines](https://sre.google/sre-book/service-level-objectives/)

---

## ✅ Checklist Pré-Teste

- [ ] Servidor em produção mode (`ENV=production`)
- [ ] Rate limiting desabilitado (ou ajustado para teste)
- [ ] Monitoring ativo (Prometheus, Grafana)
- [ ] Backup do banco de dados
- [ ] Recursos adequados (CPU, memória, disco)
- [ ] Network estável
- [ ] Logs configurados

---

**Preparado por:** Claude 3.5 Sonnet
**Data:** 14 de outubro de 2025
**Versão:** 1.0.0
