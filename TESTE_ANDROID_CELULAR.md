# 📱 Guia de Teste no Celular - Alca Hub Android

Este guia detalha como testar o aplicativo Alca Hub em dispositivos Android reais.

## 🎯 Objetivos dos Testes

### Funcionalidades Principais
- [ ] **Login/Registro**: Autenticação de usuários
- [ ] **Navegação**: Menu e rotas funcionando
- [ ] **Agendamento**: Criação e gerenciamento de agendamentos
- [ ] **Mapa**: Localização e seleção de endereços
- [ ] **Pagamentos**: Integração com MercadoPago
- [ ] **Notificações**: Push notifications
- [ ] **Offline**: Funcionamento sem internet

### Performance
- [ ] **Tempo de carregamento**: < 3 segundos
- [ ] **Responsividade**: Interface fluida
- [ ] **Memória**: Uso otimizado de RAM
- [ ] **Bateria**: Consumo eficiente

## 📋 Checklist de Testes

### 1. Teste de Instalação
- [ ] APK instala sem erros
- [ ] Ícone aparece na tela inicial
- [ ] Aplicação abre corretamente
- [ ] Splash screen funciona
- [ ] Permissões são solicitadas adequadamente

### 2. Teste de Interface
- [ ] **Layout responsivo**: Funciona em diferentes tamanhos de tela
- [ ] **Orientação**: Portrait e landscape
- [ ] **Navegação**: Botões e links funcionam
- [ ] **Formulários**: Inputs e validações
- [ ] **Imagens**: Carregamento e exibição
- [ ] **Cores e temas**: Consistência visual

### 3. Teste de Funcionalidades
- [ ] **Autenticação**:
  - [ ] Login com email/senha
  - [ ] Registro de novo usuário
  - [ ] Recuperação de senha
  - [ ] Logout
- [ ] **Agendamento**:
  - [ ] Seleção de serviços
  - [ ] Escolha de data/hora
  - [ ] Seleção de profissional
  - [ ] Confirmação de agendamento
- [ ] **Pagamento**:
  - [ ] Integração MercadoPago
  - [ ] Processamento de pagamento
  - [ ] Confirmação de transação
- [ ] **Mapa**:
  - [ ] Localização atual
  - [ ] Busca de endereços
  - [ ] Seleção de localização
  - [ ] Navegação GPS

### 4. Teste de Conectividade
- [ ] **WiFi**: Funciona com WiFi
- [ ] **Dados móveis**: Funciona com 4G/5G
- [ ] **Offline**: Comportamento sem internet
- [ ] **Reconexão**: Sincronização ao voltar online

### 5. Teste de Performance
- [ ] **Tempo de resposta**: < 2 segundos para ações
- [ ] **Memória**: Não trava por falta de RAM
- [ ] **Bateria**: Consumo dentro do esperado
- [ ] **Aquecimento**: Dispositivo não esquenta excessivamente

## 🔧 Configuração do Ambiente de Teste

### 1. Preparar o Dispositivo

#### 1.1 Habilitar Opções de Desenvolvedor
```
Configurações → Sobre o telefone → Número da versão (toque 7 vezes)
```

#### 1.2 Ativar Depuração USB
```
Configurações → Sistema → Opções do desenvolvedor → Depuração USB
```

#### 1.3 Permitir Instalação de Apps Desconhecidos
```
Configurações → Segurança → Fontes desconhecidas
```

### 2. Conectar ao Computador

#### 2.1 Verificar Conexão
```bash
# Verificar se o dispositivo está conectado
adb devices

# Deve aparecer algo como:
# List of devices attached
# ABC123456789    device
```

#### 2.2 Instalar APK
```bash
# Instalar o APK
adb install -r /Users/lezinrew/Projetos/alca-hub/frontend/android/app/build/outputs/apk/debug/app-debug.apk

# -r = reinstalar se já existir
```

## 📊 Monitoramento Durante os Testes

### 1. Logs em Tempo Real
```bash
# Ver todos os logs
adb logcat

# Filtrar logs do app
adb logcat | grep -i "com.alca.hub"

# Filtrar erros
adb logcat | grep -i "error\|exception\|crash"
```

### 2. Performance do Sistema
```bash
# Informações do app
adb shell dumpsys package com.alca.hub

# Uso de memória
adb shell dumpsys meminfo com.alca.hub

# CPU e bateria
adb shell dumpsys batterystats com.alca.hub
```

### 3. Screenshots e Vídeos
```bash
# Tirar screenshot
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png

# Gravar tela (Android 4.4+)
adb shell screenrecord /sdcard/demo.mp4
# Para parar: Ctrl+C
adb pull /sdcard/demo.mp4
```

