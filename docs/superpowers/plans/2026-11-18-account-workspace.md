# Account Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Перестроить ЛК в полноширинную рабочую поверхность с прямой проверкой доступа, компактной шапкой и профилем пользователя.

**Architecture:** `RequireAuth` получает пользователя через `/me` и передаёт его дочернему каркасу. `AccountShell` владеет рабочей шапкой, выходом, сайдбаром и контентной областью; `AccountLayout` остаётся корневой оболочкой маршрутов.

**Tech Stack:** React, React Router, Rsbuild, CSS, Node test runner, Edge CDP.

**Spec:** `docs/superpowers/specs/2026-11-18-account-workspace-design.md`

## Global Constraints

- Не добавлять страницу входа на поддомене ЛК.
- Не использовать `!important` и не дублировать существующие CSS-селекторы.
- Сохранить адаптацию desktop, tablet и mobile.
- Данные профиля получать из серверной сессии.

## Review Focus

- Неавторизованный прямой вход должен открыть главную основного сайта с `auth=login`.
- Ошибка выхода не должна удерживать пользователя в ЛК.
- Отсутствующее имя должно заменяться email без пустого профиля.
- Длинные email и названия разделов не должны расширять viewport.
- Mobile-навигация должна прокручиваться горизонтально без горизонтального скролла страницы.

---

### Task 1: Session routing and logout

**Files:**
- Modify: `src/components/RequireAuth.jsx`
- Modify: `src/components/AccountShell.jsx`
- Test: `tests/account-access.test.mjs`

- [ ] Написать browser-тест неавторизованного редиректа, передачи пользователя и выхода на главную.
- [ ] Запустить тест и подтвердить ожидаемое падение.
- [ ] Передать пользователя из `RequireAuth`, сделать прямой внешний редирект и серверный выход.
- [ ] Запустить тест и подтвердить прохождение.

### Task 2: Full-width account shell

**Files:**
- Modify: `src/components/AccountLayout.jsx`
- Modify: `src/components/AccountShell.jsx`
- Modify: `src/styles/pages.css`
- Modify: `src/pages/AccountPages.jsx`
- Test: `tests/account-workspace.test.mjs`

- [ ] Добавить проверки отсутствия крошек, компактной шапки, профиля, баланса и полноширинной сетки.
- [ ] Запустить тест и подтвердить ожидаемое падение.
- [ ] Перенести заголовок и баланс в рабочую шапку, удалить `PageHero`, растянуть сетку и сохранить сайдбар.
- [ ] Проверить desktop и mobile browser-тестом.

### Task 3: Verification and deployment

**Files:**
- Modify: `context/context.md`

- [ ] Запустить unit-тесты, browser-тесты, detector и production-сборку.
- [ ] Создать локальный архив, атомарно опубликовать frontend и проверить публичный поддомен.
- [ ] Обновить контекст релиза и очистить временные серверные файлы.
