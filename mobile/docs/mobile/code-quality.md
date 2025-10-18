# Code Quality - AlcaHub Mobile

Guia completo das ferramentas de qualidade de código implementadas no projeto.

## 🎯 Visão Geral

O projeto AlcaHub Mobile implementa múltiplas camadas de verificação de qualidade de código para garantir:

- ✅ **Consistência** - Código segue padrões definidos
- ✅ **Manutenibilidade** - Código fácil de entender e modificar
- ✅ **Confiabilidade** - Testes garantem funcionalidade
- ✅ **Performance** - Código otimizado e eficiente
- ✅ **Segurança** - Sem vulnerabilidades conhecidas

## 🛠️ Ferramentas Implementadas

### 1. ktlint - Estilo de Código Kotlin

**O que faz:** Verifica e formata código Kotlin seguindo padrões oficiais.

**Configuração:** `mobile/android/build.gradle`

**Uso:**

```bash
# Verificar estilo
cd mobile
make lint
# ou
cd mobile/android && ./gradlew ktlintCheck

# Auto-corrigir
make format
# ou
cd mobile/android && ./gradlew ktlintFormat
```

**Regras principais:**
- Indentação: 4 espaços
- Max line length: 120 caracteres
- Sem imports não utilizados
- Sem wildcard imports (`import java.util.*`)
- Ordenação de imports

**Exemplo de erro:**

```kotlin
// ❌ Errado
import java.util.*

class MyClass{
  fun myFunction( x:Int ){ }
}

// ✅ Correto
import java.util.ArrayList

class MyClass {
    fun myFunction(x: Int) { }
}
```

---

### 2. Detekt - Análise Estática

**O que faz:** Detecta code smells, complexidade, bugs potenciais.

**Configuração:** `mobile/android/config/detekt/detekt.yml`

**Uso:**

```bash
cd mobile/android
./gradlew detekt

# View report
open build/reports/detekt/detekt.html
```

**Verificações principais:**

#### Complexidade
- **ComplexMethod**: Máximo 15 linhas por método
- **LongParameterList**: Máximo 6 parâmetros
- **LongMethod**: Máximo 60 linhas
- **NestedBlockDepth**: Máximo 4 níveis de aninhamento

#### Performance
- **ArrayPrimitive**: Use IntArray ao invés de Array<Int>
- **ForEachOnRange**: Use for loop ao invés de forEach em ranges
- **UnnecessaryTemporaryInstantiation**: Evite objetos temporários

#### Potential Bugs
- **UnsafeCallOnNullableType**: Nullability não checado
- **UnreachableCode**: Código nunca executado
- **EqualsWithHashCodeExist**: override equals sem hashCode

#### Style
- **MagicNumber**: Evite números mágicos
- **ReturnCount**: Máximo 2 returns por função
- **ForbiddenComment**: Detecta TODO/FIXME/STOPSHIP

**Exemplo:**

```kotlin
// ❌ Code smell detectado
fun calculatePrice(items: List<Item>): Double {
    var total = 0.0
    for (item in items) {
        if (item.discount > 0) {
            if (item.category == "electronics") {
                if (item.brand == "Samsung") {
                    total += item.price * 0.8 // Magic number!
                } else {
                    total += item.price * 0.9
                }
            } else {
                total += item.price * 0.95
            }
        } else {
            total += item.price
        }
    }
    return total
}

// ✅ Refatorado
private const val SAMSUNG_DISCOUNT = 0.8
private const val ELECTRONICS_DISCOUNT = 0.9
private const val REGULAR_DISCOUNT = 0.95

fun calculatePrice(items: List<Item>): Double {
    return items.sumOf { it.calculateFinalPrice() }
}

private fun Item.calculateFinalPrice(): Double {
    if (discount <= 0) return price

    val discountRate = when {
        category == "electronics" && brand == "Samsung" -> SAMSUNG_DISCOUNT
        category == "electronics" -> ELECTRONICS_DISCOUNT
        else -> REGULAR_DISCOUNT
    }

    return price * discountRate
}
```

---

### 3. Android Lint

**O que faz:** Verifica problemas específicos do Android (performance, segurança, compatibilidade).

**Uso:**

```bash
cd mobile/android
./gradlew lint

# View report
open app/build/reports/lint-results.html
```

