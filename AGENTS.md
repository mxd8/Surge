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
- 目录：`modules/` 放 .sgmodule，`scripts/` 放 Surge JS（模块 script-path 引用）。raw 格式 `https://raw.githubusercontent.com/mxd8/Surge/main/<路径>`。
- 已装模块：`modules/avjoy-adblock.sgmodule`（AVJoy 去广告，域名级 REJECT，无需 MITM；广告域名来自 Replica 实抓，见模块内注释）。
- Surge Mac 模块安装数据在 `com.nssurge.surge-mac` plist 的 `InstalledModules`（键 = url 的 MD5，值含 fileName/name/url），可用 `defaults write ... -dict-add` 离线安装：先退出 Surge → 写 plist → 重启 Surge。iOS 端模块只能 GUI 从 URL 安装。
- 广告验证手法：`surge-cli set Replica=1` 开抓包 → 浏览器实访 → `dump recent` 按 `processPath` 过滤（内嵌浏览器显示为 ZCode Helper）→ 广告域加 `add-temp-rule ...REJECT` 实测 → 正片域确认不误伤后写进模块。
