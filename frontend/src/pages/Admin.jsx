import { useEffect, useMemo, useState } from 'react'
import { Link, navigate } from '../router'
import { COURIERS, ORDER_STATUSES, PRINT_SIZES, getFinish, getSize, inr } from '../data'
import { useApp } from '../store'
import { cropImage, downloadDataURL, loadImage, vault } from '../utils'
import { LineMedia, lineMeta, lineTitle } from './Cart'
import { Tracker } from './Account'
import { Brand } from '../components/Layout'
import * as Icon from '../components/Icons'

const fmt = (t) => new Date(t).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
const PRINT_INCHES = { '4x4': 4, '5x5': 5, '6x4': 6, '8x6': 8, A4: 11.7 } // long edge

async function getOriginal(line) {
  return (line.photoId && (await vault.get(line.photoId))) || line.thumb
}

async function downloadLine(order, line, i, mode) {
  const src = await getOriginal(line)
  const base = `${order.id}_${String(i + 1).padStart(2, '0')}_${line.size}_x${line.qty}`
  if (mode === 'original' || !line.crop) return downloadDataURL(src, `${base}_original.jpg`)
  const img = await loadImage(src)
  const r = getSize(line.size).ratio === 1 ? 1 : line.orient === 'portrait' ? 1 / getSize(line.size).ratio : getSize(line.size).ratio
  const longPx = Math.round(PRINT_INCHES[line.size] * 300)
  const outW = r >= 1 ? longPx : Math.round(longPx * r)
  downloadDataURL(cropImage(img, line.crop, r, outW, 0.95), `${base}_print-ready_300dpi.jpg`)
}

