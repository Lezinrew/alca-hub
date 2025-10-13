#!/usr/bin/env bash
set -euo pipefail

REMOTE_DEFAULT="origin"
PUSH=0
REMOTE="$REMOTE_DEFAULT"

# -------- args --------
while [[ $# -gt 0 ]]; do
  case "$1" in
    --push) PUSH=1; shift ;;
    --remote) REMOTE="${2:-$REMOTE_DEFAULT}"; shift 2 ;;
    *) echo "Uso: $0 [--push] [--remote nome]"; exit 1 ;;
  esac
done

# -------- pré-checagens --------
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || { echo "❌ Não é um repositório Git."; exit 1; }
git fetch --all --prune >/dev/null 2>&1 || true

# exigir árvore limpa para evitar conflitos inesperados
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "❌ Há mudanças não commitadas. Faça commit ou 'git stash -u' antes."
  exit 1
fi

# conferir remotos quando push for solicitado
if [[ "$PUSH" -eq 1 ]]; then
  git remote get-url "$REMOTE" >/dev/null 2>&1 || { echo "❌ Remote '$REMOTE' não existe."; exit 1; }
fi

# -------- ambiente virtual --------
if [[ -d venv ]]; then
  source venv/bin/activate
else
  echo "🪄 Criando venv…"
  python3 -m venv venv
  source venv/bin/activate
fi

# -------- MCP mínimo (idempotente) --------
mkdir -p "$HOME/.codex"
TOML="$HOME/.codex/config.toml"
if ! grep -q "^\[mcp_servers.context7\]" "$TOML" 2>/dev/null; then
  cat >> "$TOML" <<'TOML'
[mcp_servers.context7]
command = "npx"
args = ["-y", "@upstash/context7-mcp"]
experimental_use_rmcp_client = true
TOML
  echo "🧩 MCP Context7 habilitado em $TOML"
fi

# -------- branch de trabalho --------
BASE_BRANCH="$(git symbolic-ref --short HEAD 2>/dev/null || echo main)"
TS="$(date +%Y%m%d-%H%M)"
BR="codex/refactor-$TS"

# garantir que base esteja atualizada (se existir remoto)
if git rev-parse --verify "$BASE_BRANCH" >/dev/null 2>&1; then
  git checkout "$BASE_BRANCH"
  git pull --rebase "$REMOTE" "$BASE_BRANCH" || true
fi

git checkout -b "$BR"
echo "✅ Branch criada: $BR (a partir de $BASE_BRANCH)"

# -------- arquivos de estado/log --------
LOG="codex-run-$TS.log"
IMPROV="codex-improvements.log"
CHECK="codex-checklist.json"

# -------- prompt inteligente idempotente --------
read -r -d '' PROMPT <<'PROMPT'
Verifique se já existem análises anteriores em 'codex-improvements.log' e/ou 'codex-checklist.json'.
1) Se houver, avalie status atual do projeto comparando o código com o checklist.
2) Gere um CHECKLIST INCREMENTAL priorizado (apenas itens pendentes/necessários), considerando:
   - Performance (backend/frontend)
   - Segurança (JWT, CORS, headers, deps)
   - Legibilidade/Arquitetura (acoplamento, duplicação)
   - DX
   - Acessibilidade
3) Para CADA item do checklist:
   a. Proponha o diff mínimo seguro (mostre patch),
   b. Aplique a mudança,
   c. Valide automaticamente:
      - Se existir pytest/arquivos de teste: executar `pytest -q || true`
      - Se existir frontend: `npm -C frontend test -s || true` e `npm -C frontend run build || true`
   d. Se a validação não indicar regressões, gere commit usando Conventional Commits (mensagem clara e escopo).
   e. Se algo falhar, reverta somente as alterações daquele item, registre no log e siga para o próximo.
4) Atualize 'codex-checklist.json' e 'codex-improvements.log' com o status final (feitos/pendentes/bloqueios).
5) NÃO faça push nem altere tags. Não altere configs fora do workspace. Continue até esgotar os itens ou bloqueios.
PROMPT

echo "🚀 Rodando Codex (full-auto)…"
codex "$PROMPT" --approval-mode full-auto | tee "$LOG"

# -------- resumo --------
echo
echo "📝 Resumo:"
[[ -f "$IMPROV" ]] && tail -n 50 "$IMPROV" || echo "(sem $IMPROV gerado)"
echo "📄 Log completo: $LOG"
echo "�� Branch atual: $BR"

# -------- push opcional --------
if [[ "$PUSH" -eq 1 ]]; then
  echo "⬆️  Fazendo push para '$REMOTE'…"
  git push -u "$REMOTE" "$BR"
  echo "✅ Push feito: $REMOTE/$BR"
  echo "💡 Crie o PR a partir da branch '$BR' no seu provedor Git."
else
  echo "ℹ️ Push NÃO executado (use --push para habilitar)."
fi
