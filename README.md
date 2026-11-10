# Countdown

A macOS menu bar app for countdowns and reminders: school deadlines, or anything else. Click the icon in the menu bar to see everything that's counting down.

Built with Electron, React, Tailwind and TypeScript.

## Features

- Countdowns with a due date, optional time of day, description, category, icon and reminders
- A big day counter per entry (hours or minutes under a day), sorted by urgency
- Search, and filtering by category
- Categories with colors: create, rename, recolor, delete
- System, dark and light themes

Not built yet: native notifications (reminders are saved but don't fire), editing an existing countdown, a global shortcut, launch at login, packaged releases.

## Keyboard shortcuts

| Keys  | Action                                                         |
| ----- | -------------------------------------------------------------- |
| `⌘N`  | New countdown                                                  |
| `⌘↵`  | Add (on the New countdown screen)                              |
| `⌘⇧C` | Open the categories menu                                       |
| `⌘F`  | Focus search                                                   |
| `⌘,`  | Open settings                                                  |
| `Esc` | Close the open dropdown, go back a screen, or hide the popover |

## Getting started

Requires macOS, Node 24 (see `.node-version`, works with [fnm](https://github.com/Schniz/fnm)) and npm.

```bash
git clone https://github.com/otsosaarinen/dayline.git
cd dayline
npm install
npm run dev
```

The app has no Dock icon or window. Look for the clock icon in the menu bar.

## Scripts

| Command             | What it does                                   |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Run the app with hot reload                    |
| `npm run build`     | Typecheck and build                            |
| `npm run build:mac` | Build and package a macOS app                  |
| `npm test`          | Unit tests (Vitest)                            |
| `npm run typecheck` | Typecheck main/preload and renderer            |
| `npm run lint`      | ESLint                                         |
| `npm run format`    | Format with Prettier (`format:check` to check) |

CI (`.github/workflows/ci.yml`) runs the format check, lint, typecheck, tests and a macOS build on every push and pull request.

## Project layout

```
src/main       Electron main process: tray + popover, storage, IPC handlers
src/preload    Typed bridge exposed to the renderer as window.api
src/shared     Zod schemas, inferred types, IPC contract (used by all processes)
src/renderer   React UI
scripts        Dev tools (tray icon generator, offscreen screenshot renderer)
```

## Data

Stored as JSON in `~/Library/Application Support/countdown-app/countdowns.json`. Delete that file to reset the app.

## Code style

Prettier: 4-space indent, no semicolons, single quotes. The recommended VS Code extensions (ESLint, Prettier) are listed in `.vscode/extensions.json`.

## License

[MIT](LICENSE) © 2026 Otso Saarinen
