# 📱 iPhone 安装指南 - AltStore/Sideloadly

## 🎯 最快方式（3分钟内完成）

---

## 方法 1: AltStore（Mac 用户首选）

### 步骤 1: 安装 AltStore

在您的 Mac 上：

```bash
# 访问官网下载
https://altstore.io/

# 点击 Download AltStore for macOS
# 安装完成后在菜单栏会看到 AltStore 图标
```

### 步骤 2: 在 iPhone 上安装 AltStore

1. 在 iPhone Safari 中访问：`https://altstore.io/`
2. 点击 "Download" → "Install AltStore"
3. 按照屏幕指示安装描述文件
4. 进入 设置 → 通用 → VPN 与设备管理 → 安装
5. AltStore 应用图标会出现在主屏幕

### 步骤 3: 安装 RUthirsty 应用

**选项 A: 如果您有 Mac**

```bash
# 1. 下载 Xcode 项目文件（从 GitHub Actions）
# 2. 在 Xcode 中构建并导出 IPA
# 3. 将 IPA 传到 iPhone
# 4. 在 iPhone 上打开 AltStore
# 5. 点击 "+" 按钮，选择 IPA 文件
# 6. 用您的 Apple ID 签名
# 7. 完成！应用已安装
```

**选项 B: 使用 AltServer 侧载**

```bash
# 1. 确保您的 Mac 和 iPhone 在同一 WiFi 网络
# 2. 在 Mac 上打开 AltServer（菜单栏图标）
# 3. 用 USB 数据线连接 iPhone 到 Mac
# 4. 在 Mac 上点击 AltServer → Install AltStore → [您的设备]
# 5. 输入您的 Apple ID 和密码
# 6. 等待安装完成
# 7. 将 IPA 文件用 AirDrop 传到 iPhone
# 8. 在 iPhone 上打开 AltStore，点击 "+" 选择 IPA
```

---

## 方法 2: Sideloadly（Windows/Mac 通用）

### 步骤 1: 下载 Sideloadly

```
下载地址: https://sideloadly.io/

支持系统:
- Windows 7/8/10/11
- macOS 10.13+
```

### 步骤 2: 准备 IPA 文件

从 GitHub Actions 获取：

1. 访问：`https://github.com/alexrager7098/RUthirsty-cordova/actions`
2. 点击左侧 "Build iOS IPA (Complete)"
3. 点击 "Run workflow" → "Run workflow"
4. 等待 3-5 分钟
5. 构建完成后，下载 "ios-xcode-project" 产物

### 步骤 3: 使用 Sideloadly 安装

```
1. 打开 Sideloadly 应用
2. 用 USB 连接 iPhone 到电脑
3. 点击 Sideloadly 界面上的 "IPA File" 按钮
4. 选择下载的 IPA 文件
5. 输入您的 Apple ID 和密码
6. 等待安装（约 1-2 分钟）
7. 完成！应用出现在 iPhone 上
```

---

## ⚠️ 重要提示

### Apple ID 签名

- ✅ **免费 Apple ID** - 每 7 天需要重新签名
- ✅ **完全合法** - 这是苹果官方允许的开发者签名方式
- ✅ **应用功能完整** - 与正式版功能完全一样

### 续签步骤（免费 Apple ID）

每 7 天，应用会提示需要刷新签名：

**AltStore 用户:**
```
1. 打开 AltStore 应用
2. 点击 "My Apps" 标签
3. 找到 RUthirsty 应用
4. 点击 "Refresh" 按钮
5. 输入 Apple ID 密码
6. 完成
```

**Sideloadly 用户:**
```
1. 重新运行 Sideloadly
2. 选择同一个 IPA 文件
3. 重新签名安装即可
```

---

## 🔧 常见问题

### Q1: "无法验证应用" 提示？
**A:** 设置 → 通用 → VPN 与设备管理 → [Apple ID] → 信任

### Q2: 安装失败？
**A:**
- 确保 USB 连接稳定
- 检查 iOS 版本是否支持（iOS 12.2+）
- 重启 iPhone 和电脑后重试

### Q3: AltStore 需要数据线吗？
**A:** 首次安装需要数据线，之后可以用 WiFi

### Q4: 可以安装到多台设备吗？
**A:** 免费 Apple ID 每个设备都需要单独签名

---

## 📞 需要帮助？

- [AltStore 官方教程](https://altstore.io/faq/)
- [Sideloadly 官方文档](https://sideloadly.io/faq/)
- [GitHub Issues](https://github.com/alexrager7098/RUthirsty-cordova/issues)

---

**祝安装顺利！如有问题随时联系** 🎉
