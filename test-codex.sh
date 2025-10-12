#!/bin/bash

# Script para testar se o Codex está funcionando após correção de quota

echo "🧪 Testando Codex Agent..."
echo "=========================="

# Verificar se o Cursor está rodando
if pgrep -f "Cursor" > /dev/null; then
    echo "✅ Cursor está rodando"
else
    echo "❌ Cursor não está rodando - inicie o Cursor primeiro"
    exit 1
fi

# Verificar configuração do Codex
if [ -f ~/.codex/config.toml ]; then
    echo "✅ Configuração do Codex encontrada"
    echo "📋 Configuração atual:"
    cat ~/.codex/config.toml
else
    echo "❌ Configuração do Codex não encontrada"
fi

# Verificar se há arquivos de projeto
if [ -d "/Users/lezinrew/Projetos/alca-hub" ]; then
    echo "✅ Projeto Alca Hub encontrado"
    echo "📁 Diretório: /Users/lezinrew/Projetos/alca-hub"
else
    echo "❌ Projeto não encontrado"
fi

echo ""
echo "🎯 Próximos passos:"
echo "1. Abra o Cursor"
echo "2. Abra o projeto Alca Hub"
echo "3. Tente usar o Codex com um prompt simples"
echo "4. Verifique se não há mais erro de quota"
echo ""
echo "💡 Dicas:"
echo "- Use prompts mais específicos"
echo "- Evite contextos muito longos"
echo "- Monitore o uso no painel OpenAI"
