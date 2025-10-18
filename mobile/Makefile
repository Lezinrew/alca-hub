# AlcaHub Mobile - Makefile
# Facilita comandos comuns para desenvolvimento iOS e Android

.PHONY: help install setup-ios setup-android build-ios build-android run-ios run-android clean test

# Cores para output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Mostra esta mensagem de ajuda
	@echo "$(BLUE)AlcaHub Mobile - Comandos Disponíveis$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""

install: ## Instala todas as dependências (iOS e Android)
	@echo "$(BLUE)Instalando dependências...$(NC)"
	@cd ios && bundle install
	@cd android && bundle install
	@echo "$(GREEN)✓ Dependências instaladas$(NC)"

setup-ios: ## Configura ambiente iOS (CocoaPods, etc)
	@echo "$(BLUE)Configurando iOS...$(NC)"
	@cd ios/App && pod install
	@echo "$(GREEN)✓ iOS configurado$(NC)"

setup-android: ## Configura ambiente Android (Gradle, etc)
	@echo "$(BLUE)Configurando Android...$(NC)"
	@cd android && ./gradlew clean
	@echo "$(GREEN)✓ Android configurado$(NC)"

build-ios-debug: ## Build iOS Debug
	@echo "$(BLUE)Building iOS Debug...$(NC)"
	@cd ios && bundle exec fastlane ios build_debug

build-ios-release: ## Build iOS Release
	@echo "$(BLUE)Building iOS Release...$(NC)"
	@cd ios && bundle exec fastlane ios build_release

build-android-dev-debug: ## Build Android Dev Debug
	@echo "$(BLUE)Building Android Dev Debug...$(NC)"
	@cd android && ./gradlew assembleDevDebug

build-android-dev-release: ## Build Android Dev Release
	@echo "$(BLUE)Building Android Dev Release...$(NC)"
	@cd android && ./gradlew assembleDevRelease

build-android-prod-debug: ## Build Android Prod Debug
	@echo "$(BLUE)Building Android Prod Debug...$(NC)"
	@cd android && ./gradlew assembleProdDebug

build-android-prod-release: ## Build Android Prod Release (Store)
	@echo "$(BLUE)Building Android Prod Release...$(NC)"
	@cd android && ./gradlew assembleProdRelease

bundle-android-prod: ## Build Android Bundle para Play Store
	@echo "$(BLUE)Building Android Bundle para Play Store...$(NC)"
	@cd android && ./gradlew bundleProdRelease
	@echo "$(GREEN)✓ Bundle criado em android/app/build/outputs/bundle/prodRelease/$(NC)"

list-android-variants: ## Lista todas as variantes Android disponíveis
	@echo "$(BLUE)Variantes Android disponíveis:$(NC)"
	@cd android && ./gradlew tasks --all | grep assemble

run-ios: ## Executa app no simulador iOS
	@echo "$(BLUE)Executando iOS...$(NC)"
	@cd ios && xcodebuild -workspace App/App.xcworkspace -scheme App -destination 'platform=iOS Simulator,name=iPhone 15' run

run-android: ## Executa app no emulador Android
	@echo "$(BLUE)Executando Android...$(NC)"
	@cd android && ./gradlew installDebug
	@adb shell am start -n br.com.alcahub/.MainActivity

test-ios: ## Roda testes iOS
	@echo "$(BLUE)Rodando testes iOS...$(NC)"
	@cd ios && xcodebuild test -workspace App/App.xcworkspace -scheme App -destination 'platform=iOS Simulator,name=iPhone 15'

test-android: ## Roda testes Android
	@echo "$(BLUE)Rodando testes Android...$(NC)"
	@cd android && ./gradlew test

lint-ios: ## Verifica código iOS (SwiftLint)
	@echo "$(BLUE)Linting iOS...$(NC)"
	@cd ios && swiftlint

lint-android: ## Verifica código Android (ktlint)
	@echo "$(BLUE)Linting Android...$(NC)"
	@cd android && ./gradlew ktlintCheck

clean-ios: ## Limpa build iOS
	@echo "$(YELLOW)Limpando iOS...$(NC)"
	@cd ios && xcodebuild clean -workspace App/App.xcworkspace -scheme App
	@cd ios/App && rm -rf Pods Podfile.lock
	@echo "$(GREEN)✓ iOS limpo$(NC)"

clean-android: ## Limpa build Android
	@echo "$(YELLOW)Limpando Android...$(NC)"
	@cd android && ./gradlew clean
	@cd android && rm -rf build .gradle
	@echo "$(GREEN)✓ Android limpo$(NC)"

clean: clean-ios clean-android ## Limpa builds iOS e Android

deploy-ios-testflight: ## Deploy iOS para TestFlight
	@echo "$(BLUE)Fazendo deploy iOS para TestFlight...$(NC)"
	@cd ios && bundle exec fastlane ios beta

deploy-android-internal: ## Deploy Android para Internal Testing
	@echo "$(BLUE)Fazendo deploy Android para Internal Testing...$(NC)"
	@cd android && bundle exec fastlane android beta

screenshots-ios: ## Gera screenshots iOS
	@cd ios && bundle exec fastlane ios screenshots

screenshots-android: ## Gera screenshots Android
	@cd android && bundle exec fastlane android screenshots

bump-version: ## Incrementa versão do app
	@echo "$(BLUE)Incrementando versão...$(NC)"
	@# Adicionar lógica de bump de versão aqui
	@echo "$(YELLOW)⚠ Implementar lógica de bump de versão$(NC)"

doctor: ## Verifica ambiente de desenvolvimento
	@./scripts/check-env.sh

install-env-macos: ## Instala todas as dependências de ambiente no macOS
	@./scripts/install-macos.sh

# Code Quality
format: ## Auto-formata código Kotlin
	@echo "$(BLUE)Formatando código...$(NC)"
	@cd android && ./gradlew ktlintFormat
	@echo "$(GREEN)✓ Código formatado$(NC)"

lint: ## Verifica estilo de código (ktlint + detekt + Android lint)
	@echo "$(BLUE)Executando análise de código...$(NC)"
	@cd android && ./gradlew ktlintCheck detekt lint
	@echo "$(GREEN)✓ Análise concluída$(NC)"

analyze: ## Análise estática completa
	@./scripts/code-quality.sh

test-coverage: ## Gera relatório de code coverage
	@echo "$(BLUE)Gerando relatório de coverage...$(NC)"
	@cd android && ./gradlew jacocoTestReport
	@echo "$(GREEN)✓ Relatório gerado$(NC)"
	@echo "$(YELLOW)View report: mobile/android/app/build/reports/jacoco/jacocoTestReport/html/index.html$(NC)"

coverage-check: ## Verifica se coverage está acima de 80%
	@cd android && ./gradlew coverageCheck

install-hooks: ## Instala Git hooks (pre-commit, commit-msg, pre-push)
	@./scripts/install-git-hooks.sh

# Target padrão
.DEFAULT_GOAL := help
