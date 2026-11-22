/*
  HTML приходит с бэкенда (markdown-it, HTML выключен — безопасно).
  Здесь же улучшаем код-блоки: рамка, язык, подсветка, кнопка «копировать».
*/

import { useEffect, useRef } from 'react'
import { highlight } from '../highlight'
import { IconCheck, IconCopy } from './Icons'

export function Markdown({ html }) {
  const ref = useRef(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const blocks = root.querySelectorAll('pre > code')
    blocks.forEach((block) => {
      if (block.dataset.enhanced) return
      block.dataset.enhanced = '1'
      const code = block.textContent
      const language = detectLanguage(code)
      block.dataset.language = language
      block.dataset.code = code
      block.innerHTML = highlight(code, language)
      block.classList.add('hljs')
      enhancePre(block.parentElement)
    })
  }, [html])

  return <div className="md" ref={ref} dangerouslySetInnerHTML={{ __html: html }} />
}

const LABELS = {
  bash: 'bash',
  diff: 'diff',
  ini: 'config',
  json: 'json',
  plaintext: 'text',
}

function enhancePre(pre) {
  if (!pre || pre.dataset.enhanced) return
  pre.dataset.enhanced = '1'
  const code = pre.querySelector('code')
  const language = code?.dataset.language || 'bash'

  const wrapper = document.createElement('div')
  wrapper.className = 'code'

  const head = document.createElement('div')
  head.className = 'code__head'
  head.innerHTML =
    '<div class="code__dots" aria-hidden="true">' +
    '<span class="code__dot"></span><span class="code__dot"></span><span class="code__dot"></span>' +
    `</div><span class="code__lang">${LABELS[language] || language}</span>`

  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'code__copy'
  button.innerHTML = copyIcon()
  head.appendChild(button)

  pre.replaceWith(wrapper)
  wrapper.appendChild(head)
  wrapper.appendChild(pre)

  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(code.dataset.code || code.textContent)
      button.classList.add('code__copy--done')
      button.innerHTML = checkIcon()
      setTimeout(() => {
        button.classList.remove('code__copy--done')
        button.innerHTML = copyIcon()
      }, 1600)
    } catch {
      /* clipboard недоступен — не мешаем читать */
    }
  })
}

const copyIcon = () =>
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>'
const checkIcon = () =>
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5"/></svg>'

export function detectLanguage(text = '') {
  const trimmed = text.trim()
  const first = trimmed.split('\n')[0] || ''
  if (/^(diff --git|\+\+\+ |--- |@@ )/.test(first)) return 'diff'
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return 'json'
  if (/^\s*\[[\w.-]+\]\s*$/m.test(trimmed) || /^\s*[\w.-]+\s*=\s*\S/m.test(trimmed)) return 'ini'
  return 'bash'
}
