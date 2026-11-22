/*
  Проверка всех заданий тренажёра из content/course.yaml.

  Что делает:
   1. берёт каждое terminal-задание и его `check`;
   2. прогоняет сценарий «как решил бы ученик» (карта SCENARIOS ниже);
   3. убеждается, что задание засчиталось;
   4. убеждается, что оно НЕ засчитывается без действий и после первой команды —
      иначе задание слишком лёгкое и смысла в нём нет.

  Запуск: node scripts/check-tasks.mjs   (из папки frontend)

  Добавили новое задание в course.yaml — добавьте сценарий его решения сюда,
  иначе скрипт честно упадёт с «нет сценария».
*/

import { execSync } from 'node:child_process'
import { GitSim } from '../src/sim/git.js'
import { evaluateCheck } from '../src/sim/checks.js'

const ROOT = new URL('../..', import.meta.url).pathname

function loadCourse() {
  const json = execSync(
    `.venv/bin/python -c "import yaml,json;print(json.dumps(yaml.safe_load(open('content/course.yaml')),ensure_ascii=False))"`,
    { cwd: ROOT, encoding: 'utf8' },
  )
  return JSON.parse(json)
}

/* Команды, которыми задание решается «по-честному». */
const SCENARIOS = {
  'init-practice': ['git init', 'git status'],
  'clone-practice': ['git clone https://github.com/user/project.git', 'git log --oneline'],
  'status-practice': ['git init', 'echo "hi" > notes.txt', 'git status', 'git add notes.txt'],
  'first-commit': ['git init', 'echo "привет" > notes.txt', 'git add notes.txt', 'git commit -m "docs: add notes"'],
  'push-practice': [
    'git init',
    'echo "release" > RELEASE.md',
    'git add .',
    'git commit -m "docs: release notes"',
    'git remote add origin git@github.com:user/project.git',
    'git push -u origin main',
  ],
  'branch-practice': [
    'git switch -c feature/notes',
    'echo "ideas" > ideas.txt',
    'git add .',
    'git commit -m "feat: notes"',
    'git switch main',
  ],
  'merge-conflict-practice': [
    'git merge feature',
    'echo "итог" > shared.txt',
    'git add shared.txt',
    'git commit -m "merge: resolve shared.txt"',
  ],
  'gitignore-practice': [
    'echo ".env" > .gitignore',
    'echo "node_modules/" >> .gitignore',
    'git add .',
    'git commit -m "chore: ignore env"',
  ],
  'stash-practice': ['git stash', 'git stash list', 'git stash pop'],
  'reset-practice': ['git reset --soft HEAD~1', 'git reset --hard HEAD'],
  'ssh-push-practice': [
    'git remote add origin git@github.com:user/project.git',
    'git switch -c feature/ssh',
    'echo "k" > key.md',
    'git add .',
    'git commit -m "chore: ssh notes"',
    'git push -u origin feature/ssh',
  ],
  'pr-practice': [
    'git switch -c feature/profile-avatar',
    'echo "a" > avatar.md',
    'git add .',
    'git commit -m "feat: avatar"',
    'git push -u origin feature/profile-avatar',
  ],
}

const course = loadCourse()
const problems = []

for (const section of course.modules) {
  for (const lesson of section.lessons) {
    for (const step of lesson.steps || []) {
      if (step.type !== 'terminal') continue
      const scenario = SCENARIOS[step.id]
      const label = `${section.slug}/${lesson.slug}/${step.id}`

      if (!scenario) {
        problems.push(`${label}: нет сценария решения в SCENARIOS`)
        continue
      }

      const solved = new GitSim({ setup: step.setup || [] })
      for (const command of scenario) solved.exec(command)
      const verdict = evaluateCheck(solved, step.check, scenario)

      const idle = new GitSim({ setup: step.setup || [] })
      const idleVerdict = evaluateCheck(idle, step.check, [])

      const firstOnly = new GitSim({ setup: step.setup || [] })
      firstOnly.exec(scenario[0])
      const firstVerdict = evaluateCheck(firstOnly, step.check, scenario.slice(0, 1))

      const notes = []
      if (!verdict.passed) notes.push('не засчитывается даже при верном решении')
      if (idleVerdict.passed) notes.push('засчитывается без единой команды')
      if (scenario.length > 1 && firstVerdict.passed) notes.push(`засчитывается уже после «${scenario[0]}»`)

      if (notes.length) problems.push(`${label}: ${notes.join('; ')}`)
      else console.log(`✅ ${label} — решается за ${scenario.length} команд`)
    }
  }
}

const total = Object.keys(SCENARIOS).length
console.log(
  problems.length
    ? `\n❌ Проблемы:\n${problems.map((item) => `  • ${item}`).join('\n')}`
    : `\n✅ Все задания тренажёра в порядке (${total})`,
)
process.exit(problems.length ? 1 : 0)
