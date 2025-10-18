# Checklist Profissional - AlcaHub Mobile

Checklist completo para demonstrar maturidade técnica e boas práticas de desenvolvimento mobile em nível sênior.

## 🔐 Segurança e Compliance

### Gerenciamento de Segredos
- [ ] **Nunca commitar segredos** - Audit completo do repositório
  ```bash
  # Verificar histórico completo
  git log --all --full-history --source -- "*.keystore" "*.jks" "*.p12"
  git log -S "password" -S "secret" -S "key" --all

  # Usar git-secrets para prevenir
  brew install git-secrets
  git secrets --install
  git secrets --register-aws
  ```

- [ ] **Implementar .gitignore robusto** - Já feito ✅
  - Validar com: `git status --ignored`

- [ ] **Rotação de chaves** - Documentar procedimento
  - Keystore de desenvolvimento separado de produção
  - Keystore de produção em vault seguro (1Password, AWS Secrets Manager)
  - Backup criptografado em 3 locais diferentes

- [ ] **Code signing** - Validação rigorosa
  ```bash
  # Android - verificar assinatura
  jarsigner -verify -verbose -certs app-release.apk

  # iOS - validar provisioning
  security find-identity -v -p codesigning
  ```

- [ ] **Dependency scanning** - Implementar análise de vulnerabilidades
  ```bash
  # Android
  cd mobile/android
  ./gradlew dependencyCheckAnalyze

  # Adicionar ao CI
  ```

### Proteção de API Keys
- [ ] **Environment variables** - Nunca hardcode
  ```kotlin
  // ❌ MAU
  val API_KEY = "abc123xyz"

  // ✅ BOM
  val API_KEY = BuildConfig.API_KEY
  ```

- [ ] **ProGuard/R8 rules** - Obfuscar código sensível
  ```proguard
  # mobile/android/app/proguard-rules.pro
  -keepclassmembers class **.BuildConfig {
      public static final java.lang.String API_KEY;
  }
  -assumenosideeffects class android.util.Log {
      public static *** d(...);
      public static *** v(...);
  }
  ```

- [ ] **Certificate pinning** - Prevenir MITM
  ```kotlin
  // Implementar SSL pinning
  OkHttpClient.Builder()
      .certificatePinner(
          CertificatePinner.Builder()
              .add("api.alcahub.com.br", "sha256/AAAAAAAAAA...")
              .build()
      )
  ```

---

## 🏗️ Arquitetura e Code Quality

### Estrutura do Código
- [ ] **Clean Architecture** - Separação de camadas
  ```
  app/
  ├── data/           # Data sources, repositories
  ├── domain/         # Business logic, use cases
  ├── presentation/   # UI, ViewModels
  └── di/            # Dependency injection
  ```

- [ ] **SOLID Principles** - Revisar código existente
  - Single Responsibility
  - Open/Closed
  - Liskov Substitution
  - Interface Segregation
  - Dependency Inversion

- [ ] **Design Patterns** - Aplicar quando apropriado
  - Repository Pattern (dados)
  - Observer Pattern (eventos)
  - Factory Pattern (criação)
  - Singleton (instâncias únicas)
  - Strategy Pattern (comportamentos)

### Code Quality Tools
- [ ] **Linters configurados**
  ```bash
  # Android - ktlint
  cd mobile/android
  ./gradlew ktlintCheck ktlintFormat

  # Adicionar ao pre-commit hook
  ```

- [ ] **Static Analysis**
  ```bash
  # Detekt para Kotlin
  ./gradlew detekt

  # Android Lint
  ./gradlew lint
  ```

- [ ] **Code Coverage** - Mínimo 80%
  ```bash
  ./gradlew jacocoTestReport
  # Revisar: app/build/reports/jacoco/
  ```

- [ ] **SonarQube** - Análise contínua
  ```yaml
  # Adicionar ao CI
  - name: SonarQube Scan
    run: ./gradlew sonarqube
  ```