function OrderDrawer({ order, onClose }) {
  const { updateOrder, notify } = useApp()
  const [status, setStatus] = useState(order.status)
  const [courier, setCourier] = useState(order.courier || COURIERS[0])
  const [tracking, setTracking] = useState(order.tracking || '')
  const [busy, setBusy] = useState(false)

  useEffect(() => { setStatus(order.status); setCourier(order.courier || COURIERS[0]); setTracking(order.tracking || '') }, [order.id]) // eslint-disable-line

  const prints = order.items.filter((l) => l.type === 'print')
  const gifts = order.items.filter((l) => l.type === 'gift')
  const sheet = PRINT_SIZES.map((s) => ({ ...s, n: prints.filter((l) => l.size === s.id).reduce((a, l) => a + l.qty, 0) })).filter((s) => s.n)

  const downloadAll = async (mode) => {
    setBusy(true)
    for (let i = 0; i < prints.length; i++) {
      await downloadLine(order, prints[i], i, mode)
      await new Promise((r) => setTimeout(r, 350))
    }
    for (const g of gifts) for (const [j, ph] of (g.photos || []).entries()) {
      downloadDataURL((await vault.get(ph.id)) || ph.thumb, `${order.id}_gift_${g.productId}_${j + 1}.jpg`)
      await new Promise((r) => setTimeout(r, 350))
    }
    setBusy(false)
  }

  const save = () => {
    if ((status === 'Shipped' || status === 'Delivered') && !tracking.trim()) { notify('Add a tracking number before marking as shipped'); return }
    updateOrder(order.id, { status, courier: status === 'Shipped' || status === 'Delivered' || tracking ? courier : order.courier, tracking: tracking.trim() })
    notify(`Order #${order.id} updated · customer notified`)
  }

  return (
    <div className="drawer-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="drawer" role="dialog" aria-label={`Order ${order.id}`}>
        <div className="drawer__head">
          <div><h3>Order #{order.id}</h3><span className="muted small">{fmt(order.createdAt)} · {order.payment.method} · {order.payment.txn}</span></div>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon.X /></button>
        </div>

        <div className="drawer__body">
          <div className="drawer__cols">
            <div className="panel panel--tight">
              <span className="muted small">Customer</span>
              <strong>{order.customer.name}</strong>
              <span className="small">{order.customer.phone}</span>
              <span className="small">{order.customer.email}</span>
            </div>
            <div className="panel panel--tight">
              <span className="muted small">Ship to</span>
              <span className="small">{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ''}</span>
              <span className="small">{order.address.city}, {order.address.state} – <strong>{order.address.pincode}</strong></span>
              <button className="btn btn--ghost btn--xs" onClick={() => { navigator.clipboard?.writeText(`${order.customer.name}\n${order.customer.phone}\n${order.address.line1} ${order.address.line2}\n${order.address.city}, ${order.address.state} - ${order.address.pincode}`); notify('Address copied for courier label') }}>Copy label</button>
            </div>
          </div>

          {sheet.length > 0 && (
            <div className="print-sheet">
              <strong className="small">Print sheet</strong>
              {sheet.map((s) => <span key={s.id} className="pill">{s.label} × {s.n}</span>)}
            </div>
          )}

          <div className="drawer__section-head">
            <strong>Items ({order.items.length})</strong>
            {(prints.length > 0 || gifts.some((g) => g.photos?.length)) && (
              <div className="row-gap">
                <button className="btn btn--ghost btn--xs" disabled={busy} onClick={() => downloadAll('original')}><Icon.Download size={14} /> All originals</button>
                {prints.length > 0 && <button className="btn btn--primary btn--xs" disabled={busy} onClick={() => downloadAll('print')}><Icon.Printer size={14} /> All print-ready</button>}
              </div>
            )}
          </div>
          <div className="admin-items">
            {order.items.map((l, i) => (
              <div key={l.lineId} className="admin-item">
                <LineMedia line={l} />
                <div className="admin-item__info">
                  <strong className="small">{lineTitle(l)}</strong>
                  <span className="muted small">{lineMeta(l)}</span>
                  {l.type === 'print' && <span className="small">Qty <strong>{l.qty}</strong> · {getFinish(l.finish).label}</span>}
                  {l.type === 'gift' && <span className="small">Qty <strong>{l.qty}</strong></span>}
                  {l.type === 'gift' && l.photos?.length > 0 && (
                    <div className="mini-uploads mini-uploads--sm">{l.photos.map((ph) => <div className="mini-upload" key={ph.id}><img src={ph.thumb} alt="" /></div>)}</div>
                  )}
                </div>
                {l.type === 'print' && (
                  <div className="admin-item__dl">
                    <button className="btn btn--ghost btn--xs" onClick={() => downloadLine(order, l, prints.indexOf(l), 'original')} title="Download original upload"><Icon.Download size={14} /> Original</button>
                    <button className="btn btn--ghost btn--xs" onClick={() => downloadLine(order, l, prints.indexOf(l), 'print')} title="Cropped to size at 300 DPI"><Icon.Printer size={14} /> Print-ready</button>
                  </div>
                )}
                <strong className="small">{inr(l.unit * l.qty)}</strong>
              </div>
            ))}
          </div>
          <div className="drawer__totals small">
            <span>Subtotal {inr(order.subtotal)}</span><span>Shipping {order.shipping ? inr(order.shipping) : 'Free'}</span><strong>Total {inr(order.total)}</strong>
          </div>

          <div className="panel">
            <div className="panel__head"><strong>Fulfilment</strong><span className={`status status--${order.status.toLowerCase()}`}>{order.status}</span></div>
            <div className="status-steps">
              {ORDER_STATUSES.map((s) => (
                <button key={s} className={status === s ? 'is-on' : ''} onClick={() => setStatus(s)}>{s}</button>
              ))}
            </div>
            <div className="form-grid">
              <label className="field"><span>Courier</span>
                <select value={courier} onChange={(e) => setCourier(e.target.value)}>{COURIERS.map((c) => <option key={c}>{c}</option>)}</select>
              </label>
              <label className="field"><span>Tracking / AWB no.</span><input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="e.g. 14908812345" /></label>
            </div>
            <button className="btn btn--primary btn--block" onClick={save}><Icon.Check size={16} /> Save & notify customer</button>
          </div>
          <Tracker order={order} />
        </div>
      </aside>
    </div>
  )
}

