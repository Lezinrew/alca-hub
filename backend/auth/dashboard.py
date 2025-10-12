# Dashboard de Rate Limiting - Alça Hub
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import HTMLResponse
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import json
import asyncio

from .redis_rate_limiter import RedisRateLimiter
from .security import SecurityManager

# Router para dashboard
dashboard_router = APIRouter(prefix="/api/admin/rate-limit", tags=["dashboard"])


# Dependências
async def get_rate_limiter() -> RedisRateLimiter:
    """Obter instância do rate limiter."""
    return RedisRateLimiter()


async def get_security_manager() -> SecurityManager:
    """Obter instância do gerenciador de segurança."""
    return SecurityManager(None)


@dashboard_router.get("/stats", response_model=Dict)
async def get_global_stats(rate_limiter: RedisRateLimiter = Depends(get_rate_limiter)):
    """Obter estatísticas globais de rate limiting."""
    try:
        stats = await rate_limiter.get_global_stats()
        return {
            "success": True,
            "data": stats,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter estatísticas: {str(e)}",
        )


@dashboard_router.get("/info/{client_id}")
async def get_client_info(
    client_id: str,
    rule_name: str = Query("general", description="Nome da regra de rate limiting"),
    rate_limiter: RedisRateLimiter = Depends(get_rate_limiter),
):
    """Obter informações de rate limiting para um cliente específico."""
    try:
        info = await rate_limiter.get_rate_limit_info(client_id, rule_name)
        return {
            "success": True,
            "data": info,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter informações: {str(e)}",
        )


@dashboard_router.post("/whitelist/{ip}")
async def add_ip_to_whitelist(
    ip: str, rate_limiter: RedisRateLimiter = Depends(get_rate_limiter)
):
    """Adicionar IP à whitelist."""
    try:
        success = rate_limiter.add_ip_to_whitelist(ip)
        return {
            "success": success,
            "message": f"IP {ip} adicionado à whitelist",
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao adicionar IP à whitelist: {str(e)}",
        )


@dashboard_router.delete("/whitelist/{ip}")
async def remove_ip_from_whitelist(
    ip: str, rate_limiter: RedisRateLimiter = Depends(get_rate_limiter)
):
    """Remover IP da whitelist."""
    try:
        success = rate_limiter.remove_ip_from_whitelist(ip)
        return {
            "success": success,
            "message": f"IP {ip} removido da whitelist",
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao remover IP da whitelist: {str(e)}",
        )


@dashboard_router.post("/blacklist/{ip}")
async def add_ip_to_blacklist(
    ip: str, rate_limiter: RedisRateLimiter = Depends(get_rate_limiter)
):
    """Adicionar IP à blacklist."""
    try:
        success = rate_limiter.add_ip_to_blacklist(ip)
        return {
            "success": success,
            "message": f"IP {ip} adicionado à blacklist",
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao adicionar IP à blacklist: {str(e)}",
        )


@dashboard_router.delete("/blacklist/{ip}")
async def remove_ip_from_blacklist(
    ip: str, rate_limiter: RedisRateLimiter = Depends(get_rate_limiter)
):
    """Remover IP da blacklist."""
    try:
        success = rate_limiter.remove_ip_from_blacklist(ip)
        return {
            "success": success,
            "message": f"IP {ip} removido da blacklist",
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao remover IP da blacklist: {str(e)}",
        )


@dashboard_router.post("/reset/{client_id}")
async def reset_client_rate_limit(
    client_id: str,
    rule_name: str = Query("general", description="Nome da regra de rate limiting"),
    rate_limiter: RedisRateLimiter = Depends(get_rate_limiter),
):
    """Resetar rate limiting para um cliente específico."""
    try:
        success = await rate_limiter.reset_rate_limit(client_id, rule_name)
        return {
            "success": success,
            "message": f"Rate limiting resetado para {client_id}",
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao resetar rate limiting: {str(e)}",
        )


@dashboard_router.post("/cleanup")
async def cleanup_expired_data(
    rate_limiter: RedisRateLimiter = Depends(get_rate_limiter),
):
    """Limpar dados expirados de rate limiting."""
    try:
        cleaned = await rate_limiter.cleanup_expired_data()
        return {
            "success": True,
            "message": f"{cleaned} entradas expiradas foram limpas",
            "cleaned_count": cleaned,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao limpar dados expirados: {str(e)}",
        )


@dashboard_router.get("/rules")
async def get_rate_limit_rules(
    rate_limiter: RedisRateLimiter = Depends(get_rate_limiter),
):
    """Obter regras de rate limiting configuradas."""
    try:
        rules = {}
        for rule_name, rule in rate_limiter.rules.items():
            rules[rule_name] = {
                "name": rule.name,
                "max_requests": rule.max_requests,
                "window_seconds": rule.window_seconds,
                "strategy": rule.strategy.value,
                "block_duration": rule.block_duration,
                "burst_limit": rule.burst_limit,
                "refill_rate": rule.refill_rate,
            }

        return {
            "success": True,
            "data": rules,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter regras: {str(e)}",
        )


