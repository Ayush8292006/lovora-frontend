// Lightweight illustrated product art (placeholder until real product photos are added).
// Swap with <img src=...> once the client shares product photography.
const C = {
  rose: '#D9667F', blush: '#F4B6C2', pink: '#F9D7DE', cream: '#FFF8F0',
  ink: '#2B2326', red: '#C2324A', gold: '#D9A86C', leaf: '#7FA37A', white: '#FFFFFF',
}

const Heart = ({ x, y, s = 1, fill = C.rose }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} fill={fill}
    d="M0 4C0-2 8-4 10 2c2-6 10-4 10 2 0 7-10 12-10 14C10 16 0 11 0 4Z" />
)

const Photo = ({ x, y, w, h, r = 0, hue = 0 }) => (
  <g transform={`rotate(${r} ${x + w / 2} ${y + h / 2})`}>
    <rect x={x} y={y} width={w} height={h + h * 0.22} rx="2" fill={C.white} stroke="#EAD9DC" />
    <rect x={x + 5} y={y + 5} width={w - 10} height={h - 6} fill={`hsl(${340 + hue} 55% ${78 - hue / 4}%)`} />
    <circle cx={x + w * 0.38} cy={y + h * 0.42} r={w * 0.1} fill={C.cream} opacity=".9" />
    <circle cx={x + w * 0.62} cy={y + h * 0.45} r={w * 0.1} fill={C.cream} opacity=".9" />
    <path d={`M${x + 5} ${y + h - 1} q${(w - 10) / 2} -${h * 0.35} ${w - 10} 0Z`} fill={C.cream} opacity=".7" />
  </g>
)

