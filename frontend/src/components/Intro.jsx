import { useEffect, useState } from 'react'
import p1 from '../assets/photos/print-square.jpg'
import p2 from '../assets/photos/size-8x6.jpg'
import p3 from '../assets/photos/print-landscape.jpg'

// Opening animation — plays every time the site is opened or refreshed (not on in-app page changes). Tap to skip.
export default function Intro() {
  const [phase, setPhase] = useState('play')

  useEffect(() => {
    if (phase !== 'play') return
    document.documentElement.classList.add('intro-lock')
    const t1 = setTimeout(() => setPhase('leave'), 2500)
    return () => clearTimeout(t1)
  }, [phase])

  useEffect(() => {
    if (phase !== 'leave') return
    document.documentElement.classList.remove('intro-lock')
    document.documentElement.classList.add('intro-done')
    const t = setTimeout(() => setPhase('done'), 900)
    return () => clearTimeout(t)
  }, [phase])

  useEffect(() => {
    if (phase === 'done') {
      document.documentElement.classList.remove('intro-lock')
      document.documentElement.classList.add('intro-done')
    }
  }, [phase])

  if (phase === 'done') return null

  return (
    <div className={`intro ${phase === 'leave' ? 'is-leaving' : ''}`} onClick={() => setPhase('leave')} role="presentation">
      <div className="intro__stack" aria-hidden="true">
        <span className="intro__pol intro__pol--1"><img src={p1} alt="" /></span>
        <span className="intro__pol intro__pol--2"><img src={p2} alt="" /></span>
        <span className="intro__pol intro__pol--3"><img src={p3} alt="" /></span>
        <span className="intro__heart">♥</span>
      </div>
      <h1 className="intro__word" aria-label="LOVORA">
        {'LOVORA'.split('').map((c, i) => <span key={i} style={{ '--i': i }}>{c}</span>)}
      </h1>
      <p className="intro__tag">Every Picture Deserves to Last Forever.</p>
      <span className="intro__skip">tap to skip</span>
    </div>
  )
}
