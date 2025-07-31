export default interface User {
  id: number
  username: string
  encryptedPassword: string
}

export const UserSchema = {
  tableName: 'users',
  schema: `
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    encryptedPassword TEXT NOT NULL
  `,
}
