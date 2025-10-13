#!/bin/bash

# Script para gerar APK do Alça Hub
echo "🚀 Gerando APK do Alça Hub..."

# Configurar Java 21
export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH

# Verificar Java
echo "☕ Java version:"
java -version

# Navegar para o diretório android
cd frontend/android

# Limpar build anterior
echo "🧹 Limpando build anterior..."
./gradlew clean

# Gerar APK debug
echo "🔨 Gerando APK debug..."
./gradlew assembleDebug

# Verificar se o APK foi gerado
if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
    echo "✅ APK gerado com sucesso!"
    echo "📱 Localização: frontend/android/app/build/outputs/apk/debug/app-debug.apk"
    echo "📏 Tamanho: $(du -h app/build/outputs/apk/debug/app-debug.apk | cut -f1)"
else
    echo "❌ Erro ao gerar APK"
    exit 1
fi
