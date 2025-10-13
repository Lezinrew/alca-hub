#!/usr/bin/env node

/**
 * Script para executar todos os testes de botões da aplicação
 * Este script executa uma bateria completa de testes para verificar
 * se todos os botões da aplicação estão funcionando corretamente
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Iniciando Testes de Botões da Aplicação Alça Hub...\n');

// Configurações de teste
const testConfig = {
  timeout: 30000,
  verbose: true,
  coverage: true,
  watch: false
};

// Lista de arquivos de teste
const testFiles = [
  'src/tests/ButtonTests.jsx',
  'src/tests/ComponentButtonTests.jsx',
  'src/tests/FormButtonTests.jsx'
];

// Função para executar testes
function runTests() {
  try {
    console.log('📋 Executando testes de botões...\n');
    
    // Executar cada arquivo de teste
    testFiles.forEach((testFile, index) => {
      console.log(`\n🔍 Executando ${testFile}...`);
      
      try {
        const command = `npm test -- ${testFile} --verbose --coverage`;
        execSync(command, { 
          stdio: 'inherit',
          cwd: path.join(__dirname, '..')
        });
        
        console.log(`✅ ${testFile} - PASSOU`);
      } catch (error) {
        console.log(`❌ ${testFile} - FALHOU`);
        console.error(error.message);
      }
    });
    
    console.log('\n🎉 Todos os testes de botões foram executados!');
    
  } catch (error) {
    console.error('❌ Erro ao executar testes:', error.message);
    process.exit(1);
  }
}

// Função para gerar relatório
function generateReport() {
  console.log('\n📊 Gerando relatório de testes...');
  
  try {
    const command = 'npm test -- --coverage --coverageReporters=text --coverageReporters=html';
    execSync(command, { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    
    console.log('📈 Relatório de cobertura gerado em coverage/');
  } catch (error) {
    console.error('❌ Erro ao gerar relatório:', error.message);
  }
}

// Executar testes
runTests();
generateReport();

console.log('\n✨ Testes de botões concluídos!');
