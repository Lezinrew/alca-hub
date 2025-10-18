# 👥 Usuários de Teste - AlcaHub

Este documento contém todos os usuários disponíveis para teste no aplicativo AlcaHub.

---

## 🔐 Credenciais de Acesso

### 1. Usuário Principal - Morador

**Email**: `lezinrew@gmail.com`
**Senha**: `123456`

**Perfil**:
- 👤 **Nome**: Lezin Rew
- 📱 **Telefone**: (11) 99999-0000
- 📍 **Endereço**: São Paulo, SP
- 🏷️ **Tipo**: Morador
- ✅ **Status**: Ativo

**Uso**: Usuário principal para testes de funcionalidades de morador (buscar prestadores, fazer agendamentos, etc.)

---

### 2. Usuário Dual - Morador + Prestador

**Email**: `psicologa@alca.com`
**Senha**: `psicologa123`

**Perfil**:
- 👤 **Nome**: Dr. Ana Psicóloga
- 📱 **Telefone**: (11) 99999-6666
- 📍 **Endereço**: São Paulo, SP
- 🏷️ **Tipos**: Morador + Prestador
- 🎯 **Tipo Ativo**: Morador (pode alternar)
- ✅ **Status**: Ativo

**Uso**: Ideal para testar funcionalidades de troca de perfil e interface de prestador de serviços

---

## 🚀 Como Criar os Usuários

### Método 1: Via Script Python (Recomendado)

```bash
# Certifique-se que o MongoDB está rodando
cd /Users/lezinrew/Projetos/alca-hub/backend

# Execute o script
python3 create_test_user.py
```

**Saída esperada**:
```
🚀 Criando usuários de teste...
📊 Banco: alca_hub
🔗 URL: mongodb://localhost:27017

✅ Usuário de teste criado com sucesso!
   Email: lezinrew@gmail.com
   Senha: 123456
   ID: [uuid]
   Nome: Lezin Rew
   Tipo: morador

✅ Usuário demo criado: psicologa@alca.com

🎉 Processo concluído!

📋 Credenciais disponíveis:
   • lezinrew@gmail.com / 123456 (Morador)
   • psicologa@alca.com / psicologa123 (Dual: Morador + Prestador)
```

---

### Método 2: Via API (Registro)

```bash
# Usuário Morador
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "lezinrew@gmail.com",
    "senha": "123456",
    "nome": "Lezin Rew",
    "cpf": "12345678901",
    "telefone": "(11) 99999-0000",
    "endereco": "São Paulo, SP",
    "tipos": ["morador"],
    "aceitou_termos": true
  }'
```

---

## 📱 Como Usar no App Mobile

### 1. Inicie o Backend

```bash
cd /Users/lezinrew/Projetos/alca-hub

# Opção A: Docker (recomendado)
docker-compose -f docker-compose.dev.yml up

# Opção B: Direto
cd backend && python server.py
```

### 2. Abra o App no Simulador

```bash
cd /Users/lezinrew/Projetos/alca-hub/frontend/ios/App
open App.xcworkspace
```

No Xcode:
1. Selecione **iPhone 16** ou **iPhone 17**
2. Clique **Play** (▶️)
3. Aguarde o build

### 3. Faça Login

Na tela de login do app:

**Teste 1 - Morador**:
- Email: `lezinrew@gmail.com`
- Senha: `123456`

**Teste 2 - Prestador/Dual**:
- Email: `psicologa@alca.com`
- Senha: `psicologa123`

---

## 🧪 Cenários de Teste

### Como Morador (lezinrew@gmail.com)

1. **Login**
   - ✅ Login com credenciais corretas
   - ❌ Login com senha incorreta
   - ❌ Login com email inexistente

2. **Dashboard**
   - Ver lista de prestadores disponíveis
   - Buscar prestadores por categoria
   - Filtrar por localização

3. **Agendamentos**
   - Criar novo agendamento
   - Ver agendamentos pendentes
   - Cancelar agendamento

4. **Perfil**
   - Ver dados do perfil
   - Editar informações
   - Alterar senha

---

### Como Prestador (psicologa@alca.com)

1. **Troca de Perfil**
   - Login como morador
   - Alternar para perfil prestador
   - Verificar mudança de interface

2. **Dashboard Prestador**
   - Ver agendamentos recebidos
   - Aceitar/recusar agendamentos
   - Ver histórico de atendimentos

3. **Serviços**
   - Cadastrar novos serviços
   - Editar serviços existentes
   - Definir preços e disponibilidade

4. **Mensagens**
   - Ver mensagens de clientes
   - Responder mensagens
   - Notificações

---

