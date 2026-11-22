# SSH keys without the pain

Typing a password on every `git push` is the main reason people hate Git. An SSH key solves it once and for all: set it up once, and nobody asks you anything again.

## How it works

You have **two** halves of a key:

- the **private** one (`id_ed25519`) — lives only on your machine, never show it to anyone;
- the **public** one (`id_ed25519.pub`) — safe to publish, this is what you upload to GitHub.

GitHub stores the public key. When you connect, you prove you hold the private one — and the server recognises you.

## Step 1. Generate a key

```bash
ssh-keygen -t ed25519 -C "you@example.com"
```

- `-t ed25519` — a modern, short key type (better than the old `rsa`);
- `-C` — a comment, an email is convenient;
- for the path question press Enter (default `~/.ssh/id_ed25519`);
- the passphrase can be empty, or you can set one — then it's asked once per session.

You get two files: `~/.ssh/id_ed25519` (private) and `~/.ssh/id_ed25519.pub` (public).

## Step 2. Copy the public key

```bash
cat ~/.ssh/id_ed25519.pub
```

Copy **the whole line**, starting with `ssh-ed25519`.

## Step 3. Add it to GitHub

- Open **Settings → SSH and GPG keys → New SSH key**.
- Title — anything (e.g. "Work laptop").
- Key type — `Authentication Key`.
- Paste the line and save.

## Step 4. Check

```bash
ssh -T git@github.com
# Hi username! You've successfully authenticated...
```

If you see the greeting, it works. The phrase `but GitHub does not provide shell access` is normal — that's how it should be.

:::tip The easy path if GitHub CLI is already authorised
If you have `gh` installed and logged in, you can skip the browser entirely:

```bash
gh auth login          # pick SSH
gh ssh-key add ~/.ssh/id_ed25519.pub
```

`gh` generates the key and uploads it to GitHub for you.
:::

## The one problem everybody hits

```bash
git clone git@github.com:user/project.git
# Permission denied (publickey)
```

Causes by frequency:

1. The key wasn't added to GitHub (step 3).
2. You cloned over HTTPS while the key is set up for SSH: `git remote -v` shows the address; fix it with `git remote set-url origin git@github.com:user/project.git`.
3. The SSH agent doesn't know the key: `ssh-add ~/.ssh/id_ed25519`.

:::danger Never publish the private key
`id_ed25519` without `.pub` is the file you must never send anywhere — not to a chat, not into a repository. The public key (`.pub`) is meant to be published.
:::

## HTTPS or SSH

| | HTTPS | SSH |
|---|---|---|
| First login | token in the browser | set up a key once |
| Passwords | needs a Personal Access Token | never |
| Corporate proxies | usually easier | sometimes blocked |

For personal work SSH is nicer; for CI and scripts people often use HTTPS with a token.

## Mini practice

The terminal below has a scenario with a configured remote. Walk the whole path to lock in the sequence:

1. `git remote -v` — see which address origin points to.
2. `git status` — make sure everything is clean.
3. `git push` — send the changes (in the trainer no password is asked — just like with an SSH key).
4. `git log --oneline` — see what was sent.
