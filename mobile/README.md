# AlcaHub Mobile

Aplicativos mobile iOS e Android do AlcaHub, construídos com Capacitor.

## Estrutura do Projeto

```
mobile/
├── ios/                    # Projeto iOS nativo
│   ├── App/               # Código Swift e recursos
│   ├── Config/            # Configurações por ambiente (Debug/Release)
│   ├── fastlane/          # Automação de deploy iOS
│   └── Gemfile            # Dependências Ruby/Fastlane
├── android/               # Projeto Android nativo
│   ├── app/              # Código Kotlin/Java e recursos
│   ├── fastlane/         # Automação de deploy Android
│   └── Gemfile           # Dependências Ruby/Fastlane
├── docs/                 # Documentação específica mobile
│   └── mobile/
│       ├── setup-ios.md
│       ├── setup-android.md
│       ├── pipelines.md
│       └── release.md
└── Makefile              # Comandos de desenvolvimento
```

## Requisitos

### iOS
- macOS 13.0+
- Xcode 15.0+
- CocoaPods 1.15+
- Ruby 3.0+
- Bundler

### Android
- JDK 17+
- Android Studio Hedgehog+
- Android SDK 34+
- Gradle 8.0+

### Comum
- Fastlane 2.217+
- Node.js 18+ (para build do frontend web)

**📚 Guia de Instalação Completo:** [docs/mobile/prerequisites.md](docs/mobile/prerequisites.md)

> Este guia inclui instruções passo a passo para macOS, Linux e Windows, além de scripts automatizados de instalação.

## Instalação Rápida

```bash
# Instalar dependências Ruby
make install

# Setup iOS
make setup-ios

# Setup Android
make setup-android

# Verificar ambiente
make doctor
```

## Comandos Principais

Use `make help` para ver todos os comandos disponíveis.

### Desenvolvimento

```bash
# Build Debug
make build-ios-debug
make build-android-debug

# Build Release
make build-ios-release
make build-android-release

# Executar app
make run-ios          # Simulador iOS
make run-android      # Emulador Android

# Testes
make test-ios
make test-android

# Lint
make lint-ios
make lint-android
```

### Deploy

```bash
# TestFlight (iOS)
make deploy-ios-testflight

# Internal Testing (Android)
make deploy-android-internal

# Screenshots
make screenshots-ios
make screenshots-android
```

### Manutenção

```bash
# Limpar builds
make clean-ios
make clean-android
make clean            # Limpa tudo

# Incrementar versão
make bump-version
```

## Configuração Inicial

### 1. iOS

#### Configuração Rápida

```bash
# Instalar dependências
cd ios
bundle install
cd App
pod install
cd ../..
```

#### Configuração no Xcode

1. Abra `ios/App/App.xcworkspace` no Xcode
2. Vá em Signing & Capabilities
3. Selecione seu Team e ative "Automatically manage signing"
4. Configure `DEVELOPMENT_TEAM` em `Config/Debug.xcconfig` e `Config/Release.xcconfig`

#### Arquivos de Configuração (xcconfig)

Os arquivos `Config/Debug.xcconfig` e `Config/Release.xcconfig` controlam:

- **Bundle ID**: `br.com.alcahub.app.dev` (Debug) / `br.com.alcahub.app` (Release)
- **Swift Version**: 5.10
- **Signing**: Automatic
- **API URLs**: localhost (Debug) / produção (Release)

**Importante:** Configure os arquivos xcconfig no Xcode:
1. Projeto → Info → Configurations
2. Debug → Config/Debug
3. Release → Config/Release

**Guia Completo:** [docs/mobile/setup-ios.md](docs/mobile/setup-ios.md)

### 2. Android

#### Configuração Rápida

```bash
# Instalar dependências
cd android
bundle install

# Configurar SDK location
echo "sdk.dir=$ANDROID_HOME" > local.properties

# Sync Gradle
./gradlew clean build
cd ..
```

#### Configuração no Android Studio

1. Abra `android/` no Android Studio
2. Aguarde Gradle Sync completar
3. Configure signing keys (veja guia completo)

#### Signing para Release

Crie um keystore para produção:

