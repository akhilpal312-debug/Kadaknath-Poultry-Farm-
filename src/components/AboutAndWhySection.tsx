import React, { useState } from 'react';
import { ArrowRight, Check, X } from 'lucide-react';
import { FARM_IMAGES, WHY_CHOOSE_US } from '../data/farmData';
import { BotanicalSprig, BrandEmblem } from './BrandEmblem';
import { ResilientImage } from './ResilientImage';

export const AboutAndWhySection: React.FC = () => {
  const [aboutModalOpen, setAboutModalOpen] = useState(false);

  return (
    <section
      id="about"
      className="py-14 sm:py-20 border-b border-[#E2CFAF]/80 relative overflow-hidden"
    >
      <div className="max-w-[1220px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Tilted Polaroid Farm Photo with Botanical Leaves */}
          <div className="lg:col-span-4 relative flex justify-center">
            <BotanicalSprig className="w-24 h-24 absolute -top-6 -left-2 z-0 opacity-85 pointer-events-none" />
            <div className="relative z-10 bg-[#FCF8EE] p-3 pb-5 rounded-lg border border-[#DEC9A4] shadow-lg -rotate-2 hover:rotate-0 transition-transform duration-300 max-w-sm w-full">
              <div className="overflow-hidden rounded-sm">
                <ResilientImage
                  src={FARM_IMAGES.aboutFarm}
                  alt="Kadaknath Poultry Farm shed and signboard surrounded by green trees in Bhoshana, Shivli Road"
                  className="w-full aspect-4/3 object-cover"
                />
              </div>
              <p className="font-script italic text-center text-base text-[#3F493F] mt-2.5">
                Kadaknath Poultry Farm · Bhoshana, Shivli Road
              </p>
            </div>
          </div>

          {/* Center Column: About Our Farm Narrative */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1E241E] tracking-tight whitespace-nowrap">
                About Our Farm
              </h2>
              <span
                aria-hidden="true"
                className="h-[1px] flex-1 bg-gradient-to-r from-[#C89B3C] to-transparent"
              />
            </div>

            <p className="text-[15px] sm:text-base text-[#2E372E] leading-relaxed">
              We, at <strong className="font-semibold">Kadaknath Poultry Farm</strong>,
              are committed to raising pure-breed Kadaknath birds celebrated for
              their distinctive black plumage, lean protein profile, and rich
              nutritional value.
            </p>

            <p className="text-[15px] text-[#4A544A] leading-relaxed">
              Located at <strong className="font-medium text-[#1E241E]">Bhoshana, Shivli Road, Uttar Pradesh</strong>,
              our farm maintains a clean, airy, and hygienic environment where
              birds forage naturally on wholesome grains and fresh greens.
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setAboutModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1B3B22] hover:bg-[#132B18] active:scale-[0.98] text-[#FAF3E3] text-sm font-semibold shadow-xs transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer min-h-[42px]"
              >
                <span>Read More</span>
                <ArrowRight className="w-4 h-4 text-[#DFB75E]" />
              </button>
            </div>
          </div>

          {/* Right Column: Aged Parchment "Why Choose Us?" Card */}
          <div
            id="why-us"
            className="lg:col-span-4 aged-paper-card rounded-2xl border border-[#D4BE98] p-6 sm:p-7 shadow-sm relative overflow-hidden"
          >
            {/* Subtle Corner Crest Accent */}
            <div className="absolute -bottom-3 -right-3 opacity-10 pointer-events-none">
              <BrandEmblem variant="dark" className="w-32 h-32" />
            </div>

            <div className="relative z-10">
              <h3 className="font-display text-xl sm:text-2xl font-bold text-[#1E241E] pb-3 border-b border-[#D4BE98]">
                Why Choose Us?
              </h3>

              <ul className="mt-4 space-y-3.5">
                {WHY_CHOOSE_US.map((item) => (
                  <li key={item.id} className="flex items-start gap-3">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-[#5C6B28] text-[#FAF3E3] inline-flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </span>
                    <div>
                      <span className="text-sm sm:text-[15px] font-semibold text-[#1E241E] block">
                        {item.title}
                      </span>
                      <span className="text-xs text-[#4A544A] leading-snug block mt-0.5">
                        {item.detail}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Farm Practices & Hygiene Modal */}
      {aboutModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="About Kadaknath Poultry Farm Details"
        >
          <div className="bg-[#FAF3E3] border border-[#D4BE98] rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setAboutModalOpen(false)}
              aria-label="Close farm details"
              className="absolute top-4 right-4 w-10 h-10 rounded-lg bg-[#EFE2C6] hover:bg-[#E2CFAF] text-[#1E241E] inline-flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <BrandEmblem variant="dark" className="w-10 h-10" />
              <div>
                <h3 className="font-display text-2xl font-bold text-[#1E241E]">
                  About Kadaknath Poultry Farm
                </h3>
                <p className="text-xs text-[#4A544A]">
                  Bhoshana, Shivli Road · Uttar Pradesh, India
                </p>
              </div>
            </div>

            <div className="space-y-4 text-sm sm:text-[15px] text-[#2E372E] leading-relaxed">
              <p>
                Our farm in Bhoshana along Shivli Road is dedicated to preserving
                and raising authentic Kadaknath poultry—India&apos;s prized
                heritage black-fleshed chicken breed originally native to Madhya
                Pradesh and valued across Uttar Pradesh.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#EFE2C6]/70 border border-[#DEC9A4]">
                  <h4 className="font-display font-bold text-[#1B3B22] text-base">
                    Natural Farm Environment
                  </h4>
                  <p className="text-xs sm:text-sm text-[#3F493F] mt-1.5">
                    Spacious, shaded outdoor runs under mature neem trees allow
                    our birds to forage naturally in fresh air and sunlight.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#EFE2C6]/70 border border-[#DEC9A4]">
                  <h4 className="font-display font-bold text-[#1B3B22] text-base">
                    Clean &amp; Hygienic Care
                  </h4>
                  <p className="text-xs sm:text-sm text-[#3F493F] mt-1.5">
                    Poultry sheds are cleaned regularly with fresh dry straw
                    bedding, clean waterers, and balanced grain nutrition.
                  </p>
                </div>
              </div>

              <p>
                Whether you are looking for healthy adult Kadaknath birds,
                active day-old chicks for backyard or farm rearing, or fresh
                country eggs, visitors are welcome to inspect our farm directly
                on Shivli Road or enquire via WhatsApp.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E2CFAF] flex justify-end">
              <button
                type="button"
                onClick={() => setAboutModalOpen(false)}
                className="px-5 py-2.5 rounded-full bg-[#1B3B22] text-[#FAF3E3] text-sm font-semibold hover:bg-[#132B18] transition-colors cursor-pointer"
              >
                Back to Page
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
