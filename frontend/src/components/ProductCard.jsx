import { Link } from '../router'
import { getCategory, inr } from '../data'
import ProductArt from './ProductArt'
import * as Icon from './Icons'

export default function ProductCard({ p }) {
  const off = Math.round((1 - p.price / p.mrp) * 100)
  return (
    <Link to={`/product/${p.id}`} className="product-card">
      <div className="product-card__media">
        <ProductArt art={p.art} tint={getCategory(p.cat)?.tint} />
        {p.tag && <span className="chip chip--tag">{p.tag}</span>}
        {p.personalise && <span className="chip chip--personal">Personalise</span>}
      </div>
      <div className="product-card__body">
        <h3>{p.name}</h3>
        <div className="price-row">
          <strong>{inr(p.price)}</strong>
          <s className="muted">{inr(p.mrp)}</s>
          <span className="off">{off}% off</span>
        </div>
        <div className="rating"><Icon.Star size={13} fill="currentColor" /> {p.rating} <span className="muted">({p.reviews.toLocaleString('en-IN')})</span></div>
        <div className="delivery muted small"><Icon.Truck size={14} /> Delivery in 2–4 days</div>
      </div>
    </Link>
  )
}
