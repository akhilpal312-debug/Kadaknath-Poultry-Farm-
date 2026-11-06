import React, { useEffect, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { doc, getDoc } from 'firebase/firestore';
import {
  DEFAULT_FARM_CONTACT,
  FarmContactConfig,
} from './data/farmData';
import { db } from './firebase';
import { Preloader } from './components/Preloader';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutAndWhySection } from './components/AboutAndWhySection';
import { ProductsAndBannerSection } from './components/ProductsAndBannerSection';
import { GalleryAndTestimonialsSection } from './components/GalleryAndTestimonialsSection';
import { ContactAndFooterSection } from './components/ContactAndFooterSection';
import { WhatsAppEnquiryDrawer } from './components/WhatsAppEnquiryDrawer';
import { FarmDioramaModal } from './components/FarmDioramaModal';

export function App() {
  const [showPreloader, setShowPreloader] = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  const [contact, setContact] =
    useState<FarmContactConfig>(DEFAULT_FARM_CONTACT);

  const [whatsAppDrawer, setWhatsAppDrawer] = useState<{
    open: boolean;
    productId?: 'chickens' | 'chicks' | 'eggs';
  }>({ open: false });

  const [dioramaModal, setDioramaModal] = useState<{
    open: boolean;
    initialTab: '3d' | 'story';
  }>({ open: false, initialTab: '3d' });

  // Remove any legacy placeholder storage and sync persisted farm settings from Firestore if present
  useEffect(() => {
    try {
      localStorage.removeItem('kadaknath_farm_contact_v1');
    } catch {
      // Ignore storage errors
    }

    let cancelled = false;
    const loadPublicSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'publicContact'));
        if (!cancelled && snap.exists()) {
          const data = snap.data();
          setContact((prev) => ({
            ...prev,
            phoneDisplay:
              typeof data.phoneDisplay === 'string' && data.phoneDisplay.trim()
                ? data.phoneDisplay.trim()
                : prev.phoneDisplay,
            whatsappDigits:
              typeof data.whatsappDigits === 'string' &&
              data.whatsappDigits.trim()
                ? data.whatsappDigits.trim()
                : prev.whatsappDigits,
            email: typeof data.email === 'string' ? data.email.trim() : '',
          }));
        }
      } catch {
        // Default verified farm contact remains active if settings doc does not exist yet
      }
    };

    void loadPublicSettings();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const sectionIds = [
      'home',
      'about',
      'why-us',
      'products',
      'gallery',
      'contact',
    ];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-35% 0px -50% 0px', threshold: 0.05 }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleKnowMoreScroll = () => {
    const aboutEl = document.getElementById('about');
    if (aboutEl) {
      aboutEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen parchment-canvas text-[#1E241E] flex flex-col">
        {showPreloader && (
          <Preloader onComplete={() => setShowPreloader(false)} />
        )}

        <Navbar
          activeSection={activeSection}
          onOpenWhatsApp={(productId) =>
            setWhatsAppDrawer({ open: true, productId })
          }
        />

        <main className="flex-1">
          <HeroSection
            onKnowMore={handleKnowMoreScroll}
            onWatchVideo={() =>
              setDioramaModal({ open: true, initialTab: '3d' })
            }
          />

          <AboutAndWhySection />

          <ProductsAndBannerSection
            onEnquireProduct={(productId) =>
              setWhatsAppDrawer({ open: true, productId })
            }
            onOpenHeritage3D={() =>
              setDioramaModal({ open: true, initialTab: '3d' })
            }
          />

          <GalleryAndTestimonialsSection />

          <ContactAndFooterSection
            contact={contact}
            onUpdateContact={setContact}
            onOpenWhatsApp={(productId) =>
              setWhatsAppDrawer({ open: true, productId })
            }
          />
        </main>

        <WhatsAppEnquiryDrawer
          isOpen={whatsAppDrawer.open}
          initialProductId={whatsAppDrawer.productId}
          contact={contact}
          onClose={() => setWhatsAppDrawer({ open: false })}
        />

        <FarmDioramaModal
          isOpen={dioramaModal.open}
          initialTab={dioramaModal.initialTab}
          onClose={() =>
            setDioramaModal((prev) => ({ ...prev, open: false }))
          }
          onOpenWhatsApp={(productId) =>
            setWhatsAppDrawer({ open: true, productId })
          }
        />
      </div>
    </MotionConfig>
  );
}

export default App;
