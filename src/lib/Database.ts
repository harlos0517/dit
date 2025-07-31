import Sqlite from 'better-sqlite3'

type SqlValue = string | number | boolean | null | Buffer
type WhereClause = Record<string, SqlValue>
type OrderBy = { column: string, direction?: 'ASC' | 'DESC' }

export default class Database {
  private db: Sqlite.Database

  constructor(filename: string = ':memory:') {
    this.db = new Sqlite(filename)
    this.db.pragma('journal_mode = WAL')
    this.db.pragma('foreign_keys = ON')
  }

  // Generic CRUD operations
  create<T>(
    table: string,
    data: Omit<T, 'id'>,
  ): T & { id: number } {
    const columns = Object.keys(data)
    const placeholders = columns.map(() => '?').join(', ')
    const values = Object.values(data)

    const stmt = this.db.prepare(
      `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`,
    )
    const result = stmt.run(...values)

    return { id: result.lastInsertRowid as number, ...data } as T & { id: number }
  }

  findOne<T>(
    table: string,
    where?: WhereClause,
  ): T | undefined {
    let query = `SELECT * FROM ${table}`
    const values: SqlValue[] = []

    if (where && Object.keys(where).length > 0) {
      const conditions = Object.keys(where).map(key => `${key} = ?`)
      query += ` WHERE ${conditions.join(' AND ')}`
      values.push(...Object.values(where))
    }

    query += ' LIMIT 1'

    const stmt = this.db.prepare(query)
    return stmt.get(...values) as T | undefined
  }

  findMany<T>(
    table: string,
    options?: {
      where?: WhereClause
      orderBy?: OrderBy | OrderBy[]
      limit?: number
      offset?: number
    },
  ): T[] {
    let query = `SELECT * FROM ${table}`
    const values: SqlValue[] = []

    if (options?.where && Object.keys(options.where).length > 0) {
      const conditions = Object.keys(options.where).map(key => `${key} = ?`)
      query += ` WHERE ${conditions.join(' AND ')}`
      values.push(...Object.values(options.where))
    }

    if (options?.orderBy) {
      const orderClauses = Array.isArray(options.orderBy)
        ? options.orderBy
        : [options.orderBy]

      const orderBy = orderClauses
        .map(({ column, direction = 'ASC' }) => `${column} ${direction}`)
        .join(', ')

      query += ` ORDER BY ${orderBy}`
    }

    if (options?.limit) {
      query += ` LIMIT ${options.limit}`
      if (options?.offset)
        query += ` OFFSET ${options.offset}`

    }

    const stmt = this.db.prepare(query)
    return stmt.all(...values) as T[]
  }

  update<T>(
    table: string,
    where: WhereClause,
    data: Partial<Omit<T, 'id'>>,
  ): number {
    const setColumns = Object.keys(data)
    const setClause = setColumns.map(key => `${key} = ?`).join(', ')
    const setValues = Object.values(data)

    const whereColumns = Object.keys(where)
    const whereClause = whereColumns.map(key => `${key} = ?`).join(' AND ')
    const whereValues = Object.values(where)

    const stmt = this.db.prepare(
      `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`,
    )

    return stmt.run(...setValues, ...whereValues).changes
  }

  delete(table: string, where: WhereClause): number {
    const whereColumns = Object.keys(where)
    const whereClause = whereColumns.map(key => `${key} = ?`).join(' AND ')
    const whereValues = Object.values(where)

    const stmt = this.db.prepare(`DELETE FROM ${table} WHERE ${whereClause}`)
    return stmt.run(...whereValues).changes
  }

  // Raw query support
  query<T>(sql: string, params: SqlValue[] = []): T[] {
    const stmt = this.db.prepare(sql)
    return stmt.all(...params) as T[]
  }

  exec(sql: string): void {
    this.db.exec(sql)
  }

  // Transaction support
  transaction<T>(fn: () => T): T {
    return this.db.transaction(fn)()
  }

  // Schema management
  createTable(table: string, schema: string): void {
    this.db.exec(`CREATE TABLE IF NOT EXISTS ${table} (${schema})`)
  }

  close(): void {
    this.db.close()
  }
}

export interface Schema {
  tableName: string
  schema: string
}
