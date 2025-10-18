#!/bin/bash
# Code Quality Analysis Script - AlcaHub Mobile

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Diretório do projeto
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/../.." && pwd )"
ANDROID_DIR="$PROJECT_ROOT/mobile/android"

# Contadores
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNINGS=0

# Função para imprimir status
print_status() {
    local status=$1
    local message=$2

    if [ "$status" = "pass" ]; then
        echo -e "${GREEN}✓${NC} $message"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    elif [ "$status" = "fail" ]; then
        echo -e "${RED}✗${NC} $message"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    elif [ "$status" = "warn" ]; then
        echo -e "${YELLOW}⚠${NC} $message"
        WARNINGS=$((WARNINGS + 1))
    elif [ "$status" = "info" ]; then
        echo -e "${CYAN}ℹ${NC} $message"
    fi
}

# Banner
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Code Quality Analysis - AlcaHub Mobile  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# 1. ktlint
echo -e "${CYAN}[1/7] Running ktlint...${NC}"
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

cd "$ANDROID_DIR"
if ./gradlew ktlintCheck > /tmp/ktlint.log 2>&1; then
    print_status "pass" "ktlint: No style violations found"
else
    VIOLATIONS=$(grep -c "Lint error" /tmp/ktlint.log || echo "0")
    print_status "fail" "ktlint: Found $VIOLATIONS style violations"
    echo -e "  ${YELLOW}Run: cd mobile/android && ./gradlew ktlintFormat${NC}"
fi
echo ""

# 2. Detekt
echo -e "${CYAN}[2/7] Running detekt...${NC}"
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

if ./gradlew detekt > /tmp/detekt.log 2>&1; then
    print_status "pass" "detekt: No code smells detected"
else
    ISSUES=$(grep -c "Issue found" /tmp/detekt.log || echo "0")
    if [ "$ISSUES" -gt 0 ]; then
        print_status "warn" "detekt: Found $ISSUES potential issues"
        echo -e "  ${YELLOW}View report: mobile/android/build/reports/detekt/detekt.html${NC}"
    else
        print_status "pass" "detekt: No major issues"
    fi
fi
echo ""

# 3. Android Lint
echo -e "${CYAN}[3/7] Running Android lint...${NC}"
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

if ./gradlew lint > /tmp/lint.log 2>&1; then
    ERROR_COUNT=$(grep -o "[0-9]* error" /tmp/lint.log | grep -o "[0-9]*" || echo "0")
    WARNING_COUNT=$(grep -o "[0-9]* warning" /tmp/lint.log | grep -o "[0-9]*" || echo "0")

    if [ "$ERROR_COUNT" -eq 0 ]; then
        if [ "$WARNING_COUNT" -eq 0 ]; then
            print_status "pass" "Android lint: No issues found"
        else
            print_status "warn" "Android lint: 0 errors, $WARNING_COUNT warnings"
        fi
    else
        print_status "fail" "Android lint: $ERROR_COUNT errors, $WARNING_COUNT warnings"
    fi
    echo -e "  ${YELLOW}View report: mobile/android/app/build/reports/lint-results.html${NC}"
else
    print_status "fail" "Android lint: Build failed"
fi
echo ""

# 4. Unit Tests
echo -e "${CYAN}[4/7] Running unit tests...${NC}"
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

if ./gradlew test > /tmp/test.log 2>&1; then
    TEST_COUNT=$(grep -o "[0-9]* tests completed" /tmp/test.log | grep -o "[0-9]*" || echo "0")
    print_status "pass" "Unit tests: $TEST_COUNT tests passed"
else
    FAILED_TESTS=$(grep -o "[0-9]* failed" /tmp/test.log | grep -o "[0-9]*" || echo "unknown")
    print_status "fail" "Unit tests: $FAILED_TESTS tests failed"
    echo -e "  ${YELLOW}View report: mobile/android/app/build/reports/tests/testDebugUnitTest/index.html${NC}"
fi
echo ""

# 5. Dependencies Check
echo -e "${CYAN}[5/7] Checking dependencies...${NC}"
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

if command -v ./gradlew dependencyUpdates &> /dev/null; then
    ./gradlew dependencyUpdates > /tmp/deps.log 2>&1 || true
    OUTDATED=$(grep -c "outdated" /tmp/deps.log || echo "0")

    if [ "$OUTDATED" -eq 0 ]; then
        print_status "pass" "Dependencies: All up to date"
    else
        print_status "warn" "Dependencies: $OUTDATED outdated dependencies"
        echo -e "  ${YELLOW}Run: cd mobile/android && ./gradlew dependencyUpdates${NC}"
    fi
