import Database, { Schema } from '@/lib/Database'
import UserModel, { UserSchema } from '@/models/User'

import { DB_PATH } from '@/config'

// Initialize database
const db = new Database(DB_PATH)

const schemaToRepo = <T>(schema: Schema) => {
  db.createTable(schema.tableName, schema.schema)
  return {
    create: (data: Omit<T, 'id'>) =>
      db.create<T>(schema.tableName, data),

    findById: (id: number) =>
      db.findOne<T>(schema.tableName, { id }),

    findBy: (where: Partial<Omit<T, 'id'>>) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      db.findOne<T>(schema.tableName, where as any),

    findAll: () =>
      db.findMany<T>(schema.tableName),

    update: (id: number, data: Partial<Omit<T, 'id'>>) =>
      db.update<T>(schema.tableName, { id }, data),

    delete: (id: number) =>
      db.delete(schema.tableName, { id }),
  }
}

export default db
export const User = schemaToRepo<UserModel>(UserSchema)