export default function Admin() {
  const { user, orders, resetDemo, logout } = useApp()
  const [tab, setTab] = useState('All')
  const [q, setQ] = useState('')
  const [openId, setOpenId] = useState(null)

  useEffect(() => { if (!user || user.role !== 'admin') navigate('/login?next=/admin') }, [user])

  const list = useMemo(() => orders.filter((o) =>
    (tab === 'All' || o.status === tab) &&
    (!q || `${o.id} ${o.customer.name} ${o.customer.phone} ${o.address.city}`.toLowerCase().includes(q.toLowerCase()))
  ), [orders, tab, q])

  if (!user || user.role !== 'admin') return null

  const revenue = orders.reduce((s, o) => s + o.total, 0)
  const toPrint = orders.filter((o) => o.status === 'Paid' || o.status === 'Printing').length
  const printsCount = orders.reduce((s, o) => s + o.items.filter((l) => l.type === 'print').reduce((a, l) => a + l.qty, 0), 0)
  const inTransit = orders.filter((o) => o.status === 'Shipped').length
  const open = orders.find((o) => o.id === openId)

  return (
    <div className="admin">
      <aside className="admin__side">
        <Brand small />
        <nav>
          <a className="is-on"><Icon.Package size={18} /> Orders</a>
          <Link to="/shop"><Icon.Gift size={18} /> Products</Link>
          <Link to="/print"><Icon.Image size={18} /> Print flow</Link>
          <Link to="/"><Icon.Heart size={18} /> View store</Link>
        </nav>
        <div className="admin__side-foot">
          <button className="btn btn--ghost btn--xs" onClick={resetDemo}>Reset demo data</button>
          <button className="btn btn--ghost btn--xs" onClick={() => { logout(); navigate('/') }}><Icon.Logout size={14} /> Logout</button>
        </div>
      </aside>

      <main className="admin__main">
        <div className="admin__top">
          <div><h1 className="h2">Orders</h1><span className="muted small">Receive, print, pack and dispatch — all in one place</span></div>
          <label className="search search--admin"><Icon.Search size={16} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order, name, phone, city" /></label>
        </div>

        <div className="stats">
          <div className="stat"><span className="stat__icon"><Icon.Package /></span><div><span className="muted small">Total orders</span><strong>{orders.length}</strong></div></div>
          <div className="stat"><span className="stat__icon"><Icon.Rupee /></span><div><span className="muted small">Revenue</span><strong>{inr(revenue)}</strong></div></div>
          <div className="stat stat--hot"><span className="stat__icon"><Icon.Printer /></span><div><span className="muted small">To print & pack</span><strong>{toPrint}</strong></div></div>
          <div className="stat"><span className="stat__icon"><Icon.Truck /></span><div><span className="muted small">In transit · prints sold</span><strong>{inTransit} · {printsCount}</strong></div></div>
        </div>

        <div className="tabs">
          {['All', ...ORDER_STATUSES].map((t) => (
            <button key={t} className={tab === t ? 'is-on' : ''} onClick={() => setTab(t)}>
              {t}<span>{t === 'All' ? orders.length : orders.filter((o) => o.status === t).length}</span>
            </button>
          ))}
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Tracking</th><th></th></tr></thead>
            <tbody>
              {list.map((o) => {
                const pc = o.items.filter((l) => l.type === 'print').reduce((a, l) => a + l.qty, 0)
                const gc = o.items.filter((l) => l.type === 'gift').length
                return (
                  <tr key={o.id} onClick={() => setOpenId(o.id)}>
                    <td><strong>#{o.id}</strong><span className="muted small block">{fmt(o.createdAt)}</span></td>
                    <td>{o.customer.name}<span className="muted small block">{o.address.city} · {o.address.pincode}</span></td>
                    <td>
                      <div className="thumb-stack">{o.items.slice(0, 3).map((l) => <LineMedia key={l.lineId} line={l} />)}</div>
                      <span className="muted small block">{pc ? `${pc} prints` : ''}{pc && gc ? ' + ' : ''}{gc ? `${gc} gift${gc > 1 ? 's' : ''}` : ''}</span>
                    </td>
                    <td><strong>{inr(o.total)}</strong></td>
                    <td><span className="status status--paid-pay">{o.payment.status}</span><span className="muted small block">{o.payment.method}</span></td>
                    <td><span className={`status status--${o.status.toLowerCase()}`}>{o.status}</span></td>
                    <td className="small">{o.tracking ? <>{o.courier}<span className="muted block">{o.tracking}</span></> : <span className="muted">—</span>}</td>
                    <td><button className="btn btn--ghost btn--xs">Open</button></td>
                  </tr>
                )
              })}
              {!list.length && <tr><td colSpan="8" className="center muted">No orders here.</td></tr>}
            </tbody>
          </table>
        </div>
      </main>

      {open && <OrderDrawer order={open} onClose={() => setOpenId(null)} />}
    </div>
  )
}
