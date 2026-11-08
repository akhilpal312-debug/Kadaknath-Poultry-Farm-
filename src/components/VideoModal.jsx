import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'

export default function VideoModal({ onClose }) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [onClose])

  return (
    <motion.div
      className="on-dark fixed inset-0 z-[80] flex items-center justify-center bg-[#0d1510]/94 p-4 backdrop-blur-sm sm:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      role="dialog"
      aria-modal="true"
      aria-label="Farm film"
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-4xl"
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.99 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <p className="label-caps text-[0.58rem] text-gold-soft/80">Kadaknath Poultry Farm</p>
            <h2 className="mt-1 font-display text-xl text-cream sm:text-2xl">A short film from the farm</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cream/25 text-cream/90 transition-colors hover:bg-cream hover:text-ink"
            aria-label="Close video"
          >
            <X className="h-5 w-5" strokeWidth={1.6} />
          </button>
        </div>

        {failed ? (
          <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-[10px] border border-cream/15 bg-black/40 px-6 text-center">
            <p className="font-display text-lg text-cream">The farm film is being prepared</p>
            <p className="max-w-sm text-[0.85rem] text-parchment/60">
              The video is not on the site yet. In the meantime, the gallery below has photographs of the flock.
            </p>
          </div>
        ) : (
          <video
            controls
            autoPlay
            muted
            playsInline
            preload="metadata"
            poster="/images/farm-film-poster.jpg"
            onError={() => setFailed(true)}
            className="aspect-video w-full rounded-[10px] border border-cream/15 bg-black shadow-[0_30px_80px_-30px_rgba(0,0,0,.9)]"
          >
            <source src="/media/farm-film.mp4" type="video/mp4" />
          </video>
        )}

        <p className="mt-3 font-serif text-[0.9rem] italic text-parchment/60">
          Roosters, hens and chicks from the Kadaknath flock on Shivli Road.
        </p>
      </motion.div>
    </motion.div>
  )
}
