# Assinatura e Gerenciamento de Segredos

Guia completo sobre como gerenciar keystores, certificados e segredos no projeto AlcaHub Mobile.

## Índice

- [Android Signing](#android-signing)
- [iOS Signing](#ios-signing)
- [Gerenciamento de Segredos](#gerenciamento-de-segredos)
- [CI/CD](#cicd)
- [Segurança](#segurança)

---

## Android Signing

### Product Flavors e Build Types

O projeto está configurado com **2 flavors** e **2 build types**, gerando **4 variantes**:

| Variante | Package ID | Debuggable | Minified | Uso |
|----------|-----------|------------|----------|-----|
| `devDebug` | `br.com.alcahub.app.dev` | ✅ | ❌ | Desenvolvimento local |
| `devRelease` | `br.com.alcahub.app.dev` | ❌ | ✅ | Testes internos dev |
| `prodDebug` | `br.com.alcahub.app` | ✅ | ❌ | Debug em produção |
| `prodRelease` | `br.com.alcahub.app` | ❌ | ✅ | Google Play Store |

### Configuração de Flavors

Em [android/app/build.gradle](../../android/app/build.gradle):

```gradle
productFlavors {
    dev {
        dimension "environment"
        applicationIdSuffix ".dev"
        versionNameSuffix "-dev"
        buildConfigField "String", "API_BASE_URL", "\"http://10.0.2.2:8000\""
        buildConfigField "String", "ENVIRONMENT", "\"development\""
        buildConfigField "boolean", "ENABLE_LOGGING", "true"
        resValue "string", "app_name", "AlcaHub Dev"
    }

    prod {
        dimension "environment"
        buildConfigField "String", "API_BASE_URL", "\"https://api.alcahub.com.br\""
        buildConfigField "String", "ENVIRONMENT", "\"production\""
        buildConfigField "boolean", "ENABLE_LOGGING", "false"
        resValue "string", "app_name", "AlcaHub"
    }
}
```

### Usar BuildConfig no código Kotlin/Java

```kotlin
import br.com.alcahub.app.BuildConfig

class ApiClient {
    private val baseUrl = BuildConfig.API_BASE_URL
    private val environment = BuildConfig.ENVIRONMENT

    fun log(message: String) {
        if (BuildConfig.ENABLE_LOGGING) {
            Log.d("AlcaHub", message)
        }
    }
}
```

### Criar Keystore de Produção

**Passo 1: Gerar Keystore**

```bash
# Navegar para diretório seguro
mkdir -p ~/keystores
cd ~/keystores

# Gerar keystore
keytool -genkey -v -keystore alcahub-release.keystore \
  -alias alcahub-release \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Você será solicitado a informar:
# - Senha do keystore (lembre-se dela!)
# - Senha da chave (pode ser a mesma)
# - Nome, organização, etc.
```

**Passo 2: Guardar Informações**

Anote em local seguro:
- 📁 Caminho do keystore: `~/keystores/alcahub-release.keystore`
- 🔑 Alias: `alcahub-release`
- 🔒 Senha do keystore: `******`
- 🔒 Senha da chave: `******`

**⚠️ IMPORTANTE:**
- Faça backup do keystore em local seguro
- Se perder o keystore, não poderá atualizar o app na Play Store
- NUNCA commite o keystore no Git

### Configurar Keystore no Projeto

**Opção A: Arquivo Local (Desenvolvimento)**

```bash
# Criar arquivo de configuração
cd mobile/android
cp keystore.properties.example keystore.properties

# Editar keystore.properties
nano keystore.properties
```

Conteúdo de `keystore.properties`:

```properties
keyAlias=alcahub-release
keyPassword=SUA_SENHA_DA_CHAVE
storeFile=/Users/seu-usuario/keystores/alcahub-release.keystore
storePassword=SUA_SENHA_DO_KEYSTORE
```

**⚠️ IMPORTANTE:**
- `keystore.properties` já está no `.gitignore`
- NUNCA commite este arquivo

**Opção B: Variáveis de Ambiente (CI/CD)**

```bash
# Configurar variáveis de ambiente
export KEYSTORE_KEY_ALIAS=alcahub-release
export KEYSTORE_KEY_PASSWORD=sua_senha_chave
export KEYSTORE_FILE=/path/to/keystore.jks
export KEYSTORE_PASSWORD=sua_senha_keystore
```

### Build Variants

```bash
cd mobile/android

# Listar todas as variantes disponíveis
./gradlew tasks --all | grep assemble

# Build variantes específicas
./gradlew assembleDevDebug        # APK dev debug
./gradlew assembleDevRelease      # APK dev release (assinado)
./gradlew assembleProdDebug       # APK prod debug
./gradlew assembleProdRelease     # APK prod release (assinado)

# Bundle para Play Store
./gradlew bundleProdRelease       # AAB produção
```

**Localização dos APKs/AABs:**

```
android/app/build/outputs/
├── apk/
│   ├── dev/
│   │   ├── debug/app-dev-debug.apk
│   │   └── release/app-dev-release.apk
│   └── prod/
│       ├── debug/app-prod-debug.apk
│       └── release/app-prod-release.apk
└── bundle/
    └── prodRelease/app-prod-release.aab
```

### Verificar Assinatura do APK

```bash
# Verificar se APK está assinado
jarsigner -verify -verbose -certs app-prod-release.apk

# Ver detalhes do certificado
keytool -list -printcert -jarfile app-prod-release.apk

# Ver informações do keystore
keytool -list -v -keystore alcahub-release.keystore
```

---

## iOS Signing

### Configuração de Certificados

O iOS usa **Automatic Signing** por padrão, mas você pode configurar **Manual Signing** para mais controle.

### Automatic Signing (Recomendado para Dev)

Configurado em [ios/Config/Debug.xcconfig](../../ios/Config/Debug.xcconfig):

```
// Signing & Capabilities
CODE_SIGN_IDENTITY = iPhone Developer
CODE_SIGN_STYLE = Automatic
DEVELOPMENT_TEAM = YOUR_TEAM_ID
```

**Como obter seu Team ID:**

1. Abra Xcode
2. Menu "Xcode" → "Preferences" → "Accounts"
3. Selecione sua conta Apple
4. Seu Team ID aparece ao lado do nome do time

### Manual Signing (Produção)

Para builds de produção, configure manualmente:

```
// Config/Release.xcconfig
CODE_SIGN_STYLE = Manual
DEVELOPMENT_TEAM = YOUR_TEAM_ID
PROVISIONING_PROFILE_SPECIFIER = AlcaHub_Production
```

**Criar Provisioning Profile:**

1. Acesse [Apple Developer Portal](https://developer.apple.com/account)
2. Certificates, Identifiers & Profiles
3. Provisioning Profiles → "+"
4. Selecione "App Store"
5. Escolha Bundle ID: `br.com.alcahub.app`
6. Selecione seu certificado de distribuição
7. Download e instale

### Certificados iOS

**Development Certificate:**
- Para testes em dispositivos físicos
- Válido por 1 ano
- Gerado automaticamente com Automatic Signing

**Distribution Certificate:**
- Para App Store e TestFlight
- Válido por 1 ano
- Deve ser criado manualmente

**Como criar Distribution Certificate:**

1. Apple Developer Portal → Certificates → "+"
2. Selecione "Apple Distribution"
3. Crie Certificate Signing Request (CSR) no Keychain Access
4. Upload CSR
5. Download certificado (.cer)
6. Duplo clique para instalar no Keychain

### Build para TestFlight/App Store

```bash
cd mobile

# Build release iOS
make build-ios-release

# Ou com Fastlane
cd ios
bundle exec fastlane ios beta      # TestFlight
bundle exec fastlane ios release   # App Store
```

---

## Gerenciamento de Segredos

### Arquivos que NÃO devem ser commitados

```
# Android
android/keystore.properties
android/app/google-services.json
android/*.keystore
android/*.jks

# iOS
ios/Config/Local.xcconfig
ios/*.mobileprovision
ios/*.p12
ios/GoogleService-Info.plist

# Geral
.env
.env.local
*.pem
*.key
```

### Estrutura de Segredos

```
~/secure/alcahub/
├── android/
│   ├── alcahub-release.keystore
│   ├── keystore-info.txt
│   └── google-services.json
├── ios/
│   ├── certificates/
│   │   ├── distribution.p12
│   │   └── development.p12
│   ├── profiles/
│   │   ├── AlcaHub_AppStore.mobileprovision
│   │   └── AlcaHub_Development.mobileprovision
│   └── GoogleService-Info.plist
└── api-keys/
    ├── firebase-admin-key.json
    └── mercadopago-keys.txt
```

### Usar Segredos Localmente

**Android:**

```bash
cd mobile/android
cp ~/secure/alcahub/android/keystore.properties .
cp ~/secure/alcahub/android/google-services.json app/
```

**iOS:**

```bash
cd mobile/ios
cp ~/secure/alcahub/ios/GoogleService-Info.plist App/
```

### gradle.properties

Use para configurações não-sensíveis ou que podem ser públicas:

```properties
# android/gradle.properties

# Configurações de build
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m
org.gradle.daemon=true
org.gradle.parallel=true
org.gradle.caching=true

# Configurações do projeto
android.useAndroidX=true
android.enableJetifier=true

# Otimizações
android.enableR8.fullMode=true
android.nonTransitiveRClass=true
android.nonFinalResIds=true

# Versões (podem ser públicas)
VERSION_NAME=1.0.0
VERSION_CODE=1
```

---

## CI/CD

### GitHub Actions - Secrets

Configure secrets no repositório GitHub:
- Settings → Secrets and variables → Actions → New repository secret

**Secrets necessários:**

```yaml
# Android
KEYSTORE_FILE: (base64 do .keystore)
KEYSTORE_PASSWORD: senha_do_keystore
KEYSTORE_KEY_ALIAS: alcahub-release
KEYSTORE_KEY_PASSWORD: senha_da_chave
GOOGLE_SERVICES_JSON: (conteúdo do arquivo)
PLAY_STORE_JSON_KEY: (chave de serviço Google Play)

# iOS
APPLE_KEY_ID: chave_api_app_store_connect
APPLE_ISSUER_ID: issuer_id
APPLE_KEY_CONTENT: (conteúdo da chave .p8)
MATCH_PASSWORD: senha_certificados
FASTLANE_PASSWORD: senha_apple_id
CERTIFICATE_P12: (base64 do .p12)
CERTIFICATE_PASSWORD: senha_certificado
```

### GitHub Actions Workflow

```yaml
name: Build Android Release

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Decode Keystore
        run: |
          echo "${{ secrets.KEYSTORE_FILE }}" | base64 -d > release.keystore

      - name: Create keystore.properties
        run: |
          cd mobile/android
          cat > keystore.properties << EOF
          keyAlias=${{ secrets.KEYSTORE_KEY_ALIAS }}
          keyPassword=${{ secrets.KEYSTORE_KEY_PASSWORD }}
          storeFile=${{ github.workspace }}/release.keystore
          storePassword=${{ secrets.KEYSTORE_PASSWORD }}
          EOF

      - name: Build Release APK
        run: |
          cd mobile/android
          ./gradlew assembleProdRelease

      - name: Upload APK
        uses: actions/upload-artifact@v3
        with:
          name: app-prod-release
          path: mobile/android/app/build/outputs/apk/prod/release/app-prod-release.apk
```

### GitLab CI/CD - Variables

Configure em: Settings → CI/CD → Variables

```yaml
# .gitlab-ci.yml
build:android:
  stage: build
  image: mingc/android-build-box:latest
  script:
    - cd mobile/android
    - echo "$KEYSTORE_FILE" | base64 -d > release.keystore
    - |
      cat > keystore.properties << EOF
      keyAlias=$KEYSTORE_KEY_ALIAS
      keyPassword=$KEYSTORE_KEY_PASSWORD
      storeFile=$CI_PROJECT_DIR/release.keystore
      storePassword=$KEYSTORE_PASSWORD
      EOF
    - ./gradlew assembleProdRelease
  artifacts:
    paths:
      - mobile/android/app/build/outputs/apk/prod/release/app-prod-release.apk
```

---

## Segurança

### Checklist de Segurança

- [ ] **Keystore** em local seguro e com backup
- [ ] **keystore.properties** no .gitignore
- [ ] **Senhas** nunca commitadas no código
- [ ] **Certificados iOS** protegidos com senha
- [ ] **.env** files no .gitignore
- [ ] **API Keys** não hardcoded no código
- [ ] **Google Services JSON** não commitado
- [ ] **Secrets do CI/CD** configurados corretamente
- [ ] **Acesso ao keystore** limitado a pessoas necessárias
- [ ] **Senhas fortes** (mínimo 12 caracteres)

### Boas Práticas

1. **Nunca commite segredos**
   ```bash
   # Verificar antes de commit
   git diff --cached | grep -i "password\|key\|secret"
   ```

2. **Use .gitignore adequadamente**
   ```gitignore
   # mobile/.gitignore
   *.keystore
   *.jks
   *.p12
   *.mobileprovision
   keystore.properties
   google-services.json
   GoogleService-Info.plist
   .env
   .env.*
   ```

3. **Rotação de segredos**
   - Keystore: Criar novo para cada app
   - API Keys: Rotacionar anualmente
   - Certificados iOS: Renovar antes de expirar

4. **Backup seguro**
   ```bash
   # Fazer backup criptografado
   tar czf alcahub-secrets-$(date +%Y%m%d).tar.gz ~/secure/alcahub/
   gpg --encrypt --recipient seu-email@example.com alcahub-secrets-*.tar.gz
   ```

5. **Documentação de emergência**
   - Manter documento com instruções de recuperação
   - Guardar senhas em gerenciador (1Password, LastPass)
   - Ter plano B se perder acesso

### Revogar Certificados Comprometidos

**Android:**
1. Gerar novo keystore
2. Criar novo app no Play Console (não é possível trocar keystore)
3. Migrar usuários gradualmente

**iOS:**
1. Apple Developer Portal → Certificates
2. Revogar certificado comprometido
3. Criar novo certificado
4. Atualizar provisioning profiles

---

## Referências

- [Android App Signing](https://developer.android.com/studio/publish/app-signing)
- [Android Build Variants](https://developer.android.com/build/build-variants)
- [iOS Code Signing](https://developer.apple.com/support/code-signing/)
- [Fastlane Match](https://docs.fastlane.tools/actions/match/)
- [GitHub Actions Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

Voltar para [README Mobile](../../README.md)
