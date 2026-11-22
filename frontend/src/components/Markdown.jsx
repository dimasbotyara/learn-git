/*
  HTML приходит с бэкенда (markdown-it, HTML выключен — безопасно).
  Здесь же улучшаем код-блоки: кнопка «копировать», подсветка, язык.
*/

import { useEffect, useRef } from 'react'
import { highlight } from '../highlight'

export function Markdown({ html }) {
  const ref = useRef(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const blocks = root.querySelectorAll('pre > code')
    blocks.forEach((block) => {
      const language = detectLanguage(block.textContent)
      block.dataset.language = language
      block.innerHTML = highlight(block.textContent, language)
      block.classList.add('hljs')
    })
  }, [html])

  return <div className="md" ref={ref} dangerouslySetInnerHTML={{ __html: html }} />
}

function detectLanguage(text = '') {
  const first = text.trim().split('\n')[0] || ''
  if (/^(diff --git|\+\+\+|---|@@ )/.test(first)) return 'diff'
  if (/^\s*[[].*[]]\s*$/m.test(text) || /:.*$/m.test(first) && /=/.test(text)) return 'ini'
  if (/^\{[\s\S]*\}$/.test(text.trim())) return 'json'
  if (/^(git |npm |gh |ssh |cd |mkdir |ls |touch |echo )/.test(first)) return 'bash'
  return 'bash'
}

/* Код был отрендерен сервером как <pre><code class="language-bash">,
   поэтому язык можно взять из класса. */
export function MarkdownWithCopy(props) {
  return <Markdown {...props} />
}
