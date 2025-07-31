/* eslint-disable @typescript-eslint/no-explicit-any */

import type { NextFunction, Request, Response } from 'express'

export type CustomConsole = {
  log: (..._: any[]) => void
  info: (..._: any[]) => void
  warn: (..._: any[]) => void
  error: (..._: any[]) => void
}

export type Logger = (_: Request, __: Response, ___: NextFunction) => Promise<void>

export type LogError = (_: unknown, ...__: string[]) => void

export type LoggerModule = {
  customConsole: CustomConsole
  logger: Logger
  logError: LogError
}
