import { NanaError, NanaRouter } from '@harlos/nana'

import { User } from '@/db'
import { UserCtx } from '@/models/ctx'
import { verifyPassword } from '@/services/password'
import { createSession, deleteSession } from '@/session'

const authRouter = new NanaRouter<UserCtx>()

authRouter.post('/login', async({ body: { username, password } }) => {
  const user = await User.findBy({ username })
  if (!user) throw new NanaError(404, '未找到使用者')
  if (!verifyPassword(password, user.encryptedPassword))
    throw new NanaError(404, '未找到使用者')
  const sessionId = createSession(user.id)
  return { sessionId }
})

authRouter.delete('/logout', async({ user, sessionId }) => {
  if (!user || !sessionId) throw new NanaError(401, '未登入')
  deleteSession(sessionId)
  return { success: true }
})

export default authRouter
