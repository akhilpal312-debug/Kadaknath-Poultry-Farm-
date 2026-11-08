/**
 * Botanical decorations — hand-drawn botanical sprigs and branches used
 * throughout the page as organic framing elements.
 */

const leaves = [
  [22, -40],
  [34, 26],
  [52, -42],
  [64, 24],
  [82, -40],
  [94, 26],
  [112, -38],
  [124, 22],
]

export function Sprig({ className = '', flip = false }) {
  return (
    <svg
      viewBox="0 0 140 42"
      className={className}
      aria-hidden="true"
      fill="currentColor"
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
    >
      <path d="M2 21c38-1 90 0 136 0" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
      {leaves.map(([x, rot], i) => (
        <path
          key={i}
          d="M0 0C6-7 15-9 22-5c-6 8-15 10-22 5Z"
          transform={`translate(${x} 21) rotate(${rot}) scale(0.82)`}
          opacity="0.9"
        />
      ))}
    </svg>
  )
}

/** Larger branch for section corners. */
export function Branch({ className = '', flip = false }) {
  return (
    <svg
      viewBox="0 0 240 280"
      className={className}
      aria-hidden="true"
      fill="currentColor"
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
    >
      <g stroke="currentColor" strokeWidth="1.6" fill="none" opacity="0.7">
        <path d="M18 268C46 220 66 168 92 120c14-26 30-50 50-72" />
        <path d="M70 176c-16-18-26-40-30-64" />
        <path d="M92 120c-4-24-2-48 6-70" />
        <path d="M118 86c14-16 32-26 52-30" />
      </g>
      <g opacity="0.85">
        <path d="M0 0C12-14 30-17 44-10c-12 16-30 20-44 10Z" transform="translate(38 202) rotate(-52) scale(1.1)" />
        <path d="M0 0C12-14 30-17 44-10c-12 16-30 20-44 10Z" transform="translate(62 158) rotate(-118) scale(1)" />
        <path d="M0 0C12-14 30-17 44-10c-12 16-30 20-44 10Z" transform="translate(88 108) rotate(-150) scale(1.15)" />
        <path d="M0 0C12-14 30-17 44-10c-12 16-30 20-44 10Z" transform="translate(96 74) rotate(-40) scale(0.95)" />
        <path d="M0 0C12-14 30-17 44-10c-12 16-30 20-44 10Z" transform="translate(126 68) rotate(-30) scale(1.05)" />
        <path d="M0 0C12-14 30-17 44-10c-12 16-30 20-44 10Z" transform="translate(150 44) rotate(-24) scale(0.9)" />
        <path d="M0 0C12-14 30-17 44-10c-12 16-30 20-44 10Z" transform="translate(30 240) rotate(-74) scale(1)" />
      </g>
    </svg>
  )
}

/** Small floating dust motes for the hero atmosphere. */
export function Dust({ count = 16, className = '' }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => {
        const size = 2 + (i % 3);
        return (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${(i * 37 + 7) % 96}%`,
              bottom: `${(i * 19) % 55}%`,
              width: size,
              height: size,
              background: 'radial-gradient(circle, rgba(255,248,230,0.95), rgba(240,224,190,0.15))',
              boxShadow: '0 0 6px rgba(255,244,214,0.55)',
              animation: `dust ${16 + (i % 6) * 4}s linear ${(i * 1.9) % 14}s infinite`,
            }}
          />
        )
      })}
    </div>
  )
}
