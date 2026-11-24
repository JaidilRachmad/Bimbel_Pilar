export const HOME_BY_ROLE = {
  admin: '/admin',
  tentor: '/tentor',
  siswa: '/siswa',
}

export const homePath = (role) => HOME_BY_ROLE[role] ?? '/login'