import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Crown } from 'lucide-react'
import { Reveal, SplitHeading } from './ui/Primitives'

export default function Heritage() {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [40, reduce ? 40 : -40])

  return (
    <section
      ref={ref}
      className="on-dark relative overflow-hidden bg-forest-deep text-cream"
      aria-labelledby="heritage-title"
    >
      <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-overlay" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(80% 100% at 10% 0%, rgba(44,83,64,.85), transparent 60%), radial-gradient(70% 90% at 95% 100%, rgba(176,138,69,.22), transparent 60%)',
        }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

      <div className="relative mx-auto grid max-w-[1320px] items-center gap-8 px-5 py-14 sm:px-8 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:py-20">
        <div className="relative z-10">
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/45 text-gold-soft">
                <Crown className="h-4 w-4" strokeWidth={1.6} />
              </span>
              <span className="label-caps text-[0.6rem] text-gold-soft/80">A heritage breed</span>
            </div>
          </Reveal>

          <h2 id="heritage-title" className="mt-5 font-display text-[2.1rem] leading-[1.05] text-cream sm:text-[2.9rem] lg:text-[3.3rem]">
            <SplitHeading text="The Black Jewel" />
            <span className="mt-1 block text-gold-soft">
              <SplitHeading text="of India" delay={0.1} />
            </span>
          </h2>

          <Reveal delay={0.15}>
            <p className="mt-4 font-serif text-lg italic text-parchment/85 sm:text-xl">Kadaknath — A Heritage Breed.</p>
          </Reveal>

          <Reveal delay={0.22}>
            <p className="mt-5 max-w-lg text-[0.95rem] leading-[1.8] text-parchment/70">
              Prized across India for its jet-black plumage, dark flesh and distinctive flavour, the Kadaknath is one of
              our country’s most treasured native birds. We raise ours with the patience a heritage breed asks for —
              slowly, and close to home.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a href="#about" className="btn btn-gold group">
                Know More
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.8} />
              </a>
              <span className="hidden h-px w-24 bg-gradient-to-r from-gold-soft/50 to-transparent sm:block" />
            </div>
          </Reveal>
        </div>

        {/* Framed rooster portrait */}
        <motion.div style={{ y }} className="relative mx-auto w-full max-w-[320px] sm:max-w-[360px] lg:max-w-[380px]">
          <div className="relative rotate-[1.5deg]">
            <div className="absolute -inset-2.5 rounded-[10px] border border-gold/35" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-[8px] bg-forest shadow-[0_30px_70px_-30px_rgba(0,0,0,.85)]">
              <img
                src="/images/rooster-portrait.webp"
                alt="Portrait of a Kadaknath rooster showing its dark comb, black plumage and deep red wattle"
                width="1500"
                height="1500"
                loading="lazy"
                decoding="async"
                className="aspect-[4/5] w-full object-cover object-center"
              />
              <div
                className="pointer-events-none absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(19,38,24,.55), transparent 45%)' }}
              />
              <p className="absolute bottom-3 left-4 font-serif text-[0.78rem] italic text-parchment/75">
                Kadaknath rooster · our bloodline
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
