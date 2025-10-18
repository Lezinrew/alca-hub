# 🤖 Prompt para Checklist de Contestação - Claude AI

> Prompt estruturado para gerar checklists de contestação usando Claude para analisar e questionar visões de outras IAs

## 📋 Prompt Base

```
Você é um especialista em análise crítica e pensamento sistêmico. Sua tarefa é criar um checklist abrangente para contestar e questionar a visão ou proposta de outra IA sobre [TÓPICO ESPECÍFICO].

## Contexto da Análise
- **Tópico**: [INSERIR TÓPICO AQUI]
- **Visão da IA**: [INSERIR VISÃO/PROPOSTA DA OUTRA IA]
- **Contexto**: [INSERIR CONTEXTO ESPECÍFICO]
- **Objetivo**: Criar um checklist para contestar e questionar essa visão

## Instruções para o Checklist

Crie um checklist estruturado que permita contestar a visão da outra IA considerando:

### 1. **Análise de Premissas**
- [ ] As premissas fundamentais são válidas?
- [ ] Existem vieses implícitos nas premissas?
- [ ] As premissas são baseadas em evidências sólidas?
- [ ] Há premissas não declaradas que podem afetar a conclusão?

### 2. **Validação de Evidências**
- [ ] As evidências apresentadas são relevantes?
- [ ] As fontes são confiáveis e atualizadas?
- [ ] Existe evidência contrária não considerada?
- [ ] As evidências são interpretadas corretamente?

### 3. **Análise de Lógica e Raciocínio**
- [ ] O raciocínio é logicamente consistente?
- [ ] Existem falácias lógicas no argumento?
- [ ] As conclusões seguem necessariamente das premissas?
- [ ] Há saltos lógicos não justificados?

### 4. **Consideração de Alternativas**
- [ ] Foram consideradas alternativas viáveis?
- [ ] A solução proposta é realmente a melhor?
- [ ] Existem outras abordagens possíveis?
- [ ] Os trade-offs foram adequadamente analisados?

### 5. **Análise de Consequências**
- [ ] As consequências foram adequadamente previstas?
- [ ] Existem efeitos colaterais não considerados?
- [ ] Os riscos foram adequadamente avaliados?
- [ ] A implementação é viável na prática?

### 6. **Perspectiva Temporal**
- [ ] A análise considera adequadamente o contexto temporal?
- [ ] As tendências futuras foram consideradas?
- [ ] A solução é sustentável a longo prazo?
- [ ] Existem mudanças no contexto que podem afetar a validade?

### 7. **Análise de Stakeholders**
- [ ] Todos os stakeholders relevantes foram considerados?
- [ ] Os interesses conflitantes foram identificados?
- [ ] O impacto em diferentes grupos foi analisado?
- [ ] A perspectiva dos afetados foi considerada?

### 8. **Validação Técnica**
- [ ] A solução é tecnicamente viável?
- [ ] Os recursos necessários são realistas?
- [ ] A complexidade foi adequadamente estimada?
- [ ] Existem limitações técnicas não consideradas?

### 9. **Análise de Viabilidade**
- [ ] A proposta é economicamente viável?
- [ ] Os custos foram adequadamente estimados?
- [ ] Os benefícios são realistas?
- [ ] O ROI é justificável?

### 10. **Considerações Éticas**
- [ ] A proposta é eticamente defensável?
- [ ] Os princípios éticos foram considerados?
- [ ] Existem implicações éticas não abordadas?
- [ ] A justiça e equidade foram consideradas?

## Formato do Checklist

Para cada item do checklist, forneça:

1. **Pergunta específica** para contestar
2. **Critérios de avaliação** claros
3. **Evidências necessárias** para validar
4. **Red flags** (sinais de alerta) a observar
5. **Ações sugeridas** para investigar mais

## Exemplo de Item Detalhado

### Item: Validação de Evidências
- **Pergunta**: "As evidências apresentadas são realmente relevantes para a conclusão?"
- **Critérios**: 
  - Evidências devem ser diretamente relacionadas ao problema
  - Devem ser atuais e não obsoletas
  - Devem ser de fontes confiáveis
- **Red Flags**:
  - Evidências desatualizadas
  - Fontes não confiáveis
  - Correlação confundida com causalidade
- **Ações**:
  - Verificar data das evidências
  - Avaliar credibilidade das fontes
  - Buscar evidências contrárias

## Instruções Finais

1. **Personalize** o checklist para o tópico específico
2. **Adicione** itens específicos do domínio
3. **Inclua** exemplos concretos quando possível
4. **Mantenha** o foco na contestação construtiva
5. **Priorize** os itens mais críticos

Crie um checklist que seja:
- **Abrangente**: Cubra todos os aspectos importantes
- **Específico**: Perguntas claras e diretas
- **Acionável**: Permita ações concretas
- **Equilibrado**: Justo mas rigoroso
- **Prático**: Útil para análise real

## Saída Esperada

Forneça um checklist estruturado com:
- ✅ Lista numerada de itens
- ✅ Perguntas específicas para cada item
- ✅ Critérios de avaliação
- ✅ Sinais de alerta
- ✅ Ações sugeridas
- ✅ Priorização dos itens
```

