---
name: android-apk-builder
description: Complete Android APK building for Cordova/PhoneGap projects with automated environment setup, dependency installation, and APK generation. Use when user needs to create installable Android applications (.apk) from Cordova projects including setting up Android build environment, installing required SDK and build tools, building debug/release APKs, and troubleshooting common build errors.
---

# Android APK Builder

## Quick Start

To build an APK from a Cordova project:

```bash
# 1. Add Android platform
cordova platform add android@latest

# 2. Build debug APK
cordova build android --device

# APK location: platforms/android/app/build/outputs/apk/debug/
```

## Build Environment Setup

### Docker Method (Recommended)

Use pre-built Android SDK environment:

```bash
docker run --rm -v "$(pwd):/app" -w /app \
  cimg/android:2024.01 sh -c "cordova build android --device"
```

### Local Setup

Install required tools:

```bash
# Android SDK (via Android Studio or command-line)
# Gradle
# Java JDK 11+
```

## Build Options

| Build Type | Command | Output |
|------------|----------|--------|
| Debug | `cordova build android` | `-debug.apk` |
| Release | `cordova build android --release` | `-release-unsigned.apk` |
| Device | `cordova build android --device` | Optimized APK |

## Troubleshooting

### Common Issues

**Issue: Build tools version mismatch**
```bash
# Check installed versions
$ANDROID_HOME/tools/bin/sdkmanager --list_installed

# Install required version
$ANDROID_HOME/tools/bin/sdkmanager "build-tools;35.0.0"
```

**Issue: Gradle daemon issues**
```bash
# Kill existing daemon
./gradlew --stop

# Clean build
cordova clean android
```

**Issue: Out of memory**
```bash
# Increase gradle memory
export GRADLE_OPTS="-Xmx2048m -XX:MaxPermSize=512m"
```

## APK Signing (Release Builds)

For release APKs, sign the APK:

```bash
# Generate keystore
keytool -genkey -v -keystore my-release-key.keystore \
  -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

# Sign APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 \
  -keystore my-release-key.keystore app-release-unsigned.apk my-key-alias

# Align APK
zipalign -v 4 app-release-unsigned.apk app-release.apk
```

## Scripts

Use bundled scripts for automated builds:

- `scripts/build_android.sh` - Complete build automation
- `scripts/setup_android_env.sh` - Environment setup

See [scripts/README.md](scripts/README.md) for details.
