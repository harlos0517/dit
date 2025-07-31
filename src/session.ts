import { SESSION_EXPIRATION } from '@/config'

export const getSession = (sessionId: string) => sessions.get(sessionId)

export const createSession = (userId: number): string => {
  const sessionId = crypto.randomUUID()
  sessions.set(sessionId, { userId, createdAt: Date.now() })
  return sessionId
}

export const deleteSession = (sessionId: string): boolean => sessions.delete(sessionId)

const sessions = new Map<string, { userId: number, createdAt: number }>()


const isSessionValid = (sessionId: string): boolean => {
  const session = sessions.get(sessionId)
  if (!session) return false
  if (!SESSION_EXPIRATION) return true
  const sessionDuration = Date.now() - session.createdAt
  return sessionDuration < SESSION_EXPIRATION * 1000
}

setInterval(() => {
  for (const [sessionId] of sessions.entries())
    if (!isSessionValid(sessionId)) deleteSession(sessionId)
}, 60 * 1000)