## 🔍 Verificar se Usuários Existem

### Via MongoDB

```bash
# Conectar ao MongoDB
mongosh

# Usar banco correto
use alca_hub

# Listar usuários
db.users.find({}, {email: 1, nome: 1, tipo: 1, tipos: 1}).pretty()

# Buscar usuário específico
db.users.findOne({email: "lezinrew@gmail.com"})
```

### Via API

```bash
# Login (retorna token)
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "lezinrew@gmail.com",
    "senha": "123456"
  }'
```

**Resposta esperada**:
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": {
    "id": "...",
    "email": "lezinrew@gmail.com",
    "nome": "Lezin Rew",
    "tipo": "morador"
  }
}
```

---

## 🛠️ Solução de Problemas

### Erro: "Usuário não encontrado"

**Causa**: Usuários não foram criados no banco
**Solução**:
```bash
cd backend
python3 create_test_user.py
```

---

### Erro: "Senha incorreta"

**Causa**: Senha foi alterada ou hash incorreto
**Solução**: Recriar usuário
```bash
# 1. Deletar usuário existente
mongosh
use alca_hub
db.users.deleteOne({email: "lezinrew@gmail.com"})

# 2. Recriar
cd backend
python3 create_test_user.py
```

---

### Erro: "Não conecta ao backend"

**Causa**: Backend não está rodando ou configuração de URL incorreta
**Solução**:

1. **Verifique se backend está rodando**:
```bash
curl http://localhost:8000/health
```

2. **Se não responder, inicie o backend**:
```bash
docker-compose -f docker-compose.dev.yml up
```

3. **Verifique URL no app mobile**:
   - iOS Simulador: `http://localhost:8000`
   - Android Emulador: `http://10.0.2.2:8000`
   - Dispositivo Real: `http://[IP_DO_SEU_MAC]:8000`

---

## 📝 Adicionar Novos Usuários de Teste

### Editar o Script

Abra `backend/create_test_user.py` e adicione na função `create_demo_users()`:

```python
{
    "id": str(uuid.uuid4()),
    "email": "novo@teste.com",
    "cpf": "11111111111",
    "nome": "Novo Usuário",
    "telefone": "(11) 98888-8888",
    "endereco": "São Paulo, SP",
    "tipo": "morador",  # ou "prestador"
    "tipos": ["morador"],  # ou ["morador", "prestador"]
    "tipo_ativo": "morador",
    "ativo": True,
    "password": get_password_hash("senha123"),
    "aceitou_termos": True,
    "data_aceite_termos": datetime.utcnow(),
    "created_at": datetime.utcnow(),
    "updated_at": datetime.utcnow(),
}
```

Depois execute:
```bash
python3 create_test_user.py
```

---

## 🎯 Usuários Específicos por Funcionalidade

| Funcionalidade | Usuário Recomendado | Email |
|----------------|---------------------|-------|
| Login básico | Morador | lezinrew@gmail.com |
| Buscar serviços | Morador | lezinrew@gmail.com |
| Oferecer serviços | Prestador | psicologa@alca.com |
| Troca de perfil | Dual | psicologa@alca.com |
| Agendamentos (cliente) | Morador | lezinrew@gmail.com |
| Agendamentos (prestador) | Prestador | psicologa@alca.com |
| Mensagens | Ambos | Qualquer um |

---

## 🔐 Segurança

⚠️ **IMPORTANTE**: Estes usuários são **APENAS PARA TESTE**

- ❌ **NÃO USE EM PRODUÇÃO**
- ❌ **NÃO COMMITE SENHAS REAIS**
- ✅ Em produção, use senhas fortes e únicas
- ✅ Implemente 2FA para produção
- ✅ Use variáveis de ambiente para senhas de admin

---

## 📚 Referências

- **Script de criação**: [backend/create_test_user.py](backend/create_test_user.py)
- **Script de garantia**: [backend/ensure_test_user.py](backend/ensure_test_user.py)
- **Testes de autenticação**: [backend/tests/unit/test_auth.py](backend/tests/unit/test_auth.py)
- **Documentação da API**: [docs/DOCUMENTACAO_INDEX.md](docs/DOCUMENTACAO_INDEX.md)

---

## 🎉 Resumo Rápido

```bash
# 1. Criar usuários
cd backend && python3 create_test_user.py

# 2. Iniciar backend
docker-compose -f docker-compose.dev.yml up

# 3. Abrir app no Xcode
cd frontend/ios/App && open App.xcworkspace

# 4. Fazer login
Email: lezinrew@gmail.com
Senha: 123456
```

---

*Última atualização: 18 de Outubro de 2025*
