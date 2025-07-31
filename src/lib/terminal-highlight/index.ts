// Source: https://github.com/isaacs/prismjs-terminal
// LICENSE: https://github.com/isaacs/prismjs-terminal/blob/main/LICENSE.md

import chalk from 'chalk'
import Prism from 'prismjs'

import { StyleFn, Theme, themes } from './themes'

// primary use is to highlight ts/js programs, call
// loadLanguages() to support others.
import loadLanguages from 'prismjs/components/index.js'
loadLanguages(['typescript', 'javascript', 'json', 'uri', 'sql', 'jsstacktrace', 'xml'])


type CompiledRule = [stack: string[], styles: StyleFn[]][]

/**
 * A theme that has been compiled for use in highlighting functions
 * Optimized for faster lookup of tokens, with rules sorted based on
 * priority.
 */
type CompiledTheme = Map<string, CompiledRule>

type Tokens = string | Prism.Token | (string | Prism.Token)[]


const parseSelector = (s: string): string[][] => {
  const parsed: string[][] = []
  const selectors = s.split(',').map(s => s.trim())
  for (const s of selectors) parsed.push(s.split(/\s+/))
  return parsed
}

const arraysEq = (a: string[], b: string[]) =>
  a.length === b.length && !a.some((aa, i) => aa !== b[i])

const stackMatch = (
  ruleStack: string[], // the stack defined in the rule
  stack: string[], // the actual stack
) => {
  if (!ruleStack.length) return true
  let j = 0
  for (const t of ruleStack) {
    if (t === stack[j]) {
      j++
      if (j === ruleStack.length) return true
    }
  }
  return false
}

const filterRule = (stack: string[], rule: CompiledRule): CompiledRule =>
  rule.filter(([ruleStack]) => stackMatch(ruleStack, stack))

// return style functions sorted in *ascending* order of priority
const getStyles = (stack: string[], rule: CompiledRule): StyleFn[] => {
  const f = filterRule(stack, rule)
    .sort(([a], [b]) => a.length - b.length)
    .map(([_, r]) => r)
  return f.reduce((s: StyleFn[], r: StyleFn[]) => {
    s.push(...r)
    return s
  }, [])
}

const applyStyles = (
  content: string,
  tag: string,
  stack: string[],
  t: CompiledTheme,
) => {
  const rule = t.get(tag)
  if (!rule) return content
  const styles = getStyles(stack, rule)
  for (let i = styles.length - 1; i > -1; i--)
    content = styles[i](content)
  return content
}

const stringify = (
  tok: Tokens,
  theme: CompiledTheme,
  stack: string[] = [],
): string => {
  if (typeof tok === 'string') return tok
  if (Array.isArray(tok)) return tok.map(t => stringify(t, theme, stack)).join('')
  return applyStyles(
    stringify(tok.content, theme, [...stack, tok.type]),
    tok.type,
    stack,
    theme,
  )
}

const compiledThemes = new Map<Theme, CompiledTheme>()
const compileTheme = (t: Theme): CompiledTheme => {
  const pre = compiledThemes.get(t)
  if (pre) return pre
  if (!(t instanceof Map)) {
    const c = compileTheme(new Map(Object.entries(t)))
    compiledThemes.set(t, c)
    return c
  }
  const c: CompiledTheme = new Map()
  for (const [s, tr] of t.entries()) {
    const selectors = parseSelector(s)
    for (const sel of selectors) {
      // sel is a stack, so `x y z` becomes `['x', 'y', 'z']`
      // add the stack with the rule to the last item,
      // so we add [['x', 'y'], tr] to 'z'
      const last = sel[sel.length - 1]
      sel.pop()
      const cr = c.get(last) || []
      let pushed = false
      for (const [stack, rules] of cr) {
        if (arraysEq(sel, stack)) {
          rules.push(...(Array.isArray(tr) ? tr : [tr]))
          pushed = true
          break
        }
      }
      if (!pushed) cr.push([sel, Array.isArray(tr) ? tr : [tr]])
      if (!c.has(last)) c.set(last, cr)
    }
  }

  const def = c.get('_')
  if (!def) c.set('_', [[[], [chalk.reset]]])

  compiledThemes.set(t, c)
  return c
}

/**
 * Highlight the string of code provided, returning the string of highlighted
 * code.
 */
export const highlight = (
  code: string,
  language = 'json',
  theme: keyof typeof themes = 'vsCodeDark',
): string => {
  const t = typeof theme === 'string' ? themes[theme] : theme
  if (!t) throw new Error('invalid theme: ' + theme)
  const c = compileTheme(t)
  return applyStyles(stringify(Prism.tokenize(code, Prism.languages[language]), c), '_', [], c)
}
