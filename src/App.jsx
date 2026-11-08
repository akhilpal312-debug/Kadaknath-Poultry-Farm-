import { useCallback, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Loader from './components/Loader'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import WhyChooseUs from './components/WhyChooseUs'
import Products from './components/Products'
import Heritage from './components/Heritage'
import Gallery from './components/Gallery'
import Testimonials from './components/Testimonials'
import Contact from './components/Contact'
import Footer from './components/Footer'
import WhatsAppFab from './components/WhatsAppFab'
import VideoModal from './components/VideoModal'

export default function App() {
  const [loading, setLoading] = useState(true)
  const [watching, setWatching] = useState(false)

  const finishLoading = useCallback(() => setLoading(false), [])
  const closeVideo = useCallback(() => setWatching(false), [])

  return (
    <>
      <a
        href="#home"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded-full focus:bg-forest focus:px-5 focus:py-2.5 focus:text-sm focus:text-cream"
      >
        Skip to content
      </a>

      <AnimatePresence>{loading && <Loader key="loader" onDone={finishLoading} />}</AnimatePresence>

      <Navbar />

      <main>
        <Hero onWatch={() => setWatching(true)} />
        <About />
        <WhyChooseUs />
        <Products />
        <Heritage />
        <Gallery />
        <Testimonials />
        <Contact />
      </main>

      <Footer />
      <WhatsAppFab />

      <AnimatePresence>{watching && <VideoModal key="video" onClose={closeVideo} />}</AnimatePresence>
    </>
  )
}
