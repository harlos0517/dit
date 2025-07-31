import { config } from 'dotenv'

config()

export const NODE_ENV = process.env.NODE_ENV || 'development'
export const DEV = NODE_ENV !== 'production'
export const PROD = !DEV

export const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 7777

export const DB_PATH = process.env.DB_PATH || './db.sqlite'

export const LOCAL_PASSWORD_SALT = process.env.LOCAL_PASSWORD_SALT || 'dit'
export const SESSION_EXPIRATION = process.env.SESSION_EXPIRATION &&
  parseInt(process.env.SESSION_EXPIRATION, 10) || null
