# Первый репозиторий: init и clone

Репозиторий (часто говорят «репо») — это папка проекта, за которой следит Git. Есть два способа её получить: создать с нуля или склонировать чужую.

## Способ 1: `git init` — с нуля

Заходим в папку проекта и превращаем её в репозиторий:

```bash
mkdir my-project
cd my-project
git init
```

Что произойдёт: Git создаст скрытую папку `.git` — там вся история. Файлы проекта при этом остаются на месте.

```bash
git init
# Initialized empty Git repository in /home/you/my-project/.git/
```

Проверить, что всё получилось:

```bash
git status
# On branch main
# No commits yet
# nothing to commit (create/copy files and use "git add" to track)
```

:::note Фраза «reinitialized»
Если выполнить `git init` в папке, где репозиторий уже есть, Git не сломает ничего — просто скажет `Reinitialized existing Git repository`. Это безопасно.
:::

## Способ 2: `git clone` — скопировать существующий

Если проект уже есть на GitHub:

```bash
git clone https://github.com/user/project.git
```

Появится папка `project` с файлами **и** с готовой историей — все коммиты уже внутри.

Можно указать своё имя папки:

```bash
git clone https://github.com/user/project.git my-folder
```

:::tip Аргументы по SSH
Альтернативный адрес выглядит так: `git clone git@github.com:user/project.git`. Разницу между HTTPS и SSH разберём в модуле про GitHub — пока достаточно HTTPS.
:::

## init или clone: что выбрать

- **Новый проект у тебя на компьютере** → `init`.
- **Проект уже есть на GitHub** → `clone`.
- **Проект есть на GitHub, и ты хочешь начать свой** → сначала форк (иконка Fork на сайте), потом `clone`.

## Что лежит внутри `.git`

Заглядывать туда не нужно, но полезно знать:

- `HEAD` — указатель на текущую ветку;
- `objects/` — сжатые снимки файлов и коммитов;
- `config` — настройки именно этого репозитория.

:::warning Не удаляй `.git`
Если удалить папку `.git`, проект останется обычной папкой без истории. Восстановить историю из неё одной нельзя — только из копии на GitHub.
:::

## Мини-практика

Выполни по шагам в терминале:

```bash
mkdir learn-git-demo && cd learn-git-demo
git init
git status
```

Увидел `No commits yet` — репозиторий создан правильно. В следующем уроке настроим подпись автора и разберём `git status` подробнее.
