// Generates monochrome macOS tray template icons (ring + clock hands) with no deps.
import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'

function crc32(buf) {
  let c, crc = ~0
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    crc = (crc >>> 8) ^ c
  }
  return ~crc >>> 0
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
  const td = Buffer.concat([Buffer.from(type), data])
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td))
  return Buffer.concat([len, td, crc])
}
function png(size) {
  const px = new Uint8Array(size * size * 4)
  const c = (size - 1) / 2, r = size * 0.4, w = size * 0.09
  const dist = (x, y, x1, y1, x2, y2) => {
    const dx = x2 - x1, dy = y2 - y1
    const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)))
    return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy))
  }
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const d = Math.abs(Math.hypot(x - c, y - c) - r)
    const h1 = dist(x, y, c, c, c, c - r * 0.6)
    const h2 = dist(x, y, c, c, c + r * 0.45, c)
    const a = Math.max(0, Math.min(1, w - Math.min(d, h1, h2) + 0.5))
    const i = (y * size + x) * 4
    px[i] = px[i + 1] = px[i + 2] = 0
    px[i + 3] = Math.round(a * 255)
  }
  const raw = Buffer.alloc((size * 4 + 1) * size)
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0
    Buffer.from(px.buffer, y * size * 4, size * 4).copy(raw, y * (size * 4 + 1) + 1)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8; ihdr[9] = 6
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))
  ])
}
writeFileSync('resources/trayTemplate.png', png(16))
writeFileSync('resources/trayTemplate@2x.png', png(32))
console.log('wrote tray icons')
