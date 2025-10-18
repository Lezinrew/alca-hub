# 📱 Guia Completo: Desenvolvimento iOS com Cordova/Capacitor

## ✅ **PASSO A PASSO PARA DESENVOLVER iOS**

### **1. Pré-requisitos (JÁ CONFIGURADOS)**
- ✅ Xcode Command Line Tools instalado
- ✅ CocoaPods instalado via Homebrew
- ✅ Projeto iOS criado (`frontend/ios/`)
- ✅ Plugins Cordova sincronizados
- ✅ Permissões configuradas no Info.plist

### **2. Estrutura do Projeto iOS**
```
frontend/ios/
├── App/
│   ├── App.xcodeproj          # Projeto Xcode
│   ├── App.xcworkspace        # Workspace (usar este)
│   ├── Podfile               # Dependências CocoaPods
│   └── App/
│       ├── Info.plist        # Permissões configuradas
│       └── public/           # Assets web (sincronizados)
```

### **3. Comandos Essenciais**

#### **Build e Sync:**
```bash
# Build do frontend
cd frontend && npm run build

# Sync com iOS
npx cap sync ios

# Instalar dependências iOS
cd ios/App && pod install
```

#### **Abrir no Xcode:**
```bash
# Abrir projeto iOS
npx cap open ios
```

#### **Build no Xcode:**
1. Abrir `App.xcworkspace` (NÃO o .xcodeproj)
2. Selecionar dispositivo/simulador
3. Cmd+B para build
4. Cmd+R para rodar

### **4. Tasks Configuradas no Cursor**

**Disponíveis via Ctrl/Cmd+Shift+P → "Tasks: Run Task":**
- `Capacitor: Sync iOS` - Sincroniza projeto
- `iOS: Pod Install` - Instala dependências
- `Capacitor: Open Xcode` - Abre no Xcode
- `Capacitor: Run iOS` - Roda no simulador

### **5. Plugins Cordova Configurados**
- ✅ **Câmera** (`cordova-plugin-camera`)
- ✅ **Geolocalização** (`cordova-plugin-geolocation`)
- ✅ **Permissões** configuradas no Info.plist

### **6. Permissões iOS (Info.plist)**
```xml
<key>NSCameraUsageDescription</key>
<string>Este app precisa acessar a câmera para tirar fotos</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>Este app precisa acessar a galeria para escolher imagens</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>Este app precisa acessar sua localização</string>
```

### **7. Fluxo de Desenvolvimento**

#### **Desenvolvimento Web:**
1. Editar código em `frontend/src/`
2. `npm run build` - Build do frontend
3. `npx cap sync ios` - Sync com iOS

#### **Teste iOS:**
1. `npx cap open ios` - Abrir no Xcode
2. Selecionar simulador iOS
3. Cmd+R - Rodar app
4. Testar plugins (câmera, GPS)

### **8. Troubleshooting**

#### **Erro: "xcodebuild requires Xcode"**
- Instalar Xcode completo (não só Command Line Tools)
- Configurar: `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`

#### **Erro: "CocoaPods not found"**
- `brew install cocoapods`
- `cd ios/App && pod install`

#### **Plugins não funcionam**
- Verificar permissões no Info.plist
- Re-sync: `npx cap sync ios`
- Re-install pods: `pod install`

### **9. Próximos Passos**

1. **Instalar Xcode completo** (se não tiver)
2. **Testar no simulador iOS**
3. **Configurar certificados** (para dispositivo físico)
4. **Adicionar mais plugins** conforme necessário

### **10. Status Atual**
- ✅ Projeto iOS criado
- ✅ Plugins Cordova configurados
- ✅ Permissões configuradas
- ✅ CocoaPods funcionando
- ⚠️ **Pendente:** Xcode completo para build final

## 🎯 **PRÓXIMO PASSO:**
Instalar Xcode completo e testar o app no simulador iOS!
