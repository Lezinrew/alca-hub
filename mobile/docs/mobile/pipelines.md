# CI/CD Pipelines - AlcaHub Mobile

Guia completo de pipelines de CI/CD para builds automatizados, testes e deploys dos apps mobile.

## Índice

- [GitHub Actions](#github-actions)
- [GitLab CI](#gitlab-ci)
- [Bitbucket Pipelines](#bitbucket-pipelines)
- [Configuração de Secrets](#configuração-de-secrets)
- [Estratégia de Branches](#estratégia-de-branches)
- [Notificações](#notificações)

---

## GitHub Actions

### Estrutura de Workflows

```
.github/
└── workflows/
    ├── android-dev.yml          # Build dev em PRs
    ├── android-prod.yml         # Build prod em main
    ├── ios-dev.yml              # Build iOS dev
    ├── ios-prod.yml             # Build iOS prod
    └── mobile-tests.yml         # Testes automatizados
```

### Android Dev - Build em Pull Requests

Arquivo: `.github/workflows/android-dev.yml`

```yaml
name: Android Dev Build

on:
  pull_request:
    branches: [develop, main]
    paths:
      - 'mobile/android/**'
      - 'frontend/src/**'
      - '.github/workflows/android-dev.yml'

jobs:
  build-dev:
    name: Build Android Dev
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: 'gradle'

      - name: Cache Gradle packages
        uses: actions/cache@v3
        with:
          path: |
            ~/.gradle/caches
            ~/.gradle/wrapper
          key: ${{ runner.os }}-gradle-${{ hashFiles('**/*.gradle*', '**/gradle-wrapper.properties') }}
          restore-keys: |
            ${{ runner.os }}-gradle-

      - name: Grant execute permission for gradlew
        run: chmod +x mobile/android/gradlew

      - name: Build Dev Debug APK
        run: |
          cd mobile/android
          ./gradlew assembleDevDebug --stacktrace

      - name: Run Unit Tests
        run: |
          cd mobile/android
          ./gradlew testDevDebugUnitTest

      - name: Run Lint
        run: |
          cd mobile/android
          ./gradlew lintDevDebug

      - name: Upload APK
        uses: actions/upload-artifact@v4
        with:
          name: app-dev-debug-${{ github.run_number }}
          path: mobile/android/app/build/outputs/apk/dev/debug/app-dev-debug.apk
          retention-days: 7

      - name: Upload Test Results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results-${{ github.run_number }}
          path: mobile/android/app/build/test-results/
          retention-days: 7

      - name: Comment PR with APK
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            const fs = require('fs');
            const apkSize = fs.statSync('mobile/android/app/build/outputs/apk/dev/debug/app-dev-debug.apk').size;
            const apkSizeMB = (apkSize / 1024 / 1024).toFixed(2);

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `✅ **Android Dev Build Successful**\n\n` +
                    `📦 APK Size: ${apkSizeMB} MB\n` +
                    `🔗 Download: [Artifacts](https://github.com/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId})`
            });
```

### Android Prod - Build e Deploy

Arquivo: `.github/workflows/android-prod.yml`

```yaml
name: Android Production Build

on:
  push:
    branches: [main]
    paths:
      - 'mobile/android/**'
      - 'frontend/src/**'
  workflow_dispatch:
    inputs:
      deploy_to_play_store:
        description: 'Deploy to Play Store'
        required: true
        type: boolean
        default: false

jobs:
  build-prod:
    name: Build Android Production
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: 'gradle'

      - name: Decode Keystore
        run: |
          echo "${{ secrets.ANDROID_KEYSTORE_BASE64 }}" | base64 -d > release.keystore

      - name: Create keystore.properties
        run: |
          cd mobile/android
          cat > keystore.properties << EOF
          keyAlias=${{ secrets.ANDROID_KEY_ALIAS }}
          keyPassword=${{ secrets.ANDROID_KEY_PASSWORD }}
          storeFile=${{ github.workspace }}/release.keystore
          storePassword=${{ secrets.ANDROID_KEYSTORE_PASSWORD }}
          EOF

      - name: Create google-services.json
        run: |
          cd mobile/android/app
          echo '${{ secrets.GOOGLE_SERVICES_JSON }}' > google-services.json

      - name: Build Production Release Bundle
        run: |
          cd mobile/android
          ./gradlew bundleProdRelease --stacktrace

      - name: Build Production Release APK
        run: |
          cd mobile/android
          ./gradlew assembleProdRelease --stacktrace

      - name: Sign APK
        run: |
          cd mobile/android/app/build/outputs/apk/prod/release
          echo "APK already signed by Gradle"

      - name: Verify APK Signature
        run: |
          jarsigner -verify -verbose -certs mobile/android/app/build/outputs/apk/prod/release/app-prod-release.apk

      - name: Upload Bundle
        uses: actions/upload-artifact@v4
        with:
          name: app-prod-release-bundle-${{ github.run_number }}
          path: mobile/android/app/build/outputs/bundle/prodRelease/app-prod-release.aab
          retention-days: 90

      - name: Upload APK
        uses: actions/upload-artifact@v4
        with:
          name: app-prod-release-apk-${{ github.run_number }}
          path: mobile/android/app/build/outputs/apk/prod/release/app-prod-release.apk
          retention-days: 90

      - name: Deploy to Play Store Internal Testing
        if: ${{ github.event.inputs.deploy_to_play_store == 'true' || github.ref == 'refs/heads/main' }}
        uses: r0adkll/upload-google-play@v1
        with:
          serviceAccountJsonPlainText: ${{ secrets.PLAY_STORE_SERVICE_ACCOUNT }}
          packageName: br.com.alcahub.app
          releaseFiles: mobile/android/app/build/outputs/bundle/prodRelease/app-prod-release.aab
          track: internal
          status: completed

      - name: Create Release
        if: startsWith(github.ref, 'refs/tags/')
        uses: softprops/action-gh-release@v1
        with:
          files: |
            mobile/android/app/build/outputs/apk/prod/release/app-prod-release.apk
            mobile/android/app/build/outputs/bundle/prodRelease/app-prod-release.aab
          generate_release_notes: true
```

### iOS Dev - Build

Arquivo: `.github/workflows/ios-dev.yml`

```yaml
name: iOS Dev Build

on:
  pull_request:
    branches: [develop, main]
    paths:
      - 'mobile/ios/**'
      - 'frontend/src/**'
      - '.github/workflows/ios-dev.yml'

jobs:
  build-dev:
    name: Build iOS Dev
    runs-on: macos-14

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.2'
          bundler-cache: true
          working-directory: mobile/ios

      - name: Install CocoaPods dependencies
        run: |
          cd mobile/ios/App
          pod install --repo-update

      - name: Setup Xcode
        uses: maxim-lobanov/setup-xcode@v1
        with:
          xcode-version: '15.2'

      - name: Build iOS Debug
        run: |
          cd mobile/ios
          xcodebuild -workspace App/App.xcworkspace \
            -scheme App \
            -configuration Debug \
            -destination 'platform=iOS Simulator,name=iPhone 15,OS=17.2' \
            -derivedDataPath build \
            clean build

      - name: Run Tests
        run: |
          cd mobile/ios
          xcodebuild test \
            -workspace App/App.xcworkspace \
            -scheme App \
            -destination 'platform=iOS Simulator,name=iPhone 15,OS=17.2' \
            -derivedDataPath build

      - name: Upload Build Artifacts
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: ios-dev-build-${{ github.run_number }}
          path: mobile/ios/build/Build/Products/Debug-iphonesimulator/
          retention-days: 7
```

### iOS Prod - Build e Deploy TestFlight

Arquivo: `.github/workflows/ios-prod.yml`

```yaml
name: iOS Production Build

on:
  push:
    branches: [main]
    paths:
      - 'mobile/ios/**'
      - 'frontend/src/**'
  workflow_dispatch:
    inputs:
      deploy_to_testflight:
        description: 'Deploy to TestFlight'
        required: true
        type: boolean
        default: false

jobs:
  build-prod:
    name: Build iOS Production
    runs-on: macos-14

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.2'
          bundler-cache: true
          working-directory: mobile/ios

      - name: Install CocoaPods dependencies
        run: |
          cd mobile/ios/App
          pod install --repo-update

      - name: Setup Xcode
        uses: maxim-lobanov/setup-xcode@v1
        with:
          xcode-version: '15.2'

      - name: Import Code Signing Certificate
        uses: apple-actions/import-codesign-certs@v2
        with:
          p12-file-base64: ${{ secrets.IOS_DISTRIBUTION_CERT_P12 }}
          p12-password: ${{ secrets.IOS_CERT_PASSWORD }}

      - name: Download Provisioning Profile
        run: |
          mkdir -p ~/Library/MobileDevice/Provisioning\ Profiles
          echo "${{ secrets.IOS_PROVISIONING_PROFILE_BASE64 }}" | base64 -d > ~/Library/MobileDevice/Provisioning\ Profiles/profile.mobileprovision

      - name: Update Team ID in xcconfig
        run: |
          cd mobile/ios/Config
          sed -i '' 's/DEVELOPMENT_TEAM = .*/DEVELOPMENT_TEAM = ${{ secrets.IOS_TEAM_ID }}/' Release.xcconfig

      - name: Build iOS Release
        run: |
          cd mobile/ios
          xcodebuild -workspace App/App.xcworkspace \
            -scheme App \
            -configuration Release \
            -archivePath build/App.xcarchive \
            clean archive

      - name: Export IPA
        run: |
          cd mobile/ios
          xcodebuild -exportArchive \
            -archivePath build/App.xcarchive \
            -exportPath build \
            -exportOptionsPlist ExportOptions.plist

      - name: Upload IPA
        uses: actions/upload-artifact@v4
        with:
          name: app-ios-release-${{ github.run_number }}
          path: mobile/ios/build/App.ipa
          retention-days: 90

      - name: Deploy to TestFlight
        if: ${{ github.event.inputs.deploy_to_testflight == 'true' || github.ref == 'refs/heads/main' }}
        run: |
          cd mobile/ios
          bundle exec fastlane ios beta
        env:
          FASTLANE_USER: ${{ secrets.APPLE_ID }}
          FASTLANE_PASSWORD: ${{ secrets.APPLE_PASSWORD }}
          FASTLANE_APPLE_APPLICATION_SPECIFIC_PASSWORD: ${{ secrets.APPLE_APP_SPECIFIC_PASSWORD }}
```

### Testes Automatizados

Arquivo: `.github/workflows/mobile-tests.yml`

```yaml
name: Mobile Tests

on:
  pull_request:
    branches: [develop, main]
  push:
    branches: [develop, main]

jobs:
  android-tests:
    name: Android Unit Tests
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: 'gradle'

      - name: Run Unit Tests
        run: |
          cd mobile/android
          ./gradlew test --continue

      - name: Run Lint
        run: |
          cd mobile/android
          ./gradlew lint

      - name: Publish Test Report
        uses: mikepenz/action-junit-report@v4
        if: always()
        with:
          report_paths: '**/build/test-results/**/TEST-*.xml'
          check_name: Android Test Report

  ios-tests:
    name: iOS Unit Tests
    runs-on: macos-14

    steps:
      - uses: actions/checkout@v4

      - name: Set up Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.2'
          bundler-cache: true
          working-directory: mobile/ios

      - name: Install CocoaPods
        run: |
          cd mobile/ios/App
          pod install

      - name: Run Tests
        run: |
          cd mobile/ios
          xcodebuild test \
            -workspace App/App.xcworkspace \
            -scheme App \
            -destination 'platform=iOS Simulator,name=iPhone 15' \
            -resultBundlePath TestResults

      - name: Publish Test Report
        uses: kishikawakatsumi/xcresulttool@v1
        if: always()
        with:
          path: mobile/ios/TestResults.xcresult
```

---

## GitLab CI

Arquivo: `.gitlab-ci.yml`

```yaml
stages:
  - test
  - build
  - deploy

variables:
  GRADLE_OPTS: "-Dorg.gradle.daemon=false"
  ANDROID_COMPILE_SDK: "34"
  ANDROID_BUILD_TOOLS: "34.0.0"

# Cache do Gradle
.gradle_cache:
  cache:
    key: ${CI_PROJECT_ID}-gradle
    paths:
      - mobile/android/.gradle/
      - mobile/android/build/
      - ~/.gradle/

# Template Android
.android_job:
  image: mingc/android-build-box:latest
  extends: .gradle_cache
  before_script:
    - cd mobile/android
    - chmod +x ./gradlew

# Testes Android
android:test:
  extends: .android_job
  stage: test
  script:
    - ./gradlew test lint
  artifacts:
    reports:
      junit: mobile/android/app/build/test-results/**/TEST-*.xml
    paths:
      - mobile/android/app/build/reports/

# Build Android Dev
android:build:dev:
  extends: .android_job
  stage: build
  script:
    - ./gradlew assembleDevDebug
  artifacts:
    paths:
      - mobile/android/app/build/outputs/apk/dev/debug/app-dev-debug.apk
    expire_in: 1 week
  only:
    - merge_requests
    - develop

# Build Android Prod
android:build:prod:
  extends: .android_job
  stage: build
  script:
    - echo "$ANDROID_KEYSTORE_BASE64" | base64 -d > release.keystore
    - |
      cat > keystore.properties << EOF
      keyAlias=$ANDROID_KEY_ALIAS
      keyPassword=$ANDROID_KEY_PASSWORD
      storeFile=$CI_PROJECT_DIR/release.keystore
      storePassword=$ANDROID_KEYSTORE_PASSWORD
      EOF
    - echo "$GOOGLE_SERVICES_JSON" > app/google-services.json
    - ./gradlew bundleProdRelease assembleProdRelease
  artifacts:
    paths:
      - mobile/android/app/build/outputs/bundle/prodRelease/app-prod-release.aab
      - mobile/android/app/build/outputs/apk/prod/release/app-prod-release.apk
    expire_in: 90 days
  only:
    - main
    - tags

# Deploy Android para Play Store
android:deploy:internal:
  extends: .android_job
  stage: deploy
  script:
    - echo "Deploy to Play Store Internal Testing"
    - bundle exec fastlane android beta
  only:
    - main
  when: manual

# iOS Jobs
ios:test:
  stage: test
  tags:
    - macos
  script:
    - cd mobile/ios
    - bundle install
    - cd App && pod install && cd ..
    - xcodebuild test -workspace App/App.xcworkspace -scheme App -destination 'platform=iOS Simulator,name=iPhone 15'
  only:
    - merge_requests
    - develop
    - main

ios:build:dev:
  stage: build
  tags:
    - macos
  script:
    - cd mobile/ios
    - bundle install
    - cd App && pod install && cd ..
    - xcodebuild -workspace App/App.xcworkspace -scheme App -configuration Debug clean build
  artifacts:
    paths:
      - mobile/ios/build/
    expire_in: 1 week
  only:
    - merge_requests
    - develop

ios:build:prod:
  stage: build
  tags:
    - macos
  script:
    - cd mobile/ios
    - bundle install
    - cd App && pod install && cd ..
    - bundle exec fastlane ios build_release
  artifacts:
    paths:
      - mobile/ios/build/App.ipa
    expire_in: 90 days
  only:
    - main
    - tags

ios:deploy:testflight:
  stage: deploy
  tags:
    - macos
  script:
    - cd mobile/ios
    - bundle exec fastlane ios beta
  only:
    - main
  when: manual
```

---

## Bitbucket Pipelines

Arquivo: `bitbucket-pipelines.yml`

```yaml
image: mingc/android-build-box:latest

definitions:
  caches:
    gradle: mobile/android/.gradle

  steps:
    - step: &android-test
        name: Android Unit Tests
        caches:
          - gradle
        script:
          - cd mobile/android
          - chmod +x ./gradlew
          - ./gradlew test lint
        artifacts:
          - mobile/android/app/build/test-results/**
          - mobile/android/app/build/reports/**

    - step: &android-build-dev
        name: Build Android Dev
        caches:
          - gradle
        script:
          - cd mobile/android
          - chmod +x ./gradlew
          - ./gradlew assembleDevDebug
        artifacts:
          - mobile/android/app/build/outputs/apk/dev/debug/*.apk

    - step: &android-build-prod
        name: Build Android Prod
        caches:
          - gradle
        script:
          - cd mobile/android
          - echo "$ANDROID_KEYSTORE_BASE64" | base64 -d > release.keystore
          - |
            cat > keystore.properties << EOF
            keyAlias=$ANDROID_KEY_ALIAS
            keyPassword=$ANDROID_KEY_PASSWORD
            storeFile=$BITBUCKET_CLONE_DIR/release.keystore
            storePassword=$ANDROID_KEYSTORE_PASSWORD
            EOF
          - chmod +x ./gradlew
          - ./gradlew bundleProdRelease assembleProdRelease
        artifacts:
          - mobile/android/app/build/outputs/bundle/prodRelease/*.aab
          - mobile/android/app/build/outputs/apk/prod/release/*.apk

pipelines:
  pull-requests:
    '**':
      - step: *android-test
      - step: *android-build-dev

  branches:
    develop:
      - step: *android-test
      - step: *android-build-dev

    main:
      - step: *android-test
      - step: *android-build-prod
      - step:
          name: Deploy to Play Store
          deployment: production
          trigger: manual
          script:
            - cd mobile/android
            - bundle install
            - bundle exec fastlane android beta

  tags:
    'v*':
      - step: *android-build-prod
      - step:
          name: Create Release
          script:
            - echo "Creating release for $BITBUCKET_TAG"
```

---

## Configuração de Secrets

### GitHub Actions

Em: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

```bash
# Android
ANDROID_KEYSTORE_BASE64      # base64 do keystore: base64 -i keystore.jks
ANDROID_KEYSTORE_PASSWORD    # Senha do keystore
ANDROID_KEY_ALIAS            # Alias da chave
ANDROID_KEY_PASSWORD         # Senha da chave
GOOGLE_SERVICES_JSON         # Conteúdo do google-services.json
PLAY_STORE_SERVICE_ACCOUNT   # JSON da service account do Play Console

# iOS
IOS_DISTRIBUTION_CERT_P12    # base64 do certificado: base64 -i cert.p12
IOS_CERT_PASSWORD            # Senha do certificado
IOS_PROVISIONING_PROFILE_BASE64  # base64 do .mobileprovision
IOS_TEAM_ID                  # Team ID da Apple
APPLE_ID                     # Apple ID email
APPLE_PASSWORD               # Senha da Apple ID
APPLE_APP_SPECIFIC_PASSWORD  # Senha específica do app
```

### GitLab CI/CD

Em: **Settings** → **CI/CD** → **Variables** → **Add variable**

Mesmos secrets do GitHub Actions acima, com as seguintes configurações:
- ✅ Protect variable (apenas branches protegidas)
- ✅ Mask variable (ocultar nos logs)
- ❌ Expand variable reference

### Como obter os valores

#### Android Keystore Base64

```bash
# Converter keystore para base64
base64 -i alcahub-release.keystore | pbcopy  # macOS
base64 -w 0 alcahub-release.keystore         # Linux
```

#### iOS Certificate Base64

```bash
# Exportar do Keychain como .p12 primeiro, depois:
base64 -i distribution-cert.p12 | pbcopy
```

#### Play Store Service Account

1. Google Play Console → Setup → API access
2. Create new service account
3. Grant permissions: Release apps, manage releases
4. Download JSON key
5. Copiar todo conteúdo do JSON

---

## Estratégia de Branches

### Git Flow

```
main (produção)
  ├── develop (desenvolvimento)
  │    ├── feature/nova-feature
  │    ├── feature/outra-feature
  │    └── bugfix/corrigir-bug
  ├── release/1.0.0
  └── hotfix/critical-bug
```

### Pipelines por Branch

| Branch | Android | iOS | Deploy |
|--------|---------|-----|--------|
| `feature/*` | ✅ Dev Debug | ✅ Dev | ❌ |
| `develop` | ✅ Dev Release | ✅ Dev | ❌ |
| `release/*` | ✅ Prod Debug | ✅ Prod | ⚠️ Manual |
| `main` | ✅ Prod Release | ✅ Prod | ✅ Auto Internal |
| `tags/v*` | ✅ Prod Release | ✅ Prod | ⚠️ Manual Store |

---

## Notificações

### Slack Integration

```yaml
# Adicionar ao final dos jobs
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Android Build ${{ job.status }}'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
    fields: repo,message,commit,author
```

### Discord Integration

```yaml
- name: Notify Discord
  if: always()
  uses: sarisia/actions-status-discord@v1
  with:
    webhook: ${{ secrets.DISCORD_WEBHOOK }}
    status: ${{ job.status }}
    title: "AlcaHub Mobile Build"
    description: "Build finished with status: ${{ job.status }}"
```

---

## Troubleshooting CI/CD

### Erro: Gradle daemon not found

```yaml
# Adicionar no job
env:
  GRADLE_OPTS: "-Dorg.gradle.daemon=false -Dorg.gradle.workers.max=2"
```

### Erro: Out of memory

```yaml
# Aumentar heap do Gradle
env:
  GRADLE_OPTS: "-Xmx4096m -XX:MaxMetaspaceSize=512m"
```

### Erro: iOS Signing failed

```yaml
# Verificar:
# 1. Certificado não expirado
# 2. Provisioning profile válido
# 3. Bundle ID correto
# 4. Team ID correto
```

### Cache muito grande

```yaml
# Limitar cache do Gradle
cache:
  paths:
    - ~/.gradle/caches/modules-2/
    - ~/.gradle/wrapper/
```

---

## Referências

- [GitHub Actions](https://docs.github.com/en/actions)
- [GitLab CI/CD](https://docs.gitlab.com/ee/ci/)
- [Bitbucket Pipelines](https://support.atlassian.com/bitbucket-cloud/docs/get-started-with-bitbucket-pipelines/)
- [Fastlane](https://docs.fastlane.tools/)
- [Google Play Publishing](https://github.com/r0adkll/upload-google-play)

Voltar para [README Mobile](../../README.md)
