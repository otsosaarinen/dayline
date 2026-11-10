// Renders the Lucide "Hourglass" icon (ISC, see THIRD_PARTY_NOTICES.md) into the macOS menu bar
// icons: black on transparent, which macOS tints for light/dark menu bars (template images).
// Electron is used only as a headless SVG renderer.
//   npx electron scripts/make-tray-icon.cjs
const { app, BrowserWindow } = require('electron')
const fs = require('fs')
const path = require('path')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const { Hourglass } = require('lucide-react')

const TARGETS = [
    { size: 18, file: 'trayTemplate.png' },
    { size: 36, file: 'trayTemplate@2x.png' }
]
const outDir = path.join(__dirname, '..', 'resources')

async function render(size) {
    const win = new BrowserWindow({
        show: false,
        transparent: true,
        frame: false,
        useContentSize: true,
        width: size,
        height: size
    })
    const svg = renderToStaticMarkup(
        React.createElement(Hourglass, { size, color: '#000', strokeWidth: 2 })
    )
    const html = `<body style="margin:0;background:transparent;overflow:hidden">${svg}</body>`
    await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html))
    await new Promise((r) => setTimeout(r, 300))
    let img = await win.webContents.capturePage()
    // On a Retina display the capture is 2x; scale back so the file is exactly size x size.
    if (img.getSize().width !== size)
        img = img.resize({ width: size, height: size, quality: 'best' })
    win.destroy()
    return img.toPNG()
}

// Closing a render window must not quit the app before the next size is done.
app.on('window-all-closed', () => {})

app.whenReady().then(async () => {
    for (const { size, file } of TARGETS) {
        fs.writeFileSync(path.join(outDir, file), await render(size))
        console.log('wrote', file, `${size}x${size}`)
    }
    app.exit(0)
})
