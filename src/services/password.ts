import bcrypt from 'bcrypt'

import { LOCAL_PASSWORD_SALT } from '@/config'

export const encryptPassword = async(password: string) =>
  bcrypt.hash(password, LOCAL_PASSWORD_SALT)

export const verifyPassword = async(password: string, hash: string) =>
  bcrypt.compare(password, hash)
