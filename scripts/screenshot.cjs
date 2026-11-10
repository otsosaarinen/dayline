// Renders the real built UI offscreen and saves a PNG, so layout can be checked without
// screen-recording permission. Uses a throwaway userData dir seeded with sample data.
//   npm run build && npx electron scripts/screenshot.cjs <out.png> [js-to-run-in-page]
const { app, BrowserWindow } = require('electron')
const path = require('path')
const fs = require('fs')
const os = require('os')

const out = path.resolve(process.argv[2] || 'screenshot.png')
const pageScript = process.argv[3] || ''
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const userData = fs.mkdtempSync(path.join(os.tmpdir(), 'dayline-shot-'))
app.setPath('userData', userData)

const day = (offset) => {
    const d = new Date()
    d.setDate(d.getDate() + offset)
    d.setHours(0, 0, 0, 0)
    return d.toISOString()
}
const inHours = (h) => new Date(Date.now() + h * 3_600_000).toISOString()
const base = (o) => ({
    notifyLeadMinutes: [],
    createdAt: new Date().toISOString(),
    ...o
})
const seed = {
    schemaVersion: 3,
    settings: { theme: process.env.THEME || 'dark' },
    categories: [
        { id: 'c1', name: 'Thesis', color: 'orange', icon: 'GraduationCap' },
        { id: 'c2', name: 'Physics', color: 'blue', icon: 'FlaskConical' },
        { id: 'c3', name: 'Personal', color: 'pink' }
    ],
    countdowns: [
        base({
            id: '1',
            startAt: day(-2),
            title: 'Physics lab report',
            categoryId: 'c2',
            dueAt: inHours(5),
            hasTime: true,
            description: 'Chapters 3 and 4, include graphs'
        }),
        base({
            id: '2',
            startAt: day(-9),
            title: 'Pay tuition fee',
            categoryId: 'c3',
            dueAt: day(-2),
            hasTime: false
        }),
        base({
            id: '3',
            startAt: day(-6),
            title: 'Submit thesis draft to supervisor',
            categoryId: 'c1',
            dueAt: day(12),
            hasTime: false,
            description: 'Send the PDF and the dataset link for comments'
        }),
        base({
            id: '4',
            startAt: day(-5),
            title: 'Renew passport',
            categoryId: 'c3',
            dueAt: day(45),
            hasTime: false
        }),
        base({
            id: '6',
            title: 'Whole year, no category',
            startAt: new Date(new Date().getFullYear(), 0, 1).toISOString(),
            dueAt: new Date(new Date().getFullYear(), 11, 31).toISOString(),
            hasTime: false
        })
    ]
}
fs.writeFileSync(path.join(userData, 'countdowns.json'), JSON.stringify(seed))

require(path.join(__dirname, '..', 'out', 'main', 'index.js'))

app.whenReady().then(async () => {
    let win
    for (let i = 0; i < 80 && !win; i++) {
        await sleep(100)
        win = BrowserWindow.getAllWindows()[0]
    }
    if (!win) throw new Error('no window')
    if (win.webContents.isLoading())
        await new Promise((r) => win.webContents.once('did-finish-load', r))
    await sleep(800)
    // Stand-in for the desktop behind the translucent popover.
    await win.webContents.insertCSS('html{background:#2a2c4a !important}')
    if (pageScript) {
        const result = await win.webContents.executeJavaScript(pageScript)
        if (result !== undefined) console.log('page result:', JSON.stringify(result))
        await sleep(500)
    }
    const img = await win.webContents.capturePage()
    fs.writeFileSync(out, img.toPNG())
    console.log('saved', out, img.getSize())
    app.exit(0)
})