### Testes
- [ ] **Unit Tests** - Coverage > 80%
  ```kotlin
  // Usar MockK para Kotlin
  @Test
  fun `should fetch user data successfully`() = runTest {
      val mockRepo = mockk<UserRepository>()
      coEvery { mockRepo.getUser(any()) } returns Result.success(mockUser)

      val useCase = GetUserUseCase(mockRepo)
      val result = useCase(userId)

      assertTrue(result.isSuccess)
      verify { mockRepo.getUser(userId) }
  }
  ```

- [ ] **Integration Tests**
  ```kotlin
  @RunWith(AndroidJUnit4::class)
  class UserDatabaseTest {
      private lateinit var db: AppDatabase

      @Before
      fun setup() {
          db = Room.inMemoryDatabaseBuilder(
              context, AppDatabase::class.java
          ).build()
      }
  }
  ```

- [ ] **UI Tests** - Espresso/Compose Testing
  ```kotlin
  @Test
  fun loginFlow_successfulLogin_navigatesToHome() {
      composeTestRule.setContent { LoginScreen() }

      composeTestRule.onNodeWithTag("email")
          .performTextInput("user@test.com")
      composeTestRule.onNodeWithTag("password")
          .performTextInput("password123")
      composeTestRule.onNodeWithTag("loginButton")
          .performClick()

      composeTestRule.onNodeWithTag("homeScreen")
          .assertIsDisplayed()
  }
  ```

- [ ] **Screenshot Tests** - Consistência visual
  ```bash
  # Usar Paparazzi ou Shot
  ./gradlew recordPaparazziDebug
  ./gradlew verifyPaparazziDebug
  ```

---

## 🚀 Performance e Otimização

### App Performance
- [ ] **Baseline Profiles** - Otimizar startup
  ```gradle
  // mobile/android/app/build.gradle
  dependencies {
      implementation "androidx.profileinstaller:profileinstaller:1.3.1"
  }
  ```

- [ ] **R8 Full Mode** - Já configurado ✅
  ```gradle
  android {
      buildTypes {
          release {
              minifyEnabled true
              shrinkResources true
              proguardFiles getDefaultProguardFile('proguard-android-optimize.txt')
          }
      }
  }
  ```

- [ ] **APK/AAB Size Analysis**
  ```bash
  # Analisar tamanho
  ./gradlew :app:bundleProdRelease
  bundletool build-apks --bundle=app-prod-release.aab --output=app.apks
  bundletool get-size total --apks=app.apks

  # Meta: < 20 MB
  ```

- [ ] **Memory Leaks** - LeakCanary
  ```gradle
  dependencies {
      debugImplementation "com.squareup.leakcanary:leakcanary-android:2.12"
  }
  ```

- [ ] **Startup Time** - Medição e otimização
  ```bash
  # Medir via ADB
  adb shell am start -W -n br.com.alcahub.app/.MainActivity

  # Meta: < 2 segundos cold start
  ```

### Network Optimization
- [ ] **Response Caching** - OkHttp cache
  ```kotlin
  val cacheSize = 10 * 1024 * 1024L // 10 MB
  val cache = Cache(context.cacheDir, cacheSize)

  OkHttpClient.Builder()
      .cache(cache)
      .addInterceptor(cacheInterceptor)
      .build()
  ```

- [ ] **Connection Pooling** - Reutilizar conexões
  ```kotlin
  OkHttpClient.Builder()
      .connectionPool(ConnectionPool(5, 5, TimeUnit.MINUTES))
  ```

- [ ] **Compression** - Gzip automático
  ```kotlin
  // OkHttp já faz automaticamente
  // Verificar headers: Accept-Encoding: gzip
  ```

---

## 📱 UX e Acessibilidade

### Design System
- [ ] **Componentes reutilizáveis** - Design tokens
  ```kotlin
  // theme/Color.kt
  object AlcaHubColors {
      val Primary = Color(0xFF6200EE)
      val PrimaryVariant = Color(0xFF3700B3)
      val Secondary = Color(0xFF03DAC6)
  }

  // theme/Typography.kt
  val AlcaHubTypography = Typography(
      h1 = TextStyle(fontSize = 24.sp, fontWeight = FontWeight.Bold),
      body1 = TextStyle(fontSize = 16.sp)
  )
  ```

