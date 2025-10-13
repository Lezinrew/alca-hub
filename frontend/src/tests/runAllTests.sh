#!/bin/bash

echo "🧪 Executando Todos os Testes de Botões da Aplicação Alça Hub..."
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para executar teste
run_test() {
    local test_file=$1
    local test_name=$2
    
    echo -e "${BLUE}🔍 Executando: $test_name${NC}"
    
    if npm test -- --run "$test_file" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $test_name - PASSOU${NC}"
        return 0
    else
        echo -e "${RED}❌ $test_name - FALHOU${NC}"
        return 1
    fi
}

# Contadores
total_tests=0
passed_tests=0
failed_tests=0

echo -e "${YELLOW}📋 Lista de Testes Disponíveis:${NC}"
echo ""

# Teste 1: Testes Simples
total_tests=$((total_tests + 1))
if run_test "src/tests/SimpleButtonTests.test.jsx" "Testes Simples de Botões"; then
    passed_tests=$((passed_tests + 1))
else
    failed_tests=$((failed_tests + 1))
fi

echo ""

# Teste 2: Testes de Formulário (se disponível)
if [ -f "src/tests/FormButtonTests.test.jsx" ]; then
    total_tests=$((total_tests + 1))
    if run_test "src/tests/FormButtonTests.test.jsx" "Testes de Botões de Formulário"; then
        passed_tests=$((passed_tests + 1))
    else
        failed_tests=$((failed_tests + 1))
    fi
    echo ""
fi

# Teste 3: Testes Simples de Componentes (se disponível)
if [ -f "src/tests/SimpleComponentTests.test.jsx" ]; then
    total_tests=$((total_tests + 1))
    if run_test "src/tests/SimpleComponentTests.test.jsx" "Testes Simples de Componentes"; then
        passed_tests=$((passed_tests + 1))
    else
        failed_tests=$((failed_tests + 1))
    fi
    echo ""
fi

# Teste 4: Testes de Componentes (se disponível)
if [ -f "src/tests/ComponentButtonTests.test.jsx" ]; then
    total_tests=$((total_tests + 1))
    if run_test "src/tests/ComponentButtonTests.test.jsx" "Testes de Botões de Componentes"; then
        passed_tests=$((passed_tests + 1))
    else
        failed_tests=$((failed_tests + 1))
    fi
    echo ""
fi

# Teste 4: Testes Gerais (se disponível)
if [ -f "src/tests/ButtonTests.test.jsx" ]; then
    total_tests=$((total_tests + 1))
    if run_test "src/tests/ButtonTests.test.jsx" "Testes Gerais de Botões"; then
        passed_tests=$((passed_tests + 1))
    else
        failed_tests=$((failed_tests + 1))
    fi
    echo ""
fi

# Resumo
echo -e "${YELLOW}📊 RESUMO DOS TESTES:${NC}"
echo -e "Total de Suítes: $total_tests"
echo -e "${GREEN}✅ Passaram: $passed_tests${NC}"
echo -e "${RED}❌ Falharam: $failed_tests${NC}"

if [ $failed_tests -eq 0 ]; then
    echo -e "${GREEN}🎉 Todos os testes passaram!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Alguns testes falharam.${NC}"
    exit 1
fi
