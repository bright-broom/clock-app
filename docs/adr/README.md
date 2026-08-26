# Architecture Decision Records

次の変更では ADR を作成します。

- 新しい外部 Service、永続化方式、公開 API、Security Boundary
- Dependency Direction または State Owner の変更
- Data／Storage Schema の互換性変更
- Rollback が難しい、または運用 Cost が継続的に増える変更

File 名は `NNNN-short-title.md` とし、次の形式を使用します。

```markdown
# NNNN: Title

## Status

Proposed | Accepted | Superseded

## Context

制約、利用者、現在の Failure Mode、要確認事項。

## Decision

採用する構成、State Owner、Boundary、適用範囲。

## Alternatives

比較した案と不採用理由。

## Consequences

改善点、悪化点、運用 Cost、Security／Privacy 影響。

## Verification and Rollback

Test、監視、合格条件、Rollback 手順。
```
