# Countdown

A macOS menu bar app for countdowns and reminders — school deadlines, or anything else. Click the icon in the menu bar to see everything that's counting down, grouped by urgency.

Built with Electron, React, Tailwind and TypeScript. UI inspired by Linear and T3 Code, with light, dark and system themes.

## Status

Early development. Working: menu bar icon + popover, add / complete / delete countdowns, grouping by Overdue / Today / This week / Later / Done, persistence. Planned: theme setting, categories and tags, notifications, global shortcut, launch at login, packaged builds.

## Requirements

- macOS
- Node 24 (see `.node-version`; works with [fnm](https://github.com/Schniz/fnm))
- npm

## Getting started

```bash
npm install
npm run dev
```

The app has no Dock icon. Look for the clock icon in the menu bar.

## Scripts

| Command             | What it does                                    |
| ------------------- | ----------------------------------------------- |
| `npm run dev`       | Run the app with hot reload                     |
| `npm run build`     | Typecheck and build                             |
| `npm run build:mac` | Build and package a macOS app                   |
| `npm test`          | Unit tests (Vitest)                             |
| `npm run typecheck` | Typecheck main/preload and renderer             |
| `npm run lint`      | ESLint                                          |
| `npm run format`    | Format with Prettier (`format:check` to verify) |

CI (`.github/workflows/ci.yml`) runs format check, lint, typecheck, tests and a macOS build on every push and PR.

## Project layout

```
src/main       Electron main process: tray + popover, storage, IPC handlers
src/preload    Typed bridge exposed to the renderer as window.api
src/shared     Zod schemas, inferred types, IPC contract (shared by all processes)
src/renderer   React UI
```

Data is stored as JSON in the app's user data folder (`~/Library/Application Support/countdown-app`).

## Code style

Prettier with 4-space indentation, no semicolons, single quotes (`.prettierrc.yaml`, `.editorconfig`). Recommended VS Code extensions are listed in `.vscode/extensions.json` (ESLint, Prettier).
