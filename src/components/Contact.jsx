import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { MapPin, Phone, Mail, Send, CheckCircle2, ArrowUpRight } from 'lucide-react'
import { Reveal, SectionHeading } from './ui/Primitives'
import WhatsAppIcon from './ui/WhatsAppIcon'
import { Facebook, Instagram, Youtube } from './ui/BrandIcons'
import { farm } from '../data/site'
import { whatsappLink, defaultEnquiry } from '../lib/links'

const socialIcons = { facebook: Facebook, instagram: Instagram, youtube: Youtube }

const emptyForm = { name: '', phone: '', message: '' }

export default function Contact() {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)
  const reduce = useReducedMotion()

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    setErrors((err) => ({ ...err, [field]: undefined }))
    if (sent) setSent(false)
  }

  const validate = () => {
    const next = {}
    if (form.name.trim().length < 2) next.name = 'Please tell us your name.'
    if (form.phone.replace(/\D/g, '').length < 10) next.phone = 'Please enter a 10-digit mobile number.'
    if (form.message.trim().length < 10) next.message = 'Please add a few words about your enquiry.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const composed = `Hello ${farm.name},\n\nName: ${form.name}\nPhone: ${form.phone}\n\n${form.message}`

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    // The enquiry is handed to WhatsApp so the farm receives it immediately.
    window.open(whatsappLink(composed), '_blank', 'noopener,noreferrer')
    setSent(true)
  }

  return (
    <section id="contact" className="relative scroll-mt-24 overflow-hidden bg-cream-soft py-16 sm:py-20 lg:py-24">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(60% 60% at 20% 0%, rgba(255,255,252,.85), transparent 60%)' }}
      />

      <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8">
        <SectionHeading
          eyebrow="We are always happy to hear from you"
          title="Contact Us"
          subtitle="Call, message or visit the farm — directions are just below."
        />

        <div className="mt-12 grid gap-6 lg:mt-14 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          {/* ── Details + map ── */}
          <div>
            <Reveal y={26}>
              <div className="on-dark relative overflow-hidden rounded-[16px] bg-forest p-6 text-cream shadow-[0_30px_60px_-36px_rgba(19,38,24,.9)] sm:p-8">
                <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay" />
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{ background: 'radial-gradient(90% 70% at 100% 0%, rgba(213,180,120,.28), transparent 60%)' }}
                />
                <div className="relative">
                  <h3 className="font-display text-[1.55rem] text-cream">Get in touch with us</h3>
                  <p className="mt-1 font-serif text-[0.95rem] italic text-parchment/70">
                    Bhoshana · Shivli Road · Uttar Pradesh
                  </p>

                  <ul className="mt-6 space-y-4">
                    <li className="flex gap-3">
                      <MapPin className="mt-0.5 h-4.5 w-4.5 shrink-0 text-gold-soft" strokeWidth={1.6} />
                      <div>
                        <p className="text-[0.68rem] tracking-[0.18em] text-parchment/50 uppercase">Farm address</p>
                        <p className="mt-0.5 text-[0.92rem] leading-relaxed text-cream/90">
                          {farm.address.line1}
                          <br />
                          {farm.address.line2}
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <Phone className="mt-0.5 h-4.5 w-4.5 shrink-0 text-gold-soft" strokeWidth={1.6} />
                      <div>
                        <p className="text-[0.68rem] tracking-[0.18em] text-parchment/50 uppercase">Call us</p>
                        <a href={`tel:${farm.phoneHref}`} className="mt-0.5 block text-[0.92rem] text-cream/90 hover:text-gold-soft">
                          {farm.phone}
                        </a>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <WhatsAppIcon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-gold-soft" />
                      <div>
                        <p className="text-[0.68rem] tracking-[0.18em] text-parchment/50 uppercase">WhatsApp</p>
                        <a
                          href={whatsappLink(defaultEnquiry)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-0.5 inline-flex items-center gap-1 text-[0.92rem] text-cream/90 hover:text-gold-soft"
                        >
                          Message the farm <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
                        </a>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <Mail className="mt-0.5 h-4.5 w-4.5 shrink-0 text-gold-soft" strokeWidth={1.6} />
                      <div>
                        <p className="text-[0.68rem] tracking-[0.18em] text-parchment/50 uppercase">E-mail</p>
                        <a href={`mailto:${farm.email}`} className="mt-0.5 block break-all text-[0.92rem] text-cream/90 hover:text-gold-soft">
                          {farm.email}
                        </a>
                      </div>
                    </li>
                  </ul>

                  <div className="mt-7 flex items-center gap-3 border-t border-cream/15 pt-5">
                    <span className="text-[0.68rem] tracking-[0.18em] text-parchment/50 uppercase">Follow</span>
                    {farm.socials.map((social) => {
                      const Icon = socialIcons[social.icon]
                      return (
                        <a
                          key={social.label}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={social.label}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-cream/20 text-cream/80 transition-colors hover:border-gold/60 hover:bg-gold/15 hover:text-gold-soft"
                        >
                          <Icon className="h-3.5 w-3.5" strokeWidth={1.7} />
                        </a>
                      )
                    })}
                  </div>
                </div>
              </div>
            </Reveal>

          </div>

          {/* ── Form ── */}
          <Reveal y={26} delay={0.12}>
            <div className="card-paper relative overflow-hidden rounded-[16px] p-6 sm:p-8">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
              <h3 className="font-display text-[1.55rem] text-ink">Send us a message</h3>
              <p className="mt-1.5 text-[0.86rem] leading-relaxed text-ink-soft/75">
                Fill this in and it opens WhatsApp with your message ready to send — the quickest way to reach the farm.
              </p>

              {sent ? (
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-7 rounded-[12px] border border-forest/20 bg-forest/6 p-5 text-center"
                  role="status"
                  aria-live="polite"
                >
                  <CheckCircle2 className="mx-auto h-8 w-8 text-forest" strokeWidth={1.5} />
                  <p className="mt-3 font-display text-[1.1rem] text-ink">Your message is ready in WhatsApp</p>
                  <p className="mx-auto mt-1.5 max-w-sm text-[0.84rem] leading-relaxed text-ink-soft/80">
                    Press send there and we will reply as soon as we can. If nothing opened, use the buttons below.
                  </p>
                  <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
                    <a
                      href={whatsappLink(composed)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary !py-2.5 text-[0.8rem]"
                    >
                      <WhatsAppIcon className="h-4 w-4" /> Open WhatsApp
                    </a>
                    <a
                      href={`mailto:${farm.email}?subject=${encodeURIComponent('Enquiry from the website')}&body=${encodeURIComponent(composed)}`}
                      className="btn btn-outline !py-2.5 text-[0.8rem]"
                    >
                      <Mail className="h-4 w-4" strokeWidth={1.7} /> Send by e-mail
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSent(false)
                      setForm(emptyForm)
                    }}
                    className="mt-4 text-[0.78rem] text-ink-soft/70 underline decoration-gold/50 underline-offset-4 hover:text-forest"
                  >
                    Write another message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                  <Field label="Your name" error={errors.name} htmlFor="name">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={form.name}
                      onChange={update('name')}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full rounded-[10px] border border-ink/15 bg-cream/60 px-4 py-3 text-[0.92rem] text-ink outline-none transition-colors placeholder:text-ink-soft/40 focus:border-forest/60 focus:bg-cream"
                    />
                  </Field>

                  <Field label="Your mobile number" error={errors.phone} htmlFor="phone">
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={update('phone')}
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={errors.phone ? 'phone-error' : undefined}
                      placeholder="10-digit mobile number"
                      className="w-full rounded-[10px] border border-ink/15 bg-cream/60 px-4 py-3 text-[0.92rem] text-ink outline-none transition-colors placeholder:text-ink-soft/40 focus:border-forest/60 focus:bg-cream"
                    />
                  </Field>

                  <Field label="Your message" error={errors.message} htmlFor="message">
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={form.message}
                      onChange={update('message')}
                      aria-invalid={Boolean(errors.message)}
                      aria-describedby={errors.message ? 'message-error' : undefined}
                      placeholder="Which birds are you interested in? How many, and when?"
                      className="w-full resize-none rounded-[10px] border border-ink/15 bg-cream/60 px-4 py-3 text-[0.92rem] leading-relaxed text-ink outline-none transition-colors placeholder:text-ink-soft/40 focus:border-forest/60 focus:bg-cream"
                    />
                  </Field>

                  <button type="submit" className="btn btn-primary group w-full">
                    <Send className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.8} />
                    Send message
                  </button>
                  <p className="text-center text-[0.72rem] leading-relaxed text-ink-soft/60">
                    No account needed. Your details are only used to reply to this enquiry.
                  </p>
                </form>
              )}
            </div>
          </Reveal>
        </div>

        <Reveal y={26} delay={0.08}>
          <div className="mt-6 overflow-hidden rounded-[16px] border border-gold/25 bg-cream shadow-[0_20px_50px_-34px_rgba(60,42,16,.7)]">
            <div className="relative aspect-[16/7] w-full bg-parchment-deep">
              <iframe
                title="Kadaknath Poultry Farm on Google Maps — Bhoshana, Shivli Road, Uttar Pradesh"
                src={farm.mapEmbed}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full border-0"
                style={{ filter: 'sepia(0.18) saturate(0.85) contrast(0.95) brightness(1.02)' }}
                allowFullScreen
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <p className="font-serif text-[0.85rem] italic text-ink-soft/85">Find us on map</p>
              <a
                href={farm.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[0.76rem] font-medium text-forest hover:text-gold"
              >
                View on Google Maps <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function Field({ label, htmlFor, error, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[0.72rem] font-medium tracking-[0.12em] text-ink-soft/80 uppercase">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${htmlFor}-error`} className="mt-1.5 text-[0.75rem] text-[#9c3b2a]">
          {error}
        </p>
      )}
    </div>
  )
}
