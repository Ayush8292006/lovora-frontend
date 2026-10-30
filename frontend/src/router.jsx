import { useEffect, useState } from 'react'

// Tiny hash router (no extra dependency). Routes look like  #/print, #/product/p3
const parse = () => {
  const raw = window.location.hash.replace(/^#/, '') || '/'
  const [path, qs = ''] = raw.split('?')
  return { path: path || '/', query: Object.fromEntries(new URLSearchParams(qs)) }
}

export function navigate(to) {
  window.location.hash = to
}

export function useLocation() {
  const [loc, setLoc] = useState(parse)
  useEffect(() => {
    const on = () => {
      setLoc(parse())
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return loc
}

// match('/product/:id', '/product/p3') -> { id: 'p3' }
export function match(pattern, path) {
  const a = pattern.split('/').filter(Boolean)
  const b = path.split('/').filter(Boolean)
  if (a.length !== b.length) return null
  const params = {}
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith(':')) params[a[i].slice(1)] = decodeURIComponent(b[i])
    else if (a[i] !== b[i]) return null
  }
  return params
}

export function Link({ to, children, className, onClick, ...rest }) {
  return (
    <a href={`#${to}`} className={className} onClick={onClick} {...rest}>
      {children}
    </a>
  )
}
