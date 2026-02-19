const seededUsers = [
  {
    id: 'a7dc26d7-8f7d-4f4a-a316-7c53e7c7e5d4',
    name: 'John Smith',
    email: 'john.smith@wedgewoodhoa.org',
    assignedRoleId: '84e9b4f4-34f5-458c-b9b3-e8a6c22d1891',
    status: 'Active'
  },
  {
    id: 'f2e73d53-39f3-4946-8ce0-1a4a7a18caec',
    name: 'Priya Bhatt',
    email: 'priya.bhatt@wedgewoodhoa.org',
    assignedRoleId: '84e9b4f4-34f5-458c-b9b3-e8a6c22d1891',
    status: 'Active'
  },
  {
    id: '7b847e0e-4ed4-4cb1-bb0f-72c81b3226c0',
    name: 'Marcus Lee',
    email: 'marcus.lee@wedgewoodhoa.org',
    assignedRoleId: 'ba35f296-f0cf-4602-af83-ea1e9ec8da07',
    status: 'Inactive'
  },
  {
    id: '4f8915e7-06b8-43b4-978a-1ebadf8336dd',
    name: 'Ana Reynolds',
    email: 'ana.reynolds@wedgewoodhoa.org',
    assignedRoleId: 'ba35f296-f0cf-4602-af83-ea1e9ec8da07',
    status: 'Active'
  },
  {
    id: '5bb0f5f3-0898-47f9-94dd-5c4d37f2bbcb',
    name: 'Kevin Brown',
    email: 'kevin.brown@wedgewoodhoa.org',
    assignedRoleId: null,
    status: 'Inactive'
  }
]

export function createInitialUsers() {
  return seededUsers.map((user) => ({ ...user }))
}
