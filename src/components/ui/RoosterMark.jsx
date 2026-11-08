/**
 * Hand-drawn Kadaknath rooster emblem used in the logo, loader and footer.
 * A solid ink silhouette with three sweeping tail plumes, so it still reads
 * clearly at 26px in the footer and at 300px on the loading screen.
 */
export default function RoosterMark({ className = '', eyeColor = 'var(--logo-eye, #f3e7cc)' }) {
  return (
    <svg
      viewBox="0 0 120 132"
      className={className}
      role="img"
      aria-label="Kadaknath rooster emblem"
      fill="currentColor"
    >
      {/* tail plumes */}
      <path d="M78 80c4-18 8-38 10-54 8 18 6 40-2 56z" />
      <path d="M82 84c8-14 15-32 19-48 4 20-2 40-11 52z" opacity="0.94" />
      <path d="M86 90c10-8 18-20 22-34 2 16-5 30-14 38z" opacity="0.88" />

      {/* body */}
      <path d="M40 66c-6 12-6 28 6 34 12 6 28 2 34-8 4-8 2-18-6-24-10-7-26-8-34-2z" />

      {/* neck */}
      <path d="M28 42c0 12 6 20 16 24l12-2c-10-8-14-16-15-26z" />

      {/* head */}
      <circle cx="34" cy="36" r="9.5" />

      {/* comb */}
      <path d="M24 30c0-8 6-11 7-3 1-10 9-9 8 1 5-6 10-3 7 5z" />

      {/* beak */}
      <path d="M25 33 10 38.5 25 43z" />

      {/* wattle */}
      <path d="M27 43c-1 11 7 13 8 1z" />

      {/* legs */}
      <g stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" fill="none">
        <path d="M50 102 48 118" />
        <path d="M48 118 43 122" />
        <path d="M48 118 54 121" />
        <path d="M64 101 63 118" />
        <path d="M63 118 58 122" />
        <path d="M63 118 69 121" />
      </g>

      {/* engraved wing detail */}
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.4">
        <path d="M48 80c9-5 18-3 25 3" />
        <path d="M50 88c8-4 16-3 22 1" />
      </g>

      {/* eye */}
      <circle cx="31" cy="34.5" r="1.6" fill={eyeColor} />
    </svg>
  )
}
