// Script de Teste de Performance - Alça Hub
import React from 'react'
import { createRoot } from 'react-dom/client'
import { 
  usePerformanceMeasurement,
  useComponentPerformanceTest,
  useListPerformanceTest,
  useImagePerformanceTest,
  useCachePerformanceTest,
  useBundlePerformanceTest,
  useNetworkPerformanceTest,
  useAnimationPerformanceTest,
  useGeneralPerformanceTest,
  usePerformanceReport
} from './utils/performanceTests'

// Componente de teste para performance
const TestComponent = React.memo(() => {
  const [count, setCount] = React.useState(0)
  
  return (
    <div>
      <h2>Teste de Performance</h2>
      <p>Contador: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Incrementar
      </button>
    </div>
  )
})

// Componente de teste para lista virtualizada
const TestList = () => {
  const items = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
    description: `Descrição do item ${i}`
  }))

  return (
    <div style={{ height: '400px', overflow: 'auto' }}>
      {items.map(item => (
        <div key={item.id} style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
          <h3>{item.name}</h3>
          <p>{item.description}</p>
        </div>
      ))}
    </div>
  )
}

// Componente de teste para imagens
const TestImages = () => {
  const images = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    src: `https://picsum.photos/300/200?random=${i}`,
    alt: `Imagem ${i}`
  }))

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '10px' }}>
      {images.map(image => (
        <img
          key={image.id}
          src={image.src}
          alt={image.alt}
          style={{ width: '100%', height: '200px', objectFit: 'cover' }}
          loading="lazy"
        />
      ))}
    </div>
  )
}

