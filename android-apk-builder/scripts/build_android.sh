#!/bin/bash
# Automated Android APK build script

set -e

PROJECT_DIR="${1:-.}"
BUILD_TYPE="${2:-debug}"
DOCKER_IMAGE="${3:-cimg/android:2024.01}"

echo "📱 Android APK Builder"
echo "====================="
echo "Project: $PROJECT_DIR"
echo "Build type: $BUILD_TYPE"
echo ""

cd "$PROJECT_DIR"

# Check if it's a Cordova project
if [ ! -f "config.xml" ]; then
    echo "❌ Error: Not a Cordova project (no config.xml found)"
    exit 1
fi

# Build command
BUILD_CMD="cordova build android"

if [ "$BUILD_TYPE" = "release" ]; then
    BUILD_CMD="$BUILD_CMD --release"
elif [ "$BUILD_TYPE" = "device" ]; then
    BUILD_CMD="$BUILD_CMD --device"
fi

echo "🔨 Building with: $BUILD_CMD"
echo ""

# Run in Docker
docker run --rm -v "$(pwd):/app" -w /app \
    $DOCKER_IMAGE sh -c "npm install && npx cordova build android"

echo ""
echo "✅ Build complete!"
echo ""

# Find APK
APK_PATH=$(find platforms/android/app/build/outputs/apk -name "*.apk" -type f | head -1)

if [ -n "$APK_PATH" ]; then
    echo "📦 APK location: $APK_PATH"
    echo "📊 APK size: $(du -h "$APK_PATH" | cut -f1)"
    echo ""
    echo "To install:"
    echo "  adb install \"$APK_PATH\""
else
    echo "⚠️  APK not found in expected location"
fi
