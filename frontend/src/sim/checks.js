/*
  Проверки заданий. Задание описывается в content/course.yaml:

  check:
    all:
      - initialized: true
      - commits: ">=1"
      - files: ["notes.txt"]
      - status.clean: true
      - branch: main
      - branchExists: feature
      - remote: origin
      - pushed: main
      - mergeInProgress: false
      - conflicts: 0
      - logContains: "docs:"
      - fileInHistory: ["notes.txt"]
      - stashCount: ">=1"
      - indexHas: ["README.md"]
      - fileContent: { path: ".gitignore", contains: ".env" }
      - ranCommands: ["git add", "git commit"]
*/

const OPS = {
  '>=': (a, b) => a >= b,
  '<=': (a, b) => a <= b,
  '>': (a, b) => a > b,
  '<': (a, b) => a < b,
  '==': (a, b) => a === b,
  '=': (a, b) => a === b,
  '!=': (a, b) => a !== b,
}

function numeric(value) {
  if (typeof value === 'number') return { op: '>=', n: value }
  const match = String(value).trim().match(/^(>=|<=|>|<|==|!=|=)?\s*(\d+)$/)
  if (!match) return null
  return { op: match[1] || '==', n: Number(match[2]) }
}

/* Коммиты, доступные из веток и HEAD: после git reset старые объекты
   остаются в state.commits, но в истории их уже нет. */
function reachableCommits(sim) {
  const seen = new Set()
  const queue = []
  const branches = sim.state.branches || {}
  for (const hash of Object.values(branches)) if (hash) queue.push(sim.commitByHash(hash))
  if (sim.state.detached) queue.push(sim.commitByHash(sim.state.detached))
  while (queue.length) {
    const commit = queue.shift()
    if (!commit || seen.has(commit.hash)) continue
    seen.add(commit.hash)
    for (const parent of commit.parents || []) queue.push(sim.commitByHash(parent))
  }
  return [...seen]
}

