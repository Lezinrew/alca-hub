# Pré-requisitos - AlcaHub Mobile

Guia de instalação de todas as ferramentas necessárias para desenvolver os apps mobile do AlcaHub.

## Índice

- [macOS](#macos)
- [Linux](#linux)
- [Windows](#windows)
- [Verificação](#verificação)

---

## macOS

### 1. Homebrew

```bash
# Instalar Homebrew (se ainda não tiver)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Java 17 (para Android)

```bash
# Instalar JDK 17 (recomendado para Gradle/AGP modernos)
brew install --cask temurin@17

# Adicionar ao PATH (~/.zshrc ou ~/.bash_profile)
echo 'export JAVA_HOME=$(/usr/libexec/java_home -v 17)' >> ~/.zshrc
echo 'export PATH=$JAVA_HOME/bin:$PATH' >> ~/.zshrc

# Recarregar shell
source ~/.zshrc

# Verificar
java -version
```

Saída esperada:
```
openjdk version "17.0.x" 2024-xx-xx
```

### 3. Android Studio + SDK

```bash
# Instalar Android Studio
brew install --cask android-studio
```

**Configuração Inicial do Android Studio:**

1. Abra o Android Studio
2. Siga o assistente de setup inicial
3. Quando aparecer "SDK Components Setup", certifique-se de instalar:
   - ✅ Android SDK
   - ✅ Android SDK Platform
   - ✅ Android Virtual Device

**Instalar SDKs e Ferramentas:**

1. Abra Android Studio
2. Menu "Settings/Preferences" → "Appearance & Behavior" → "System Settings" → "Android SDK"
3. Na aba **"SDK Platforms"**, instale:
   - ✅ Android 14.0 (API Level 34) - ou a versão mais recente
   - ✅ Android 13.0 (API Level 33)

4. Na aba **"SDK Tools"**, instale:
   - ✅ Android SDK Build-Tools (latest)
   - ✅ Android SDK Command-line Tools (latest)
   - ✅ Android Emulator
   - ✅ Android SDK Platform-Tools
   - ✅ Google Play Services

**Configurar Variáveis de Ambiente:**

```bash
# Adicionar ao ~/.zshrc ou ~/.bash_profile
echo 'export ANDROID_HOME=$HOME/Library/Android/sdk' >> ~/.zshrc
echo 'export PATH=$ANDROID_HOME/emulator:$PATH' >> ~/.zshrc
echo 'export PATH=$ANDROID_HOME/platform-tools:$PATH' >> ~/.zshrc
echo 'export PATH=$ANDROID_HOME/cmdline-tools/latest/bin:$PATH' >> ~/.zshrc

# Recarregar shell
source ~/.zshrc

# Verificar
echo $ANDROID_HOME
```

**Testar CLI:**

```bash
# Listar pacotes disponíveis
sdkmanager --list | head -n 20

# Verificar ADB
adb version

# Listar dispositivos conectados
adb devices
```

### 4. Xcode (para iOS)

```bash
# Instalar via App Store
# Ou via linha de comando:
xcode-select --install
```

**Baixar Xcode Completo:**

1. Abra a App Store
2. Busque por "Xcode"
3. Clique em "Obter" (download grande, ~12-15 GB)
4. Aguarde instalação

**Configuração Inicial:**

```bash
# Aceitar licença
sudo xcodebuild -license accept

# Verificar instalação
xcodebuild -version
```

Saída esperada:
```
Xcode 15.x
Build version xxxxx
```

**Instalar Simuladores iOS:**

1. Abra o Xcode
2. Menu "Settings/Preferences" → "Platforms"
3. Clique no "+" e baixe simuladores iOS desejados (ex: iOS 17.0)

### 5. CocoaPods (para iOS)

```bash
# Instalar CocoaPods
sudo gem install cocoapods

# Verificar
pod --version
```

Saída esperada:
```
1.15.x
```

### 6. Ruby (para Fastlane)

macOS já vem com Ruby, mas é recomendado usar uma versão mais recente:

```bash
# Instalar rbenv (gerenciador de versões Ruby)
brew install rbenv ruby-build

# Adicionar ao shell
echo 'eval "$(rbenv init - zsh)"' >> ~/.zshrc
source ~/.zshrc

# Instalar Ruby 3.2
rbenv install 3.2.2
rbenv global 3.2.2

# Verificar
ruby -v
```

### 7. Bundler (para gerenciar gems)

```bash
gem install bundler

# Verificar
bundle -v
```

### 8. Node.js (para Capacitor)

```bash
# Instalar Node.js LTS
brew install node@20

# Verificar
node -v
npm -v
```

---

## Linux (Ubuntu/Debian)

### 1. Java 17

```bash
# Instalar OpenJDK 17
sudo apt update
sudo apt install openjdk-17-jdk -y

# Configurar JAVA_HOME
echo 'export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64' >> ~/.bashrc
echo 'export PATH=$JAVA_HOME/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Verificar
java -version
```

### 2. Android Studio + SDK

```bash
# Baixar Android Studio
wget https://redirector.gvt1.com/edgedl/android/studio/ide-zips/2023.1.1.28/android-studio-2023.1.1.28-linux.tar.gz

# Extrair
tar -xzf android-studio-*-linux.tar.gz -C ~/

# Executar
~/android-studio/bin/studio.sh
```

Siga os mesmos passos de configuração do macOS para instalar SDKs.

**Configurar Variáveis de Ambiente:**

```bash
echo 'export ANDROID_HOME=$HOME/Android/Sdk' >> ~/.bashrc
echo 'export PATH=$ANDROID_HOME/emulator:$PATH' >> ~/.bashrc
echo 'export PATH=$ANDROID_HOME/platform-tools:$PATH' >> ~/.bashrc
echo 'export PATH=$ANDROID_HOME/cmdline-tools/latest/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### 3. Ruby + Bundler

```bash
# Instalar Ruby
sudo apt install ruby-full -y

# Instalar Bundler
sudo gem install bundler
```

### 4. Node.js

```bash
# Instalar Node.js LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs -y

# Verificar
node -v
npm -v
```

---

## Windows

### 1. Java 17

1. Baixe o [Temurin JDK 17](https://adoptium.net/)
2. Execute o instalador
3. Durante instalação, marque "Set JAVA_HOME variable"

**Verificar:**
```cmd
java -version
```

### 2. Android Studio + SDK

1. Baixe [Android Studio](https://developer.android.com/studio)
2. Execute o instalador
3. Siga o assistente e instale os SDKs

**Configurar Variáveis de Ambiente:**

1. Botão direito em "Este Computador" → "Propriedades"
2. "Configurações avançadas do sistema"
3. "Variáveis de Ambiente"
4. Adicionar:
   - `ANDROID_HOME` = `C:\Users\SEU_USUARIO\AppData\Local\Android\Sdk`
   - Adicionar ao `Path`:
     - `%ANDROID_HOME%\platform-tools`
     - `%ANDROID_HOME%\emulator`

### 3. Ruby

1. Baixe [RubyInstaller](https://rubyinstaller.org/)
2. Execute o instalador (escolha versão with DevKit)
3. Instale Bundler:
```cmd
gem install bundler
```

### 4. Node.js

1. Baixe [Node.js LTS](https://nodejs.org/)
2. Execute o instalador

---

## Verificação

Execute este script para verificar todas as instalações:

```bash
#!/bin/bash
# save as check-env.sh

echo "========================================="
echo "Verificando Ambiente Mobile - AlcaHub"
echo "========================================="
echo ""

# Java
echo "📦 Java:"
java -version 2>&1 | head -n 1 || echo "❌ Java não encontrado"
echo ""

# Android
echo "🤖 Android:"
echo "ANDROID_HOME: $ANDROID_HOME"
sdkmanager --version 2>&1 | head -n 1 || echo "❌ SDK Manager não encontrado"
adb version 2>&1 | head -n 1 || echo "❌ ADB não encontrado"
echo ""

# iOS (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 iOS:"
    xcodebuild -version 2>&1 | head -n 1 || echo "❌ Xcode não encontrado"
    pod --version 2>&1 | head -n 1 || echo "❌ CocoaPods não encontrado"
    echo ""
fi

# Ruby
echo "💎 Ruby:"
ruby -v || echo "❌ Ruby não encontrado"
bundle -v || echo "❌ Bundler não encontrado"
echo ""

# Node.js
echo "📗 Node.js:"
node -v || echo "❌ Node.js não encontrado"
npm -v || echo "❌ npm não encontrado"
echo ""

echo "========================================="
echo "Verificação concluída!"
echo "========================================="
```

**Executar:**

```bash
chmod +x check-env.sh
./check-env.sh
```

### Saída Esperada (macOS):

```
=========================================
Verificando Ambiente Mobile - AlcaHub
=========================================

📦 Java:
openjdk version "17.0.9" 2023-10-17

🤖 Android:
ANDROID_HOME: /Users/usuario/Library/Android/sdk
9.0
Android Debug Bridge version 1.0.41

🍎 iOS:
Xcode 15.1
1.15.2

💎 Ruby:
ruby 3.2.2
Bundler version 2.4.22

📗 Node.js:
v20.10.0
10.2.3

=========================================
Verificação concluída!
=========================================
```

---

## Instalação Rápida - Script Automatizado (macOS)

Para instalar tudo automaticamente no macOS:

```bash
#!/bin/bash
# save as install-mobile-env.sh

set -e

echo "🚀 Instalando ambiente mobile AlcaHub..."

# Homebrew
if ! command -v brew &> /dev/null; then
    echo "📦 Instalando Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Java 17
echo "☕ Instalando Java 17..."
brew install --cask temurin@17

# Android Studio
echo "🤖 Instalando Android Studio..."
brew install --cask android-studio

# Xcode Command Line Tools
echo "🍎 Instalando Xcode Command Line Tools..."
xcode-select --install 2>/dev/null || true

# CocoaPods
echo "📦 Instalando CocoaPods..."
sudo gem install cocoapods

# Ruby (via rbenv)
echo "💎 Instalando Ruby..."
brew install rbenv ruby-build
rbenv install 3.2.2
rbenv global 3.2.2

# Bundler
gem install bundler

# Node.js
echo "📗 Instalando Node.js..."
brew install node@20

# Configurar variáveis de ambiente
echo "⚙️  Configurando variáveis de ambiente..."
cat >> ~/.zshrc << 'EOF'

# AlcaHub Mobile Environment
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$ANDROID_HOME/emulator:$PATH
export PATH=$ANDROID_HOME/platform-tools:$PATH
export PATH=$ANDROID_HOME/cmdline-tools/latest/bin:$PATH
eval "$(rbenv init - zsh)"
EOF

echo "✅ Instalação concluída!"
echo ""
echo "⚠️  IMPORTANTE:"
echo "1. Reinicie seu terminal ou execute: source ~/.zshrc"
echo "2. Abra o Android Studio e instale os SDKs necessários"
echo "3. Baixe o Xcode da App Store (se ainda não tiver)"
echo "4. Execute 'sudo xcodebuild -license accept' após instalar Xcode"
```

**Executar:**

```bash
chmod +x install-mobile-env.sh
./install-mobile-env.sh
```

---

## Próximos Passos

Após instalar todos os pré-requisitos:

1. **Configurar Android Studio:**
   - Abra e instale SDKs conforme descrito acima
   - Configure um AVD (emulador)

2. **Configurar Xcode (macOS):**
   - Aceite a licença: `sudo xcodebuild -license accept`
   - Baixe simuladores iOS

3. **Clonar e configurar projeto:**
   ```bash
   cd alca-hub/mobile
   make install
   make setup-ios
   make setup-android
   ```

4. **Verificar tudo:**
   ```bash
   make doctor
   ```

---

## Troubleshooting

### Java: "Command not found"

```bash
# Verifique se JAVA_HOME está configurado
echo $JAVA_HOME

# Configure manualmente
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
```

### Android: "SDK location not found"

```bash
# Verifique ANDROID_HOME
echo $ANDROID_HOME

# Configure manualmente
export ANDROID_HOME=$HOME/Library/Android/sdk
```

### CocoaPods: "Permission denied"

```bash
# Use gem user install
gem install cocoapods --user-install
```

### Xcode: "Command line tools not found"

```bash
sudo xcode-select --reset
xcode-select --install
```

---

## Recursos

- [Java/JDK Download](https://adoptium.net/)
- [Android Studio](https://developer.android.com/studio)
- [Xcode](https://developer.apple.com/xcode/)
- [CocoaPods](https://cocoapods.org/)
- [Node.js](https://nodejs.org/)
- [Ruby](https://www.ruby-lang.org/)

Voltar para [README Mobile](../../README.md)
