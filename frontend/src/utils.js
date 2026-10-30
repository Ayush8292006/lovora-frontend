// ---------- Image helpers ----------
export const uid = (p = '') => p + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4)

export const readFile = (file) =>
  new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(r.result)
    r.onerror = rej
    r.readAsDataURL(file)
  })

export const loadImage = (src) =>
  new Promise((res, rej) => {
    const img = new Image()
    img.onload = () => res(img)
    img.onerror = rej
    img.src = src
  })

// Downscale for on-screen editing (keeps the page fast with big phone photos)
export function scaleImage(img, max = 1400, quality = 0.88) {
  const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight))
  const c = document.createElement('canvas')
  c.width = Math.round(img.naturalWidth * s)
  c.height = Math.round(img.naturalHeight * s)
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
  return c.toDataURL('image/jpeg', quality)
}

// crop = { cx, cy, cw, ch } normalised 0..1 of the image
export function cropImage(img, crop, ratio, outW = 420, quality = 0.85) {
  const W = img.naturalWidth, H = img.naturalHeight
  const c = document.createElement('canvas')
  c.width = outW
  c.height = Math.round(outW / ratio)
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, c.width, c.height)
  ctx.drawImage(img, crop.cx * W, crop.cy * H, crop.cw * W, crop.ch * H, 0, 0, c.width, c.height)
  return c.toDataURL('image/jpeg', quality)
}

// Centered "cover" crop for a given aspect ratio
export function defaultCrop(imgW, imgH, ratio) {
  const imgR = imgW / imgH
  if (imgR > ratio) {
    const cw = ratio / imgR
    return { cx: (1 - cw) / 2, cy: 0, cw, ch: 1 }
  }
  const ch = imgR / ratio
  return { cx: 0, cy: (1 - ch) / 2, cw: 1, ch }
}

export function downloadDataURL(dataURL, filename) {
  const a = document.createElement('a')
  a.href = dataURL
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}

// ---------- Safe localStorage ----------
export const store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem(key)
      return v ? JSON.parse(v) : fallback
    } catch {
      return fallback
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* quota or private mode — prototype keeps working in memory */
    }
  },
}

// ---------- Original photo vault (IndexedDB, falls back to memory) ----------
const mem = new Map()
let dbp
const db = () => {
  if (!dbp) {
    dbp = new Promise((res) => {
      try {
        const r = indexedDB.open('lovora-photos', 1)
        r.onupgradeneeded = () => r.result.createObjectStore('photos')
        r.onsuccess = () => res(r.result)
        r.onerror = () => res(null)
      } catch {
        res(null)
      }
    })
  }
  return dbp
}

export const vault = {
  async put(id, dataURL) {
    mem.set(id, dataURL)
    const d = await db()
    if (!d) return
    try {
      d.transaction('photos', 'readwrite').objectStore('photos').put(dataURL, id)
    } catch { /* ignore */ }
  },
  async get(id) {
    if (mem.has(id)) return mem.get(id)
    const d = await db()
    if (!d) return null
    return new Promise((res) => {
      try {
        const r = d.transaction('photos').objectStore('photos').get(id)
        r.onsuccess = () => res(r.result || null)
        r.onerror = () => res(null)
      } catch {
        res(null)
      }
    })
  },
}

// ---------- Demo photo generator (for seeded admin orders) ----------
export function demoPhoto(seed, w = 360, h = 360) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const x = c.getContext('2d')
  const hue = 330 + ((seed * 37) % 50)
  const g = x.createLinearGradient(0, 0, w, h)
  g.addColorStop(0, `hsl(${hue} 70% 85%)`)
  g.addColorStop(1, `hsl(${(hue + 30) % 360} 60% 70%)`)
  x.fillStyle = g
  x.fillRect(0, 0, w, h)
  x.fillStyle = 'rgba(255,255,255,.55)'
  x.beginPath(); x.arc(w * 0.82, h * 0.2, w * 0.12, 0, 7); x.fill()
  x.fillStyle = 'rgba(43,35,38,.55)'
  const head = (cx) => { x.beginPath(); x.arc(cx, h * 0.48, w * 0.09, 0, 7); x.fill(); x.beginPath(); x.ellipse(cx, h * 0.9, w * 0.17, h * 0.27, 0, 0, 7); x.fill() }
  head(w * 0.4); head(w * 0.6)
  return c.toDataURL('image/jpeg', 0.8)
}