- [ ] **Dark Mode** - Suporte completo
  ```kotlin
  @Composable
  fun AlcaHubTheme(
      darkTheme: Boolean = isSystemInDarkTheme(),
      content: @Composable () -> Unit
  ) {
      val colors = if (darkTheme) DarkColors else LightColors
      MaterialTheme(colors = colors, content = content)
  }
  ```

### Acessibilidade (a11y)
- [ ] **Content Descriptions** - Screen readers
  ```kotlin
  Image(
      painter = painterResource(R.drawable.logo),
      contentDescription = "Logo AlcaHub",
      modifier = Modifier.semantics {
          contentDescription = "Logo da aplicação AlcaHub"
      }
  )
  ```

- [ ] **Tamanhos de Toque** - Mínimo 48dp
  ```kotlin
  Button(
      onClick = { },
      modifier = Modifier
          .heightIn(min = 48.dp)
          .widthIn(min = 48.dp)
  )
  ```

- [ ] **Contraste de Cores** - WCAG AAA
  - Ferramenta: https://webaim.org/resources/contrastchecker/

- [ ] **TalkBack Testing** - Testar com leitor de tela
  ```bash
  # Ativar TalkBack
  adb shell settings put secure enabled_accessibility_services \
    com.google.android.marvin.talkback/.TalkBackService
  ```

---

## 🔄 CI/CD e DevOps

### Continuous Integration
- [ ] **Build Matrix** - Já implementado ✅
  - Testar múltiplas variantes
  - Diferentes versões de API

- [ ] **Automated Testing** - Já configurado ✅
  - Unit tests em cada PR
  - Lint checks obrigatórios
  - Coverage reports

- [ ] **Code Review Guidelines**
  ```markdown
  # .github/PULL_REQUEST_TEMPLATE.md
  ## Descrição
  Descreva as mudanças...

  ## Checklist
  - [ ] Testes adicionados/atualizados
  - [ ] Lint passing
  - [ ] Documentação atualizada
  - [ ] Screenshots (se UI)
  - [ ] Breaking changes documentadas
  ```

### Continuous Deployment
- [ ] **Versionamento Semântico** - MAJOR.MINOR.PATCH
  ```gradle
  // Automatizar bump de versão
  android {
      defaultConfig {
          versionCode = gitCommitCount()
          versionName = "1.2.3"
      }
  }

  fun gitCommitCount(): Int {
      return "git rev-list --count HEAD".execute().trim().toInt()
  }
  ```

- [ ] **Changelog Automático**
  ```bash
  # Usar conventional commits
  git log --oneline --pretty=format:"%s" v1.0.0..HEAD \
    | grep -E "^(feat|fix|refactor|perf):" \
    > CHANGELOG.md
  ```

- [ ] **Beta Distribution** - Firebase App Distribution
  ```bash
  # Fastlane
  firebase_app_distribution(
      app: "1:123456789:android:abc123",
      testers: "team@alcahub.com.br",
      release_notes: "Bug fixes and improvements"
  )
  ```

### Monitoring
- [ ] **Crash Reporting** - Firebase Crashlytics
  ```gradle
  dependencies {
      implementation "com.google.firebase:firebase-crashlytics:18.6.0"
      implementation "com.google.firebase:firebase-analytics:21.5.0"
  }
  ```

- [ ] **Analytics** - Eventos customizados
  ```kotlin
  firebaseAnalytics.logEvent("purchase_completed") {
      param("item_id", itemId)
      param("price", price)
      param("currency", "BRL")
  }
  ```

- [ ] **Performance Monitoring**
  ```kotlin
  val trace = Firebase.performance.newTrace("api_fetch_users")
  trace.start()
  // ... operação ...
  trace.stop()
  ```