## 🎯 Versões Específicas do Prompt

### **Para Análise de Propostas Técnicas**

```
Adicione ao prompt base:

**Foco Técnico Específico:**
- [ ] A arquitetura proposta é escalável?
- [ ] As tecnologias escolhidas são adequadas?
- [ ] A segurança foi adequadamente considerada?
- [ ] A manutenibilidade foi planejada?
- [ ] A performance atende aos requisitos?
- [ ] A integração com sistemas existentes é viável?
```

### **Para Análise de Estratégias de Negócio**

```
Adicione ao prompt base:

**Foco de Negócio Específico:**
- [ ] O mercado-alvo foi adequadamente definido?
- [ ] A proposta de valor é clara e diferenciada?
- [ ] A estratégia de monetização é viável?
- [ ] A concorrência foi adequadamente analisada?
- [ ] Os recursos necessários são realistas?
- [ ] O cronograma é factível?
```

### **Para Análise de Políticas Públicas**

```
Adicione ao prompt base:

**Foco de Política Específico:**
- [ ] A política é constitucionalmente válida?
- [ ] Os direitos fundamentais foram considerados?
- [ ] O impacto social foi adequadamente avaliado?
- [ ] A implementação é administrativamente viável?
- [ ] Os custos públicos são justificáveis?
- [ ] A política é sustentável a longo prazo?
```

## 🔧 Como Usar o Prompt

### **Passo 1: Personalização**
1. Substitua `[TÓPICO ESPECÍFICO]` pelo assunto real
2. Insira a visão da outra IA no campo apropriado
3. Adicione contexto específico do domínio
4. Ajuste o foco conforme necessário

### **Passo 2: Execução**
1. Cole o prompt personalizado no Claude
2. Aguarde a geração do checklist
3. Revise e ajuste conforme necessário
4. Use o checklist para análise sistemática

### **Passo 3: Aplicação**
1. Use o checklist para analisar a visão da outra IA
2. Marque os itens conforme sua análise
3. Identifique pontos fracos e fortes
4. Formule contra-argumentos baseados nos achados

## 📊 Exemplo de Uso Prático

### **Cenário**: Contestar uma proposta de IA sobre automação de atendimento

**Prompt Personalizado:**
```
Você é um especialista em análise crítica e pensamento sistêmico. Sua tarefa é criar um checklist abrangente para contestar e questionar a visão de outra IA sobre AUTOMAÇÃO DE ATENDIMENTO AO CLIENTE.

## Contexto da Análise
- **Tópico**: Automação de Atendimento ao Cliente
- **Visão da IA**: "Chatbots podem substituir 80% do atendimento humano com melhor qualidade e menor custo"
- **Contexto**: Empresa de e-commerce com 10.000 clientes
- **Objetivo**: Criar um checklist para contestar essa visão

[Continue com o resto do prompt...]
```

### **Resultado Esperado:**
Um checklist com 50+ itens específicos para contestar a proposta de automação, incluindo:
- Análise de premissas sobre qualidade
- Validação de dados de custo
- Consideração de alternativas
- Análise de consequências para clientes
- Viabilidade técnica e econômica

## 🎯 Benefícios do Checklist

### **Para Contestação**
- ✅ **Estrutura sistemática** para análise
- ✅ **Cobertura abrangente** de aspectos
- ✅ **Perguntas específicas** para investigação
- ✅ **Critérios claros** de avaliação
- ✅ **Ações concretas** para validação

### **Para Análise Crítica**
- ✅ **Identificação de vieses** e falhas
- ✅ **Descoberta de evidências** contrárias
- ✅ **Consideração de alternativas** viáveis
- ✅ **Avaliação de riscos** e consequências
- ✅ **Validação de viabilidade** prática

### **Para Tomada de Decisão**
- ✅ **Base sólida** para contra-argumentos
- ✅ **Evidências** para sustentar posições
- ✅ **Alternativas** bem fundamentadas
- ✅ **Riscos** adequadamente mapeados
- ✅ **Decisões** mais informadas

---

**🎯 Use este prompt para criar checklists poderosos de contestação com Claude!**

**Principais vantagens:**
- ✅ **Estrutura clara** e organizada
- ✅ **Personalização** para qualquer tópico
- ✅ **Cobertura abrangente** de aspectos
- ✅ **Perguntas específicas** e acionáveis
- ✅ **Resultados práticos** e úteis
