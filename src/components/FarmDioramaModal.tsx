import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Camera,
  ChevronDown,
  ChevronUp,
  Film,
  Pause,
  Play,
  Sun,
  X,
} from 'lucide-react';
import {
  buildKadaknathDiorama,
  CameraPresetId,
  KadaknathSceneController,
  LightingPresetId,
} from '../three/buildKadaknathScene';
import { afterDraw, detectSoftwareWebGL } from '../three/webglUtils';
import { FARM_IMAGES } from '../data/farmData';
import { ResilientImage } from './ResilientImage';

interface FarmDioramaModalProps {
  isOpen: boolean;
  initialTab: '3d' | 'story';
  onClose: () => void;
  onOpenWhatsApp: (product?: 'chickens' | 'chicks' | 'eggs') => void;
}

const STORY_CHAPTERS = [
  {
    step: 'Chapter 01',
    title: 'Pure Kadaknath Lineage in Bhoshana',
    subtitle: 'Shivli Road, Uttar Pradesh · Heritage Breed Care',
    body: 'Known across India as the Black Jewel (Kali Masi), the Kadaknath breed is celebrated for its jet-black plumage, dark comb, and rich nutritional profile. At our Bhoshana farm on Shivli Road, we preserve pure-line breeding stock in clean, stress-free surroundings.',
    image: FARM_IMAGES.bannerRooster,
  },
  {
    step: 'Chapter 02',
    title: 'Natural Foraging & Balanced Nutrition',
    subtitle: '100% Natural Farming · Wholesome Grain & Greens',
    body: 'Our roosters, hens, and chicks enjoy airy runs beneath shady neem trees with clean drinking water and wholesome grain-based feed, supporting natural immunity and active daily movement without growth hormones.',
    image: FARM_IMAGES.galleryFlock,
  },
  {
    step: 'Chapter 03',
    title: 'Hygienic Brooding & Daily Egg Harvest',
    subtitle: 'Healthy Chicks & Fresh Farm Eggs',
    body: 'From warm, sanitized brooding pens for day-old Kadaknath chicks to daily collection of fresh country eggs in clean straw nests, every stage is monitored for hygiene and customer satisfaction.',
    image: FARM_IMAGES.productEggs,
  },
];

