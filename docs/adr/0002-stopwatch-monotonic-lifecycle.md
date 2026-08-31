# 0002: Stopwatch monotonic timing and reload lifecycle

## Status

Accepted

## Context

ストップウォッチは経過時間を計測するため、利用者が変更できる System Clock の
補正に影響されてはいけません。一方、Browser Reload を越えて計測を継続するには、
別 Runtime 間で比較できる Wall Clock と Storage Schema が必要になり、System Clock
補正、Offline 時間、保持期間を含む別の Product Contract になります。

## Decision

- 同一 Browser Runtime 内の計時源は、単調増加する `performance.now()` とします。
- `setTimeout` は描画更新の契機に限定し、経過時間の正本にはしません。
- Module Scope の Store は Client-side Route 遷移を越えて状態を保持します。
- Full Page Reload は新しい計測 Session とし、ストップウォッチを 0 に戻します。
- Browser Storage、Network、外部 Service は追加しません。

## Alternatives

- `Date.now()` は System Clock の前進補正で経過時間を過大計上するため不採用としました。
- Reload を越える永続化は、Offline 時間を計測に含めるかという Product 判断と、Version
  付き Storage Schema が必要なため、この機能 Contract には含めません。
- Tick 回数の加算は Background Throttling で Drift するため不採用としました。

## Consequences

- System Clock の前進・後退は、同一 Runtime の経過時間へ影響しません。
- Background Callback が停止しても、復帰時に単調時計から再計算します。
- Reload 後に以前の計測値は復元されません。この制約は README に明記します。
- 個人情報、Secret、新しい Network Egress はありません。

## Verification and Rollback

- Unit Test で Tick Drift、Pause／Resume、Background 復帰、System Clock の前進・後退を検証します。
- Browser Test で Start／Pause／Reset と Route 表示を検証します。
- Rollback は Stopwatch Runtime を以前の実装へ戻します。Storage Migration は不要です。
