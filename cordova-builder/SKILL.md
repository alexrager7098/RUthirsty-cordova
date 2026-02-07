---
name: cordova-builder
description: Build Cordova applications into APK (Android) and .ipa (iOS) packages. Use when the user needs to compile, package, or distribute a Cordova project as a mobile application. Handles platform-specific builds including debug/release configurations, code signing, and environment setup.
---

# Cordova Builder

Build and package Cordova applications for Android (APK) and iOS (IPA).

## Prerequisites

### Android Builds
- Java JDK 8 or higher
- Android SDK with commandlinetools
- Gradle (bundled with Cordova Android)
- Keystore file for release builds

### iOS Builds
- macOS with Xcode 14+
- Apple Developer account
- Code signing certificates and provisioning profiles
- CocoaPods (if using native plugins)

## Build Workflows

### Android APK Build

**Debug APK (unsigned):**

```bash
scripts/build_apk.sh --debug
```

Output: `platforms/android/app/build/outputs/apk/debug/app-debug.apk`

**Release APK (signed):**

```bash
scripts/build_apk.sh \
  --keystore /path/to/keystore.jks \
  --keystore-password "your-password" \
  --key-alias "your-alias" \
  --key-password "your-key-password"
```

Output: `platforms/android/app/build/outputs/apk/release/app-release.apk`

### iOS IPA Build

**Development IPA:**

```bash
scripts/build_ios.sh
```

**Release IPA (App Store):**

```bash
scripts/build_ios.sh --release --team-id "YOUR_TEAM_ID"
```

Output: `platforms/ios/[App Name].ipa`

## Environment Setup

### Initial Android Setup

Run the setup script to install Android SDK dependencies:

```bash
scripts/setup_android.sh
```

This script installs:
- Java JDK
- Android SDK with commandlinetools
- Required platforms and build-tools
- Environment variable configuration

### Manual Environment Variables

Add to `~/.bashrc` or `~/.zshrc`:

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export ANDROID_SDK_ROOT=$HOME/Android/Sdk
export PATH=$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH
```

## Common Issues

### Build Errors

**Missing platform:**
```bash
cordova platform add android
cordova platform add ios
```

**Plugin issues:**
```bash
cordova plugin remove [plugin-name]
cordova plugin add [plugin-name]
```

**Clean build:**
```bash
cordova clean android
cordova clean ios
```

### Android Signing Issues

Generate a new keystore:

```bash
keytool -genkey -v -keystore my-release-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias my-key-alias
```

### iOS Code Signing

- Ensure provisioning profile is installed
- Verify code signing identity: `security find-identity -v -p codesigning`
- Check team ID in Xcode settings

## Resources

### scripts/
- `build_apk.sh` - Build Android APK (debug/release)
- `build_ios.sh` - Build iOS IPA (development/release)
- `setup_android.sh` - Install and configure Android SDK

### References
See Cordova official docs for platform-specific configuration:
- https://cordova.apache.org/docs/en/latest/guide/platforms/android/
- https://cordova.apache.org/docs/en/latest/guide/platforms/ios/
