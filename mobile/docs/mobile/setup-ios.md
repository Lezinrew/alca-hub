# Setup iOS - AlcaHub

Guia completo para configurar o ambiente de desenvolvimento iOS do AlcaHub.

## Pré-requisitos

- macOS 13.0 ou superior
- Xcode 15.0 ou superior
- CocoaPods 1.15 ou superior
- Ruby 3.0 ou superior
- Conta Apple Developer (para testes em dispositivo real e publicação)

## Instalação Inicial

### 1. Instalar Xcode

```bash
# Instalar via App Store ou:
xcode-select --install

# Verificar versão
xcodebuild -version
```

### 2. Instalar CocoaPods

```bash
# Via RubyGems
sudo gem install cocoapods

# Ou via Homebrew
brew install cocoapods

# Verificar instalação
pod --version
```

### 3. Instalar Fastlane

```bash
cd mobile/ios
bundle install
```

## Configuração do Projeto

### 1. Abrir o Projeto no Xcode

```bash
cd mobile/ios
open App/App.xcworkspace
```

**Importante:** Sempre abra o arquivo `.xcworkspace`, não o `.xcodeproj`, pois o projeto usa CocoaPods.

### 2. Configurar Signing & Capabilities

#### Passo 1: Selecionar o Target "App"

1. No Xcode, clique no projeto "App" no navegador esquerdo
2. Selecione o target "App" na seção TARGETS
3. Vá para a aba "Signing & Capabilities"

#### Passo 2: Configurar Team

1. Em "Team", selecione seu Apple Developer Team
2. Se não tiver, clique em "Add an Account..." e faça login com sua Apple ID
3. Para desenvolvimento local, pode usar um Personal Team (gratuito)

#### Passo 3: Bundle Identifier

O Bundle ID já está configurado nos arquivos xcconfig:

- **Debug**: `br.com.alcahub.app.dev`
- **Release**: `br.com.alcahub.app`

**Não altere manualmente no Xcode**, use os arquivos de configuração.

#### Passo 4: Ativar Automatic Signing

1. Marque a opção "Automatically manage signing"
2. O Xcode criará automaticamente os provisioning profiles necessários

### 3. Referenciar Arquivos xcconfig no Projeto

#### Passo 1: Adicionar Arquivos ao Projeto

1. No Xcode, clique com botão direito na pasta do projeto
2. Selecione "Add Files to 'App'..."
3. Navegue até `mobile/ios/Config/`
4. Selecione ambos `Debug.xcconfig` e `Release.xcconfig`
5. Certifique-se de que "Copy items if needed" NÃO está marcado
6. Clique em "Add"

#### Passo 2: Configurar Build Settings

1. Selecione o projeto "App" (não o target)
2. Vá para a aba "Info"
3. Em "Configurations", você verá Debug e Release
4. Para **Debug**:
   - Clique no dropdown ao lado de "App"
   - Selecione "Config/Debug"
5. Para **Release**:
   - Clique no dropdown ao lado de "App"
   - Selecione "Config/Release"

#### Passo 3: Definir DEVELOPMENT_TEAM

Você precisa definir seu Team ID nas configurações. Há duas opções:

**Opção A: Criar arquivo xcconfig local (recomendado)**

```bash
# Criar arquivo local (não commitado)
echo "DEVELOPMENT_TEAM = SEU_TEAM_ID" > mobile/ios/Config/Local.xcconfig
echo "mobile/ios/Config/Local.xcconfig" >> .gitignore
```

Então, adicione esta linha no início dos arquivos Debug.xcconfig e Release.xcconfig:

```
#include "Local.xcconfig"
```

**Opção B: Adicionar diretamente no xcconfig**

Edite `Debug.xcconfig` e `Release.xcconfig`:

```
DEVELOPMENT_TEAM = YOUR_TEAM_ID_HERE
```

Para encontrar seu Team ID:
1. Abra Xcode
2. Menu "Xcode" → "Preferences" → "Accounts"
3. Selecione sua conta
4. Seu Team ID está ao lado do nome do time

### 4. Instalar Dependências

```bash
cd mobile/ios/App
pod install
```

### 5. Verificar Configuração

```bash
# Voltar para mobile/
cd ..

# Verificar ambiente
make doctor
```

## Executar o App

### No Simulador

```bash
cd mobile
make run-ios
```

Ou no Xcode:
1. Selecione um simulador (ex: iPhone 15)
2. Clique no botão "Play" (⌘R)

