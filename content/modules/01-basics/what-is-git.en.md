# What Git is (and what GitHub is not)

Imagine you're writing a file and want to keep not just the final version, but the **whole history**: what changed, when, and why. Git is the program that does exactly that. It lives on your computer, works without internet, and keeps history in a hidden `.git` folder inside your project.

:::note A simple analogy
Git is a **time machine for a folder of files**. GitHub is a **cloud safe** where you can put that time machine so other people can see it.
:::

## Git and GitHub are not the same thing

This is the most common beginner mix-up, so let's settle it once and for all:

| | Git | GitHub |
|---|---|---|
| What it is | a version control program | a website hosting Git repositories |
| Where it lives | on your computer | on the internet |
| Needs internet | no | yes |
| Who made it | Linus Torvalds, 2005 | the GitHub company, 2008 |

GitHub isn't the only host. There's GitLab, Bitbucket, Codeberg. Git itself stays exactly the same.

:::tip How not to get confused
If you're typing a command in the terminal — it's almost always **Git**. If you're opening a page in a browser and clicking "Create repository" — that's **GitHub**.
:::

## What Git can do

- **Keeps history.** Every save is a separate snapshot (commit) you can return to.
- **Works locally.** Commits don't need internet: it's only required to send things to a server.
- **Lets you branch.** You can experiment on a separate branch without touching the main one.
- **Helps teams.** Several people can change one project, and Git merges the changes carefully.

## What the workflow looks like

The loop you'll repeat every day:

```bash
git status          # 1. see what changed
git add .           # 2. pick the changes
git commit -m "..." # 3. save a snapshot
git push            # 4. send it to GitHub
```

Right now this looks like magic spells — that's normal. We'll go through each step separately and try them by hand.

## Check yourself

Answer two questions before moving on:

1. Can you make a commit without internet? *(Yes — Git works locally.)*
2. If you delete your GitHub account, does Git disappear from your computer? *(No, they're different things.)*
