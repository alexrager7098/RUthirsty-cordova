#!/bin/bash
# Cordova iOS Build Script
# Builds an .ipa file from Cordova project

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

# Default values
BUILD_TYPE="development"
TEAM_ID=""
CODE_SIGN_IDENTITY="iPhone Developer"
CONFIGURATION="Debug"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --release)
            BUILD_TYPE="release"
            CONFIGURATION="Release"
            shift
            ;;
        --team-id)
            TEAM_ID="$2"
            shift 2
            ;;
        --code-sign-identity)
            CODE_SIGN_IDENTITY="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo "Builds a Cordova iOS .ipa"
            echo ""
            echo "Options:"
            echo "  --release             Build release .ipa (default: development)"
            echo "  --team-id ID          Apple Development Team ID"
            echo "  --code-sign-identity  Code signing identity (default: 'iPhone Developer')"
            echo "  --help, -h            Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

echo "=== Cordova iOS Build ==="
echo "Project: $PROJECT_ROOT"
echo "Build type: $BUILD_TYPE"
echo ""

cd "$PROJECT_ROOT"

# Check if iOS platform is added
if [[ ! -d "platforms/ios" ]]; then
    echo "iOS platform not found, adding..."
    cordova platform add ios || {
        echo "Error: Failed to add iOS platform"
        exit 1
    }
fi

# Check for Xcode
if ! command -v xcodebuild &> /dev/null; then
    echo "Error: Xcode is not installed"
    echo "This script requires Xcode to build iOS apps"
    exit 1
fi

# Update pods if Podfile exists
if [[ -f "platforms/ios/Podfile" ]]; then
    echo "Installing CocoaPods dependencies..."
    cd platforms/ios
    pod install || echo "Warning: pod install failed, continuing..."
    cd "$PROJECT_ROOT"
fi

# Build iOS
echo "Building iOS app..."
cordova build ios --"$BUILD_TYPE" || {
    echo "Error: Failed to build iOS app"
    exit 1
}

# Find the .app file
APP_NAME=$(grep '<name>' config.xml | head -1 | sed 's/.*<name>\(.*\)<\/name>.*/\1/' | tr -d ' ')
SCHEMES=$(xcodebuild -project platforms/ios/*.xcodeproj -list 2>/dev/null | grep "Schemes:" -A 10 | grep -v "Schemes:" | grep -v "^$")

# Try common scheme names
SCHEME=""
for name in "$APP_NAME" "App"; do
    if echo "$SCHEMES" | grep -q "$name"; then
        SCHEME="$name"
        break
    fi
done

if [[ -z "$SCHEME" ]]; then
    SCHEME=$(echo "$SCHEMES" | head -1 | tr -d ' ')
fi

if [[ -z "$SCHEME" ]]; then
    echo "Error: Could not determine Xcode scheme"
    exit 1
fi

# Build .ipa using xcodebuild
echo "Archiving and creating .ipa..."
ARCHIVE_PATH="$PROJECT_ROOT/platforms/ios/$APP_NAME.xcarchive"

xcodebuild -workspace "platforms/ios/$APP_NAME.xcworkspace" \
    -scheme "$SCHEME" \
    -configuration "$CONFIGURATION" \
    -archivePath "$ARCHIVE_PATH" \
    archive || {
    echo "Error: Failed to archive app"
    exit 1
}

# Export IPA
IPA_PATH="$PROJECT_ROOT/platforms/ios/$APP_NAME.ipa"

xcodebuild -exportArchive \
    -archivePath "$ARCHIVE_PATH" \
    -exportPath "$(dirname "$IPA_PATH")" \
    -exportOptionsPlist /dev/stdin <<EOF || {
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>$([[ "$BUILD_TYPE" == "release" ]] && echo "app-store" || echo "development")</string>
    <key>teamID</key>
    <string>${TEAM_ID:-$(xcodebuild -showBuildSettings -workspace platforms/ios/$APP_NAME.xcworkspace -scheme "$SCHEME" 2>/dev/null | grep "DEVELOPMENT_TEAM" | head -1 | cut -d= -f2 | tr -d ' ')}</string>
    <key>compileBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
</dict>
</plist>
EOF
    echo "Error: Failed to export IPA"
    exit 1
}

echo ""
echo "✅ iOS .ipa built successfully!"
echo "Location: $IPA_PATH"

# Check if .ipa exists
if [[ -f "$IPA_PATH" ]]; then
    SIZE=$(du -h "$IPA_PATH" | cut -f1)
    echo "IPA size: $SIZE"
else
    echo "Warning: .ipa file not found at expected location"
fi

# Clean up archive
rm -rf "$ARCHIVE_PATH"
