# git status and first-time setup

There are two things worth doing right after `git init`: **introduce yourself to Git** and **learn to read `git status`**. The second one is arguably the most useful skill in all of Git.

## Introduce yourself: name and email

Git signs every commit with the author's name and email. Without this setup, your first commit may fail or end up signed oddly.

```bash
git config --global user.name "Your Name"
git config --global user.email "me@example.com"
```

The `--global` flag means "for every repository on this machine". Want different identities for work and personal projects? Set it without `--global` inside a specific repository, and the local setting wins over the global one.

:::tip Which email?
Prefer the one linked to your GitHub account — then commits on the site will be connected to your profile and avatar.
:::

Check what got saved:

```bash
git config --list
# user.name=Your Name
# user.email=me@example.com
```

Read a single value:

```bash
git config user.email
```

## `git status` — your best friend

If you're unsure what's going on, run `git status`. It always tells you what's already in history, what's waiting to be sent, and what Git doesn't see at all.

```bash
git status
# On branch main
# nothing to commit, working tree clean
```

Let's look at three typical states.

### 1. A new file (untracked)

```bash
echo "hello" > notes.txt
git status
# Untracked files:
#   notes.txt
# nothing added to commit but untracked files present
```

Git sees the file but isn't tracking it yet. Fix it with `git add notes.txt`.

### 2. A file in the staging area (staged)

```bash
git add notes.txt
git status
# Changes to be committed:
#   new file:   notes.txt
```

The file is "in the basket" and will go into the next commit.

### 3. A file changed after staging (modified)

```bash
echo "more" >> notes.txt
git status
# Changes not staged for commit:
#   modified:   notes.txt
```

Git is reminding you: the changes exist, but they won't be committed until you run `git add` again.

## What else status can do

- `git status -s` — a short two-column format: staging on the left, working tree on the right.
- `git status` suggests commands ("use `git add <file>`…") — read it like instructions.

:::note Remember
Every confusing Git situation starts with one question: **"What does `git status` say?"** The answer is almost always there.
:::

## A template for yourself

Do this once and stop worrying about commit identity:

1. `git config --global user.name "…"`
2. `git config --global user.email "…"`
3. `git config --list` — make sure both lines are there.
