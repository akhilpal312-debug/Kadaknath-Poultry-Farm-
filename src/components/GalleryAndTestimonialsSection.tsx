import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Expand,
  X,
} from 'lucide-react';
import { GALLERY_PHOTOS, GalleryCategory } from '../data/farmData';
import { ResilientImage } from './ResilientImage';

const CATEGORIES: GalleryCategory[] = [
  'All',
  'Roosters & Hens',
  'Chicks',
  'Farm & Eggs',
];

export const GalleryAndTestimonialsSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] =
    useState<GalleryCategory>('All');
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredPhotos =
    selectedCategory === 'All'
      ? GALLERY_PHOTOS
      : GALLERY_PHOTOS.filter((p) => p.category === selectedCategory);

  const visiblePhotos = showAllPhotos
    ? filteredPhotos
    : filteredPhotos.slice(0, 5);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) =>
          prev === null ? 0 : (prev + 1) % filteredPhotos.length
        );
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev === null
            ? 0
            : (prev - 1 + filteredPhotos.length) % filteredPhotos.length
        );
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxIndex, filteredPhotos.length]);

  const activeLightboxPhoto =
    lightboxIndex !== null ? filteredPhotos[lightboxIndex] : null;

  return (
    <>
      {/* Section G: Our Farm Gallery */}
      <section
        id="gallery"
        className="py-14 sm:py-20 border-b border-[#E2CFAF]/80 scroll-mt-20"
      >
        <div className="max-w-[1220px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-7">
            <div className="flex items-center justify-center gap-4">
              <span
                aria-hidden="true"
                className="h-[1px] w-14 sm:w-24 bg-gradient-to-r from-transparent to-[#C89B3C]"
              />
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1E241E] tracking-tight">
                Our Farm Gallery
              </h2>
              <span
                aria-hidden="true"
                className="h-[1px] w-14 sm:w-24 bg-gradient-to-l from-transparent to-[#C89B3C]"
              />
            </div>
            <p className="font-script italic text-lg text-[#4A544A] mt-1">
              A Glimpse of Our Poultry Farm
            </p>
          </div>

          {/* Interactive Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => {
                  setSelectedCategory(category);
                  setLightboxIndex(null);
                }}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[38px] ${
                  selectedCategory === category
                    ? 'bg-[#1B3B22] text-[#FAF3E3] shadow-xs'
                    : 'bg-[#FAF3E3] text-[#2A332A] border border-[#DEC9A4] hover:bg-[#EFE2C6]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Responsive Photo Grid (5 across on desktop matching reference, expandable to all 8) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {visiblePhotos.map((photo, idx) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setLightboxIndex(idx)}
                className="group relative rounded-xl overflow-hidden border-2 border-[#FAF3E3] shadow-sm hover:shadow-md bg-[#EFE2C6] text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-[#C89B3C]"
              >
                <ResilientImage
                  src={photo.image}
                  alt={photo.alt}
                  fallbackTitle={photo.title}
                  loading="eager"
                  className="w-full aspect-4/3 object-cover group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3">
                  <div className="self-end w-7 h-7 rounded-full bg-[#112616]/85 text-[#FAF3E3] inline-flex items-center justify-center">
                    <Expand className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-[#DFB75E] block">
                      {photo.category}
                    </span>
                    <span className="text-xs font-semibold text-white line-clamp-1">
                      {photo.title}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {filteredPhotos.length > 5 && (
            <div className="mt-7 text-center">
              <button
                type="button"
                onClick={() => setShowAllPhotos((prev) => !prev)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1B3B22] hover:bg-[#132B18] active:scale-[0.98] text-[#FAF3E3] text-xs sm:text-sm font-semibold shadow-xs transition-all duration-150 whitespace-nowrap cursor-pointer min-h-[42px]"
              >
                <span>
                  {showAllPhotos
                    ? 'Show Compact Strip'
                    : `View More Photos (${filteredPhotos.length})`}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[#DFB75E]" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Full-Screen Interactive Photo Lightbox */}
      {activeLightboxPhoto && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex flex-col justify-between p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={activeLightboxPhoto.title}
        >
          <div className="flex items-center justify-between text-[#FAF3E3]">
            <div className="text-xs sm:text-sm">
              <span className="text-[#DFB75E] font-semibold">
                {activeLightboxPhoto.category}
              </span>
              <span className="mx-2 text-white/40">·</span>
              <span className="tabular-nums">
                {lightboxIndex + 1} / {filteredPhotos.length}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              aria-label="Close photo lightbox"
              className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white inline-flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center my-4 max-h-[75vh]">
            <button
              type="button"
              onClick={() =>
                setLightboxIndex(
                  (lightboxIndex - 1 + filteredPhotos.length) %
                    filteredPhotos.length
                )
              }
              aria-label="Previous photo"
              className="absolute left-1 sm:left-4 z-10 w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 inline-flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <ResilientImage
              src={activeLightboxPhoto.image}
              alt={activeLightboxPhoto.alt}
              loading="eager"
              className="max-h-[72vh] max-w-full rounded-xl object-contain shadow-2xl"
            />

            <button
              type="button"
              onClick={() =>
                setLightboxIndex((lightboxIndex + 1) % filteredPhotos.length)
              }
              aria-label="Next photo"
              className="absolute right-1 sm:right-4 z-10 w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 inline-flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="text-center max-w-xl mx-auto text-[#FAF3E3]">
            <h3 className="font-display text-lg sm:text-xl font-bold">
              {activeLightboxPhoto.title}
            </h3>
            <p className="text-xs sm:text-sm text-[#D8CBB0] mt-1">
              {activeLightboxPhoto.caption}
            </p>
          </div>
        </div>
      )}
    </>
  );
};
