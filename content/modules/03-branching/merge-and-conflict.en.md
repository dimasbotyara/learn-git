# git merge and how to read conflicts

Merging brings work from one branch into another. Git usually handles it on its own, but sometimes it asks for help. That's a normal Tuesday, not a disaster.

## A conflict-free merge

```bash
git switch main
git merge feature
```

Two scenarios are possible:

**Fast-forward** — `main` had no new commits, so Git just moves the pointer forward:

```
Updating 1a2b3c4..9f8e7d6
Fast-forward
 ideas.txt | 1 +
```

**3-way merge** — both branches had their own commits, so Git creates a separate merge commit with two parents.

## How a conflict appears

A conflict happens when **the same line** of the same file was changed differently in two branches. Git doesn't guess who's right — it honestly shows both versions.

```bash
git merge feature
# Auto-merging shared.txt
# CONFLICT (content): Merge conflict in shared.txt
# Automatic merge failed; fix conflicts and then commit the result.
```

The file gets markers:

```diff
<<<<<<< HEAD
version from the current branch
=======
version from the feature branch
>>>>>>> feature
```

## How to resolve it

1. Open the file and **keep what you think is right** (you may mix both versions).
2. Delete all markers: `<<<<<<<`, `=======`, `>>>>>>>`.
3. `git add shared.txt` — tell Git the file is ready.
4. `git commit -m "merge: resolve shared.txt"` — finish the merge.

Want to cancel everything and start over — `git merge --abort`.

:::tip How you know you've won
After `git add` the conflict is considered resolved. If you change your mind, just edit the file again and `git add` once more.
:::

## Reading Git's output

| Output line | What it means |
|---|---|
| `Already up to date.` | Nothing to merge, you already have it all |
| `Fast-forward` | The pointer simply moved, no conflicts |
| `Merge made by the "ort" strategy.` | A merge commit was created |
| `CONFLICT (content)` | You need to resolve it by hand |

## Mini practice

A conflict is already waiting in the terminal below: the same file was changed in `main` and in `feature`.

1. `git merge feature` — see the conflict (if it hasn't started yet).
2. `cat shared.txt` — look at the markers.
3. Decide on the content and overwrite the file:

   ```bash
   echo "the version I chose" > shared.txt
   ```

4. `git add shared.txt`.
5. `git commit -m "merge: resolve shared.txt"`.
6. `git log --oneline --graph` — confirm the merge is done.
