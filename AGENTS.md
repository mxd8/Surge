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

- Remote: https://github.com/mxd8/Surge (private). Build/test commands TBD as code lands.
