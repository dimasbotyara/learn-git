import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n'
import { useSettings } from '../settings'
import { useProgress } from '../progress'
import { useEffects } from '../effects'
import { BUILTIN_THEMES, PALETTE_KEYS_FOR_EDITOR, SWATCH_KEYS, paletteOf } from '../themes'
import { IconClose, IconPalette, IconPlus, IconTrash } from './Icons'

const EMPTY_CUSTOM = {
  id: '',
  name: '',
  base: 'gruvbox-dark',
  colors: {},
}

export function SettingsPanel({ open, onClose, onExport, onImport }) {
  const { t, locale } = useI18n()
  const settings = useSettings()
  const { xp, streak, doneKeys, resetProgress } = useProgress()
  const { toast } = useEffects()
  const [editing, setEditing] = useState(null)
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  if (!open) return null

  const activeCustom = settings.customThemes.find((theme) => theme.id === settings.customThemeId)

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={t('settings.title')}>
      <div className="modal__scrim" onClick={onClose} />
      <div className="modal__panel" ref={panelRef} tabIndex={-1}>
        <div className="modal__head">
          <h2 className="modal__title">{t('settings.title')}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label={t('common.close')}>
            <IconClose />
          </button>
        </div>

        <div className="modal__body">
          <section className="settings-section">
            <div className="settings-section__title">{t('settings.appearance')}</div>
            <p className="faint" style={{ fontSize: 'var(--text-xs)', marginBottom: 'var(--space-3)' }}>
              {t('settings.themeHint')}
            </p>
            <div className="theme-grid">
              {BUILTIN_THEMES.map((theme) => (
                <ThemeCard
                  key={theme.id}
                  theme={theme}
                  active={settings.theme === theme.id}
                  onSelect={() => {
                    settings.setTheme(theme.id)
                    if (theme.base) settings.update({ customThemeId: null })
                  }}
                  badge={theme.default ? t('settings.defaultBadge') : null}
                />
              ))}
              {settings.customThemes.map((theme) => (
                <ThemeCard
                  key={theme.id}
                  theme={{ id: theme.id, name: theme.name, colors: theme.colors, base: theme.base }}
                  active={settings.theme === 'custom' && settings.customThemeId === theme.id}
                  onSelect={() => {
                    settings.update({ theme: 'custom', customThemeId: theme.id })
                  }}
                  badge={t('settings.customBadge')}
                  onEdit={() => setEditing({ ...EMPTY_CUSTOM, ...theme })}
                  onDelete={() => {
                    settings.deleteCustomTheme(theme.id)
                    toast(t('settings.deleteTheme'))
                  }}
                />
              ))}
            </div>

            <button
              type="button"
              className="btn btn--sm"
              style={{ marginTop: 'var(--space-3)' }}
              onClick={() =>
                setEditing({
                  ...EMPTY_CUSTOM,
                  id: `custom-${Date.now()}`,
                  name: '',
                  colors: { ...paletteOf(settings.theme === 'custom' && activeCustom ? activeCustom.base : settings.theme) },
                })
              }
            >
              <IconPalette width={16} height={16} /> {t('settings.newTheme')}
            </button>
          </section>

          <section className="settings-section">
            <div className="settings-section__title">{t('settings.language')}</div>
            <div className="segmented" role="group" aria-label={t('settings.language')}>
              {[
                { id: 'ru', label: 'Русский' },
                { id: 'en', label: 'English' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`segmented__btn ${locale === item.id ? 'segmented__btn--active' : ''}`}
                  onClick={() => settings.update({ locale: item.id })}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className="faint" style={{ fontSize: 'var(--text-xs)', marginTop: 'var(--space-2)' }}>
              {t('settings.languageHint')}
            </p>
          </section>

          <section className="settings-section">
            <div className="settings-section__title">{t('settings.font')}</div>
            <div className="segmented" role="group" aria-label={t('settings.font')}>
              {[
                { id: 'sm', label: t('settings.fontS') },
                { id: 'md', label: t('settings.fontM') },
                { id: 'lg', label: t('settings.fontL') },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`segmented__btn ${settings.fontSize === item.id ? 'segmented__btn--active' : ''}`}
                  onClick={() => settings.update({ fontSize: item.id })}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </section>

          <section className="settings-section">
            <div className="settings-section__title">{t('settings.effects')}</div>
            <div className="switch-row">
              <div className="switch-row__text">
                {t('settings.effectsOn')}
                <small>{t('settings.effectsHint')}</small>
              </div>
              <button
                type="button"
                role="switch"
                className="switch"
                aria-checked={settings.effects}
                aria-label={t('settings.effectsOn')}
                onClick={() => settings.update({ effects: !settings.effects })}
              />
            </div>
          </section>

          <section className="settings-section">
            <div className="settings-section__title">{t('settings.progress')}</div>
            <div className="switch-row" style={{ paddingTop: 0 }}>
              <div className="switch-row__text">
                <span className="mono">
                  {xp} {t('common.xp')} · {doneKeys.length} {t('course.lessons')}
                </span>
                <small>
                  🔥 {streak.count} {t('common.streak')}
                </small>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              <button type="button" className="btn btn--sm" onClick={onExport}>
                {t('settings.exportProgress')}
              </button>
              <label className="btn btn--sm" style={{ cursor: 'pointer' }}>
                {t('settings.importProgress')}
                <input
                  type="file"
                  accept="application/json,.json"
                  hidden
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) onImport(file)
                    event.target.value = ''
                  }}
                />
              </label>
              <button
                type="button"
                className="btn btn--sm"
                onClick={() => {
                  if (window.confirm(`${t('settings.resetProgress')}?`)) {
                    resetProgress()
                    toast(t('settings.resetProgress'))
                  }
                }}
              >
                <IconTrash width={14} height={14} /> {t('settings.resetProgress')}
              </button>
            </div>
            <p className="faint" style={{ fontSize: 'var(--text-xs)', marginTop: 'var(--space-2)' }}>
              {t('settings.resetProgressHint')}
            </p>
          </section>
        </div>
      </div>

      {editing && (
        <ThemeEditor
          value={editing}
          onCancel={() => setEditing(null)}
          onSave={(theme) => {
            settings.saveCustomTheme(theme)
            setEditing(null)
            toast(t('settings.saveTheme'), { tone: 'success' })
          }}
        />
      )}
    </div>
  )
}

