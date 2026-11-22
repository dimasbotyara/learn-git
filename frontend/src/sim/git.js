/*
  Виртуальный git для тренажёра.
  Чистый JS без DOM: одинаково работает в браузере и в тестах (node).
  Поддерживает: init, status, add, commit, log, diff, branch, switch/checkout,
  merge (с конфликтами), stash, reset (soft/mixed/hard), revert, remote, push, pull,
  clone, config, restore, rm, mv, help. Плюс мини-шелл: ls, cat, touch, mkdir,
  rm, echo >, pwd, clear.
*/

const GIT = 'git version 2.44.0'

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

const out = (text = '') => ({ text, tone: 'out' })
const dim = (text = '') => ({ text, tone: 'muted' })
const ok = (text = '') => ({ text, tone: 'success' })
const bad = (text = '') => ({ text, tone: 'error' })
const accent = (text = '') => ({ text, tone: 'accent' })

let counter = 0
function shortHash() {
  counter += 1
  const base = Math.random().toString(16).slice(2, 9).padEnd(7, '0')
  return `${base}${counter.toString(16)}`.slice(0, 7)
}

function tokenize(line) {
  const tokens = []
  let current = ''
  let quote = null
  let escaped = false
  for (const char of line) {
    if (escaped) {
      current += char
      escaped = false
      continue
    }
    if (char === '\\') {
      escaped = true
      continue
    }
    if (quote) {
      if (char === quote) quote = null
      else current += char
      continue
    }
    if (char === '"' || char === "'") {
      quote = char
      continue
    }
    if (/\s/.test(char)) {
      if (current) tokens.push(current)
      current = ''
      continue
    }
    current += char
  }
  if (current) tokens.push(current)
  return tokens
}

