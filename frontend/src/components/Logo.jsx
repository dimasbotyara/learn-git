/* Логотип: ветка git, нарисованная в цветах текущей темы. */
export function Logo({ size = 30 }) {
  return (
    <svg
      className="header__logo"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label="learn-git"
    >
      <rect width="32" height="32" rx="8" fill="var(--bg-elev)" stroke="var(--border)" />
      <path
        d="M11 8v13a5 5 0 0 0 5 5h5"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="11" cy="7.5" r="2.6" fill="var(--accent)" />
      <circle cx="11" cy="22" r="2.6" fill="var(--green)" />
      <circle cx="22" cy="26" r="2.6" fill="var(--blue)" />
      <path d="M18 8h3.5a2.5 2.5 0 0 1 2.5 2.5V16" fill="none" stroke="var(--fg-muted)" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="2 3" />
    </svg>
  )
}
