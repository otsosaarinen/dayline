import { BrowserWindow, Tray, nativeImage, screen } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import trayIcon from '../../resources/trayTemplate.png?asset'
import trayIcon2x from '../../resources/trayTemplate@2x.png?asset'

const WIDTH = 360
const HEIGHT = 480

/** Owns the menu bar icon and the popover window that hangs off it. */
export class TrayController {
  private tray: Tray
  private win: BrowserWindow

  constructor() {
    const image = nativeImage.createFromPath(trayIcon)
    image.addRepresentation({ scaleFactor: 2, buffer: nativeImage.createFromPath(trayIcon2x).toPNG() })
    image.setTemplateImage(true)
    this.tray = new Tray(image)
    this.tray.setToolTip('Countdown')
    this.tray.on('click', () => this.toggle())

    this.win = this.createWindow()
  }

  private createWindow(): BrowserWindow {
    const win = new BrowserWindow({
      width: WIDTH,
      height: HEIGHT,
      show: false,
      frame: false,
      resizable: false,
      movable: false,
      minimizable: false,
      maximizable: false,
      fullscreenable: false,
      skipTaskbar: true,
      alwaysOnTop: true,
      transparent: true,
      hasShadow: true,
      vibrancy: 'popover',
      visualEffectState: 'active',
      roundedCorners: true,
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false,
        contextIsolation: true,
        nodeIntegration: false
      }
    })
    win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
    win.on('blur', () => {
      if (!win.webContents.isDevToolsOpened()) win.hide()
    })
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      win.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      win.loadFile(join(__dirname, '../renderer/index.html'))
    }
    return win
  }

  get window(): BrowserWindow {
    return this.win
  }

  toggle(): void {
    if (this.win.isVisible()) this.hide()
    else this.show()
  }

  hide(): void {
    this.win.hide()
  }

  show(): void {
    const trayBounds = this.tray.getBounds()
    const display = screen.getDisplayMatching(trayBounds)
    const { x: dx, width: dw } = display.workArea
    let x = Math.round(trayBounds.x + trayBounds.width / 2 - WIDTH / 2)
    x = Math.max(dx + 8, Math.min(x, dx + dw - WIDTH - 8))
    const y = Math.round(trayBounds.y + trayBounds.height + 4)
    this.win.setPosition(x, y, false)
    this.win.show()
    this.win.focus()
  }

  /** Text shown next to the icon in the menu bar (e.g. "2d"). Empty string clears it. */
  setTitle(title: string): void {
    this.tray.setTitle(title)
  }
}
