# Nuxt 4 AsyncData 更新追従デバッグラボ

Nuxt 4で`useAsyncData`が返す一覧を`useState`へ初期値としてコピーすると、`refresh()`後に画面表示が古いまま残る問題を、再現・観測・修正・回帰確認できる最小プロジェクトです。

## 扱う契約

`useState(key, init)`の`init`は、状態が未初期化のときの値を決めます。`init`内で参照した別のRefと継続的な同期を作るものではありません。サーバー状態を常に表示したい場合は、値をコピーせず`data`を直接使うか、`computed`で導出します。

## 前提環境

| 項目 | 固定値・要件 |
| --- | --- |
| Node.js | 22以上 |
| Nuxt | 4.5.2 |
| パッケージマネージャー | pnpm 10以上 |

## セットアップと検証

```bash
pnpm install
pnpm test
pnpm typecheck
pnpm build
```

最終状態では、振る舞いテスト3件、型検査、本番ビルドが成功します。

## ブラウザでの比較

開発サーバーを起動します。

```bash
pnpm dev
```

`/buggy`と`/fixed`で「更新後の一覧を取得する」を押してください。フェイクAPIは初回に`Ada`、更新後に`Grace`を返します。

| ページ | `useAsyncData.data`の更新後 | `visibleUsers`の更新後 | 結果 |
| --- | --- | --- | --- |
| `/buggy` | `Grace` | `Ada` | 初期コピーが古いまま残る。 |
| `/fixed` | `Grace` | `Grace` | 導出値が取得結果に追従する。 |

## 実装の差分

バグ状態は、取得結果を`useState`の初期値としてコピーします。

```ts
const visibleUsers = useState<User[]>(
  'debug-visible-users-buggy',
  () => data.value?.users ?? [],
)
```

修正版は、表示一覧を`data`から導出します。

```ts
const visibleUsers = computed(() => data.value?.users ?? [])
```

## 構成

| パス | 役割 |
| --- | --- |
| `pages/buggy.vue` | 初期コピーが更新へ追従しないバグ状態のNuxtページ |
| `pages/fixed.vue` | `computed`で表示値を導出する修正版ページ |
| `server/api/users.get.ts` | 初回と更新後の値を固定したフェイクAPI |
| `tests/visible-users.test.ts` | 元の失敗ケースを残した回帰テスト |
| `docs/debugging-record.md` | 仮説比較と根本原因の調査記録 |
| `docs/browser-observations.md` | バグ状態と修正後をブラウザで観測した記録 |

## Git履歴でバグを再実行する

バグ状態を確認するには、最初のコミットへ移動して失敗テストを実行します。

```bash
git checkout b9811c1
pnpm test
# expected ['Ada'] to deeply equal ['Grace'] で失敗する
```

その後、最終コミットへ戻して回帰確認します。

```bash
git switch main
pnpm test
pnpm typecheck
pnpm build
```

`docs/buggy-test-output.txt`と`docs/fixed-verification-output.txt`には、各状態で保存した実行結果があります。
