import { useState } from 'react'
import { Link, navigate } from '../router'
import { PRODUCTS, getCategory, getProduct, inr } from '../data'
import { useApp } from '../store'
import { loadImage, readFile, scaleImage, uid, vault } from '../utils'
import ProductArt from '../components/ProductArt'
import ProductCard from '../components/ProductCard'
import * as Icon from '../components/Icons'

export default function Product({ id }) {
  const p = getProduct(id)
  const { addToCart, notify } = useApp()
  const [qty, setQty] = useState(1)
  const [photos, setPhotos] = useState([])
  const [message, setMessage] = useState('')
  const [pin, setPin] = useState('')
  const [pinMsg, setPinMsg] = useState('')
  const [err, setErr] = useState('')

  if (!p) return <div className="container section empty"><p>Product not found.</p><Link to="/shop" className="btn btn--ghost">Back to shop</Link></div>

  const maxPhotos = p.personalise === 'multi' ? 12 : 1
  const cat = getCategory(p.cat)
  const off = Math.round((1 - p.price / p.mrp) * 100)

  const onFiles = async (files) => {
    const arr = [...files].filter((f) => f.type.startsWith('image/')).slice(0, maxPhotos - photos.length)
    const out = []
    for (const f of arr) {
      const original = await readFile(f)
      const img = await loadImage(original)
      const pid = uid('ph')
      vault.put(pid, original)
      out.push({ id: pid, name: f.name, thumb: scaleImage(img, 320, 0.8) })
    }
    setPhotos((x) => [...x, ...out])
    setErr('')
  }

  const add = (buy) => {
    if (p.personalise && photos.length === 0) { setErr('Please upload a photo to personalise this gift.'); return }
    addToCart({ type: 'gift', productId: p.id, qty, unit: p.price, photos: photos.map((x) => ({ id: x.id, name: x.name, thumb: x.thumb })), message })
    notify(`${p.name} added to cart`)
    if (buy) navigate('/cart')
  }

  const related = PRODUCTS.filter((x) => x.cat === p.cat && x.id !== p.id).concat(PRODUCTS.filter((x) => x.cat !== p.cat)).slice(0, 4)

  return (
    <div className="container section">
      <div className="crumbs"><Link to="/">Home</Link> / <Link to={`/shop/${p.cat}`}>{cat.name}</Link> / <span>{p.name}</span></div>
      <div className="pdp">
        <div className="pdp__media">
          <div className="pdp__main">
            {photos[0] ? <img src={photos[0].thumb} alt="Your photo preview" className="pdp__preview" /> : <ProductArt art={p.art} tint={cat.tint} />}
            {p.tag && <span className="chip chip--tag">{p.tag}</span>}
          </div>
          {photos[0] && <p className="muted small center">Preview shows your uploaded photo · final product mockup in production</p>}
        </div>

        <div className="pdp__info">
          <h1 className="h2">{p.name}</h1>
          <div className="rating"><Icon.Star size={14} fill="currentColor" /> {p.rating} <span className="muted">· {p.reviews.toLocaleString('en-IN')} reviews</span></div>
          <div className="price-row price-row--lg">
            <strong>{inr(p.price)}</strong><s className="muted">{inr(p.mrp)}</s><span className="off">{off}% off</span>
          </div>
          <p className="muted small">Inclusive of all taxes</p>

          {p.personalise && (
            <div className="panel">
              <div className="panel__head">
                <strong>Personalise it</strong>
                <span className="muted small">{photos.length}/{maxPhotos} photo{maxPhotos > 1 ? 's' : ''}</span>
              </div>
              <div className="mini-uploads">
                {photos.map((ph) => (
                  <div key={ph.id} className="mini-upload">
                    <img src={ph.thumb} alt="" />
                    <button onClick={() => setPhotos((x) => x.filter((y) => y.id !== ph.id))} aria-label="Remove"><Icon.X size={12} /></button>
                  </div>
                ))}
                {photos.length < maxPhotos && (
                  <label className="mini-upload mini-upload--add">
                    <Icon.Plus />
                    <span className="small">Add photo</span>
                    <input type="file" accept="image/*" multiple={maxPhotos > 1} hidden onChange={(e) => { onFiles(e.target.files); e.target.value = '' }} />
                  </label>
                )}
              </div>
              {err && <p className="error small">{err}</p>}
            </div>
          )}

          <label className="field">
            <span>Message card (optional)</span>
            <textarea rows="2" maxLength="120" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write something sweet… ♡" />
          </label>

          <div className="pin-check">
            <Icon.Pin size={18} />
            <input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Enter pincode" inputMode="numeric" />
            <button className="btn btn--ghost btn--sm" onClick={() => setPinMsg(pin.length === 6 ? '✓ Delivery available · arrives in 2–4 days' : 'Enter a valid 6-digit pincode')}>Check</button>
          </div>
          {pinMsg && <p className={`small ${pinMsg.startsWith('✓') ? 'ok' : 'error'}`}>{pinMsg}</p>}

          <div className="pdp__buy">
            <div className="qty">
              <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease"><Icon.Minus size={16} /></button>
              <span>{qty}</span>
              <button onClick={() => setQty(qty + 1)} aria-label="Increase"><Icon.Plus size={16} /></button>
            </div>
            <button className="btn btn--ghost btn--lg" onClick={() => add(false)}><Icon.Cart size={18} /> Add to cart</button>
            <button className="btn btn--primary btn--lg" onClick={() => add(true)}>Buy now</button>
          </div>

          <ul className="pdp__perks">
            <li><Icon.Truck size={16} /> Free delivery above ₹499</li>
            <li><Icon.Gift size={16} /> Gift-ready packaging</li>
            <li><Icon.Shield size={16} /> Secure online payment</li>
          </ul>
        </div>
      </div>

      <div className="section-head" style={{ marginTop: 56 }}><h2>You may also love</h2></div>
      <div className="product-grid">{related.map((x) => <ProductCard key={x.id} p={x} />)}</div>
    </div>
  )
}
