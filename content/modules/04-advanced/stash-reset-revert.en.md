# stash, reset and revert

Three tools for "I need to switch right now" and "I made an extra commit".

## git stash: hide unfinished work

The situation: you're editing a file, an urgent task arrives in another branch, and committing half-done work doesn't feel right.

```bash
git stash             # hide all changes; the working tree is clean again
git switch urgent-fix # switch branches calmly
# ... dealt with the urgent thing ...
git switch feature
git stash pop         # bring the changes back
```

Useful extras:

```bash
git stash list        # what's in the pantry
git stash -m "form draft"   # with a label
git stash apply       # restore but keep it in the list
git stash drop        # throw away the top entry
```

:::note stash is local
Stash never becomes a commit and is never pushed. It's a private pocket, not a way to share work.
:::

## git reset: undo a commit

`reset` moves the branch pointer backwards. What matters is **what happens to the changes**:

| Mode | Commit | Staging | Files |
|---|---|---|---|
| `--soft` | undone | changes kept | changes kept |
| `--mixed` (default) | undone | cleared | changes kept |
| `--hard` | undone | cleared | **changes deleted** |

```bash
git reset --soft HEAD~1     # "oops, forgot a file" — put the commit back into staging
git reset HEAD~1            # rewrite the commit from scratch
git reset --hard HEAD~1     # drop the commit together with the edits (careful!)
```

:::danger --hard doesn't ask
`--hard` wipes uncommitted changes without confirmation. If you did it by accident, `git reflog` shows where you were and helps you get back (for committed work only).
:::

## git revert: undo without rewriting history

If the commit already reached a shared branch, `reset` would rewrite history for everyone — bad. Instead `revert` creates a **new commit** that undoes the old one.

```bash
git revert HEAD             # undo the last commit
git revert a1b2c3d          # undo a specific one
```

History stays linear and teammates don't have to redo anything.

## Which one to pick

- Working alone, commit not pushed yet → `reset`.
- Commit already on a shared branch → `revert`.
- Need to switch branches, too early to commit → `stash`.
- Afraid you lost something → `git reflog`.

## Mini practice

The terminal below has a repository with one commit and an uncommitted change.

1. `git status` — see the change.
2. `git stash` — the working tree is clean, the file is back to the committed version.
3. `git stash list` — the entry is there.
4. `git stash pop` — the change is back.
5. `git add .` and `git commit -m "wip: draft"` — now there's an extra commit.
6. `git reset --soft HEAD~1` — undo it, keeping changes staged.
7. `git reset --hard HEAD` — put everything back.
