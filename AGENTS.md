# AGENTS.md

Workspace for Surge (macOS network proxy) operations via `surge-cli`.

## Environment

- `surge-cli` is symlinked to `/Applications/Surge.app/Contents/Applications/surge-cli` and available in PATH (`~/.local/bin`).
- The official Surge agent skill is symlinked at `~/.agents/skills/surge` (source: `/Applications/Surge.app/Contents/Resources/Skills/surge`) and updates with the app bundle.
- CLI talks to the locally running Surge instance; prefer `--raw` for JSON output. Collect baseline with `surge-cli --raw environment` / `dump policy` / `dump profile` before any `set` mutation, then re-verify.
- Remote phone (Surge iOS): `surge-phone <command>` — wrapper in `~/.local/bin` applying `--remote key@ip:6170` from `~/.config/surge/remote.conf` (chmod 600, contains the API key; do not commit). Phone: 192.168.123.236, verified working (environment / dump policy / dump rule). Phone side requires `http-api = <key>@0.0.0.0:6170` in the profile `[General]` section and same-LAN reachability.
- Gotchas (tested 2026-10-23):
  - Shell exports `http_proxy`/`https_proxy` (127.0.0.1:6152) and `all_proxy` (socks5 127.0.0.1:6153) for the local Mac Surge; LAN requests to the phone hang through it. `surge-phone` sets `no_proxy` automatically; for manual curl add `--noproxy '*'`.
  - Raw curl to the phone API (X-Key header, Basic auth, `?x-key=`) always returns `{"error":"Password incorrect"}` even with the correct key — only `surge-cli --remote` authenticates successfully. Always use surge-cli, never curl, for the phone.
  - Phone raw HTTP responses lack a status line (curl needs `--http0.9` to even read errors).
  - Some commands are platform-limited on iOS: `summary` returns `(null)`; `version` also prints `(null)` (CLI quirk on both platforms).
- Git identity and GitHub CLI (`gh`, account `mxd8`) are configured on this machine; the remote uses SSH.

## Repo

- Remote: https://github.com/mxd8/Surge — **public** since 2026-10-25（用户确认改公开，raw 地址才能被两台设备的 Surge 直接拉取）。本仓库是模块/脚本发布仓库，不是代码工程；`final` 仓库（~/Desktop/final）是另一个项目，勿混淆。
- 目录：每个模块一个文件夹 `modules/<模块名>/`（`<模块名>.sgmodule` + `js/` 放配套脚本），顶级 `rule/` 放自定义广告域名清单（RULE-SET 格式，`rule/custom.list` 手工维护）。raw 格式 `https://raw.githubusercontent.com/mxd8/Surge/main/<路径>`。
- 已装模块：`modules/avjoy-adblock/avjoy-adblock.sgmodule`（AVJoy 去广告 v1.2：域名 REJECT + JS 页面重写 `js/avjoy-rewrite.js` + MITM；广告域名来自 Replica 实抓，见模块内注释）；`modules/xvideos-adblock/xvideos-adblock.sgmodule`（XVideos 去广告 v1.0.2）；`modules/sex8-adblock/sex8-adblock.sgmodule`（Sex8 去广告 v1.0.0：URL-REGEX 拦站内投放接口 `api.php?mod=ad` + 第三方弹窗/推送域 + AdSense/统计 REJECT，JS 重写删广告弹窗容器/楼层广告/底部横幅；该站 curl 被反爬闸门拦，取证须浏览器实访）。
- Surge Mac 模块安装机制（实测 2026-10-25）：模块本体缓存在 `~/Library/Application Support/com.nssurge.surge-mac/Installed Modules/<url的md5>.sgmodule`，注册在 `com.nssurge.surge-mac` plist 的 `InstalledModules`（键 = url 的 MD5），**生效还必须**把模块文件路径加进 `KDDefaults.plist` 的 `EnabledModules` 数组（plutil -insert EnabledModules.N -string）。离线安装顺序：退出 Surge → 写缓存文件 + 两个 plist → 重启 Surge。激活 profile 不在 `~/Library/Application Support/Surge/Profiles`（那只是壳），在 `ConfigDirectoryPath` = `~/Library/CloudStorage/Dropbox/应用/Surge Profiles`。验证模块生效用 `surge-cli --raw dump profile effective`（规则带 `#!FROM-MODULE:<名>` 后缀）。
- iOS 端模块只能 GUI 从 URL 安装（Profile → 模块 → 安装新模块）。2026-10-25 `surge-phone` 远程返回 `Authorization denied`（此前 10-23 可用）——手机当前 profile 的 http-api 密钥可能未开或已变，需手机端检查。
- 广告验证手法：`surge-cli set Replica=1` 开抓包 → 浏览器实访 → `dump recent` 按 `processPath` 过滤（内嵌浏览器显示为 ZCode Helper）→ 广告域加 `add-temp-rule ...REJECT` 实测 → 正片域确认不误伤后写进模块。重启 Surge 会清空 temp-rule 并复位 Replica。
- MITM/脚本不生效的头号坑：MITM 在 TLS 握手时决定，浏览器会复用开启 MITM **之前**建立的连接 → 脚本不触发。改完 hostname 必须 `surge-cli reload` + 杀掉目标域活跃连接（`dump active` → `kill <id>`）+ 浏览器硬刷新。另：profile `loglevel=warning` 下脚本触发不写事件日志，别拿日志当命中证据，直接看响应内容（如 `grep surge-avjoy-adblock`）。模块 [MITM] hostname 会覆盖其他模块的列表，被覆盖的域名要显式补进自己模块。raw.githubusercontent 有 CDN 延迟，本地验证可直接 cp 仓库文件覆盖 `Installed Modules/<md5>.sgmodule` 后 reload。
