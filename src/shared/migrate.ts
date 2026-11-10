type Json = Record<string, unknown>

const isObject = (v: unknown): v is Json => typeof v === 'object' && v !== null && !Array.isArray(v)

/**
 * Brings a stored file up to the current `schemaVersion` before it is validated, so an older
 * file is upgraded instead of being rejected. Run on every read; a no-op for current files.
 *
 * v1 -> v2: the icon moved from each countdown to its category. The first icon found on a
 * category's countdowns becomes the category's icon.
 */
export function migrateStore(raw: unknown): unknown {
    if (!isObject(raw) || raw.schemaVersion !== 1) return raw

    const countdowns = Array.isArray(raw.countdowns) ? raw.countdowns.filter(isObject) : []
    const categories = Array.isArray(raw.categories) ? raw.categories.filter(isObject) : []

    const iconOf = new Map<unknown, string>()
    for (const c of countdowns) {
        if (typeof c.icon === 'string' && c.categoryId !== undefined && !iconOf.has(c.categoryId)) {
            iconOf.set(c.categoryId, c.icon)
        }
    }

    return {
        ...raw,
        schemaVersion: 2,
        categories: categories.map((cat) => {
            const icon = cat.icon ?? iconOf.get(cat.id)
            return icon === undefined ? cat : { ...cat, icon }
        }),
        countdowns: countdowns.map((c) => {
            const copy = { ...c }
            delete copy.icon
            return copy
        })
    }
}
