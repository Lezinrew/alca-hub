# 📱 Guia Completo: Gerar App iOS - Alca Hub

Este guia fornece instruções detalhadas para gerar o aplicativo iOS do Alca Hub e testá-lo em dispositivos iPhone.

## 📋 Pré-requisitos

### 1. Software Necessário
- **macOS** (versão 12.0 ou superior)
- **Xcode** (versão 15.0 ou superior)
- **Node.js** (versão 18 ou superior)
- **CocoaPods** (gerenciador de dependências iOS)
- **Apple Developer Account** (para distribuição)

### 2. Verificar Instalações
```bash
# Verificar Node.js
node --version

# Verificar Xcode
xcodebuild -version

# Verificar CocoaPods
pod --version
```

## 🚀 Passo a Passo Completo

### Passo 1: Instalar Xcode

#### 1.1 Instalar Xcode da App Store
1. Abra a **App Store**
2. Procure por **"Xcode"**
3. Clique em **"Obter"** ou **"Instalar"**
4. Aguarde o download (pode levar algumas horas - ~15GB)
5. Abra o Xcode e aceite os termos de licença

#### 1.2 Configurar Command Line Tools
```bash
# Configurar Xcode como desenvolvedor ativo
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer

# Verificar instalação
xcodebuild -version
```

### Passo 2: Instalar CocoaPods

#### 2.1 Instalar CocoaPods
```bash
# Instalar via gem
sudo gem install cocoapods

# Verificar instalação
pod --version
```

#### 2.2 Configurar CocoaPods
```bash
# Configurar repositório
pod setup

# Verificar configuração
pod --version
```

### Passo 3: Configurar o Projeto

#### 3.1 Navegar para o diretório do frontend
```bash
cd /Users/lezinrew/Projetos/alca-hub/frontend
```

#### 3.2 Instalar dependências do Capacitor (se não foi feito)
```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios
```

#### 3.3 Inicializar o Capacitor (se não foi feito)
```bash
npx cap init "Alca Hub" "com.alca.hub" --web-dir=dist
```

#### 3.4 Adicionar plataforma iOS
```bash
npx cap add ios
```

### Passo 4: Build da Aplicação Web

#### 4.1 Fazer build da aplicação
```bash
npm run build
```

#### 4.2 Sincronizar com o projeto iOS
```bash
npx cap sync ios
```

### Passo 5: Configurar o Projeto iOS

#### 5.1 Abrir o projeto no Xcode
```bash
npx cap open ios
```

#### 5.2 Configurar o App ID
1. No Xcode, selecione o projeto **"Alca Hub"**
2. Vá para **"Signing & Capabilities"**
3. Configure o **Team** (sua conta de desenvolvedor)
4. Configure o **Bundle Identifier**: `com.alca.hub`

#### 5.3 Configurar Permissões
No arquivo `ios/App/App/Info.plist`, adicione as permissões necessárias:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>Este app precisa da sua localização para encontrar prestadores de serviços próximos.</string>

<key>NSCameraUsageDescription</key>
<string>Este app precisa acessar a câmera para tirar fotos dos serviços.</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>Este app precisa acessar a galeria para selecionar fotos dos serviços.</string>
```

### Passo 6: Gerar o App

#### 6.1 Build para Simulador
1. No Xcode, selecione um simulador iOS
2. Clique em **"Build and Run"** (⌘+R)
3. Aguarde a compilação e execução

#### 6.2 Build para Dispositivo Físico
1. Conecte seu iPhone via USB
2. No Xcode, selecione seu dispositivo
3. Configure o **Signing & Capabilities**
4. Clique em **"Build and Run"** (⌘+R)

#### 6.3 Gerar IPA (para distribuição)
1. No Xcode, vá em **Product** → **Archive**
2. Aguarde o processo de archive
3. No **Organizer**, selecione **"Distribute App"**
4. Escolha o método de distribuição:
   - **App Store Connect** (para App Store)
   - **Ad Hoc** (para testes)
   - **Enterprise** (para distribuição interna)
   - **Development** (para desenvolvimento)

## 📱 Testando no iPhone

### Passo 1: Preparar o Dispositivo iOS

#### 1.1 Configurar o iPhone
1. Vá em **Configurações** → **Geral** → **Gerenciamento de Dispositivo**
2. Toque em **"Confiar"** no certificado de desenvolvedor
3. Ative **"Fontes Desconhecidas"** se necessário

#### 1.2 Conectar ao Mac
1. Conecte o iPhone ao Mac via USB
2. Autorize o computador no iPhone
3. No Xcode, selecione o dispositivo na lista

### Passo 2: Instalar o App

#### 2.1 Via Xcode (Desenvolvimento)
1. Selecione o dispositivo no Xcode
2. Clique em **"Build and Run"** (⌘+R)
3. O app será instalado automaticamente

#### 2.2 Via TestFlight (Distribuição)
1. Gere um build para **App Store Connect**
2. Faça upload para **TestFlight**
3. Convide testadores via email
4. Instale via **TestFlight** no iPhone

### Passo 3: Testar a Aplicação

#### 3.1 Verificar Funcionalidades
- [ ] App abre corretamente
- [ ] Interface responsiva
- [ ] Navegação funciona
- [ ] Conexão com backend
- [ ] Funcionalidades principais

#### 3.2 Testes Específicos iOS
- [ ] **Orientação**: Portrait e landscape
- [ ] **Notificações**: Push notifications
- [ ] **Câmera**: Acesso à câmera
- [ ] **Localização**: GPS e mapas
- [ ] **Touch**: Gestos e toques
- [ ] **Performance**: Fluidez e responsividade

## 🔧 Solução de Problemas

### Problema 1: Xcode não encontrado
```
xcode-select: error: tool 'xcodebuild' requires Xcode
```

**Solução:**
```bash
# Instalar Xcode da App Store primeiro
# Depois configurar:
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

