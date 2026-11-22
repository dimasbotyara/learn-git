import { Link, NavLink } from 'react-router-dom'
import { useI18n } from '../i18n'
import { useProgress } from '../progress'
import { useSettings } from '../settings'
import { Logo } from './Logo'
import { IconGlobe, IconMenu, IconSettings } from './Icons'
import { ProgressRing } from './ProgressRing'

export function Header({ onOpenMenu, onOpenSettings, totalLessons }) {
  const { t, locale } = useI18n()
  const { doneKeys, xp } = useProgress()
  const { locale: settingLocale, update } = useSettings()
  const percent = totalLessons ? Math.round((doneKeys.length / totalLessons) * 100) : 0

  const toggleLocale = () => update({ locale: locale === 'ru' ? 'en' : 'ru' })

  return (
    <header className="header">
      <button
        type="button"
        className="icon-btn header__menu"
        onClick={onOpenMenu}
        aria-label={t('nav.openMenu')}
      >
        <IconMenu />
      </button>

      <Link to="/" className="header__brand" aria-label={t('brand.name')}>
        <Logo />
        <span>
          learn<span className="accent">-git</span>
        </span>
        <span className="header__brand-sub">{t('brand.tagline')}</span>
      </Link>

      <div className="header__spacer" />

      <div className="header__progress" title={`${doneKeys.length}/${totalLessons} · ${xp} ${t('common.xp')}`}>
        <ProgressRing value={percent} />
        <div>
          <div className="header__progress-text">
            {doneKeys.length}/{totalLessons} · {xp} {t('common.xp')}
          </div>
          <div className="progress" style={{ width: 150 }}>
            <div className="progress__bar" style={{ width: `${percent}%` }} />
          </div>
        </div>
      </div>

      <nav className="header__actions" aria-label={t('nav.menu')}>
        <NavLink
          to="/cheatsheet"
          className={({ isActive }) => `btn btn--ghost btn--sm ${isActive ? 'btn--ghost--active' : ''}`}
        >
          {t('nav.cheatsheet')}
        </NavLink>
        <button
          type="button"
          className="icon-btn"
          onClick={toggleLocale}
          aria-label={locale === 'ru' ? 'Switch to English' : 'Переключить на русский'}
          title={locale === 'ru' ? 'English' : 'Русский'}
        >
          <IconGlobe />
          <span className="mono" style={{ fontSize: 11, marginLeft: 2 }}>
            {locale}
          </span>
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={onOpenSettings}
          aria-label={t('nav.settings')}
          title={t('nav.settings')}
          data-setting-locale={settingLocale || 'auto'}
        >
          <IconSettings />
        </button>
      </nav>
    </header>
  )
}
