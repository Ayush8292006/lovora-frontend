import { useRef, useState } from 'react'
import { Link, navigate } from '../router'
import { FINISHES, FREE_SHIPPING_ABOVE, PRINT_SIZES, getFinish, getSize, inr, printUnitPrice } from '../data'
import { useApp } from '../store'
import { cropImage, defaultCrop, loadImage, readFile, scaleImage, uid, vault } from '../utils'
import CropModal from '../components/CropModal'
import * as Icon from '../components/Icons'

const imgCache = new Map() // id -> HTMLImageElement (edit-resolution)

const ratioOf = (sizeId, orient) => {
  const r = getSize(sizeId).ratio
  return r === 1 ? 1 : orient === 'portrait' ? 1 / r : r
}
// inches for DPI check
const INCHES = { '4x4': [4, 4], '5x5': [5, 5], '6x4': [6, 4], '8x6': [8, 6], A4: [11.7, 8.3] }

export default function PrintPhotos() {
  const { addToCart, notify } = useApp()
  const [photos, setPhotos] = useState([])
  const [busy, setBusy] = useState(false)
  const [drag, setDrag] = useState(false)
  const [editing, setEditing] = useState(null)
  const [bulkSize, setBulkSize] = useState('4x4')
  const [bulkFinish, setBulkFinish] = useState('glossy')
  const input = useRef()

  const makeThumb = (ph) => cropImage(imgCache.get(ph.id), ph.crop, ratioOf(ph.size, ph.orient), 420)

  const onFiles = async (files) => {
    const list = [...files].filter((f) => f.type.startsWith('image/'))
    if (!list.length) return
    setBusy(true)
    const added = []
    for (const f of list) {
      try {
        const original = await readFile(f)
        const full = await loadImage(original)
        const src = scaleImage(full, 1400)
        const img = await loadImage(src)
        const id = uid('ph')
        imgCache.set(id, img)
        vault.put(id, original) // keep the untouched original for printing
        const orient = full.naturalHeight > full.naturalWidth ? 'portrait' : 'landscape'
        const ph = { id, name: f.name, src, w: img.naturalWidth, h: img.naturalHeight, ow: full.naturalWidth, oh: full.naturalHeight, size: bulkSize, finish: bulkFinish, orient, qty: 1 }
        ph.crop = defaultCrop(ph.w, ph.h, ratioOf(ph.size, orient))
        ph.thumb = makeThumb(ph)
        added.push(ph)
      } catch { /* skip unreadable file */ }
    }
    setPhotos((p) => [...p, ...added])
    setBusy(false)
    notify(`${added.length} photo${added.length > 1 ? 's' : ''} added`)
  }

  const update = (id, patch, recrop = false) =>
    setPhotos((ps) => ps.map((p) => {
      if (p.id !== id) return p
      const n = { ...p, ...patch }
      if (recrop) n.crop = defaultCrop(n.w, n.h, ratioOf(n.size, n.orient))
      if (recrop || patch.crop) n.thumb = makeThumb(n)
      return n
    }))

  const applyAll = () => {
    setPhotos((ps) => ps.map((p) => {
      const n = { ...p, size: bulkSize, finish: bulkFinish }
      n.crop = defaultCrop(n.w, n.h, ratioOf(n.size, n.orient))
      n.thumb = makeThumb(n)
      return n
    }))
    notify(`Applied ${getSize(bulkSize).label} · ${getFinish(bulkFinish).label} to all photos`)
  }

  const count = photos.reduce((s, p) => s + p.qty, 0)
  const subtotal = photos.reduce((s, p) => s + printUnitPrice(p.size, p.finish) * p.qty, 0)
  const bySize = PRINT_SIZES.map((s) => ({ ...s, n: photos.filter((p) => p.size === s.id).reduce((a, p) => a + p.qty, 0) })).filter((s) => s.n)

  const addAll = () => {
    addToCart(photos.map((p) => ({
      type: 'print', photoId: p.id, name: p.name, thumb: p.thumb,
      size: p.size, finish: p.finish, orient: p.orient, qty: p.qty,
      unit: printUnitPrice(p.size, p.finish), crop: p.crop,
    })))
    notify(`${count} prints added to cart`)
    setPhotos([])
    navigate('/cart')
  }

  const editPh = photos.find((p) => p.id === editing)

  return (
    <div className="container section print-page">
      <div className="crumbs"><Link to="/">Home</Link> / <span>Print Your Photos</span></div>
      <div className="print-page__head">
        <div>
          <span className="eyebrow">Photo prints</span>
          <h1 className="h2">Upload, crop & print your memories</h1>
          <p className="muted">Premium photo paper · 4×4, 5×5, 6×4, 8×6 & A4 · Glossy, matte or polaroid border</p>
        </div>
      </div>

      <div className="print-layout">
        <div>
          {/* DROPZONE */}
          <div
            className={`dropzone ${drag ? 'is-drag' : ''} ${photos.length ? 'dropzone--compact' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); onFiles(e.dataTransfer.files) }}
            onClick={() => input.current.click()}
            role="button" tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && input.current.click()}
          >
            <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => { onFiles(e.target.files); e.target.value = '' }} />
            <span className="dropzone__icon">{busy ? <span className="spinner" /> : <Icon.Upload size={28} />}</span>
            <div>
              <strong>{busy ? 'Preparing your photos…' : photos.length ? 'Add more photos' : 'Drop your photos here or tap to upload'}</strong>
              <span className="muted small">JPG, PNG or HEIC-converted · upload as many as you like · originals are kept for printing</span>
            </div>
            {!photos.length && <span className="btn btn--primary">Choose photos</span>}
          </div>

          {photos.length > 0 && (
            <>
              <div className="bulk-bar">
                <span className="small"><strong>{photos.length}</strong> photo{photos.length > 1 ? 's' : ''}</span>
                <div className="bulk-bar__controls">
                  <span className="muted small">Set all to</span>
                  <select value={bulkSize} onChange={(e) => setBulkSize(e.target.value)} aria-label="Size for all">
                    {PRINT_SIZES.map((s) => <option key={s.id} value={s.id}>{s.label} · {inr(s.price)}</option>)}
                  </select>
                  <select value={bulkFinish} onChange={(e) => setBulkFinish(e.target.value)} aria-label="Finish for all">
                    {FINISHES.map((f) => <option key={f.id} value={f.id}>{f.label}{f.extra ? ` +${inr(f.extra)}` : ''}</option>)}
                  </select>
                  <button className="btn btn--ghost btn--sm" onClick={applyAll}>Apply</button>
                </div>
              </div>

              <div className="photo-grid">
                {photos.map((p) => {
                  const size = getSize(p.size)
                  const [iw, ih] = INCHES[p.size]
                  const needed = Math.max(iw, ih) * 150
                  const have = Math.max(p.ow * p.crop.cw, p.oh * p.crop.ch)
                  const lowRes = have < needed
                  return (
                    <div key={p.id} className="photo-card">
                      <div className="photo-card__preview">
                        <div className={`print-preview ${p.finish === 'polaroid' ? 'is-polaroid' : ''} ${p.finish === 'matte' ? 'is-matte' : ''}`} style={{ aspectRatio: ratioOf(p.size, p.orient) }}>
                          <img src={p.thumb} alt={p.name} />
                        </div>
                        <button className="photo-card__crop" onClick={() => setEditing(p.id)}><Icon.Crop size={15} /> Crop</button>
                        <button className="photo-card__remove" onClick={() => setPhotos((x) => x.filter((y) => y.id !== p.id))} aria-label="Remove photo"><Icon.Trash size={15} /></button>
                      </div>
                      <div className="photo-card__body">
                        <div className="photo-card__name" title={p.name}>{p.name}</div>
                        {lowRes && <div className="warn small">⚠ Low resolution for {size.label} — may look soft</div>}
                        <div className="size-pills">
                          {PRINT_SIZES.map((s) => (
                            <button key={s.id} className={p.size === s.id ? 'is-on' : ''} onClick={() => update(p.id, { size: s.id }, true)}>{s.id}</button>
                          ))}
                        </div>
                        <div className="photo-card__row">
                          <select value={p.finish} onChange={(e) => update(p.id, { finish: e.target.value })} aria-label="Finish">
                            {FINISHES.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                          </select>
                          {size.ratio !== 1 && (
                            <button className="btn btn--ghost btn--xs" onClick={() => update(p.id, { orient: p.orient === 'portrait' ? 'landscape' : 'portrait' }, true)} title="Rotate frame">
                              ⟲ {p.orient === 'portrait' ? 'Portrait' : 'Landscape'}
                            </button>
                          )}
                        </div>
                        <div className="photo-card__row">
                          <div className="qty qty--sm">
                            <button onClick={() => update(p.id, { qty: Math.max(1, p.qty - 1) })} aria-label="Decrease"><Icon.Minus size={14} /></button>
                            <span>{p.qty}</span>
                            <button onClick={() => update(p.id, { qty: Math.min(99, p.qty + 1) })} aria-label="Increase"><Icon.Plus size={14} /></button>
                          </div>
                          <strong>{inr(printUnitPrice(p.size, p.finish) * p.qty)}</strong>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {!photos.length && (
            <div className="size-guide">
              <h3>Size & price guide</h3>
              <div className="size-guide__row">
                {PRINT_SIZES.map((s) => (
                  <div key={s.id} className="size-guide__item">
                    <div className="size-guide__shape" style={{ width: Math.min(110, 18 * (INCHES[s.id][0])), aspectRatio: s.ratio }}><span>{s.label}</span></div>
                    <strong>{inr(s.price)}</strong>
                    <span className="muted small">{s.format}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SUMMARY */}
        <aside className="summary sticky">
          <h3>Order summary</h3>
          {bySize.length ? (
            <ul className="summary__lines">
              {bySize.map((s) => <li key={s.id}><span>{s.label} × {s.n}</span><span>{inr(photos.filter((p) => p.size === s.id).reduce((a, p) => a + printUnitPrice(p.size, p.finish) * p.qty, 0))}</span></li>)}
            </ul>
          ) : <p className="muted small">Upload photos to see your price.</p>}
          <div className="summary__total"><span>Subtotal ({count} print{count === 1 ? '' : 's'})</span><strong>{inr(subtotal)}</strong></div>
          {subtotal > 0 && subtotal < FREE_SHIPPING_ABOVE && <p className="hint small">Add {inr(FREE_SHIPPING_ABOVE - subtotal)} more for <strong>free delivery</strong> ♡</p>}
          {subtotal >= FREE_SHIPPING_ABOVE && <p className="ok small">✓ You've unlocked free delivery</p>}
          <button className="btn btn--primary btn--block btn--lg" disabled={!photos.length} onClick={addAll}><Icon.Cart size={18} /> Add {count || ''} prints to cart</button>
          <ul className="summary__perks small muted">
            <li><Icon.Printer size={14} /> Printed on premium photo paper</li>
            <li><Icon.Package size={14} /> Packed flat & secure</li>
            <li><Icon.Truck size={14} /> Tracking shared by email/SMS</li>
          </ul>
        </aside>
      </div>

      {editPh && (
        <CropModal
          src={editPh.src} imgW={editPh.w} imgH={editPh.h}
          ratio={ratioOf(editPh.size, editPh.orient)}
          initial={editPh.crop}
          title={`${getSize(editPh.size).label} ${getSize(editPh.size).format}`}
          canRotate={getSize(editPh.size).ratio !== 1}
          orient={editPh.orient}
          onOrient={(o) => update(editPh.id, { orient: o }, true)}
          onClose={() => setEditing(null)}
          onSave={(crop) => { update(editPh.id, { crop }); setEditing(null) }}
        />
      )}
    </div>
  )
}