### Problema 2: CocoaPods não instalado
```
CocoaPods is not installed
```

**Solução:**
```bash
# Instalar CocoaPods
sudo gem install cocoapods

# Configurar
pod setup
```

### Problema 3: Erro de Signing
```
Code signing error
```

**Solução:**
1. No Xcode, vá em **Signing & Capabilities**
2. Configure o **Team** correto
3. Verifique se o **Bundle Identifier** está único
4. Gere um novo certificado se necessário

### Problema 4: Dispositivo não reconhecido
```
Device not found
```

**Solução:**
1. Verifique se o iPhone está conectado via USB
2. Autorize o computador no iPhone
3. Verifique se o **Developer Mode** está ativado
4. Reinicie o Xcode

### Problema 5: Build falha
```
Build failed
```

**Solução:**
```bash
# Limpar build
cd ios/App
rm -rf build/
rm -rf DerivedData/

# Reinstalar pods
pod deintegrate
pod install

# Sincronizar novamente
cd ../..
npx cap sync ios
```

## 📊 Comandos Úteis

### Build e Deploy
```bash
# Build completo
npm run build && npx cap sync ios

# Abrir no Xcode
npx cap open ios

# Limpar e rebuild
npx cap sync ios --force
```

### Debug
```bash
# Ver logs do simulador
xcrun simctl spawn booted log stream --predicate 'processImagePath CONTAINS "Alca Hub"'

# Ver logs do dispositivo
# Use o Console.app no Mac
```

### Limpeza
```bash
# Limpar build do Xcode
rm -rf ios/App/build/
rm -rf ~/Library/Developer/Xcode/DerivedData/

# Limpar cache do Capacitor
npx cap sync ios --force
```

## 🎯 Próximos Passos

### Para Desenvolvimento
1. **Configurar Push Notifications**: Apple Push Notification service
2. **Integrar Analytics**: Firebase Analytics ou similar
3. **Configurar Deep Links**: URL schemes personalizados
4. **Otimizar Performance**: Profiling e otimizações

### Para Produção
1. **Assinar o App**: Certificado de distribuição
2. **Upload para App Store**: Via App Store Connect
3. **Configurar TestFlight**: Para testes beta
4. **Monitorar Crashes**: Crashlytics ou similar

### Para Distribuição
1. **App Store**: Submissão para review
2. **Enterprise**: Distribuição interna
3. **Ad Hoc**: Distribuição limitada
4. **Development**: Apenas para desenvolvimento

## 📝 Configurações Importantes

### Info.plist
```xml
<!-- Permissões necessárias -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>Este app precisa da sua localização para encontrar prestadores de serviços próximos.</string>

<key>NSCameraUsageDescription</key>
<string>Este app precisa acessar a câmera para tirar fotos dos serviços.</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>Este app precisa acessar a galeria para selecionar fotos dos serviços.</string>

<!-- Configurações de rede -->
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

### Capacitor Config
```json
{
  "appId": "com.alca.hub",
  "appName": "Alca Hub",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "ios": {
    "contentInset": "automatic"
  }
}
```

## 🆘 Suporte

### Recursos Úteis
- **Apple Developer Documentation**: https://developer.apple.com/documentation/
- **Capacitor iOS Guide**: https://capacitorjs.com/docs/ios
- **Xcode Help**: Ajuda integrada no Xcode
- **Stack Overflow**: Comunidade de desenvolvedores

### Canais de Suporte
- **Apple Developer Forums**: https://developer.apple.com/forums/
- **Capacitor Community**: https://github.com/ionic-team/capacitor
- **GitHub Issues**: Para bugs específicos do projeto

## 📱 Dispositivos Suportados

### iPhone
- **iPhone 15/15 Pro** (iOS 17+)
- **iPhone 14/14 Pro** (iOS 16+)
- **iPhone 13/13 Pro** (iOS 15+)
- **iPhone 12/12 Pro** (iOS 14+)
- **iPhone 11/11 Pro** (iOS 13+)

### iPad
- **iPad Pro** (todas as gerações)
- **iPad Air** (4ª geração ou superior)
- **iPad** (8ª geração ou superior)
- **iPad mini** (6ª geração ou superior)

### Versões iOS
- **iOS 17.0+** (recomendado)
- **iOS 16.0+** (mínimo suportado)
- **iOS 15.0+** (compatibilidade)

---

**Última atualização**: Janeiro 2025  
**Versão do Capacitor**: 5.x  
**Versão do iOS**: 17.0+  
**Versão do Xcode**: 15.0+
