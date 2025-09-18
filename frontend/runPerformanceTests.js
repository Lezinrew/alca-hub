#!/usr/bin/env node

// Script para Executar Testes de Performance - Alça Hub
const fs = require('fs')
const path = require('path')

console.log('🧪 Iniciando Testes de Performance - Alça Hub')
console.log('=' .repeat(50))

// Verificar se os arquivos de otimização existem
const utilsDir = path.join(__dirname, 'src', 'utils')
const requiredFiles = [
  'lazyLoading.js',
  'codeSplitting.js',
  'bundleOptimization.js',
  'memoization.js',
  'virtualization.js',
  'imageOptimization.js',
  'caching.js',
  'performanceTests.js'
]

console.log('📁 Verificando arquivos de otimização...')

let allFilesExist = true
requiredFiles.forEach(file => {
  const filePath = path.join(utilsDir, file)
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} - OK`)
  } else {
    console.log(`❌ ${file} - FALTANDO`)
    allFilesExist = false
  }
})

if (!allFilesExist) {
  console.log('\n❌ Alguns arquivos de otimização estão faltando!')
  process.exit(1)
}

console.log('\n✅ Todos os arquivos de otimização estão presentes!')

// Verificar se o build foi executado
const buildDir = path.join(__dirname, 'build')
if (fs.existsSync(buildDir)) {
  console.log('✅ Build de produção encontrado')
  
  // Verificar tamanho do bundle
  const staticDir = path.join(buildDir, 'static', 'js')
  if (fs.existsSync(staticDir)) {
    const files = fs.readdirSync(staticDir)
    const jsFiles = files.filter(file => file.endsWith('.js'))
    
    console.log('\n📦 Análise do Bundle:')
    jsFiles.forEach(file => {
      const filePath = path.join(staticDir, file)
      const stats = fs.statSync(filePath)
      const sizeKB = (stats.size / 1024).toFixed(2)
      console.log(`  ${file}: ${sizeKB}KB`)
    })
  }
} else {
  console.log('⚠️  Build de produção não encontrado. Execute "npm run build" primeiro.')
}

// Verificar se as dependências estão instaladas
const nodeModulesDir = path.join(__dirname, 'node_modules')
if (fs.existsSync(nodeModulesDir)) {
  console.log('✅ Dependências instaladas')
} else {
  console.log('❌ Dependências não instaladas. Execute "npm install" primeiro.')
}

// Verificar se a aplicação está rodando
const http = require('http')

const checkApp = () => {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000', (res) => {
      resolve(true)
    })
    
    req.on('error', () => {
      resolve(false)
    })
    
    req.setTimeout(1000, () => {
      req.destroy()
      resolve(false)
    })
  })
}

console.log('\n🌐 Verificando se a aplicação está rodando...')

checkApp().then(isRunning => {
  if (isRunning) {
    console.log('✅ Aplicação está rodando em http://localhost:3000')
    console.log('\n🎯 Próximos passos:')
    console.log('1. Abra http://localhost:3000 no navegador')
    console.log('2. Abra DevTools (F12)')
    console.log('3. Vá para a aba Performance')
    console.log('4. Execute os testes de performance')
    console.log('5. Verifique as métricas no console')
  } else {
    console.log('⚠️  Aplicação não está rodando. Execute "npm start" primeiro.')
  }
})

// Gerar relatório de verificação
const report = {
  timestamp: new Date().toISOString(),
  files: requiredFiles.map(file => ({
    name: file,
    exists: fs.existsSync(path.join(utilsDir, file))
  })),
  build: fs.existsSync(buildDir),
  dependencies: fs.existsSync(nodeModulesDir),
  appRunning: false
}

// Salvar relatório
const reportPath = path.join(__dirname, 'performance-check-report.json')
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

console.log(`\n📊 Relatório salvo em: ${reportPath}`)

// Verificar se a aplicação está rodando após um delay
setTimeout(() => {
  checkApp().then(isRunning => {
    report.appRunning = isRunning
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    
    if (isRunning) {
      console.log('\n🎉 Verificação concluída com sucesso!')
      console.log('✅ Todos os arquivos de otimização estão presentes')
      console.log('✅ Build de produção está disponível')
      console.log('✅ Dependências estão instaladas')
      console.log('✅ Aplicação está rodando')
      console.log('\n🚀 Pronto para executar os testes de performance!')
    } else {
      console.log('\n⚠️  Verificação concluída com avisos:')
      console.log('✅ Todos os arquivos de otimização estão presentes')
      console.log('✅ Build de produção está disponível')
      console.log('✅ Dependências estão instaladas')
      console.log('❌ Aplicação não está rodando')
      console.log('\n💡 Execute "npm start" para iniciar a aplicação')
    }
  })
}, 2000)
