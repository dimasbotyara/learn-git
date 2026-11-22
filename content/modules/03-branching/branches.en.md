# Why branches exist

A branch is a separate line of work. You can experiment, break everything you like, and `main` stays intact and working.

## The analogy

`main` is the clean copy you're ready to hand in. A branch is a separate sheet with an experiment: ruin it, throw it away, the clean copy is untouched.

## Core commands

```bash
git branch                 # list branches, the star marks the current one
git branch feature         # create a branch (and stay where you are)
git switch feature         # move to the branch
git switch -c feature      # create and switch in one go
git branch -d feature      # delete (once merged)
```

`git checkout` is the old way to do the same thing (`git checkout -b feature`). Modern Git recommends `git switch` because `checkout` has too many jobs: it switches branches *and* restores files.

:::tip Remember the minimum
`git switch -c name` — create a branch and move into it. That covers 90% of cases.
:::

## What happens under the hood

A branch is just a **pointer to a commit**. When you commit, the pointer moves forward. That's why creating a branch is instant and copies nothing.

```bash
git log --oneline --graph --all
```

Try this command in the terminal — you'll see the "fork" where branches diverge and meet again.

## Naming

The common convention is a prefix by type of work:

- `feature/dark-theme` — new functionality;
- `fix/login-crash` — a bug fix;
- `docs/readme` — documentation;
- `hotfix/payment` — an urgent fix.

That way you can tell what a branch is about even with thirty of them open.

## Mini practice

The terminal below already has a repository with one commit. Do this:

1. `git branch` — make sure you're on `main`.
2. `git switch -c feature/notes`.
3. `echo "idea" > ideas.txt`, then `git add .` and `git commit -m "feat: add ideas"`.
4. `git switch main` — notice the file `ideas.txt` is not here. Branches are isolated.
5. `git log --oneline --graph --all` — look at the fork.
