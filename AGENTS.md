# AGENTS.md

Workspace for Surge (macOS network proxy) operations via `surge-cli`.

## Environment

- `surge-cli` is symlinked to `/Applications/Surge.app/Contents/Applications/surge-cli` and available in PATH (`~/.local/bin`).
- The official Surge agent skill is symlinked at `~/.agents/skills/surge` (source: `/Applications/Surge.app/Contents/Resources/Skills/surge`) and updates with the app bundle.
- CLI talks to the locally running Surge instance; prefer `--raw` for JSON output. Collect baseline with `surge-cli --raw environment` / `dump policy` / `dump profile` before any `set` mutation, then re-verify.
- Git identity and GitHub CLI (`gh`, account `mxd8`) are configured on this machine; the remote uses SSH.

## Repo

- Remote: https://github.com/mxd8/Surge (private). Build/test commands TBD as code lands.
