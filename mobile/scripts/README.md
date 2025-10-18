# Scripts de Automação - AlcaHub Mobile

Scripts úteis para configuração e verificação do ambiente de desenvolvimento mobile.

## Scripts Disponíveis

### check-env.sh

Verifica se todas as ferramentas necessárias estão instaladas e configuradas corretamente.

**Uso:**

```bash
# Diretamente
./scripts/check-env.sh

# Ou via Makefile
make doctor
```

**O que verifica:**

- ☕ Java (JDK 17+)
- 🤖 Android SDK e ferramentas
- 🍎 Xcode e CocoaPods (macOS)
- 💎 Ruby, Bundler e Fastlane
- 📗 Node.js e npm
- ⚡ Capacitor CLI
- 📱 Emuladores/Simuladores configurados

**Saída de exemplo:**

```
=========================================
Verificando Ambiente Mobile - AlcaHub
=========================================

📦 Java:
✓ Java: openjdk version "17.0.9" 2023-10-17

🤖 Android:
✓ ANDROID_HOME: /Users/usuario/Library/Android/sdk
✓ SDK Manager: 9.0
✓ ADB: Android Debug Bridge version 1.0.41
✓ Gradle: Gradle 8.0

🍎 iOS:
✓ Xcode: Xcode 15.1
✓ CocoaPods: 1.15.2

💎 Ruby:
✓ Ruby: ruby 3.2.2
✓ Bundler: Bundler version 2.4.22

📗 Node.js:
✓ Node.js: v20.10.0
✓ npm: 10.2.3

🚀 Fastlane:
✓ Fastlane: fastlane 2.217.0

=========================================
Resumo:
=========================================

✓ Ambiente completamente configurado!

Próximos passos:
  cd mobile
  make install
  make setup-ios
  make setup-android
```

---

### install-macos.sh

Instala automaticamente todas as ferramentas necessárias no macOS.

**Uso:**

```bash
# Diretamente
./scripts/install-macos.sh

# Ou via Makefile
make install-env-macos
```

**O que instala:**

1. **Homebrew** - Gerenciador de pacotes
2. **Java 17** (Temurin JDK)
3. **Android Studio**
4. **Xcode Command Line Tools**
5. **CocoaPods**
6. **Ruby 3.2** (via rbenv)
7. **Bundler**
8. **Node.js 20 LTS**
9. **Git**

**Configura automaticamente:**

- Variáveis de ambiente (`JAVA_HOME`, `ANDROID_HOME`)
- PATH para todas as ferramentas
- rbenv para gerenciamento de Ruby
- Aliases úteis

**Após execução:**

1. Reinicie o terminal ou execute: `source ~/.zshrc`
2. Abra Android Studio e complete o setup
3. Baixe Xcode da App Store
4. Execute `make doctor` para verificar

---

## Workflow Recomendado

### Setup Inicial (Primeira vez)

```bash
# 1. Instalar ambiente (macOS)
cd mobile
make install-env-macos

# 2. Reiniciar terminal
# Feche e abra um novo terminal

# 3. Verificar instalação
make doctor

# 4. Completar setup manual
# - Abrir Android Studio e instalar SDKs
# - Baixar Xcode da App Store

# 5. Instalar dependências do projeto
make install

# 6. Setup iOS e Android
make setup-ios
make setup-android

# 7. Verificar novamente
make doctor
```

### Verificação Regular

Execute periodicamente para garantir que tudo está OK:

```bash
cd mobile
make doctor
```

---

## Solução de Problemas

### Script não executa

```bash
# Tornar executável
chmod +x scripts/*.sh
```

### Erro: "command not found"

```bash
# Recarregar variáveis de ambiente
source ~/.zshrc

# Verificar PATH
echo $PATH
```

### Erro: "ANDROID_HOME not set"

```bash
# Verificar instalação do Android Studio
ls ~/Library/Android/sdk

# Adicionar manualmente ao ~/.zshrc
echo 'export ANDROID_HOME=$HOME/Library/Android/sdk' >> ~/.zshrc
source ~/.zshrc
```

### Erro: "Java not found" após instalação

```bash
# Verificar Java instalado
/usr/libexec/java_home -V

# Configurar JAVA_HOME para versão 17
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
```

---

## Personalizando Scripts

### Adicionar verificações customizadas

Edite `check-env.sh` e adicione novas verificações:

```bash
# Adicionar no final do arquivo, antes do resumo

echo -e "${BLUE}🔧 Ferramentas Customizadas:${NC}"
check_command minha_ferramenta "Minha Ferramenta" "minha_ferramenta --version"
echo ""
```

### Adicionar instalações customizadas

Edite `install-macos.sh` e adicione novos comandos de instalação:

```bash
# Adicionar antes do resumo final

echo -e "${BLUE}🔧 Instalando ferramenta customizada...${NC}"
brew install minha-ferramenta
echo ""
```

---

## Scripts Futuros

Planejados mas ainda não implementados:

- `install-linux.sh` - Setup automático para Linux
- `install-windows.ps1` - Setup automático para Windows
- `update-env.sh` - Atualizar todas as ferramentas
- `cleanup.sh` - Limpar caches e builds antigos
- `backup-config.sh` - Backup de configurações
- `restore-config.sh` - Restaurar configurações

---

## Contribuindo

Para adicionar novos scripts:

1. Crie o script em `mobile/scripts/`
2. Torne executável: `chmod +x scripts/seu-script.sh`
3. Adicione ao Makefile se apropriado
4. Documente aqui no README

---

## Recursos

- [Homebrew](https://brew.sh/)
- [Android Studio](https://developer.android.com/studio)
- [Xcode](https://developer.apple.com/xcode/)
- [rbenv](https://github.com/rbenv/rbenv)
- [Temurin JDK](https://adoptium.net/)

Voltar para [README Mobile](../README.md)