- [ ] **ANR Detection** - App Not Responding
  ```kotlin
  // Monitorar e enviar para analytics
  StrictMode.setThreadPolicy(
      StrictMode.ThreadPolicy.Builder()
          .detectAll()
          .penaltyLog()
          .build()
  )
  ```

---

## 📚 Documentação

### Código
- [ ] **KDoc/JavaDoc** - Classes e métodos públicos
  ```kotlin
  /**
   * Fetches user data from the remote API.
   *
   * @param userId The unique identifier of the user
   * @return Result containing User data or error
   * @throws NetworkException if network is unavailable
   */
  suspend fun fetchUser(userId: String): Result<User>
  ```

- [ ] **README.md** - Por módulo
  ```markdown
  # Feature: Authentication

  ## Overview
  Handles user authentication via JWT tokens.

  ## Architecture
  - `LoginViewModel`: UI state management
  - `AuthRepository`: Data layer
  - `TokenManager`: Secure token storage

  ## Testing
  - `LoginViewModelTest`: 95% coverage
  - `AuthRepositoryTest`: Mock API responses
  ```

### Arquitetura
- [ ] **ADR (Architecture Decision Records)**
  ```markdown
  # docs/adr/0001-use-jetpack-compose.md

  ## Status: Accepted

  ## Context
  Precisamos de uma solução moderna para UI...

  ## Decision
  Usar Jetpack Compose...

  ## Consequences
  - Pro: UI declarativa, menos código
  - Con: Curva de aprendizado
  ```

- [ ] **Diagramas C4 Model**
  ```
  docs/architecture/
  ├── context-diagram.png      # Sistema como um todo
  ├── container-diagram.png    # Apps, APIs, DBs
  ├── component-diagram.png    # Módulos internos
  └── code-diagram.png         # Classes principais
  ```

### API Documentation
- [ ] **OpenAPI/Swagger** - Contract-first
  ```yaml
  # docs/api/openapi.yaml
  openapi: 3.0.0
  info:
    title: AlcaHub API
    version: 1.0.0
  paths:
    /api/users/{id}:
      get:
        summary: Get user by ID
        parameters:
          - name: id
            in: path
            required: true
  ```

---

## 🔧 Tooling e Developer Experience

### IDE Configuration
- [ ] **EditorConfig** - Consistência de formatação
  ```ini
  # .editorconfig
  root = true

  [*]
  charset = utf-8
  end_of_line = lf
  insert_final_newline = true
  indent_style = space
  indent_size = 4

  [*.{kt,kts}]
  indent_size = 4

  [*.gradle]
  indent_size = 4
  ```

- [ ] **Code Style** - Exportar e commitar
  ```bash
  # Android Studio → Settings → Code Style → Kotlin
  # Export → mobile/code-style.xml
  ```

### Git Workflow
- [ ] **Git Hooks** - Pre-commit validation
  ```bash
  # .git/hooks/pre-commit
  #!/bin/bash
  ./gradlew ktlintCheck detekt
  if [ $? -ne 0 ]; then
    echo "❌ Lint failed. Fix issues before committing."
    exit 1
  fi
  ```

- [ ] **Conventional Commits** - Mensagens padronizadas
  ```bash
  # Usar commitlint
  npm install -g @commitlint/cli @commitlint/config-conventional

  # Exemplo:
  feat(auth): add biometric authentication
  fix(api): handle network timeout properly
  docs(readme): update setup instructions
  refactor(ui): extract reusable button component
  ```

- [ ] **Branch Protection Rules**
  - Require PR reviews (minimum 1)
  - Require CI checks to pass
  - Require up-to-date branch
  - No force push to main

