import { useMemo, useState } from 'react'
import { Link, navigate } from '../router'
import { CATEGORIES, OCCASIONS, PRODUCTS, getCategory } from '../data'
import ProductCard from '../components/ProductCard'
import * as Icon from '../components/Icons'

export default function Shop({ cat, query }) {
  const [sort, setSort] = useState('popular')
  const q = (query.q || '').toLowerCase()
  const occasion = query.occasion

  const list = useMemo(() => {
    let l = PRODUCTS.filter((p) => (!cat || p.cat === cat) && (!occasion || p.occasion?.includes(occasion)) && (!q || p.name.toLowerCase().includes(q) || getCategory(p.cat).name.toLowerCase().includes(q)))
    if (sort === 'low') l = [...l].sort((a, b) => a.price - b.price)
    if (sort === 'high') l = [...l].sort((a, b) => b.price - a.price)
    if (sort === 'popular') l = [...l].sort((a, b) => b.reviews - a.reviews)
    return l
  }, [cat, occasion, q, sort])

  const title = cat ? getCategory(cat)?.name : occasion ? `${OCCASIONS.find((o) => o.id === occasion)?.name} Gifts` : q ? `Results for “${query.q}”` : 'All Gifts'

  return (
    <div className="container section shop">
      <div className="crumbs"><Link to="/">Home</Link> / <span>{title}</span></div>
      <div className="shop__layout">
        <aside className="filters">
          <h4>Categories</h4>
          <Link to="/shop" className={!cat ? 'is-on' : ''}>All gifts</Link>
          {CATEGORIES.map((c) => <Link key={c.id} to={`/shop/${c.id}`} className={cat === c.id ? 'is-on' : ''}>{c.name}</Link>)}
          <h4>Occasion</h4>
          {OCCASIONS.map((o) => (
            <button key={o.id} className={occasion === o.id ? 'is-on' : ''} onClick={() => navigate(`${cat ? `/shop/${cat}` : '/shop'}${occasion === o.id ? '' : `?occasion=${o.id}`}`)}>{o.name}</button>
          ))}
          <div className="filters__promo">
            <strong>Print your own photos</strong>
            <span className="small">Polaroid, square & A4 prints from ₹25</span>
            <Link to="/print" className="btn btn--primary btn--sm"><Icon.Upload size={14} /> Upload</Link>
          </div>
        </aside>

        <div>
          <div className="shop__bar">
            <div><h1 className="h2">{title}</h1><span className="muted small">{list.length} products</span></div>
            <label className="select-wrap">
              <span className="muted small">Sort</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="popular">Popularity</option>
                <option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option>
              </select>
            </label>
          </div>
          {cat === 'photo-prints' && (
            <Link to="/print" className="print-cta-banner">
              <span>📸</span>
              <div><strong>Want individual prints?</strong><span>Upload photos, crop and choose 4×4, 5×5, 6×4, 8×6 or A4.</span></div>
              <Icon.ArrowRight />
            </Link>
          )}
          {list.length ? (
            <div className="product-grid product-grid--3">{list.map((p) => <ProductCard key={p.id} p={p} />)}</div>
          ) : (
            <div className="empty"><p>No gifts match that yet.</p><Link to="/shop" className="btn btn--ghost">See all gifts</Link></div>
          )}
        </div>
      </div>
    </div>
  )
}
