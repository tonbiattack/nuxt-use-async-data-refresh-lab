<script setup lang="ts">
type User = {
  id: string
  name: string
}

type UsersResponse = {
  revision: 'initial' | 'refreshed'
  users: User[]
}

const requestedRevision = ref<'initial' | 'refreshed'>('initial')

const { data, refresh, status } = await useAsyncData<UsersResponse>(
  'debug-users-buggy',
  () => $fetch('/api/users', { query: { revision: requestedRevision.value } }),
)

// `init`は初期値を決めるだけで、dataとの継続同期を作らない。
const visibleUsers = useState<User[]>(
  'debug-visible-users-buggy',
  () => data.value?.users ?? [],
)

const lastObservation = ref('初回ロード後。まだ更新していません。')

async function refreshUsers() {
  requestedRevision.value = 'refreshed'
  await refresh()

  lastObservation.value = [
    `useAsyncData.data: ${data.value?.users.map((user) => user.name).join(', ') ?? '(empty)'}`,
    `画面が参照する visibleUsers: ${visibleUsers.value.map((user) => user.name).join(', ') || '(empty)'}`,
  ].join(' / ')
}
</script>

<template>
  <main>
    <h1>バグあり：更新後も一覧が古い</h1>
    <p>
      初回取得は <code>Ada</code>、更新後取得は <code>Grace</code> を返すよう固定しています。
      ボタンを押すと、取得結果と画面表示を比較できます。
    </p>

    <p data-testid="request-status">取得状態: {{ status }}</p>
    <p data-testid="source-users">
      <code>useAsyncData.data</code>: {{ data?.users.map((user) => user.name).join(', ') ?? '(empty)' }}
    </p>
    <p data-testid="visible-users">
      <code>visibleUsers</code>: {{ visibleUsers.map((user) => user.name).join(', ') || '(empty)' }}
    </p>

    <button type="button" data-testid="refresh" @click="refreshUsers">
      更新後の一覧を取得する
    </button>

    <p data-testid="observation">{{ lastObservation }}</p>
    <p>
      <NuxtLink to="/">開始ページへ戻る</NuxtLink>
    </p>
  </main>
</template>
