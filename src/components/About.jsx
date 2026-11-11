import { useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, MapPin, Feather, Sprout } from 'lucide-react'
import { Reveal, SectionHeading, Stagger, StaggerItem } from './ui/Primitives'
import { Branch, Sprig } from './ui/Botanical'
import Scene3D from './ui/Scene3D'

const ease = [0.22, 1, 0.36, 1]

export default function About() {
  const [expanded, setExpanded] = useState(false)
  const reduce = useReducedMotion()
  const photoTrack = useRef(null)
  const { scrollYProgress: photoProgress } = useScroll({
    target: photoTrack,
    offset: ['start end', 'end start'],
  })
  const photoY = useTransform(photoProgress, [0, 1], [18, reduce ? 18 : -18])

  return (
    <section id="about" className="relative scroll-mt-24 overflow-hidden bg-cream-soft py-16 sm:py-20 lg:py-24">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(60% 50% at 15% 0%, rgba(255,255,252,.9), transparent 60%)' }}
      />
      <Branch
        className="pointer-events-none absolute -right-16 top-6 h-52 w-auto rotate-12 text-forest/12 blur-[3px] [animation:branch-sway_15s_ease-in-out_infinite] sm:h-64"
        flip
      />

      <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8">
        <SectionHeading
          eyebrow="A family farm in Bhoshana"
          title="About Our Farm"
          subtitle="A quiet stretch of Shivli Road, a flock of pure Kadaknath birds, and the everyday care that keeps them well."
        />

        <div className="mt-12 grid items-center gap-10 lg:mt-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          {/* ── Photo ── */}
          <div ref={photoTrack} className="relative mx-auto w-full max-w-[540px]">
            <Reveal y={36}>
              <motion.div style={{ y: photoY }} className="relative">
                <Scene3D
                  variant="framed"
                  fallback={
                    <figure className="overflow-hidden rounded-[10px] border border-ink/10 bg-cream shadow-[0_30px_60px_-38px_rgba(48,32,10,.7)]">
                      <img
                        src="/images/hen.jpg"
                        alt="A pure black Kadaknath hen standing in the farm run at Bhoshana"
                        width="1280"
                        height="960"
                        loading="lazy"
                        decoding="async"
                        className="h-[280px] w-full object-cover sm:h-[360px] lg:h-[400px]"
                      />
                    </figure>
                  }
                />

                <div className="relative mt-4 flex items-center justify-between gap-3 px-1">
                  <span className="font-serif text-[0.95rem] italic text-ink-soft">Our farm · Bhoshana</span>
                  <span className="flex items-center gap-1.5 text-[0.68rem] tracking-wide text-clay">
                    <Feather className="h-3.5 w-3.5" strokeWidth={1.6} /> Pure breed
                  </span>
                </div>

                <motion.div
                  animate={reduce ? undefined : { rotate: [-1.5, 1.5, -1.5] }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -bottom-6 -left-3 hidden text-gold/50 sm:block"
                >
                  <Sprig className="h-5 w-20" />
                </motion.div>
              </motion.div>
            </Reveal>
          </div>

          {/* ── Copy ── */}
          <div className="relative">
            <Reveal delay={0.05}>
              <h3 className="font-display text-[1.6rem] leading-snug text-ink sm:text-[1.85rem]">
                Raised slowly, on open ground, the way the breed deserves.
              </h3>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="mt-5 text-[0.97rem] leading-[1.75] text-ink-soft/90">
                We, at Kadaknath Poultry Farm, are committed to providing high-quality Kadaknath chickens, known for
                their unique black meat, rich nutrition and excellent health benefits. Our farm is located at Bhoshana,
                Shivli Road, where we follow natural and hygienic farming practices.
              </p>
            </Reveal>

            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  animate={reduce ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                  exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.55, ease }}
                  className="overflow-hidden"
                >
                  <p className="mt-4 text-[0.97rem] leading-[1.75] text-ink-soft/90">
                    The birds are kept in clean, well-ventilated sheds with fresh bedding and clean water, and they are
                    checked daily for health and behaviour. We keep our own breeding stock so that every chick and bird
                    we send out carries the true Kadaknath character — black plumage, dark skin and the slow-grown
                    quality that gives the breed its name.
                  </p>
                  <p className="mt-4 text-[0.97rem] leading-[1.75] text-ink-soft/90">
                    Whether you are looking for live birds for the table, chicks to start your own flock, or fresh eggs,
                    you deal directly with the farm — no middlemen, and someone always available to answer questions
                    about rearing.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <Reveal delay={0.18}>
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                className="btn btn-primary mt-7 group"
              >
                {expanded ? 'Read Less' : 'Read More'}
                <ArrowRight
                  className={`h-4 w-4 transition-transform duration-300 ${expanded ? '-rotate-90' : 'group-hover:translate-x-1'}`}
                  strokeWidth={1.8}
                />
              </button>
            </Reveal>

            <Stagger delay={0.2} className="mt-9 grid gap-4 border-t border-ink/10 pt-6 sm:grid-cols-3">
              {[
                { icon: MapPin, label: 'Bhoshana', sub: 'Shivli Road, U.P.' },
                { icon: Feather, label: 'Pure Kadaknath', sub: 'Own breeding stock' },
                { icon: Sprout, label: 'Natural care', sub: 'Clean, open sheds' },
              ].map((item) => (
                <StaggerItem key={item.label} className="flex items-start gap-2.5">
                  <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-forest" strokeWidth={1.7} />
                  <span className="leading-tight">
                    <span className="block text-[0.82rem] font-medium text-ink">{item.label}</span>
                    <span className="block text-[0.74rem] text-ink-soft/75">{item.sub}</span>
                  </span>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </div>
    </section>
  )
}
