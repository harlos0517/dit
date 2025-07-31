import { config } from 'dotenv'

config()

export const NODE_ENV = process.env.NODE_ENV || 'development'
export const DEV = NODE_ENV !== 'production'
export const PROD = !DEV

export const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 7777
