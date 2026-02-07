#!/bin/bash
# Android Setup Script for Cordova
# Installs Android SDK and sets up environment

set -e

echo "=== Android SDK Setup for Cordova ==="
echo ""

# Check operating system
OS="$(uname -s)"
case "$OS" in
    Linux*)     MACHINE=Linux;;
    Darwin*)    MACHINE=Mac;;
    CYGWIN*)    MACHINE=Cygwin;;
    MINGW*)     MACHINE=MinGw;;
    *)          MACHINE="UNKNOWN:$OS"
esac

# Install JDK
if ! command -v java &> /dev/null; then
    echo "Installing JDK..."
    if [[ "$MACHINE" == "Linux" ]]; then
        sudo apt-get update
        sudo apt-get install -y default-jdk
    elif [[ "$MACHINE" == "Mac" ]]; then
        if ! command -v brew &> /dev/null; then
            echo "Error: Homebrew not found. Please install it first."
            echo "Visit: https://brew.sh/"
            exit 1
        fi
        brew install --cask temurin
    else
        echo "Error: Unsupported operating system for auto-installation"
        echo "Please install JDK manually:"
        echo "  - Download from: https://adoptium.net/"
        exit 1
    fi
fi

JAVA_VERSION=$(java -version 2>&1 | head -1 | cut -d'"' -f2)
echo "✅ Java installed: $JAVA_VERSION"

# Install Android SDK using commandlinetools
ANDROID_SDK_ROOT="$HOME/Android/Sdk"

if [[ ! -d "$ANDROID_SDK_ROOT" ]]; then
    echo ""
    echo "Installing Android SDK..."

    # Create SDK directory
    mkdir -p "$ANDROID_SDK_ROOT/cmdline-tools"

    # Download commandlinetools
    DOWNLOAD_DIR="/tmp/cordova-android-sdk"
    mkdir -p "$DOWNLOAD_DIR"

    if [[ "$MACHINE" == "Linux" ]]; then
        TOOLS_URL="https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip"
    elif [[ "$MACHINE" == "Mac" ]]; then
        TOOLS_URL="https://dl.google.com/android/repository/commandlinetools-mac-11076708_latest.zip"
    else
        echo "Error: Unsupported platform for commandlinetools"
        exit 1
    fi

    echo "Downloading Android commandlinetools..."
    if command -v curl &> /dev/null; then
        curl -L "$TOOLS_URL" -o "$DOWNLOAD_DIR/commandlinetools.zip"
    elif command -v wget &> /dev/null; then
        wget "$TOOLS_URL" -O "$DOWNLOAD_DIR/commandlinetools.zip"
    else
        echo "Error: Neither curl nor wget found"
        exit 1
    fi

    echo "Extracting commandlinetools..."
    unzip -q "$DOWNLOAD_DIR/commandlinetools.zip" -d "$DOWNLOAD_DIR"
    mv "$DOWNLOAD_DIR/cmdline-tools" "$ANDROID_SDK_ROOT/cmdline-tools/latest"

    rm -rf "$DOWNLOAD_DIR"
fi

# Add sdkmanager to PATH
export PATH="$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools:$PATH"

# Accept licenses and install required packages
echo ""
echo "Installing Android SDK packages..."

yes | sdkmanager --licenses || true

sdkmanager "platform-tools" \
    "platforms;android-34" \
    "build-tools;34.0.0" || {
    echo "Error: Failed to install Android SDK packages"
    exit 1
}

echo "✅ Android SDK installed"

# Setup environment variables
echo ""
echo "=== Environment Setup ==="

# Detect shell
SHELL_NAME="$(basename "$SHELL")"

ENV_VARS="
export ANDROID_HOME=\$HOME/Android/Sdk
export ANDROID_SDK_ROOT=\$HOME/Android/Sdk
export ANDROID_SDK_HOME=\$HOME/.android
export PATH=\$ANDROID_HOME/cmdline-tools/latest/bin:\$ANDROID_HOME/platform-tools:\$PATH
"

if [[ "$SHELL_NAME" == "bash" ]]; then
    RC_FILE="$HOME/.bashrc"
elif [[ "$SHELL_NAME" == "zsh" ]]; then
    RC_FILE="$HOME/.zshrc"
else
    RC_FILE="$HOME/.bashrc"
fi

echo "Add these lines to your shell profile ($RC_FILE):"
echo "$ENV_VARS"

# Offer to add to shell profile
echo ""
read -p "Add to $RC_FILE? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Check if already added
    if ! grep -q "ANDROID_HOME" "$RC_FILE" 2>/dev/null; then
        echo "" >> "$RC_FILE"
        echo "# Android SDK for Cordova" >> "$RC_FILE"
        echo "$ENV_VARS" >> "$RC_FILE"
        echo "✅ Environment variables added to $RC_FILE"
    else
        echo "Environment variables already present in $RC_FILE"
    fi
fi

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "1. Source your shell profile: source $RC_FILE"
echo "2. Verify installation: adb version"
echo "3. Add Android platform: cordova platform add android"
