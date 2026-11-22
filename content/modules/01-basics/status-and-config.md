# git status и первичная настройка

Есть две вещи, которые стоит сделать сразу после `git init`: **представиться Git'у** и **научиться читать `git status`**. Второе — вообще самый полезный навык в Git.

## Представься: name и email

Git подписывает каждый коммит именем и почтой автора. Без этой настройки первый коммит может не пройти или будет подписан странно.

```bash
git config --global user.name "Имя Фамилия"
git config --global user.email "me@example.com"
```

Флаг `--global` значит «для всех репозиториев на этом компьютере». Хочешь разные подписи для работы и для личных проектов — настрой без `--global` внутри конкретного репозитория, и локальная настройка перебьёт глобальную.

:::tip Какая почта?
Лучше указать ту же, что привязана к GitHub — тогда коммиты на сайте будут связаны с твоим профилем и аватаркой.
:::

Проверить, что записалось:

```bash
git config --list
# user.name=Имя Фамилия
# user.email=me@example.com
```

Посмотреть конкретное значение:

```bash
git config user.email
```

## `git status` — твой лучший друг

Если сомневаешься, что происходит — запусти `git status`. Он всегда подскажет, что уже в истории, что ждёт отправки и что Git вообще не видит.

```bash
git status
# On branch main
# nothing to commit, working tree clean
```

Разберём три типичных состояния.

### 1. Новый файл (untracked)

```bash
echo "hello" > notes.txt
git status
# Untracked files:
#   notes.txt
# nothing added to commit but untracked files present
```

Git видит файл, но ещё не следит за ним. Исправляется командой `git add notes.txt`.

### 2. Файл в staging area (staged)

```bash
git add notes.txt
git status
# Changes to be committed:
#   new file:   notes.txt
```

Файл уже «в корзине» и попадёт в следующий коммит.

### 3. Файл изменён после добавления (modified)

```bash
echo "more" >> notes.txt
git status
# Changes not staged for commit:
#   modified:   notes.txt
```

Git напоминает: изменения есть, но в коммит они не попадут, пока снова не сделаешь `git add`.

## Что ещё умеет status

- `git status -s` — короткий формат в две колонки: слева staging, справа рабочая папка.
- `git status` подсказывает команды: «use `git add <file>`…» — можно читать как инструкцию.

:::note Запомни
Любая непонятная ситуация в Git начинается с одного вопроса: **«Что говорит `git status`?»** Ответ там есть почти всегда.
:::

## Шаблон для себя

Сделай так один раз — и больше не будешь думать про подпись коммитов:

1. `git config --global user.name "…"`
2. `git config --global user.email "…"`
3. `git config --list` — убедись, что обе строки на месте.
