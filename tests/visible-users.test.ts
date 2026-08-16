import { computed, ref } from 'vue'
import { describe, expect, it } from 'vitest'

type User = {
  id: string
  name: string
}

const initialUsers: User[] = [{ id: 'user-001', name: 'Ada' }]
const refreshedUsers: User[] = [{ id: 'user-002', name: 'Grace' }]

function createBuggyScreenModel() {
  const asyncDataUsers = ref<User[]>(initialUsers)

  // Nuxt画面の `useState(() => data.value?.users ?? [])` と同じく、
  // 初期化時点の配列を別の状態として保持する。
  const visibleUsers = ref(asyncDataUsers.value)

  function applyRefreshResult() {
    asyncDataUsers.value = refreshedUsers
  }

  return {
    asyncDataUsers,
    visibleUsers,
    applyRefreshResult,
  }
}

describe('一覧画面の更新追従', () => {
  it('第01章: 再取得結果はデータソースに反映される', () => {
    const screen = createBuggyScreenModel()

    screen.applyRefreshResult()

    expect(screen.asyncDataUsers.value.map((user) => user.name)).toEqual(['Grace'])
  })

  it('第01章: 利用者が見る一覧も再取得結果へ更新される', () => {
    const screen = createBuggyScreenModel()

    screen.applyRefreshResult()

    expect(screen.visibleUsers.value.map((user) => user.name)).toEqual(['Grace'])
  })

  it('第01章: computedで導出した一覧はデータソースの更新に追従する', () => {
    const asyncDataUsers = ref<User[]>(initialUsers)
    const visibleUsers = computed(() => asyncDataUsers.value)

    asyncDataUsers.value = refreshedUsers

    expect(visibleUsers.value.map((user) => user.name)).toEqual(['Grace'])
  })
})
