import { useMemo, useState } from 'react'
import { useI18n } from '../i18n'
import { useApi } from '../useApi'
import { api } from '../api'
import { useEffects } from '../effects'
import { IconSearch } from '../components/Icons'

export function CheatsheetPage() {
  const { t, locale } = useI18n()
  const { data, loading } = useApi((signal) => api.cheatsheet(locale, signal), [locale])
  const [query, setQuery] = useState('')
  const { toast } = useEffects()

  const groups = useMemo(() => {
    const all = data?.groups || []
    const needle = query.trim().toLowerCase()
    if (!needle) return all
    return all
      .map((group) => ({
        ...group,
        commands: group.commands.filter(
          (command) =>
            command.cmd.toLowerCase().includes(needle) || command.desc.toLowerCase().includes(needle),
        ),
      }))
      .filter((group) => group.commands.length)
  }, [data, query])

  const copy = async (cmd) => {
    try {
      await navigator.clipboard.writeText(cmd)
      toast(t('cheatsheet.copied'), { tone: 'success' })
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="main__inner">
      <h1>{t('cheatsheet.title')}</h1>
      <p className="muted">{t('cheatsheet.lead')}</p>

      <div className="search">
        <span className="search__icon">
          <IconSearch />
        </span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('cheatsheet.search')}
          aria-label={t('cheatsheet.search')}
        />
      </div>

      {loading && <div className="skeleton" style={{ height: 180 }} />}

      {!loading && groups.length === 0 && (
        <div className="empty">
          <div className="empty__icon">🔍</div>
          <p>{t('cheatsheet.empty')}</p>
        </div>
      )}

      {groups.map((group) => (
        <section className="cheat-group" key={group.title}>
          <h2 className="cheat-group__title">{group.title}</h2>
          {group.commands.map((command) => (
            <div className="cheat-row" key={command.cmd}>
              <button type="button" className="cheat-row__cmd" onClick={() => copy(command.cmd)}>
                {command.cmd}
              </button>
              <span className="cheat-row__desc">{command.desc}</span>
            </div>
          ))}
        </section>
      ))}
    </div>
  )
}