function checkOne(sim, key, expected, history) {
  const simState = sim.state
  switch (key) {
    case 'initialized':
      return simState.initialized === Boolean(expected)
    case 'commits': {
      const rule = numeric(expected)
      return rule ? OPS[rule.op](reachableCommits(sim).length, rule.n) : false
    }
    case 'commitsAtLeast': {
      const rule = numeric(expected)
      return rule ? simState.commits.length >= rule.n : false
    }
    case 'branches': {
      const rule = numeric(expected)
      return rule ? OPS[rule.op](Object.keys(simState.branches).length, rule.n) : false
    }
    case 'branchExists':
      return expected === true
        ? Object.keys(simState.branches).length > 0
        : Boolean(simState.branches[String(expected)])
    case 'branch':
      return !simState.detached && simState.head === String(expected)
    case 'files': {
      const list = Array.isArray(expected) ? expected : [expected]
      return list.every((path) => path in simState.files)
    }
    case 'indexHas': {
      const list = Array.isArray(expected) ? expected : [expected]
      return list.every((path) => path in simState.index)
    }
    case 'ignored': {
      const list = Array.isArray(expected) ? expected : [expected]
      return list.every((path) => sim.isIgnored(path))
    }
    case 'fileContent': {
      const config = expected || {}
      const content = simState.files[config.path] ?? ''
      return typeof content === 'string' && content.includes(String(config.contains ?? ''))
    }
    /* Файл существовал в каком-то коммите истории (важно, когда в рабочей
       папке его уже нет — например, после возврата в main). */
    case 'fileInHistory': {
      const list = Array.isArray(expected) ? expected : [expected]
      const commits = reachableCommits(sim).map((hash) => sim.commitByHash(hash)).filter(Boolean)
      return list.every((path) => commits.some((commit) => path in (commit.tree || {})))
    }
    case 'logContains': {
      const needle = String(expected).toLowerCase()
      if (!simState.commits.length) return false
      const head = sim.headCommit()
      let commit = head
      while (commit) {
        if (commit.message.toLowerCase().includes(needle)) return true
        commit = commit.parents[0] ? sim.commitByHash(commit.parents[0]) : null
      }
      return false
    }
    case 'messageLength': {
      const head = sim.headCommit()
      if (!head) return false
      const rule = numeric(expected)
      return rule ? OPS[rule.op](head.message.length, rule.n) : true
    }
    case 'stashCount': {
      const rule = numeric(expected)
      return rule ? OPS[rule.op](simState.stash.length, rule.n) : false
    }
    case 'stashed':
      return simState.stash.length > 0 === Boolean(expected)
    case 'status.clean':
      return sim.isClean() === Boolean(expected)
    case 'untrackedCount': {
      const rule = numeric(expected)
      return rule ? OPS[rule.op](sim.statusData().untracked.length, rule.n) : false
    }
    case 'remote':
      return expected === true
        ? Object.keys(simState.remotes).length > 0
        : Boolean(simState.remotes[String(expected)])
    case 'pushed': {
      const branch = String(expected)
      return Object.values(simState.remotes).some((remote) => Boolean(remote.branches[branch]))
    }
    case 'remoteBranch': {
      const [remote, ...branchParts] = String(expected).split('/')
      return Boolean(simState.remotes[remote]?.branches[branchParts.join('/')])
    }
    case 'mergeInProgress':
      return Boolean(simState.merge) === Boolean(expected)
    case 'conflicts': {
      const rule = numeric(expected)
      return rule ? OPS[rule.op](simState.conflicts.length, rule.n) : false
    }
    case 'detached':
      return Boolean(simState.detached) === Boolean(expected)
    case 'ranCommands': {
      const list = Array.isArray(expected) ? expected : [expected]
      const lines = (history || []).map((item) => item.trim().toLowerCase()).join('\n')
      return list.every((needle) => lines.includes(String(needle).toLowerCase()))
    }
    case 'ranCommandPattern': {
      const pattern = new RegExp(String(expected), 'i')
      return (history || []).some((line) => pattern.test(line))
    }
    default:
      return false
  }
}

export function evaluateCheck(sim, check, history = []) {
  if (!check) return { passed: true, details: [] }
  const items = []

  const visit = (node, mode = 'all') => {
    if (!node || typeof node !== 'object') return
    if (Array.isArray(node)) {
      node.forEach((item) => visit(item, mode))
      return
    }
    for (const [key, value] of Object.entries(node)) {
      if (key === 'all' || key === 'any' || key === 'not') {
        const children = Array.isArray(value) ? value : [value]
        const results = children.map((child) => evaluateCheck(sim, child, history))
        if (key === 'not') items.push({ mode: 'not', passed: !results.some((r) => r.passed) })
        else items.push({ mode: key, passed: key === 'all' ? results.every((r) => r.passed) : results.some((r) => r.passed) })
        continue
      }
      if (key === 'explain') continue
      let passed
      if (key === 'fileContent' && value && typeof value === 'object') {
        passed = checkOne(sim, 'fileContent', value, history)
      } else {
        passed = checkOne(sim, key, value, history)
      }
      items.push({ mode: 'leaf', key, value, passed })
    }
  }

  visit(check)
  const passed = items.every((item) => item.passed)
  return { passed, details: items }
}

/* Человеко-понятное описание требования — для подсказки «чего не хватает». */
export const CHECK_LABELS = {
  initialized: () => 'репозиторий создан (git init)',
  commits: (value) => `коммитов: ${value}`,
  branches: (value) => `веток: ${value}`,
  'status.clean': () => 'рабочая папка без изменений',
  stashCount: (value) => `в stash записей: ${value}`,
  conflicts: () => 'конфликтов не осталось',
  mergeInProgress: (value) => (value ? 'слияние начато' : 'слияние завершено'),
}
