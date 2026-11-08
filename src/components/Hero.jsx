import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Play, Leaf, ShieldCheck, Heart, Star } from 'lucide-react'
import { Dust, Branch, Sprig } from './ui/Botanical'
import { SplitHeading } from './ui/Primitives'
import { heroBadges } from '../data/site'

const icons = { leaf: Leaf, shield: ShieldCheck, heart: Heart }
const ease = [0.22, 1, 0.36, 1]

export default function Hero({ onWatch }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imageY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 70])
  const textY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -34])
  const fade = useTransform(scrollYProgress, [0, 0.85], [1, reduce ? 1 : 0.35])

  return (
    <section
      id="home"
      ref={ref}
      className="grain paper-fibres relative overflow-hidden pb-10 pt-[86px] sm:pb-14 lg:pb-16 lg:pt-[104px]"
    >
      {/* ambient washes */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(70% 60% at 78% 18%, rgba(255,252,243,.9), transparent 62%), radial-gradient(60% 55% at 6% 78%, rgba(199,171,120,.28), transparent 65%)',
        }}
      />

      <Branch className="pointer-events-none absolute -left-14 -top-6 h-56 w-auto text-forest/20 sm:h-72 lg:-left-10 lg:h-96" />
      <Branch
        flip
        className="pointer-events-none absolute -right-16 top-24 h-52 w-auto text-forest/18 sm:h-64 lg:h-80"
      />
      <Dust count={18} className="opacity-70" />

      <div className="relative z-10 mx-auto max-w-[1320px] px-5 sm:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.03fr_0.97fr] lg:gap-8 xl:gap-14">
          {/* ── Copy ── */}
          <motion.div style={{ y: textY, opacity: fade }} className="relative">
            <motion.div
              initial={reduce ? false : { opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease }}
              className="flex items-center gap-3"
            >
              <span className="h-px w-10 bg-gold/70 sm:w-14" />
              <span className="font-serif text-xl italic text-clay sm:text-2xl">Welcome to</span>
            </motion.div>

            <h1 className="mt-2 font-display leading-[0.94] tracking-[-0.02em] text-ink">
              <SplitHeading
                text="Kadaknath"
                delay={0.25}
                className="text-[2.85rem] xs:text-[3.4rem] sm:text-[4.3rem] lg:text-[4.6rem] xl:text-[5.1rem]"
              />
              <span className="mt-1 block text-[2.85rem] leading-[0.94] xs:text-[3.4rem] sm:text-[4.3rem] lg:text-[4.6rem] xl:text-[5.1rem]">
                <SplitHeading text="Poultry Farm" delay={0.38} className="text-forest" />
              </span>
            </h1>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.7, ease }}
              className="mt-5 flex items-center gap-4 font-serif text-lg italic text-ink-soft sm:text-xl"
            >
              Healthy Birds... Healthy Life...
              <span className="hidden h-px w-16 bg-gradient-to-r from-gold/70 to-transparent sm:block" />
            </motion.p>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.8, ease }}
              className="mt-4 max-w-md text-[0.98rem] leading-relaxed text-ink-soft/90"
            >
              Premium Kadaknath chickens, naturally raised with care at our farm in Bhoshana, Shivli Road.
            </motion.p>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.92, ease }}
              className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4"
            >
              <a href="#about" className="btn btn-primary group">
                Know More
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.8} />
              </a>
              <button type="button" onClick={onWatch} className="btn btn-outline group">
                <span className="relative flex h-7 w-7 items-center justify-center rounded-full border border-forest/40 transition-colors duration-300 group-hover:bg-forest group-hover:text-cream">
                  <Play className="ml-0.5 h-3 w-3" strokeWidth={2} fill="currentColor" />
                </span>
                Watch Video
              </button>
            </motion.div>

            {/* feature strip */}
            <motion.ul
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.05 }}
              className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-4 border-t border-ink/10 pt-5 sm:gap-x-7"
            >
              {heroBadges.map((badge, i) => {
                const Icon = icons[badge.icon]
                return (
                  <li key={badge.label} className={`flex items-center gap-2.5 ${i > 0 ? 'sm:border-l sm:border-ink/10 sm:pl-6' : ''}`}>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest/8 text-forest">
                      <Icon className="h-4 w-4" strokeWidth={1.7} />
                    </span>
                    <span className="leading-tight">
                      <span className="block text-[0.78rem] font-medium text-ink">{badge.label}</span>
                      <span className="block text-[0.72rem] text-ink-soft/75">{badge.sub}</span>
                    </span>
                  </li>
                )
              })}
            </motion.ul>
          </motion.div>

          {/* ── Image ── */}
          <motion.div style={{ y: imageY }} className="relative mx-auto w-full max-w-[520px] lg:max-w-none">
            <motion.div
              initial={reduce ? false : { opacity: 0, scale: 1.04, clipPath: 'inset(14% 9% 14% 9%)' }}
              animate={{ opacity: 1, scale: 1, clipPath: 'inset(0% 0% 0% 0%)' }}
              transition={{ duration: 1.5, delay: 0.2, ease }}
              className="relative"
            >
              <div className="absolute -inset-2.5 rounded-[26px] border border-gold/35 sm:-inset-4" />
              <div className="absolute -inset-5 rounded-[34px] border border-gold/15 sm:-inset-7" />
              <div className="relative overflow-hidden rounded-[22px] bg-parchment-deep shadow-[0_40px_80px_-40px_rgba(48,32,10,.75)]">
                <img
                  src="/images/hero-pair.jpg"
                  alt="A Kadaknath rooster and hen standing together at the farm, with a young chick nearby"
                  width="1280"
                  height="1055"
                  fetchPriority="high"
                  decoding="async"
                  className="h-[360px] w-full object-cover object-center sm:h-[460px] lg:h-[540px] xl:h-[580px]"
                />
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(to top, rgba(28,20,8,.42) 0%, rgba(28,20,8,0) 38%), radial-gradient(120% 80% at 50% 0%, rgba(255,246,224,.22), transparent 55%)',
                  }}
                />
                <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
                  <p className="font-serif text-[0.78rem] italic tracking-wide text-cream/85 drop-shadow">
                    Raised on open ground · Bhoshana
                  </p>
                  <span className="rounded-full border border-cream/35 bg-black/20 px-2.5 py-1 text-[0.55rem] tracking-[0.18em] text-cream/85 uppercase backdrop-blur-sm">
                    Pure breed
                  </span>
                </div>
              </div>
            </motion.div>

            {/* premium badge */}
            <motion.div                initial={reduce ? false : { opacity: 0, scale: 0.85, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: -3 }}
              transition={{ duration: 0.9, delay: 0.85, ease }}
              className="absolute -left-2 -top-4 z-20 w-[126px] sm:-left-7 sm:-top-7 sm:w-[150px]"
            >
              <div className="relative">
                <svg viewBox="0 0 160 120" className="absolute inset-0 h-full w-full text-cream-soft drop-shadow-[0_10px_20px_rgba(60,42,16,.28)]" aria-hidden="true">
                  <path
                    d="M8 12c26-6 50-6 74-4 26 2 52 4 70 8-4 26-6 52-8 74-2 10-4 18-6 24-24 4-48 6-72 6-20 0-40-2-58-6 4-22 2-46 0-68-1-12-1-24 0-34Z"
                    fill="currentColor"
                    stroke="rgba(176,138,69,.55)"
                    strokeWidth="1"
                  />
                </svg>
                <div className="relative px-4 py-4 text-center">
                  <Star className="mx-auto mb-1.5 h-3 w-3 text-gold" fill="currentColor" strokeWidth={0} />
                  <p className="font-display text-[0.8rem] leading-tight text-ink sm:text-[0.92rem]">India’s Premium</p>
                  <p className="font-display text-[0.8rem] leading-tight text-forest sm:text-[0.92rem]">Kadaknath</p>
                  <p className="mt-1 label-caps text-[0.5rem] text-clay sm:text-[0.54rem]">Farm</p>
                </div>
              </div>
            </motion.div>

            {/* botanical accents */}
            <Branch className="pointer-events-none absolute -bottom-10 -left-8 h-40 w-auto rotate-180 text-forest/25 sm:h-52" flip />
            <motion.div
              animate={reduce ? undefined : { rotate: [-2, 2, -2] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
              className="pointer-events-none absolute -right-2 bottom-10 hidden text-gold/55 sm:block"
            >
              <Sprig className="h-5 w-24 rotate-[-18deg]" />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* torn paper bottom edge */}
      <div className="pointer-events-none absolute inset-x-0 -bottom-px h-10 sm:h-14" aria-hidden="true">
        <svg viewBox="0 0 1440 48" preserveAspectRatio="none" className="h-full w-full text-cream-soft">
          <path d="M0 48V22c92 8 184-6 276-2s182 12 274 8 184-14 276-10 182 14 274 10 182-12 274-8v28z" fill="currentColor" />
        </svg>
      </div>
    </section>
  )
}
