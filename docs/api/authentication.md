# API de Autenticação - Alça Hub

## Visão Geral

A API de autenticação do Alça Hub fornece endpoints seguros para gerenciamento de usuários, incluindo login, registro, renovação de tokens e logout. Utiliza JWT (JSON Web Tokens) para autenticação e implementa rate limiting para segurança.

## Endpoints

### 1. Login

**POST** `/api/auth/login`

Autentica um usuário e retorna tokens de acesso.

#### Request Body

```json
{
  "email": "usuario@exemplo.com",
  "senha": "senha123456"
}
```

#### Response (200)

```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "abc123def456...",
  "expires_in": 900,
  "user": {
    "id": "123",
    "email": "usuario@exemplo.com",
    "nome": "João Silva",
    "tipo": "morador"
  }
}
```

#### Response (401)

```json
{
  "detail": "Email ou senha incorretos"
}
```

#### Response (429)

```json
{
  "detail": "Muitas tentativas de login. Tente novamente em alguns minutos."
}
```

### 2. Registro

**POST** `/api/auth/register`

Registra um novo usuário no sistema.

#### Request Body

```json
{
  "email": "novo@exemplo.com",
  "senha": "senha123456",
  "nome": "Maria Silva",
  "cpf": "12345678901",
  "telefone": "11999999999",
  "endereco": "Rua das Flores, 123",
  "tipo": "morador"
}
```

#### Response (200)

```json
{
  "message": "Usuário criado com sucesso",
  "user": {
    "id": "456",
    "email": "novo@exemplo.com",
    "nome": "Maria Silva",
    "tipo": "morador"
  }
}
```

#### Response (400)

```json
{
  "detail": "Email já cadastrado"
}
```

### 3. Renovar Token

**POST** `/api/auth/refresh`

Renova o token de acesso usando o refresh token.

#### Request Body

```json
{
  "refresh_token": "abc123def456..."
}
```

#### Response (200)

```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "xyz789uvw012...",
  "expires_in": 900
}
```

#### Response (401)

```json
{
  "detail": "Refresh token inválido ou expirado"
}
```

### 4. Logout

**POST** `/api/auth/logout`

Invalida o token de acesso atual.

#### Headers

```
Authorization: Bearer <access_token>
```

#### Response (200)

```json
{
  "message": "Logout realizado com sucesso",
  "logout_time": "2025-01-27T10:30:00Z"
}
```

## Configurações de Segurança

### Rate Limiting

- **Geral**: 100 requests por minuto
- **Login**: 5 tentativas por 15 minutos
- **Registro**: 3 tentativas por hora

### Tokens JWT

- **Access Token**: 15 minutos de duração
- **Refresh Token**: 7 dias de duração
- **Algoritmo**: HS256

### Blacklist

- Tokens invalidados são adicionados à blacklist
- Limpeza automática a cada hora
- Tokens expirados são removidos automaticamente

## Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 400 | Dados inválidos |
| 401 | Não autorizado |
| 403 | Acesso negado |
| 429 | Rate limit excedido |
| 500 | Erro interno do servidor |

## Exemplos de Uso

### JavaScript/React

```javascript
// Login
const login = async (email, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, senha: password }),
  });
  
  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    return data;
  }
  
  throw new Error('Login falhou');
};

// Renovar token
const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  
  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    return data;
  }
  
  throw new Error('Renovação de token falhou');
};
```

### Python

```python
import requests

# Login
def login(email, password):
    response = requests.post('/api/auth/login', json={
        'email': email,
        'senha': password
    })
    
    if response.status_code == 200:
        return response.json()
    
    raise Exception('Login falhou')

# Usar token em requisições
def make_authenticated_request(url, token):
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.get(url, headers=headers)
    return response.json()
```

## Monitoramento

### Logs de Segurança

- Tentativas de login (sucesso/falha)
- Renovação de tokens
- Atividade suspeita
- Rate limiting

### Métricas

- Número de logins por hora
- Taxa de sucesso de login
- Tentativas de login bloqueadas
- Tokens renovados

## Troubleshooting

### Problemas Comuns

1. **Token expirado**
   - Use o refresh token para obter um novo access token
   - Se o refresh token também expirou, faça login novamente

2. **Rate limit excedido**
   - Aguarde o tempo de cooldown
   - Verifique se não há múltiplas requisições simultâneas

3. **Erro de validação**
   - Verifique se todos os campos obrigatórios estão preenchidos
   - Confirme se o formato do email está correto

### Debug

Para debug, verifique os logs do servidor para:
- Erros de validação
- Problemas de conexão com banco
- Falhas de autenticação
- Atividade suspeita
