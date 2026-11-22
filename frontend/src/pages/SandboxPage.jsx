import { useI18n } from '../i18n'
import { Terminal } from '../sim/Terminal'
import { CodeBlock } from '../components/CodeBlock'

/*
  Песочница: тот же движок, что и в уроках, но без задания и проверок.
  Задания считают XP, а здесь человек просто играется — прогресс не трогаем.
*/
export function SandboxPage() {
  const { t } = useI18n()

  return (
    <div className="main__inner">
      <h1>{t('sandbox.title')}</h1>
      <p className="muted">{t('sandbox.lead')}</p>

      <Terminal hints={[]} label={t('sandbox.label')} autoHeight />

      <h2>{t('sandbox.recipeTitle')}</h2>
      <p className="muted">{t('sandbox.recipeLead')}</p>
      <CodeBlock
        language="bash"
        code={`git init
echo "hello" > notes.txt
git add notes.txt
git commit -m "docs: add notes"
git log --oneline`}
      />
    </div>
  )
}
