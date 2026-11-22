import { useMemo, useState } from 'react'
import { highlight } from '../highlight'
import { IconCopy, IconCheck } from './Icons'
import { useI18n } from '../i18n'

export function CodeBlock({ code, language = 'bash', showCopy = true, headless = false }) {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)
  const html = useMemo(() => highlight(code.trim(), language), [code, language])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code.trim())
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* clipboard недоступен — не мешаем читать */
    }
  }

  return (
    <div className={`code ${headless ? 'code--headless' : ''}`}>
      {!headless && (
        <div className="code__head">
          <div className="code__dots" aria-hidden="true">
            <span className="code__dot" />
            <span className="code__dot" />
            <span className="code__dot" />
          </div>
          <span className="code__lang">{language}</span>
          {showCopy && (
            <button
              type="button"
              className={`code__copy ${copied ? 'code__copy--done' : ''}`}
              onClick={copy}
              aria-label={t('common.copy')}
            >
              {copied ? <IconCheck width={14} height={14} /> : <IconCopy width={14} height={14} />}
            </button>
          )}
        </div>
      )}
      <pre>
        <code className="hljs" dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  )
}