// Componente principal de teste
const PerformanceTestApp = () => {
  const [testResults, setTestResults] = React.useState({})
  const [isRunning, setIsRunning] = React.useState(false)

  // Hooks de teste
  const performanceMeasurement = usePerformanceMeasurement()
  const componentTest = useComponentPerformanceTest(TestComponent, {}, 100)
  const listTest = useListPerformanceTest(Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `Item ${i}` })), 50, 400)
  const imageTest = useImagePerformanceTest(Array.from({ length: 50 }, (_, i) => ({ src: `https://picsum.photos/300/200?random=${i}`, size: 50000 })))
  const cacheTest = useCachePerformanceTest({ get: () => null, set: () => {} }, 1000)
  const bundleTest = useBundlePerformanceTest()
  const networkTest = useNetworkPerformanceTest(['https://jsonplaceholder.typicode.com/posts/1', 'https://jsonplaceholder.typicode.com/posts/2'])
  const animationTest = useAnimationPerformanceTest([], 1000)
  const generalTest = useGeneralPerformanceTest()
  const performanceReport = usePerformanceReport()

  // Executar todos os testes
  const runAllTests = async () => {
    setIsRunning(true)
    performanceMeasurement.startMeasurement()

    try {
      // Teste de componente
      await componentTest.runTest()
      
      // Teste de lista
      await listTest.runTest()
      
      // Teste de imagens
      await imageTest.runTest()
      
      // Teste de cache
      await cacheTest.runTest()
      
      // Teste de bundle
      await bundleTest.runTest()
      
      // Teste de rede
      await networkTest.runTest()
      
      // Teste de animação
      await animationTest.runTest()
      
      // Teste geral
      await generalTest.runTest()

      // Gerar relatório
      const allResults = {
        component: componentTest.results,
        list: listTest.results,
        image: imageTest.results,
        cache: cacheTest.results,
        bundle: bundleTest.results,
        network: networkTest.results,
        animation: animationTest.results,
        general: generalTest.results,
        metrics: performanceMeasurement.metrics
      }

      performanceReport.generateReport(allResults)
      setTestResults(allResults)
    } catch (error) {
      console.error('Erro durante os testes:', error)
    } finally {
      performanceMeasurement.stopMeasurement()
      setIsRunning(false)
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🧪 Teste de Performance - Alça Hub</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={runAllTests} 
          disabled={isRunning}
          style={{
            padding: '10px 20px',
            backgroundColor: isRunning ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isRunning ? 'not-allowed' : 'pointer'
          }}
        >
          {isRunning ? 'Executando Testes...' : 'Executar Todos os Testes'}
        </button>
      </div>

      {isRunning && (
        <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f8ff', borderRadius: '5px' }}>
          <p>⏳ Executando testes de performance...</p>
          <div style={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ 
              width: '100%', 
              height: '20px', 
              backgroundColor: '#007bff', 
              animation: 'pulse 1s infinite' 
            }} />
          </div>
        </div>
      )}

      {/* Métricas de Performance */}
      <div style={{ marginBottom: '20px' }}>
        <h2>📊 Métricas de Performance</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          <div style={{ padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
            <strong>Tempo de Carregamento:</strong> {performanceMeasurement.metrics.loadTime.toFixed(2)}ms
          </div>
          <div style={{ padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
            <strong>Tempo de Renderização:</strong> {performanceMeasurement.metrics.renderTime.toFixed(2)}ms
          </div>
          <div style={{ padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
            <strong>Uso de Memória:</strong> {performanceMeasurement.metrics.memoryUsage.toFixed(2)}MB
          </div>
          <div style={{ padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
            <strong>FPS:</strong> {performanceMeasurement.metrics.fps}
          </div>
        </div>
      </div>

      {/* Resultados dos Testes */}
      {Object.keys(testResults).length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h2>📈 Resultados dos Testes</h2>
          
          {testResults.component && (
            <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
              <h3>🧩 Teste de Componente</h3>
              <p><strong>Tempo Médio de Renderização:</strong> {testResults.component.averageRenderTime.toFixed(2)}ms</p>
              <p><strong>Tempo Mínimo:</strong> {testResults.component.minRenderTime.toFixed(2)}ms</p>
              <p><strong>Tempo Máximo:</strong> {testResults.component.maxRenderTime.toFixed(2)}ms</p>
            </div>
          )}

          {testResults.list && (
            <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
              <h3>📋 Teste de Lista</h3>
              <p><strong>Tempo de Renderização:</strong> {testResults.list.renderTime.toFixed(2)}ms</p>
              <p><strong>Uso de Memória:</strong> {testResults.list.memoryUsage.toFixed(2)}MB</p>
              <p><strong>Performance de Scroll:</strong> {testResults.list.scrollPerformance.toFixed(2)}ms</p>
            </div>
          )}

          {testResults.image && (
            <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
              <h3>🖼️ Teste de Imagens</h3>
              <p><strong>Tempo de Carregamento:</strong> {testResults.image.loadTime.toFixed(2)}ms</p>
              <p><strong>Uso de Memória:</strong> {testResults.image.memoryUsage.toFixed(2)}MB</p>
              <p><strong>Taxa de Compressão:</strong> {testResults.image.compressionRatio.toFixed(1)}%</p>
              <p><strong>Economia:</strong> {testResults.image.optimizationSavings.toFixed(2)}KB</p>
            </div>
          )}

          {testResults.cache && (
            <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
              <h3>💾 Teste de Cache</h3>
              <p><strong>Tempo Médio de Get:</strong> {testResults.cache.averageGetTime.toFixed(2)}ms</p>
              <p><strong>Tempo Médio de Set:</strong> {testResults.cache.averageSetTime.toFixed(2)}ms</p>
              <p><strong>Taxa de Hit:</strong> {testResults.cache.hitRate.toFixed(1)}%</p>
              <p><strong>Uso de Memória:</strong> {testResults.cache.memoryUsage.toFixed(2)}MB</p>
            </div>
          )}

          {testResults.bundle && (
            <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
              <h3>📦 Teste de Bundle</h3>
              <p><strong>Tamanho Total:</strong> {(testResults.bundle.totalSize / 1024).toFixed(2)}KB</p>
              <p><strong>Tamanho Gzipped:</strong> {(testResults.bundle.gzippedSize / 1024).toFixed(2)}KB</p>
              <p><strong>Taxa de Compressão:</strong> {testResults.bundle.compressionRatio.toFixed(1)}%</p>
              <p><strong>Tempo de Carregamento:</strong> {testResults.bundle.loadTime.toFixed(2)}ms</p>
            </div>
          )}

          {testResults.network && (
            <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
              <h3>🌐 Teste de Rede</h3>
              <p><strong>Tempo Médio de Resposta:</strong> {testResults.network.averageResponseTime.toFixed(2)}ms</p>
              <p><strong>Tempo Mínimo:</strong> {testResults.network.minResponseTime.toFixed(2)}ms</p>
              <p><strong>Tempo Máximo:</strong> {testResults.network.maxResponseTime.toFixed(2)}ms</p>
              <p><strong>Taxa de Sucesso:</strong> {testResults.network.successRate.toFixed(1)}%</p>
            </div>
          )}
        </div>
      )}

      {/* Relatório de Performance */}
      {performanceReport.report.score > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h2>📊 Relatório de Performance</h2>
          <div style={{ padding: '15px', backgroundColor: '#e8f5e8', borderRadius: '5px', border: '1px solid #4caf50' }}>
            <h3>Score de Performance: {performanceReport.report.score}/100</h3>
            <p><strong>Timestamp:</strong> {new Date(performanceReport.report.timestamp).toLocaleString()}</p>
            
            {performanceReport.report.recommendations.length > 0 && (
              <div>
                <h4>💡 Recomendações:</h4>
                <ul>
                  {performanceReport.report.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Componentes de Teste */}
      <div style={{ marginBottom: '20px' }}>
        <h2>🧪 Componentes de Teste</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <h3>Componente de Performance</h3>
          <TestComponent />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>Lista Virtualizada</h3>
          <TestList />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>Imagens Otimizadas</h3>
          <TestImages />
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

// Renderizar aplicação de teste
const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<PerformanceTestApp />)
} else {
  console.error('Elemento root não encontrado')
}

export default PerformanceTestApp
