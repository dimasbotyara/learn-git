# .gitignore: secrets and junk

The main rule: **things other people don't need must not go into Git**. Passwords, personal settings, model weight folders and `node_modules` all belong on your machine, not in the repository.

## How it works

Create a `.gitignore` file in the project root and list patterns:

```bash
# secrets
.env
.env.*
*.pem

# dependencies and build output
node_modules/
dist/
__pycache__/
*.pyc

# editor and OS junk
.vscode/
.idea/
.DS_Store
```

Git stops offering those files in `git status`, and `git add .` won't pick them up.

:::danger If a secret is already committed
`.gitignore` does not rewrite history. If a password made it into a commit — **change the password** first, then clean up history. Assume it has leaked anyway.
:::

## Syntax

| Pattern | Meaning |
|---|---|
| `.env` | a file with that name in any folder |
| `*.log` | every file with that extension |
| `build/` | the whole folder |
| `/config.yml` | only in the project root |
| `!important.log` | an exception to the rules above |
| `# text` | a comment |

## Seeing what's ignored

```bash
git status --ignored
git check-ignore -v .env     # which rule matched
```

## Ready-made templates

Don't write them from scratch: GitHub keeps a collection at [github/gitignore](https://github.com/github/gitignore) — grab `Python.gitignore` or `Node.gitignore` and extend it.

## Mini practice

The terminal below has a `.env` file with a "secret" in it. Your task:

1. `git status` — confirm `.env` shows up as untracked.
2. Create `.gitignore` with rules:

   ```bash
   echo ".env" > .gitignore
   echo "node_modules/" >> .gitignore
   ```

3. `git status` — `.env` should no longer be offered.
4. `git add .` and `git commit -m "chore: ignore secrets and deps"`.