**Verificações principais:**
- **Performance**: Overdraw, memory leaks, wakelock
- **Security**: Hardcoded passwords, exported components
- **Correctness**: Wrong call, typos, missing translations
- **Accessibility**: Missing contentDescription, low contrast
- **Usability**: Missing min/max SDK, icon issues

---

### 4. JaCoCo - Code Coverage

**O que faz:** Mede cobertura de testes unitários.

**Target:** Mínimo 80% de cobertura

**Uso:**

```bash
# Gerar relatório
cd mobile
make test-coverage

# Verificar threshold
make coverage-check

# View report
open mobile/android/app/build/reports/jacoco/jacocoTestReport/html/index.html
```

**Arquivos excluídos do coverage:**
- Generated files (R.java, BuildConfig)
- Android framework classes
- Data models (POJOs)
- Dependency injection
- Test classes

**Exemplo de relatório:**

```
Package                    Coverage
--------------------------------
com.alcahub.app.auth       92%  ✅
com.alcahub.app.api        85%  ✅
com.alcahub.app.ui         78%  ⚠️
com.alcahub.app.utils      95%  ✅
--------------------------------
TOTAL                      87%  ✅
```

---

### 5. EditorConfig

**O que faz:** Mantém consistência de formatação entre diferentes editores/IDEs.

**Arquivo:** `.editorconfig` (na raiz do projeto)

**Configurações:**
- Charset: UTF-8
- End of line: LF
- Insert final newline: true
- Trim trailing whitespace: true
- Indent: 4 spaces (Kotlin/Java), 2 spaces (XML/JSON)

**IDEs suportados:** Android Studio, IntelliJ IDEA, VS Code, Sublime Text

---

## 🔗 Git Hooks

Hooks automáticos que executam verificações antes de commit/push.

### Instalação

```bash
cd mobile
make install-hooks
```

### Hooks Disponíveis

#### Pre-commit
Executa **antes** de cada commit:

- ✅ Verifica secrets (passwords, tokens, keys)
- ✅ ktlint (style check)
- ✅ Detekt (static analysis)
- ⚠️ Conta TODO/FIXME (warning apenas)

**Bypass (não recomendado):**
```bash
git commit --no-verify
```

#### Commit-msg
Valida **mensagem** do commit (Conventional Commits):

Formato esperado:
```
type(scope): subject

Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore
```

**Exemplos válidos:**
```bash
git commit -m "feat(auth): add biometric authentication"
git commit -m "fix(api): handle network timeout properly"
git commit -m "docs(readme): update installation steps"
git commit -m "refactor: extract button component"
```

**Exemplos inválidos:**
```bash
git commit -m "fixed bug"           # ❌ Sem tipo
git commit -m "Added new feature"   # ❌ Primeira letra maiúscula
git commit -m "fix:no space"        # ❌ Sem espaço após ':'
```

#### Pre-push
Executa **antes** de push para remote:

- ✅ Unit tests
- ✅ Android lint
- ⏱️ ~2-5 minutos

---

## 📊 Script de Análise Completa

### Code Quality Dashboard

```bash
cd mobile
make analyze
```

**O que executa:**

1. ✅ ktlint check
2. ✅ Detekt analysis
3. ✅ Android lint
4. ✅ Unit tests
5. ⚠️ Dependencies check
6. 📦 APK size analysis
7. 📊 Code coverage

**Output exemplo:**

```
╔════════════════════════════════════════╗
║  Code Quality Analysis - AlcaHub Mobile  ║
╚════════════════════════════════════════╝

[1/7] Running ktlint...
✓ ktlint: No style violations found

[2/7] Running detekt...
⚠ detekt: Found 3 potential issues

[3/7] Running Android lint...
✓ Android lint: 0 errors, 5 warnings

[4/7] Running unit tests...
✓ Unit tests: 127 tests passed

[5/7] Checking dependencies...
⚠ Dependencies: 2 outdated dependencies

[6/7] Analyzing APK size...
✓ APK size: 18.4 MB (good)

[7/7] Checking code coverage...
✓ Code coverage: 87% (excellent)

╔════════════════════════════════════════╗
║            Summary Report              ║
╚════════════════════════════════════════╝

Total Checks:    7
Passed:          5
Failed:          0
Warnings:        2

Quality Score:   ██████████ 85% (Good)

✅ Quality check PASSED
```

---

