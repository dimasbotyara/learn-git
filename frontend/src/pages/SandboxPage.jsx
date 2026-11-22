import { useI18n } from '../i18n'
import { CodeBlock } from '../components/CodeBlock'

/* Песочница: пока это «свободный режим» с подсказками.
   Полноценный виртуальный терминал появится на этапе практики (см. docs/PLAN.md). */
export function SandboxPage() {
  const { t } = useI18n()

  return (
    <div className="main__inner">
      <h1>{t('sandbox.title')}</h1>
      <p className="muted">{t('sandbox.lead')}</p>

      <div className="banner">
        <span aria-hidden="true">🚧</span>
        <span>
          {t('common.soon')}: виртуальный репозиторий с командами и проверкой состояния появится на этапе практики.
          Пока потренируйся на мини-сценарии ниже.
        </span>
      </div>

      <h2>Сценарий: первый коммит</h2>
      <CodeBlock
        language="bash"
        code={`mkdir play && cd play
git init
echo "hello" > notes.txt
git status
git add notes.txt
git commit -m "docs: add notes"
git log --oneline`}
      />
    </div>
  )
}
