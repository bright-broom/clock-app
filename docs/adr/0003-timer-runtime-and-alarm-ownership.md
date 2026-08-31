# 0003: Timer runtime and completion-alarm ownership

## Status

Accepted

## Context

Countdown State は Route を離れても保持されますが、Timer 画面が Unmount されると Tick と
AudioContext も停止していました。また、完了音の設定が画面 Local State だったため、Reload
後に設定が戻り、Browser の Autoplay Policy で再生できない失敗も利用者へ伝わりませんでした。
複数 Tab が同じ Timer を復元した場合は、完了音の Owner も未定義でした。

## Decision

- Locale Layout に表示を持たない `TimerRuntime` を置き、Countdown の購読と完了判定を
  Timer 画面から分離します。
- 完了音の設定は、Version 付き Key `clock-app:timer-sound:v1` で保持し、Tab 間同期します。
- AudioContext は Module Scope で所有し、Route Unmount では閉じません。
- Audio の状態を `unprepared`、`ready`、`blocked`、`unsupported` として UI に公開します。
- 完了識別子は Countdown の Deadline から生成します。Web Locks で Tab 間排他を取り、
  `clock-app:timer-alarm-claim:v1` の Claim で同じ完了音の再生を抑止します。
- Web Locks がない Browser は、Storage Claim の短い収束待ちを使います。
- Autoplay Policy で拒否された場合は失敗を保持し、30 秒以内の次の利用者操作で再試行します。

## Alternatives

- Timer 画面だけで Audio を管理する方式は、Route 遷移中の完了を扱えないため不採用としました。
- Notification API は追加 Permission と別の Privacy／UX Contract が必要なため採用しません。
- すべての Tab で鳴らす方式は重複通知になるため不採用としました。

## Consequences

- Client-side Route 遷移中も Countdown と完了判定が継続します。
- Reload 後に Running Timer が復元された場合も Runtime が Deadline を監視します。
- Browser が Audio を拒否する場合、視覚状態と Accessible Name で失敗を確認できます。
- Web Locks と Storage の両方が利用できない場合、重複抑止は Best Effort です。
- Storage 値は識別子と Preference のみで、PII、Secret、Network Egress は追加しません。

## Verification and Rollback

- Unit Test で Preference 復元、Audio 拒否、Claim、Retry、Route Unmount 中の完了を検証します。
- Browser Test で Timer 画面を離れた後の完了と Preference の Reload 復元を検証します。
- Rollback は `TimerRuntime` と Alarm Coordinator を外し、2 つの新しい Storage Key を無視します。
  Timer State Schema 自体は変更しないため Migration は不要です。
