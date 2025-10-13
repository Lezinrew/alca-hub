// MSW Server para testes - Alça Hub
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
// Compat: alguns testes antigos usam 'rest' em vez de 'http'
export const rest = {
  post: http.post,
  get: http.get,
  put: http.put,
}

// Mock handlers para API
export const handlers = [
  // Login
  rest.post('http://localhost:8000/api/auth/login', (req, res, ctx) => {
    const { email, senha } = req.body
    
    if (email === 'teste@exemplo.com' && senha === 'senha123456') {
      return res(
        ctx.status(200),
        ctx.json({
          access_token: 'mock_token_123',
          user: {
            id: '123',
            email: 'teste@exemplo.com',
            nome: 'Usuário Teste',
            tipo: 'morador',
            ativo: true
          }
        })
      )
    }
    
    if (email === 'rate_limited@exemplo.com') {
      return res(
        ctx.status(429),
        ctx.json({
          detail: 'Muitas tentativas de login. Tente novamente em 5 minutos.'
        })
      )
    }
    
    return res(
      ctx.status(401),
      ctx.json({
        detail: 'Email ou senha incorretos'
      })
    )
  }),

  // OAuth2 Token
  rest.post('http://localhost:8000/api/auth/token', (req, res, ctx) => {
    const formData = req.body
    const username = formData.get('username')
    const password = formData.get('password')
    
    if (username === 'teste@exemplo.com' && password === 'senha123456') {
      return res(
        ctx.status(200),
        ctx.json({
          access_token: 'mock_oauth_token_123',
          token_type: 'bearer'
        })
      )
    }
    
    return res(
      ctx.status(401),
      ctx.json({
        detail: 'Email ou senha incorretos'
      })
    )
  }),

  // Register
  rest.post('http://localhost:8000/api/auth/register', (req, res, ctx) => {
    const data = req.body
    
    if (data.email === 'duplicado@exemplo.com') {
      return res(
        ctx.status(400),
        ctx.json({
          detail: 'Email já cadastrado'
        })
      )
    }
    
    if (!data.aceitou_termos) {
      return res(
        ctx.status(400),
        ctx.json({
          detail: 'Você precisa aceitar os Termos de Uso para criar sua conta.'
        })
      )
    }
    
    if (data.senha && data.senha.length < 8) {
      return res(
        ctx.status(400),
        ctx.json({
          detail: 'Senha muito fraca. Deve ter pelo menos 8 caracteres.'
        })
      )
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        message: 'Usuário criado com sucesso',
        user: {
          id: '123',
          email: data.email,
          nome: data.nome,
          tipo: data.tipos[0],
          ativo: true
        }
      })
    )
  }),

  // Forgot Password
  rest.post('http://localhost:8000/api/auth/forgot-password', (req, res, ctx) => {
    const { email } = req.body
    
    if (email === 'inexistente@exemplo.com') {
      return res(
        ctx.status(404),
        ctx.json({
          detail: 'Usuário não encontrado'
        })
      )
    }
    
    if (email === 'cooldown@exemplo.com') {
      return res(
        ctx.status(429),
        ctx.json({
          detail: 'Você acabou de solicitar um código. Por favor, aguarde 60 segundos antes de tentar novamente!'
        })
      )
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        message: 'Código enviado para seu email'
      })
    )
  }),

  // Reset Password
  rest.post('http://localhost:8000/api/auth/reset-password', (req, res, ctx) => {
    const { token, new_password } = req.body
    
    if (token === 'invalid_token') {
      return res(
        ctx.status(400),
        ctx.json({
          detail: 'Token inválido ou expirado'
        })
      )
    }
    
    if (new_password && new_password.length < 8) {
      return res(
        ctx.status(400),
        ctx.json({
          detail: 'Senha muito fraca. Deve ter pelo menos 8 caracteres.'
        })
      )
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        message: 'Senha redefinida com sucesso'
      })
    )
  }),

  // Profile
  rest.get('http://localhost:8000/api/profile', (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization')
    
    if (!authHeader || !authHeader.includes('Bearer')) {
      return res(
        ctx.status(401),
        ctx.json({
          detail: 'Token de acesso necessário'
        })
      )
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        id: '123',
        email: 'teste@exemplo.com',
        nome: 'Usuário Teste',
        tipo: 'morador',
        ativo: true
      })
    )
  }),

  // Providers Nearby
  rest.get('http://localhost:8000/api/providers/nearby', (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization')
    
    if (!authHeader || !authHeader.includes('Bearer')) {
      return res(
        ctx.status(401),
        ctx.json({
          detail: 'Token de acesso necessário'
        })
      )
    }
    
    return res(
      ctx.status(200),
      ctx.json([
        {
          provider_id: 'prestador_123',
          nome: 'João Prestador',
          latitude: -23.5505,
          longitude: -46.6333,
          distance_km: 1.5,
          estimated_time_min: 10,
          rating: 4.5,
          services: [
            {
              id: 'servico_123',
              nome: 'Limpeza Residencial',
              categoria: 'limpeza',
              preco_base: 50.0,
              status: 'disponivel'
            }
          ]
        }
      ])
    )
  }),

  // Update Location
  rest.put('http://localhost:8000/api/profile/location', (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization')
    
    if (!authHeader || !authHeader.includes('Bearer')) {
      return res(
        ctx.status(401),
        ctx.json({
          detail: 'Token de acesso necessário'
        })
      )
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        message: 'Localização atualizada com sucesso',
        latitude: req.body.latitude,
        longitude: req.body.longitude
      })
    )
  })
]

export const server = setupServer(...handlers)
