import chalk from 'chalk'

/**
 * A function that applies styles, typically one of the chalk builder functions
 */
export type StyleFn = (s: string) => string

/**
 * Either one {@link StyleFn} or several
 */
export type Styles = StyleFn | StyleFn[]

/**
 * Theme objects can be either a Map or object where the keys are the selectors
 * and the values are either a styling function or an array of styling
 * functions to be applied in order.
 *
 * The `_` style rule applies to the block as a whole, and is used
 * as the default style. This is where you'd usually port a PrismJS
 * theme's `code[class*="language-"]` css rule.
 *
 * The `lineNumber` style rule will apply to line numbers, if they
 * are used.
 *
 * The semantics are similar to CSS, where a nested property will be
 * applied to nodes within that nesting stack with a higher
 * priority the more tags that match, and later rules taking
 * precedence over earlier ones. It's _not_ a full CSS selector
 * syntax though, so things like `.token.italic.bold` aren't
 * supported. Just individual token class names, possibly nested.
 * Also, chalk is not CSS, and a terminal is not a browser, so
 * there are some differences and limitations of course.
 *
 * Aliases are also not supported, styles have to be applied to the
 * actual parsed class names PrismJS provides.
 */
export type Theme = Record<string, Styles> | Map<string, Styles>

const vsCodeDark: Theme = {
  // default
  _: chalk.hex('#d4d4d4'),

  // json
  property: chalk.hex('#9cdcfe'),
  string: chalk.hex('#ce9178'),
  comment: chalk.hex('#6a9955').italic,
  number: chalk.hex('#b5cea8'),
  punctuation: chalk.hex('#808080'),
  operator: chalk.hex('#d4d4d4'),
  boolean: chalk.hex('#569CD6'),
  null: chalk.hex('#569CD6'),

  // uri
  scheme: chalk.hex('#808080'),
  fragment: chalk.hex('#808080'),
  query: chalk.hex('#808080'),
  'query pair': chalk.hex('#d4d4d4'),
  'query pair key': chalk.hex('#9cdcfe'),
  'query pair value': chalk.hex('#ce9178'),
  authority: chalk.hex('#808080'),
  path: chalk.hex('#d4d4d4').bold,
  'path path-separator': chalk.hex('#808080'),

  // sql
  // comment, string, number, punctuation, operator, boolean already defined
  variable: chalk.hex('#9cdcfe'),
  identifier: chalk.hex('#569CD6'),
  function: chalk.hex('#dcdcaa'),
  keyword: chalk.hex('#c586c0'),

  // jsstacktrace
  'error-message': chalk.red,
  'stack-frame': chalk.red,
  'stack-frame not-my-code': chalk.hex('#808080'),
  'stack-frame filename': chalk.hex('#d4d4d4'),
  'stack-frame function': chalk.hex('#dcdcaa'),
  'stack-frame keyword': chalk.hex('#c586c0'),
  'stack-frame alias':  chalk.hex('#9cdcfe'),
  'stack-frame line-number': chalk.hex('#b5cea8'),

  // xml
  prolog: chalk.hex('#808080'),
  tag: chalk.hex('#569cd6'),
  'tag punctuation': chalk.hex('#808080'),
  'tag namespace': chalk.hex('#c586c0'),
  'tag attr-name': chalk.hex('#9cdcfe'),
  'tag attr-value': chalk.hex('#ce9178'),
}

export const themes = {
  vsCodeDark,
}
