import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react'
import { SectionHeading, Stagger, StaggerItem } from './ui/Primitives'
import { gallery } from '../data/site'

const spans = ['col-span-2 row-span-2', '', '', '', '', 'col-span-2 lg:col-span-1']

export default function Gallery() {
  const [index, setIndex] = useState(null)
  const open = index !== null
  const reduce = useReducedMotion()

  const close = useCallback(() => setIndex(null), [])
  const next = useCallback(() => setIndex((i) => (i === null ? i : (i + 1) % gallery.length)), [])
  const prev = useCallback(() => setIndex((i) => (i === null ? i : (i - 1 + gallery.length) % gallery.length)), [])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, close, next, prev])

  const item = open ? gallery[index] : null

  return (
    <section id="gallery" className="relative scroll-mt-24 overflow-hidden bg-cream-soft py-16 sm:py-20 lg:py-24">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(60% 50% at 80% 0%, rgba(196,166,116,.16), transparent 60%)' }}
      />

      <div className="relative mx-auto max-w-[1320px] px-5 sm:px-8">
        <SectionHeading
          eyebrow="A glimpse of our poultry farm"
          title="Our Farm Gallery"
          subtitle="Roosters, hens, chicks and the everyday corners of the farm on Shivli Road."
        />

        <Stagger className="mt-11 grid auto-rows-[150px] grid-cols-2 gap-3 sm:auto-rows-[210px] sm:gap-4 lg:mt-14 lg:auto-rows-[290px] lg:grid-cols-3" gap={0.06}>
          {gallery.map((photo, i) => (
            <StaggerItem key={photo.src} className={spans[i] ?? ''}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Open photo: ${photo.caption}`}
                className="group relative h-full w-full overflow-hidden rounded-[10px] border border-ink/10 bg-parchment-deep text-left transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_24px_44px_-30px_rgba(48,32,10,.65)]"
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.07]"
                />
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1a1206]/70 via-transparent to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
                <span className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2">
                  <span className="translate-y-1 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    <span className="block font-serif text-[0.82rem] italic text-cream/95">{photo.caption}</span>
                    <span className="block text-[0.6rem] tracking-[0.16em] text-gold-soft/90 uppercase">{photo.tag}</span>
                  </span>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cream/40 bg-cream/10 text-cream opacity-0 backdrop-blur-sm transition-all duration-500 group-hover:opacity-100">
                    <Expand className="h-3 w-3" strokeWidth={1.8} />
                  </span>
                </span>
              </button>
            </StaggerItem>
          ))}
        </Stagger>

        <p className="mt-6 text-center text-[0.78rem] text-ink-soft/60">
          Tap any photograph to view it full screen.
        </p>
      </div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {open && item && (
          <motion.div
            className="on-dark fixed inset-0 z-[80] flex items-center justify-center bg-[#120f0a]/92 p-4 backdrop-blur-sm sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-modal="true"
            aria-label={item.caption}
            onClick={close}
          >
            <button
              type="button"
              onClick={close}
              autoFocus
              className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-cream/25 text-cream/90 transition-colors hover:bg-cream hover:text-ink sm:right-6 sm:top-6"
              aria-label="Close photo"
            >
              <X className="h-5 w-5" strokeWidth={1.6} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                prev()
              }}
              className="absolute left-2 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-cream/25 text-cream/90 transition-colors hover:bg-cream hover:text-ink sm:left-5"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.6} />
            </button>

            <motion.figure
              key={item.src}
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative max-h-full w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={item.src}
                alt={item.alt}
                className="mx-auto max-h-[76vh] w-auto rounded-[8px] object-contain shadow-[0_30px_80px_-30px_rgba(0,0,0,.9)]"
              />
              <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-2 text-cream/85">
                <span className="font-serif text-base italic">{item.caption}</span>
                <span className="text-[0.68rem] tracking-[0.2em] text-gold-soft/80 uppercase">
                  {index + 1} / {gallery.length}
                </span>
              </figcaption>
            </motion.figure>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                next()
              }}
              className="absolute right-2 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-cream/25 text-cream/90 transition-colors hover:bg-cream hover:text-ink sm:right-5"
              aria-label="Next photo"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={1.6} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
