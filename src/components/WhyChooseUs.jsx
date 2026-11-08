import { motion, useReducedMotion } from 'framer-motion'
import { Feather, BadgeCheck, Sparkles, HeartHandshake, Award, ArrowUpRight } from 'lucide-react'
import { SectionHeading, Stagger, StaggerItem } from './ui/Primitives'
import WhatsAppIcon from './ui/WhatsAppIcon'
import { Sprig } from './ui/Botanical'
import { features } from '../data/site'
import { whatsappLink, defaultEnquiry } from '../lib/links'

const icons = {
  feather: Feather,
  badge: BadgeCheck,
  sparkles: Sparkles,
  'heart-handshake': HeartHandshake,
  award: Award,
}

export default function WhyChooseUs() {
  const reduce = useReducedMotion()

  return (
    <section id="why-choose-us" className="grain relative scroll-mt-24 overflow-hidden bg-parchment py-16 sm:py-20 lg:py-24">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(70% 60% at 50% 0%, rgba(255,253,246,.75), transparent 62%), radial-gradient(80% 60% at 100% 100%, rgba(168,137,86,.22), transparent 65%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1240px] px-5 sm:px-8">
        <SectionHeading
          eyebrow="Our promise to you"
          title="Why Choose Us"
          subtitle="Five things we hold ourselves to, every single day of the season."
        />

        <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3" gap={0.09}>
          {features.map((feature, index) => {
            const Icon = icons[feature.icon]
            return (
              <StaggerItem key={feature.title}>
                <motion.article
                  whileHover={reduce ? undefined : { y: -6 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="group card-paper relative h-full overflow-hidden rounded-[14px] p-6 sm:p-7"
                >
                  <span className="label-caps absolute right-5 top-5 text-[0.6rem] text-gold/50">
                    0{index + 1}
                  </span>

                  <span className="relative flex h-12 w-12 items-center justify-center rounded-full border border-forest/20 bg-forest/10 text-forest transition-all duration-500 group-hover:border-forest group-hover:bg-forest group-hover:text-cream">
                    <Icon className="h-5 w-5" strokeWidth={1.6} />
                  </span>

                  <h3 className="relative mt-5 font-display text-[1.18rem] leading-snug text-ink">{feature.title}</h3>
                  <p className="relative mt-2.5 text-[0.88rem] leading-relaxed text-ink-soft/85">{feature.text}</p>

                  <span className="absolute inset-x-6 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-gold/60 to-transparent transition-transform duration-500 group-hover:scale-x-100" />
                </motion.article>
              </StaggerItem>
            )
          })}

          {/* Farm visit card */}
          <StaggerItem>
            <article className="relative flex h-full flex-col justify-between overflow-hidden rounded-[14px] bg-forest p-6 text-cream shadow-[0_24px_50px_-30px_rgba(19,38,24,.9)] sm:p-7">
              <div
                className="pointer-events-none absolute inset-0 opacity-30"
                style={{ background: 'radial-gradient(90% 70% at 100% 0%, rgba(213,180,120,.5), transparent 60%)' }}
              />
              <div className="relative">
                <Sprig className="h-5 w-24 text-gold-soft/70" />
                <h3 className="mt-4 font-display text-[1.35rem] leading-snug text-cream">
                  Come and see the flock for yourself.
                </h3>
                <p className="mt-2.5 text-[0.88rem] leading-relaxed text-parchment/75">
                  Message us to arrange a farm visit on Shivli Road — we are always happy to talk birds.
                </p>
              </div>
              <a
                href={whatsappLink(defaultEnquiry)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-gold relative mt-6 w-full !py-2.5 text-[0.82rem]"
              >
                <WhatsAppIcon className="h-4 w-4" /> Arrange a visit
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
              </a>
            </article>
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  )
}
