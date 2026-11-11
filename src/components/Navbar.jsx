import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion'
import { Menu, X, Phone } from 'lucide-react'
import RoosterMark from './ui/RoosterMark'
import WhatsAppIcon from './ui/WhatsAppIcon'
import { farm, navLinks } from '../data/site'
import { whatsappLink, defaultEnquiry } from '../lib/links'

const ease = [0.22, 1, 0.36, 1]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('#home')
  const [tucked, setTucked] = useState(false)
  const reduce = useReducedMotion()
  const { scrollY } = useScroll()

  // Glide the bar away as the reader moves down, bring it back on the way up.
  useMotionValueEvent(scrollY, 'change', (y) => {
    const previous = scrollY.getPrevious() ?? 0
    setTucked(y > 180 && y > previous)
  })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const ids = navLinks.map((l) => l.href.slice(1))
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean)
    if (!sections.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(`#${visible.target.id}`)
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: [0, 0.2, 0.6] },
    )
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <motion.header
        animate={{ y: tucked && !open ? '-105%' : '0%' }}
        transition={reduce ? { duration: 0 } : { duration: 0.55, ease }}
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-500 ${
          scrolled
            ? 'bg-cream-soft/92 shadow-[0_10px_30px_-24px_rgba(60,42,16,.7)] backdrop-blur-md'
            : 'bg-transparent'
        }`}
      >
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-0 h-px transition-opacity duration-500 ${
            scrolled ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ background: 'linear-gradient(90deg, transparent, rgba(176,138,69,.45), transparent)' }}
        />
        <nav
          aria-label="Main navigation"
          className="mx-auto flex h-[74px] max-w-[1320px] items-center justify-between gap-4 px-5 sm:px-8 lg:h-[86px]"
        >
          {/* Brand */}
          <a href="#home" className="group flex items-center gap-2.5 sm:gap-3" aria-label={`${farm.name} — home`}>
            <RoosterMark className="h-9 w-auto shrink-0 text-ink transition-transform duration-500 group-hover:-rotate-3 sm:h-11" />
            <span className="leading-none">
              <span className="block font-display text-[1.15rem] tracking-tight text-ink sm:text-[1.35rem]">Kadaknath</span>
              <span className="mt-1 block label-caps text-[0.6rem] text-forest sm:text-[0.64rem]">Poultry Farm</span>
              <span className="mt-1 hidden font-serif text-[0.7rem] tracking-wide text-ink-soft/70 sm:block">
                Pure • Healthy • Natural
              </span>
            </span>
          </a>

          {/* Desktop links */}
          <ul className="hidden items-center gap-1 lg:flex xl:gap-2">
            {navLinks.map((link) => {
              const isActive = active === link.href
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    aria-current={isActive ? 'true' : undefined}
                    className={`relative block px-3 py-2 text-[0.86rem] font-medium tracking-wide transition-colors duration-300 ${
                      isActive ? 'text-forest' : 'text-ink/80 hover:text-forest'
                    }`}
                  >
                    {link.label}
                    <span
                      className={`absolute inset-x-3 -bottom-0.5 h-px origin-left bg-gold transition-transform duration-400 ${
                        isActive ? 'scale-x-100' : 'scale-x-0'
                      }`}
                    />
                  </a>
                </li>
              )
            })}
          </ul>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={whatsappLink(defaultEnquiry)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary hidden !px-5 !py-2.5 text-[0.82rem] sm:inline-flex"
            >
              <WhatsAppIcon className="h-4 w-4" />
              WhatsApp
            </a>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-forest/25 text-forest transition-colors hover:bg-forest hover:text-cream lg:hidden"
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              <Menu className="h-5 w-5" strokeWidth={1.8} />
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="grain fixed inset-0 z-[60] overflow-y-auto bg-parchment"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease }}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className="relative z-10 flex min-h-full flex-col px-6 pb-10 pt-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <RoosterMark className="h-9 w-auto text-ink" />
                  <span className="leading-none">
                    <span className="block font-display text-lg text-ink">Kadaknath</span>
                    <span className="label-caps mt-1 block text-[0.58rem] text-forest">Poultry Farm</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-forest/25 text-forest transition-colors hover:bg-forest hover:text-cream"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" strokeWidth={1.8} />
                </button>
              </div>

              <ul className="mt-12 space-y-1">
                {navLinks.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={reduce ? false : { opacity: 0, x: -18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + i * 0.06, duration: 0.5, ease }}
                  >
                    <a
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="flex items-baseline gap-3 border-b border-ink/8 py-3.5 font-display text-[1.7rem] text-ink transition-colors hover:text-forest"
                    >
                      <span className="font-sans text-[0.6rem] tracking-[0.2em] text-gold">0{i + 1}</span>
                      {link.label}
                    </a>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-10 space-y-3">
                <a href={whatsappLink(defaultEnquiry)} target="_blank" rel="noopener noreferrer" className="btn btn-primary w-full">
                  <WhatsAppIcon className="h-4 w-4" /> Chat on WhatsApp
                </a>
                <a href={`tel:${farm.phoneHref}`} className="btn btn-outline w-full">
                  <Phone className="h-4 w-4" /> {farm.phone}
                </a>
                <p className="pt-2 text-center font-serif text-sm italic text-ink-soft/75">{farm.address.full}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
