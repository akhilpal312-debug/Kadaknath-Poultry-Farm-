import React, { useEffect, useState } from 'react';
import { ArrowRight, Heart, Leaf, Play, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { FARM_IMAGES } from '../data/farmData';
import { BotanicalSprig } from './BrandEmblem';
import { HeroAmbientCanvas } from './HeroAmbientCanvas';
import { ResilientImage } from './ResilientImage';

interface HeroSectionProps {
  onKnowMore: () => void;
  onWatchVideo: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onKnowMore,
  onWatchVideo,
}) => {
  const [scrollY, setScrollY] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);

    const onScroll = () => {
      if (!mq.matches) {
        setScrollY(Math.min(window.scrollY, 450));
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      mq.removeEventListener('change', onChange);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <section
      id="home"
      className="relative overflow-hidden pt-8 pb-14 sm:pt-12 sm:pb-20 border-b border-[#E2CFAF]/80"
    >
      {/* Subtle 3D Atmospheric Golden Dust Particles */}
      <HeroAmbientCanvas />

      {/* Top-left & Bottom-right Botanical Leaf Accents */}
      <BotanicalSprig className="hidden md:block absolute -top-3 -left-3 w-28 h-28 pointer-events-none z-10 animate-leaf-breeze opacity-85" />
      <BotanicalSprig
        flip
        className="hidden md:block absolute -bottom-4 -right-3 w-32 h-32 pointer-events-none z-10 animate-leaf-breeze-reverse opacity-85"
      />

      <div className="relative z-10 max-w-[1220px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Editorial Typography & Primary CTAs */}
          <div className="lg:col-span-6 space-y-5">
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3"
            >
              <span className="font-script italic text-2xl sm:text-3xl text-[#2A332A] font-medium">
                Welcome to
              </span>
              <span
                aria-hidden="true"
                className="h-[1px] w-24 sm:w-32 bg-gradient-to-r from-[#C89B3C] to-transparent"
              />
            </motion.div>

            <motion.h1
              initial={reducedMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="font-display font-bold tracking-tight text-[#1A201A] leading-[1.06]"
              style={{
                fontSize: 'clamp(2.45rem, 4.4vw, 4.05rem)',
                textWrap: 'balance',
              }}
            >
              Kadaknath{' '}
              <span className="block text-[#1B3B22]">Poultry Farm</span>
            </motion.h1>

            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.45,
                delay: 0.16,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex items-center gap-3"
            >
              <p className="font-script italic font-semibold text-xl sm:text-2xl text-[#253025]">
                Healthy Birds... Healthy Life...
              </p>
              <span
                aria-hidden="true"
                className="hidden sm:inline-block h-[1px] w-16 bg-[#C89B3C]/70"
              />
            </motion.div>

            <motion.p
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.45,
                delay: 0.22,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="text-base sm:text-[17px] text-[#3F493F] max-w-xl leading-relaxed"
            >
              Premium Kadaknath chickens, naturally raised with care at our farm
              in Bhoshana, Shivli Road, Uttar Pradesh.
            </motion.p>

            {/* Primary & Secondary Action Buttons */}
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.45,
                delay: 0.28,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex flex-wrap items-center gap-3.5 pt-1"
            >
              <button
                type="button"
                onClick={onKnowMore}
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#1B3B22] hover:bg-[#132B18] active:scale-[0.98] text-[#FAF3E3] text-sm sm:text-base font-semibold shadow-sm transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer min-h-[46px]"
              >
                <span>Know More</span>
                <ArrowRight className="w-4 h-4 text-[#DFB75E]" />
              </button>

              <button
                type="button"
                data-testid="open-3d-tour"
                onClick={onWatchVideo}
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#FAF3E3] hover:bg-[#EFE2C6] active:scale-[0.98] text-[#1E241E] border border-[#C6AF88] text-sm sm:text-base font-semibold shadow-xs transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer min-h-[46px]"
              >
                <span className="w-5 h-5 rounded-full bg-[#1E241E] text-[#FAF3E3] inline-flex items-center justify-center">
                  <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                </span>
                <span>Watch Video &amp; 3D Tour</span>
              </button>
            </motion.div>

            {/* Three Natural Farming Value Points */}
            <motion.div
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.36 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5 border-t border-[#DEC9A4]/75"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#E5D4B3] border border-[#C8B28B] flex items-center justify-center shrink-0 text-[#1B3B22]">
                  <Leaf className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-[#1E241E] leading-snug">
                  100% Natural Farming
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#E5D4B3] border border-[#C8B28B] flex items-center justify-center shrink-0 text-[#1B3B22]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-[#1E241E] leading-snug">
                  Disease Free Poultry
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#E5D4B3] border border-[#C8B28B] flex items-center justify-center shrink-0 text-[#1B3B22]">
                  <Heart className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-[#1E241E] leading-snug">
                  Nutritious &amp; Healthy Meat
                </span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Hero Kadaknath Rooster, Hen & Chick Showcase */}
          <div className="lg:col-span-6 relative">
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              style={{
                transform: reducedMotion
                  ? undefined
                  : `translate3d(0, ${scrollY * 0.04}px, 0)`,
              }}
              className="relative"
            >
              <div className="relative overflow-hidden rounded-3xl">
                <ResilientImage
                  src={FARM_IMAGES.heroFlock}
                  alt="Pure black Kadaknath rooster, hen, and chick standing on a mossy stone at Kadaknath Poultry Farm"
                  loading="eager"
                  className="w-full aspect-4/3 object-cover hero-photo-blend"
                />
              </div>

              {/* Aged Parchment Heritage Seal */}
              <div className="hidden sm:flex flex-col items-center justify-center text-center aged-paper-card border border-[#C8AF84] shadow-md px-4 py-3 rounded-xl rotate-2 max-w-[164px] absolute top-4 right-4">
                <span className="font-display text-sm font-bold text-[#1E241E] leading-tight">
                  India&apos;s Premium Kadaknath Farm
                </span>
                <span className="text-[11px] text-[#4A544A] mt-1">
                  Bhoshana · Uttar Pradesh
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
