# Pull Requests, forks and code review

A Pull Request (PR) is not a Git command — it's a GitHub mechanism: "look at my branch, can it go into main?".

## Why bother if you could push straight to main

You could, but shouldn't:

- **Changes are visible in full** — as a diff, file by file, with highlighting.
- **There's discussion** — comments attached to specific lines.
- **There are checks** — tests, linters and builds run automatically.
- **The decision is recorded** — who approved, when and why.
- **Nothing breaks by accident** — changes reach main only after review.

## The journey of one change

```bash
git switch -c feature/avatar          # 1. your own branch
git add . && git commit -m "feat: avatar in profile"   # 2. commits
git push -u origin feature/avatar     # 3. the branch on GitHub
# 4. on the site: "Compare & pull request" → write the description → Create
# 5. a teammate reads it, comments, requests changes or approves
# 6. Merge pull request → Delete branch
git switch main && git pull           # 7. bring the result back home
```

## Writing a good PR description

A template that works:

```markdown
## What changed
- Added a profile avatar

## Why
Closes #42: users asked to see an avatar

## How to check
1. Open /profile
2. Make sure the avatar comes from GitHub

## Checklist
- [x] Added tests
- [x] Checked on mobile
```

## Forks: when you have no write access

A fork is **your own copy of someone else's repository** on GitHub. The open-source path:

1. The **Fork** button on the project page.
2. `git clone git@github.com:your_nick/project.git`.
3. Branch, commits, `push` — into your fork.
4. A PR from your fork into the original repository.
5. To pull in fresh upstream changes:

   ```bash
   git remote add upstream git@github.com:author/project.git
   git fetch upstream
   git merge upstream/main
   ```

## Code review: giving and taking

**If you're the author:**

- Don't take comments personally — they're about the code, not you.
- Answer concretely: agree → fix and say "done"; disagree → explain why.
- Don't `--force` push into a branch someone is already reviewing.

**If you're the reviewer:**

- Start with what's done well (genuinely, not out of politeness).
- Separate blockers from nitpicks: use `nit:` for small things, it's conventional.
- Explain the reason: not "rename it" but "rename it, this is a list, not a dict".

:::tip Five minutes of review saves an hour
If a PR is over 400 lines, ask for it to be split. Small PRs get more careful and faster reviews.
:::

## Helpful commands nearby

```bash
gh pr create --fill        # create a PR from the current branch (GitHub CLI)
gh pr list                 # open PRs
gh pr checkout 42          # check someone's PR locally
gh pr review 42 --approve  # approve
```

## Mini practice

Pretend you're preparing a PR. In the terminal below:

1. `git switch -c feature/profile-avatar` — a branch for the task.
2. `echo "avatar: on" > profile.txt` — the "change".
3. `git add .` and `git commit -m "feat: add avatar to profile"` — a meaningful commit.
4. `git push -u origin feature/profile-avatar` — send the branch.
5. `git log --oneline --graph` — see what history looks like for a reviewer.
