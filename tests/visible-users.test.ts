import { computed, ref } from 'vue'
import { describe, expect, it } from 'vitest'

type User = {
  id: string
  name: string
}

const initialUsers: User[] = [{ id: 'user-001', name: 'Ada' }]
const refreshedUsers: User[] = [{ id: 'user-002', name: 'Grace' }]

function createScreenModel() {
  const asyncDataUsers = ref<User[]>(initialUsers)

  // `useAsyncData`のdataを複製せず、表示用の値として導出する。
  const visibleUsers = computed(() => asyncDataUsers.value)

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
    const screen = createScreenModel()

    screen.applyRefreshResult()

    expect(screen.asyncDataUsers.value.map((user) => user.name)).toEqual(['Grace'])
  })

  it('第01章: 利用者が見る一覧も再取得結果へ更新される', () => {
    const screen = createScreenModel()

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
