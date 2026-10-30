import { match, useLocation } from './router'
import { AppProvider } from './store'
import { Footer, Header, Toast } from './components/Layout'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Product from './pages/Product'
import PrintPhotos from './pages/PrintPhotos'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Admin from './pages/Admin'
import { Login, Orders, Success } from './pages/Account'
import Intro from './components/Intro'
import './home.css'

function Routes() {
  const { path, query } = useLocation()
  let m
  let page
  if (path === '/') page = <Home query={query} />
  else if (path === '/shop') page = <Shop query={query} />
  else if ((m = match('/shop/:cat', path))) page = <Shop cat={m.cat} query={query} />
  else if ((m = match('/product/:id', path))) page = <Product key={m.id} id={m.id} />
  else if (path === '/print') page = <PrintPhotos />
  else if (path === '/cart') page = <Cart />
  else if (path === '/checkout') page = <Checkout />
  else if ((m = match('/success/:id', path))) page = <Success id={m.id} />
  else if (path === '/login') page = <Login query={query} />
  else if (path === '/orders') page = <Orders />
  else if (path === '/admin') return <><Admin /><Toast /></>
  else page = <Home query={query} />

  return (
    <>
      <Intro />
      <Header path={path} query={query} />
      <main className="page">{page}</main>
      <Footer />
      <Toast />
    </>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Routes />
    </AppProvider>
  )
}