/* Простые .gitignore-правила: имена, *.ext, dir/, /path, !исключения */
function matchIgnore(pattern, path) {
  const clean = pattern.trim()
  if (!clean || clean.startsWith('#')) return false
  const negate = clean.startsWith('!')
  const body = negate ? clean.slice(1) : clean
  const name = path.split('/').pop()
  let hit = false
  if (body.endsWith('/')) {
    const dir = body.slice(0, -1)
    hit = path === dir || path.startsWith(`${dir}/`)
  } else if (body.includes('/')) {
    const re = new RegExp(`^${body.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}$`)
    hit = re.test(path.replace(/^\//, ''))
  } else if (body.includes('*')) {
    const re = new RegExp(`^${body.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}$`)
    hit = re.test(name)
  } else {
    hit = path === body || name === body || path.startsWith(`${body}/`)
  }
  return negate ? !hit : hit
}

function lineMerge(base, ours, theirs) {
  const b = base === undefined ? null : base.split('\n')
  const o = ours.split('\n')
  const t = theirs.split('\n')

  if (b === null) {
    return { text: conflictText('', ours, theirs), conflict: true }
  }

  let prefix = 0
  while (prefix < o.length && prefix < t.length && o[prefix] === t[prefix]) prefix += 1

  let suffix = 0
  while (
    suffix < o.length - prefix &&
    suffix < t.length - prefix &&
    o[o.length - 1 - suffix] === t[t.length - 1 - suffix]
  ) {
    suffix += 1
  }

  const head = o.slice(0, prefix)
  const tail = suffix ? o.slice(o.length - suffix) : []
  const oMid = o.slice(prefix, o.length - suffix)
  const tMid = t.slice(prefix, t.length - suffix)

  const bPrefix = b.slice(0, prefix)
  const bMid = b.slice(prefix, b.length - suffix)

  if (oMid.join('\n') === tMid.join('\n')) {
    return { text: [...head, ...oMid, ...tail].join('\n'), conflict: false }
  }
  if (oMid.join('\n') === bMid.join('\n')) {
    return { text: [...head, ...tMid, ...tail].join('\n'), conflict: false }
  }
  if (tMid.join('\n') === bMid.join('\n')) {
    return { text: [...head, ...oMid, ...tail].join('\n'), conflict: false }
  }
  const merged = [...head, conflictText(oMid.join('\n'), tMid.join('\n')), ...tail].join('\n')
  return { text: merged, conflict: true }
}

function conflictText(ours, theirs) {
  return `<<<<<<< HEAD\n${ours}\n=======\n${theirs}\n>>>>>>> incoming`
}

export const HAS_CONFLICT = /^<{7} /m

/* ------------------------------------------------------------------ */
/* локализация вывода (терминал двуязычный)                            */
/* ------------------------------------------------------------------ */

const MSG = {
  ru: {
    sudo: 'Никакого sudo: это виртуальный репозиторий, всё и так можно 😉',
    cmdList: 'Доступные команды: git, ls, cat, touch, rm, echo, help',
    empty: '(пусто)',
    catNoFile: 'cat: не указан файл',
    rmDone: (path) => `rm: ${path} удалён из рабочей папки`,
    gitList: 'Список команд: git help',
    needInit: 'Сначала выполни: git init',
    defaultBranch: (name) => `Подсказка: ветка по умолчанию — «${name}».`,
    configMissing: (key) => `Не задано: ${key}`,
    addDeleted: (path) => `${path} (удалён)`,
    added: (paths) => `Добавлено в staging area: ${paths}`,
    nothingToAdd: 'Нечего добавлять.',
    conflictResolved: (paths) => `Конфликт решён: ${paths}`,
    useCommitMessage: 'Используй: git commit -m "сообщение"',
    addFirst: 'Подсказка: сначала git add <файл>',
    resolveFirst: 'Сначала реши конфликты и сделай git add.',
    msgShort: 'Сообщение слишком короткое.',
    msgShortWhy: 'Git примет и «fix», но через месяц ты сам не поймёшь, что это было. Напиши хотя бы пару слов.',
    noStaged: 'Изменений в staging area нет.',
    noChanges: 'Изменений нет.',
    branchCreated: (name) => `Ветка «${name}» создана.`,
    switchTo: (name) => `Переключиться: git switch ${name}`,
    noCommitsYet: 'Пока нет ни одного коммита — ветки появятся после первого.',
    createNew: (name) => `Создать новую: git switch -c ${name}`,
    restoredHead: (paths) => `Восстановлено из HEAD: ${paths}`,
    unstaged: (paths) => `Убрано из staging area: ${paths}`,
    restored: (paths) => `Восстановлено: ${paths}`,
    fastForwarded: (branch, name) => `Ветка «${branch}» перемотана на ${name}.`,
    conflictMarkers: 'В файле появились маркеры <<<<<<< ======= >>>>>>>. Отредактируй файл и сделай git add.',
    mergeCommit: (hash) => `Создан merge-коммит ${hash}.`,
    stashEmpty: 'Список stash пуст.',
    fromStash: (action) => `Возвращено из stash (${action})`,
    stashed: (count) => `Спрятано файлов: ${count}. Рабочая папка снова чистая.`,
    resetSoft: 'Коммит отменён, изменения остались в staging area.',
    resetMixed: 'Коммит отменён, изменения остались в рабочей папке (не в staging).',
    resetHard: 'Коммит и все незакоммиченные изменения удалены (--hard).',
    reverted: 'Изменения отменены новым коммитом — история не переписана.',
    noRemotes: 'Пока нет ни одного remote.',
    remoteRemoved: (name) => `remote «${name}» удалён`,
    remoteFirst: 'Сначала: git remote add origin git@github.com:user/repo.git',
    remoteFirstUrl: 'Сначала: git remote add origin <url>',
    pulled: (ref) => `Обновлено с ${ref}.`,
    branchUpdated: (ref) => `Ветка обновлена до ${ref}.`,
    resolveAndCommit: 'Реши конфликты и закоммить результат.',
    mergeCommitCreated: (hash) => `Merge-коммит ${hash} создан.`,
    noFetchChanges: 'Изменений нет.',
    cloned: (commits, files, url) => `Склонировано ${commits} коммита, ${files} файла. remote origin → ${url}`,
    helpTitle: 'Доступные команды',
    help: [
      ['git init', 'создать репозиторий'],
      ['git status', 'что происходит'],
      ['git add <файл|.>', 'в staging area'],
      ['git commit -m "текст"', 'зафиксировать'],
      ['git log --oneline', 'история'],
      ['git diff', 'изменения'],
      ['git branch / git switch', 'ветки'],
      ['git merge <ветка>', 'слияние'],
      ['git stash / stash pop', 'спрятать / вернуть'],
      ['git reset --soft|--mixed|--hard', 'отмена коммита'],
      ['git revert <коммит>', 'отменить, не ломая историю'],
      ['git remote add / push / pull', 'синхронизация'],
    ],
    helpShell: '  ls, cat, touch, echo "текст" > файл, clear',
    hintsTitle: 'Подсказки к этому заданию',
    noHints: 'Для этого урока отдельных подсказок нет — только общий список выше.',
    readmeBody: '# My First Project\n\nУчебный репозиторий для практики Git.\n',
  },
  en: {
    sudo: 'No sudo needed: this is a virtual repository, everything is already allowed 😉',
    cmdList: 'Available commands: git, ls, cat, touch, rm, echo, help',
    empty: '(empty)',
    catNoFile: 'cat: no file specified',
    rmDone: (path) => `rm: removed ${path} from the working directory`,
    gitList: 'List of commands: git help',
    needInit: 'Run this first: git init',
    defaultBranch: (name) => `Hint: the default branch is "${name}".`,
    configMissing: (key) => `Not set: ${key}`,
    addDeleted: (path) => `${path} (deleted)`,
    added: (paths) => `Added to staging area: ${paths}`,
    nothingToAdd: 'Nothing to add.',
    conflictResolved: (paths) => `Conflict resolved: ${paths}`,
    useCommitMessage: 'Use: git commit -m "message"',
    addFirst: 'Hint: run git add <file> first',
    resolveFirst: 'Resolve the conflicts first, then run git add.',
    msgShort: 'Commit message is too short.',
    msgShortWhy: 'Git would accept "fix", but a month later you will not remember what it was. Write at least a couple of words.',
    noStaged: 'No changes in the staging area.',
    noChanges: 'No changes.',
    branchCreated: (name) => `Branch "${name}" created.`,
    switchTo: (name) => `Switch to it: git switch ${name}`,
    noCommitsYet: 'No commits yet — branches appear after the first one.',
    createNew: (name) => `Create it: git switch -c ${name}`,
    restoredHead: (paths) => `Restored from HEAD: ${paths}`,
    unstaged: (paths) => `Removed from the staging area: ${paths}`,
    restored: (paths) => `Restored: ${paths}`,
    fastForwarded: (branch, name) => `Branch "${branch}" fast-forwarded to ${name}.`,
    conflictMarkers: 'The file now contains <<<<<<< ======= >>>>>>> markers. Edit it and run git add.',
    mergeCommit: (hash) => `Merge commit ${hash} created.`,
    stashEmpty: 'The stash is empty.',
    fromStash: (action) => `Restored from the stash (${action})`,
    stashed: (count) => `Stashed ${count} file(s). The working directory is clean again.`,
    resetSoft: 'Commit undone, changes are still in the staging area.',
    resetMixed: 'Commit undone, changes are still in the working directory (not staged).',
    resetHard: 'Commit and all uncommitted changes are gone (--hard).',
    reverted: 'The change was undone by a new commit — history is intact.',
    noRemotes: 'No remotes yet.',
    remoteRemoved: (name) => `remote "${name}" removed`,
    remoteFirst: 'Run this first: git remote add origin git@github.com:user/repo.git',
    remoteFirstUrl: 'Run this first: git remote add origin <url>',
    pulled: (ref) => `Updated from ${ref}.`,
    branchUpdated: (ref) => `Branch updated to ${ref}.`,
    resolveAndCommit: 'Resolve the conflicts and commit the result.',
    mergeCommitCreated: (hash) => `Merge commit ${hash} created.`,
    noFetchChanges: 'Nothing new.',
    cloned: (commits, files, url) => `Cloned ${commits} commits and ${files} files. remote origin → ${url}`,
    helpTitle: 'Available commands',
    help: [
      ['git init', 'create a repository'],
      ['git status', 'what is going on'],
      ['git add <file|.>', 'stage changes'],
      ['git commit -m "text"', 'record a snapshot'],
      ['git log --oneline', 'history'],
      ['git diff', 'changes'],
      ['git branch / git switch', 'branches'],
      ['git merge <branch>', 'merge'],
      ['git stash / stash pop', 'shelve / restore'],
      ['git reset --soft|--mixed|--hard', 'undo a commit'],
      ['git revert <commit>', 'undo without rewriting history'],
      ['git remote add / push / pull', 'sync with a remote'],
    ],
    helpShell: '  ls, cat, touch, echo "text" > file, clear',
    hintsTitle: 'Hints for this task',
    noHints: 'This lesson has no task-specific hints — only the general list above.',
    readmeBody: '# My First Project\n\nPractice repository for the Git course.\n',
  },
}

function alignCmd(command, label) {
  return `  ${command.padEnd(32)} ${label}`
}


/* ------------------------------------------------------------------ */
/* simulator                                                           */
/* ------------------------------------------------------------------ */

export class GitSim {
  constructor(options = {}) {
    this.locale = options.locale === 'en' ? 'en' : 'ru'
    this.user = options.user || { name: this.locale === 'en' ? 'Student' : 'Ученик', email: 'student@example.com' }
    this.hints = options.hints || []
    this.branch = options.branch || 'main'
    this.reset()
    for (const command of options.setup || []) {
      this.exec(command, { silent: true })
    }
  }

  reset() {
    this.state = {
      initialized: false,
      files: {},
      index: {},
      commits: [],
      branches: {},
      head: this.branch,
      detached: null,
      stash: [],
      remotes: {},
      config: {},
      merge: null,
      conflicts: [],
      reflog: [],
      cwd: '~/project',
    }
  }

  get msg() {
    return MSG[this.locale] || MSG.ru
  }

  /* ---------------- состояние ---------------- */

  headCommit() {
    const ref = this.state.detached || this.state.branches[this.state.head]
    if (!ref) return null
    return this.state.commits.find((commit) => commit.hash === ref) || null
  }

  headTree() {
    const commit = this.headCommit()
    return commit ? commit.tree : {}
  }

  currentBranch() {
    return this.state.detached ? `HEAD detached at ${this.state.detached}` : this.state.head
  }

  findCommit(ref) {
    if (!ref) return this.headCommit()
    const value = String(ref)
    if (value === 'HEAD') return this.headCommit()
    if (value === 'HEAD~1' || value === 'HEAD^') {
      const commit = this.headCommit()
      return commit && commit.parents[0]
        ? this.state.commits.find((item) => item.hash === commit.parents[0]) || null
        : null
    }
    if (value === 'HEAD~2') {
      const first = this.findCommit('HEAD~1')
      return first && first.parents[0]
        ? this.state.commits.find((item) => item.hash === first.parents[0]) || null
        : null
    }
    if (this.state.branches[value]) {
      return this.state.commits.find((item) => item.hash === this.state.branches[value]) || null
    }
    return this.state.commits.find((commit) => commit.hash.startsWith(value)) || null
  }

  isIgnored(path) {
    const rules = (this.state.files['.gitignore'] || '').split('\n').filter(Boolean)
    let ignored = false
    for (const rule of rules) {
      const clean = rule.trim()
      if (!clean || clean.startsWith('#')) continue
      if (clean.startsWith('!')) {
        if (matchIgnore(clean, path)) ignored = false
        continue
      }
      if (matchIgnore(clean, path)) ignored = true
    }
    return ignored
  }

  statusData() {
    const tree = this.headTree()
    const staged = []
    const paths = new Set([...Object.keys(this.state.index), ...Object.keys(tree)])
    for (const path of paths) {
      const inIndex = path in this.state.index
      const inTree = path in tree
      if (inIndex && !inTree) staged.push({ path, kind: 'new' })
      else if (!inIndex && inTree) staged.push({ path, kind: 'deleted' })
      else if (this.state.index[path] !== tree[path]) staged.push({ path, kind: 'modified' })
    }

    const unstaged = []
    for (const path of Object.keys(this.state.index)) {
      if (!(path in this.state.files)) unstaged.push({ path, kind: 'deleted' })
      else if (this.state.files[path] !== this.state.index[path]) unstaged.push({ path, kind: 'modified' })
    }

    const untracked = []
    const ignored = []
    for (const path of Object.keys(this.state.files)) {
      if (path === '.gitignore') {
        if (!(path in this.state.index)) untracked.push(path)
        continue
      }
      if (path in this.state.index) continue
      if (this.isIgnored(path)) ignored.push(path)
      else untracked.push(path)
    }

    return { staged, unstaged, untracked, ignored }
  }

  isClean() {
    const { staged, unstaged, untracked } = this.statusData()
    return !staged.length && !unstaged.length && !untracked.length
  }

  /* ---------------- commit ---------------- */

  createCommit(message, parents) {
    const tree = { ...this.state.index }
    const commit = {
      hash: shortHash(),
      message,
      parents,
      tree,
      date: Date.now(),
      author: { ...this.user },
    }
    this.state.commits.unshift(commit)
    this.state.reflog.unshift({ hash: commit.hash, action: `commit: ${message}` })
    if (!this.state.detached) this.state.branches[this.state.head] = commit.hash
    else this.state.detached = commit.hash
    this.state.index = { ...tree }
    return commit
  }

  /* ---------------- shell ---------------- */

  exec(raw, { silent = false } = {}) {
    const line = String(raw || '').trim()
    if (!line) return { lines: [], ok: true }
    const result = this.run(line)
    return silent ? { lines: [], ok: result.ok } : result
  }

  run(line) {
    // редирект вывода: echo "hi" > file.txt
    const redirect = line.match(/^(.*?)\s*(>>?)\s*([\w./-]+)\s*$/)
    if (redirect && !redirect[1].startsWith('git ')) {
      const command = redirect[1].trim()
      const target = redirect[3]
      const appended = redirect[2] === '>>'
      const value = command.replace(/^echo\s+/, '').replace(/^["']|["']$/g, '')
      if (command.startsWith('echo ') || command === 'echo') {
        this.state.files[target] = appended ? (this.state.files[target] || '') + value + '\n' : value + '\n'
        return { lines: [], ok: true }
      }
    }

    const tokens = tokenize(line)
    const [command, ...args] = tokens

    switch (command) {
      case 'git':
        return this.git(args)
      case 'ls':
        return this.ls(args)
      case 'cat':
        return this.cat(args)
      case 'touch':
        return this.touch(args)
      case 'mkdir':
        return { lines: [], ok: true }
      case 'rm':
        return this.rm(args)
      case 'pwd':
        return { lines: [out(this.state.cwd)], ok: true }
      case 'clear':
        return { lines: [], ok: true, clear: true }
      case 'echo':
        return { lines: [out(args.join(' '))], ok: true }
      case 'help':
      case '?':
        return this.help()
      case 'sudo':
        return { lines: [bad(this.msg.sudo)], ok: false }
      default:
        return {
          lines: [bad(`command not found: ${command}`), dim(this.msg.cmdList)],
          ok: false,
        }
    }
  }

  ls(args) {
    const cwd = this.state.cwd
    const prefix = cwd === '~/project' ? '' : `${cwd.replace('~/project/', '')}/`
    const names = new Set()
    for (const path of Object.keys(this.state.files)) {
      if (prefix && !path.startsWith(prefix)) continue
      const rest = path.slice(prefix.length)
      names.add(rest.includes('/') ? `${rest.split('/')[0]}/` : rest)
    }
    if (!names.size) return { lines: [dim(this.msg.empty)], ok: true }
    const sorted = [...names].sort()
    return { lines: [out(sorted.join('  '))], ok: true }
  }

  cat(args) {
    const path = args[0]
    if (!path) return { lines: [bad(this.msg.catNoFile)], ok: false }
    if (!(path in this.state.files)) return { lines: [bad(`cat: ${path}: No such file`)], ok: false }
    return { lines: this.state.files[path].replace(/\n$/, '').split('\n').map(out), ok: true }
  }

  touch(args) {
    for (const path of args) {
      if (!(path in this.state.files)) this.state.files[path] = ''
    }
    return { lines: [], ok: true }
  }

  rm(args) {
    const files = args.filter((arg) => !arg.startsWith('-'))
    const lines = []
    for (const path of files) {
      if (path in this.state.files) {
        delete this.state.files[path]
      } else if (path in this.state.index) {
        delete this.state.files[path]
        lines.push(dim(this.msg.rmDone(path)))
      } else {
        lines.push(bad(`rm: ${path}: No such file`))
      }
    }
    return { lines, ok: true }
  }

  /* ---------------- git ---------------- */

  git(args) {
    const sub = args[0]
    if (!sub || sub === 'help' || sub === '--help') return this.help()
    if (sub === '--version' || sub === 'version') return { lines: [out(GIT)], ok: true }
    const rest = args.slice(1)
    const handler = this[`cmd_${sub}`]
    if (typeof handler !== 'function') {
      return {
        lines: [
          bad(`git: '${sub}' is not a git command.`),
          dim(this.msg.gitList),
        ],
        ok: false,
      }
    }
    try {
      return handler.call(this, rest)
    } catch (error) {
      return { lines: [bad(`git: ${error.message}`)], ok: false }
    }
  }

  needRepo() {
    if (!this.state.initialized) {
      return {
        lines: [
          bad('fatal: not a git repository (or any of the parent directories): .git'),
          dim(this.msg.needInit),
        ],
        ok: false,
      }
    }
    return null
  }

  cmd_init() {
    if (this.state.initialized) {
      return { lines: [dim(`Reinitialized existing Git repository in ${this.state.cwd}/.git/`)], ok: true }
    }
    this.state.initialized = true
    this.state.branches[this.state.head] = null
    if (this.state.files['.gitignore'] && !this.state.index['.gitignore']) this.state.index['.gitignore'] = this.state.files['.gitignore']
    return {
      lines: [
        ok(`Initialized empty Git repository in ${this.state.cwd}/.git/`),
        dim(this.msg.defaultBranch(this.state.head)),
      ],
      ok: true,
    }
  }

  cmd_config(args) {
    const scope = args.filter((arg) => arg.startsWith('--'))[0] || ''
    const values = args.filter((arg) => !arg.startsWith('--'))
    if (!values.length) {
      const lines = [dim('[core]'), ...Object.entries({ ...this.baseConfig(), ...this.state.config }).map(([key, value]) => out(`  ${key}=${value}`))]
      return { lines, ok: true }
    }
    const [key, value] = values
    if (value === undefined) {
      const stored = this.state.config[key] ?? this.baseConfig()[key]
      return stored ? { lines: [out(String(stored))], ok: true } : { lines: [bad(this.msg.configMissing(key))], ok: false }
    }
    this.state.config[key] = value
    return { lines: [dim(`${scope === '--global' ? 'global' : 'local'}: ${key} = ${value}`)], ok: true }
  }

  baseConfig() {
    return { 'user.name': this.user.name, 'user.email': this.user.email }
  }

  cmd_status(args = []) {
    const repo = this.needRepo()
    if (repo) return repo
    const short = args.includes('-s') || args.includes('--short')
    const { staged, unstaged, untracked, ignored } = this.statusData()

    if (short) {
      const lines = []
      for (const item of staged) lines.push(out(`${item.kind === 'new' ? 'A' : item.kind === 'deleted' ? 'D' : 'M'}  ${item.path}`))
      for (const item of unstaged) lines.push(out(` ${item.kind === 'deleted' ? 'D' : 'M'} ${item.path}`))
      for (const path of untracked) lines.push(out(`?? ${path}`))
      return { lines: lines.length ? lines : [], ok: true }
    }

    const lines = []
    if (this.state.merge) lines.push(accent(`You have unmerged paths. (merge in progress: ${this.state.merge.branch})`))
    lines.push(out(`On branch ${this.currentBranch()}`))
    for (const [name, data] of Object.entries(this.state.remotes)) {
      const remoteHash = data.branches[this.state.head]
      if (!remoteHash) continue
      if (remoteHash === this.state.branches[this.state.head]) lines.push(dim(`Your branch is up to date with '${name}/${this.state.head}'.`))
      else lines.push(dim(`Your branch is ahead of '${name}/${this.state.head}' by 1 commit.`))
    }
    if (!this.state.commits.length) lines.push(out(''), out('No commits yet'))

    if (staged.length) {
      lines.push(out(''), out('Changes to be committed:'), dim('  (use "git restore --staged <file>..." to unstage)'))
      for (const item of staged) lines.push(ok(`        ${item.kind === 'new' ? 'new file' : item.kind === 'deleted' ? 'deleted' : 'modified'}:   ${item.path}`))
    }
    if (unstaged.length) {
      lines.push(out(''), out('Changes not staged for commit:'), dim('  (use "git add <file>..." to update what will be committed)'))
      for (const item of unstaged) lines.push(bad(`        ${item.kind === 'deleted' ? 'deleted' : 'modified'}:   ${item.path}`))
    }
    if (untracked.length) {
      lines.push(out(''), out('Untracked files:'), dim('  (use "git add <file>..." to include in what will be committed)'))
      for (const path of untracked) lines.push(bad(`        ${path}`))
    }
    if (ignored.length) {
      lines.push(out(''), dim(`Ignored files (${ignored.length}): ${ignored.join(', ')}`))
    }
    if (!staged.length && !unstaged.length && !untracked.length) {
      lines.push(out(''), out('nothing to commit, working tree clean'))
    }
    return { lines, ok: true }
  }

  pathsFromArgs(args) {
    const flags = args.filter((arg) => arg.startsWith('-'))
    let paths = args.filter((arg) => !arg.startsWith('-'))
    if (flags.includes('-A') || flags.includes('--all') || paths.includes('.')) return null
    return paths
  }

  cmd_add(args) {
    const repo = this.needRepo()
    if (repo) return repo
    const paths = this.pathsFromArgs(args)
    const targets = paths === null ? Object.keys(this.state.files) : paths
    const explicit = paths !== null
    const added = []
    const missing = []
    for (const target of targets) {
      const matches = Object.keys(this.state.files).filter((path) => path === target || path.startsWith(`${target}/`))
      if (!matches.length) {
        missing.push(target)
        continue
      }
      for (const path of matches) {
        if (this.isIgnored(path) && !(explicit && path === target)) continue
        this.state.index[path] = this.state.files[path]
        added.push(path)
      }
    }
    if (!explicit || (paths && paths.includes('.'))) {
      for (const path of Object.keys(this.state.index)) {
        if (!(path in this.state.files)) {
          delete this.state.index[path]
          added.push(this.msg.addDeleted(path))
        }
      }
    }
    const lines = []
    if (added.length) lines.push(dim(this.msg.added(added.join(', '))))
    for (const path of missing) lines.push(bad(`fatal: pathspec '${path}' did not match any files`))
    if (!added.length && !missing.length) lines.push(dim(this.msg.nothingToAdd))
    if (this.state.conflicts.length) {
      const resolved = this.state.conflicts.filter((path) => !HAS_CONFLICT.test(this.state.files[path] || ''))
      if (resolved.length) {
        this.state.conflicts = this.state.conflicts.filter((path) => !resolved.includes(path))
        lines.push(ok(this.msg.conflictResolved(resolved.join(', '))))
      }
    }
    return { lines, ok: missing.length === 0 }
  }

  cmd_rm(args) {
    const repo = this.needRepo()
    if (repo) return repo
    const paths = args.filter((arg) => !arg.startsWith('-'))
    const lines = []
    for (const path of paths) {
      if (path in this.state.index || path in this.state.files) {
        delete this.state.files[path]
        delete this.state.index[path]
        lines.push(dim(`rm '${path}'`))
      } else lines.push(bad(`fatal: pathspec '${path}' did not match any files`))
    }
    return { lines, ok: true }
  }

  cmd_mv(args) {
    const repo = this.needRepo()
    if (repo) return repo
    const [from, to] = args
    if (!from || !to) return { lines: [bad('usage: git mv <from> <to>')], ok: false }
    if (!(from in this.state.files)) return { lines: [bad(`fatal: bad source, source=${from}`)], ok: false }
    this.state.files[to] = this.state.files[from]
    delete this.state.files[from]
    this.state.index[to] = this.state.files[to]
    delete this.state.index[from]
    return { lines: [dim(`renamed: ${from} -> ${to}`)], ok: true }
  }

  cmd_commit(args) {
    const repo = this.needRepo()
    if (repo) return repo
    let message = ''
    let all = false
    for (let i = 0; i < args.length; i += 1) {
      const arg = args[i]
      if (arg === '-m' || arg === '--message') message = args[i + 1] || ''
      else if (arg.startsWith('-m') && arg.length > 2) message = arg.slice(2)
      else if (arg === '-a' || arg === '-am' || arg === '--all') all = true
      else if (arg.startsWith('-am')) {
        all = true
        message = arg.slice(3)
      }
    }
    if (!message) {
      return {
        lines: [bad('fatal: no commit message'), dim(this.msg.useCommitMessage)],
        ok: false,
      }
    }
    if (all) {
      for (const path of Object.keys(this.state.index)) {
        if (path in this.state.files) this.state.index[path] = this.state.files[path]
      }
    }
    const { staged } = this.statusData()
    const merging = Boolean(this.state.merge)
    if (!staged.length && !merging) {
      return {
        lines: [
          out(`On branch ${this.currentBranch()}`),
          out('nothing to commit, working tree clean'),
          dim(this.msg.addFirst),
        ],
        ok: false,
      }
    }
    if (merging && this.state.conflicts.length) {
      return {
        lines: [bad('error: Committing is not possible because you have unmerged files.'), dim(this.msg.resolveFirst)],
        ok: false,
      }
    }
    if (message.length < 8) {
      return {
        lines: [
          bad(this.msg.msgShort),
          dim(this.msg.msgShortWhy),
        ],
        ok: false,
      }
    }

    const parents = this.state.merge
      ? [this.state.branches[this.state.head], this.state.merge.hash].filter(Boolean)
      : this.state.branches[this.state.head]
        ? [this.state.branches[this.state.head]]
        : []

    const commit = this.createCommit(message, parents)
    const branchFrom = this.state.merge?.branch
    this.state.merge = null
    this.state.conflicts = []

    const stats = staged.map((item) => ` ${item.kind === 'new' ? 'create mode 100644' : 'modify'} ${item.path}`)
    const lines = [
      out(`[${this.currentBranch()} ${commit.hash}] ${message}`),
      ...stats.slice(0, 4).map(dim),
      dim(`${staged.length} file(s) changed`),
    ]
    if (branchFrom) lines.push(ok(`Merge of '${branchFrom}' committed.`))
    return { lines, ok: true }
  }

  cmd_log(args = []) {
    const repo = this.needRepo()
    if (repo) return repo
    const oneline = args.includes('--oneline') || args.includes('--pretty=oneline')
    const limitArg = args.find((arg) => /^-\d+$/.test(arg))
    const limit = limitArg ? Number(limitArg.slice(1)) : 0
    let commit = this.headCommit()
    const lines = []
    let count = 0
    while (commit && (!limit || count < limit)) {
      if (oneline) {
        const refs = this.refsFor(commit.hash)
        lines.push({ text: `${commit.hash} ${commit.message}${refs ? ` (${refs})` : ''}`, tone: 'accent' })
      } else {
        lines.push(accent(`commit ${commit.hash}${this.refsFor(commit.hash) ? ` (${this.refsFor(commit.hash)})` : ''}`))
        lines.push(dim(`Author: ${commit.author.name} <${commit.author.email}>`))
        lines.push(out(''))
        lines.push(out(`    ${commit.message}`))
        lines.push(out(''))
      }
      count += 1
      commit = commit.parents[0] ? this.state.commits.find((item) => item.hash === commit.parents[0]) : null
    }
    if (!lines.length) lines.push(bad('fatal: your current branch does not have any commits yet'))
    return { lines, ok: true }
  }

  refsFor(hash) {
    const refs = []
    for (const [name, ref] of Object.entries(this.state.branches)) {
      if (ref === hash) refs.push(name === this.state.head && !this.state.detached ? `HEAD -> ${name}` : name)
    }
    if (this.state.detached === hash) refs.push('HEAD')
    for (const [remote, data] of Object.entries(this.state.remotes)) {
      for (const [name, ref] of Object.entries(data.branches)) {
        if (ref === hash) refs.push(`${remote}/${name}`)
      }
    }
    return refs.join(', ')
  }

  cmd_show(args = []) {
    const repo = this.needRepo()
    if (repo) return repo
    const commit = this.findCommit(args[0] || 'HEAD')
    if (!commit) return { lines: [bad('fatal: bad revision')], ok: false }
    const lines = [accent(`commit ${commit.hash}`), dim(`Author: ${commit.author.name}`), out(''), out(`    ${commit.message}`), out('')]
    for (const [path, content] of Object.entries(commit.tree)) {
      lines.push(dim(`--- ${path}`))
      lines.push(...content.replace(/\n$/, '').split('\n').slice(0, 12).map(out))
    }
    return { lines, ok: true }
  }

  diffLines(a = '', b = '') {
    const oldLines = a.split('\n')
    const newLines = b.split('\n')
    const lines = []
    const max = Math.max(oldLines.length, newLines.length)
    for (let i = 0; i < max; i += 1) {
      const before = oldLines[i]
      const after = newLines[i]
      if (before === after) lines.push(dim(` ${after ?? ''}`))
      else {
        if (before !== undefined) lines.push(bad(`-${before}`))
        if (after !== undefined) lines.push(ok(`+${after}`))
      }
    }
    return lines
  }

  cmd_diff(args = []) {
    const repo = this.needRepo()
    if (repo) return repo
    const cached = args.includes('--cached') || args.includes('--staged')
    const tree = this.headTree()
    const base = cached ? tree : this.state.index
    const compare = cached ? this.state.index : this.state.files
    const paths = new Set([...Object.keys(base), ...Object.keys(compare)])
    const lines = []
    for (const path of paths) {
      if (base[path] === compare[path]) continue
      lines.push(accent(`diff --git a/${path} b/${path}`))
      lines.push(...this.diffLines(base[path] || '', compare[path] || ''))
    }
    if (!lines.length) lines.push(dim(cached ? this.msg.noStaged : this.msg.noChanges))
    return { lines, ok: true }
  }

  cmd_branch(args = []) {
    const repo = this.needRepo()
    if (repo) return repo
    const flags = args.filter((arg) => arg.startsWith('-'))
    const names = args.filter((arg) => !arg.startsWith('-'))

    if (flags.includes('-d') || flags.includes('-D')) {
      const name = names[0]
      if (!name || !(name in this.state.branches)) return { lines: [bad(`error: branch '${name}' not found.`)], ok: false }
      if (name === this.state.head) return { lines: [bad(`error: cannot delete branch '${name}' checked out`)], ok: false }
      delete this.state.branches[name]
      return { lines: [dim(`Deleted branch ${name}`)], ok: true }
    }

    if (names.length) {
      const name = names[0]
      if (name in this.state.branches) return { lines: [bad(`fatal: a branch named '${name}' already exists`)], ok: false }
      this.state.branches[name] = this.state.branches[this.state.head] || null
      return { lines: [dim(this.msg.branchCreated(name)), dim(this.msg.switchTo(name))], ok: true }
    }

    const lines = []
    const sorted = Object.keys(this.state.branches).sort()
    if (!sorted.length) return { lines: [dim(this.msg.noCommitsYet)], ok: true }
    for (const name of sorted) {
      const active = name === this.state.head && !this.state.detached
      lines.push(active ? accent(`* ${name}`) : out(`  ${name}`))
    }
    return { lines, ok: true }
  }

  cmd_switch(args = []) {
    const repo = this.needRepo()
    if (repo) return repo
    const create = args.includes('-c') || args.includes('-C')
    const detach = args.includes('--detach')
    const names = args.filter((arg) => !arg.startsWith('-'))

    if (create) {
      const name = names[0]
      if (!name) return { lines: [bad('fatal: missing branch name')], ok: false }
      if (name in this.state.branches) return { lines: [bad(`fatal: a branch named '${name}' already exists`)], ok: false }
      this.ensureCleanForSwitch()
      this.state.branches[name] = this.state.branches[this.state.head] || null
      this.state.head = name
      this.state.detached = null
      this.syncWorkingTree()
      return { lines: [ok(`Switched to a new branch '${name}'`)], ok: true }
    }

    const name = names[0]
    if (!name) return { lines: [bad('fatal: missing branch name')], ok: false }

    if (name in this.state.branches) {
      this.ensureCleanForSwitch()
      this.state.head = name
      this.state.detached = null
      this.syncWorkingTree()
      return { lines: [ok(`Switched to branch '${name}'`)], ok: true }
    }

    const commit = this.state.commits.find((item) => item.hash.startsWith(name))
    if (commit) {
      this.state.detached = commit.hash
      this.syncWorkingTree()
      return { lines: [accent(`HEAD is now at ${commit.hash} ${commit.message}`)], ok: true }
    }
    if (detach) return { lines: [bad(`fatal: invalid reference: ${name}`)], ok: false }
    return {
      lines: [bad(`fatal: invalid reference: ${name}`), dim(this.msg.createNew(name))],
      ok: false,
    }
  }

  ensureCleanForSwitch() {
    const { staged, unstaged } = this.statusData()
    if (staged.length || unstaged.length) {
      this.state.index = { ...this.headTree() }
    }
  }

  syncWorkingTree() {
    const tree = this.headTree()
    this.state.index = { ...tree }
    this.state.files = { ...tree }
  }

  cmd_checkout(args = []) {
    if (args.includes('-b') || args.includes('-B')) {
      const name = args.filter((arg) => !arg.startsWith('-'))[0]
      return this.cmd_switch(['-c', name])
    }
    if (args[0] === '--') {
      const paths = args.slice(1)
      const tree = this.headTree()
      for (const path of paths) {
        if (path in tree) this.state.files[path] = tree[path]
      }
      return { lines: [dim(this.msg.restoredHead(paths.join(', ')))], ok: true }
    }
    return this.cmd_switch(args)
  }

  cmd_restore(args = []) {
    const staged = args.includes('--staged')
    const paths = args.filter((arg) => !arg.startsWith('-'))
    if (staged) {
      const tree = this.headTree()
      for (const path of paths) {
        if (path in tree) this.state.index[path] = tree[path]
        else delete this.state.index[path]
      }
      return { lines: [dim(this.msg.unstaged(paths.join(', ')))], ok: true }
    }
    const tree = this.headTree()
    for (const path of paths) {
      if (path in tree) this.state.files[path] = tree[path]
    }
    return { lines: [dim(this.msg.restored(paths.join(', ')))], ok: true }
  }

  /* ---------------- merge ---------------- */

  commitByHash(hash) {
    return this.state.commits.find((commit) => commit.hash === hash) || null
  }

  ancestors(commit) {
    const seen = new Set()
    const queue = commit ? [commit] : []
    while (queue.length) {
      const item = queue.shift()
      if (!item || seen.has(item.hash)) continue
      seen.add(item.hash)
      for (const parent of item.parents) {
        const parentCommit = this.commitByHash(parent)
        if (parentCommit) queue.push(parentCommit)
      }
    }
    return seen
  }

  mergeBase(a, b) {
    const aAncestors = this.ancestors(a)
    let queue = b ? [b] : []
    const visited = new Set()
    while (queue.length) {
      const item = queue.shift()
      if (!item || visited.has(item.hash)) continue
      visited.add(item.hash)
      if (aAncestors.has(item.hash)) return item
      for (const parent of item.parents) {
        const commit = this.commitByHash(parent)
        if (commit) queue.push(commit)
      }
    }
    return null
  }

  treesEqual(a = {}, b = {}) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)])
    for (const key of keys) if (a[key] !== b[key]) return false
    return true
  }

  mergeTrees(base = {}, ours = {}, theirs = {}) {
    const result = {}
    const conflicts = []
    const paths = new Set([...Object.keys(base), ...Object.keys(ours), ...Object.keys(theirs)])
    for (const path of paths) {
      const b = base[path]
      const o = ours[path]
      const t = theirs[path]
      if (o === t) {
        if (o !== undefined) result[path] = o
        continue
      }
      if (o === b) {
        if (t !== undefined) result[path] = t
        continue
      }
      if (t === b) {
        if (o !== undefined) result[path] = o
        continue
      }
      const merged = lineMerge(b, o ?? '', t ?? '')
      result[path] = merged.text
      if (merged.conflict) conflicts.push(path)
    }
    return { result, conflicts }
  }

  cmd_merge(args = []) {
    const repo = this.needRepo()
    if (repo) return repo
    const name = args.filter((arg) => !arg.startsWith('-'))[0]
    if (!name) return { lines: [bad('fatal: branch name required')], ok: false }
    const targetHash = this.state.branches[name]
    if (!targetHash) return { lines: [bad(`merge: ${name} - not something we can merge`)], ok: false }
    const target = this.commitByHash(targetHash)
    const head = this.headCommit()

    if (name === this.state.head) {
      return { lines: [out('Already up to date.')], ok: true }
    }
    if (!head) {
      this.state.branches[this.state.head] = targetHash
      this.syncWorkingTree()
      return { lines: [dim('Fast-forward'), out(`Updated ${name}.`), out('Already up to date.')], ok: true }
    }

    const headAncestors = this.ancestors(head)
    if (headAncestors.has(target.hash)) {
      return { lines: [out('Already up to date.')], ok: true }
    }

    const targetAncestors = this.ancestors(target)
    if (targetAncestors.has(head.hash)) {
      this.state.branches[this.state.head] = target.hash
      this.syncWorkingTree()
      return {
        lines: [
          dim('Fast-forward'),
          out(`${head.hash}..${target.hash}`),
          out(`   ${target.message}`),
          ok(this.msg.fastForwarded(this.state.head, name)),
        ],
        ok: true,
      }
    }

    const base = this.mergeBase(head, target)
    const { result, conflicts } = this.mergeTrees(base?.tree || {}, head.tree, target.tree)
    this.state.files = { ...this.state.files, ...result }
    this.state.index = { ...this.state.files }
    this.state.merge = { branch: name, hash: target.hash }

    if (conflicts.length) {
      this.state.conflicts = conflicts
      for (const path of conflicts) delete this.state.index[path]
      return {
        lines: [
          accent(`Auto-merging ${conflicts.join(', ')}`),
          bad('CONFLICT (content): Merge conflict in ' + conflicts.join(', ')),
          bad('Automatic merge failed; fix conflicts and then commit the result.'),
          out(''),
          dim(this.msg.conflictMarkers),
        ],
        ok: false,
      }
    }

    const commit = this.createCommit(`Merge branch '${name}'`, [head.hash, target.hash])
    this.state.merge = null
    return {
      lines: [
        accent('Merge made by the "ort" strategy.'),
        out(` ${result ? Object.keys(result).length : 0} file(s) changed`),
        ok(this.msg.mergeCommit(commit.hash)),
      ],
      ok: true,
    }
  }

  cmd_merge_abort() {
    return { lines: [dim('merge aborted')], ok: true }
  }

  cmd_stash(args = []) {
    const repo = this.needRepo()
    if (repo) return repo
    const action = args[0] || 'push'
    if (action === 'list') {
      if (!this.state.stash.length) return { lines: [dim(this.msg.stashEmpty)], ok: true }
      return {
        lines: this.state.stash.map((entry, index) => out(`stash@{${index}}: ${entry.message}`)),
        ok: true,
      }
    }
    if (action === 'pop' || action === 'apply') {
      const entry = this.state.stash[0]
      if (!entry) return { lines: [bad('No stash entries found.')], ok: false }
      this.state.files = { ...this.state.files, ...entry.files }
      this.state.index = { ...this.state.files }
      if (action === 'pop') this.state.stash.shift()
      return {
        lines: [
          ...Object.keys(entry.files).map((path) => out(`Changes not staged for commit: ${path}`)),
          ok(this.msg.fromStash(action)),
        ],
        ok: true,
      }
    }
    if (action === 'drop') {
      if (!this.state.stash.length) return { lines: [bad('No stash entries found.')], ok: false }
      this.state.stash.shift()
      return { lines: [dim('Dropped stash@{0}')], ok: true }
    }
    // push
    const message = args.includes('-m') ? args[args.indexOf('-m') + 1] : ''
    const tree = this.headTree()
    const dirty = {}
    for (const path of Object.keys(this.state.files)) {
      if (this.state.files[path] !== tree[path]) dirty[path] = this.state.files[path]
    }
    if (!Object.keys(dirty).length) return { lines: [out('No local changes to save')], ok: true }
    this.state.stash.unshift({
      message: message || `WIP on ${this.currentBranch()}`,
      files: dirty,
      index: { ...this.state.index },
    })
    this.state.files = { ...tree }
    this.state.index = { ...tree }
    return {
      lines: [
        out(`Saved working directory and index state WIP on ${this.currentBranch()}`),
        dim(this.msg.stashed(Object.keys(dirty).length)),
      ],
      ok: true,
    }
  }

  cmd_reset(args = []) {
    const repo = this.needRepo()
    if (repo) return repo
    const mode = args.find((arg) => ['--soft', '--mixed', '--hard'].includes(arg)) || '--mixed'
    const ref = args.find((arg) => !arg.startsWith('-')) || 'HEAD'
    const commit = this.findCommit(ref)
    if (!commit) return { lines: [bad(`fatal: ambiguous argument '${ref}': unknown revision`)], ok: false }
    if (this.state.detached) this.state.detached = commit.hash
    else this.state.branches[this.state.head] = commit.hash

    const lines = [dim(`HEAD is now at ${commit.hash} ${commit.message}`)]
    if (mode === '--soft') {
      lines.push(dim(this.msg.resetSoft))
    } else if (mode === '--mixed') {
      this.state.index = { ...commit.tree }
      lines.push(dim(this.msg.resetMixed))
    } else {
      this.state.index = { ...commit.tree }
      this.state.files = { ...commit.tree }
      lines.push(bad(this.msg.resetHard))
    }
    return { lines, ok: true }
  }

  cmd_revert(args = []) {
    const repo = this.needRepo()
    if (repo) return repo
    const ref = args.find((arg) => !arg.startsWith('-')) || 'HEAD'
    const target = this.findCommit(ref)
    if (!target) return { lines: [bad('fatal: bad revision')], ok: false }
    const parent = target.parents[0] ? this.commitByHash(target.parents[0]) : null
    const current = this.headTree()
    const next = { ...current }
    const parentTree = parent ? parent.tree : {}
    const paths = new Set([...Object.keys(target.tree), ...Object.keys(parentTree)])
    for (const path of paths) {
      const before = parentTree[path]
      const after = target.tree[path]
      if (before === after) continue
      if (before === undefined) delete next[path]
      else next[path] = before
    }
    this.state.index = { ...next }
    this.state.files = { ...next }
    const commit = this.createCommit(`Revert "${target.message}"`, this.state.branches[this.state.head] ? [this.state.branches[this.state.head]] : [])
    this.state.files = { ...commit.tree }
    this.state.index = { ...commit.tree }
    return {
      lines: [
        out(`[${this.currentBranch()} ${commit.hash}] Revert "${target.message}"`),
        ok(this.msg.reverted),
      ],
      ok: true,
    }
  }

  cmd_remote(args = []) {
    const repo = this.needRepo()
    if (repo) return repo
    if (!args.length || args[0] === '-v') {
      const names = Object.keys(this.state.remotes)
      if (!names.length) return { lines: [dim(this.msg.noRemotes)], ok: true }
      const lines = []
      for (const [name, data] of Object.entries(this.state.remotes)) {
        lines.push(out(`${name}\t${data.url} (fetch)`), out(`${name}\t${data.url} (push)`))
      }
      return { lines, ok: true }
    }
    if (args[0] === 'add') {
      const [, name, url] = args
      if (!name || !url) return { lines: [bad('usage: git remote add <name> <url>')], ok: false }
      this.state.remotes[name] = { url, branches: {} }
      return { lines: [dim(`remote «${name}» → ${url}`)], ok: true }
    }
    if (args[0] === 'remove' || args[0] === 'rm') {
      delete this.state.remotes[args[1]]
      return { lines: [dim(this.msg.remoteRemoved(args[1]))], ok: true }
    }
    return { lines: [dim('git remote [-v | add <name> <url>]')], ok: true }
  }

  state_remoteTracking() {
    return Object.values(this.state.remotes).some((remote) => Object.keys(remote.branches).length)
  }

  cmd_push(args = []) {
    const repo = this.needRepo()
    if (repo) return repo
    const values = args.filter((arg) => !arg.startsWith('-'))
    const remote = values[0] || Object.keys(this.state.remotes)[0]
    const branch = values[1] || this.state.head
    if (!remote || !this.state.remotes[remote]) {
      return {
        lines: [
          bad('fatal: No configured push destination.'),
          dim(this.msg.remoteFirst),
        ],
        ok: false,
      }
    }
    const local = this.state.branches[branch]
    if (!local) return { lines: [bad(`error: src refspec ${branch} does not match any`)], ok: false }
    const data = this.state.remotes[remote]
    const previous = data.branches[branch]
    data.branches[branch] = local
    const lines = [
      out(`Enumerating objects: ${this.state.commits.length}, done.`),
      out(`To ${data.url}`),
    ]
    if (!previous) lines.push(ok(` * [new branch]      ${branch} -> ${branch}`))
    else lines.push(ok(`   ${previous}..${local}  ${branch} -> ${branch}`))
    if (args.includes('-u') || args.includes('--set-upstream')) lines.push(dim(`branch '${branch}' set up to track '${remote}/${branch}'.`))
    return { lines, ok: true }
  }

  cmd_pull(args = []) {
    const repo = this.needRepo()
    if (repo) return repo
    const remote = args.filter((arg) => !arg.startsWith('-'))[0] || Object.keys(this.state.remotes)[0]
    if (!remote || !this.state.remotes[remote]) {
      return { lines: [bad('fatal: No remote repository specified.'), dim(this.msg.remoteFirstUrl)], ok: false }
    }
    const data = this.state.remotes[remote]
    const remoteHash = data.branches[this.state.head]
    if (!remoteHash) {
      return { lines: [bad(`fatal: couldn't find remote ref ${this.state.head}`)], ok: false }
    }
    const head = this.headCommit()
    if (head && head.hash === remoteHash) return { lines: [out('Already up to date.')], ok: true }

    const target = this.commitByHash(remoteHash)
    if (!head) {
      this.state.branches[this.state.head] = remoteHash
      this.syncWorkingTree()
      return { lines: [ok(this.msg.pulled(`${remote}/${this.state.head}`))], ok: true }
    }
    const headAncestors = this.ancestors(head)
    if (headAncestors.has(remoteHash)) return { lines: [out('Already up to date.')], ok: true }
    if (this.ancestors(target).has(head.hash)) {
      this.state.branches[this.state.head] = remoteHash
      this.syncWorkingTree()
      return { lines: [dim('Fast-forward'), ok(this.msg.branchUpdated(`${remote}/${this.state.head}`))], ok: true }
    }
    const base = this.mergeBase(head, target)
    const { result, conflicts } = this.mergeTrees(base?.tree || {}, head.tree, target.tree)
    this.state.files = { ...this.state.files, ...result }
    this.state.index = { ...this.state.files }
    this.state.merge = { branch: `${remote}/${this.state.head}`, hash: remoteHash }
    if (conflicts.length) {
      this.state.conflicts = conflicts
      for (const path of conflicts) delete this.state.index[path]
      return {
        lines: [
          bad(`CONFLICT (content): Merge conflict in ${conflicts.join(', ')}`),
          dim(this.msg.resolveAndCommit),
        ],
        ok: false,
      }
    }
    const commit = this.createCommit(`Merge branch '${this.state.head}' of ${remote}`, [head.hash, remoteHash])
    return { lines: [ok(this.msg.mergeCommitCreated(commit.hash))], ok: true }
  }

  cmd_fetch() {
    const repo = this.needRepo()
    if (repo) return repo
    return { lines: [out('Fetching origin...'), dim(this.msg.noFetchChanges)], ok: true }
  }

  cmd_clone(args = []) {
    const url = args.find((arg) => !arg.startsWith('-'))
    if (!url) return { lines: [bad('fatal: You must specify a repository to clone.')], ok: false }
    this.state.initialized = true
    this.state.head = this.branch
    const files = {
      'README.md': this.msg.readmeBody,
      'index.html': '<!doctype html>\n<h1>Hello, world!</h1>\n',
      'styles.css': 'body {\n  font-family: sans-serif;\n}\n',
    }
    const first = { hash: shortHash(), message: 'Initial commit', parents: [], tree: { 'README.md': files['README.md'] }, author: this.user, date: Date.now() - 90000 }
    const second = {
      hash: shortHash(),
      message: 'Add landing page and styles',
      parents: [first.hash],
      tree: files,
      author: this.user,
      date: Date.now() - 40000,
    }
    this.state.commits = [second, first]
    this.state.branches = { [this.state.head]: second.hash }
    this.state.remotes = { origin: { url, branches: { [this.state.head]: second.hash } } }
    this.state.index = { ...files }
    this.state.files = { ...files }
    return {
      lines: [
        out(`Cloning into 'project'...`),
        out('remote: Enumerating objects: 6, done.'),
        out('Receiving objects: 100% (6/6), done.'),
        ok(this.msg.cloned(2, 3, url)),
      ],
      ok: true,
    }
  }

  cmd_help() {
    return this.help()
  }

  help() {
    const lines = [accent(this.msg.helpTitle)]
    for (const [command, label] of this.msg.help) lines.push(out(alignCmd(command, label)))
    lines.push(dim(this.msg.helpShell))
    if (this.hints.length) {
      lines.push(out(''), accent(this.msg.hintsTitle))
      for (const hint of this.hints) lines.push(out(`  • ${hint}`))
    } else {
      lines.push(out(''), dim(this.msg.noHints))
    }
    return { lines, ok: true }
  }
}

export function createSim(options) {
  return new GitSim(options)
}
