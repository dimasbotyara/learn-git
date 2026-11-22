import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { SettingsProvider } from '../src/settings'
import { I18nProvider } from '../src/i18n'
import { ProgressProvider } from '../src/progress'
import { EffectsProvider } from '../src/effects'
import { App } from '../src/App'

let root = null
let currentPath = '/'

function tree(path) {
  return (
    <SettingsProvider>
      <I18nProvider>
        <ProgressProvider>
          <EffectsProvider>
            <MemoryRouter key={path} initialEntries={[path]}>
              <App />
            </MemoryRouter>
          </EffectsProvider>
        </ProgressProvider>
      </I18nProvider>
    </SettingsProvider>
  )
}

export function mount(path, container) {
  currentPath = path
  root = createRoot(container)
  root.render(tree(path))
  return root
}

export function rerender(path) {
  currentPath = path
  root.render(tree(path))
}
