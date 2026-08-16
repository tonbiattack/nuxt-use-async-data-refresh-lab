type User = {
  id: string
  name: string
}

type UsersResponse = {
  revision: 'initial' | 'refreshed'
  users: User[]
}

const initial: UsersResponse = {
  revision: 'initial',
  users: [{ id: 'user-001', name: 'Ada' }],
}

const refreshed: UsersResponse = {
  revision: 'refreshed',
  users: [{ id: 'user-002', name: 'Grace' }],
}

export default defineEventHandler((event) => {
  const revision = getQuery(event).revision

  return revision === 'refreshed' ? refreshed : initial
})
