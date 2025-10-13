// Dashboard de Monitoramento - Alça Hub
import React, { useState, useEffect } from 'react';
import { Activity, Server, Database, Zap, AlertTriangle, CheckCircle, Clock, Users } from 'lucide-react';

const MonitoringDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [health, setHealth] = useState(null);
  const [cacheStats, setCacheStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 5000); // Atualizar a cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = async () => {
    try {
      const [metricsResponse, healthResponse, cacheResponse] = await Promise.all([
        fetch('/metrics'),
        fetch('/health'),
        fetch('/cache/stats')
      ]);

      const metricsData = await metricsResponse.json();
      const healthData = await healthResponse.json();
      const cacheData = await cacheResponse.json();

      setMetrics(metricsData);
      setHealth(healthData);
      setCacheStats(cacheData);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar métricas');
      console.error('Erro ao carregar métricas:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Status do Sistema</p>
              <p className="text-2xl font-bold text-green-600">
                {health?.status === 'healthy' ? 'Saudável' : 'Problemas'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Uptime</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatUptime(metrics?.uptime_seconds || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Requisições Ativas</p>
              <p className="text-2xl font-bold text-purple-600">
                {metrics?.performance?.active_requests || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Requisições</p>
              <p className="text-2xl font-bold text-orange-600">
                {metrics?.performance?.total_requests || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas de Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Taxa de Erro</span>
              <span className={`font-semibold ${
                (metrics?.performance?.error_rate || 0) > 5 ? 'text-red-600' : 'text-green-600'
              }`}>
                {(metrics?.performance?.error_rate || 0).toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tempo de Resposta P50</span>
              <span className="font-semibold text-blue-600">
                {(metrics?.performance?.response_time_p50 || 0).toFixed(2)}ms
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tempo de Resposta P95</span>
              <span className="font-semibold text-blue-600">
                {(metrics?.performance?.response_time_p95 || 0).toFixed(2)}ms
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tempo de Resposta P99</span>
              <span className="font-semibold text-blue-600">
                {(metrics?.performance?.response_time_p99 || 0).toFixed(2)}ms
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cache</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tamanho do Cache</span>
              <span className="font-semibold text-blue-600">
                {cacheStats?.size || 0} / {cacheStats?.max_size || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Taxa de Hit</span>
              <span className="font-semibold text-green-600">
                {((cacheStats?.hit_rate || 0) * 100).toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total de Entradas</span>
              <span className="font-semibold text-blue-600">
                {cacheStats?.total_entries || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Verificações de Saúde */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Verificações de Saúde</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {health?.checks && Object.entries(health.checks).map(([name, check]) => (
            <div key={name} className="flex items-center p-3 rounded-lg bg-gray-50">
              <div className={`p-2 rounded-lg mr-3 ${
                check.status === 'healthy' ? 'bg-green-100' : 
                check.status === 'unhealthy' ? 'bg-red-100' : 'bg-yellow-100'
              }`}>
                {check.status === 'healthy' ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : check.status === 'unhealthy' ? (
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                ) : (
                  <Clock className="w-4 h-4 text-yellow-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900 capitalize">
                  {name.replace(/_/g, ' ')}
                </p>
                <p className="text-sm text-gray-600">
                  {check.duration ? `${(check.duration * 1000).toFixed(2)}ms` : 'N/A'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contadores */}
      {metrics?.counters && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contadores</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(metrics.counters).map(([name, value]) => (
              <div key={name} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{value}</p>
                <p className="text-sm text-gray-600 capitalize">
                  {name.replace(/_/g, ' ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ações */}
      <div className="flex space-x-4">
        <button
          onClick={loadMetrics}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Atualizar Métricas
        </button>
        <button
          onClick={async () => {
            try {
              await fetch('/cache/clear', { method: 'POST' });
              loadMetrics();
            } catch (err) {
              console.error('Erro ao limpar cache:', err);
            }
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Limpar Cache
        </button>
      </div>
    </div>
  );
};

export default MonitoringDashboard;
