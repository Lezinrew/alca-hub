# 🚀 WORKFLOW: Xcode + Cursor + Claude CLI

## 📱 **COMO CONTINUAR DESENVOLVIMENTO iOS**

### **1. INSTALAR XCODE COMPLETO**
```bash
# Baixar Xcode da App Store (gratuito)
# Ou via Apple Developer (se tiver conta)
# Tamanho: ~15GB
```

### **2. CONFIGURAR XCODE**
```bash
# Após instalar Xcode
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
xcodebuild -version
```

### **3. ABRIR PROJETO iOS**
```bash
cd /Users/lezinrew/Projetos/alca-hub/frontend
npx cap open ios
```

### **4. NO XCODE:**
1. **Abrir workspace:** `App.xcworkspace` (NÃO o .xcodeproj)
2. **Selecionar simulador:** iPhone 15 Pro (ou outro)
3. **Build:** Cmd+B
4. **Run:** Cmd+R

---

## 🔄 **FLUXO DE DESENVOLVIMENTO**

### **A. Desenvolvimento Web (Cursor)**
```bash
# 1. Editar código em frontend/src/
# 2. Build
npm run build

# 3. Sync com iOS
npx cap sync ios
cd ios/App && pod install
```

### **B. Teste iOS (Xcode)**
```bash
# 1. Abrir no Xcode
npx cap open ios

# 2. No Xcode:
# - Selecionar simulador
# - Cmd+B (build)
# - Cmd+R (run)
# - Testar plugins (câmera, GPS)
```

### **C. Correções (Claude CLI)**
```bash
# 1. Identificar problema no Xcode
# 2. Descrever erro para Claude CLI
# 3. Aplicar correção sugerida
# 4. Testar novamente
```

---

## 🛠️ **TASKS DO CURSOR PARA iOS**

### **Disponíveis via Ctrl/Cmd+Shift+P → "Tasks: Run Task":**

#### **Sync iOS:**
- `Capacitor: Sync iOS` - Sincroniza projeto
- `iOS: Pod Install` - Instala dependências

#### **Open/Run:**
- `Capacitor: Open Xcode` - Abre no Xcode
- `Capacitor: Run iOS` - Roda no simulador

#### **Build:**
- `Capacitor: Sync Android` - Para comparar
- `Android: Build Debug APK` - Para testar Android

---

## 🔧 **USANDO CLAUDE CLI PARA CORREÇÕES**

### **1. Instalar Claude CLI:**
```bash
# Instalar Claude CLI
npm install -g @anthropic-ai/claude-cli

# Ou via Homebrew
brew install claude-cli
```

### **2. Configurar Claude CLI:**
```bash
# Configurar API key
claude config set api-key YOUR_API_KEY

# Testar conexão
claude --version
```

### **3. Usar para correções:**
```bash
# Descrever problema
claude "Tenho erro de build no Xcode: [descrever erro]"

# Pedir correção específica
claude "Como corrigir erro de permissão iOS no Info.plist?"

# Aplicar correção
claude "Mostre código para adicionar permissão de câmera no iOS"
```

---

## 📋 **WORKFLOW COMPLETO**

### **Desenvolvimento Diário:**

#### **1. Manhã - Setup:**
```bash
# Abrir Cursor
cd /Users/lezinrew/Projetos/alca-hub
cursor .

# Verificar status
git status
```

#### **2. Desenvolvimento:**
```bash
# Editar código em frontend/src/
# Build automático
npm run build

# Sync iOS
npx cap sync ios
cd ios/App && pod install
```

#### **3. Teste iOS:**
```bash
# Abrir Xcode
npx cap open ios

# No Xcode: Cmd+B, Cmd+R
# Testar funcionalidades
```

#### **4. Correções:**
```bash
# Se houver erro, usar Claude CLI
claude "Erro no Xcode: [descrever]"

# Aplicar correção
# Testar novamente
```

#### **5. Commit:**
```bash
git add .
git commit -m "feat: implementar funcionalidade X"
git push
```

---

## 🐛 **TROUBLESHOOTING COM CLAUDE CLI**

### **Problemas Comuns:**

#### **1. Erro de Build iOS:**
```bash
claude "Erro de build iOS: 'Capacitor' module not found"
# Claude vai sugerir: pod install, limpar cache, etc.
```

#### **2. Plugin não funciona:**
```bash
claude "Plugin cordova-plugin-camera não funciona no iOS"
# Claude vai verificar permissões, configurações, etc.
```

#### **3. Simulador não abre:**
```bash
claude "Simulador iOS não abre no Xcode"
# Claude vai sugerir: resetar simulador, reinstalar, etc.
```

#### **4. Permissões iOS:**
```bash
claude "Como adicionar permissão de câmera no iOS Info.plist?"
# Claude vai mostrar código exato
```

---

## 🎯 **PRÓXIMOS PASSOS**

### **Imediato:**
1. **Instalar Xcode completo**
2. **Configurar Claude CLI**
3. **Testar build iOS**
4. **Validar plugins**

### **Desenvolvimento:**
1. **Integrar componentes** no app principal
2. **Testar plugins** no simulador
3. **Otimizar performance** iOS
4. **Configurar certificados** para dispositivo físico

### **Produção:**
1. **Configurar App Store** Connect
2. **Gerar certificados** de distribuição
3. **Upload para TestFlight**
4. **Teste beta** com usuários

---

## 📊 **STATUS FINAL**

| Ferramenta | Status | Uso |
|------------|--------|-----|
| **Xcode** | ⏳ Pendente | Build/Teste iOS |
| **Cursor** | ✅ 100% | Desenvolvimento |
| **Claude CLI** | ⏳ Pendente | Correções |
| **Plugins** | ✅ 100% | Câmera+GPS |

## 🎉 **AMBIENTE PRONTO PARA DESENVOLVIMENTO iOS!**

Com Xcode + Cursor + Claude CLI, você terá:
- ✅ Desenvolvimento web no Cursor
- ✅ Build/teste iOS no Xcode  
- ✅ Correções automáticas com Claude CLI
- ✅ Workflow completo e eficiente
