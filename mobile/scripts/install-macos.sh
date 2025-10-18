#!/bin/bash
# Script de instalação automática do ambiente mobile para macOS

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}AlcaHub Mobile - Setup macOS${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Verificar se é macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}✗ Este script é apenas para macOS${NC}"
    exit 1
fi

# Função para verificar se comando existe
command_exists() {
    command -v "$1" &> /dev/null
}

# 1. Homebrew
echo -e "${BLUE}📦 Verificando Homebrew...${NC}"
if command_exists brew; then
    echo -e "${GREEN}✓ Homebrew já instalado${NC}"
else
    echo -e "${YELLOW}⚠ Instalando Homebrew...${NC}"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

    # Configurar PATH do Homebrew (para Apple Silicon)
    if [[ $(uname -m) == "arm64" ]]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
fi
echo ""

# 2. Java 17
echo -e "${BLUE}☕ Verificando Java 17...${NC}"
if command_exists java && java -version 2>&1 | grep -q "17"; then
    echo -e "${GREEN}✓ Java 17 já instalado${NC}"
else
    echo -e "${YELLOW}⚠ Instalando Java 17 (Temurin)...${NC}"
    brew install --cask temurin@17

    # Configurar JAVA_HOME
    if ! grep -q "JAVA_HOME" ~/.zshrc; then
        echo '' >> ~/.zshrc
        echo '# Java 17' >> ~/.zshrc
        echo 'export JAVA_HOME=$(/usr/libexec/java_home -v 17)' >> ~/.zshrc
        echo 'export PATH=$JAVA_HOME/bin:$PATH' >> ~/.zshrc
    fi
fi
echo ""

# 3. Android Studio
echo -e "${BLUE}🤖 Verificando Android Studio...${NC}"
if [ -d "/Applications/Android Studio.app" ]; then
    echo -e "${GREEN}✓ Android Studio já instalado${NC}"
else
    echo -e "${YELLOW}⚠ Instalando Android Studio...${NC}"
    brew install --cask android-studio
    echo -e "${YELLOW}⚠ IMPORTANTE: Abra o Android Studio e complete o setup inicial${NC}"
fi

# Configurar ANDROID_HOME
if [ -d "$HOME/Library/Android/sdk" ]; then
    if ! grep -q "ANDROID_HOME" ~/.zshrc; then
        echo '' >> ~/.zshrc
        echo '# Android SDK' >> ~/.zshrc
        echo 'export ANDROID_HOME=$HOME/Library/Android/sdk' >> ~/.zshrc
        echo 'export PATH=$ANDROID_HOME/emulator:$PATH' >> ~/.zshrc
        echo 'export PATH=$ANDROID_HOME/platform-tools:$PATH' >> ~/.zshrc
        echo 'export PATH=$ANDROID_HOME/cmdline-tools/latest/bin:$PATH' >> ~/.zshrc
    fi
    echo -e "${GREEN}✓ ANDROID_HOME configurado${NC}"
else
    echo -e "${YELLOW}⚠ Android SDK não encontrado. Configure após abrir Android Studio${NC}"
fi
echo ""

# 4. Xcode
echo -e "${BLUE}🍎 Verificando Xcode...${NC}"
if command_exists xcodebuild; then
    echo -e "${GREEN}✓ Xcode já instalado${NC}"

    # Aceitar licença
    if ! xcodebuild -license check &> /dev/null; then
        echo -e "${YELLOW}⚠ Aceitando licença do Xcode...${NC}"
        sudo xcodebuild -license accept
    fi
else
    echo -e "${YELLOW}⚠ Instalando Xcode Command Line Tools...${NC}"
    xcode-select --install 2>/dev/null || true
    echo -e "${YELLOW}⚠ IMPORTANTE: Baixe o Xcode completo da App Store para desenvolvimento iOS${NC}"
fi
echo ""

# 5. CocoaPods
echo -e "${BLUE}📦 Verificando CocoaPods...${NC}"
if command_exists pod; then
    echo -e "${GREEN}✓ CocoaPods já instalado${NC}"
