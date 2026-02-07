#!/bin/bash
# Cordova APK Build Script
# Builds a release APK from Cordova project

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

# Default values
BUILD_TYPE="release"
KEYSTORE_PATH=""
KEYSTORE_PASSWORD=""
KEY_ALIAS=""
KEY_PASSWORD=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --debug)
            BUILD_TYPE="debug"
            shift
            ;;
        --keystore)
            KEYSTORE_PATH="$2"
            shift 2
            ;;
        --keystore-password)
            KEYSTORE_PASSWORD="$2"
            shift 2
            ;;
        --key-alias)
            KEY_ALIAS="$2"
            shift 2
            ;;
        --key-password)
            KEY_PASSWORD="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo "Builds a Cordova APK"
            echo ""
            echo "Options:"
            echo "  --debug              Build debug APK (default: release)"
            echo "  --keystore PATH      Path to keystore file (required for release)"
            echo "  --keystore-password  Keystore password (required for release)"
            echo "  --key-alias ALIAS     Key alias (required for release)"
            echo "  --key-password       Key password (required for release)"
            echo "  --help, -h           Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Validate release build requirements
if [[ "$BUILD_TYPE" == "release" ]]; then
    if [[ -z "$KEYSTORE_PATH" || -z "$KEYSTORE_PASSWORD" || -z "$KEY_ALIAS" || -z "$KEY_PASSWORD" ]]; then
        echo "Error: Release build requires keystore credentials"
        echo "Use --help for usage information"
        exit 1
    fi

    if [[ ! -f "$KEYSTORE_PATH" ]]; then
        echo "Error: Keystore file not found: $KEYSTORE_PATH"
        exit 1
    fi
fi

echo "=== Cordova APK Build ==="
echo "Project: $PROJECT_ROOT"
echo "Build type: $BUILD_TYPE"
echo ""

cd "$PROJECT_ROOT"

# Check if Android platform is added
if [[ ! -d "platforms/android" ]]; then
    echo "Android platform not found, adding..."
    cordova platform add android || {
        echo "Error: Failed to add Android platform"
        exit 1
    }
fi

# Build APK
if [[ "$BUILD_TYPE" == "debug" ]]; then
    echo "Building debug APK..."
    cordova build android --debug || {
        echo "Error: Failed to build debug APK"
        exit 1
    }

    APK_PATH="platforms/android/app/build/outputs/apk/debug/app-debug.apk"
    echo ""
    echo "✅ Debug APK built successfully!"
    echo "Location: $PROJECT_ROOT/$APK_PATH"
else
    echo "Building release APK..."
    cordova build android \
        --release \
        --keystore="$KEYSTORE_PATH" \
        --storePassword="$KEYSTORE_PASSWORD" \
        --alias="$KEY_ALIAS" \
        --password="$KEY_PASSWORD" \
        || {
        echo "Error: Failed to build release APK"
        exit 1
    }

    APK_PATH="platforms/android/app/build/outputs/apk/release/app-release.apk"
    echo ""
    echo "✅ Release APK built successfully!"
    echo "Location: $PROJECT_ROOT/$APK_PATH"
fi

# Check if APK exists
if [[ -f "$APK_PATH" ]]; then
    SIZE=$(du -h "$APK_PATH" | cut -f1)
    echo "APK size: $SIZE"
else
    echo "Warning: APK file not found at expected location"
fi
