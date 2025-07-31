import { NODE_ENV } from '@/config'
import { LoggerModule } from '@/lib/logger/types'

const {
  customConsole,
  logger,
  logError,
} = await import(`@/lib/logger/${NODE_ENV}`) as LoggerModule

export { customConsole, logError, logger }
