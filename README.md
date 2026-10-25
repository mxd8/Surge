# Surge

Surge 模块与脚本的发布仓库。两台设备（Mac / iPhone）的 Surge 通过 raw 地址直接安装模块。

## 目录结构

```
modules/    Surge 模块（.sgmodule），raw 地址可直接安装
scripts/    Surge JS 脚本，供模块 [Script] 的 script-path 引用
```

raw 地址格式：`https://raw.githubusercontent.com/mxd8/Surge/main/<路径>`

## 现有模块

| 模块 | 安装地址 | 说明 |
|---|---|---|
| AVJoy 去广告 | `https://raw.githubusercontent.com/mxd8/Surge/main/modules/avjoy-adblock.sgmodule` | 拦截 avjoy.me 贴片/横幅/弹窗广告与追踪，无需 MITM，Mac 与 iOS 通用 |

## 维护约定

- 模块改动只做最小增量；广告域名以 surge-cli Replica 实抓为准，见各模块内注释。
- 涉密文件（如 `~/.config/surge/remote.conf`）不入库。