```bash
keytool -genkey -v -keystore release-key.keystore \
  -alias alcahub-release \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

Configure em `android/keystore.properties`:

```properties
storePassword=SUA_SENHA
keyPassword=SUA_SENHA
keyAlias=alcahub-release
storeFile=/path/to/release-key.keystore
```

**Guia Completo:** [docs/mobile/setup-android.md](docs/mobile/setup-android.md)

## Ambientes e Variantes

### iOS

| Ambiente | Bundle ID | API URL | Otimização |
|----------|-----------|---------|------------|
| Debug | `br.com.alcahub.app.dev` | `http://localhost:8000` | ❌ |
| Release | `br.com.alcahub.app` | `https://api.alcahub.com.br` | ✅ |

### Android (Product Flavors + Build Types)

O Android usa **flavors** (dev/prod) e **build types** (debug/release), gerando **4 variantes**:

| Variante | Package ID | API URL | Debuggable | Minified | Uso |
|----------|-----------|---------|------------|----------|-----|
| `devDebug` | `br.com.alcahub.app.dev` | `http://10.0.2.2:8000` | ✅ | ❌ | Desenvolvimento |
| `devRelease` | `br.com.alcahub.app.dev` | `http://10.0.2.2:8000` | ❌ | ✅ | Testes dev |
| `prodDebug` | `br.com.alcahub.app` | `https://api.alcahub.com.br` | ✅ | ❌ | Debug prod |
| `prodRelease` | `br.com.alcahub.app` | `https://api.alcahub.com.br` | ❌ | ✅ | Play Store |

**Comandos de build:**

```bash
# Dev
make build-android-dev-debug
make build-android-dev-release

# Produção
make build-android-prod-debug
make build-android-prod-release

# Bundle para Play Store
make bundle-android-prod

# Ver todas as variantes
make list-android-variants
```

**Nota:** `10.0.2.2` é o localhost do emulador Android.

**📚 Guia Completo de Signing:** [docs/mobile/signing-secrets.md](docs/mobile/signing-secrets.md)

## Capacitor

Os apps mobile são construídos com Capacitor, que permite:
- Usar código web (React) como base
- Acesso a APIs nativas através de plugins
- Deploy simultâneo iOS e Android

### Sincronizar com código web

Quando o frontend web é atualizado:

```bash
# Na raiz do projeto
cd frontend
npm run build

# Sincronizar com mobile
npx cap sync ios
npx cap sync android
```

## CI/CD

Os pipelines automatizados estão configurados para:
- Build automático em PRs
- Deploy para TestFlight/Internal Testing em merges para `main`
- Release para produção com tags

Veja [docs/mobile/pipelines.md](docs/mobile/pipelines.md)

## Fastlane

Fastlane automatiza builds, testes e deploys.

### iOS Lanes

```bash
bundle exec fastlane ios build_debug
bundle exec fastlane ios build_release
bundle exec fastlane ios beta          # TestFlight
bundle exec fastlane ios release       # App Store
bundle exec fastlane ios screenshots
```

### Android Lanes

```bash
bundle exec fastlane android build_debug
bundle exec fastlane android build_release
bundle exec fastlane android beta      # Internal Testing
bundle exec fastlane android release   # Production
bundle exec fastlane android screenshots
```

## Troubleshooting

### iOS

**Erro: No code signing identity found**
- Configure seu Team ID no Xcode
- Atualize `DEVELOPMENT_TEAM` em `Config/*.xcconfig`

**Pods não encontrados**
- Execute `cd ios/App && pod install`

### Android

**Erro: SDK location not found**
- Crie `android/local.properties`:
  ```
  sdk.dir=/Users/SEU_USUARIO/Library/Android/sdk
  ```

**Gradle sync falhou**
- Limpe cache: `cd android && ./gradlew clean --refresh-dependencies`

## Recursos

- [Documentação Capacitor](https://capacitorjs.com/docs)
- [Fastlane iOS](https://docs.fastlane.tools/getting-started/ios/setup/)
- [Fastlane Android](https://docs.fastlane.tools/getting-started/android/setup/)
- [Guia Apple Developer](https://developer.apple.com/documentation/)
- [Guia Android Developer](https://developer.android.com/docs)

## Suporte

Para dúvidas ou problemas:
1. Verifique [docs/mobile/](docs/mobile/)
2. Execute `make doctor` para diagnosticar ambiente
3. Abra issue no repositório
