import { useEffect, useState } from 'react'
import { Link, navigate } from '../router'
import { inr } from '../data'
import { useApp } from '../store'
import { LineMedia, lineTitle } from './Cart'
import * as Icon from '../components/Icons'

const STATES = ['Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal']

export default function Checkout() {
  const { cart, totals, user, placeOrder } = useApp()
  const [f, setF] = useState({ name: user?.name || '', phone: user?.phone || '', email: user?.email || '', line1: '', line2: '', city: '', state: '', pincode: '' })
  const [method, setMethod] = useState('UPI')
  const [errors, setErrors] = useState({})
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    if (!user) navigate('/login?next=/checkout')
    else if (!cart.length && !paying) navigate('/cart')
  }, [user, cart.length, paying])
  if (!user) return null

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const validate = () => {
    const e = {}
    if (!f.name.trim()) e.name = 'Required'
    if (!/^[6-9]\d{9}$/.test(f.phone)) e.phone = 'Enter a 10-digit mobile number'
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Enter a valid email'
    if (!f.line1.trim()) e.line1 = 'Required'
    if (!f.city.trim()) e.city = 'Required'
    if (!f.state) e.state = 'Select a state'
    if (!/^\d{6}$/.test(f.pincode)) e.pincode = '6-digit pincode'
    setErrors(e)
    return !Object.keys(e).length
  }

  const pay = () => { if (validate()) setPaying(true) }
  const confirmPay = () => {
    const id = placeOrder({
      customer: { name: f.name, email: f.email, phone: f.phone },
      address: { line1: f.line1, line2: f.line2, city: f.city, state: f.state, pincode: f.pincode },
      payment: { method },
    })
    navigate(`/success/${id}`)
  }

  const Field = ({ k, label, ...rest }) => (
    <label className={`field ${errors[k] ? 'has-error' : ''}`}>
      <span>{label}</span>
      <input value={f[k]} onChange={set(k)} {...rest} />
      {errors[k] && <em>{errors[k]}</em>}
    </label>
  )

  return (
    <div className="container section">
      <div className="crumbs"><Link to="/cart">Cart</Link> / <span>Checkout</span></div>
      <h1 className="h2">Checkout</h1>
      <div className="cart-layout">
        <div>
          <section className="panel">
            <div className="panel__head"><strong>1. Delivery address</strong></div>
            <div className="form-grid">
              {Field({ k: 'name', label: 'Full name', autoComplete: 'name' })}
              {Field({ k: 'phone', label: 'Mobile number', inputMode: 'numeric', maxLength: 10, autoComplete: 'tel' })}
              <div className="span-2">{Field({ k: 'email', label: 'Email (for order updates)', type: 'email', autoComplete: 'email' })}</div>
              <div className="span-2">{Field({ k: 'line1', label: 'House no., building, street', autoComplete: 'address-line1' })}</div>
              <div className="span-2">{Field({ k: 'line2', label: 'Area, landmark (optional)', autoComplete: 'address-line2' })}</div>
              {Field({ k: 'city', label: 'City', autoComplete: 'address-level2' })}
              <label className={`field ${errors.state ? 'has-error' : ''}`}>
                <span>State</span>
                <select value={f.state} onChange={set('state')}>
                  <option value="">Select state</option>
                  {STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
                {errors.state && <em>{errors.state}</em>}
              </label>
              {Field({ k: 'pincode', label: 'Pincode', inputMode: 'numeric', maxLength: 6, autoComplete: 'postal-code' })}
            </div>
          </section>

          <section className="panel">
            <div className="panel__head"><strong>2. Payment method</strong><span className="muted small"><Icon.Lock size={13} /> 100% secure</span></div>
            <div className="pay-methods">
              {[
                ['UPI', 'UPI', 'GPay, PhonePe, Paytm, BHIM'],
                ['Card', 'Credit / Debit card', 'Visa, Mastercard, RuPay'],
                ['NetBanking', 'Net banking', 'All major Indian banks'],
                ['Wallet', 'Wallets', 'Paytm, Amazon Pay, Mobikwik'],
              ].map(([id, t, d]) => (
                <label key={id} className={`pay-method ${method === id ? 'is-on' : ''}`}>
                  <input type="radio" name="pay" checked={method === id} onChange={() => setMethod(id)} />
                  <div><strong>{t}</strong><span className="muted small">{d}</span></div>
                </label>
              ))}
            </div>
            <p className="muted small">Payments will be processed via Razorpay / Cashfree in the live site.</p>
          </section>
        </div>

        <aside className="summary sticky">
          <h3>Order summary</h3>
          <div className="mini-lines">
            {cart.slice(0, 5).map((l) => (
              <div key={l.lineId} className="mini-line"><LineMedia line={l} /><span className="small">{lineTitle(l)} × {l.qty}</span><span className="small">{inr(l.unit * l.qty)}</span></div>
            ))}
            {cart.length > 5 && <p className="muted small">+ {cart.length - 5} more items</p>}
          </div>
          <ul className="summary__lines">
            <li><span>Subtotal</span><span>{inr(totals.subtotal)}</span></li>
            <li><span>Shipping</span><span>{totals.shipping ? inr(totals.shipping) : <span className="ok">FREE</span>}</span></li>
          </ul>
          <div className="summary__total"><span>Total payable</span><strong>{inr(totals.total)}</strong></div>
          <button className="btn btn--primary btn--block btn--lg" onClick={pay}><Icon.Lock size={16} /> Pay {inr(totals.total)}</button>
        </aside>
      </div>

      {paying && (
        <div className="modal-backdrop">
          <div className="modal pay-modal">
            <div className="pay-modal__brand"><strong>LOVORA</strong><span className="muted small">Secure checkout · Demo</span></div>
            <div className="pay-modal__amount">{inr(totals.total)}</div>
            <p className="muted small">Paying via <strong>{method}</strong>{method === 'UPI' ? ' · lovora@upi' : ''}</p>
            <div className="pay-modal__qr" aria-hidden="true">{Array.from({ length: 49 }, (_, i) => <span key={i} className={(i * 7 + (i % 5) * 3) % 3 ? 'on' : ''} />)}</div>
            <p className="small muted">This is a prototype — no real money is charged.</p>
            <div className="row-gap">
              <button className="btn btn--ghost" onClick={() => setPaying(false)}>Cancel</button>
              <button className="btn btn--primary" onClick={confirmPay}><Icon.Check size={16} /> Simulate success</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
