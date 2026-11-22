/* Минималистичные иконки (stroke = currentColor), чтобы не тянуть icon-пакет. */

const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export const IconMenu = (props) => (
  <svg {...base} {...props}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
)

export const IconClose = (props) => (
  <svg {...base} {...props}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

export const IconSettings = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" />
  </svg>
)

export const IconChevronRight = (props) => (
  <svg {...base} {...props}>
    <path d="M9 6l6 6-6 6" />
  </svg>
)

export const IconChevronLeft = (props) => (
  <svg {...base} {...props}>
    <path d="M15 6l-6 6 6 6" />
  </svg>
)

export const IconCheck = (props) => (
  <svg {...base} {...props}>
    <path d="M4 12.5l5 5L20 6.5" />
  </svg>
)

export const IconCopy = (props) => (
  <svg {...base} {...props}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
  </svg>
)

export const IconSearch = (props) => (
  <svg {...base} {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
)

export const IconTerminal = (props) => (
  <svg {...base} {...props}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M7 9l3 3-3 3M13 15h4" />
  </svg>
)

export const IconBook = (props) => (
  <svg {...base} {...props}>
    <path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2z" />
    <path d="M8 3v18" />
  </svg>
)

export const IconSparkle = (props) => (
  <svg {...base} {...props}>
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
    <path d="M18 16l.8 2.2L21 19l-2.2.8L18 22l-.8-2.2L15 19l2.2-.8z" />
  </svg>
)

export const IconBolt = (props) => (
  <svg {...base} {...props}>
    <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
  </svg>
)

export const IconArrowRight = (props) => (
  <svg {...base} {...props}>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>
)

export const IconArrowLeft = (props) => (
  <svg {...base} {...props}>
    <path d="M20 12H5M11 6l-6 6 6 6" />
  </svg>
)

export const IconPalette = (props) => (
  <svg {...base} {...props}>
    <path d="M12 3a9 9 0 1 0 0 18c1.7 0 2.5-1 2.5-2.2 0-1.5-1.5-1.8-1.5-3 0-1 .8-1.8 2-1.8H17a4 4 0 0 0 4-4c0-3.9-4-7-9-7z" />
    <circle cx="7.5" cy="10.5" r="1" fill="currentColor" />
    <circle cx="12" cy="7.5" r="1" fill="currentColor" />
    <circle cx="16.5" cy="9.5" r="1" fill="currentColor" />
  </svg>
)

export const IconGlobe = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18" />
  </svg>
)

export const IconTrash = (props) => (
  <svg {...base} {...props}>
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
  </svg>
)

export const IconPlus = (props) => (
  <svg {...base} {...props}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)
