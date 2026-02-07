#!/bin/bash
# iOS 构建脚本 - 在 Mac 上运行此脚本

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  RUthirsty iOS 构建脚本${NC}"
echo -e "${GREEN}========================================${NC}"

# 检查是否在 Mac 上
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}错误: 此脚本必须在 Mac 上运行${NC}"
    exit 1
fi

# 检查 Xcode
if ! command -v xcodebuild &> /dev/null; then
    echo -e "${RED}错误: Xcode 未安装${NC}"
    echo -e "${YELLOW}请从 App Store 安装 Xcode${NC}"
    exit 1
fi

# 检查 Cordova
if ! command -v cordova &> /dev/null; then
    echo -e "${YELLOW}Cordova 未安装，正在安装...${NC}"
    npm install -g cordova
fi

echo -e "${GREEN}✓ 环境检查通过${NC}"
echo ""

# 构建类型选择
echo "选择构建类型："
echo "1) 开发版本 - 用于真机调试"
echo "2) 发布版本 - 用于分发"
read -p "请输入选项 (1 或 2): " build_type

if [ "$build_type" = "1" ]; then
    BUILD_FLAG="--device"
    CONFIG="Debug"
else
    BUILD_FLAG="--release --device"
    CONFIG="Release"
fi

echo ""
echo -e "${YELLOW}开始构建...${NC}"

# 安装依赖
echo -e "${GREEN}[1/4] 安装依赖...${NC}"
npm install

# 准备 iOS 平台
echo -e "${GREEN}[2/4] 准备 iOS 平台...${NC}"
cordova platform remove ios 2>/dev/null || true
cordova platform add ios@latest

# 构建项目
echo -e "${GREEN}[3/4] 构建 iOS 项目...${NC}"
cordova build ios $BUILD_FLAG

# 打开 Xcode（可选）
echo -e "${GREEN}[4/4] 完成！${NC}"
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  构建完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "iOS 项目已生成在: ${GREEN}platforms/ios/${NC}"
echo ""
echo "接下来的步骤："
echo "1. 打开 Xcode: ${YELLOW}open platforms/ios/RUthirsty.xcworkspace${NC}"
echo "2. 连接 iPhone 设备"
echo "3. 在 Xcode 中选择设备并点击运行"
echo ""
echo "或使用命令行打包 IPA："
echo "${YELLOW}cd platforms/ios${NC}"
echo "${YELLOW}xcodebuild -workspace RUthirsty.xcworkspace -scheme RUthirsty -configuration ${CONFIG} archive${NC}"
echo ""
