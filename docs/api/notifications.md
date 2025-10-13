# API de Notificações - Alça Hub

## Visão Geral

A API de notificações permite gerenciar notificações em tempo real para usuários do sistema. Suporta diferentes tipos de notificações, prioridades e status.

## Endpoints

### 1. Criar Notificação

**POST** `/notifications/`

Cria uma nova notificação para um usuário.

#### Parâmetros

```json
{
  "user_id": "string",
  "type": "booking_request|payment_received|rating_received|security_alert|system_announcement",
  "title": "string",
  "message": "string",
  "priority": "low|medium|high|urgent",
  "data": {
    "key": "value"
  },
  "expires_at": "2025-01-01T00:00:00Z"
}
```

#### Resposta

```json
{
  "message": "Notificação criada com sucesso",
  "notification_id": "notif_123456"
}
```

#### Exemplo

```bash
curl -X POST "https://api.alca-hub.com/notifications/" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_123",
    "type": "booking_request",
    "title": "Nova solicitação de serviço",
    "message": "Você recebeu uma nova solicitação para limpeza doméstica",
    "priority": "high",
    "data": {
      "booking_id": "booking_456",
      "service_name": "Limpeza Doméstica"
    }
  }'
```

### 2. Obter Notificações do Usuário

**GET** `/notifications/`

Obtém as notificações do usuário autenticado.

#### Parâmetros de Query

- `limit` (int, opcional): Número máximo de notificações (padrão: 50)
- `offset` (int, opcional): Número de notificações para pular (padrão: 0)
- `unread_only` (boolean, opcional): Apenas notificações não lidas

#### Resposta

```json
[
  {
    "id": "notif_123456",
    "user_id": "user_123",
    "type": "booking_request",
    "title": "Nova solicitação de serviço",
    "message": "Você recebeu uma nova solicitação",
    "priority": "high",
    "status": "sent",
    "data": {
      "booking_id": "booking_456"
    },
    "created_at": "2025-01-01T10:00:00Z",
    "read_at": null,
    "expires_at": "2025-01-02T10:00:00Z"
  }
]
```

### 3. Obter Estatísticas de Notificações

**GET** `/notifications/stats`

Obtém estatísticas das notificações do usuário.

#### Resposta

```json
{
  "total": 25,
  "unread": 3,
  "by_type": {
    "booking_request": 10,
    "payment_received": 5,
    "rating_received": 2
  },
  "by_priority": {
    "high": 5,
    "medium": 15,
    "low": 5
  }
}
```

### 4. Marcar Notificação como Lida

**PATCH** `/notifications/{notification_id}/read`

Marca uma notificação específica como lida.

#### Resposta

```json
{
  "message": "Notificação marcada como lida"
}
```

### 5. Marcar Todas as Notificações como Lidas

**PATCH** `/notifications/mark-all-read`

Marca todas as notificações do usuário como lidas.

#### Resposta

```json
{
  "message": "5 notificações marcadas como lidas"
}
```

### 6. Atualizar Preferências de Notificação

**POST** `/notifications/preferences`

Atualiza as preferências de notificação do usuário.

#### Parâmetros

```json
{
  "email_enabled": true,
  "push_enabled": true,
  "sms_enabled": false,
  "types_enabled": {
    "booking_request": true,
    "payment_received": true,
    "rating_received": false
  },
  "quiet_hours_start": "22:00",
  "quiet_hours_end": "08:00",
  "timezone": "America/Sao_Paulo"
}
```

### 7. WebSocket para Notificações em Tempo Real

**WebSocket** `/notifications/ws/{user_id}`

Conexão WebSocket para receber notificações em tempo real.

#### Mensagens Recebidas

```json
{
  "id": "notif_123456",
  "type": "booking_request",
  "title": "Nova solicitação",
  "message": "Você recebeu uma nova solicitação",
  "priority": "high",
  "created_at": "2025-01-01T10:00:00Z",
  "data": {
    "booking_id": "booking_456"
  }
}
```

## Tipos de Notificação

| Tipo | Descrição |
|------|-----------|
| `booking_request` | Solicitação de agendamento |
| `booking_accepted` | Agendamento aceito |
| `booking_rejected` | Agendamento rejeitado |
| `booking_cancelled` | Agendamento cancelado |
| `payment_received` | Pagamento recebido |
| `payment_failed` | Pagamento falhou |
| `service_completed` | Serviço concluído |
| `rating_received` | Avaliação recebida |
| `message_received` | Mensagem recebida |
| `system_announcement` | Anúncio do sistema |
| `security_alert` | Alerta de segurança |

## Prioridades

| Prioridade | Descrição |
|------------|-----------|
| `low` | Baixa prioridade |
| `medium` | Prioridade média |
| `high` | Alta prioridade |
| `urgent` | Urgente |

## Status

| Status | Descrição |
|--------|-----------|
| `pending` | Aguardando envio |
| `sent` | Enviada |
| `delivered` | Entregue |
| `read` | Lida |
| `failed` | Falhou |

## Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 400 | Dados inválidos |
| 401 | Não autorizado |
| 404 | Notificação não encontrada |
| 429 | Muitas requisições |
| 500 | Erro interno do servidor |

## Exemplos de Uso

### JavaScript

```javascript
// Criar notificação
const response = await fetch('/notifications/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    user_id: 'user_123',
    type: 'booking_request',
    title: 'Nova solicitação',
    message: 'Você recebeu uma nova solicitação',
    priority: 'high'
  })
});

// WebSocket
const ws = new WebSocket('wss://api.alca-hub.com/notifications/ws/user_123');
ws.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  console.log('Nova notificação:', notification);
};
```

### Python

```python
import requests
import websocket

# Criar notificação
response = requests.post(
    'https://api.alca-hub.com/notifications/',
    headers={'Authorization': f'Bearer {token}'},
    json={
        'user_id': 'user_123',
        'type': 'booking_request',
        'title': 'Nova solicitação',
        'message': 'Você recebeu uma nova solicitação',
        'priority': 'high'
    }
)

# WebSocket
def on_message(ws, message):
    notification = json.loads(message)
    print(f'Nova notificação: {notification}')

ws = websocket.WebSocketApp(
    'wss://api.alca-hub.com/notifications/ws/user_123',
    on_message=on_message
)
ws.run_forever()
```

## Rate Limiting

- **Criação de notificações**: 100 por minuto por usuário
- **Consultas**: 1000 por minuto por usuário
- **WebSocket**: 1 conexão por usuário

## Considerações de Segurança

1. **Autenticação**: Todas as operações requerem token JWT válido
2. **Autorização**: Usuários só podem acessar suas próprias notificações
3. **Rate Limiting**: Proteção contra spam e abuso
4. **Validação**: Todos os dados são validados antes do processamento
5. **Logs**: Todas as operações são registradas para auditoria
