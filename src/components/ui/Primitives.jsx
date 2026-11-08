import { motion, useReducedMotion } from 'framer-motion'
import { Sprig } from './Botanical'

const ease = [0.22, 1, 0.36, 1]

/** Fade-and-rise on scroll, disabled when the user prefers reduced motion. */
export function Reveal({ children, delay = 0, y = 30, className = '', as = 'div', amount = 0.3 }) {
  const reduce = useReducedMotion()
  const MotionTag = motion[as] || motion.div
  return (
    <MotionTag
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount, margin: '0px 0px -60px 0px' }}
      transition={{ duration: 0.9, delay, ease }}
    >
      {children}
    </MotionTag>
  )
}

/** Staggered entrance for a group of children. */
export function Stagger({ children, className = '', delay = 0, gap = 0.12 }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: reduce ? 0 : gap, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className = '', y = 26 }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      variants={{
        hidden: reduce ? { opacity: 1 } : { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.85, ease } },
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Words of a heading rising one after another.
 * The scroll trigger sits on the outer (visible) wrapper — the word spans are
 * clipped by `overflow-hidden`, so they can never trigger it themselves.
 */
export function SplitHeading({ text, className = '', delay = 0 }) {
  const reduce = useReducedMotion()
  const words = text.split(' ')
  return (
    <motion.span
      className={`inline-block ${className}`}
      initial={reduce ? false : 'hidden'}
      whileInView={reduce ? undefined : 'show'}
      viewport={{ once: true, amount: 0.25 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: delay } } }}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, i) => (
          <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom">
            <motion.span
              className="inline-block"
              variants={{
                hidden: reduce ? { opacity: 1 } : { y: '110%', opacity: 0 },
                show: { y: '0%', opacity: 1, transition: { duration: 0.95, ease } },
              }}
            >
              {word}
              {i < words.length - 1 ? '\u00A0' : ''}
            </motion.span>
          </span>
        ))}
      </span>
    </motion.span>
  )
}

/** Section title with gold rules and botanical sprigs, as in the reference. */
export function SectionHeading({ eyebrow, title, subtitle, align = 'center', light = false, id }) {
  const centered = align === 'center'
  const titleColour = light ? 'text-cream' : 'text-ink'
  const sprigColour = light ? 'text-gold-soft/70' : 'text-gold/70'

  return (
    <div className={centered ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      {eyebrow && (
        <Reveal>
          <p className={`eyebrow text-lg sm:text-xl ${light ? 'text-gold-soft' : ''}`}>{eyebrow}</p>
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <div className={`mt-1 flex items-center gap-3 sm:gap-5 ${centered ? 'justify-center' : ''}`}>
          <span className={`hidden h-px flex-1 sm:block ${centered ? 'max-w-24' : 'max-w-16'}`} style={{ background: 'linear-gradient(90deg, transparent, rgba(176,138,69,.7))' }} />
          <Sprig className={`hidden h-6 w-24 shrink-0 sm:block ${sprigColour}`} />
          <h2 id={id} className={`font-display text-[2rem] leading-[1.08] sm:text-4xl lg:text-[2.9rem] ${titleColour}`}>
            {title}
          </h2>
          <Sprig flip className={`hidden h-6 w-24 shrink-0 sm:block ${sprigColour}`} />
          <span className={`hidden h-px flex-1 sm:block ${centered ? 'max-w-24' : 'max-w-16'}`} style={{ background: 'linear-gradient(270deg, transparent, rgba(176,138,69,.7))' }} />
        </div>
      </Reveal>
      {subtitle && (
        <Reveal delay={0.12}>
          <p className={`mx-auto mt-4 max-w-xl text-[0.95rem] leading-relaxed ${light ? 'text-parchment/75' : 'text-ink-soft/85'}`}>
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  )
}
