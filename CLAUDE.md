# Countdown

macOS-only menu bar app for countdowns/reminders (school tasks etc). Click the tray icon → popover list. Linear / T3 Code style UI, light/dark/system theme.

## Stack

Electron + electron-vite, React 19, Tailwind v4, Zustand, Zod, electron-store (JSON), TypeScript strict. **Package manager: npm** (Node via fnm). Do not use pnpm/yarn. Node version pinned in `.node-version`.

## Commands

- `npm run dev` — run the app (HMR)
- `npm run typecheck` — node + web tsconfigs
- `npm run lint` / `npm run format` / `npm run format:check`
- `npm test` — Vitest (pure logic only)
- `npm run build` — typecheck + build; `npm run build:mac` — package a dmg
- Before finishing a change run: `npm run format:check && npm run lint && npm run typecheck && npm test` (this is exactly what CI runs, `.github/workflows/ci.yml`)
- `node scripts/make-tray-icon.mjs` — regenerates the tray template icons in `resources/`

## Architecture

- `src/main` — Electron main. `tray.ts` (TrayController class: tray + popover window), `store.ts` (electron-store, always Zod-validated on read), `ipc.ts` (typed handlers; broadcasts `state:changed` after every mutation), later `scheduler.ts` (class), `notifications.ts`, `shortcuts.ts`.
- `src/preload` — exposes typed `window.api` (`invoke` / `on`) only. No node integration.
- `src/shared` — `schemas.ts` (Zod, source of truth), `types.ts` (inferred), `ipc-contract.ts` (channel names + arg/result types). Imported via `@shared/*`.
- `src/renderer/src` — React function components + hooks. `store/useStore.ts` mirrors main's state. `lib/time.ts` holds pure time/grouping logic (tested).

## Conventions

- Formatting: Prettier, **4-space indent**, no semicolons, single quotes (`.prettierrc.yaml` + `.editorconfig`). Run `npm run format` after edits.
- macOS only. The scaffold's `build:win` / `build:linux` scripts are unused.
- Main process is the source of truth; renderer never writes storage directly, only via IPC.
- New IPC: add to `ipc-contract.ts` first, then handler in `ipc.ts` (TS enforces both), validate input with Zod.
- Classes only for long-lived main-process state (TrayController, Scheduler); everything else functions.
- Theme colors are CSS variables in `assets/main.css` (follow `prefers-color-scheme`, driven by `nativeTheme.themeSource`). Use Tailwind token classes (`bg-bg`, `text-fg`, `border-line`, `text-muted`, `text-accent`), not hardcoded colors.
- Window is transparent with vibrancy: keep surfaces translucent.
- Store has `schemaVersion`; bump it and add a migration when changing persisted shape.
- Keep the app dock-less (`app.dock.hide()`); it must keep running with no windows open.

## Status

Done: scaffold, tray + popover, typed IPC, store, list/add/complete/delete, time logic + tests, Prettier/ESLint setup, CI.
Next: theme setting (nativeTheme), categories/tags, scheduler + notifications, global shortcut + launch at login + settings panel, packaging. Plan: `~/.claude/plans/i-want-to-build-optimized-aurora.md`.