else
    print_status "info" "Dependencies: Check skipped (plugin not installed)"
fi
echo ""

# 6. APK Size Analysis
echo -e "${CYAN}[6/7] Analyzing APK size...${NC}"
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

APK_PATH="app/build/outputs/apk/dev/debug/app-dev-debug.apk"
if [ -f "$APK_PATH" ]; then
    APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
    APK_SIZE_BYTES=$(du -b "$APK_PATH" | cut -f1)
    APK_SIZE_MB=$(echo "scale=2; $APK_SIZE_BYTES / 1024 / 1024" | bc)

    if (( $(echo "$APK_SIZE_MB > 50" | bc -l) )); then
        print_status "warn" "APK size: ${APK_SIZE} (consider optimization)"
    elif (( $(echo "$APK_SIZE_MB > 30" | bc -l) )); then
        print_status "info" "APK size: ${APK_SIZE} (acceptable)"
    else
        print_status "pass" "APK size: ${APK_SIZE} (good)"
    fi
else
    print_status "info" "APK size: APK not found (build first)"
fi
echo ""

# 7. Code Coverage
echo -e "${CYAN}[7/7] Checking code coverage...${NC}"
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

if [ -f "app/build/reports/jacoco/jacocoTestReport/html/index.html" ]; then
    COVERAGE=$(grep -o "Total.*%" app/build/reports/jacoco/jacocoTestReport/html/index.html | grep -o "[0-9]*%" || echo "unknown")

    if [ "$COVERAGE" != "unknown" ]; then
        COVERAGE_NUM=$(echo $COVERAGE | tr -d '%')
        if [ "$COVERAGE_NUM" -ge 80 ]; then
            print_status "pass" "Code coverage: $COVERAGE (excellent)"
        elif [ "$COVERAGE_NUM" -ge 60 ]; then
            print_status "warn" "Code coverage: $COVERAGE (good, aim for 80%)"
        else
            print_status "fail" "Code coverage: $COVERAGE (needs improvement)"
        fi
        echo -e "  ${YELLOW}View report: mobile/android/app/build/reports/jacoco/jacocoTestReport/html/index.html${NC}"
    else
        print_status "info" "Code coverage: Report exists but couldn't parse"
    fi
else
    print_status "info" "Code coverage: Run './gradlew jacocoTestReport' first"
fi
echo ""

cd "$PROJECT_ROOT"

# Resumo
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║            Summary Report              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

TOTAL_ISSUES=$((FAILED_CHECKS + WARNINGS))

echo -e "Total Checks:    ${CYAN}$TOTAL_CHECKS${NC}"
echo -e "Passed:          ${GREEN}$PASSED_CHECKS${NC}"
echo -e "Failed:          ${RED}$FAILED_CHECKS${NC}"
echo -e "Warnings:        ${YELLOW}$WARNINGS${NC}"
echo ""

# Score
SCORE=0
if [ $TOTAL_CHECKS -gt 0 ]; then
    SCORE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))
fi

echo -e "Quality Score:   "
if [ $SCORE -ge 90 ]; then
    echo -e "${GREEN}██████████${NC} $SCORE% (Excellent)"
elif [ $SCORE -ge 70 ]; then
    echo -e "${YELLOW}████████  ${NC} $SCORE% (Good)"
elif [ $SCORE -ge 50 ]; then
    echo -e "${YELLOW}██████    ${NC} $SCORE% (Needs Work)"
else
    echo -e "${RED}████      ${NC} $SCORE% (Critical)"
fi
echo ""

# Recomendações
if [ $FAILED_CHECKS -gt 0 ] || [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}Recommendations:${NC}"
    echo ""

    if [ $FAILED_CHECKS -gt 0 ]; then
        echo -e "  ${RED}•${NC} Fix ${FAILED_CHECKS} critical issue(s) before committing"
    fi

    if [ $WARNINGS -gt 0 ]; then
        echo -e "  ${YELLOW}•${NC} Address ${WARNINGS} warning(s) when possible"
    fi

    echo ""
    echo -e "${CYAN}Quick fixes:${NC}"
    echo -e "  ${BLUE}make format${NC}           - Auto-format code"
    echo -e "  ${BLUE}make analyze${NC}          - Full static analysis"
    echo -e "  ${BLUE}make test-coverage${NC}    - Generate coverage report"
    echo ""
fi

# Exit code
if [ $FAILED_CHECKS -gt 0 ]; then
    echo -e "${RED}❌ Quality check FAILED${NC}"
    echo ""
    exit 1
else
    echo -e "${GREEN}✅ Quality check PASSED${NC}"
    echo ""
    exit 0
fi
