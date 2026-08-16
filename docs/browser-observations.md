# ブラウザ観測記録

確認日: 2026-08-17（GMT+9）

## バグ状態 `/buggy`

| 操作 | `useAsyncData.data` | `visibleUsers` | 判定 |
| --- | --- | --- | --- |
| 初回表示 | `Ada` | `Ada` | 初期化時点では一致する。 |
| 「更新後の一覧を取得する」を押す | `Grace` | `Ada` | 取得結果は更新されたが、画面が参照するコピーは更新されない。 |

更新操作後、画面に表示された観測文は次のとおりであった。

```text
useAsyncData.data: Grace / 画面が参照する visibleUsers: Ada
```

この観測により、APIの再取得失敗ではなく、取得結果と表示用状態の更新追従が分離していることを確認した。

## 修正後 `/fixed`

| 操作 | `useAsyncData.data` | `visibleUsers` | 判定 |
| --- | --- | --- | --- |
| 初回表示 | `Ada` | `Ada` | データソースと導出値が一致する。 |
| 「更新後の一覧を取得する」を押す | `Grace` | `Grace` | 導出値が再取得後のデータソースに追従する。 |

更新操作後、画面に表示された観測文は次のとおりであった。

```text
useAsyncData.data: Grace / 画面が参照する visibleUsers: Grace
```

`computed(() => data.value?.users ?? [])`は表示用の状態を複製せず、`data`を依存元とする。そのため、`refresh()`が`data`を更新すると表示も更新された。
