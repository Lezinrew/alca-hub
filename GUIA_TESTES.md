# 🧪 Guia Completo de Testes - Alça Hub

## Índice
1. [Preparação do Ambiente](#preparação-do-ambiente)
2. [Testes Manuais com cURL](#testes-manuais-com-curl)
3. [Testes com Postman](#testes-com-postman)
4. [Testes Automatizados](#testes-automatizados)
5. [Testes de Performance](#testes-de-performance)
6. [Troubleshooting](#troubleshooting)

---

## 1. Preparação do Ambiente

### 1.1. Iniciar MongoDB

```bash
# Verificar se MongoDB está rodando
pgrep -f mongod

# Se não estiver rodando, iniciar:
mongod --dbpath=/path/to/data

# Ou se instalado via Homebrew (macOS):
brew services start mongodb-community
```

### 1.2. Iniciar o Servidor Backend

```bash
# Navegar para o diretório backend
cd /Users/lezinrew/Projetos/alca-hub/backend

# Limpar variáveis de ambiente do Docker
unset MONGO_URL MONGO_DATABASE MONGO_ROOT_USERNAME MONGO_ROOT_PASSWORD

# Iniciar servidor
python3 -m uvicorn server:app --host 127.0.0.1 --port 8000 --reload

# Aguardar mensagem:
# ✅ Beanie ODM inicializado com sucesso
# INFO: Uvicorn running on http://127.0.0.1:8000
```

### 1.3. Verificar Servidor Está Funcionando

```bash
# Testar health check
curl http://127.0.0.1:8000/health

# Resposta esperada:
# {"status":"healthy"}
```

---

## 2. Testes Manuais com cURL

### 2.1. Teste de Registro (POST /api/auth/register)

```bash
# Registrar novo usuário
curl -X POST http://127.0.0.1:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "senha": "senha123456",
    "nome": "João Silva",
    "cpf": "12345678900",
    "telefone": "11999999999",
    "endereco": "Rua Teste, 123",
    "cidade": "São Paulo",
    "estado": "SP",
    "cep": "01310-100",
    "tipos": ["morador"],
    "aceitou_termos": true
  }' | python3 -m json.tool

# ✅ Resposta esperada (200 OK):
# {
#   "message": "Usuário criado com sucesso",
#   "user": {
#     "id": "...",
#     "email": "joao@example.com",
#     "nome": "João Silva",
#     "tipos": ["morador"]
#   },
#   "token": "eyJ..."
# }
```

### 2.2. Teste de Login (POST /api/auth/login)

```bash
# Login com usuário criado
curl -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "senha": "senha123456"
  }' | python3 -m json.tool

# ✅ Resposta esperada (200 OK):
# {
#   "access_token": "eyJ...",
#   "token_type": "bearer",
#   "user": {
#     "id": "...",
#     "email": "joao@example.com"
#   }
# }

# Salvar o token para próximos testes:
TOKEN=$(curl -s -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@example.com","senha":"senha123456"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

echo "Token: $TOKEN"
```

### 2.3. Teste de Buscar Usuário (GET /api/users/{id})

```bash
# Primeiro, obter o ID do usuário do token anterior
USER_ID=$(curl -s -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@example.com","senha":"senha123456"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['user']['id'])")

echo "User ID: $USER_ID"

# Buscar usuário por ID
curl -X GET "http://127.0.0.1:8000/api/users/$USER_ID" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# ✅ Resposta esperada (200 OK):
# {
#   "id": "...",
#   "email": "joao@example.com",
#   "nome": "João Silva",
#   "tipos": ["morador"],
#   "ativo": true
# }
```

### 2.4. Teste de Atualizar Usuário (PUT /api/users/{id})

```bash
# Atualizar nome do usuário
curl -X PUT "http://127.0.0.1:8000/api/users/$USER_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva Santos",
    "telefone": "11988888888"
  }' | python3 -m json.tool

# ✅ Resposta esperada (200 OK):
# {
#   "message": "Usuário atualizado com sucesso",
#   "user": {
#     "nome": "João Silva Santos",
#     "telefone": "11988888888"
#   }
# }
```

### 2.5. Teste de Listar Usuários (GET /api/users)

```bash
# Listar usuários (requer ser admin)
curl -X GET "http://127.0.0.1:8000/api/users?skip=0&limit=10" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# ⚠️ Se não for admin, retorna 403:
# {
#   "detail": "Acesso restrito a administradores"
# }
```

### 2.6. Teste de Estatísticas (GET /api/users/stats/general)

```bash
# Obter estatísticas (requer ser admin)
curl -X GET "http://127.0.0.1:8000/api/users/stats/general" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# ✅ Resposta esperada (200 OK - se admin):
# {
#   "total_usuarios": 5,
#   "usuarios_ativos": 4,
#   "usuarios_inativos": 1,
#   "por_tipo": {
#     "morador": 3,
#     "prestador": 1,
#     "admin": 1
#   }
# }
```

### 2.7. Teste de Soft Delete (DELETE /api/users/{id})

```bash
# Desativar usuário (soft delete)
curl -X DELETE "http://127.0.0.1:8000/api/users/$USER_ID" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# ✅ Resposta esperada (200 OK):
# {
#   "message": "Usuário desativado (soft delete)",
#   "user_id": "..."
# }
```

### 2.8. Teste de Tentativas de Login (Bloqueio de Conta)

```bash
# Tentar login com senha errada 5 vezes
for i in {1..5}; do
  echo "Tentativa $i:"
  curl -X POST http://127.0.0.1:8000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"joao@example.com","senha":"senhaERRADA"}' \
    | python3 -m json.tool
  sleep 1
done

# Após 5 tentativas, a conta é bloqueada:
# {
#   "detail": "Conta bloqueada temporariamente devido a múltiplas tentativas de login. Tente novamente em 1 hora."
# }
```

### 2.9. Teste de Token Inválido

```bash
# Tentar acessar com token inválido
curl -X GET "http://127.0.0.1:8000/api/users/$USER_ID" \
  -H "Authorization: Bearer token_invalido_aqui" | python3 -m json.tool

# ✅ Resposta esperada (401 Unauthorized):
# {
#   "detail": "Token inválido ou expirado"
# }
```

### 2.10. Teste de Usuário Duplicado

```bash
# Tentar registrar com email já existente
curl -X POST http://127.0.0.1:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "senha": "senha123456",
    "nome": "Outro João",
    "cpf": "98765432100",
    "telefone": "11988887777",
    "endereco": "Rua Outra, 456",
    "tipos": ["morador"],
    "aceitou_termos": true
  }' | python3 -m json.tool

# ✅ Resposta esperada (400 Bad Request):
# {
#   "detail": "Email já cadastrado"
# }
```

---

## 3. Testes com Postman

### 3.1. Importar Collection

Crie uma collection no Postman com os seguintes requests:

#### Collection: Alça Hub API

**Environment Variables:**
- `base_url`: `http://127.0.0.1:8000`
- `token`: (será preenchido automaticamente)

**Requests:**

1. **Register User**
   - Method: `POST`
   - URL: `{{base_url}}/api/auth/register`
   - Body (JSON):
   ```json
   {
     "email": "teste@postman.com",
     "senha": "senha123456",
     "nome": "Teste Postman",
     "cpf": "11122233344",
     "telefone": "11999998888",
     "endereco": "Rua Postman, 100",
     "tipos": ["morador"],
     "aceitou_termos": true
   }
   ```
   - Tests (salvar token):
   ```javascript
   if (pm.response.code === 200) {
       pm.environment.set("token", pm.response.json().token);
       pm.environment.set("user_id", pm.response.json().user.id);
   }
   ```

2. **Login**
   - Method: `POST`
   - URL: `{{base_url}}/api/auth/login`
   - Body (JSON):
   ```json
   {
     "email": "teste@postman.com",
     "senha": "senha123456"
   }
   ```
   - Tests:
   ```javascript
   if (pm.response.code === 200) {
       pm.environment.set("token", pm.response.json().access_token);
       pm.environment.set("user_id", pm.response.json().user.id);
   }
   ```

3. **Get User Profile**
   - Method: `GET`
   - URL: `{{base_url}}/api/users/{{user_id}}`
   - Headers:
     - `Authorization`: `Bearer {{token}}`

4. **Update User**
   - Method: `PUT`
   - URL: `{{base_url}}/api/users/{{user_id}}`
   - Headers:
     - `Authorization`: `Bearer {{token}}`
   - Body (JSON):
   ```json
   {
     "nome": "Teste Postman Atualizado",
     "telefone": "11977776666"
   }
   ```

5. **List Users**
   - Method: `GET`
   - URL: `{{base_url}}/api/users?skip=0&limit=10`
   - Headers:
     - `Authorization`: `Bearer {{token}}`

6. **Delete User**
   - Method: `DELETE`
   - URL: `{{base_url}}/api/users/{{user_id}}`
   - Headers:
     - `Authorization`: `Bearer {{token}}`

---

## 4. Testes Automatizados

### 4.1. Testes de Integração

```bash
cd /Users/lezinrew/Projetos/alca-hub/backend

# Rodar testes de integração do User model
pytest tests/integration/test_user_model.py -v

# Rodar com cobertura
pytest tests/integration/test_user_model.py --cov=models.user --cov-report=html

# Ver relatório de cobertura
open htmlcov/index.html
```

### 4.2. Testes E2E

```bash
# Rodar testes end-to-end
pytest tests/e2e/test_user_endpoints.py -v

# Rodar todos os testes
pytest tests/ -v

# Rodar apenas testes de autenticação
pytest tests/ -v -k "auth"
```

### 4.3. Configurar pytest (se houver problemas)

```bash
# Instalar dependências
pip install pytest pytest-asyncio pytest-cov httpx

# Se tiver problema com event loop, usar:
pytest tests/integration/test_user_model.py -v --asyncio-mode=auto

# Ou criar arquivo pytest.ini na raiz:
cat > pytest.ini << 'EOF'
[pytest]
asyncio_mode = auto
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
EOF
```

---

## 5. Testes de Performance

### 5.1. Instalar Locust

```bash
pip install locust
```

### 5.2. Criar Arquivo de Teste (locustfile.py)

```bash
cat > /Users/lezinrew/Projetos/alca-hub/backend/tests/performance/locustfile.py << 'EOF'
from locust import HttpUser, task, between
import random

class AlcaHubUser(HttpUser):
    wait_time = between(1, 3)

    def on_start(self):
        """Executado quando usuário inicia"""
        # Registrar usuário
        email = f"test{random.randint(1000, 9999)}@example.com"
        response = self.client.post("/api/auth/register", json={
            "email": email,
            "senha": "senha123456",
            "nome": "Test User",
            "cpf": f"{random.randint(10000000000, 99999999999)}",
            "telefone": "11999999999",
            "endereco": "Rua Teste, 123",
            "tipos": ["morador"],
            "aceitou_termos": True
        })

        if response.status_code == 200:
            self.token = response.json()["token"]
            self.user_id = response.json()["user"]["id"]

    @task(3)
    def login(self):
        """Teste de login"""
        self.client.post("/api/auth/login", json={
            "email": "teste@example.com",
            "senha": "senha123456"
        })

    @task(5)
    def get_user_profile(self):
        """Teste de buscar perfil"""
        if hasattr(self, 'token'):
            self.client.get(
                f"/api/users/{self.user_id}",
                headers={"Authorization": f"Bearer {self.token}"}
            )

    @task(2)
    def update_user(self):
        """Teste de atualizar usuário"""
        if hasattr(self, 'token'):
            self.client.put(
                f"/api/users/{self.user_id}",
                headers={"Authorization": f"Bearer {self.token}"},
                json={"nome": "Updated Name"}
            )
EOF
```

### 5.3. Executar Testes de Performance

```bash
# Teste com 100 usuários simultâneos por 2 minutos
locust -f tests/performance/locustfile.py \
  --host=http://localhost:8000 \
  --users 100 \
  --spawn-rate 10 \
  --run-time 2m \
  --headless

# Ou com interface web:
locust -f tests/performance/locustfile.py --host=http://localhost:8000

# Abrir navegador em: http://localhost:8089
```

### 5.4. Métricas Esperadas

- **P50 (mediana)**: < 200ms
- **P95**: < 500ms
- **P99**: < 1000ms
- **Taxa de erro**: < 0.1%
- **Throughput**: > 100 req/s

---

## 6. Troubleshooting

### 6.1. MongoDB Não Conecta

```bash
# Verificar se MongoDB está rodando
pgrep -f mongod

# Ver logs do MongoDB
tail -f /usr/local/var/log/mongodb/mongo.log

# Reiniciar MongoDB
brew services restart mongodb-community

# Ou manualmente:
mongod --dbpath=/usr/local/var/mongodb --logpath=/usr/local/var/log/mongodb/mongo.log --fork
```

### 6.2. Servidor Não Inicia

```bash
# Verificar variáveis de ambiente
env | grep MONGO

# Limpar variáveis problemáticas
unset MONGO_URL MONGO_DATABASE

# Verificar porta 8000 está livre
lsof -i :8000

# Matar processo na porta 8000
kill -9 $(lsof -t -i:8000)

# Iniciar servidor com debug
python3 -m uvicorn server:app --host 127.0.0.1 --port 8000 --log-level debug
```

### 6.3. Testes Pytest Falham

```bash
# Limpar cache do pytest
pytest --cache-clear

# Reinstalar dependências de teste
pip install --upgrade pytest pytest-asyncio pytest-cov

# Verificar versão do pytest-asyncio
pip show pytest-asyncio

# Atualizar para versão compatível
pip install --upgrade 'pytest-asyncio>=0.21.0'

# Rodar um teste específico
pytest tests/integration/test_user_model.py::test_create_user_morador -v
```

### 6.4. Token Expira Muito Rápido

```bash
# Verificar configuração de expiração (server.py)
grep "ACCESS_TOKEN_EXPIRE_MINUTES" server.py

# Alterar se necessário:
# ACCESS_TOKEN_EXPIRE_MINUTES = 30  # 30 minutos (padrão)
# ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 horas (desenvolvimento)
```

### 6.5. Erro "Token de autorização não fornecido"

```bash
# Verificar formato do header
# CORRETO:
Authorization: Bearer eyJ...

# INCORRETO:
Authorization: eyJ...  # Falta "Bearer"
Authorization: bearer eyJ...  # "Bearer" deve começar com maiúscula

# Testar com curl verboso
curl -v -X GET "http://127.0.0.1:8000/api/users/ID" \
  -H "Authorization: Bearer TOKEN"
```

---

## 7. Checklist de Testes

Antes de considerar pronto para produção, verifique:

### Autenticação
- [ ] Registro de novo usuário funciona
- [ ] Login com credenciais válidas funciona
- [ ] Login com senha errada retorna 401
- [ ] Conta bloqueada após 5 tentativas
- [ ] Token JWT é gerado corretamente
- [ ] Token expira após 30 minutos
- [ ] Acesso negado sem token
- [ ] Acesso negado com token inválido

### CRUD de Usuários
- [ ] Buscar usuário por ID funciona
- [ ] Atualizar próprio perfil funciona
- [ ] Não pode atualizar perfil de outro usuário
- [ ] Admin pode atualizar qualquer usuário
- [ ] Soft delete funciona
- [ ] Usuário deletado não consegue fazer login
- [ ] Listar usuários funciona (admin)
- [ ] Estatísticas retornam dados corretos (admin)

### Segurança
- [ ] Senhas são hasheadas (bcrypt)
- [ ] CPF é validado
- [ ] Email é validado
- [ ] Token blacklist funciona
- [ ] Conta bloqueada temporariamente
- [ ] Rate limiting está ativo
- [ ] CORS configurado corretamente
- [ ] Headers de segurança presentes

### Performance
- [ ] Respostas em < 200ms (P50)
- [ ] Respostas em < 500ms (P95)
- [ ] Suporta 100+ req/s
- [ ] Índices do MongoDB criados
- [ ] Queries otimizadas

---

## 8. Ferramentas Úteis

### 8.1. HTTPie (alternativa ao cURL)

```bash
# Instalar
pip install httpie

# Usar
http POST http://127.0.0.1:8000/api/auth/login \
  email=joao@example.com \
  senha=senha123456

# Com autenticação
http GET http://127.0.0.1:8000/api/users/ID \
  "Authorization:Bearer TOKEN"
```

### 8.2. jq (processar JSON)

```bash
# Instalar (macOS)
brew install jq

# Usar
curl -s http://127.0.0.1:8000/api/auth/login ... | jq '.access_token'

# Formatar bonito
curl -s http://127.0.0.1:8000/api/users/ID ... | jq '.'
```

### 8.3. MongoDB Compass (GUI)

```bash
# Baixar: https://www.mongodb.com/products/compass

# Conectar em:
mongodb://localhost:27017

# Ver collections:
- alca_hub.users
- alca_hub.services
- alca_hub.bookings
- alca_hub.payments
```

---

## 9. Scripts Úteis

### 9.1. Script de Teste Completo

```bash
#!/bin/bash
# test_all.sh

echo "🧪 Iniciando testes completos..."

# 1. Registrar usuário
echo "1️⃣ Registrando usuário..."
RESPONSE=$(curl -s -X POST http://127.0.0.1:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "auto@test.com",
    "senha": "senha123456",
    "nome": "Auto Test",
    "cpf": "99988877766",
    "telefone": "11999999999",
    "endereco": "Rua Auto, 1",
    "tipos": ["morador"],
    "aceitou_termos": true
  }')

echo "$RESPONSE" | python3 -m json.tool
TOKEN=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])")
USER_ID=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['user']['id'])")

echo "✅ Token: ${TOKEN:0:50}..."
echo "✅ User ID: $USER_ID"

# 2. Login
echo "\n2️⃣ Fazendo login..."
curl -s -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"auto@test.com","senha":"senha123456"}' \
  | python3 -m json.tool

# 3. Buscar perfil
echo "\n3️⃣ Buscando perfil..."
curl -s -X GET "http://127.0.0.1:8000/api/users/$USER_ID" \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -m json.tool

# 4. Atualizar perfil
echo "\n4️⃣ Atualizando perfil..."
curl -s -X PUT "http://127.0.0.1:8000/api/users/$USER_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nome":"Auto Test Updated"}' \
  | python3 -m json.tool

echo "\n✅ Testes completos!"
```

### 9.2. Tornar Script Executável

```bash
chmod +x test_all.sh
./test_all.sh
```

---

## 📞 Contato e Suporte

Se encontrar problemas:
1. Verificar logs do servidor
2. Verificar logs do MongoDB
3. Consultar documentação da API (http://127.0.0.1:8000/docs)
4. Verificar issues no GitHub do projeto

---

**Última atualização**: 2025-10-14
**Versão**: 1.0
