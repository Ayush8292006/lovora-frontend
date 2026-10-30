import { useEffect, useMemo, useRef, useState } from 'react'
import * as Icon from './Icons'

/**
 * Pan + zoom cropper.
 * props: src, imgW, imgH, ratio (w/h), initial crop {cx,cy,cw,ch}, onSave(crop), onClose, title
 */
export default function CropModal({ src, imgW, imgH, ratio, initial, onSave, onClose, title, orient, onOrient, canRotate }) {
  // frame size that fits the viewport
  const frame = useMemo(() => {
    const maxW = Math.min(520, window.innerWidth - 48)
    const maxH = Math.min(420, window.innerHeight - 280)
    let w = maxW, h = w / ratio
    if (h > maxH) { h = maxH; w = h * ratio }
    return { w: Math.round(w), h: Math.round(h) }
  }, [ratio])

  const base = Math.max(frame.w / imgW, frame.h / imgH) // "cover" scale at zoom 1

  const fromCrop = (c) => {
    const dw = frame.w / c.cw
    const zoom = Math.max(1, dw / (imgW * base))
    return { zoom, ox: -c.cx * dw, oy: -c.cy * (imgH * base * zoom) }
  }

  const [state, setState] = useState(() => fromCrop(initial))
  useEffect(() => setState(fromCrop(initial)), [ratio]) // eslint-disable-line react-hooks/exhaustive-deps

  const dw = imgW * base * state.zoom
  const dh = imgH * base * state.zoom
  const clamp = (ox, oy, w = dw, h = dh) => ({
    ox: Math.min(0, Math.max(frame.w - w, ox)),
    oy: Math.min(0, Math.max(frame.h - h, oy)),
  })

  const drag = useRef(null)
  const onDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, y: e.clientY, ox: state.ox, oy: state.oy }
  }
  const onMove = (e) => {
    if (!drag.current) return
    const d = drag.current
    setState((s) => ({ ...s, ...clamp(d.ox + e.clientX - d.x, d.oy + e.clientY - d.y) }))
  }
  const onUp = () => { drag.current = null }

  const setZoom = (z) => {
    setState((s) => {
      const nw = imgW * base * z, nh = imgH * base * z
      // zoom around frame centre
      const cx = (frame.w / 2 - s.ox) / (imgW * base * s.zoom)
      const cy = (frame.h / 2 - s.oy) / (imgH * base * s.zoom)
      return { zoom: z, ...clamp(frame.w / 2 - cx * nw, frame.h / 2 - cy * nh, nw, nh) }
    })
  }

  const onWheel = (e) => setZoom(Math.min(4, Math.max(1, state.zoom - e.deltaY * 0.0015)))

  const save = () => onSave({ cx: -state.ox / dw, cy: -state.oy / dh, cw: frame.w / dw, ch: frame.h / dh })

  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal crop-modal" role="dialog" aria-label="Crop photo">
        <div className="modal__head">
          <div>
            <h3>Crop & position</h3>
            <p className="muted small">{title} — drag to move, scroll or use the slider to zoom</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon.X /></button>
        </div>

        <div className="crop-stage">
          <div
            className="crop-frame"
            style={{ width: frame.w, height: frame.h }}
            onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
            onWheel={onWheel}
          >
            <img src={src} alt="" draggable="false"
              style={{ width: dw, height: dh, transform: `translate(${state.ox}px, ${state.oy}px)` }} />
            <div className="crop-grid" />
          </div>
        </div>

        <div className="crop-controls">
          <Icon.Minus size={16} />
          <input type="range" min="1" max="4" step="0.01" value={state.zoom} onChange={(e) => setZoom(+e.target.value)} aria-label="Zoom" />
          <Icon.Plus size={16} />
          {canRotate && (
            <div className="seg">
              <button className={orient === 'landscape' ? 'is-on' : ''} onClick={() => onOrient('landscape')}>Landscape</button>
              <button className={orient === 'portrait' ? 'is-on' : ''} onClick={() => onOrient('portrait')}>Portrait</button>
            </div>
          )}
        </div>

        <div className="modal__foot">
          <button className="btn btn--ghost" onClick={() => setState({ zoom: 1, ox: (frame.w - imgW * base) / 2, oy: (frame.h - imgH * base) / 2 })}>Reset</button>
          <button className="btn btn--primary" onClick={save}><Icon.Check size={18} /> Save crop</button>
        </div>
      </div>
    </div>
  )
}
