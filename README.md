# RUthirsty - 喝水打卡应用

一个简洁美观的Cordova喝水打卡应用，支持iOS和Android平台。

## 功能特性

- 一键打卡喝水
- 显示今日打卡次数
- 记录展示列表（显示每次打卡的具体时间）
- 数据本地持久化存储（localStorage）
- 自动清理30天以上的旧记录
- 震动反馈（在支持的设备上）
- 深色模式支持
- iOS安全区域适配

## 项目结构

```
RUthirsty-cordova/
├── www/
│   ├── css/
│   │   └── index.css      # 样式文件
│   ├── js/
│   │   └── index.js       # 应用逻辑
│   └── index.html         # 主页面
├── platforms/
│   └── ios/               # iOS平台代码
├── config.xml             # Cordova配置文件
└── package.json           # 项目配置
```

## 开发与构建

### 环境要求

- Node.js (v14+)
- Cordova CLI

### 安装依赖

```bash
npm install -g cordova
```

### 添加平台

```bash
# 添加iOS平台
cordova platform add ios

# 添加Android平台（可选）
cordova platform add android
```

### 在浏览器中运行测试

```bash
cordova serve
```

然后访问 `http://localhost:8000`

### 构建iOS应用（需要在Mac上进行）

```bash
# 打开Xcode项目
cordova open ios

# 或直接编译
cordova build ios
```

### 构建Android应用

```bash
cordova build android
```

## 使用说明

1. 点击"打卡喝水"按钮记录喝水时间
2. 今日打卡次数会实时更新
3. 打卡记录按时间倒序显示在下方列表中
4. 数据保存在本地，应用关闭后不会丢失
5. 系统会自动清理30天以上的旧记录

## iOS设备运行

要在iOS真机上运行：

1. 在Mac上打开项目
2. 连接iOS设备
3. 在Xcode中选择你的设备
4. 点击运行按钮

## 技术栈

- Cordova 8.x+
- HTML5
- CSS3 (含深色模式)
- 原生JavaScript (ES6+)
- LocalStorage API

## 浏览器兼容性

- iOS Safari 12+
- Chrome 80+
- Firefox 75+
- Safari 13+

## 许可证

Apache License 2.0
