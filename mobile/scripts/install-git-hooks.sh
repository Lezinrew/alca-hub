#!/bin/bash
# Install Git Hooks for AlcaHub Mobile

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/../.." && pwd )"
GIT_HOOKS_DIR="$PROJECT_ROOT/.git/hooks"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}Installing Git Hooks - AlcaHub Mobile${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Verificar se estamos em um repositório git
if [ ! -d "$PROJECT_ROOT/.git" ]; then
    echo -e "${RED}✗ Not a git repository${NC}"
    exit 1
fi

# Criar diretório de hooks se não existir
mkdir -p "$GIT_HOOKS_DIR"

# Pre-commit Hook
echo -e "${YELLOW}Installing pre-commit hook...${NC}"

cat > "$GIT_HOOKS_DIR/pre-commit" << 'EOF'
#!/bin/bash
# Pre-commit hook for AlcaHub Mobile

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}Pre-commit checks - AlcaHub Mobile${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Verificar se há mudanças em mobile/android
ANDROID_CHANGES=$(git diff --cached --name-only | grep "^mobile/android/" || true)

if [ -z "$ANDROID_CHANGES" ]; then
    echo -e "${GREEN}✓ No Android changes detected, skipping checks${NC}"
    exit 0
fi

echo -e "${YELLOW}Android changes detected, running checks...${NC}"
echo ""

# 1. Verificar secrets
echo -e "${BLUE}1. Checking for secrets...${NC}"
SECRETS_FOUND=$(git diff --cached | grep -iE "password|secret|api_key|token|keystore" | grep -v "BuildConfig\|/\*\|//" || true)

if [ ! -z "$SECRETS_FOUND" ]; then
    echo -e "${RED}✗ Possible secrets found in staged files:${NC}"
    echo "$SECRETS_FOUND"
    echo ""
    echo -e "${YELLOW}Please review and remove any sensitive data.${NC}"
    echo -e "${YELLOW}If this is a false positive, use: git commit --no-verify${NC}"
    exit 1
fi
echo -e "${GREEN}✓ No secrets detected${NC}"
echo ""

# 2. Verificar TODO/FIXME
echo -e "${BLUE}2. Checking for TODO/FIXME...${NC}"
TODO_COUNT=$(git diff --cached | grep -E "TODO|FIXME|XXX|HACK" | wc -l | tr -d ' ')

if [ "$TODO_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠ Found $TODO_COUNT TODO/FIXME comments${NC}"
    echo -e "${YELLOW}Consider creating issues for these items${NC}"
fi
echo ""

# 3. ktlint
echo -e "${BLUE}3. Running ktlint...${NC}"
cd mobile/android

if ! ./gradlew ktlintCheck > /dev/null 2>&1; then
    echo -e "${RED}✗ ktlint check failed${NC}"
    echo ""
    echo -e "${YELLOW}Run to see errors:${NC}"
    echo -e "  ${BLUE}cd mobile/android && ./gradlew ktlintCheck${NC}"
    echo ""
    echo -e "${YELLOW}Auto-fix with:${NC}"
    echo -e "  ${BLUE}cd mobile/android && ./gradlew ktlintFormat${NC}"
    echo ""
    echo -e "${YELLOW}Or skip this hook with:${NC}"
    echo -e "  ${BLUE}git commit --no-verify${NC}"
    exit 1
fi
echo -e "${GREEN}✓ ktlint passed${NC}"
echo ""

# 4. Detekt (mais leve que testes completos)
echo -e "${BLUE}4. Running detekt...${NC}"
if ! ./gradlew detekt > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠ detekt found issues${NC}"
    echo -e "${YELLOW}Run to see details:${NC}"
    echo -e "  ${BLUE}cd mobile/android && ./gradlew detekt${NC}"
    echo ""
    echo -e "${YELLOW}This is a warning, not blocking commit.${NC}"
fi
echo ""

cd ../..

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}✓ Pre-commit checks passed${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""

exit 0
EOF

chmod +x "$GIT_HOOKS_DIR/pre-commit"
echo -e "${GREEN}✓ Pre-commit hook installed${NC}"
echo ""

# Commit-msg Hook (Conventional Commits)
echo -e "${YELLOW}Installing commit-msg hook...${NC}"

cat > "$GIT_HOOKS_DIR/commit-msg" << 'EOF'
#!/bin/bash
# Commit message hook for AlcaHub Mobile
# Enforce Conventional Commits format

commit_msg_file=$1
commit_msg=$(cat "$commit_msg_file")

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Regex para conventional commits
# Formato: type(scope?): subject
conventional_commit_regex="^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?: .{1,72}"

# Permitir merge commits
if echo "$commit_msg" | grep -qE "^Merge"; then
    exit 0
fi

# Verificar formato
if ! echo "$commit_msg" | grep -qE "$conventional_commit_regex"; then
    echo -e "${RED}=========================================${NC}"
    echo -e "${RED}✗ Invalid commit message format${NC}"
    echo -e "${RED}=========================================${NC}"
    echo ""
    echo -e "${YELLOW}Your commit message:${NC}"
    echo "  $commit_msg"
    echo ""
    echo -e "${YELLOW}Expected format:${NC}"
    echo "  type(scope): subject"
    echo ""
    echo -e "${YELLOW}Types:${NC}"
    echo "  feat:     Nova funcionalidade"
    echo "  fix:      Bug fix"
    echo "  docs:     Documentação"
    echo "  style:    Formatação, ponto e vírgula, etc"
    echo "  refactor: Refatoração de código"
    echo "  perf:     Melhoria de performance"
    echo "  test:     Adicionar/corrigir testes"
    echo "  build:    Build system ou dependências"
    echo "  ci:       CI/CD config"
    echo "  chore:    Outras mudanças que não modificam src"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  feat(auth): add biometric authentication"
    echo "  fix(api): handle network timeout properly"
    echo "  docs(readme): update setup instructions"
    echo ""
    echo -e "${YELLOW}To bypass this hook (not recommended):${NC}"
    echo "  git commit --no-verify"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ Commit message format valid${NC}"
exit 0
EOF

chmod +x "$GIT_HOOKS_DIR/commit-msg"
echo -e "${GREEN}✓ Commit-msg hook installed${NC}"
echo ""

# Pre-push Hook
echo -e "${YELLOW}Installing pre-push hook...${NC}"

cat > "$GIT_HOOKS_DIR/pre-push" << 'EOF'
#!/bin/bash
# Pre-push hook for AlcaHub Mobile

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}Pre-push checks - AlcaHub Mobile${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Verificar se há mudanças em mobile/android
ANDROID_CHANGES=$(git diff origin/main...HEAD --name-only | grep "^mobile/android/" || true)

if [ -z "$ANDROID_CHANGES" ]; then
    echo -e "${GREEN}✓ No Android changes, skipping tests${NC}"
    exit 0
fi

echo -e "${YELLOW}Running tests before push...${NC}"
echo ""

cd mobile/android

# Unit tests
echo -e "${BLUE}Running unit tests...${NC}"
if ! ./gradlew test > /dev/null 2>&1; then
    echo -e "${RED}✗ Unit tests failed${NC}"
    echo ""
    echo -e "${YELLOW}Run to see errors:${NC}"
    echo -e "  ${BLUE}cd mobile/android && ./gradlew test${NC}"
    echo ""
    echo -e "${YELLOW}Or skip this hook with:${NC}"
    echo -e "  ${BLUE}git push --no-verify${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Unit tests passed${NC}"
echo ""

# Lint
echo -e "${BLUE}Running lint...${NC}"
if ! ./gradlew lint > /dev/null 2>&1; then
    echo -e "${RED}✗ Lint check failed${NC}"
    echo ""
    echo -e "${YELLOW}Run to see errors:${NC}"
    echo -e "  ${BLUE}cd mobile/android && ./gradlew lint${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Lint passed${NC}"
echo ""

cd ../..

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}✓ Pre-push checks passed${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""

exit 0
EOF

chmod +x "$GIT_HOOKS_DIR/pre-push"
echo -e "${GREEN}✓ Pre-push hook installed${NC}"
echo ""

# Resumo
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}Git Hooks Installed Successfully!${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""
echo -e "${GREEN}Installed hooks:${NC}"
echo -e "  ${GREEN}✓${NC} pre-commit  - ktlint, detekt, secrets check"
echo -e "  ${GREEN}✓${NC} commit-msg  - Conventional Commits format"
echo -e "  ${GREEN}✓${NC} pre-push    - Unit tests, lint"
echo ""
echo -e "${YELLOW}To bypass hooks (not recommended):${NC}"
echo -e "  ${BLUE}git commit --no-verify${NC}"
echo -e "  ${BLUE}git push --no-verify${NC}"
echo ""
echo -e "${YELLOW}To uninstall hooks:${NC}"
echo -e "  ${BLUE}rm -rf .git/hooks/*${NC}"
echo ""
