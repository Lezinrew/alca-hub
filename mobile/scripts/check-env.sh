#!/bin/bash
# Script para verificar ambiente de desenvolvimento mobile

set -e

echo "========================================="
echo "Verificando Ambiente Mobile - AlcaHub"
echo "========================================="
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para verificar comando
check_command() {
    local cmd=$1
    local name=$2
    local version_cmd=$3

    if command -v $cmd &> /dev/null; then
        local version=$($version_cmd 2>&1 | head -n 1)
        echo -e "${GREEN}✓${NC} $name: $version"
        return 0
    else
        echo -e "${RED}✗${NC} $name: não encontrado"
        return 1
    fi
}

# Java
echo -e "${BLUE}📦 Java:${NC}"
check_command java "Java" "java -version"
echo ""

# Android
echo -e "${BLUE}🤖 Android:${NC}"
if [ -n "$ANDROID_HOME" ]; then
    echo -e "${GREEN}✓${NC} ANDROID_HOME: $ANDROID_HOME"
else
    echo -e "${RED}✗${NC} ANDROID_HOME: não configurado"
fi
check_command sdkmanager "SDK Manager" "sdkmanager --version"
check_command adb "ADB" "adb version"
check_command gradle "Gradle" "gradle --version"
echo ""

# iOS (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo -e "${BLUE}🍎 iOS:${NC}"
    check_command xcodebuild "Xcode" "xcodebuild -version"
    check_command pod "CocoaPods" "pod --version"
    echo ""
fi

# Ruby
echo -e "${BLUE}💎 Ruby:${NC}"
check_command ruby "Ruby" "ruby -v"
check_command bundle "Bundler" "bundle -v"
check_command gem "RubyGems" "gem -v"
echo ""

# Node.js
echo -e "${BLUE}📗 Node.js:${NC}"
check_command node "Node.js" "node -v"
check_command npm "npm" "npm -v"
check_command npx "npx" "npx -v"
echo ""

# Fastlane (check if installed)
echo -e "${BLUE}🚀 Fastlane:${NC}"
if bundle show fastlane &> /dev/null; then
    local fl_version=$(bundle exec fastlane --version | head -n 1)
    echo -e "${GREEN}✓${NC} Fastlane: $fl_version"
else
    echo -e "${YELLOW}⚠${NC} Fastlane: não instalado (execute 'bundle install')"
fi
echo ""

# Capacitor CLI
echo -e "${BLUE}⚡ Capacitor:${NC}"
if npm list -g @capacitor/cli &> /dev/null; then
    check_command cap "Capacitor CLI" "npx cap --version"
else
    echo -e "${YELLOW}⚠${NC} Capacitor CLI: não instalado globalmente"
fi
echo ""

# Verificar Android SDK components
if [ -n "$ANDROID_HOME" ]; then
    echo -e "${BLUE}🔧 Android SDK Components:${NC}"

    if [ -d "$ANDROID_HOME/platforms/android-34" ]; then
        echo -e "${GREEN}✓${NC} Android SDK Platform 34 (Android 14)"
    else
        echo -e "${YELLOW}⚠${NC} Android SDK Platform 34 não encontrado"
    fi

    if [ -d "$ANDROID_HOME/build-tools" ]; then
        local build_tools=$(ls $ANDROID_HOME/build-tools | tail -n 1)
        echo -e "${GREEN}✓${NC} Build Tools: $build_tools"
    else
        echo -e "${RED}✗${NC} Build Tools: não encontrado"
    fi

    if [ -d "$ANDROID_HOME/cmdline-tools" ]; then
        echo -e "${GREEN}✓${NC} Command-line Tools"
    else
        echo -e "${YELLOW}⚠${NC} Command-line Tools: não encontrado"
    fi
    echo ""
fi

# Verificar emuladores/simuladores
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo -e "${BLUE}📱 iOS Simulators:${NC}"
    local sim_count=$(xcrun simctl list devices available | grep -c "iPhone" || true)
    if [ $sim_count -gt 0 ]; then
        echo -e "${GREEN}✓${NC} $sim_count simuladores iOS disponíveis"
    else
        echo -e "${YELLOW}⚠${NC} Nenhum simulador iOS encontrado"
    fi
    echo ""
fi

echo -e "${BLUE}📱 Android Emulators:${NC}"
if command -v emulator &> /dev/null; then
    local avd_count=$(emulator -list-avds 2>/dev/null | wc -l | xargs)
    if [ "$avd_count" -gt 0 ]; then
        echo -e "${GREEN}✓${NC} $avd_count emuladores Android disponíveis"
        echo "Emuladores:"
        emulator -list-avds 2>/dev/null | sed 's/^/  - /'
    else
        echo -e "${YELLOW}⚠${NC} Nenhum emulador Android configurado"
    fi
else
    echo -e "${RED}✗${NC} Emulator command não encontrado"
fi
echo ""

# Resumo
echo "========================================="
echo -e "${BLUE}Resumo:${NC}"
echo "========================================="
echo ""

errors=0
warnings=0

# Verificações críticas
if ! command -v java &> /dev/null; then
    echo -e "${RED}✗${NC} Java não instalado"
    errors=$((errors + 1))
fi

if [[ "$OSTYPE" == "darwin"* ]] && ! command -v xcodebuild &> /dev/null; then
    echo -e "${RED}✗${NC} Xcode não instalado (necessário para iOS)"
    errors=$((errors + 1))
fi

if [ -z "$ANDROID_HOME" ]; then
    echo -e "${RED}✗${NC} ANDROID_HOME não configurado"
    errors=$((errors + 1))
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}✗${NC} Node.js não instalado"
    errors=$((errors + 1))
fi

if ! command -v ruby &> /dev/null; then
    echo -e "${YELLOW}⚠${NC} Ruby não instalado"
    warnings=$((warnings + 1))
fi

if [ $errors -eq 0 ] && [ $warnings -eq 0 ]; then
    echo -e "${GREEN}✓ Ambiente completamente configurado!${NC}"
    echo ""
    echo "Próximos passos:"
    echo "  cd mobile"
    echo "  make install"
    echo "  make setup-ios"
    echo "  make setup-android"
elif [ $errors -eq 0 ]; then
    echo -e "${YELLOW}⚠ Ambiente configurado com avisos${NC}"
    echo ""
    echo "Alguns componentes opcionais estão faltando."
    echo "Consulte: mobile/docs/mobile/prerequisites.md"
else
    echo -e "${RED}✗ Ambiente incompleto${NC}"
    echo ""
    echo "Erros críticos encontrados: $errors"
    echo "Avisos: $warnings"
    echo ""
    echo "Consulte o guia de instalação:"
    echo "  mobile/docs/mobile/prerequisites.md"
    exit 1
fi

echo ""
echo "========================================="
