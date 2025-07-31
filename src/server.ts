import { NanaMiddleware, NanaServer } from '@harlos/nana'

import { PORT } from '@/config'
import { User } from '@/db'
import { logger } from '@/lib/logger'
import { UserCtx } from '@/models/ctx'
import authRouter from '@/routes/auth'
import { getSession } from '@/session'

const server = new NanaServer<UserCtx>({
  port: PORT,
  onStart: () => {
    console.log('Server is running on port', PORT)
  },
})
server.expressApp.use(logger)

server.use(new NanaMiddleware(
  async({ req }) => {
    const sessionId = req.headers['x-session-id'] as string | undefined
    if (!sessionId) return { user: null }
    const session = getSession(sessionId)
    if (!session) return { user: null }
    const user = await User.findById(session.userId)
    if (!user) return { user: null }
    const { id, username } = user
    return { user: { id, username }, sessionId }
  },
))

server.use('auth', authRouter)

export default server
