# iOS IPA 构建指南

本文档指导您如何在 Mac 上将 RUthirsty 应用打包成 iOS 可安装的 .ipa 文件。

## 📋 前置要求

### 必需软件
- **macOS** (最新版推荐 macOS 14+)
- **Xcode** (最新版本，从 App Store 下载)
- **Xcode Command Line Tools**
  ```bash
  xcode-select --install
  ```

### 验证环境
```bash
# 检查 Xcode
xcodebuild -version

# 检查 iOS SDK
xcrun --sdk ios --show-sdk-path
```

## 🚀 构建步骤

### 步骤 1: 克隆项目到本地 Mac

```bash
# 克隆项目（如果还未克隆）
git clone <your-repo-url>
cd RUthirsty-cordova
```

### 步骤 2: 安装依赖

```bash
# 安装 Node.js 依赖
npm install

# 安装 Cordova CLI（如果没有安装）
npm install -g cordova
```

### 步骤 3: 验证 iOS 平台

```bash
# 检查已安装平台
cordova platform ls

# 如果没有 iOS 平台，添加它
cordova platform add ios@latest
```

### 步骤 4: 构建项目

```bash
# 构建开发版本（用于真机调试）
cordova build ios --device

# 或者构建发布版本
cordova build ios --release --device
```

### 步骤 5: 打包成 IPA 文件

构建完成后，iOS 项目位于 `platforms/ios/` 目录。

**方法 A: 使用 Xcode（推荐）**

```bash
# 在 Xcode 中打开项目
open platforms/ios/RUthirsty.xcworkspace

# 在 Xcode 中：
# 1. 选择目标设备 "Any iOS Device (arm64)"
# 2. 点击 Product → Archive
# 3. Archive 完成后，点击 "Distribute App"
# 4. 选择 "Ad Hoc" 或 "Development" 签名方式
# 5. 导出 IPA 文件
```

**方法 B: 使用命令行打包**

```bash
cd platforms/ios

# 使用 xcodebuild 打包
xcodebuild -workspace RUthirsty.xcworkspace \
  -scheme RUthirsty \
  -configuration Release \
  -archivePath build/RUthirsty.xcarchive \
  archive

# 导出 IPA
xcodebuild -exportArchive \
  -archivePath build/RUthirsty.xcarchive \
  -exportPath build/export \
  -exportOptionsPlist exportOptions.plist
```

需要创建 `exportOptions.plist` 文件：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>ad-hoc</string>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
    <key>compileBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <false/>
</dict>
</plist>
```

## 📱 安装到真机

### 方法 1: 使用 Xcode
1. 连接 iPhone 到 Mac
2. 在 Xcode 中选择您的设备
3. 点击运行按钮

### 方法 2: 使用 AltStore（侧载）
1. 从 https://altstore.io/ 下载 AltStore
2. 在 Mac 上安装 AltServer
3. 连接 iPhone，通过 AltStore 安装 IPA

### 方法 3: 使用 TestFlight（需要 Apple Developer 账号）
1. 将 IPA 上传到 App Store Connect
2. 通过 TestFlight 分发给测试设备

## 🔑 代码签名说明

### 免费 Apple ID（7天有效）
- 适用于个人测试
- 应用每 7 天需要重新签名

### Apple Developer Program（$99/年）
- 应用有效期 1 年
- 可发布到 App Store
- 支持多设备测试

## ⚠️ 常见问题

### 问题: "No signing certificate found"
**解决**: 在 Xcode 中配置签名
1. 打开项目设置
2. 选择 "Signing & Capabilities"
3. 选择你的 Team 或添加新账号

### 问题: "iOS deployment target too low"
**解决**: 在 `config.xml` 中调整
```xml
<preference name="deployment-target" value="12.0" />
```

### 问题: 构建失败 "Command PhaseScriptExecution failed"
**解决**: 清理构建缓存
```bash
cd platforms/ios
xcodebuild clean -workspace RUthirsty.xcworkspace
```

## 📂 项目文件说明

```
RUthirsty-cordova/
├── platforms/ios/          # iOS 原生项目
│   └── RUthirsty.xcworkspace  # Xcode 工作空间
├── www/                    # Web 资源（HTML/CSS/JS）
├── config.xml              # Cordova 配置文件
└── package.json            # Node.js 依赖
```

## 🎯 快速命令参考

```bash
# 完整构建流程
npm install
cordova prepare ios
cordova build ios --device

# 清理构建
cordova clean ios

# 查看可用设备
cordova run ios --list
```

## 📞 需要帮助？

- [Cordova iOS 官方文档](https://cordova.apache.org/docs/en/latest/guide/platforms/ios/)
- [Apple 开发者文档](https://developer.apple.com/documentation/)

---

**祝构建顺利！** 🎉