### Development Scripts
- [ ] **Makefile** - Já criado ✅
  - Adicionar mais comandos úteis:
  ```makefile
  format: ## Format código Kotlin
  	cd mobile/android && ./gradlew ktlintFormat

  analyze: ## Análise estática completa
  	cd mobile/android && ./gradlew detekt lint

  test-coverage: ## Gerar relatório de coverage
  	cd mobile/android && ./gradlew jacocoTestReport
  	open mobile/android/app/build/reports/jacoco/html/index.html

  benchmark: ## Executar benchmarks
  	cd mobile/android && ./gradlew :benchmark:connectedCheck
  ```

---

## 🎯 Métricas e KPIs

### Métricas de Qualidade
- [ ] **Code Coverage** - Target: > 80%
  ```bash
  ./gradlew jacocoTestReport
  # Verificar: build/reports/jacoco/
  ```

- [ ] **Technical Debt** - Medir e reduzir
  ```bash
  # SonarQube
  sonar.technicalDebt.hoursInDay=8
  sonar.technicalDebt.ratingGrid=0.05,0.1,0.2,0.5
  ```

- [ ] **Cyclomatic Complexity** - Max 10 por método
  ```bash
  ./gradlew detekt
  # Verificar regras de complexidade
  ```

### Métricas de Performance
- [ ] **App Startup Time**
  - Cold start: < 2s
  - Warm start: < 1s
  - Hot start: < 500ms

- [ ] **Frame Rate** - Manter 60 FPS
  ```bash
  adb shell dumpsys gfxinfo br.com.alcahub.app
  ```

- [ ] **Memory Usage** - Monitorar leaks
  ```bash
  adb shell dumpsys meminfo br.com.alcahub.app
  ```

- [ ] **Network Efficiency**
  - Response time médio: < 500ms
  - Retry strategy: Exponential backoff
  - Timeout: 30s

### Métricas de Negócio
- [ ] **Crash-Free Rate** - Target: > 99.5%
- [ ] **ANR Rate** - Target: < 0.5%
- [ ] **App Size** - Target: < 20 MB
- [ ] **Retention Rate** - D1, D7, D30

---

## 🌍 Internacionalização e Localização

### i18n
- [ ] **Strings externalizadas** - Nunca hardcode
  ```xml
  <!-- res/values/strings.xml -->
  <string name="app_name">AlcaHub</string>
  <string name="welcome_message">Bem-vindo ao AlcaHub!</string>

  <!-- res/values-en/strings.xml -->
  <string name="welcome_message">Welcome to AlcaHub!</string>
  ```

- [ ] **Plurals**
  ```xml
  <plurals name="numberOfItems">
      <item quantity="one">%d item</item>
      <item quantity="other">%d itens</item>
  </plurals>
  ```

- [ ] **Date/Time Formatting** - Locale-aware
  ```kotlin
  val formatter = DateTimeFormatter
      .ofLocalizedDateTime(FormatStyle.MEDIUM)
      .withLocale(Locale.getDefault())
  ```

### l10n
- [ ] **Right-to-Left (RTL)** - Suporte para árabe/hebraico
  ```xml
  <application
      android:supportsRtl="true">
  ```

- [ ] **Currency Formatting**
  ```kotlin
  val formatter = NumberFormat.getCurrencyInstance(Locale("pt", "BR"))
  formatter.format(price) // R$ 10,50
  ```

---

## 🔒 Compliance e Legal

### LGPD/GDPR
- [ ] **Privacy Policy** - Termos claros
- [ ] **Cookie Consent** - Opt-in explícito
- [ ] **Data Deletion** - Right to be forgotten
- [ ] **Data Export** - Portabilidade de dados
- [ ] **Audit Logs** - Quem acessou o quê e quando

### App Store Guidelines
- [ ] **Content Rating** - Classificação indicativa
- [ ] **Permissions Justification** - Explicar cada permissão
- [ ] **Terms of Service** - Acessível no app
- [ ] **Support Contact** - Email/telefone válidos

---

## 🎓 Conhecimentos Demonstrados

