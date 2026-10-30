import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { FREE_SHIPPING_ABOVE, SHIPPING_FEE, PRODUCTS } from './data'
import { store, uid, demoPhoto } from './utils'

const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

export const ADMIN = { email: 'admin@lovora.in', password: 'admin123', name: 'LOVORA Admin', role: 'admin' }

function seedOrders() {
  const names = [
    ['Priya Sharma', 'Pune, Maharashtra', '411001'],
    ['Rahul Verma', 'Indore, Madhya Pradesh', '452001'],
    ['Neha & Karan', 'Bengaluru, Karnataka', '560034'],
    ['Aditi Jain', 'Jaipur, Rajasthan', '302017'],
  ]
  const statuses = ['Paid', 'Printing', 'Shipped', 'Delivered']
  const sizes = ['4x4', '6x4', '5x5', '8x6', 'A4']
  const prices = { '4x4': 29, '6x4': 25, '5x5': 39, '8x6': 59, A4: 149 }
  return names.map(([name, city, pin], i) => {
    const items = Array.from({ length: 2 + (i % 3) }, (_, k) => {
      const size = sizes[(i + k) % sizes.length]
      const qty = 1 + ((i + k) % 3)
      const thumb = demoPhoto(i * 5 + k)
      return { lineId: uid('l'), type: 'print', photoId: null, name: `IMG_20${26}${1000 + i * 10 + k}.jpg`, thumb, size, finish: k % 2 ? 'matte' : 'glossy', orient: 'landscape', qty, unit: prices[size] }
    })
    if (i === 2) items.push({ lineId: uid('l'), type: 'gift', productId: 'p8', qty: 1, unit: 549, photos: [], message: 'Happy anniversary, love!' })
    const subtotal = items.reduce((s, it) => s + it.unit * it.qty, 0)
    const shipping = subtotal >= FREE_SHIPPING_ABOVE ? 0 : SHIPPING_FEE
    const created = Date.now() - (i + 1) * 86400000 * 0.8
    const st = statuses[i]
    const history = ['Paid', 'Printing', 'Packed', 'Shipped', 'Delivered']
      .slice(0, ['Paid', 'Printing', 'Packed', 'Shipped', 'Delivered'].indexOf(st) + 1)
      .map((s, j) => ({ status: s, at: created + j * 3600000 * 6 }))
    return {
      id: 'LV' + (10240 + i),
      createdAt: created,
      customer: { name, email: name.split(' ')[0].toLowerCase() + '@gmail.com', phone: '98' + (76543210 + i * 1111) },
      address: { line1: `${12 + i}, Rose Residency`, line2: 'Near City Mall', city: city.split(',')[0], state: city.split(', ')[1], pincode: pin },
      items, subtotal, shipping, total: subtotal + shipping,
      payment: { method: i % 2 ? 'Card' : 'UPI', status: 'Paid', txn: 'pay_' + uid() },
      status: st,
      courier: st === 'Shipped' || st === 'Delivered' ? 'Delhivery' : '',
      tracking: st === 'Shipped' || st === 'Delivered' ? '1490' + (8812300 + i) : '',
      history,
      demo: true,
    }
  })
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => store.get('lv_user', null))
  const [users, setUsers] = useState(() => store.get('lv_users', []))
  const [cart, setCart] = useState(() => store.get('lv_cart', []))
  const [orders, setOrders] = useState(() => store.get('lv_orders', null) || seedOrders())
  const [toast, setToast] = useState(null)

  useEffect(() => store.set('lv_user', user), [user])
  useEffect(() => store.set('lv_users', users), [users])
  useEffect(() => store.set('lv_cart', cart), [cart])
  useEffect(() => store.set('lv_orders', orders), [orders])

  const notify = useCallback((msg) => {
    setToast({ msg, id: Date.now() })
    setTimeout(() => setToast((t) => (t && Date.now() - t.id >= 2400 ? null : t)), 2500)
  }, [])

  // ---- auth (mock — replace with real API) ----
  const signup = ({ name, email, phone, password }) => {
    if (users.some((u) => u.email === email) || email === ADMIN.email) return 'An account with this email already exists.'
    const u = { id: uid('u'), name, email, phone, password, role: 'customer' }
    setUsers((x) => [...x, u])
    setUser({ id: u.id, name, email, phone, role: 'customer' })
    return null
  }
  const login = (email, password) => {
    if (email === ADMIN.email && password === ADMIN.password) {
      setUser({ id: 'admin', name: ADMIN.name, email, role: 'admin' })
      return null
    }
    const u = users.find((x) => x.email === email && x.password === password)
    if (!u) return 'Incorrect email or password.'
    setUser({ id: u.id, name: u.name, email: u.email, phone: u.phone, role: 'customer' })
    return null
  }
  const logout = () => setUser(null)

  // ---- cart ----
  const addToCart = (lines) => {
    const arr = Array.isArray(lines) ? lines : [lines]
    setCart((c) => [...c, ...arr.map((l) => ({ lineId: uid('l'), ...l }))])
  }
  const updateQty = (lineId, qty) =>
    setCart((c) => c.map((l) => (l.lineId === lineId ? { ...l, qty: Math.max(1, Math.min(99, qty)) } : l)))
  const removeLine = (lineId) => setCart((c) => c.filter((l) => l.lineId !== lineId))
  const clearCart = () => setCart([])

  const totals = useMemo(() => {
    const subtotal = cart.reduce((s, l) => s + l.unit * l.qty, 0)
    const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_ABOVE ? 0 : SHIPPING_FEE
    const prints = cart.filter((l) => l.type === 'print').reduce((s, l) => s + l.qty, 0)
    const count = cart.reduce((s, l) => s + l.qty, 0)
    return { subtotal, shipping, total: subtotal + shipping, prints, count }
  }, [cart])

  // ---- orders ----
  const placeOrder = ({ customer, address, payment }) => {
    const id = 'LV' + (10240 + orders.length + Math.floor(Math.random() * 90) + 10)
    const now = Date.now()
    const order = {
      id, createdAt: now, customer, address,
      items: cart, subtotal: totals.subtotal, shipping: totals.shipping, total: totals.total,
      payment: { ...payment, status: 'Paid', txn: 'pay_' + uid() },
      status: 'Paid', courier: '', tracking: '',
      history: [{ status: 'Paid', at: now }],
      userId: user?.id,
    }
    setOrders((o) => [order, ...o])
    clearCart()
    return id
  }
  const updateOrder = (id, patch) =>
    setOrders((os) => os.map((o) => {
      if (o.id !== id) return o
      const next = { ...o, ...patch }
      if (patch.status && patch.status !== o.status) next.history = [...o.history, { status: patch.status, at: Date.now() }]
      return next
    }))

  const resetDemo = () => {
    setOrders(seedOrders())
    notify('Demo orders reset')
  }

  const value = {
    user, login, signup, logout,
    cart, addToCart, updateQty, removeLine, clearCart, totals,
    orders, placeOrder, updateOrder, resetDemo,
    toast, notify,
    products: PRODUCTS,
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
