import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'

/**
 * A hairline of gold that fills as the page is read.
 * The spring is what keeps it smooth — the raw scroll value is stepped.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const reduce = useReducedMotion()
  const smoothed = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.35 })

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[2px] origin-left"
      style={{
        scaleX: reduce ? scrollYProgress : smoothed,
        background: 'linear-gradient(90deg, rgba(176,138,69,.35), #b08a45 55%, #2c5340)',
        boxShadow: '0 0 12px rgba(176,138,69,.35)',
      }}
    />
  )
}
