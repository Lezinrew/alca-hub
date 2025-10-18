# Setup Android - AlcaHub

Guia completo para configurar o ambiente de desenvolvimento Android do AlcaHub.

## Pré-requisitos

- JDK 17 ou superior
- Android Studio Hedgehog (2023.1.1) ou superior
- Android SDK 34 ou superior
- Gradle 8.0 ou superior
- Ruby 3.0 ou superior
- Conta Google Play Developer (para publicação)

## Instalação Inicial

### 1. Instalar JDK

```bash
# macOS (via Homebrew)
brew install openjdk@17

# Ubuntu/Debian
sudo apt install openjdk-17-jdk

# Verificar instalação
java -version
```

### 2. Instalar Android Studio

1. Baixe em [https://developer.android.com/studio](https://developer.android.com/studio)
2. Siga o assistente de instalação
3. Durante setup, instale:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device (AVD)

### 3. Configurar Android SDK

```bash
# Adicionar ao ~/.zshrc ou ~/.bashrc
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin

# Recarregar
source ~/.zshrc  # ou source ~/.bashrc
```

### 4. Instalar Fastlane

```bash
cd mobile/android
bundle install
```

## Configuração do Projeto

### 1. Abrir o Projeto no Android Studio

```bash
cd mobile/android
# Abra o Android Studio e selecione "Open an Existing Project"
# Navegue até mobile/android/
```

**Aguarde o Gradle Sync completar** (pode levar alguns minutos na primeira vez).

### 2. Configurar Package Name

O Package Name (Application ID) já está configurado:

- **Debug**: `br.com.alcahub.app.debug` (automaticamente adicionado pelo Gradle)
- **Release**: `br.com.alcahub.app`

Verifique em `android/app/build.gradle`:

```gradle
android {
    namespace "br.com.alcahub.app"
    defaultConfig {
        applicationId "br.com.alcahub.app"
        // ...
    }
}
```

### 3. Configurar Signing

#### Debug (Desenvolvimento)

O debug keystore é criado automaticamente pelo Android Studio em:
- macOS/Linux: `~/.android/debug.keystore`
- Windows: `C:\Users\USERNAME\.android\debug.keystore`

Não precisa configurar nada para Debug.

#### Release (Produção)

Para builds de produção, você precisa criar um keystore:

```bash
# Criar keystore de produção
keytool -genkey -v -keystore release-key.keystore \
  -alias alcahub-release \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Mover para local seguro (NUNCA commitar!)
mv release-key.keystore ~/keystores/
```

**Configure as variáveis de ambiente ou crie arquivo local:**

**Opção A: Criar arquivo local (recomendado)**

```bash
# Criar arquivo keystore.properties (não commitado)
cat > mobile/android/keystore.properties << EOF
storePassword=SUA_SENHA_STORE
keyPassword=SUA_SENHA_KEY
keyAlias=alcahub-release
storeFile=/Users/SEU_USUARIO/keystores/release-key.keystore
EOF

# Adicionar ao gitignore
echo "android/keystore.properties" >> .gitignore
```

**Opção B: Variáveis de Ambiente (CI/CD)**

```bash
export KEYSTORE_PASSWORD=sua_senha
export KEY_ALIAS=alcahub-release
export KEY_PASSWORD=sua_senha
export KEYSTORE_PATH=/path/to/keystore
```

#### Configurar build.gradle para usar o Keystore

Edite `android/app/build.gradle`:

```gradle
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    // ...

    signingConfigs {
        debug {
            // Debug usa keystore padrão
        }
        release {
            if (keystorePropertiesFile.exists()) {
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
            }
        }
    }

    buildTypes {
        debug {
            applicationIdSuffix ".debug"
            debuggable true
            minifyEnabled false
        }
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 4. Configurar local.properties

```bash
# Criar se não existir
cat > mobile/android/local.properties << EOF
sdk.dir=/Users/SEU_USUARIO/Library/Android/sdk
EOF
```

Este arquivo já deve estar no .gitignore.

### 5. Sincronizar Gradle

No Android Studio:
1. Menu "File" → "Sync Project with Gradle Files"
2. Ou clique no ícone do elefante na toolbar

Ou via linha de comando:

```bash
cd mobile/android
./gradlew clean build
```

## Executar o App

### No Emulador

#### Criar AVD (Android Virtual Device)

1. Android Studio → Menu "Tools" → "Device Manager"
2. Clique em "Create Device"
3. Escolha um dispositivo (ex: Pixel 6)
4. Selecione uma System Image (ex: Android 14.0 - API 34)
5. Clique em "Finish"

#### Executar

```bash
cd mobile
make run-android
```

Ou no Android Studio:
1. Selecione o emulador no dropdown
2. Clique no botão "Run" (▶️)

### Em Dispositivo Real

1. Ative "Opções de Desenvolvedor" no dispositivo:
   - Ajustes → Sobre o telefone
   - Toque 7 vezes em "Número da versão"

2. Ative "Depuração USB":
   - Ajustes → Sistema → Opções de desenvolvedor
   - Ative "Depuração USB"

3. Conecte via USB

4. Verifique conexão:
```bash
adb devices
```

5. Execute:
```bash
cd mobile
make run-android
```

## Build

### Debug

```bash
cd mobile
make build-android-debug

# Ou diretamente:
cd mobile/android
./gradlew assembleDebug
```

O APK estará em:
`android/app/build/outputs/apk/debug/app-debug.apk`

### Release

```bash
cd mobile
make build-android-release

# Ou diretamente:
cd mobile/android
./gradlew assembleRelease
```

O APK estará em:
`android/app/build/outputs/apk/release/app-release.apk`

### Bundle (para Google Play)

```bash
cd mobile/android
./gradlew bundleRelease
```

O AAB estará em:
`android/app/build/outputs/bundle/release/app-release.aab`

## Testes

```bash
cd mobile
make test-android

# Ou testes específicos:
cd mobile/android
./gradlew test
./gradlew connectedAndroidTest  # Testes instrumentados
```

## Lint e Code Quality

```bash
cd mobile
make lint-android

# Ou diretamente:
cd mobile/android
./gradlew lint
./gradlew ktlintCheck
```

## Configurações de Ambiente

### Debug (Desenvolvimento)
- Package: `br.com.alcahub.app.debug`
- API: Configure em `strings.xml` ou BuildConfig
- Debuggable: true
- Minification: Desabilitada
- Permite instalação simultânea com versão Release

### Release (Produção)
- Package: `br.com.alcahub.app`
- API: Configure em `strings.xml` ou BuildConfig
- Debuggable: false
- Minification: Habilitada (ProGuard/R8)
- Assinado com keystore de produção

### Configurar URLs da API

Adicione em `android/app/src/main/res/values/strings.xml`:

```xml
<resources>
    <string name="app_name">AlcaHub</string>
    <string name="api_base_url">https://api.alcahub.com.br</string>
</resources>
```

Para Debug, crie `android/app/src/debug/res/values/strings.xml`:

```xml
<resources>
    <string name="app_name">AlcaHub Dev</string>
    <string name="api_base_url">http://10.0.2.2:8000</string>
</resources>
```

**Nota:** `10.0.2.2` é o localhost do emulador Android.

## Deploy

### Google Play Internal Testing

```bash
cd mobile
make deploy-android-internal

# Ou com Fastlane:
cd mobile/android
bundle exec fastlane android beta
```

### Google Play Production

```bash
cd mobile/android
bundle exec fastlane android release
```

## Troubleshooting

### Erro: "SDK location not found"

**Solução:**
```bash
echo "sdk.dir=$ANDROID_HOME" > mobile/android/local.properties
```

### Erro: "Gradle sync failed"

**Solução:**
```bash
cd mobile/android
./gradlew clean --refresh-dependencies
./gradlew build
```

### Erro: "Unable to find package Java SE Runtime Environment"

**Solução:**
```bash
# Instalar JDK correto
brew install openjdk@17

# Configurar JAVA_HOME
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
```

### Emulador muito lento

**Solução:**
1. Certifique-se de que a virtualização está habilitada no BIOS/UEFI
2. Use uma System Image com "Google APIs" (não "Google Play")
3. Ative "Graphics: Hardware - GLES 2.0" nas configurações do AVD
4. Aumente RAM do emulador

### Erro: "adb: device offline"

**Solução:**
```bash
adb kill-server
adb start-server
adb devices
```

### Build com erro de memória

**Solução:**

Edite `android/gradle.properties`:

```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m
org.gradle.daemon=true
org.gradle.parallel=true
org.gradle.configureondemand=true
```

### Erro de signing na release

**Solução:**
1. Verifique se `keystore.properties` existe e está correto
2. Verifique o caminho do keystore
3. Teste a senha do keystore:
```bash
keytool -list -v -keystore /path/to/keystore
```

## Estrutura de Arquivos Android

```
android/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/br/com/alcahub/    # Código Kotlin/Java
│   │   │   ├── res/                     # Recursos
│   │   │   └── AndroidManifest.xml      # Manifest
│   │   ├── debug/                       # Recursos Debug
│   │   └── release/                     # Recursos Release
│   ├── build.gradle                     # Build do módulo app
│   └── proguard-rules.pro               # Regras ProGuard
├── gradle/
│   └── wrapper/                         # Gradle Wrapper
├── build.gradle                         # Build root
├── settings.gradle                      # Settings do Gradle
├── gradle.properties                    # Propriedades Gradle
├── local.properties                     # SDK location (local)
├── keystore.properties                  # Keystore config (local)
├── fastlane/
│   ├── Fastfile                        # Lanes do Fastlane
│   └── Appfile                         # Configuração do app
└── Gemfile                             # Dependências Ruby
```

## Versioning

O versionamento é controlado em `android/app/build.gradle`:

```gradle
android {
    defaultConfig {
        versionCode 1        // Incrementar a cada release
        versionName "1.0.0"  // Semver visível ao usuário
    }
}
```

## Recursos

- [Documentação Android](https://developer.android.com/docs)
- [Capacitor Android](https://capacitorjs.com/docs/android)
- [Fastlane Android](https://docs.fastlane.tools/getting-started/android/setup/)
- [Gradle Build Tool](https://gradle.org/guides/)
- [Kotlin](https://kotlinlang.org/docs/home.html)

## Próximos Passos

1. Configure App Icons e Splash Screen
2. Configure Push Notifications (FCM)
3. Configure Deep Links / App Links
4. Configure In-App Purchases (se necessário)
5. Configure Analytics (Firebase, etc)
6. Setup CI/CD
7. Configure Play Store Listing

Consulte a documentação principal em [mobile/README.md](../../README.md) para mais informações.
