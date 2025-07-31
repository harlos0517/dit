/* eslint-disable @typescript-eslint/no-explicit-any */

import chalk from 'chalk'
import cleanStack from 'clean-stack'
import { getNamespace } from 'cls-hooked'
import type { NextFunction, Request, Response } from 'express'
import { DateTime } from 'luxon'
import { UAParser } from 'ua-parser-js'

import { CustomConsole, LogError, Logger } from '@/lib/logger/types'
import { highlight } from '@/lib/terminal-highlight'

const getIdText = (id: string | undefined) => {
  const idText = id ? chalk.hex(`#${id.slice(0, 6)}`)(id.slice(0, 8)) : '  MAIN  '
  return chalk.bold(`[${idText}]`)
}

const getLogHeader = (id: string | undefined) => {
  const date = chalk.bold.gray(DateTime.now().setZone('UTC+8').toFormat('HH:mm:ss.SSS'))
  return `${getIdText(id)} ${date}`
}

const getMethodText = (method: string) => {
  switch (method) {
    case 'GET'   : return chalk.bgHex('#0F6AB4')(' GET  ')
    case 'HEAD'  : return chalk.bgHex('#FFD20F')(' HEAD ')
    case 'POST'  : return chalk.bgHex('#10A54A')(' POST ')
    case 'PUT'   : return chalk.bgHex('#C5862B')(' PUT  ')
    case 'DELETE': return chalk.bgHex('#A41E22')('DELETE')
    case 'PATCH' : return chalk.bgHex('#D38042')('PATCH ')
    default      : return chalk.bgHex('#888888')(method.toUpperCase())
  }
}

const getStatusText = (status: string | number) => {
  const statusCode = Number(status)
  const text = ` ${statusCode || '???'}  `
  if (statusCode < 200) return chalk.bgBlueBright(text)
  if (statusCode < 300) return chalk.bgGreenBright(text)
  if (statusCode < 400) return chalk.bgYellowBright(text)
  if (statusCode < 500) return chalk.bgRedBright(text)
  if (statusCode < 600) return chalk.bgHex('#880000')(text)
  return chalk.bgHex('#440000')(text)
}

const getAttributeText = (name: string, value: string | null | undefined, pad = true) =>
  value ? `${pad ? ' ' : ''}${chalk.bold.bgGray(name)} ${value}` : ''

const modifyString = (str: string) => {
  const LEN = 64
  const HALF = Math.floor((LEN - 2) / 2)
  const oneLine = str.replace(/(?:\r\n|\r|\n)/g, ' ')
  const trimmed = oneLine.length > LEN
    ? oneLine.slice(0, HALF) + '..' + oneLine.slice(-HALF)
    : oneLine
  return trimmed
}

const objectPrettify = (obj: any) => {
  try {
    if (typeof obj === 'string')
      return highlight(modifyString(obj), 'html')
    if (typeof obj === 'object' && obj !== null) {
      const simplifyObject = (obj: any) => {
        const newObj: any = {}
        Object.entries(obj).forEach(([k, v]) => {
          if (typeof v === 'string') newObj[k] = modifyString(v)
          else if (typeof v === 'object') newObj[k] = convert(v)
          else newObj[k] = v
        })
        return newObj
      }
      const convert = (obj: any): any => {
        if (obj === null) return null
        if (Array.isArray(obj)) return obj.map(convert)
        if (obj.constructor === DateTime)
          return '<DateTime>' + obj.toFormat('yyyy-MM-dd HH:mm:ss Z')
        if (obj.constructor && obj.constructor !== Object) return `<${obj.constructor?.name}>`
        return simplifyObject(obj)
      }
      if (Object.keys(simplifyObject(obj)).length === 0) return undefined
      const str = JSON.stringify(convert(obj))
      return highlight(str, 'json')
    }
  } catch(err) {
    logError(err)
    return obj
  }
  return obj
}

const customLogger = (level: 'log' | 'info' | 'warn' | 'error') =>
  (...messages: any[]) => {
    const id = getNamespace('request')?.get('id')
    console[level](getLogHeader(id), ...messages)
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
  const urlText = highlight(req.url || '', 'uri')
  const ipText = getAttributeText('IP', req.ip)
  const ua = new UAParser(req.headers['user-agent']).getResult()
  const uaStr =
    (ua.device.model ?
      ((ua.device.vendor || '?') + ' ' +
       (ua.device.type || '?') + ' ' +
       (ua.device.model || '?') + ','
      ) : '') +
    (ua.cpu.architecture ? (ua.cpu.architecture + ',') : '') +
    (ua.os.name ? ((ua.os.name || '?') + ' ' + (ua.os.version || '?') + ',') : '') +
    (ua.browser.name ? ((ua.browser.name || '?') + ' ' + (ua.browser.major || '?') + ' ') : '')
  const uaText = getAttributeText('UA', uaStr.trim())
  const bodyText = req.body ? (' ' + objectPrettify(req.body)) : ''
  const full = `${methodText} ${urlText}${ipText}${uaText}${bodyText}`
  customConsole.info(full)
  await next()
  const responseTime = startTime ? Date.now() - startTime : null
  const statusText = getStatusText(res.statusCode)
  const lengthText = ` (${res.getHeader('Content-Length')})`
  const timeText = ` ${responseTime}ms`
  const resBodyText = res.locals.body ? (' ' + objectPrettify(res.locals.body)) : ''
  const resFull = `${statusText}${timeText}${lengthText}${resBodyText}`
  customConsole.info(resFull)
}

export const logError: LogError = (err: unknown, ...prefixes: string[]) => {
  const errorMsg = err instanceof Error
    ? cleanStack(
      err.stack,
      {
        pretty: true,
        basePath: 'work/openpoints/openpoint/',
        pathFilter: path => !/node_modules/.test(path),
      },
    )?.replace(/~\//g, '') || err.message
    : String(err)
  const logMsg = errorMsg.split(/(?:\r\n|\r|\n)/g)
  for (const msg of logMsg) {
    const line = [...prefixes, highlight(msg, 'jsstacktrace')]
    customConsole.error(...line)
  }
}
