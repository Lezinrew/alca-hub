# 🤖 Prompt para Claude CLI - Aprovação de Mudanças

## 📋 **Contexto do Projeto**
**Projeto:** Alça Hub - Plataforma full-stack para gestão de serviços em condomínios
**Stack:** FastAPI + React + MongoDB + Docker
**Status:** Correções críticas implementadas, aguardando aprovação

## 🎯 **Tarefa Específica**
Analise as mudanças implementadas no projeto Alça Hub e forneça aprovação técnica detalhada, identificando possíveis problemas e sugerindo melhorias.

## 📁 **Arquivos Modificados para Análise**

### **1. backend/server.py (CRÍTICO)**
```bash
# Verificar mudanças específicas:
git diff HEAD~1 backend/server.py

# Principais alterações implementadas:
- Linha 557: update_one com $set operator
- Linha 577: update_one com $set operator  
- Linhas 649-665: Código duplicado removido
- Rate limiting adicionado aos endpoints
- Logging estruturado integrado
```

### **2. backend/requirements.txt**
```bash
# Nova dependência adicionada:
+ slowapi>=0.1.9
```

### **3. Novos arquivos criados:**
```bash
backend/utils/log_sanitizer.py
backend/utils/structured_logger.py
backend/utils/__init__.py
```

## 🔍 **Checklist de Análise Técnica**

### **A. Correções de Sintaxe MongoDB**
- [ ] Verificar se operador `$set` está correto
- [ ] Validar se não há outros `update_one` sem `$set`
- [ ] Confirmar que código duplicado foi removido
- [ ] Testar compilação Python

### **B. Implementação de Rate Limiting**
- [ ] Verificar se `slowapi` está corretamente importado
- [ ] Validar configuração do limiter
- [ ] Confirmar rate limits aplicados aos endpoints corretos
- [ ] Testar se rate limiting funciona em runtime

### **C. Sanitização de Logs**
- [ ] Verificar se padrões de sanitização cobrem casos críticos
- [ ] Validar se dados sensíveis são removidos
- [ ] Confirmar que logs não vazam informações pessoais
- [ ] Testar sanitização com dados reais

### **D. Logging Estruturado**
- [ ] Verificar se logs são gerados em formato JSON
- [ ] Validar se contexto é rico (user_id, endpoint, etc.)
- [ ] Confirmar que logs são escritos em arquivos
- [ ] Testar se logs não quebram em ambiente de teste

## 🧪 **Testes de Validação**

### **Teste 1: Compilação e Sintaxe**
```bash
cd backend && python3 -m py_compile server.py
# Deve retornar exit code 0
```

### **Teste 2: Rate Limiting**
```bash
# Testar endpoint com rate limit
for i in {1..6}; do
  curl -X POST http://localhost:8000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","senha":"123456"}'
done
# Deve retornar 429 após 5 tentativas
```

### **Teste 3: Logs Estruturados**
```bash
# Verificar formato JSON dos logs
tail -f logs/app.log | jq .
# Deve mostrar logs em formato JSON válido
```

### **Teste 4: Sanitização**
```bash
# Verificar se dados sensíveis são sanitizados
grep -i "cpf\|senha\|token" logs/app.log
# Deve retornar dados sanitizados como [CPF], [PASSWORD]
```

## 📊 **Critérios de Aprovação**

### **✅ APROVADO se:**
- [ ] Compilação Python sem erros
- [ ] Rate limiting funcionando
- [ ] Logs em formato JSON estruturado
- [ ] Dados sensíveis sanitizados
- [ ] Código duplicado removido
- [ ] MongoDB operations corrigidas

### **❌ REJEITADO se:**
- [ ] Erros de sintaxe ou compilação
- [ ] Rate limiting não funciona
- [ ] Logs não estruturados
- [ ] Dados sensíveis vazando
- [ ] Código duplicado ainda presente
- [ ] MongoDB operations quebradas

## 🎯 **Prompt Específico para Claude CLI**

```
TAREFA: Análise técnica e aprovação de mudanças no Alça Hub
MODELO: Claude 3.5 Sonnet
CONTEXTO: Correções críticas implementadas em projeto FastAPI + MongoDB

INSTRUÇÕES:
1. Analise as mudanças no backend/server.py
2. Verifique se as correções MongoDB estão corretas
3. Valide se rate limiting está implementado
4. Confirme se logging estruturado funciona
5. Teste se sanitização de logs está ativa
6. Forneça aprovação técnica detalhada

ARQUIVOS PRINCIPAIS:
- backend/server.py (linhas 557, 577, 649-665)
- backend/requirements.txt (slowapi adicionado)
- backend/utils/log_sanitizer.py (novo)
- backend/utils/structured_logger.py (novo)

CRITÉRIOS DE APROVAÇÃO:
✅ Sintaxe MongoDB corrigida
✅ Rate limiting implementado
✅ Logs estruturados funcionando
✅ Sanitização ativa
✅ Código duplicado removido

RESPONDA EM PORTUGUÊS COM:
- Status de cada correção (✅/❌)
- Problemas encontrados (se houver)
- Sugestões de melhoria
- Aprovação final (APROVADO/REJEITADO)
```

## 🔧 **Comandos para Executar**

### **1. Verificar Mudanças**
```bash
# Ver diferenças implementadas
git diff HEAD~1 backend/server.py

# Verificar novos arquivos
ls -la backend/utils/
```

### **2. Testar Compilação**
```bash
cd backend
python3 -m py_compile server.py
echo "Exit code: $?"
```

### **3. Validar Dependências**
```bash
# Verificar se slowapi está instalado
pip list | grep slowapi
```

### **4. Testar Rate Limiting**
```bash
# Iniciar servidor
./dev.sh

# Em outro terminal, testar rate limit
for i in {1..6}; do
  curl -X POST http://localhost:8000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","senha":"123456"}'
  echo "Tentativa $i"
done
```

## 📈 **Métricas de Sucesso**

### **Técnicas**
- [ ] **0 erros** de compilação
- [ ] **Rate limiting** funcionando
- [ ] **Logs JSON** estruturados
- [ ] **Sanitização** ativa
- [ ] **Performance** mantida

### **Funcionais**
- [ ] **Endpoints** respondendo
- [ ] **Autenticação** funcionando
- [ ] **MongoDB** operations corretas
- [ ] **Logs** sendo gerados
- [ ] **Rate limits** sendo aplicados

## 🎯 **Resultado Esperado**

**Status Final:** ✅ APROVADO / ❌ REJEITADO

**Justificativa:**
- Lista de correções validadas
- Problemas identificados (se houver)
- Sugestões de melhoria
- Próximos passos recomendados

---

**Execute este prompt no Claude CLI para obter aprovação técnica completa das mudanças implementadas.**
