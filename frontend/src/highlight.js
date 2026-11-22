/*
  Подсветка кода через highlight.js с собственной темой на CSS-переменных:
  цвета берутся из активной палитры, поэтому подсветка меняется вместе с темой.
*/

import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import diff from 'highlight.js/lib/languages/diff'
import ini from 'highlight.js/lib/languages/ini'
import json from 'highlight.js/lib/languages/json'
import javascript from 'highlight.js/lib/languages/javascript'
import plaintext from 'highlight.js/lib/languages/plaintext'
import yaml from 'highlight.js/lib/languages/yaml'
import markdown from 'highlight.js/lib/languages/markdown'

let registered = false

function register() {
  if (registered) return
  hljs.registerLanguage('bash', bash)
  hljs.registerLanguage('shell', bash)
  hljs.registerLanguage('sh', bash)
  hljs.registerLanguage('console', bash)
  hljs.registerLanguage('diff', diff)
  hljs.registerLanguage('ini', ini)
  hljs.registerLanguage('json', json)
  hljs.registerLanguage('javascript', javascript)
  hljs.registerLanguage('js', javascript)
  hljs.registerLanguage('plaintext', plaintext)
  hljs.registerLanguage('text', plaintext)
  hljs.registerLanguage('yaml', yaml)
  hljs.registerLanguage('markdown', markdown)
  hljs.registerAliases(['gitignore', 'dotenv'], { languageName: 'bash' })
  registered = true
}

export function highlight(code, language = 'bash') {
  register()
  const lang = language && hljs.getLanguage(language) ? language : 'bash'
  try {
    return hljs.highlight(code, { language: lang, ignoreIllegals: true }).value
  } catch {
    return code.replace(/[&<>]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[char])
  }
}

/* Тема для токенов hljs: всё на переменных палитры. */
export const HLJS_CSS = `
.hljs { color: var(--term-fg); background: transparent; }
.hljs-comment, .hljs-quote { color: var(--fg-faint); font-style: italic; }
.hljs-keyword, .hljs-selector-tag, .hljs-built_in { color: var(--purple); }
.hljs-string, .hljs-attr, .hljs-template-variable { color: var(--green); }
.hljs-number, .hljs-literal { color: var(--orange); }
.hljs-title, .hljs-section, .hljs-name { color: var(--blue); font-weight: 600; }
.hljs-variable, .hljs-params { color: var(--yellow); }
.hljs-deletion { color: var(--red); background: color-mix(in srgb, var(--red) 12%, transparent); }
.hljs-addition { color: var(--green); background: color-mix(in srgb, var(--green) 12%, transparent); }
.hljs-meta { color: var(--fg-muted); }
.hljs-symbol, .hljs-bullet { color: var(--aqua); }
.hljs-emphasis { font-style: italic; }
.hljs-strong { font-weight: 700; }
`

/* Bash без разметки выглядит как терминал, но подсвечивать надо аккуратно:
   первое слово — команда (синий/жирный), флаги — жёлтые, строки — зелёные. */
export function highlightTerminalLine(line) {
  const escaped = line
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return escaped
    .replace(/(^|\s)(--?[\w-]+)/g, '$1<span class="hljs-attr">$2</span>')
    .replace(/(&quot;.*?&quot;|'[^']*'|"[^"]*")/g, '<span class="hljs-string">$1</span>')
    .replace(/^(\s*)(git|npm|npx|cd|ls|mkdir|touch|echo|ssh|gh|cat|code|ssh-keygen)\b/, '$1<span class="hljs-title">$2</span>')
}