### Mencionar casualmente em conversas
- ✅ "Implementei Baseline Profiles para otimizar o startup time em 40%"
- ✅ "Configurei R8 full mode com ProGuard rules customizadas"
- ✅ "Estamos usando Conventional Commits para automatizar changelogs"
- ✅ "Implementei Certificate Pinning para prevenir MITM attacks"
- ✅ "Code coverage está em 85%, usando JaCoCo + Mockk"
- ✅ "Build matrix testa 4 variantes em paralelo no CI"
- ✅ "ADRs documentam todas as decisões arquiteturais importantes"
- ✅ "Monitoramento com Crashlytics, Analytics e Performance"

### Red Flags para EVITAR
- ❌ Commitar secrets
- ❌ Hardcoded URLs/keys
- ❌ Falta de testes
- ❌ Código sem documentação
- ❌ Dependências desatualizadas
- ❌ Sem tratamento de erros
- ❌ God classes (> 500 linhas)
- ❌ Logs de debug em produção
- ❌ Force push em main
- ❌ Sem code review

---

## 📊 Dashboard de Status

Use este comando para gerar relatório:

```bash
# mobile/scripts/senior-check.sh
#!/bin/bash
echo "🎯 AlcaHub Mobile - Status Report"
echo "================================="
echo ""

# Code Coverage
coverage=$(./gradlew jacocoTestReport 2>/dev/null | grep -o "[0-9]*%" | head -1)
echo "📊 Code Coverage: ${coverage:-N/A}"

# APK Size
apk_size=$(du -h mobile/android/app/build/outputs/apk/prod/release/*.apk 2>/dev/null | cut -f1)
echo "📦 APK Size: ${apk_size:-N/A}"

# Lint Issues
lint_errors=$(./gradlew lint 2>/dev/null | grep "errors" | grep -o "[0-9]* errors")
echo "🔍 Lint: ${lint_errors:-0 errors}"

# Dependencies
outdated=$(./gradlew dependencyUpdates 2>/dev/null | grep "outdated dependencies" | wc -l)
echo "📚 Outdated deps: ${outdated}"

# Git
commits_today=$(git log --since="midnight" --oneline | wc -l)
echo "💻 Commits today: ${commits_today}"

echo ""
echo "✅ Run 'make doctor' for full health check"
```

---

## 🎯 Prioridade Máxima (Fazer PRIMEIRO)

1. **Segurança** ⭐⭐⭐⭐⭐
   - [ ] Audit git history para secrets
   - [ ] Implementar certificate pinning
   - [ ] Code obfuscation (R8/ProGuard)

2. **Testes** ⭐⭐⭐⭐⭐
   - [ ] Unit tests > 80% coverage
   - [ ] Integration tests principais fluxos
   - [ ] UI tests telas críticas

3. **CI/CD** ⭐⭐⭐⭐
   - [ ] Configurar secrets no GitHub
   - [ ] Testar workflows completos
   - [ ] Deploy automático funcionando

4. **Documentação** ⭐⭐⭐⭐
   - [ ] README.md profissional
   - [ ] ADRs principais decisões
   - [ ] API documentation atualizada

5. **Code Quality** ⭐⭐⭐
   - [ ] Lint passing sem warnings
   - [ ] Static analysis (Detekt)
   - [ ] Code review checklist

---

## 💡 Dicas Finais

### Para impressionar em code review:
- Comente decisões não-óbvias
- Mencione trade-offs considerados
- Sugira melhorias proativamente
- Cite fontes (Android Dev Guide, RFC, etc)

### Vocabulário sênior:
- "Separation of concerns"
- "Single source of truth"
- "Idempotent operations"
- "Eventual consistency"
- "Circuit breaker pattern"
- "Defensive programming"
- "Contract testing"

### Antes de qualquer commit:
```bash
# Script pre-push
git diff --cached | grep -E "TODO|FIXME|XXX|HACK"
git diff --cached | grep -i "password\|secret\|key\|token"
./gradlew ktlintCheck detekt test
```

---

**Criado por:** Sistema AlcaHub
**Última atualização:** 2025-01-18
**Versão:** 1.0.0

*"Code is read more often than it is written. Write for humans, not machines."*
