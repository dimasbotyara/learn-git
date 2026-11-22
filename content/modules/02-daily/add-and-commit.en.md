# git add and git commit

Two steps that make up almost all of your daily work. Let's take them one at a time — and try them right away in the terminal below.

## The staging area: a basket before shipping

Imagine you're shipping a parcel. You don't sweep everything off your desk into the box — you **pick what goes in**. The staging area (also called the "index") is that box.

- Working directory — everything on your desk.
- Staging area — what's already in the box.
- Commit — a sealed parcel with a label saying what's inside.

`git add` puts files in the box, `git commit` seals it.

```bash
git add notes.txt      # one file
git add src/           # a whole folder
git add .              # everything that changed
```

:::note Why split it at all?
Sometimes you change five files but only want to commit two: a bug fix separately from an experiment. The staging area lets you choose.
:::

## git commit: a snapshot with a label

```bash
git commit -m "docs: add install instructions"
```

`-m` is the commit message. It goes into history, and in six months (or for a teammate) it will be the only explanation of **what** you did and **why**.

## Why "fix" and "update" are bad messages

Compare two histories:

```bash
git log --oneline
# a1b2c3d fix
# 9f8e7d6 update
# 5c4b3a2 oops
# 1a2b3c4 fix again
```

and

```bash
git log --oneline
# a1b2c3d fix: menu does not open on iOS 17
# 9f8e7d6 feat: add dark theme
# 5c4b3a2 test: coverage for the date parser
# 1a2b3c4 docs: describe setup with venv
```

With the second one you instantly know where to look. A good message answers the question "what changes for the people using this project".

:::tip A simple template
`type: what changed` — e.g. `fix: crash on empty file`, `feat: progress export`, `docs: .gitignore example`.
Use the imperative mood: "add", "fix", not "added", "fixed".
:::

## Looking at the result

```bash
git status              # what's in the box, what's on the desk
git log --oneline       # commit history
git diff                # changes not in the box yet
git diff --cached       # changes already in the box
```

## Mini practice

Follow these steps in the terminal below:

1. `git init` — create a repository.
2. Create a file: `echo "first commit" > notes.txt` (or `touch notes.txt`).
3. `git status` — see that the file is untracked.
4. `git add notes.txt` — put it in the basket.
5. `git commit -m "docs: add notes"` — record it.
6. `git log --oneline` — see your commit.

When you're done, the task turns green and you can move on.
