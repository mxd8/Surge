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
| Sex8 去广告 | `https://raw.githubusercontent.com/mxd8/Surge/main/modules/sex8-adblock/sex8-adblock.sgmodule` | 拦截 sex8.cc 广告（站内投放接口 api.php?mod=ad、第三方弹窗/推送域、AdSense 与统计、同源生成器 peerclick.js/recommends.js 源头摘除）；URL/域名 REJECT + JS 页面重写（删广告弹窗容器、楼层广告、底部横幅、APP 推广浮窗、右下角悬浮视频窗、帖内广告行、返利挂件、会员订单通知弹窗、推广链接块、导航落地链接过滤、侧条广告按钮、滚动推广轮播，页面加 no-cache 防旧缓存渲染广告），不拦附件/图片 CDN（x5ewt.com）、正文视频（media-server.*）与论坛功能，需 MITM，Mac 与 iOS 通用 |

模块配套 JS 一律放在各自文件夹的 `js/` 下，模块内通过 raw 地址引用，例如：

```
https://raw.githubusercontent.com/mxd8/Surge/main/modules/avjoy-adblock/js/avjoy-rewrite.js
```

## 新增模块的步骤

1. `modules/` 下新建与模块同名的文件夹，写 `<模块名>.sgmodule`；有 JS 就放它的 `js/` 里
2. 模块内所有引用（script-path）一律用 raw 地址，保证两台设备都能拉取
3. 广告域名必须先用 `surge-cli` Replica 抓包 + `add-temp-rule` 实测验证，确认不误伤正片/功能域再入库（详见 AGENTS.md）
4. 提交推送后，Mac 端覆盖本地模块缓存 + reload；iOS 端 GUI 重新安装或更新模块

## surge-cli 常用命令

命令加 `--raw` 得 JSON（脚本处理用）；加 `--remote <密钥>@<IP>:6170` 操作远程 Surge（如 iPhone）。`surge-cli -h` 只列子集，全量目录见官方 Surge skill 的 `references/command-reference.md`。

- **查看**：`environment`（运行态）｜`dump profile original|effective`（effective = 模块合并后的结果，验证模块注入看它）｜`dump rule`（生效规则）｜`dump policy`｜`dump request`（近期请求，抓包分析入口）｜`dump active`（活跃连接）｜`dump event`｜`dump dns`｜`watch request`（实时跟踪新请求）
- **修改**：`reload`（重载主 profile，模块内容更新后执行）｜`switch-profile <名称>`｜`set <key> <value>`（运行时值，重启复位）
- **临时规则**（广告域实测专用，重启自动清空）：`add-temp-rule "DOMAIN-SUFFIX,<域>,REJECT"`｜`del-temp-rule <规则>`｜`flush-temp-rule`
- **连接**：`kill <连接ID>`（改 MITM/脚本后配合硬刷新解决连接复用不生效）｜`flush dns`｜`diagnostics`
- **外部资源**（模块引用的脚本/RULE-SET 等 URL 资源）：`external-resource list`（带 key）｜`external-resource update <key>`（**免重启热更新**；新模块脚本首拉 404 被缓存导致重写不命中，用这条重拉修复）
- **测试**：`test-network`｜`test-policy <名称>`｜`test-all-policies`｜`test-group <名称>`｜`set-log-level <级别>`（临时改日志级别，不写入 profile）
- **模块安装的边界**：CLI **没有**模块安装/管理命令——新模块只能 GUI 安装，或 Mac 离线三件套（写缓存文件 + 两个 plist + 重启 Surge，详见 AGENTS.md）；已装模块的内容更新才可免重启（cp 覆盖缓存 + `reload`，脚本还可用 `external-resource update` 热更）。

## rule/ 自定义清单

`rule/custom.list` 放你自己收集的广告域名（RULE-SET 格式），在 profile 或模块 `[Rule]` 里引用即可全设备生效：

```
RULE-SET,https://raw.githubusercontent.com/mxd8/Surge/main/rule/custom.list,REJECT
```

## 维护约定

- 模块改动只做最小增量，更新 `#!version`；广告域名以 surge-cli Replica 实抓为准，见各模块内注释。
- 涉密文件（如 `~/.config/surge/remote.conf`）不入库。