## 🐛 Cenários de Teste Específicos

### 1. Teste de Rede
```bash
# Simular perda de conexão
adb shell svc wifi disable
adb shell svc data disable

# Restaurar conexão
adb shell svc wifi enable
adb shell svc data enable
```

### 2. Teste de Memória
```bash
# Simular baixa memória
adb shell "echo 3 > /proc/sys/vm/drop_caches"
```

### 3. Teste de Orientação
```bash
# Rotacionar tela
adb shell content insert --uri content://settings/system --bind name:s:accelerometer_rotation --bind value:i:1
```

## 📱 Teste em Diferentes Dispositivos

### Dispositivos Recomendados para Teste
- **Samsung Galaxy**: Série S, A, M
- **Google Pixel**: Pixel 6, 7, 8
- **Xiaomi**: Redmi, Mi
- **Motorola**: Moto G, Edge
- **LG**: G, V series

### Versões Android para Testar
- **Android 14** (API 34) - Mais recente
- **Android 13** (API 33) - Amplamente usado
- **Android 12** (API 31) - Versão estável
- **Android 11** (API 30) - Versão mínima suportada

## 🔍 Checklist de Problemas Comuns

### Problema: App não abre
- [ ] Verificar se o APK foi instalado corretamente
- [ ] Verificar logs: `adb logcat | grep -i "com.alca.hub"`
- [ ] Verificar permissões no AndroidManifest.xml
- [ ] Testar em dispositivo limpo

### Problema: App trava
- [ ] Verificar uso de memória: `adb shell dumpsys meminfo com.alca.hub`
- [ ] Verificar logs de crash: `adb logcat | grep -i "crash"`
- [ ] Testar com menos funcionalidades ativas
- [ ] Verificar se o backend está rodando

### Problema: Interface não responsiva
- [ ] Verificar se o CSS está sendo carregado
- [ ] Testar em diferentes resoluções
- [ ] Verificar se o JavaScript está funcionando
- [ ] Testar com diferentes orientações

### Problema: Conexão com backend falha
- [ ] Verificar se o backend está rodando
- [ ] Verificar URL da API no código
- [ ] Testar conectividade: `adb shell ping [IP_DO_BACKEND]`
- [ ] Verificar firewall e proxy

## 📈 Métricas de Sucesso

### Performance
- **Tempo de inicialização**: < 3 segundos
- **Tempo de resposta**: < 2 segundos
- **Uso de memória**: < 100MB
- **Tamanho do APK**: < 50MB

### Funcionalidade
- **Taxa de sucesso**: > 95%
- **Crashes**: < 1 por sessão
- **Funcionalidades críticas**: 100% funcionais

### Usabilidade
- **Navegação intuitiva**: Sem confusão
- **Feedback visual**: Resposta imediata
- **Acessibilidade**: Funciona com leitores de tela

## 🚀 Próximos Passos Após os Testes

### Se os testes passaram:
1. **Otimizar**: Melhorar performance se necessário
2. **Assinar**: Criar versão release assinada
3. **Distribuir**: Preparar para Google Play Store
4. **Monitorar**: Configurar analytics e crash reporting

### Se houver problemas:
1. **Documentar**: Registrar todos os problemas encontrados
2. **Priorizar**: Classificar por severidade
3. **Corrigir**: Implementar correções
4. **Retestar**: Validar as correções

## 📝 Template de Relatório de Teste

```
=== RELATÓRIO DE TESTE - ALC HUB ANDROID ===

Data: [DATA]
Dispositivo: [MODELO]
Android: [VERSÃO]
APK: [VERSÃO]

FUNCIONALIDADES TESTADAS:
✅ Login/Registro
✅ Navegação
✅ Agendamento
❌ Pagamento (problema: [DESCRIÇÃO])

PROBLEMAS ENCONTRADOS:
1. [PROBLEMA 1] - Severidade: Alta/Média/Baixa
2. [PROBLEMA 2] - Severidade: Alta/Média/Baixa

PERFORMANCE:
- Tempo de inicialização: [X] segundos
- Uso de memória: [X] MB
- Crashes: [X] ocorrências

RECOMENDAÇÕES:
- [RECOMENDAÇÃO 1]
- [RECOMENDAÇÃO 2]

STATUS GERAL: ✅ APROVADO / ❌ REPROVADO
```

---

**Importante**: Sempre teste em dispositivos reais, não apenas emuladores. Os emuladores podem mascarar problemas de performance e compatibilidade.
