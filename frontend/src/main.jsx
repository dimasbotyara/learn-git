import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

// Шрифты и стили — всё локально, из npm-пакетов, никаких CDN.
import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'

import './styles/emoji.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/layout.css'
import './styles/components.css'

import { App } from './App'
import { SettingsProvider } from './settings'
import { I18nProvider } from './i18n'
import { ProgressProvider } from './progress'
import { EffectsProvider } from './effects'
import { HLJS_CSS } from './highlight'

const style = document.createElement('style')
style.textContent = HLJS_CSS
document.head.appendChild(style)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SettingsProvider>
      <I18nProvider>
        <ProgressProvider>
          <EffectsProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </EffectsProvider>
        </ProgressProvider>
      </I18nProvider>
    </SettingsProvider>
  </React.StrictMode>,
)
