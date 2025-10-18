# GitHub Actions Workflows - AlcaHub Mobile

Workflows de CI/CD automatizados para build, teste e deploy dos apps mobile.

## Workflows Disponíveis

### 1. android-dev.yml - Build Dev em PRs

**Trigger:** Pull Requests para `develop` ou `main` que modificam:
- `mobile/android/**`
- `frontend/src/**`

**O que faz:**
- ✅ Build APK devDebug
- ✅ Executa testes unitários
- ✅ Executa lint
- ✅ Faz upload do APK como artifact
- ✅ Comenta no PR com tamanho do APK

**Artifacts gerados:**
- `app-dev-debug-{run_number}.apk` (7 dias)
- Test results (7 dias)

---

### 2. android-prod.yml - Build Produção

**Trigger:**
- Push para `main` que modifica mobile/android ou frontend
- Manual via workflow_dispatch
- Tags `v*`

**O que faz:**
- ✅ Build AAB prodRelease (Play Store)
- ✅ Build APK prodRelease
- ✅ Verifica assinatura do APK
- ✅ Upload artifacts (90 dias)
- ⚠️ Deploy para Play Store (opcional)
- 📦 Cria GitHub Release (se for tag)

**Artifacts gerados:**
- `app-prod-release-bundle-{run_number}.aab` (90 dias)
- `app-prod-release-apk-{run_number}.apk` (90 dias)

**Deploy manual:**
- Vá em Actions → Android Production Build → Run workflow
- Marque "Deploy to Play Store"

---

### 3. mobile-tests.yml - Testes Automatizados

**Trigger:**
- Pull Requests
- Push para `develop` ou `main`

**O que faz:**
- ✅ Executa testes unitários Android
- ✅ Executa lint Android
- ✅ Publica relatório de testes
- ✅ Verifica errors de lint (falha se encontrar)
- ✅ Build check de todas as variantes (devDebug, devRelease, prodDebug)
- ✅ Verifica tamanho dos APKs

---

## Configurar Secrets

Para os workflows funcionarem, configure estes secrets no GitHub:

### Obrigatórios para Produção

```bash
# Android Signing
ANDROID_KEYSTORE_BASE64      # base64 -i release.keystore | pbcopy
ANDROID_KEYSTORE_PASSWORD    # Senha do keystore
ANDROID_KEY_ALIAS            # alcahub-release
ANDROID_KEY_PASSWORD         # Senha da chave
```

### Opcionais

```bash
# Google Services (Firebase, etc)
GOOGLE_SERVICES_JSON         # Conteúdo do google-services.json

# Play Store Deploy
PLAY_STORE_SERVICE_ACCOUNT   # JSON da service account
```

### Como adicionar secrets

1. GitHub → Settings → Secrets and variables → Actions
2. "New repository secret"
3. Adicionar nome e valor
4. Save

---

## Status Badges

Adicione no README.md:

```markdown
![Android Dev](https://github.com/seu-usuario/alca-hub/actions/workflows/android-dev.yml/badge.svg)
![Android Prod](https://github.com/seu-usuario/alca-hub/actions/workflows/android-prod.yml/badge.svg)
![Tests](https://github.com/seu-usuario/alca-hub/actions/workflows/mobile-tests.yml/badge.svg)
```

---

## Workflow de Desenvolvimento

### Feature Branch

1. Crie branch: `git checkout -b feature/nova-feature`
2. Faça mudanças em `mobile/android/`
3. Commit e push
4. Abra PR para `develop`
5. ✅ Workflow `android-dev.yml` executa automaticamente
6. ✅ Workflow `mobile-tests.yml` executa automaticamente
7. Revise PR e merge

### Release para Produção

1. Merge `develop` → `main`
2. ✅ Workflow `android-prod.yml` executa automaticamente
3. APK/AAB ficam disponíveis em Artifacts
4. Deploy manual para Play Store se necessário

### Criar Release com Tag

```bash
# Criar e push tag
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0

# Workflow cria GitHub Release automaticamente
# com APK e AAB anexados
```

---

## Troubleshooting

### Erro: "Keystore not found"

**Causa:** Secret `ANDROID_KEYSTORE_BASE64` não configurado ou inválido

**Solução:**
```bash
# Gerar base64 correto
base64 -i release.keystore | tr -d '\n' > keystore.base64.txt
# Copiar conteúdo e adicionar como secret
```

### Erro: "Signing config not found"

**Causa:** Um dos secrets de signing está faltando

**Solução:** Verifique se todos os 4 secrets estão configurados:
- ANDROID_KEYSTORE_BASE64
- ANDROID_KEYSTORE_PASSWORD
- ANDROID_KEY_ALIAS
- ANDROID_KEY_PASSWORD

### Erro: "Gradle build failed"

**Causa:** Problema no código ou dependências

**Solução:**
1. Teste localmente: `cd mobile/android && ./gradlew build`
2. Verifique logs do workflow em Actions
3. Corrija erros e faça novo push

### Workflow não executa

**Causa:** Paths não modificados ou branch incorreta

**Solução:** Verifique se:
- Modificou arquivos em `mobile/android/` ou `frontend/src/`
- Está na branch correta (develop/main)
- Workflow está habilitado em Actions

---

## Otimizações

### Cache do Gradle

Os workflows usam cache para acelerar builds:

```yaml
cache:
  paths:
    - ~/.gradle/caches
    - ~/.gradle/wrapper
```

Se o cache estiver corrompido:
1. Actions → Caches
2. Delete all caches
3. Próximo build recria o cache

### Build Paralelo

O workflow `mobile-tests.yml` usa matrix strategy para build paralelo:

```yaml
strategy:
  matrix:
    variant: [devDebug, devRelease, prodDebug]
```

Isso executa 3 builds simultaneamente, economizando tempo.

---

## Próximos Passos

- [ ] Adicionar workflow iOS (`.github/workflows/ios-*.yml`)
- [ ] Configurar notificações Slack/Discord
- [ ] Adicionar testes de integração
- [ ] Configurar deploy automático para Play Store em tags
- [ ] Adicionar análise de código (SonarQube, CodeClimate)

---

## Recursos

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Upload Google Play Action](https://github.com/r0adkll/upload-google-play)
- [Fastlane CI](https://docs.fastlane.tools/best-practices/continuous-integration/)

Voltar para [Documentação Mobile](../../mobile/docs/mobile/pipelines.md)
