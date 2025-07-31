import UserModel from '@/models/User'

export type UserCtx = {
  user: Omit<UserModel, 'encryptedPassword'> | null
  sessionId?: string
}