else
    echo -e "${YELLOW}⚠ Instalando CocoaPods...${NC}"
    sudo gem install cocoapods
fi
echo ""

# 6. Ruby (via rbenv)
echo -e "${BLUE}💎 Verificando Ruby...${NC}"
if command_exists rbenv; then
    echo -e "${GREEN}✓ rbenv já instalado${NC}"
else
    echo -e "${YELLOW}⚠ Instalando rbenv...${NC}"
    brew install rbenv ruby-build

    # Configurar rbenv
    if ! grep -q "rbenv init" ~/.zshrc; then
        echo '' >> ~/.zshrc
        echo '# rbenv' >> ~/.zshrc
        echo 'eval "$(rbenv init - zsh)"' >> ~/.zshrc
    fi

    # Instalar Ruby 3.2
    eval "$(rbenv init - zsh)"
    echo -e "${YELLOW}⚠ Instalando Ruby 3.2.2...${NC}"
    rbenv install 3.2.2
    rbenv global 3.2.2
fi
echo ""

# 7. Bundler
echo -e "${BLUE}💎 Verificando Bundler...${NC}"
if command_exists bundle; then
    echo -e "${GREEN}✓ Bundler já instalado${NC}"
else
    echo -e "${YELLOW}⚠ Instalando Bundler...${NC}"
    gem install bundler
fi
echo ""

# 8. Node.js
echo -e "${BLUE}📗 Verificando Node.js...${NC}"
if command_exists node; then
    echo -e "${GREEN}✓ Node.js já instalado: $(node -v)${NC}"
else
    echo -e "${YELLOW}⚠ Instalando Node.js 20 LTS...${NC}"
    brew install node@20

    # Adicionar ao PATH
    if ! grep -q "node@20" ~/.zshrc; then
        echo '' >> ~/.zshrc
        echo '# Node.js 20' >> ~/.zshrc
        echo 'export PATH="/opt/homebrew/opt/node@20/bin:$PATH"' >> ~/.zshrc
    fi
fi
echo ""

# 9. Git (geralmente já vem no macOS)
echo -e "${BLUE}📚 Verificando Git...${NC}"
if command_exists git; then
    echo -e "${GREEN}✓ Git já instalado: $(git --version)${NC}"
else
    echo -e "${YELLOW}⚠ Instalando Git...${NC}"
    brew install git
fi
echo ""

# Resumo
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}Instalação Concluída!${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

echo -e "${GREEN}✓ Ferramentas instaladas com sucesso${NC}"
echo ""

echo -e "${YELLOW}⚠ PRÓXIMOS PASSOS IMPORTANTES:${NC}"
echo ""
echo "1. ${YELLOW}Reinicie seu terminal${NC} ou execute:"
echo "   ${BLUE}source ~/.zshrc${NC}"
echo ""
echo "2. ${YELLOW}Abra o Android Studio${NC} e:"
echo "   - Complete o setup inicial"
echo "   - Instale o Android SDK Platform 34"
echo "   - Instale Android SDK Build-Tools"
echo "   - Instale Command-line Tools"
echo "   - Configure um AVD (emulador)"
echo ""
echo "3. ${YELLOW}Baixe o Xcode da App Store${NC} (se ainda não tiver)"
echo "   - ~12-15 GB de download"
echo "   - Necessário para desenvolvimento iOS"
echo ""
echo "4. ${YELLOW}Verifique a instalação:${NC}"
echo "   ${BLUE}cd mobile${NC}"
echo "   ${BLUE}./scripts/check-env.sh${NC}"
echo ""
echo "5. ${YELLOW}Configure o projeto:${NC}"
echo "   ${BLUE}cd mobile${NC}"
echo "   ${BLUE}make install${NC}"
echo "   ${BLUE}make setup-ios${NC}"
echo "   ${BLUE}make setup-android${NC}"
echo ""

echo -e "${BLUE}=========================================${NC}"
echo -e "${GREEN}Ambiente básico configurado!${NC}"
echo -e "${BLUE}=========================================${NC}"
