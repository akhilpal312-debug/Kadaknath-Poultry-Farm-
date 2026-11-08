import { MapPin, Phone, Mail } from 'lucide-react'
import RoosterMark from './ui/RoosterMark'
import WhatsAppIcon from './ui/WhatsAppIcon'
import { Facebook, Instagram, Youtube } from './ui/BrandIcons'
import { farm, navLinks, photoCredits } from '../data/site'
import { whatsappLink, defaultEnquiry } from '../lib/links'

const socialIcons = { facebook: Facebook, instagram: Instagram, youtube: Youtube }
const currentYear = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="on-dark relative overflow-hidden bg-[#101c15] text-parchment">
      <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      <div className="relative mx-auto max-w-[1320px] px-5 pt-14 pb-8 sm:px-8 sm:pt-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr_1fr] lg:gap-8">
          {/* Brand */}
          <div>
            <a href="#home" className="flex items-center gap-3" aria-label={`${farm.name} — home`}>
              <RoosterMark className="h-11 w-auto shrink-0 text-gold-soft" />
              <span className="leading-none">
                <span className="block font-display text-[1.3rem] tracking-tight text-cream">Kadaknath</span>
                <span className="mt-1 block label-caps text-[0.58rem] text-gold-soft">Poultry Farm</span>
              </span>
            </a>
            <p className="mt-5 max-w-xs text-[0.86rem] leading-relaxed text-parchment/65">
              Pure Kadaknath chickens, chicks and eggs, raised naturally with care at our farm in Bhoshana, Shivli Road.
            </p>
            <p className="mt-4 font-serif text-[1.05rem] italic text-gold-soft/80">{farm.tagline}</p>
          </div>

          {/* Quick links */}
          <nav aria-label="Footer navigation">
            <h2 className="label-caps text-[0.62rem] text-gold-soft/80">Quick links</h2>
            <ul className="mt-4 space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-[0.86rem] text-parchment/70 transition-colors hover:text-gold-soft"
                  >
                    <span className="h-px w-0 bg-gold transition-all duration-300 group-hover:w-3" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h2 className="label-caps text-[0.62rem] text-gold-soft/80">Get in touch</h2>
            <ul className="mt-4 space-y-3 text-[0.86rem] text-parchment/70">
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold/70" strokeWidth={1.6} />
                <span>
                  {farm.address.line1}, {farm.address.line2}
                </span>
              </li>
              <li className="flex gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-gold/70" strokeWidth={1.6} />
                <a href={`tel:${farm.phoneHref}`} className="hover:text-gold-soft">
                  {farm.phone}
                </a>
              </li>
              <li className="flex gap-2.5">
                <WhatsAppIcon className="h-4 w-4 shrink-0 text-gold/70" />
                <a href={whatsappLink(defaultEnquiry)} target="_blank" rel="noopener noreferrer" className="hover:text-gold-soft">
                  WhatsApp us
                </a>
              </li>
              <li className="flex gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-gold/70" strokeWidth={1.6} />
                <a href={`mailto:${farm.email}`} className="break-words hover:text-gold-soft">
                  {farm.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Social + flourish */}
          <div>
            <h2 className="label-caps text-[0.62rem] text-gold-soft/80">Follow us</h2>
            <div className="mt-4 flex gap-2.5">
              {farm.socials.map((social) => {
                const Icon = socialIcons[social.icon]
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-cream/15 text-parchment/75 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/60 hover:bg-gold/15 hover:text-gold-soft"
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.7} />
                  </a>
                )
              })}
            </div>
            <p className="mt-7 font-serif text-[0.95rem] italic leading-snug text-parchment/55">
              Healthy Birds...
              <br />
              Happy Farmers...
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-cream/10 pt-6">
          <p className="text-[0.74rem] text-parchment/50">
            © {currentYear} {farm.name}. All Rights Reserved. · Located at Bhoshana, Shivli Road, Uttar Pradesh.
          </p>

          <details className="group max-w-lg text-[0.72rem] text-parchment/45">
            <summary className="cursor-pointer list-none text-parchment/55 underline decoration-gold/40 underline-offset-4 hover:text-gold-soft">
              Photo credits
            </summary>
            <div className="mt-3 space-y-2 rounded-[8px] border border-cream/10 bg-black/20 p-3 leading-relaxed">
              <p>{photoCredits.note}</p>
              <ul className="space-y-1">
                {photoCredits.items.map((credit) => (
                  <li key={credit.title}>
                    {credit.title} —{' '}
                    <a href={credit.href} target="_blank" rel="noopener noreferrer" className="text-gold-soft/80 hover:underline">
                      {credit.author}, {credit.licence}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </details>
        </div>
      </div>
    </footer>
  )
}
