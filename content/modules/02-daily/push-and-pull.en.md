# git push and git pull

So far everything happened on your computer. Time to send work to the internet — and learn to pick up someone else's.

## Remote: where to send things

A remote is the "address" of a repository somewhere else. It's usually called `origin` (just a name, like "the folder with files"), and you get it automatically when you clone a project.

```bash
git remote -v
# origin  git@github.com:user/project.git (fetch)
# origin  git@github.com:user/project.git (push)
```

Add one by hand if the project was created locally:

```bash
git remote add origin git@github.com:user/project.git
```

## git push: send your commits

```bash
git push -u origin main
```

- `-u` (`--set-upstream`) remembers the pairing "local branch main → origin/main". After that plain `git push` is enough.
- Push sends **only committed work**. Uncommitted changes stay home.

:::warning Push ≠ commit
`git commit` saves locally, `git push` sends to the server. A very common beginner moment: "but I committed, why is GitHub empty?" — because you didn't push.
:::

## git pull: fetch someone else's work

```bash
git pull
```

It's `git fetch` (download the new commits) + `git merge` (merge into the current branch). If a teammate changed a file you also changed, you'll get a conflict; we'll resolve those in the branching module.

A useful habit: **start the day with `git pull`** so you don't untangle a pile of conflicts in the evening.

## A typical workflow

```bash
git pull                    # get what others did
git switch -c fix/typo      # a branch for the task
# ... edit files ...
git add .
git commit -m "fix: typo in the heading"
git push -u origin fix/typo  # send the branch and open a Pull Request
```

## If push gets rejected

```
! [rejected]  main -> main (fetch first)
```

That means the server has commits you don't have. The answer is almost always: `git pull`, sort it out, `git push` again.

:::danger Just don't --force
`git push --force` rewrites history on the server and can wipe someone's work. In a team it's used only on your own personal branches, and only deliberately.
:::

## Mini practice

The terminal below already has a repository with a commit and a configured `origin` remote. Your task:

1. `git status` — look around.
2. Create a file: `echo "release notes" > RELEASE.md`.
3. `git add .` and `git commit -m "docs: add release notes"`.
4. `git push -u origin main` — send it to the remote.
5. `git status` — make sure the branch is in sync.
