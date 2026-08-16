# デバッグ記録：`refresh()`後に一覧が古いままになる

## 前提

Nuxt 4.5.2、Vue 3.5.41、TypeScript、Vitest 3.2.7で確認した。`/api/users`は初回に`Ada`、更新後に`Grace`を返す決定的なフェイクAPIである。

## 期待と実際

利用者の期待は、更新ボタンが`refresh()`を完了した後、画面の一覧も新しい取得結果を表示することである。バグ状態では、データ取得結果が`Grace`へ更新されても、画面表示は`Ada`のままだった。

## 仮説比較

| 仮説 | 予測 | 最小実験 | 結果 | 判定 |
| --- | --- | --- | --- | --- |
| APIが更新後の値を返していない | `useAsyncData.data`も`Ada`のまま | `/buggy`で更新後の`data`を表示する | `data`は`Grace` | 棄却 |
| `refresh()`が完了前に表示を読んでいる | `await refresh()`後も`data`が古い | `await refresh()`後のログを比較する | `data`は`Grace` | 棄却 |
| `visibleUsers`が取得結果と別の状態である | `data`だけが更新され、`visibleUsers`は`Ada`に残る | `/buggy`で両方を同時表示する | `data: Grace`、`visibleUsers: Ada` | 採用 |
| `computed`にしても値が更新されない | `/fixed`でも一覧は`Ada`のまま | `computed(() => data.value?.users ?? [])`で同じ操作をする | `data`、表示ともに`Grace` | 棄却 |

## 根本原因

バグ状態は次のように、`useAsyncData`の結果を`useState`の初期値としてコピーしていた。

```ts
const visibleUsers = useState<User[]>(
  'debug-visible-users-buggy',
  () => data.value?.users ?? [],
)
```

`useState`の初期化関数は、状態が未初期化のときの値を決めるためのものである。`data`を監視して新しい値をコピーし続けるものではない。このため、`visibleUsers`は初期配列を持つ別のRefになり、後の`data.value`置換に追従しなかった。

## 最小修正

表示の正本を複製せず、取得結果から導出する。

```ts
const visibleUsers = computed(() => data.value?.users ?? [])
```

`computed`は依存するリアクティブな値を追跡するため、`refresh()`が`data.value`を更新すると表示も更新される。

## 回帰確認

元の失敗ケース「利用者が見る一覧も再取得結果へ更新される」を残し、修正後に成功させた。さらに、更新後の取得元そのものが`Grace`へ変わる対照ケースと、`computed`が追従するケースを実行した。`pnpm test`、`pnpm typecheck`、`pnpm build`はすべて成功し、ブラウザでも`/fixed`の表示が`Grace`へ更新された。