@dashboard_router.get("/dashboard", response_class=HTMLResponse)
async def get_dashboard_html():
    """Obter dashboard HTML de rate limiting."""
    html_content = """
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dashboard de Rate Limiting - Alça Hub</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 {
                color: #333;
                text-align: center;
                margin-bottom: 30px;
            }
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            .stat-card {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #007bff;
            }
            .stat-title {
                font-size: 14px;
                color: #666;
                margin-bottom: 5px;
            }
            .stat-value {
                font-size: 24px;
                font-weight: bold;
                color: #333;
            }
            .controls {
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
                flex-wrap: wrap;
            }
            .btn {
                padding: 10px 20px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
            }
            .btn-primary {
                background: #007bff;
                color: white;
            }
            .btn-danger {
                background: #dc3545;
                color: white;
            }
            .btn-success {
                background: #28a745;
                color: white;
            }
            .input-group {
                display: flex;
                gap: 10px;
                align-items: center;
            }
            input[type="text"] {
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
            }
            .table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            }
            .table th, .table td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #ddd;
            }
            .table th {
                background-color: #f8f9fa;
                font-weight: bold;
            }
            .status-badge {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
            }
            .status-active {
                background: #d4edda;
                color: #155724;
            }
            .status-blocked {
                background: #f8d7da;
                color: #721c24;
            }
            .status-whitelisted {
                background: #d1ecf1;
                color: #0c5460;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🔒 Dashboard de Rate Limiting - Alça Hub</h1>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-title">Total de Limites Ativos</div>
                    <div class="stat-value" id="total-active">-</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">IPs Bloqueados</div>
                    <div class="stat-value" id="total-blocked">-</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">IPs na Whitelist</div>
                    <div class="stat-value" id="total-whitelisted">-</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">IPs na Blacklist</div>
                    <div class="stat-value" id="total-blacklisted">-</div>
                </div>
            </div>
            
            <div class="controls">
                <button class="btn btn-primary" onclick="refreshStats()">🔄 Atualizar</button>
                <button class="btn btn-success" onclick="cleanupData()">🧹 Limpar Dados</button>
                <div class="input-group">
                    <input type="text" id="ip-input" placeholder="Digite um IP">
                    <button class="btn btn-success" onclick="addToWhitelist()">✅ Whitelist</button>
                    <button class="btn btn-danger" onclick="addToBlacklist()">❌ Blacklist</button>
                </div>
            </div>
            
            <table class="table">
                <thead>
                    <tr>
                        <th>Regra</th>
                        <th>Limites Ativos</th>
                        <th>IPs Bloqueados</th>
                        <th>Estratégia</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody id="rules-table">
                    <tr>
                        <td colspan="5">Carregando...</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <script>
            async function fetchStats() {
                try {
                    const response = await fetch('/api/admin/rate-limit/stats');
                    const data = await response.json();
                    
                    if (data.success) {
                        const stats = data.data;
                        document.getElementById('total-active').textContent = stats.total_active_limits || 0;
                        document.getElementById('total-blocked').textContent = stats.total_blocked_ips || 0;
                        document.getElementById('total-whitelisted').textContent = stats.whitelisted_ips || 0;
                        document.getElementById('total-blacklisted').textContent = stats.blacklisted_ips || 0;
                        
                        updateRulesTable(stats.rule_stats || {});
                    }
                } catch (error) {
                    console.error('Erro ao buscar estatísticas:', error);
                }
            }
            
            function updateRulesTable(ruleStats) {
                const tbody = document.getElementById('rules-table');
                tbody.innerHTML = '';
                
                for (const [ruleName, stats] of Object.entries(ruleStats)) {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${ruleName}</td>
                        <td>${stats.active_limits || 0}</td>
                        <td>${stats.blocked_ips || 0}</td>
                        <td>Adaptativo</td>
                        <td><span class="status-badge status-active">Ativo</span></td>
                    `;
                    tbody.appendChild(row);
                }
            }
            
            async function refreshStats() {
                await fetchStats();
            }
            
            async function cleanupData() {
                try {
                    const response = await fetch('/api/admin/rate-limit/cleanup', { method: 'POST' });
                    const data = await response.json();
                    
                    if (data.success) {
                        alert(`✅ ${data.message}`);
                        await refreshStats();
                    } else {
                        alert('❌ Erro ao limpar dados');
                    }
                } catch (error) {
                    console.error('Erro ao limpar dados:', error);
                    alert('❌ Erro ao limpar dados');
                }
            }
            
            async function addToWhitelist() {
                const ip = document.getElementById('ip-input').value;
                if (!ip) {
                    alert('❌ Digite um IP válido');
                    return;
                }
                
                try {
                    const response = await fetch(`/api/admin/rate-limit/whitelist/${ip}`, { method: 'POST' });
                    const data = await response.json();
                    
                    if (data.success) {
                        alert(`✅ ${data.message}`);
                        document.getElementById('ip-input').value = '';
                        await refreshStats();
                    } else {
                        alert('❌ Erro ao adicionar à whitelist');
                    }
                } catch (error) {
                    console.error('Erro ao adicionar à whitelist:', error);
                    alert('❌ Erro ao adicionar à whitelist');
                }
            }
            
            async function addToBlacklist() {
                const ip = document.getElementById('ip-input').value;
                if (!ip) {
                    alert('❌ Digite um IP válido');
                    return;
                }
                
                try {
                    const response = await fetch(`/api/admin/rate-limit/blacklist/${ip}`, { method: 'POST' });
                    const data = await response.json();
                    
                    if (data.success) {
                        alert(`✅ ${data.message}`);
                        document.getElementById('ip-input').value = '';
                        await refreshStats();
                    } else {
                        alert('❌ Erro ao adicionar à blacklist');
                    }
                } catch (error) {
                    console.error('Erro ao adicionar à blacklist:', error);
                    alert('❌ Erro ao adicionar à blacklist');
                }
            }
            
            // Carregar estatísticas ao carregar a página
            document.addEventListener('DOMContentLoaded', fetchStats);
            
            // Atualizar estatísticas a cada 30 segundos
            setInterval(fetchStats, 30000);
        </script>
    </body>
    </html>
    """

    return HTMLResponse(content=html_content)
