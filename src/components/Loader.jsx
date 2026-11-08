import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import RoosterMark from './ui/RoosterMark'
import { farm } from '../data/site'

export default function Loader({ onDone }) {
  const reduce = useReducedMotion()
  const [progress, setProgress] = useState(0)
  const duration = reduce ? 300 : 1750

  useEffect(() => {
    const start = performance.now()
    let raf
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration)
      setProgress(p)
      if (p < 1) raf = requestAnimationFrame(tick)
      else setTimeout(onDone, reduce ? 60 : 260)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [duration, onDone, reduce])

  return (
    <motion.div
      className="grain fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-parchment"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }}
      role="status"
      aria-live="polite"
      aria-label="Loading Kadaknath Poultry Farm"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 42%, rgba(255,253,246,.9), transparent 70%), radial-gradient(100% 70% at 50% 120%, rgba(160,126,74,.25), transparent 70%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center px-6">
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <span className="absolute inset-0 -m-6 rounded-full border border-gold/30" />
          <span className="absolute inset-0 -m-10 rounded-full border border-gold/15" />
          <RoosterMark className="h-16 w-auto text-forest sm:h-20" />
        </motion.div>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="mt-8 text-center font-display text-2xl tracking-tight text-ink sm:text-3xl"
        >
          Kadaknath
          <span className="block font-display text-[1.05rem] font-normal tracking-[0.34em] text-clay uppercase sm:text-lg">
            Poultry Farm
          </span>
        </motion.p>

        <motion.p
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.45 }}
          className="mt-4 font-serif text-sm italic text-ink-soft/80"
        >
          {farm.tagline}
        </motion.p>

        <div className="mt-9 h-px w-52 overflow-hidden bg-ink/10 sm:w-64">
          <div
            className="h-full bg-gradient-to-r from-gold/40 via-forest to-gold/40"
            style={{ width: `${Math.round(progress * 100)}%`, transition: 'width 120ms linear' }}
          />
        </div>
        <p className="label-caps mt-3 text-[0.6rem] text-ink-soft/55">Preparing the farm</p>
      </div>
    </motion.div>
  )
}