export const FarmDioramaModal: React.FC<FarmDioramaModalProps> = ({
  isOpen,
  initialTab,
  onClose,
  onOpenWhatsApp,
}) => {
  const [activeTab, setActiveTab] = useState<'3d' | 'story'>(initialTab);
  const [cameraPreset, setCameraPreset] = useState<CameraPresetId>('rooster');
  const [lightingPreset, setLightingPreset] =
    useState<LightingPresetId>('golden');
  const [isPaused, setIsPaused] = useState(false);
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [webglUnavailable, setWebglUnavailable] = useState(false);

  // Story Reel playback state
  const [storyIndex, setStoryIndex] = useState(0);
  const [storyPlaying, setStoryPlaying] = useState(true);

  const canvasMountRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<KadaknathSceneController | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setStoryIndex(0);
      setStoryPlaying(true);
    }
  }, [isOpen, initialTab]);

  // Keyboard shortcuts: Esc to close, H to toggle bottom control dock
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (
        (e.key === 'h' || e.key === 'H') &&
        activeTab === '3d' &&
        document.activeElement?.tagName !== 'INPUT'
      ) {
        setDockCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, activeTab, onClose]);

  // Auto-advance Story Reel when on 'story' tab
  useEffect(() => {
    if (!isOpen || activeTab !== 'story' || !storyPlaying) return;
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced) return;

    const timer = window.setInterval(() => {
      setStoryIndex((prev) => (prev + 1) % STORY_CHAPTERS.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [isOpen, activeTab, storyPlaying]);

  // Mount Three.js 3D Farm Diorama when modal & '3d' tab are active
  useEffect(() => {
    if (!isOpen || activeTab !== '3d') return;
    const container = canvasMountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let controller: KadaknathSceneController | null = null;
    let frameId = 0;

    try {
      const isSoftwareGl = detectSoftwareWebGL();
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      renderer.setPixelRatio(
        isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2)
      );
      renderer.shadowMap.enabled = !isSoftwareGl;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      const w = Math.max(320, container.clientWidth);
      const h = Math.max(260, container.clientHeight);
      renderer.setSize(w, h);
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.display = 'block';
      container.appendChild(renderer.domElement);

      controller = buildKadaknathDiorama(renderer, w, h, isSoftwareGl);
      controllerRef.current = controller;

      let contextLost = false;
      const onLost = (e: Event) => {
        e.preventDefault();
        contextLost = true;
      };
      const onRestored = () => {
        contextLost = false;
      };
      renderer.domElement.addEventListener('webglcontextlost', onLost);
      renderer.domElement.addEventListener('webglcontextrestored', onRestored);

      const handleResize = () => {
        if (!container || !controller) return;
        controller.resize(container.clientWidth, container.clientHeight);
      };
      window.addEventListener('resize', handleResize);

      const startTime = performance.now();
      let prevTime = startTime;
      const tick = () => {
        const now = performance.now();
        const delta = Math.min((now - prevTime) / 1000, 0.1);
        const elapsed = (now - startTime) / 1000;
        prevTime = now;
        if (!contextLost && controller) {
          controller.stepAndRender(delta, elapsed);
        }
        if (isSoftwareGl && renderer) {
          afterDraw(renderer, tick, (id) => {
            frameId = id;
          });
        } else {
          frameId = requestAnimationFrame(tick);
        }
      };

      tick();

      return () => {
        cancelAnimationFrame(frameId);
        clearTimeout(frameId);
        window.removeEventListener('resize', handleResize);
        if (controller) {
          controller.dispose();
          controllerRef.current = null;
        }
        if (renderer) {
          renderer.domElement.removeEventListener('webglcontextlost', onLost);
          renderer.domElement.removeEventListener(
            'webglcontextrestored',
            onRestored
          );
          if (renderer.domElement.parentNode === container) {
            container.removeChild(renderer.domElement);
          }
          renderer.dispose();
        }
      };
    } catch {
      setWebglUnavailable(true);
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleCameraChange = (preset: CameraPresetId) => {
    setCameraPreset(preset);
    controllerRef.current?.setCameraPreset(preset);
  };

  const handleLightingChange = (mode: LightingPresetId) => {
    setLightingPreset(mode);
    controllerRef.current?.setLightingPreset(mode);
  };

  const handleTogglePause = () => {
    const next = !isPaused;
    setIsPaused(next);
    controllerRef.current?.setPaused(next);
  };

  const currentStory = STORY_CHAPTERS[storyIndex];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-[#0F1F13]"
      role="dialog"
      aria-modal="true"
      aria-label="Kadaknath Poultry Farm Interactive 3D Diorama and Heritage Story"
    >
      {/* Top Minimal Header Bar */}
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3 bg-[#112616] border-b border-[#C89B3C]/30 text-[#FAF3E3] shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-display text-base sm:text-lg font-bold tracking-tight truncate">
            Kadaknath Heritage Experience
          </span>
          <span className="hidden md:inline text-xs text-[#DFB75E]">
            · Bhoshana, Shivli Road
          </span>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-[#1B3B22] p-1 rounded-lg border border-[#C89B3C]/25">
          <button
            type="button"
            onClick={() => setActiveTab('3d')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === '3d'
                ? 'bg-[#C89B3C] text-[#112616]'
                : 'text-[#FAF3E3] hover:text-[#DFB75E]'
            }`}
          >
            3D Farm Diorama
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('story')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'story'
                ? 'bg-[#C89B3C] text-[#112616]'
                : 'text-[#FAF3E3] hover:text-[#DFB75E]'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Farm Story Reel</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#1B3B22] hover:bg-[#264F2F] text-[#FAF3E3] transition-colors cursor-pointer shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Viewport Area */}
      {activeTab === '3d' ? (
        <div className="relative flex-1 w-full overflow-hidden">
          {webglUnavailable ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center parchment-canvas">
              <ResilientImage
                src={FARM_IMAGES.heroFlock}
                alt="Kadaknath rooster, hen, and chick at our Bhoshana farm"
                className="w-full max-w-lg rounded-2xl shadow-lg mb-5 object-cover aspect-4/3"
              />
              <h3 className="font-display text-2xl font-bold text-[#1E241E]">
                Interactive 3D Preview Unavailable on This Device
              </h3>
              <p className="text-sm text-[#4A544A] max-w-md mt-2">
                Switch to the Farm Story Reel tab above to explore our
                Bhoshana Kadaknath farm chapters and photography.
              </p>
            </div>
          ) : (
            <>
              {/* Dedicated Empty WebGL Mount Container */}
              <div
                ref={canvasMountRef}
                className="w-full h-full cursor-grab active:cursor-grabbing"
              />

              {/* Subtle Top-Left Instruction Caption (Non-Occluding) */}
              <div className="absolute top-4 left-4 pointer-events-none bg-[#112616]/90 border border-[#C89B3C]/30 rounded-lg px-3.5 py-2 text-xs text-[#FAF3E3]">
                <span className="font-semibold text-[#DFB75E]">
                  3D Kadaknath Courtyard
                </span>{' '}
                · Drag to orbit · Scroll to zoom
              </div>

              {/* Collapsible Unified Bottom Control Dock (Solid rgba, no backdrop-filter, <= 15% height) */}
              <div className="fixed inset-x-0 bottom-4 z-20 flex justify-center px-3 pointer-events-none">
                <div
                  className="pointer-events-auto flex flex-col items-center transition-transform duration-300"
                  style={{
                    maxWidth: 'min(920px, 96vw)',
                    transform: dockCollapsed
                      ? 'translateY(calc(100% - 34px))'
                      : 'translateY(0)',
                  }}
                >
                <button
                  type="button"
                  onClick={() => setDockCollapsed((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-t-lg bg-[#112616] border border-b-0 border-[#C89B3C]/40 text-[11px] font-semibold text-[#DFB75E] hover:text-white transition-colors cursor-pointer"
                >
                  {dockCollapsed ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      <span>Show Controls (H)</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      <span>Hide Controls (H)</span>
                    </>
                  )}
                </button>

                <div className="flex flex-wrap items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-[#112616]/95 border border-[#C89B3C]/35 shadow-xl text-xs text-[#FAF3E3]">
                  {/* Camera Presets */}
                  <div className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-[#DFB75E] shrink-0" />
                    {(
                      [
                        { id: 'rooster', label: 'Hero Rooster' },
                        { id: 'flock', label: 'Flock & Nest' },
                        { id: 'coop', label: 'Heritage Coop' },
                        { id: 'overview', label: 'Yard Overview' },
                      ] as const
                    ).map((cam) => (
                      <button
                        key={cam.id}
                        type="button"
                        onClick={() => handleCameraChange(cam.id)}
                        className={`px-2.5 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          cameraPreset === cam.id
                            ? 'bg-[#C89B3C] text-[#112616] font-semibold'
                            : 'bg-[#1B3B22] text-[#FAF3E3] hover:bg-[#264F2F]'
                        }`}
                      >
                        {cam.label}
                      </button>
                    ))}
                  </div>

                  <span className="hidden sm:inline text-[#C89B3C]/40">|</span>

                  {/* Lighting Presets */}
                  <div className="flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-[#DFB75E] shrink-0" />
                    {(
                      [
                        { id: 'morning', label: 'Morning' },
                        { id: 'golden', label: 'Golden Hour' },
                        { id: 'dusk', label: 'Dusk' },
                      ] as const
                    ).map((light) => (
                      <button
                        key={light.id}
                        type="button"
                        onClick={() => handleLightingChange(light.id)}
                        className={`px-2.5 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          lightingPreset === light.id
                            ? 'bg-[#FAF3E3] text-[#112616] font-semibold'
                            : 'bg-[#1B3B22] text-[#FAF3E3] hover:bg-[#264F2F]'
                        }`}
                      >
                        {light.label}
                      </button>
                    ))}
                  </div>

                  <span className="hidden sm:inline text-[#C89B3C]/40">|</span>

                  {/* Motion Pause/Resume */}
                  <button
                    type="button"
                    onClick={handleTogglePause}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1B3B22] hover:bg-[#264F2F] text-[#DFB75E] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {isPaused ? (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span>Resume</span>
                      </>
                    ) : (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        <span>Pause</span>
                      </>
                    )}
                  </button>
                </div>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        /* Interactive Farm Story Reel Tab */
        <div className="flex-1 overflow-y-auto parchment-canvas flex items-center justify-center p-4 sm:p-8">
          <div className="max-w-4xl w-full bg-[#FAF3E3] border border-[#D4BE98] rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
            <div className="md:col-span-7 relative bg-[#112616]">
              <ResilientImage
                src={currentStory.image}
                alt={currentStory.title}
                className="w-full h-72 md:h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/75 to-transparent flex items-end justify-between px-4 pb-3 text-xs text-[#FAF3E3]">
                <span>{currentStory.step}</span>
                <button
                  type="button"
                  onClick={() => setStoryPlaying((p) => !p)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#112616]/90 border border-[#C89B3C]/40 text-[#DFB75E] cursor-pointer"
                >
                  {storyPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause Reel</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Play Reel</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="md:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold text-[#1B3B22] tracking-wide">
                  {currentStory.subtitle}
                </p>
                <h3 className="font-display text-2xl font-bold text-[#1E241E] mt-2 leading-snug">
                  {currentStory.title}
                </h3>
                <p className="text-sm text-[#4A544A] mt-4 leading-relaxed">
                  {currentStory.body}
                </p>
              </div>

              <div className="mt-8 pt-5 border-t border-[#E2CFAF]">
                <div className="flex items-center gap-2 mb-5">
                  {STORY_CHAPTERS.map((chap, idx) => (
                    <button
                      key={chap.step}
                      type="button"
                      onClick={() => {
                        setStoryIndex(idx);
                        setStoryPlaying(false);
                      }}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        storyIndex === idx
                          ? 'bg-[#1B3B22] text-[#FAF3E3]'
                          : 'bg-[#EFE2C6] text-[#1E241E] hover:bg-[#E2CFAF]'
                      }`}
                    >
                      0{idx + 1}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenWhatsApp('chickens');
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-[#1B3B22] hover:bg-[#132B18] text-[#FAF3E3] text-sm font-semibold transition-colors cursor-pointer"
                >
                  Enquire About Kadaknath Birds
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
