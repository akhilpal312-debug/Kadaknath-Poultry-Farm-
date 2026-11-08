import { Quote, Star } from 'lucide-react'
import { Reveal, SectionHeading, Stagger, StaggerItem } from './ui/Primitives'
import WhatsAppIcon from './ui/WhatsAppIcon'
import { testimonials } from '../data/site'
import { whatsappLink } from '../lib/links'

export default function Testimonials() {
  return (
    <section id="testimonials" className="grain relative overflow-hidden bg-parchment py-16 sm:py-20 lg:py-24">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(70% 60% at 50% 0%, rgba(255,253,246,.7), transparent 60%), radial-gradient(70% 60% at 0% 100%, rgba(168,137,86,.18), transparent 65%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1240px] px-5 sm:px-8">
        <SectionHeading eyebrow="In their words" title="What Our Customers Say" />

        <Reveal delay={0.08}>
          <p className="mx-auto mt-4 max-w-xl text-center text-[0.85rem] leading-relaxed text-ink-soft/75">
            These cards are sample placeholders. Real, verified customer reviews will appear here as soon as the farm
            collects them — we never publish invented testimonials.
          </p>
        </Reveal>

        <Stagger className="mt-11 grid gap-5 md:grid-cols-3" gap={0.1}>
          {testimonials.map((review, i) => (
            <StaggerItem key={i} className="h-full">
              <figure className="card-paper relative flex h-full flex-col rounded-[14px] p-6 sm:p-7">
                <span className="absolute right-5 top-5 rounded-full border border-gold/40 bg-gold/8 px-2.5 py-0.5 text-[0.55rem] font-medium tracking-[0.18em] text-clay uppercase">
                  Sample
                </span>
                <Quote className="h-7 w-7 text-gold/35" strokeWidth={1.4} />
                <blockquote className="mt-4 flex-1 text-[0.95rem] leading-relaxed text-ink-soft/90 italic">
                  “{review.quote}”
                </blockquote>
                <figcaption className="mt-6 flex items-center justify-between gap-3 border-t border-ink/10 pt-4">
                  <div>
                    <p className="text-[0.86rem] font-medium text-ink">{review.author}</p>
                    <p className="text-[0.72rem] text-ink-soft/65">{review.meta}</p>
                  </div>
                  <div className="flex gap-0.5 text-gold/45" aria-hidden="true">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="h-3 w-3" fill="currentColor" strokeWidth={0} />
                    ))}
                  </div>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.15}>
          <div className="mt-9 flex flex-col items-center gap-3">
            <p className="text-[0.82rem] text-ink-soft/75">Bought birds from us? We would love to hear how they are doing.</p>
            <a
              href={whatsappLink('Hello Kadaknath Poultry Farm, I would like to share a review of the birds I bought from you.')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline !py-2.5 text-[0.82rem]"
            >
              <WhatsAppIcon className="h-4 w-4" /> Share your experience
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
