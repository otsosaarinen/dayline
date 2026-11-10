# Countdown

macOS-only menu bar app for countdowns/reminders. Click the tray icon, get a popover. Linear / T3 Code style UI.

**Stack:** Electron + electron-vite, React 19, Tailwind v4, Zustand, Zod, electron-store (JSON), lucide-react, TypeScript strict. **npm only** (Node via fnm, pinned in `.node-version`); no pnpm/yarn.

## Commands

- `npm run dev` runs the app. `npm test` is Vitest (pure logic only). `npm run build:mac` packages a dmg.
- Before finishing any change run what CI runs: `npm run format:check && npm run lint && npm run typecheck && npm test`.
- **Visual check without screen-recording permission:** `npm run build && npx electron scripts/screenshot.cjs out.png ["<js to run in the page>"]` renders the real UI offscreen with seeded sample data (`THEME=light` for light mode); then Read the PNG. Do this after every UI change.
- **Test keyboard and navigation with real input** (`webContents.sendInputEvent` in an Electron script), not synthetic DOM events. Synthetic events missed a real bug where one Escape press was handled twice.
- `node scripts/make-tray-icon.mjs` regenerates the tray icons.

## Architecture

- `src/main`: `tray.ts` (TrayController: tray + popover window), `store.ts` (electron-store, Zod-validated on read), `ipc.ts` (typed handlers; broadcasts `state:changed` after each mutation), `theme.ts`.
- `src/preload`: exposes only the typed `window.api` (`invoke` / `on`).
- `src/shared`: `schemas.ts` (Zod, source of truth), `types.ts` (inferred), `ipc-contract.ts` (channels), `constants.ts`. Import via `@shared/*`.
- `src/renderer/src`: function components + hooks. `store/useStore.ts` mirrors main's state. `lib/` holds tested pure logic (`time`, `dates`, `calendar`, `categories`, `reminders`) and the icon registry (`entryIcons`).

## Rules

- Main is the source of truth. The renderer only changes data through IPC.
- New IPC: add the channel to `ipc-contract.ts` first, then the handler in `ipc.ts` (TS enforces both); validate input with Zod.
- Zod gotcha: `.partial()` re-applies `.default()`s and would reset fields. Patch schemas (`SettingsPatchSchema`, `CategoryPatchSchema`) are built without defaults. Keep it that way.
- Classes only for long-lived main-process state (`TrayController`); everything else is functions.
- Keep the app dock-less (`app.dock.hide()`) and running with no windows open. macOS only.
- Store has `schemaVersion`; bump it and add a migration when the persisted shape changes.
- Don't leave dead code, unused files or unused exports. Remove it, don't comment it out.

## Navigation and input

- **One screen at a time:** `App` has a single `view` (`list` | `add` | `settings`). Add and Settings are full screens with a Back row, never panels layered over the list. Every screen change goes through `go()` in `App.tsx`, which also closes the categories menu so nothing lingers underneath.
- **All keyboard shortcuts live in `App.tsx`.** Shortcuts and header icons only _open_ a screen, never toggle it closed; leaving is the Back row or Esc. Shortcuts must work from any screen.
- **Escape has a single owner:** an open `Menu` swallows it first, otherwise `App` steps back to the list (or clears search, or hides the popover). Don't add per-component Escape handlers; a second handler on the same keypress would hide the popover.

## Data model

- Time is optional. `hasTime: false` means date-only: `dueAt` is local midnight of that date and only the calendar date counts (`lib/time.ts` uses calendar days, never hours). Date-only reminders should fire at a fixed morning time (planned: 09:00 local).
- A category stores a color _name_ (`CATEGORY_COLORS`), rendered via `var(--cat-<name>)`.
- A countdown's icon is a key into `lib/entryIcons.ts` (curated lucide set). Add icons, never rename keys.

## UI rules

- **Colors live in one place:** the COLOR SCHEME block in `styles/globals.css`. Never hardcode colors; use the token classes (`bg-bg`, `bg-elevated`, `bg-hover`, `border-line`, `text-fg`/`muted`/`faint`, `text-accent`, `text-danger`/`warn`/`ok`/`info`) or `var(--…)`. A new color goes in both modes, then in the `@theme` block.
- **Monochrome chrome:** `--accent` is neutral (near-white in dark). Color is only for meaning (status, category colors). No brand/indigo accent.
- **Components:** icons are `lucide-react` named imports (no hand-drawn SVGs; the only exception is `GithubIcon`, since lucide has no brand logos). Tooltips use `Tooltip`, never the native `title`. Dropdowns use `Menu` (`anchorToParent` inside forms). Shortcut hints use `Kbd`.
- **Add screen:** options are stacked `FieldRow`s (date, time, category, icon, reminders), never side by side. One action, an Add button: no Cancel, no inline shortcut hint (`⌘↵` submits and is shown in the tooltip). No native date/time pickers: they draw their own icon and their popup can blur and hide the popover. Dates use the custom `DatePicker`.
- **Categories:** all management (filter, create, edit, delete) is in `CategoryMenu` (the folder icon). Don't add category UI elsewhere.
- **List rows** (modeled on the Linear/T3 Code sidebar): popover is 340px wide; title 16px, category 15px, date and description 14px, search 16px; a two-line row is about 70px, plus 21px with a description. Lines: title (optional icon in a 26px indent column), category square + name + date (+ time), description indented under the name. Bright title = needs attention, dim = can wait. No group headings, no strike-through. The big number on the left is the one intentional deviation.
- The panel is a soft charcoal (`--bg`), flat, translucent over macOS vibrancy.
- The footer GitHub icon opens `REPO_URL` (`shared/constants.ts`) through the `app:openRepo` IPC. Main only ever opens that fixed https URL.

## Status

Done: tray + popover, countdowns (optional time, description, category, icon, reminders setting), search, categories, themes, CI.
Next: scheduler + native notifications, editing a countdown, global shortcut, launch at login, packaged releases (real app icon).
