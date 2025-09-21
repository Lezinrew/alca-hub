# 📱 Guia Completo: Gerar APK Android - Alca Hub

Este guia fornece instruções detalhadas para gerar o APK do aplicativo Alca Hub e testá-lo em dispositivos Android.

## 📋 Pré-requisitos

### 1. Software Necessário
- **Node.js** (versão 18 ou superior)
- **Java 17** (OpenJDK)
- **Android Studio** (versão mais recente)
- **Android SDK** (instalado via Android Studio)

### 2. Verificar Instalações
```bash
# Verificar Node.js
node --version

# Verificar Java
java -version

# Verificar Android Studio
studio --version
```

## 🚀 Passo a Passo Completo

### Passo 1: Preparar o Ambiente

#### 1.1 Instalar Java 17 (se não estiver instalado)
```bash
# No macOS com Homebrew
brew install openjdk@17

# Configurar PATH
echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

#### 1.2 Instalar Android Studio
```bash
# No macOS com Homebrew
brew install --cask android-studio
```

#### 1.3 Configurar Android SDK
1. Abra o Android Studio
2. Vá em `Tools` → `SDK Manager`
3. Instale os seguintes componentes:
   - Android SDK Platform 34
   - Android SDK Build-Tools 34.0.0
   - Android SDK Platform-Tools
   - Android SDK Command-line Tools

### Passo 2: Configurar o Projeto

#### 2.1 Navegar para o diretório do frontend
```bash
cd /Users/lezinrew/Projetos/alca-hub/frontend
```

#### 2.2 Instalar dependências do Capacitor
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
```

#### 2.3 Inicializar o Capacitor (se não foi feito)
```bash
npx cap init "Alca Hub" "com.alca.hub" --web-dir=dist
```

#### 2.4 Adicionar plataforma Android
```bash
npx cap add android
```

### Passo 3: Build da Aplicação Web

#### 3.1 Fazer build da aplicação
```bash
npm run build
```

#### 3.2 Sincronizar com o projeto Android
```bash
npx cap sync android
```

### Passo 4: Gerar o APK

#### 4.1 Método 1: Via Android Studio (Recomendado)
```bash
# Abrir o projeto no Android Studio
npx cap open android
```

No Android Studio:
1. Aguarde o Gradle sincronizar
2. Vá em `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
3. Aguarde a compilação terminar
4. O APK será gerado em: `android/app/build/outputs/apk/debug/app-debug.apk`

#### 4.2 Método 2: Via Terminal
```bash
cd android
./gradlew assembleDebug
```

### Passo 5: Localizar o APK

O APK será gerado em:
```
/Users/lezinrew/Projetos/alca-hub/frontend/android/app/build/outputs/apk/debug/app-debug.apk
```

## 📱 Testando no Celular

### Passo 1: Preparar o Dispositivo Android

#### 1.1 Habilitar Opções de Desenvolvedor
1. Vá em `Configurações` → `Sobre o telefone`
2. Toque 7 vezes em `Número da versão`
3. Volte para `Configurações` → `Sistema` → `Opções do desenvolvedor`
4. Ative `Depuração USB`

#### 1.2 Conectar o dispositivo
1. Conecte o celular ao computador via USB
2. Autorize a depuração USB quando solicitado
3. Verifique se o dispositivo aparece:
```bash
adb devices
```

### Passo 2: Instalar o APK

#### 2.1 Método 1: Via ADB (Recomendado)
```bash
# Instalar o APK
adb install /Users/lezinrew/Projetos/alca-hub/frontend/android/app/build/outputs/apk/debug/app-debug.apk

# Verificar se foi instalado
adb shell pm list packages | grep alca
```

#### 2.2 Método 2: Transferir Manualmente
1. Copie o arquivo APK para o celular
2. No celular, vá em `Configurações` → `Segurança`
3. Ative `Fontes desconhecidas` ou `Instalar apps desconhecidos`
4. Abra o arquivo APK e instale

### Passo 3: Testar a Aplicação

#### 3.1 Verificar Funcionalidades
- [ ] Aplicação abre corretamente
- [ ] Interface responsiva
- [ ] Navegação funciona
- [ ] Conexão com backend
- [ ] Funcionalidades principais

#### 3.2 Logs de Debug
```bash
# Ver logs em tempo real
adb logcat | grep -i alca

# Ver logs específicos do app
adb logcat | grep -i "com.alca.hub"
```

## 🔧 Solução de Problemas

### Problema 1: Erro de Java Version
```
error: invalid source release: 21
```

**Solução:**
```bash
# Verificar versão do Java
java -version

# Se não for Java 17, configurar no gradle.properties
echo "org.gradle.java.home=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home" >> android/gradle.properties
```

### Problema 2: SDK não encontrado
```
SDK location not found
```

**Solução:**
```bash
# Configurar ANDROID_HOME
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

# Adicionar ao .zshrc
echo 'export ANDROID_HOME="$HOME/Library/Android/sdk"' >> ~/.zshrc
echo 'export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"' >> ~/.zshrc
```

### Problema 3: Dispositivo não reconhecido
```bash
# Verificar se o ADB está funcionando
adb devices

# Se não aparecer dispositivos:
# 1. Verificar se a depuração USB está ativada
# 2. Tentar outro cabo USB
# 3. Reiniciar o ADB
adb kill-server
adb start-server
```

### Problema 4: APK não instala
1. Verificar se `Fontes desconhecidas` está ativado
2. Verificar se há espaço suficiente no dispositivo
3. Tentar desinstalar versão anterior:
```bash
adb uninstall com.alca.hub
```

## 📊 Comandos Úteis

### Build e Deploy
```bash
# Build completo
npm run build && npx cap sync android

# Build e instalar automaticamente
npm run build && npx cap sync android && cd android && ./gradlew assembleDebug && adb install app/build/outputs/apk/debug/app-debug.apk
```

### Debug
```bash
# Ver logs do app
adb logcat | grep -i "com.alca.hub"

# Limpar logs
adb logcat -c

# Ver informações do app instalado
adb shell dumpsys package com.alca.hub
```

### Limpeza
```bash
# Limpar build
cd android && ./gradlew clean

# Limpar cache do Capacitor
npx cap sync android --force
```

## 🎯 Próximos Passos

### Para Produção
1. **Assinar o APK**: Criar keystore para assinatura
2. **Otimizar**: Reduzir tamanho do APK
3. **Testar**: Testes em diferentes dispositivos
4. **Distribuir**: Upload para Google Play Store

### Para Desenvolvimento
1. **Hot Reload**: Configurar para desenvolvimento
2. **Debug**: Configurar ferramentas de debug
3. **Testes**: Implementar testes automatizados

## 📝 Notas Importantes

- O APK gerado é para **debug** - não deve ser usado em produção
- Para produção, é necessário **assinar** o APK
- Teste sempre em dispositivos reais, não apenas emuladores
- Mantenha o backend rodando durante os testes
- Verifique as permissões necessárias no AndroidManifest.xml

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs: `adb logcat`
2. Consulte a documentação do Capacitor
3. Verifique se todas as dependências estão instaladas
4. Teste em um dispositivo limpo

---

**Última atualização**: Janeiro 2025  
**Versão do Capacitor**: 5.x  
**Versão do Android**: API 34
