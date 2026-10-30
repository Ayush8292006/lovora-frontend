import { Link, navigate } from '../router'
import { FREE_SHIPPING_ABOVE, getCategory, getFinish, getProduct, getSize, inr } from '../data'
import { useApp } from '../store'
import ProductArt from '../components/ProductArt'
import * as Icon from '../components/Icons'

export function LineMedia({ line }) {
  if (line.type === 'print') {
    return <div className={`line-thumb ${line.finish === 'polaroid' ? 'is-polaroid' : ''}`}><img src={line.thumb} alt="" /></div>
  }
  const p = getProduct(line.productId)
  return (
    <div className="line-thumb">
      {line.photos?.[0] ? <img src={line.photos[0].thumb} alt="" /> : <ProductArt art={p?.art} tint={getCategory(p?.cat)?.tint} />}
    </div>
  )
}

export function lineTitle(line) {
  if (line.type === 'print') return `${getSize(line.size).label} Photo Print`
  return getProduct(line.productId)?.name || 'Gift'
}
export function lineMeta(line) {
  if (line.type === 'print') {
    const s = getSize(line.size)
    const shape = s.ratio === 1 ? s.format : line.orient === 'portrait' ? 'Portrait' : 'Landscape'
    return `${shape} · ${getFinish(line.finish).label} · ${line.name}`
  }
  const bits = []
  if (line.photos?.length) bits.push(`${line.photos.length} photo${line.photos.length > 1 ? 's' : ''} uploaded`)
  if (line.message) bits.push(`Card: “${line.message}”`)
  return bits.join(' · ')
}

export default function Cart() {
  const { cart, updateQty, removeLine, totals, user } = useApp()

  if (!cart.length) {
    return (
      <div className="container section empty empty--big">
        <div className="empty__art">🛒</div>
        <h1 className="h2">Your cart is empty</h1>
        <p className="muted">Let's fill it with memories.</p>
        <div className="row-gap">
          <Link to="/print" className="btn btn--primary"><Icon.Upload size={16} /> Print photos</Link>
          <Link to="/shop" className="btn btn--ghost">Browse gifts</Link>
        </div>
      </div>
    )
  }

  const checkout = () => navigate(user ? '/checkout' : '/login?next=/checkout')

  return (
    <div className="container section">
      <h1 className="h2">Your cart <span className="muted">({totals.count} item{totals.count > 1 ? 's' : ''})</span></h1>
      <div className="cart-layout">
        <div className="cart-lines">
          {cart.map((l) => (
            <div key={l.lineId} className="cart-line">
              <LineMedia line={l} />
              <div className="cart-line__info">
                <strong>{lineTitle(l)}</strong>
                <span className="muted small">{lineMeta(l)}</span>
                <span className="small">{inr(l.unit)} each</span>
              </div>
              <div className="qty qty--sm">
                <button onClick={() => updateQty(l.lineId, l.qty - 1)} aria-label="Decrease"><Icon.Minus size={14} /></button>
                <span>{l.qty}</span>
                <button onClick={() => updateQty(l.lineId, l.qty + 1)} aria-label="Increase"><Icon.Plus size={14} /></button>
              </div>
              <strong className="cart-line__price">{inr(l.unit * l.qty)}</strong>
              <button className="icon-btn" onClick={() => removeLine(l.lineId)} aria-label="Remove"><Icon.Trash size={18} /></button>
            </div>
          ))}
          <Link to="/print" className="add-more"><Icon.Plus size={16} /> Add more photo prints</Link>
        </div>

        <aside className="summary sticky">
          <h3>Price details</h3>
          <ul className="summary__lines">
            <li><span>Subtotal</span><span>{inr(totals.subtotal)}</span></li>
            <li><span>Shipping</span><span>{totals.shipping ? inr(totals.shipping) : <span className="ok">FREE</span>}</span></li>
          </ul>
          <div className="summary__total"><span>Total</span><strong>{inr(totals.total)}</strong></div>
          {totals.shipping > 0 && <p className="hint small">Add {inr(FREE_SHIPPING_ABOVE - totals.subtotal)} more for free delivery</p>}
          <button className="btn btn--primary btn--block btn--lg" onClick={checkout}>Proceed to checkout <Icon.ArrowRight size={18} /></button>
          <p className="muted small center"><Icon.Lock size={13} /> Safe & secure payments</p>
        </aside>
      </div>
    </div>
  )
}
