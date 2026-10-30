import { useEffect, useState } from 'react'
import logo from '../assets/logo.jpg'
import { Link, navigate } from '../router'
import { ORDER_STATUSES, inr } from '../data'
import { ADMIN, useApp } from '../store'
import { LineMedia, lineMeta, lineTitle } from './Cart'
import * as Icon from '../components/Icons'

const fmt = (t) => new Date(t).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })

export function Login({ query }) {
  const { login, signup, user } = useApp()
  const [mode, setMode] = useState('login')
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '' })
  const [err, setErr] = useState('')
  const next = query.next || null

  useEffect(() => {
    if (user) navigate(next || (user.role === 'admin' ? '/admin' : '/orders'))
  }, [user, next])

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const submit = (e) => {
    e.preventDefault()
    setErr('')
    if (mode === 'signup') {
      if (!f.name || !f.email || f.password.length < 6) return setErr('Fill all fields — password needs 6+ characters.')
      const r = signup(f)
      if (r) setErr(r)
    } else {
      const r = login(f.email.trim(), f.password)
      if (r) setErr(r)
    }
  }

  return (
    <div className="auth">
      <div className="auth__card">
        <img src={logo} alt="" className="auth__logo" />
        <h1 className="h2">{mode === 'login' ? 'Welcome back ♡' : 'Create your account'}</h1>
        <p className="muted">{mode === 'login' ? 'Log in to track orders and checkout faster.' : 'Save addresses and keep all your memories in one place.'}</p>
        <div className="seg seg--full">
          <button className={mode === 'login' ? 'is-on' : ''} onClick={() => setMode('login')}>Login</button>
          <button className={mode === 'signup' ? 'is-on' : ''} onClick={() => setMode('signup')}>Sign up</button>
        </div>
        <form onSubmit={submit} className="auth__form">
          {mode === 'signup' && <label className="field"><span>Full name</span><input value={f.name} onChange={set('name')} autoComplete="name" /></label>}
          <label className="field"><span>Email</span><input type="email" value={f.email} onChange={set('email')} autoComplete="email" /></label>
          {mode === 'signup' && <label className="field"><span>Mobile</span><input value={f.phone} onChange={set('phone')} inputMode="numeric" maxLength={10} autoComplete="tel" /></label>}
          <label className="field"><span>Password</span><input type="password" value={f.password} onChange={set('password')} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>
          {err && <p className="error small">{err}</p>}
          <button className="btn btn--primary btn--block btn--lg">{mode === 'login' ? 'Login' : 'Create account'}</button>
        </form>
        <div className="demo-box small">
          <strong>Prototype demo logins</strong>
          <span>Customer: sign up with any email.</span>
          <span>Admin: {ADMIN.email} / {ADMIN.password}</span>
          <button className="btn btn--ghost btn--xs" onClick={() => login(ADMIN.email, ADMIN.password)}>Enter as admin</button>
        </div>
      </div>
    </div>
  )
}

export function Tracker({ order }) {
  const idx = ORDER_STATUSES.indexOf(order.status)
  return (
    <ol className="tracker">
      {ORDER_STATUSES.map((s, i) => {
        const h = order.history.find((x) => x.status === s)
        return (
          <li key={s} className={i <= idx ? 'is-done' : ''}>
            <span className="tracker__dot">{i <= idx ? <Icon.Check size={12} /> : null}</span>
            <span className="tracker__label">{s === 'Paid' ? 'Order placed' : s}</span>
            {h && <span className="tracker__time">{fmt(h.at)}</span>}
          </li>
        )
      })}
    </ol>
  )
}

export function Success({ id }) {
  const { orders } = useApp()
  const o = orders.find((x) => x.id === id)
  if (!o) return <div className="container section empty"><p>Order not found.</p></div>
  return (
    <div className="container section success">
      <div className="success__card">
        <div className="success__icon"><Icon.Heart size={34} fill="currentColor" /></div>
        <h1 className="h2">Thank you, {o.customer.name.split(' ')[0]}!</h1>
        <p className="muted">Your memories are on their way to becoming forever. We've emailed the confirmation to <strong>{o.customer.email}</strong>.</p>
        <div className="success__meta">
          <div><span className="muted small">Order ID</span><strong>#{o.id}</strong></div>
          <div><span className="muted small">Paid</span><strong>{inr(o.total)}</strong></div>
          <div><span className="muted small">Via</span><strong>{o.payment.method}</strong></div>
        </div>
        <Tracker order={o} />
        <div className="row-gap center">
          <Link to="/orders" className="btn btn--primary">Track my orders</Link>
          <Link to="/print" className="btn btn--ghost">Print more photos</Link>
        </div>
      </div>
    </div>
  )
}

export function Orders() {
  const { orders, user } = useApp()
  useEffect(() => { if (!user) navigate('/login?next=/orders') }, [user])
  if (!user) return null
  const mine = user.role === 'admin' ? [] : orders.filter((o) => o.userId === user.id || o.customer.email === user.email)

  return (
    <div className="container section">
      <h1 className="h2">My orders</h1>
      <p className="muted">Hi {user.name.split(' ')[0]} ♡ — here's every memory you've printed with us.</p>
      {user.role === 'admin' && <p><Link to="/admin" className="btn btn--primary">Go to admin dashboard</Link></p>}
      {!mine.length && user.role !== 'admin' && (
        <div className="empty"><p>No orders yet.</p><Link to="/print" className="btn btn--primary"><Icon.Upload size={16} /> Print your first photos</Link></div>
      )}
      <div className="order-list">
        {mine.map((o) => (
          <article key={o.id} className="order-card">
            <header>
              <div><strong>#{o.id}</strong><span className="muted small"> · {fmt(o.createdAt)}</span></div>
              <span className={`status status--${o.status.toLowerCase()}`}>{o.status}</span>
            </header>
            <div className="order-card__items">
              {o.items.slice(0, 6).map((l) => (
                <div key={l.lineId} className="mini-line"><LineMedia line={l} /><div><span className="small">{lineTitle(l)} × {l.qty}</span><span className="muted small">{lineMeta(l)}</span></div></div>
              ))}
            </div>
            <Tracker order={o} />
            <footer>
              <span>Total <strong>{inr(o.total)}</strong></span>
              {o.tracking ? <span className="small"><Icon.Truck size={14} /> {o.courier} · AWB <strong>{o.tracking}</strong></span> : <span className="muted small">Tracking will appear once shipped</span>}
            </footer>
          </article>
        ))}
      </div>
    </div>
  )
}