const arts = {
  polaroid: () => (<>
    <Photo x={30} y={52} w={70} h={70} r={-12} hue={0} />
    <Photo x={100} y={48} w={70} h={70} r={10} hue={14} />
    <Photo x={62} y={70} w={76} h={76} r={-2} hue={6} />
    <Heart x={140} y={140} s={1.2} />
  </>),
  album: () => (<>
    <rect x="45" y="45" width="110" height="115" rx="6" fill={C.rose} />
    <rect x="52" y="45" width="6" height="115" fill="#B94C66" />
    <rect x="72" y="66" width="66" height="56" rx="3" fill={C.cream} />
    <Heart x={95} y={84} s={1} />
    <text x="105" y="145" textAnchor="middle" fontFamily="Caveat" fontSize="16" fill={C.cream}>our story</text>
  </>),
  mug: () => (<>
    <path d="M140 85h12a18 18 0 0 1 0 36h-12" fill="none" stroke={C.white} strokeWidth="9" />
    <rect x="58" y="62" width="88" height="96" rx="10" fill={C.white} stroke="#EAD9DC" />
    <rect x="70" y="80" width="64" height="52" rx="4" fill={C.blush} />
    <circle cx="92" cy="102" r="8" fill={C.cream} /><circle cx="112" cy="102" r="8" fill={C.cream} />
    <Heart x={92} y={140} s={0.8} />
    <path d="M85 48c0-8 8-8 8-16M105 48c0-8 8-8 8-16" stroke={C.rose} strokeWidth="3" fill="none" strokeLinecap="round" opacity=".6" />
  </>),
  cushion: () => (<>
    <path d="M100 168C60 140 36 118 36 86c0-22 18-38 38-38 12 0 22 6 26 14 4-8 14-14 26-14 20 0 38 16 38 38 0 32-24 54-64 82Z" fill={C.rose} />
    <rect x="72" y="74" width="56" height="50" rx="4" fill={C.cream} transform="rotate(-4 100 99)" />
    <circle cx="92" cy="96" r="8" fill={C.blush} /><circle cx="110" cy="95" r="8" fill={C.blush} />
  </>),
  lamp: () => (<>
    <rect x="58" y="150" width="84" height="16" rx="4" fill={C.ink} />
    <rect x="62" y="44" width="76" height="108" rx="6" fill="#FFF3D6" stroke={C.gold} strokeWidth="2" />
    <circle cx="100" cy="98" r="44" fill="#FFE7A8" opacity=".5" />
    <circle cx="90" cy="88" r="10" fill={C.blush} /><circle cx="110" cy="88" r="10" fill={C.blush} />
    <path d="M78 122q22-22 44 0" fill={C.blush} />
    <Heart x={90} y={56} s={1} fill={C.gold} />
  </>),
  frame: () => (<>
    <rect x="48" y="40" width="104" height="124" rx="4" fill={C.gold} />
    <rect x="58" y="50" width="84" height="104" fill={C.cream} />
    <rect x="66" y="58" width="68" height="74" fill={C.blush} />
    <circle cx="90" cy="88" r="10" fill={C.cream} /><circle cx="110" cy="90" r="10" fill={C.cream} />
    <text x="100" y="148" textAnchor="middle" fontFamily="Caveat" fontSize="14" fill={C.rose}>forever us</text>
  </>),
  collage: () => (<>
    <rect x="30" y="40" width="140" height="120" rx="4" fill={C.ink} />
    {[0, 1, 2].map((i) => [0, 1].map((j) => (
      <rect key={`${i}${j}`} x={38 + i * 44} y={48 + j * 54} width="38" height="48" fill={`hsl(${340 + i * 8 + j * 10} 60% ${76 + j * 4}%)`} />
    )))}
    <Heart x={90} y={92} s={1} fill={C.cream} />
  </>),
  bouquet: () => (<>
    <path d="M70 110l30 60 30-60Z" fill={C.cream} stroke="#EAD9DC" />
    <path d="M70 110l30 60-12-60Z" fill={C.blush} />
    {[[80, 78], [100, 66], [120, 78], [90, 96], [112, 96], [100, 84]].map(([x, y], i) => (
      <g key={i}><circle cx={x} cy={y} r="13" fill={C.red} /><path d={`M${x - 6} ${y}q6-8 12 0`} stroke="#8E1F33" strokeWidth="2" fill="none" /></g>
    ))}
    <path d="M62 100q8-14 18-8M138 100q-8-14-18-8" stroke={C.leaf} strokeWidth="6" fill="none" strokeLinecap="round" />
    <path d="M92 142h16" stroke={C.rose} strokeWidth="6" strokeLinecap="round" />
  </>),
  basket: () => (<>
    <path d="M50 110h100l-12 50H62Z" fill="#C99A6B" />
    <path d="M60 110q40-70 80 0" fill="none" stroke="#A97B4E" strokeWidth="6" />
    {[[72, 104, C.blush], [92, 96, C.white], [112, 100, C.rose], [130, 106, C.blush], [100, 110, C.red]].map(([x, y, f], i) => (
      <circle key={i} cx={x} cy={y} r="13" fill={f} stroke="#EAD9DC" />
    ))}
  </>),
  cake: () => (<>
    <ellipse cx="100" cy="158" rx="66" ry="10" fill="#EAD9DC" />
    <path d="M100 150C62 124 44 108 44 84c0-18 14-30 30-30 12 0 22 6 26 16 4-10 14-16 26-16 16 0 30 12 30 30 0 24-18 40-56 66Z" fill={C.red} />
    <path d="M58 86q8 8 16 0t16 0 16 0 16 0 16 0 16 0" stroke={C.cream} strokeWidth="4" fill="none" />
    <rect x="98" y="30" width="4" height="22" fill={C.gold} /><ellipse cx="100" cy="27" rx="4" ry="7" fill="#F2B544" />
  </>),
  photocake: () => (<>
    <ellipse cx="100" cy="150" rx="66" ry="14" fill="#5A3A2E" />
    <rect x="34" y="96" width="132" height="54" fill="#6B4434" />
    <ellipse cx="100" cy="96" rx="66" ry="20" fill="#7A4E3B" />
    <ellipse cx="100" cy="96" rx="44" ry="12" fill={C.blush} />
    <circle cx="92" cy="94" r="5" fill={C.cream} /><circle cx="108" cy="94" r="5" fill={C.cream} />
    <path d="M40 112q10 8 20 0t20 0 20 0 20 0 20 0 20 0" stroke={C.cream} strokeWidth="3" fill="none" />
  </>),
  hamper: () => (<>
    <rect x="46" y="86" width="108" height="74" rx="6" fill={C.rose} />
    <rect x="94" y="86" width="12" height="74" fill={C.cream} />
    <rect x="40" y="76" width="120" height="16" rx="4" fill="#B94C66" />
    <path d="M100 76c-20-26-38-8-20 0M100 76c20-26 38-8 20 0" fill="none" stroke={C.cream} strokeWidth="6" strokeLinecap="round" />
    <Heart x={60} y={112} s={0.9} fill={C.cream} /><Heart x={124} y={124} s={0.7} fill={C.cream} />
  </>),
}

export default function ProductArt({ art = 'polaroid', tint = '#F9D7DE', className = '' }) {
  const Draw = arts[art] || arts.polaroid
  return (
    <svg className={`product-art ${className}`} viewBox="0 0 200 200" role="img" aria-label={art}>
      <rect width="200" height="200" fill={tint} />
      <circle cx="170" cy="30" r="40" fill="#fff" opacity=".35" />
      <circle cx="20" cy="190" r="50" fill="#fff" opacity=".25" />
      <Draw />
    </svg>
  )
}
