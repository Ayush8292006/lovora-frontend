import { useEffect, useRef } from 'react'
import heroImg from '../assets/photos/hero-collage.jpg'
import pSquare from '../assets/photos/print-square.jpg'
import pLandscape from '../assets/photos/print-landscape.jpg'
import pCustom from '../assets/photos/print-custom.jpg'
import pGift from '../assets/photos/print-gift.jpg'
import whyImg from '../assets/photos/why-collage.jpg'
import ctaImg from '../assets/photos/cta-gift.jpg'
import s4 from '../assets/photos/size-4x4.jpg'
import s5 from '../assets/photos/size-5x5.jpg'
import s64 from '../assets/photos/size-6x4.jpg'
import s86 from '../assets/photos/size-8x6.jpg'
import sA4 from '../assets/photos/size-a4.jpg'
import { Link } from '../router'
import { inr, PRINT_SIZES } from '../data'
import * as Icon from '../components/Icons'

const PRINTS = [
  { img: pSquare, title: 'Square Prints', tags: ['4×4', '5×5'] },
  { img: pLandscape, title: 'Landscape Prints', tags: ['6×4', '8×6'] },
  { img: pCustom, title: 'Custom Sizes', tags: ['A4 & More'] },
  { img: pGift, title: 'Perfect for Gifting', note: 'Couple Prints, Occasions & More' },
]

const WHY = [
  [Icon.Diamond, 'Premium Quality', 'Prints'],
  [Icon.Sizes, 'Multiple Sizes', 'and Formats'],
  [Icon.Gift, 'Perfect for', 'Special Occasions'],
  [Icon.Shield, 'Secure Online', 'Payment'],
  [Icon.Truck, 'Doorstep', 'Delivery'],
  [Icon.Heart, 'Beautiful', 'Gift Packages'],
]

const HOW = [
  [Icon.Image, 'Upload Photos', 'Select and upload multiple photographs.'],
  [Icon.Edit, 'Customize Prints', 'Preview, crop and select sizes and quantities.'],
  [Icon.Cart, 'Place Order', 'Add to cart, enter delivery details and pay online.'],
  [Icon.Printer, 'Printing', 'We prepare your photos with care.'],
  [Icon.Package, 'Packaging', 'Your prints are securely packed.'],
  [Icon.Truck, 'Delivery', 'Shipped to your doorstep with tracking details.'],
]

const SIZE_IMG = { '4x4': s4, '5x5': s5, '6x4': s64, '8x6': s86, A4: sA4 }

const REVIEWS = [
  { name: 'Riya Sharma', text: 'The print quality is amazing! My memories look so beautiful in real photos.' },
  { name: 'Aman Verma', text: 'Perfect for gifting! The prints arrived on time and the quality is just wow.' },
  { name: 'Neha Patel', text: 'Such a beautiful experience. Easy to use and super fast delivery!' },
]

// Scroll-reveal: elements with data-reveal animate in when they enter the viewport.
function useReveal() {
  useEffect(() => {
    const els = [...document.querySelectorAll('[data-reveal]')]
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-in'))
      return
    }
    document.documentElement.classList.add('js-reveal')
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target) }
      })
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' })
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

function Title({ a, b, sub }) {
  return (
    <div className="h-title" data-reveal="up">
      <h2>{a} <em>{b}</em></h2>
      {sub && <p>{sub}</p>}
    </div>
  )
}

