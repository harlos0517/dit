import { NanaServer } from '@harlos/nana'

import { NODE_ENV, PORT } from '@/config'
import { LoggerModule } from '@/lib/logger/type'

const { logger, customConsole: console } =
  await import(`@/lib/logger/${NODE_ENV}`) as LoggerModule

const server = new NanaServer({
  port: PORT,
  onStart: () => {
    console.log('Server is running on port', PORT)
  },
})
server.expressApp.use(logger)

export default server
