# HAHA LAB free security gates

These checks run on demand and in GitHub-hosted CI. No paid scanner API, model server, daemon or always-on personal computer is required. Public-repository standard runners are free; private-repository quotas and artifact storage have separate GitHub billing limits.

## Gates and source scope

- `security-policy`: validates the curated source index, exact vendor version/hash, pinned action/container references and workflow safety. The self-test verifies redaction, no protected/customer export and stale-index failure.
- `security-secrets`: upstream Gitleaks 8.30.1 CLI plus two Supabase rules; current curated source and all checked-out Git history. `--redact=100`, inline allow comments disabled and an explicit empty ignore file; raw scanner files are private temporary files and deleted. No whole-path or whole-history baseline is suppressed. Only the generic API-key rule permits the intentionally public `sb_publishable_` prefix. PATs, server keys, Google keys and arbitrary JWTs are not exempted.
- `security-static`: Semgrep Community Edition 1.156.0 with project-owned local rules. No login, remote rules or telemetry. These focused rules detect direct URL-to-HTML injection, disabled TLS checks, editable user-metadata authorization and embedded server-secret prefixes; they do not establish that all source is vulnerability-free. Rule/parse errors fail the gate.
- `security-dependencies`: OSV-Scanner 2.7.0 checks an explicit CycloneDX inventory derived from exact npm CDN URLs, pinned vendor metadata, and the root npm lock. Package names/versions are queried, not source or student records. The registry's two `xlsx` advisories classify all npm releases as affected because npm `xlsx` is no longer maintained. The official SheetJS 0.20.3 artifact is newer than the upstream fixed versions 0.19.3 and 0.20.2. Only those two advisory IDs on that exact version and SHA256 are classified as upstream-fixed and retained separately in the safe report; different hashes/versions/advisories remain blocking.
- `security-zap-baseline`: optional workflow dispatch (`zap=true`) only. Fixed unauthenticated `https://thehahalab.com/` scope, one-minute GET crawler, five-minute passive wait; authentication/API/private/report/query routes excluded. No active attack scan. It cannot verify authenticated tenant isolation. Docker execution must actually complete before claiming it ran.

Workflow checkout tokens are not persisted; permissions default to `contents: read`; no `pull_request_target`, application secrets or write permissions are used. Actions are SHA-pinned and containers digest-pinned. Only sanitized summaries are uploaded, with three-day retention. Source snippets, token strings, raw scanner results, response bodies and customer records are never artifacts.

## Local commands

Use the workspace Node runtime (Node 20+). Official binaries download to a private temp cache and are checksum-verified. Initial download needs internet. The provided Semgrep Docker path requires Docker; a local trusted CE executable of the locked version can be supplied with `HAHALAB_SEMGREP_BIN`. No scanner failure is treated as success.

```sh
node scripts/security-ci-selftest.mjs
node scripts/security-ci.mjs policy
node scripts/security-ci.mjs secrets
node scripts/security-ci.mjs static
node scripts/security-ci.mjs dependencies
```

Do not commit `output/security-ci/` or tool caches. Retained summaries contain only rule/package IDs, allowed source paths, line numbers and counts; they contain no secret values. A failed historical secret finding must be triaged and revoked rather than broadly excluded.

## Current-source publication

`security/source-policy.json` is an explicit allowlist for the current web application, authentication, Worker, Edge Functions, security SQL and tooling. It excludes `.env`, Git history, raw customer records, outputs, backups, original media and `private/playlab/**/*.html`. Protected learning HTML must not be copied to the public repository; check it locally through existing harnesses.

```sh
node scripts/security-source-snapshot.mjs /absolute/path/to/a-new-empty-snapshot
```

The destination must be new. Export produces `security/source-index.json` listing hashes of copied files. Review that exact snapshot, run the gates, then publish only those files through a regular reviewable commit. `node scripts/security-source-snapshot.mjs verify` checks it in the published checkout. CI requires the index; a missing or stale index fails. Regenerate it when legitimate code or lockfiles change.

This snapshot does not publish learning HTML/media assets or constitute a full build package. A current GitHub scan does not prove the deployed Worker, database policies, session revocation or two-account isolation: use deployment hash checks and the existing live/transactional security harnesses separately.

## Implementation verification and limitations

On 2026-11-04 the local source policy and self-test passed, Semgrep CE ran against actual curated code with no findings/parse errors, and OSV ran against declared browser/vendor packages plus the exact root npm lock with no blocking findings (the two exact SheetJS vendor registry mismatches remained explicitly listed). Gitleaks scans current source and history independently; an actual history failure is a blocking result and is not converted to a pass by source export. The full CI/Docker and optional passive ZAP results must be checked on GitHub after publication. GitHub administrator protections and real database isolation are configured and verified by the release owner, not by these scripts.

## Reviewed historical browser-only verifier

The actual public repository history contains six detections of one historical reversible Base64 browser access-password verifier (four HTML references and two within the old backup ZIP). These are not Supabase, Cloudflare or other provider API keys. The release owner verified on 2026-11-04 that `/etc/Google%20Gemini.html`, `/etc/1.html` and `/etc/2.html` return 404 and the current admin uses Google login with server authorization, with the old `ACCESS_TOKEN` gate absent. This does not assert that any provider credential was revoked or that this old password was never reused elsewhere.

`security/reviewed-legacy-verifiers.json` records only the exact six immutable commit/path/rule/line fingerprints, not the verifier value or its decoded password. Gitleaks continues to detect them; the runner retains them as `reviewedLegacyVerifierFindings` rather than hiding them. They are nonblocking only for those exact historical fingerprints and only before 2027-02-01T00:00:00Z. Current files, a new commit with the same value, a different provider/key rule or any other fingerprint remains blocking. At expiry all six block again until reviewed. No whole history, path or secret rule is ignored. The larger local repository history is a distinct scope and still has additional blocking detections.

The dependency gate covers the declared exact browser/vendor inventory and the root npm lock. It does not yet inventory every transitive package inside vendored bundles or the separate `scripts/codex-free-tools/pnpm-lock.yaml` toolchain. Do not describe it as complete coverage of every dependency.