## 📋 Checklist de Qualidade

### Antes de Commitar

- [ ] Código compila sem erros
- [ ] Testes unitários passam
- [ ] ktlint sem violações
- [ ] Detekt sem issues críticos
- [ ] Sem TODO/FIXME sem issue tracking
- [ ] Sem código comentado
- [ ] Sem debug logs (`Log.d`, `println`)
- [ ] Commit message segue Conventional Commits

### Antes de Abrir PR

- [ ] Todos os checks do pre-commit ✅
- [ ] Coverage > 80% para código novo
- [ ] Android lint sem erros
- [ ] Testes de integração passam
- [ ] APK size < 50 MB
- [ ] Screenshots para mudanças de UI
- [ ] Documentação atualizada

### Antes de Mergear

- [ ] Code review aprovado
- [ ] CI/CD pipeline verde
- [ ] Sem conflitos com main
- [ ] Changelog atualizado
- [ ] Versão incrementada (se necessário)

---

## 🚀 Comandos Rápidos

```bash
# Makefile commands (na pasta mobile/)
make format              # Auto-format código
make lint                # Verificar estilo
make analyze             # Análise completa
make test-coverage       # Coverage report
make coverage-check      # Verificar threshold 80%
make install-hooks       # Instalar git hooks

# Gradle commands (na pasta mobile/android/)
./gradlew ktlintCheck    # Style check
./gradlew ktlintFormat   # Auto-format
./gradlew detekt         # Static analysis
./gradlew lint           # Android lint
./gradlew test           # Unit tests
./gradlew jacocoTestReport  # Coverage

# Combinações úteis
./gradlew ktlintCheck detekt lint test  # Full check
./gradlew ktlintFormat test              # Format + test
```

---

## 🎯 Metas de Qualidade

| Métrica | Target | Atual | Status |
|---------|--------|-------|--------|
| Code Coverage | > 80% | 87% | ✅ |
| Lint Errors | 0 | 0 | ✅ |
| Detekt Issues | < 10 | 3 | ✅ |
| APK Size | < 20 MB | 18.4 MB | ✅ |
| Build Time | < 2 min | 1m 45s | ✅ |
| Test Pass Rate | 100% | 100% | ✅ |

---

## 🔧 Troubleshooting

### ktlint falha mas não mostra erros

```bash
# Ver output completo
cd mobile/android
./gradlew ktlintCheck --stacktrace

# Forçar format
./gradlew ktlintFormat
```

### Detekt muito rigoroso

Edite `mobile/android/config/detekt/detekt.yml`:

```yaml
# Desabilitar regra específica
complexity:
  LongMethod:
    active: false  # Desabilita verificação de métodos longos
```

Ou crie baseline para ignorar issues existentes:

```bash
cd mobile/android
./gradlew detektBaseline
```

### Coverage não alcança 80%

1. Adicione testes para classes principais
2. Exclua arquivos gerados do relatório
3. Foque em lógica de negócio (não UI)

Edite exclusões em `mobile/android/app/build.gradle`:

```gradle
def fileFilter = [
    '**/MyGeneratedClass.class',  // Adicione aqui
    // ... outros
]
```

### Hooks muito lentos

Ajuste `mobile/scripts/install-git-hooks.sh` para executar apenas checks críticos:

```bash
# Comentar verificações não-essenciais
# ./gradlew detekt > /dev/null 2>&1
```

---

## 📚 Recursos

- [ktlint](https://github.com/pinterest/ktlint)
- [Detekt](https://detekt.dev/)
- [Android Lint](https://developer.android.com/studio/write/lint)
- [JaCoCo](https://www.jacoco.org/jacoco/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [EditorConfig](https://editorconfig.org/)

---

## 🎓 Boas Práticas

### DOs ✅

- Commitar código formatado
- Escrever testes antes de implementar (TDD)
- Manter cobertura > 80%
- Seguir Conventional Commits
- Revisar relatórios de detekt
- Executar `make analyze` antes de PR

### DON'Ts ❌

- Não commitar código com warnings
- Não fazer bypass de hooks sem motivo
- Não deixar TODO sem issue
- Não commitar debug logs
- Não ignorar relatórios de coverage
- Não fazer force push sem code review

---

**Última atualização:** 2025-01-18
**Versão:** 1.0.0

*"Quality is not an act, it is a habit." - Aristotle*