export default function Home({ query = {} }) {
  useReveal()
  const heroArt = useRef()

  // jump to section from nav (#/?s=how)
  useEffect(() => {
    if (!query.s) return
    const el = document.getElementById(query.s)
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
  }, [query.s])

  // gentle mouse parallax on the hero photos
  const onMove = (e) => {
    const el = heroArt.current
    if (!el || window.matchMedia?.('(pointer: coarse)').matches) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--rx', `${(-y * 5).toFixed(2)}deg`)
    el.style.setProperty('--ry', `${(x * 7).toFixed(2)}deg`)
  }
  const onLeave = () => { heroArt.current?.style.setProperty('--rx', '0deg'); heroArt.current?.style.setProperty('--ry', '0deg') }

  return (
    <div className="home">
      {/* ---------- HERO ---------- */}
      <section className="hero2" onMouseMove={onMove} onMouseLeave={onLeave}>
        <div className="container hero2__grid">
          <div className="hero2__copy">
            <span className="hero2__eyebrow a-in" style={{ '--d': '0s' }}>Turn your moments into</span>
            <h1>
              <span className="line"><span className="a-up" style={{ '--d': '.1s' }}>Beautiful</span></span>
              <span className="line"><span className="a-up accent" style={{ '--d': '.25s' }}>Printed Memories</span></span>
            </h1>
            <p className="hero2__lead a-in" style={{ '--d': '.45s' }}>Upload your photos, customize sizes, and get professionally printed photographs delivered to your doorstep.</p>
            <div className="a-in" style={{ '--d': '.6s' }}>
              <Link to="/print" className="btn btn--primary btn--lg btn--shine">Print Your Photos <Icon.ArrowRight size={18} className="arrow" /></Link>
            </div>
            <ul className="hero2__feats">
              {[[Icon.Truck, 'Doorstep', 'Delivery'], [Icon.Shield, 'High Quality', 'Prints'], [Icon.Heart, 'Perfect', 'For Gifting']].map(([Ic, a, b], i) => (
                <li key={a} className="a-in" style={{ '--d': `${0.75 + i * 0.1}s` }}><span><Ic size={24} /></span>{a}<br />{b}</li>
              ))}
            </ul>
          </div>

          <div className="hero2__art a-zoom" style={{ '--d': '.2s' }} ref={heroArt}>
            <div className="hero2__photo"><img src={heroImg} alt="Polaroid prints of a couple at sunset with pink flowers" /></div>
            <span className="float-heart fh1">♡</span>
            <span className="float-heart fh2">♡</span>
            <span className="float-heart fh3">♥</span>
          </div>
        </div>
      </section>

      {/* ---------- PHONE TO DOORSTEP ---------- */}
      <section className="band band--soft">
        <div className="container">
          <Title a="From Your Phone to" b="Your Doorstep" sub="A simple and beautiful way to turn your digital memories into forever memories." />
          <div className="trio">
            {[[Icon.Image, 'Upload', 'Choose your photos'], [Icon.Crop, 'Personalize', 'Crop and select sizes'], [Icon.Truck, 'Deliver', 'Receive prints at home']].map(([Ic, t, d], i) => (
              <div key={t} className="trio__item" data-reveal="up" style={{ '--d': `${i * 0.15}s` }}>
                <span className="ring"><Ic size={30} /></span>
                <strong>{t}</strong>
                <span>{d}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- OUR PHOTO PRINTS ---------- */}
      <section className="band">
        <div className="container">
          <Title a="Our" b="Photo Prints" sub="High quality prints for every special moment." />
          <div className="prints">
            {PRINTS.map((p, i) => (
              <Link to={i === 3 ? '/shop' : '/print'} key={p.title} className="print-tile" data-reveal="up" style={{ '--d': `${i * 0.1}s` }}>
                <div className="print-tile__img"><img src={p.img} alt={p.title} loading="lazy" /><span className="print-tile__cta">{i === 3 ? 'Shop gifts' : 'Print now'} <Icon.ArrowRight size={14} /></span></div>
                <strong>{p.title}</strong>
                {p.tags ? <div className="tags">{p.tags.map((t) => <span key={t}>{t}</span>)}</div> : <span className="muted small">{p.note}</span>}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- WHY ---------- */}
      <section className="band band--rose" id="about">
        <div className="container why">
          <div className="why__art" data-reveal="left">
            <img src={whyImg} alt="Polaroid photos of couples — memories look better on paper" loading="lazy" />
          </div>
          <div className="why__copy">
            <div className="h-title h-title--left" data-reveal="up">
              <h2>Why Choose <em>LOVORA?</em></h2>
              <p>Because every memory deserves to be held, not just stored.</p>
            </div>
            <div className="why__grid">
              {WHY.map(([Ic, a, b], i) => (
                <div key={a} className="why__item" data-reveal="up" style={{ '--d': `${i * 0.08}s` }}>
                  <span className="why__icon"><Ic size={30} /></span>
                  <span>{a}<br />{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="band band--soft" id="how">
        <div className="container">
          <Title a="How" b="It Works" sub="Turn your digital photos into beautiful prints in just a few simple steps." />
          <ol className="how">
            {HOW.map(([Ic, t, d], i) => (
              <li key={t} className="how__step" data-reveal="up" style={{ '--d': `${i * 0.1}s` }}>
                <span className="ring ring--sm"><Ic size={24} /></span>
                <span className="how__num">{String(i + 1).padStart(2, '0')}</span>
                <strong>{t}</strong>
                <span className="how__desc">{d}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- SIZES ---------- */}
      <section className="band">
        <div className="container">
          <Title a="Available" b="Print Sizes" />
          <div className="sizes">
            {PRINT_SIZES.map((s, i) => (
              <Link to="/print" key={s.id} className="size-tile" data-reveal="zoom" style={{ '--d': `${i * 0.08}s` }}>
                <div className="size-tile__frame" style={{ aspectRatio: s.ratio === 1 ? '1' : s.id === 'A4' ? '0.9' : '1.3' }}>
                  <img src={SIZE_IMG[s.id]} alt={`${s.label} print example`} loading="lazy" />
                </div>
                <strong>{s.label.replace('"', '')}</strong>
                <span className="muted small">{s.format}</span>
                <span className="size-tile__price">{inr(s.price)}</span>
              </Link>
            ))}
            <Link to="/print" className="size-tile" data-reveal="zoom" style={{ '--d': '.4s' }}>
              <div className="size-tile__frame size-tile__frame--empty"><Icon.Camera size={34} /></div>
              <strong>Custom</strong>
              <span className="muted small">More Sizes</span>
              <span className="size-tile__price">Soon</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- REVIEWS ---------- */}
      <section className="band band--soft">
        <div className="container">
          <Title a="What Our" b="Customers Say" />
          <div className="reviews">
            {REVIEWS.map((r, i) => (
              <figure key={r.name} className="review" data-reveal="up" style={{ '--d': `${i * 0.12}s` }}>
                <span className="review__avatar">{r.name.split(' ').map((w) => w[0]).join('')}</span>
                <div>
                  <figcaption>{r.name}</figcaption>
                  <div className="stars">★★★★★</div>
                  <blockquote>“{r.text}”</blockquote>
                </div>
                <span className="review__quote">”</span>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="cta2">
        <div className="cta2__art" data-reveal="left"><img src={ctaImg} alt="Gift box with printed couple photos" loading="lazy" /></div>
        <div className="cta2__copy" data-reveal="right">
          <span className="eyebrow">Make every memory count</span>
          <span className="cta2__word">LOVORA</span>
          <p>Every Picture Deserves to Last Forever.</p>
          <Link to="/print" className="btn btn--primary btn--lg btn--shine">Start Printing Now <Icon.ArrowRight size={18} className="arrow" /></Link>
          <span className="float-heart fh4">♡</span>
          <span className="float-heart fh5">♡</span>
        </div>
      </section>
    </div>
  )
}
