# Your first repository: init and clone

A repository (often "repo") is a project folder that Git watches. There are two ways to get one: create it from scratch or clone an existing one.

## Way 1: `git init` — from scratch

Go into your project folder and turn it into a repository:

```bash
mkdir my-project
cd my-project
git init
```

What happens: Git creates a hidden `.git` folder — that's where all history lives. Your project files stay exactly where they are.

```bash
git init
# Initialized empty Git repository in /home/you/my-project/.git/
```

Check that it worked:

```bash
git status
# On branch main
# No commits yet
# nothing to commit (create/copy files and use "git add" to track)
```

:::note The "reinitialized" message
Running `git init` in a folder that is already a repository does no harm — Git just says `Reinitialized existing Git repository`. That's safe.
:::

## Way 2: `git clone` — copy an existing one

If the project is already on GitHub:

```bash
git clone https://github.com/user/project.git
```

You'll get a `project` folder with the files **and** the full history — every commit is already inside.

You can pick your own folder name:

```bash
git clone https://github.com/user/project.git my-folder
```

:::tip SSH addresses
The alternative address looks like `git clone git@github.com:user/project.git`. We'll cover the difference between HTTPS and SSH in the GitHub module — HTTPS is enough for now.
:::

## init or clone?

- **Brand-new project on your machine** → `init`.
- **Project already on GitHub** → `clone`.
- **Project on GitHub, but you want your own copy** → fork it first (the Fork button on the site), then `clone`.

## What's inside `.git`

You never need to poke around in there, but it's useful to know:

- `HEAD` — a pointer to the current branch;
- `objects/` — compressed snapshots of files and commits;
- `config` — settings for this particular repository.

:::warning Don't delete `.git`
If you delete the `.git` folder, the project becomes a plain folder with no history. You can't restore history from the files alone — only from a copy on GitHub.
:::

## Mini practice

Run these steps in your terminal:

```bash
mkdir learn-git-demo && cd learn-git-demo
git init
git status
```

If you see `No commits yet`, the repository was created correctly. In the next lesson we'll set your author identity and look at `git status` in more detail.