### Em Dispositivo Real

1. Conecte seu iPhone/iPad via USB
2. Confie no computador no dispositivo
3. No Xcode, selecione seu dispositivo no dropdown
4. Clique em "Play" (⌘R)

**Nota:** Para primeira execução em dispositivo real, vá em:
- Ajustes → Geral → VPN e Gerenciamento de Dispositivos
- Confie no seu certificado de desenvolvedor

## Build

### Debug

```bash
cd mobile
make build-ios-debug
```

### Release

```bash
cd mobile
make build-ios-release
```

## Testes

```bash
cd mobile
make test-ios
```

Ou no Xcode:
- Menu "Product" → "Test" (⌘U)

## Configurações de Ambiente

Os arquivos xcconfig controlam configurações por ambiente:

### Debug (Desenvolvimento)
- Bundle ID: `br.com.alcahub.app.dev`
- API: `http://localhost:8000`
- Otimização: Desabilitada
- Signing: Automatic
- Permite instalação simultânea com versão Release

### Release (Produção)
- Bundle ID: `br.com.alcahub.app`
- API: `https://api.alcahub.com.br`
- Otimização: Habilitada
- Signing: Automatic (ou Manual para distribuição)
- Validação de produto ativada

## Deploy

### TestFlight (Beta Testing)

```bash
cd mobile
make deploy-ios-testflight
```

Ou com Fastlane:

```bash
cd mobile/ios
bundle exec fastlane ios beta
```

### App Store (Produção)

```bash
cd mobile/ios
bundle exec fastlane ios release
```

## Troubleshooting

### Erro: "No code signing identity found"

**Solução:**
1. Configure seu Team ID no Xcode ou nos arquivos xcconfig
2. Ative "Automatically manage signing"
3. Aguarde o Xcode gerar os profiles

### Erro: "Pods not found"

**Solução:**
```bash
cd mobile/ios/App
pod deintegrate
pod install
```

### Erro: "Developer Mode disabled"

**Solução:**
No dispositivo iOS:
- Ajustes → Privacidade e Segurança → Modo de Desenvolvedor
- Ative e reinicie o dispositivo

### Erro: "Module compiled with Swift X.X cannot be imported"

**Solução:**
1. Limpe o build: ⇧⌘K (Shift+Command+K)
2. Delete DerivedData:
```bash
rm -rf ~/Library/Developer/Xcode/DerivedData
```
3. Rebuild: ⌘B

### Build lento

**Solução:**
1. Ative "Build for Active Architecture Only" no Debug (já está nos xcconfig)
2. Use simulador ao invés de dispositivo real para testes rápidos
3. Desative indexação temporariamente: Preferences → Locations → DerivedData → Delete

### Erro: "Provisioning profile doesn't match"

**Solução:**
1. Vá em Signing & Capabilities
2. Desmarque "Automatically manage signing"
3. Marque novamente
4. Aguarde o Xcode recriar os profiles

## Estrutura de Arquivos iOS

```
ios/
├── App/
│   ├── App.xcodeproj          # Projeto Xcode
│   ├── App.xcworkspace        # Workspace (use este!)
│   ├── App/                   # Código fonte Swift
│   │   ├── AppDelegate.swift
│   │   └── Assets.xcassets
│   ├── Podfile                # Dependências CocoaPods
│   └── Podfile.lock           # Lock das dependências
├── Config/
│   ├── Debug.xcconfig         # Configuração Debug
│   └── Release.xcconfig       # Configuração Release
├── fastlane/
│   ├── Fastfile               # Lanes do Fastlane
│   └── Appfile                # Configuração do app
└── Gemfile                    # Dependências Ruby
```

## Recursos

- [Documentação Apple Developer](https://developer.apple.com/documentation/)
- [Capacitor iOS](https://capacitorjs.com/docs/ios)
- [Fastlane iOS](https://docs.fastlane.tools/getting-started/ios/setup/)
- [CocoaPods](https://guides.cocoapods.org/)
- [Swift.org](https://swift.org/documentation/)

## Próximos Passos

1. Configure App Icons e Launch Screen
2. Configure Push Notifications (se necessário)
3. Configure Deep Links
4. Configure In-App Purchases (se necessário)
5. Configure Analytics (Firebase, etc)
6. Setup CI/CD

Consulte a documentação principal em [mobile/README.md](../../README.md) para mais informações.
