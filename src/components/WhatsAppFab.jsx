import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import WhatsAppIcon from './ui/WhatsAppIcon'
import { whatsappLink, defaultEnquiry } from '../lib/links'

export default function WhatsAppFab() {
  const [show, setShow] = useState(false)
  const reduce = useReducedMotion()

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 520)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.a
          href={whatsappLink(defaultEnquiry)}
          target="_blank"
          rel="noopener noreferrer"
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 12 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="group fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[#1f7a4d] py-3 pl-3.5 pr-4 text-cream shadow-[0_16px_34px_-14px_rgba(15,60,38,.9)] sm:bottom-7 sm:right-7"
          aria-label="Chat with Kadaknath Poultry Farm on WhatsApp"
        >
          <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#1f7a4d]/30 [animation-duration:3.2s]" aria-hidden="true" />
          <WhatsAppIcon className="h-5 w-5" />
          <span className="max-w-0 overflow-hidden text-[0.82rem] font-medium whitespace-nowrap opacity-0 transition-all duration-400 group-hover:max-w-40 group-hover:opacity-100">
            Chat with us
          </span>
        </motion.a>
      )}
    </AnimatePresence>
  )
}
