# Surge

Surge 模块、脚本与规则的发布仓库。两台设备（Mac / iPhone）的 Surge 通过 raw 地址直接安装模块。

## 目录结构

```
Surge/
├── modules/
│   └── <模块名>/                每个模块一个文件夹
│       ├── <模块名>.sgmodule    模块本体（[Rule] / [Script] / [MITM]）
│       └── js/                  该模块引用的 JS 脚本（script-path 指向这里）
├── rule/                        自定义广告域名清单（RULE-SET 格式）
│   ├── README.md                清单格式与引用方法
│   └── custom.list              个人自定义广告域名（手工维护）
├── AGENTS.md                    运维记录（抓包手法、安装机制、踩坑）
└── README.md
```

raw 地址格式：`https://raw.githubusercontent.com/mxd8/Surge/main/<路径>`

## 现有模块

| 模块 | 安装地址 | 说明 |
|---|---|---|
| AVJoy 去广告 | `https://raw.githubusercontent.com/mxd8/Surge/main/modules/avjoy-adblock/avjoy-adblock.sgmodule` | 拦截 avjoy.me 贴片/横幅/弹窗广告与追踪；域名 REJECT + JS 页面重写（清广告位、关 VAST 插件），需 MITM，Mac 与 iOS 通用 |
| XVideos 去广告 | `https://raw.githubusercontent.com/mxd8/Surge/main/modules/xvideos-adblock/xvideos-adblock.sgmodule` | 拦截 xvideos.com 广告（ExoClick 服务域、站内赞助外链）；域名 REJECT + JS 页面重写（清广告位注入配置、删底部横幅与直播挂件区块），不拦正片 CDN 与直播站主域，需 MITM，Mac 与 iOS 通用 |

模块配套 JS 一律放在各自文件夹的 `js/` 下，模块内通过 raw 地址引用，例如：

```
https://raw.githubusercontent.com/mxd8/Surge/main/modules/avjoy-adblock/js/avjoy-rewrite.js
```

## 新增模块的步骤

1. `modules/` 下新建与模块同名的文件夹，写 `<模块名>.sgmodule`；有 JS 就放它的 `js/` 里
2. 模块内所有引用（script-path）一律用 raw 地址，保证两台设备都能拉取
3. 广告域名必须先用 `surge-cli` Replica 抓包 + `add-temp-rule` 实测验证，确认不误伤正片/功能域再入库（详见 AGENTS.md）
4. 提交推送后，Mac 端覆盖本地模块缓存 + reload；iOS 端 GUI 重新安装或更新模块

## rule/ 自定义清单

`rule/custom.list` 放你自己收集的广告域名（RULE-SET 格式），在 profile 或模块 `[Rule]` 里引用即可全设备生效：

```
RULE-SET,https://raw.githubusercontent.com/mxd8/Surge/main/rule/custom.list,REJECT
```

## 维护约定

- 模块改动只做最小增量，更新 `#!version`；广告域名以 surge-cli Replica 实抓为准，见各模块内注释。
- 涉密文件（如 `~/.config/surge/remote.conf`）不入库。
