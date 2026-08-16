# Nuxt 4 AsyncData 更新追従デバッグラボ

`useAsyncData`で取得した一覧を`useState`へ初期値としてコピーしたため、`refresh()`後も画面が古い一覧を表示する問題を再現するNuxt 4／TypeScriptプロジェクトです。

> このコミットは**意図的に不具合を含む状態**です。`pnpm test`は「利用者が見る一覧も再取得結果へ更新される」という契約で失敗します。

## 前提環境

| 項目 | 固定値・要件 |
| --- | --- |
| Node.js | 22以上 |
| Nuxt | 4.5.2 |
| パッケージマネージャー | pnpm 10以上 |

## セットアップと再現

```bash
pnpm install
pnpm test
```

失敗するのは`tests/visible-users.test.ts`の次の契約です。

```text
第01章: 利用者が見る一覧も再取得結果へ更新される
```

初回取得値は`Ada`、更新後取得値は`Grace`に固定しています。テストでは、データソース自体は`Grace`へ更新される一方、初期化時にコピーされた`visibleUsers`が`Ada`のまま残ることを観測します。

## 画面での再現

開発サーバーを起動し、`/buggy`を開きます。

```bash
pnpm dev
```

「更新後の一覧を取得する」を押すと、`useAsyncData.data`は`Grace`に変わりますが、`visibleUsers`は`Ada`のままです。

## 構成

| パス | 役割 |
| --- | --- |
| `pages/buggy.vue` | `useState`への初期コピーで表示が古くなるNuxtページ |
| `server/api/users.get.ts` | 初回と更新後の値が決定的なフェイクAPI |
| `tests/visible-users.test.ts` | 失敗する振る舞いテストと対照ケース |

## その他の検証コマンド

```bash
pnpm typecheck
pnpm build
```

修正版では、一覧を`data`から`computed`で導出します。バグと修正は別コミットに分けます。
