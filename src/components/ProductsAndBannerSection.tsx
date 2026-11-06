import React from 'react';
import { ArrowRight, Crown } from 'lucide-react';
import { FARM_IMAGES, PRODUCTS } from '../data/farmData';
import { ResilientImage } from './ResilientImage';

interface ProductsAndBannerSectionProps {
  onEnquireProduct: (productId: 'chickens' | 'chicks' | 'eggs') => void;
  onOpenHeritage3D: () => void;
}

export const ProductsAndBannerSection: React.FC<
  ProductsAndBannerSectionProps
> = ({ onEnquireProduct, onOpenHeritage3D }) => {
  return (
    <section
      id="products"
      className="py-14 sm:py-20 border-b border-[#E2CFAF]/80"
    >
      <div className="max-w-[1220px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Section Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="flex items-center justify-center gap-4">
            <span
              aria-hidden="true"
              className="h-[1px] w-16 sm:w-28 bg-gradient-to-r from-transparent to-[#C89B3C]"
            />
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1E241E] tracking-tight">
              Our Products
            </h2>
            <span
              aria-hidden="true"
              className="h-[1px] w-16 sm:w-28 bg-gradient-to-l from-transparent to-[#C89B3C]"
            />
          </div>
          <p className="text-sm sm:text-base text-[#4A544A] mt-1.5">
            Premium Quality, Direct from Our Farm
          </p>
        </div>

        {/* 3 Product Cards + Right Heritage Banner Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left 8 Columns: Three Product Cards */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
            {PRODUCTS.map((product) => (
              <article
                key={product.id}
                className="bg-[#FAF3E3] border border-[#DEC9A4] rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="overflow-hidden bg-[#EFE2C6]">
                    <ResilientImage
                      src={product.image}
                      alt={product.imageAlt}
                      fallbackTitle={product.name}
                      loading="eager"
                      className="w-full aspect-4/3 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-5">
                    <h3 className="font-display text-xl font-bold text-[#1E241E] leading-snug">
                      {product.name}
                    </h3>
                    <p className="text-xs font-medium text-[#1B3B22] mt-1">
                      {product.subtitle}
                    </p>
                    <p className="text-xs sm:text-[13px] text-[#4A544A] mt-2.5 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2 border-t border-[#EDE0C6]">
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="font-semibold text-[#1B3B22]">
                      {product.priceLabel}
                    </span>
                    <span className="text-[#5C665C]">Direct Farm</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onEnquireProduct(product.id)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#1B3B22] hover:bg-[#132B18] active:scale-[0.98] text-[#FAF3E3] text-xs sm:text-sm font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer min-h-[42px]"
                  >
                    <span>Enquire Now</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#DFB75E]" />
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Right 4 Columns: "The Black Jewel of India" Dark Forest-Green & Gold Banner */}
          <aside className="lg:col-span-4 rounded-2xl bg-gradient-to-b from-[#1A3520] via-[#132818] to-[#0B190E] border border-[#C89B3C]/45 text-[#FAF3E3] p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden shadow-md">
            {/* Subtle Gold Corner Frame Line */}
            <div
              aria-hidden="true"
              className="absolute inset-3 rounded-xl border border-[#C89B3C]/20 pointer-events-none"
            />

            <div className="relative z-10 text-center sm:text-left">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#C89B3C]/15 border border-[#C89B3C]/40 text-[#DFB75E] mb-3">
                <Crown className="w-5 h-5" />
              </div>

              <h3 className="font-display text-2xl sm:text-[26px] font-bold text-[#F7ECD5] leading-tight">
                The Black Jewel{' '}
                <span className="block text-[#DFB75E]">of India</span>
              </h3>

              <p className="font-script italic text-base sm:text-lg text-[#D8CBB0] mt-2 leading-snug">
                Kadaknath — A Heritage Breed for a Healthier Future
              </p>
            </div>

            <div className="relative z-10 my-4 flex items-center justify-center">
              <div className="w-full max-w-[240px] rounded-xl overflow-hidden border border-[#C89B3C]/30 shadow-inner">
                <ResilientImage
                  src={FARM_IMAGES.bannerRooster}
                  alt="Majestic black Kadaknath rooster — The Black Jewel of India"
                  loading="eager"
                  className="w-full aspect-4/3 object-cover"
                />
              </div>
            </div>

            <div className="relative z-10">
              <button
                type="button"
                onClick={onOpenHeritage3D}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#DFB75E] hover:bg-[#C89B3C] active:scale-[0.98] text-[#112616] text-xs sm:text-sm font-bold shadow-sm transition-all duration-150 whitespace-nowrap cursor-pointer min-h-[42px]"
              >
                <span>Explore 3D Heritage</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};