function ThemeCard({ theme, active, onSelect, badge, onEdit, onDelete }) {
  const { t } = useI18n()
  const palette = theme.colors && Object.keys(theme.colors).length ? { ...paletteOf(theme.base), ...theme.colors } : paletteOf(theme.id)
  return (
    <div className={`theme-card ${active ? 'theme-card--active' : ''}`}>
      <button type="button" className="theme-card__preview" style={{ background: palette.bg }} onClick={onSelect} aria-pressed={active}>
        {SWATCH_KEYS.map((key) => (
          <span key={key} className="theme-card__swatch" style={{ background: palette[key] }} />
        ))}
      </button>
      <div className="theme-card__name">
        <button
          type="button"
          onClick={onSelect}
          aria-pressed={active}
          style={{ background: 'none', border: 0, color: 'inherit', padding: 0, textAlign: 'left' }}
        >
          {theme.name}
        </button>
        {badge && <span className="theme-card__badge">{badge}</span>}
      </div>
      {(onEdit || onDelete) && (
        <div style={{ display: 'flex', gap: 4 }}>
          {onEdit && (
            <button type="button" className="chip" style={{ minHeight: 26 }} onClick={onEdit}>
              {t('settings.editTheme')}
            </button>
          )}
          {onDelete && (
            <button type="button" className="chip" style={{ minHeight: 26 }} onClick={onDelete} aria-label={t('settings.deleteTheme')}>
              <IconTrash width={12} height={12} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function ThemeEditor({ value, onCancel, onSave }) {
  const { t } = useI18n()
  const [theme, setTheme] = useState(value)

  const setColor = (key, color) => setTheme((current) => ({ ...current, colors: { ...current.colors, [key]: color } }))

  return (
    <div className="modal" style={{ zIndex: 95 }} role="dialog" aria-modal="true" aria-label={t('settings.newTheme')}>
      <div className="modal__scrim" onClick={onCancel} />
      <div className="modal__panel" style={{ width: 'min(100%, 460px)' }}>
        <div className="modal__head">
          <h2 className="modal__title">{t('settings.newTheme')}</h2>
          <button type="button" className="icon-btn" onClick={onCancel} aria-label={t('common.close')}>
            <IconClose />
          </button>
        </div>
        <div className="modal__body">
          <div className="field">
            <label htmlFor="theme-name">{t('settings.themeName')}</label>
            <input
              id="theme-name"
              type="text"
              value={theme.name}
              placeholder="My theme"
              onChange={(event) => setTheme((current) => ({ ...current, name: event.target.value }))}
            />
          </div>

          <div className="field">
            <label>{t('settings.base')}</label>
            <div className="editor-presets">
              {BUILTIN_THEMES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="chip"
                  onClick={() =>
                    setTheme((current) => ({ ...current, base: item.id, colors: { ...paletteOf(item.id) } }))
                  }
                >
                  {item.name}
                </button>
              ))}
            </div>
            <p className="faint" style={{ fontSize: 'var(--text-xs)' }}>
              {t('settings.colorHint')}
            </p>
          </div>

          <div>
            {PALETTE_KEYS_FOR_EDITOR.map((key) => {
              const raw = theme.colors[key] || paletteOf(theme.base)[key] || ''
              const isHex = /^#[0-9a-f]{6}$/i.test(raw)
              return (
                <div className="editor-color" key={key}>
                  <span className="editor-color__label">--{key}</span>
                  <input
                    type="color"
                    value={isHex ? raw : toHexLike(raw, theme.base, key)}
                    onChange={(event) => setColor(key, event.target.value)}
                    aria-label={key}
                  />
                  <input
                    type="text"
                    value={raw}
                    onChange={(event) => setColor(key, event.target.value)}
                    spellCheck={false}
                  />
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
            <button
              type="button"
              className="btn btn--primary"
              disabled={!theme.name.trim()}
              onClick={() => onSave({ ...theme, name: theme.name.trim() })}
            >
              {t('settings.saveTheme')}
            </button>
            <button type="button" className="btn btn--ghost" onClick={onCancel}>
              {t('settings.cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* Для rgba(...) значение color picker нельзя выставить — берём ближайший hex из базы. */
function toHexLike(value, base, key) {
  if (typeof value === 'string' && value.startsWith('#')) return value.slice(0, 7)
  return paletteOf(base)[key]?.startsWith('#') ? paletteOf(base)[key].slice(0, 7) : '#000000'
}
