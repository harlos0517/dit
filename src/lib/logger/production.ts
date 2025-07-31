/* eslint-disable @typescript-eslint/no-explicit-any */

import { CustomConsole, LogError, Logger } from '@/lib/logger/type'
import { getNamespace } from 'cls-hooked'
import type { NextFunction, Request, Response } from 'express'

const getIdText = (id: string | undefined) => {
  const idText = id ? id.slice(0, 8) : '  MAIN  '
  return `[${idText}]`
}

const getMethodText = (method: string) => {
  switch (method) {
    case 'GET'   : return ' GET  '
    case 'HEAD'  : return ' HEAD '
    case 'POST'  : return ' POST '
    case 'PUT'   : return ' PUT  '
    case 'DELETE': return 'DELETE'
    case 'PATCH' : return 'PATCH '
    default      : return method.toUpperCase()
  }
}

const getStatusText = (status: string | number) => {
  const statusCode = Number(status)
  const text = ` ${statusCode || '???'}  `
  return text
}

const getAttributeText = (name: string, value: string | null | undefined, pad = true) =>
  value ? `${pad ? ' ' : ''}${name}: ${value}` : ''

const customLogger = (level: 'log' | 'info' | 'warn' | 'error') =>
  (...messages: any[]) => {
    const id = getNamespace('request')?.get('id')
    console[level](getIdText(id), ...messages)
  }

export const customConsole: CustomConsole = {
  log: customLogger('log'),
  info: customLogger('info'),
  warn: customLogger('warn'),
  error: customLogger('error'),
}

export default customConsole

export const logger: Logger = async(req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now()
  const methodText = getMethodText(req.method)
  const urlText = req.url || ''
  const ipText = getAttributeText('IP', req.ip)
  const full = `${methodText} ${urlText}${ipText}`
  customConsole.info(full)
  await next()
  const responseTime = startTime ? Date.now() - startTime : null
  const statusText = getStatusText(res.statusCode)
  const lengthText = ` (${res.getHeader('Content-Length')})`
  const timeText = ` ${responseTime}ms`
  const resFull = `${statusText}${timeText}${lengthText}`
  customConsole.info(resFull)
}

export const logError: LogError = (err: unknown, ...prefixes: string[]) => {
  const errorMsg = err instanceof Error ? err.message : String(err)
  const logMsg = errorMsg.split(/(?:\r\n|\r|\n)/g)
  for (const msg of logMsg) {
    const line = [...prefixes, msg]
    customConsole.error(...line)
  }
}
