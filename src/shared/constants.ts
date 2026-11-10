/**
 * Category color names. The actual colors are CSS variables (`--cat-<name>`) defined in
 * styles/globals.css, so a category stores a name, not a hex value.
 */
export const CATEGORY_COLORS = [
    'blue',
    'orange',
    'pink',
    'red',
    'green',
    'purple',
    'teal',
    'gray'
] as const

export type CategoryColor = (typeof CATEGORY_COLORS)[number]

/** The project's GitHub repository. Set this to its https:// URL and the footer icon starts working. */
export const REPO_URL = ''
