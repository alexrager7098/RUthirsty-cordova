# 📱 iOS 构建说明

## 文件清单

| 文件 | 说明 |
|------|------|
| `IOS_BUILD_GUIDE.md` | 详细的 iOS 构建指南 |
| `build-ios.sh` | 自动化构建脚本（在 Mac 上运行） |
| `exportOptions.plist.template` | IPA 导出配置模板 |

## 🚀 快速开始（Mac 环境）

### 方法 1: 使用自动脚本（推荐）

```bash
# 在项目根目录运行
./build-ios.sh
```

### 方法 2: 手动步骤

```bash
# 1. 安装依赖
npm install

# 2. 构建 iOS 项目
cordova build ios --device

# 3. 在 Xcode 中打开项目
open platforms/ios/RUthirsty.xcworkspace

# 4. 连接 iPhone，在 Xcode 中选择设备并运行
```

## ⚙️ 前置要求

- macOS 系统
- Xcode（从 App Store 安装）
- Apple ID 或 Apple Developer 账号

## 📖 详细文档

请查看 `IOS_BUILD_GUIDE.md` 获取完整说明，包括：

- 环境配置
- 代码签名
- 生成 IPA 文件
- 安装到真机
- 常见问题解决

## 🎯 构建选项

| 选项 | 命令 | 说明 |
|------|------|------|
| 开发版本 | `cordova build ios --device` | 用于真机调试 |
| 发布版本 | `cordova build ios --release --device` | 用于分发 |
| 模拟器版本 | `cordova build ios` | 在模拟器中运行 |

---

**注意**: 此项目需要在 Mac 环境中构建 iOS 应用，Linux/Windows 环境无法构建 iOS。
