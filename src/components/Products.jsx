import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { Reveal, SectionHeading, Stagger, StaggerItem } from './ui/Primitives'
import WhatsAppIcon from './ui/WhatsAppIcon'
import { products } from '../data/site'
import { whatsappLink, productEnquiry } from '../lib/links'

export default function Products() {
  const reduce = useReducedMotion()

  return (
    <section id="products" className="relative scroll-mt-24 overflow-hidden bg-cream-soft py-16 sm:py-20 lg:py-24">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(65% 55% at 50% 100%, rgba(196,166,116,.18), transparent 65%)' }}
      />

      <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8">
        <SectionHeading
          eyebrow="From our farm to your home"
          title="Our Products"
          subtitle="Premium quality, direct from our farm — live birds, young chicks and fresh eggs."
        />

        <Stagger className="mt-12 grid gap-6 md:grid-cols-2 lg:mt-14 lg:grid-cols-3" gap={0.1}>
          {products.map((product) => (
            <StaggerItem key={product.id} className="h-full">
              <motion.article
                whileHover={reduce ? undefined : { y: -8 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="group card-paper flex h-full flex-col overflow-hidden rounded-[16px]"
              >
                <div className="relative overflow-hidden">
                  <div className="aspect-[4/3] w-full overflow-hidden bg-parchment-deep">
                    <img
                      src={product.image}
                      alt={product.alt}
                      width="1200"
                      height="900"
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.06]"
                    />
                  </div>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1a1206]/35 via-transparent to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full border border-cream/40 bg-cream/85 px-3 py-1 text-[0.62rem] font-medium tracking-[0.14em] text-forest uppercase backdrop-blur-sm">
                    {product.price}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <p className="font-serif text-[0.95rem] italic text-clay">{product.kicker}</p>
                  <h3 className="mt-1 font-display text-[1.5rem] leading-tight text-ink">{product.name}</h3>
                  <p className="mt-2.5 flex-1 text-[0.88rem] leading-relaxed text-ink-soft/85">{product.text}</p>

                  <div className="mt-5 flex items-center gap-2">
                    <a
                      href={whatsappLink(productEnquiry(product.enquiry))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary flex-1 !px-4 !py-2.5 text-[0.82rem]"
                    >
                      <WhatsAppIcon className="h-4 w-4" /> Enquire now
                    </a>
                    <a
                      href="#contact"
                      aria-label={`Contact the farm about ${product.name}`}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-forest/25 text-forest transition-all duration-300 hover:bg-forest hover:text-cream"
                    >
                      <ArrowUpRight className="h-4 w-4" strokeWidth={1.8} />
                    </a>
                  </div>
                </div>
              </motion.article>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.1}>
          <p className="mt-8 text-center text-[0.8rem] text-ink-soft/70">
            Prices vary with age, weight and season — send us a message for today’s rate and availability.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
