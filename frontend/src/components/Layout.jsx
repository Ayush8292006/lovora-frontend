import { useEffect, useRef, useState } from 'react'
import logo from '../assets/logo.jpg'
import { Link, navigate } from '../router'
import { useApp } from '../store'
import * as Icon from './Icons'

export function Brand({ small, light }) {
  return (
    <Link to="/" className={`brand ${small ? 'brand--sm' : ''} ${light ? 'brand--light' : ''}`} aria-label="LOVORA home">
      <img src={logo} alt="" className="brand__logo" />
      <span className="brand__text">
        <span className="brand__name">LOVORA<span className="brand__heart">♥</span></span>
        <span className="brand__tag">Every Picture Deserves to Last Forever.</span>
      </span>
    </Link>
  )
}

const NAV = [
  { label: 'Home', to: '/', match: (p, q) => p === '/' && !q.s },
  { label: 'Prints', to: '/print', match: (p) => p === '/print' },
  { label: 'Gifts', to: '/shop', match: (p) => p.startsWith('/shop') || p.startsWith('/product') },
  { label: 'How It Works', to: '/?s=how', match: (p, q) => q.s === 'how' },
  { label: 'About', to: '/?s=about', match: (p, q) => q.s === 'about' },
]

export function Header({ path, query = {} }) {
  const { totals, user, logout } = useApp()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const searchRef = useRef()

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  useEffect(() => { if (searchOpen) searchRef.current?.focus() }, [searchOpen])

  const submit = (e) => {
    e.preventDefault()
    navigate(`/shop?q=${encodeURIComponent(q)}`)
    setSearchOpen(false)
    setOpen(false)
  }
  const close = () => setOpen(false)

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="header-main container">
        <Brand />

        <nav className={`main-nav ${open ? 'is-open' : ''}`} aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.label} to={n.to} onClick={close} className={n.match(path, query) ? 'is-active' : ''}>{n.label}</Link>
          ))}
          {user?.role === 'admin' && <Link to="/admin" onClick={close}>Admin</Link>}
          {user && <button className="main-nav__logout" onClick={() => { logout(); close(); navigate('/') }}>Log out</button>}
        </nav>

        <div className="header-actions">
          <form className={`search-pop ${searchOpen ? 'is-open' : ''}`} onSubmit={submit}>
            <input ref={searchRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search prints & gifts…" aria-label="Search" tabIndex={searchOpen ? 0 : -1} />
          </form>
          <button className="icon-btn" onClick={() => setSearchOpen(!searchOpen)} aria-label="Search"><Icon.Search /></button>
          <Link to={user ? (user.role === 'admin' ? '/admin' : '/orders') : '/login'} className="icon-btn" aria-label={user ? 'My account' : 'Login'} title={user ? user.name : 'Login'}><Icon.User /></Link>
          <Link to="/cart" className="icon-btn cart-link" aria-label="Cart">
            <Icon.Cart />
            {totals.count > 0 && <span className="badge" key={totals.count}>{totals.count}</span>}
          </Link>
          <Link to="/print" className="btn btn--primary btn--sm btn--shine hide-sm">Order Now</Link>
          <button className={`burger show-sm ${open ? 'is-open' : ''}`} onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}><span /><span /><span /></button>
        </div>
      </div>
    </header>
  )
}

const Social = {
  instagram: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>,
  whatsapp: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M4 20l1.3-4A8 8 0 1 1 8 18.7Z" /><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 1c-1-.5-2-1.5-2.5-2.5l1-1-1-2Z" /></svg>,
  facebook: <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M14 8V6.5c0-.8.4-1.5 1.6-1.5H17V2h-2.4C11.8 2 11 3.9 11 6v2H8.5v3H11v11h3V11h2.6l.4-3Z" /></svg>,
  youtube: <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M22 8.2a3 3 0 0 0-2.1-2.1C18 5.6 12 5.6 12 5.6s-6 0-7.9.5A3 3 0 0 0 2 8.2 31 31 0 0 0 1.6 12 31 31 0 0 0 2 15.8a3 3 0 0 0 2.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 0 0 2.1-2.1c.3-1.3.4-2.5.4-3.8s-.1-2.5-.4-3.8ZM10 15V9l5.2 3Z" /></svg>,
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <span className="footer-word">LOVORA</span>
          <p className="muted">Every Picture Deserves to Last Forever.</p>
        </div>
        <div>
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/print">Prints</Link>
          <Link to="/shop">Gifts</Link>
          <Link to="/?s=how">How It Works</Link>
          <Link to="/?s=about">About</Link>
        </div>
        <div>
          <h4>Support</h4>
          <Link to="/orders">Track Order</Link>
          <a href="#/">Contact Us</a>
          <a href="#/">Shipping & Delivery</a>
          <a href="#/">Returns & Refunds</a>
          <a href="#/">FAQ</a>
        </div>
        <div className="footer-contact">
          <h4>Get In Touch</h4>
          <span><Icon.Phone size={16} /> +91 72761 10800</span>
          <span><Icon.Pin size={16} /> Patel G Mobile, Manidu Road, Opp. Power House</span>
          <span><Icon.Mail size={16} /> support@lovora.in</span>
        </div>
      </div>
      <div className="footer-bottom container">
        <span>© {new Date().getFullYear()} LOVORA. All rights reserved.</span>
        <div className="socials">
          {Object.entries(Social).map(([k, svg]) => <a key={k} href="#/" aria-label={k}>{svg}</a>)}
        </div>
      </div>
    </footer>
  )
}

export function Toast() {
  const { toast } = useApp()
  if (!toast) return null
  return <div className="toast" key={toast.id}><Icon.Check size={18} /> {toast.msg}</div>
}
