import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Compass,
  Copy,
  Edit3,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  RotateCcw,
} from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import {
  DEFAULT_FARM_CONTACT,
  ENQUIRY_FIELD_LIMITS,
  FARM_COORDINATES,
  FARM_IMAGES,
  FarmContactConfig,
  GOOGLE_MAPS_DIRECTIONS_URL,
} from '../data/farmData';
import {
  auth,
  db,
  handleFirestoreError,
  isOwnerUser,
  OperationType,
  signInWithGooglePopup,
} from '../firebase';
import { BrandEmblem } from './BrandEmblem';
import { ResilientImage } from './ResilientImage';

interface ContactAndFooterSectionProps {
  contact: FarmContactConfig;
  onUpdateContact: (next: FarmContactConfig) => void;
  onOpenWhatsApp: (product?: 'chickens' | 'chicks' | 'eggs') => void;
}

export const ContactAndFooterSection: React.FC<
  ContactAndFooterSectionProps
> = ({ contact, onUpdateContact, onOpenWhatsApp }) => {
  // Contact Form State
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    mobile?: string;
    message?: string;
  }>({});
  const [submittedData, setSubmittedData] = useState<{
    name: string;
    mobile: string;
    message: string;
  } | null>(null);
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false);

  // Interactive Map Preview State
  const [mapZoom, setMapZoom] = useState<number>(1);
  const [pinSelected, setPinSelected] = useState<boolean>(true);
  const [copiedCoords, setCopiedCoords] = useState<boolean>(false);

  // Owner Auth & Contact Settings Editor State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [editingContact, setEditingContact] = useState(false);
  const [draftPhone, setDraftPhone] = useState(contact.phoneDisplay);
  const [draftEmail, setDraftEmail] = useState(contact.email);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setCurrentUser(u);
    });
    return () => unsub();
  }, []);

  const isOwner = isOwnerUser(currentUser);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    const trimmedName = name.trim();
    const trimmedMobile = mobile.trim();
    const trimmedMessage = message.trim();
    const cleanedDigits = trimmedMobile.replace(/\D/g, '');

    if (
      trimmedName.length < ENQUIRY_FIELD_LIMITS.nameMin ||
      trimmedName.length > ENQUIRY_FIELD_LIMITS.nameMax
    ) {
      nextErrors.name = `Please enter your full name (${ENQUIRY_FIELD_LIMITS.nameMin}–${ENQUIRY_FIELD_LIMITS.nameMax} characters).`;
    }
    if (
      cleanedDigits.length < 10 ||
      trimmedMobile.length > ENQUIRY_FIELD_LIMITS.mobileMax
    ) {
      nextErrors.mobile = 'Please enter a valid 10-digit mobile number.';
    }
    if (
      trimmedMessage.length < ENQUIRY_FIELD_LIMITS.messageMin ||
      trimmedMessage.length > ENQUIRY_FIELD_LIMITS.messageMax
    ) {
      nextErrors.message = `Please enter an enquiry message (${ENQUIRY_FIELD_LIMITS.messageMin}–${ENQUIRY_FIELD_LIMITS.messageMax} characters).`;
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmittingEnquiry(true);
    try {
      await addDoc(collection(db, 'enquiries'), {
        name: trimmedName,
        mobile: trimmedMobile,
        message: trimmedMessage,
        status: 'new',
        createdAt: serverTimestamp(),
      });

      setSubmittedData({
        name: trimmedName,
        mobile: trimmedMobile,
        message: trimmedMessage,
      });
      setName('');
      setMobile('');
      setMessage('');
    } catch (error) {
      setSubmittingEnquiry(false);
      handleFirestoreError(error, OperationType.CREATE, 'enquiries');
    } finally {
      setSubmittingEnquiry(false);
    }
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) {
      try {
        await signInWithGooglePopup();
      } catch {
        // User canceled sign-in
      }
      return;
    }

    const digits = draftPhone.replace(/\D/g, '');
    const normalizedWa =
      digits.length === 10
        ? `91${digits}`
        : digits.length >= 11 && digits.length <= 15
        ? digits
        : contact.whatsappDigits;

    const rawPhone = draftPhone.trim();
    const cleanPhone =
      rawPhone.length >= 8 && rawPhone.length <= 24
        ? rawPhone
        : DEFAULT_FARM_CONTACT.phoneDisplay;
    const cleanEmail = draftEmail.trim().slice(0, 120);

    setSavingSettings(true);
    try {
      await setDoc(doc(db, 'settings', 'publicContact'), {
        phoneDisplay: cleanPhone,
        whatsappDigits: normalizedWa,
        email: cleanEmail,
        updatedAt: serverTimestamp(),
      });

      onUpdateContact({
        ...contact,
        phoneDisplay: cleanPhone,
        whatsappDigits: normalizedWa,
        email: cleanEmail,
      });
      setEditingContact(false);
    } catch (error) {
      setSavingSettings(false);
      handleFirestoreError(
        error,
        OperationType.WRITE,
        'settings/publicContact'
      );
    } finally {
      setSavingSettings(false);
    }
  };

  const handleCopyCoordinates = async () => {
    try {
      await navigator.clipboard.writeText(
        `${FARM_COORDINATES.lat}, ${FARM_COORDINATES.lng}`
      );
      setCopiedCoords(true);
      window.setTimeout(() => setCopiedCoords(false), 2000);
    } catch {
      // Clipboard fallback ignored if blocked
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const whatsappDirectLink = submittedData
    ? `https://wa.me/${contact.whatsappDigits}?text=${encodeURIComponent(
        `Namaste ${contact.farmName},\nName: ${submittedData.name}\nMobile: ${submittedData.mobile}\nEnquiry: ${submittedData.message}`
      )}`
    : `https://wa.me/${contact.whatsappDigits}`;

  return (
    <>
      {/* Section I: Contact Us Band */}
      <section
        id="contact"
        className="relative bg-gradient-to-b from-[#1A3720] via-[#152D1A] to-[#102314] text-[#FAF3E3] py-14 sm:py-20 overflow-hidden scroll-mt-20"
      >
        <div className="max-w-[1220px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Farm Contact Information */}
            <div className="lg:col-span-4 space-y-5 lg:border-r lg:border-[#C89B3C]/30 lg:pr-6">
              <div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#FAF3E3] tracking-tight">
                  Contact Us
                </h2>
                <p className="font-script italic text-lg text-[#DFB75E] mt-0.5">
                  Get in Touch with Us
                </p>
              </div>

              <ul className="space-y-4 text-sm sm:text-[15px]">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#DFB75E] shrink-0 mt-0.5" />
                  <div>
                    <a
                      href={GOOGLE_MAPS_DIRECTIONS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-white hover:text-[#DFB75E] transition-colors block"
                    >
                      {contact.addressLine}
                    </a>
                    <span className="text-xs text-[#D8CBB0] block">
                      {contact.stateCountry}
                    </span>
                    <span className="text-[11px] text-[#DFB75E]/90 tabular-nums block mt-0.5">
                      {FARM_COORDINATES.display}
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#DFB75E] shrink-0 mt-0.5" />
                  <div>
                    <a
                      href={`tel:+${contact.whatsappDigits}`}
                      className="font-semibold text-white hover:text-[#DFB75E] transition-colors tabular-nums block"
                    >
                      {contact.phoneDisplay}
                    </a>
                    <span className="text-[11px] text-[#D8CBB0]">
                      Direct farm phone &amp; batch availability
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-[#DFB75E] shrink-0 mt-0.5" />
                  <div>
                    <button
                      type="button"
                      onClick={() => onOpenWhatsApp()}
                      className="font-semibold text-white hover:text-[#DFB75E] underline underline-offset-4 transition-colors cursor-pointer text-left tabular-nums"
                    >
                      Chat on WhatsApp ({contact.phoneDisplay})
                    </button>
                    <span className="text-[11px] text-[#D8CBB0] block">
                      Instant product &amp; order enquiry
                    </span>
                  </div>
                </li>

                {contact.email && (
                  <li className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-[#DFB75E] shrink-0 mt-0.5" />
                    <div>
                      <a
                        href={`mailto:${contact.email}`}
                        className="font-medium text-white hover:text-[#DFB75E] transition-colors break-all block"
                      >
                        {contact.email}
                      </a>
                    </div>
                  </li>
                )}
              </ul>

              {/* Farm Owner Contact Customizer Toggle */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setDraftPhone(contact.phoneDisplay);
                    setDraftEmail(contact.email);
                    setEditingContact((prev) => !prev);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#DFB75E] hover:text-white transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>
                    {editingContact
                      ? 'Close Contact Editor'
                      : 'Update Farm Contact (Owner)'}
                  </span>
                </button>

                {editingContact && (
                  <form
                    onSubmit={handleSaveContact}
                    className="mt-3 p-3.5 rounded-xl bg-[#102314] border border-[#C89B3C]/35 space-y-2.5"
                  >
                    {!isOwner ? (
                      <div className="space-y-2">
                        <p className="text-xs text-[#D8CBB0] leading-relaxed">
                          Sign in with the verified farm owner Google account to
                          update public contact details.
                        </p>
                        <button
                          type="submit"
                          className="px-3.5 py-2 rounded-md bg-[#DFB75E] text-[#112616] text-xs font-bold cursor-pointer"
                        >
                          Sign In as Owner
                        </button>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label
                            htmlFor="owner-phone"
                            className="block text-[11px] text-[#D8CBB0] mb-1"
                          >
                            Verified Phone / WhatsApp
                          </label>
                          <input
                            id="owner-phone"
                            type="text"
                            value={draftPhone}
                            onChange={(e) => setDraftPhone(e.target.value)}
                            placeholder="+91 6393860760"
                            className="w-full px-2.5 py-1.5 rounded-md bg-[#FAF3E3] text-[#1E241E] text-xs font-medium tabular-nums"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="owner-email"
                            className="block text-[11px] text-[#D8CBB0] mb-1"
                          >
                            Farm Email (Optional)
                          </label>
                          <input
                            id="owner-email"
                            type="email"
                            value={draftEmail}
                            onChange={(e) => setDraftEmail(e.target.value)}
                            placeholder="Optional email address"
                            className="w-full px-2.5 py-1.5 rounded-md bg-[#FAF3E3] text-[#1E241E] text-xs font-medium"
                          />
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="submit"
                            disabled={savingSettings}
                            className="px-3 py-1.5 rounded-md bg-[#DFB75E] text-[#112616] text-xs font-bold cursor-pointer disabled:opacity-60"
                          >
                            {savingSettings ? 'Saving...' : 'Save Details'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingContact(false)}
                            className="px-2.5 py-1.5 rounded-md text-[#D8CBB0] hover:text-white text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    )}
                  </form>
                )}
              </div>
            </div>

            {/* Center Column: Interactive Map Preview + Exact Google Maps Pin Link */}
            <div className="lg:col-span-3 flex flex-col items-center">
              <h3 className="font-display text-xl font-bold text-[#FAF3E3] mb-3 self-start lg:self-center">
                Find Us on Map
              </h3>

              <div className="w-full max-w-[300px] rounded-xl overflow-hidden border-2 border-[#FAF3E3]/80 shadow-lg bg-[#EFE6D2] relative">
                {/* Interactive Location Preview of Bhoshana, Shivli Road (26.633036, 80.070017) */}
                <div className="h-48 w-full overflow-hidden relative select-none">
                  <svg
                    viewBox="0 0 280 190"
                    className="w-full h-full transition-transform duration-200"
                    style={{ transform: `scale(${mapZoom})` }}
                    role="img"
                    aria-label="Interactive location map of Kadaknath Poultry Farm at Bhoshana, Shivli Road, Uttar Pradesh"
                  >
                    <rect width="280" height="190" fill="#EFE7D6" />
                    {/* Surrounding agricultural plots */}
                    <path
                      d="M0 16 Q75 6 135 24 T280 18 L280 0 L0 0 Z"
                      fill="#DCE6CE"
                    />
                    <path
                      d="M0 148 Q95 136 185 160 T280 150 L280 190 L0 190 Z"
                      fill="#DCE6CE"
                    />
                    <rect
                      x="18"
                      y="32"
                      width="68"
                      height="42"
                      rx="4"
                      fill="#E5EBD9"
                      stroke="#D3DBC4"
                      strokeWidth="1"
                    />
                    <rect
                      x="174"
                      y="86"
                      width="78"
                      height="46"
                      rx="4"
                      fill="#E5EBD9"
                      stroke="#D3DBC4"
                      strokeWidth="1"
                    />
                    {/* Shivli Road & Bhoshana Farm Approach */}
                    <path
                      d="M-10 134 Q90 110 155 92 T290 54"
                      stroke="#FFFFFF"
                      strokeWidth="9.5"
                      fill="none"
                      strokeLinecap="round"
                    />
                    <path
                      d="M-10 134 Q90 110 155 92 T290 54"
                      stroke="#D3C4A8"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      fill="none"
                    />
                    <path
                      d="M114 190 L127 102 L110 34"
                      stroke="#F8F3E8"
                      strokeWidth="5.5"
                      fill="none"
                      strokeLinecap="round"
                    />
                    {/* Road & Locality Labels */}
                    <text
                      x="26"
                      y="119"
                      fill="#5A5548"
                      fontSize="8.5"
                      fontWeight="700"
                      transform="rotate(-14 26 119)"
                    >
                      Shivli Road
                    </text>
                    <text
                      x="156"
                      y="130"
                      fill="#5A5548"
                      fontSize="8.5"
                      fontWeight="700"
                    >
                      Bhoshana
                    </text>
                    <text
                      x="22"
                      y="46"
                      fill="#6F7863"
                      fontSize="7.5"
                      fontWeight="600"
                    >
                      Kanpur Dehat · UP
                    </text>
                  </svg>

                  {/* Top-left Coordinate Pill-Free Tag */}
                  <button
                    type="button"
                    onClick={() => void handleCopyCoordinates()}
                    title="Copy GPS coordinates"
                    className="absolute top-2 left-2 px-2 py-1 rounded-md bg-[#112616]/90 text-[#FAF3E3] text-[10px] font-medium tabular-nums inline-flex items-center gap-1 shadow-xs hover:bg-[#1B3B22] cursor-pointer"
                  >
                    {copiedCoords ? (
                      <>
                        <Check className="w-3 h-3 text-[#DFB75E]" />
                        <span>Copied GPS</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-[#DFB75E]" />
                        <span>26.6330° N, 80.0700° E</span>
                      </>
                    )}
                  </button>

                  {/* Interactive Farm Marker Pin */}
                  <button
                    type="button"
                    onClick={() => setPinSelected((p) => !p)}
                    aria-label="Inspect Kadaknath Poultry Farm location pin"
                    className="absolute left-[46%] top-[46%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group"
                  >
                    <span className="w-7 h-7 rounded-full bg-[#C93B2B] text-white shadow-md flex items-center justify-center border-2 border-white group-hover:scale-110 transition-transform">
                      <MapPin className="w-4 h-4 fill-current" />
                    </span>
                    {pinSelected && (
                      <span className="mt-1 px-2.5 py-1 rounded-md bg-[#FAF3E3] border border-[#C89B3C] text-[10px] font-bold text-[#1E241E] shadow-sm whitespace-nowrap">
                        Kadaknath Poultry Farm · Bhoshana
                      </span>
                    )}
                  </button>

                  {/* Map Zoom & Reset Controls */}
                  <div className="absolute bottom-2 right-2 flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setMapZoom((z) => Math.min(1.6, +(z + 0.2).toFixed(1)))
                      }
                      aria-label="Zoom in map"
                      className="w-7 h-7 rounded-md bg-[#FAF3E3]/95 border border-[#C8B28B] text-[#1E241E] flex items-center justify-center hover:bg-white cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setMapZoom((z) => Math.max(1, +(z - 0.2).toFixed(1)))
                      }
                      aria-label="Zoom out map"
                      className="w-7 h-7 rounded-md bg-[#FAF3E3]/95 border border-[#C8B28B] text-[#1E241E] flex items-center justify-center hover:bg-white cursor-pointer shadow-xs"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMapZoom(1);
                        setPinSelected(true);
                      }}
                      aria-label="Recenter map"
                      className="w-7 h-7 rounded-md bg-[#FAF3E3]/95 border border-[#C8B28B] text-[#1E241E] flex items-center justify-center hover:bg-white cursor-pointer shadow-xs"
                    >
                      <Compass className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <a
                href={GOOGLE_MAPS_DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#DFB75E] hover:bg-[#CFA349] text-[#112616] text-xs font-bold shadow-xs transition-colors whitespace-nowrap min-h-[40px]"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Right Column: Torn-Parchment "Send Us a Message" Card + Rooster Portrait */}
            <div className="lg:col-span-5 relative flex items-center">
              <div className="w-full max-w-md mx-auto lg:mx-0 aged-paper-card rounded-2xl border border-[#D4BE98] p-6 sm:p-7 shadow-2xl text-[#1E241E] relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-[#1E241E] whitespace-nowrap">
                    Send Us a Message
                  </h3>
                  <span
                    aria-hidden="true"
                    className="h-[1px] flex-1 bg-gradient-to-r from-[#C89B3C] to-transparent"
                  />
                </div>

                {submittedData ? (
                  <div className="py-4 space-y-4">
                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#1B3B22]/10 border border-[#1B3B22]/25">
                      <CheckCircle2 className="w-5 h-5 text-[#1B3B22] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-[#1B3B22]">
                          Enquiry Saved for {submittedData.name}
                        </p>
                        <p className="text-xs text-[#3F493F] mt-1 leading-relaxed">
                          Your message has been logged for our Bhoshana farm
                          owner and is ready for instant WhatsApp dispatch (
                          {contact.phoneDisplay}).
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <a
                        href={whatsappDirectLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-[#1B3B22] hover:bg-[#132B18] text-[#FAF3E3] text-xs font-semibold transition-colors min-h-[42px]"
                      >
                        <MessageCircle className="w-4 h-4 text-[#DFB75E]" />
                        <span>Dispatch on WhatsApp</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => setSubmittedData(null)}
                        className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-full bg-[#FAF3E3] border border-[#C8B28B] text-[#1E241E] text-xs font-semibold hover:bg-[#EFE2C6] transition-colors cursor-pointer min-h-[42px]"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>New Message</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} noValidate className="space-y-3">
                    <div>
                      <label htmlFor="contact-name" className="sr-only">
                        Your Name
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        maxLength={ENQUIRY_FIELD_LIMITS.nameMax}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your Name"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-[#FCF8EE] border border-[#D4BE98] text-sm text-[#1E241E] placeholder:text-[#6B7268]"
                      />
                      {errors.name && (
                        <p className="text-[11px] text-[#9E2A2B] mt-1 font-medium">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="contact-mobile" className="sr-only">
                        Your Mobile Number
                      </label>
                      <input
                        id="contact-mobile"
                        type="tel"
                        maxLength={ENQUIRY_FIELD_LIMITS.mobileMax}
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="Your Mobile Number"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-[#FCF8EE] border border-[#D4BE98] text-sm text-[#1E241E] placeholder:text-[#6B7268] tabular-nums"
                      />
                      {errors.mobile && (
                        <p className="text-[11px] text-[#9E2A2B] mt-1 font-medium">
                          {errors.mobile}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="contact-message" className="sr-only">
                        Your Message
                      </label>
                      <textarea
                        id="contact-message"
                        rows={3}
                        maxLength={ENQUIRY_FIELD_LIMITS.messageMax}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Your Message (e.g. enquiry for Kadaknath birds, chicks, or eggs)..."
                        className="w-full px-3.5 py-2.5 rounded-lg bg-[#FCF8EE] border border-[#D4BE98] text-sm text-[#1E241E] placeholder:text-[#6B7268] resize-none"
                      />
                      {errors.message && (
                        <p className="text-[11px] text-[#9E2A2B] mt-1 font-medium">
                          {errors.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={submittingEnquiry}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-full bg-[#1B3B22] hover:bg-[#132B18] disabled:opacity-60 active:scale-[0.98] text-[#FAF3E3] text-sm font-semibold shadow-sm transition-all duration-150 cursor-pointer min-h-[44px]"
                    >
                      <span>
                        {submittingEnquiry ? 'Sending...' : 'Send Message'}
                      </span>
                      <ArrowRight className="w-4 h-4 text-[#DFB75E]" />
                    </button>
                  </form>
                )}
              </div>

              {/* Subtle Rooster Portrait Accent on Right Edge on Large Screens */}
              <div className="hidden xl:block w-44 shrink-0 -ml-6 pointer-events-none select-none opacity-90">
                <ResilientImage
                  src={FARM_IMAGES.bannerRooster}
                  alt="Kadaknath rooster standing beside contact card"
                  className="w-full aspect-3/4 object-cover rounded-2xl shadow-lg border border-[#C89B3C]/25"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section J: Footer */}
      <footer className="bg-[#121912] text-[#D8CBB0] border-t border-[#C89B3C]/25">
        <div className="max-w-[1220px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Brand Lockup & Description */}
            <div className="md:col-span-4 flex items-start gap-3">
              <BrandEmblem
                variant="gold"
                className="w-11 h-11 shrink-0 mt-0.5"
              />
              <div>
                <h3 className="font-display text-lg font-bold text-[#FAF3E3]">
                  Kadaknath Poultry Farm
                </h3>
                <p className="text-xs text-[#DFB75E]">
                  Pure • Healthy • Natural
                </p>
                <p className="text-xs text-[#A8B2A4] mt-1.5 leading-relaxed">
                  Naturally raised pure Kadaknath chickens, chicks, and fresh
                  country eggs at Bhoshana, Shivli Road, Uttar Pradesh.
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#FAF3E3] mb-2.5">
                Quick Links
              </h4>
              <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs">
                {[
                  { label: 'Home', id: 'home' },
                  { label: 'About Us', id: 'about' },
                  { label: 'Our Products', id: 'products' },
                  { label: 'Gallery', id: 'gallery' },
                  { label: 'Customer Feedback', id: 'reviews' },
                  { label: 'Contact Us', id: 'contact' },
                ].map((link, idx, arr) => (
                  <React.Fragment key={link.id}>
                    <button
                      type="button"
                      onClick={() => scrollToSection(link.id)}
                      className="hover:text-[#DFB75E] transition-colors cursor-pointer"
                    >
                      {link.label}
                    </button>
                    {idx < arr.length - 1 && (
                      <span aria-hidden="true" className="text-[#5C665C]">
                        |
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Connect & Heritage Tagline */}
            <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center md:items-start lg:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#FAF3E3] mb-2">
                  Connect
                </h4>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => onOpenWhatsApp()}
                    aria-label="Enquire on WhatsApp"
                    className="w-9 h-9 rounded-full bg-[#1B3B22] hover:bg-[#265230] text-[#DFB75E] inline-flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <a
                    href={`tel:+${contact.whatsappDigits}`}
                    aria-label="Call farm phone"
                    className="w-9 h-9 rounded-full bg-[#1E291E] hover:bg-[#2B3B2B] text-[#FAF3E3] inline-flex items-center justify-center transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      aria-label="Email farm"
                      className="w-9 h-9 rounded-full bg-[#1E291E] hover:bg-[#2B3B2B] text-[#FAF3E3] inline-flex items-center justify-center transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                  <a
                    href={GOOGLE_MAPS_DIRECTIONS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="View farm on Google Maps"
                    className="w-9 h-9 rounded-full bg-[#1E291E] hover:bg-[#2B3B2B] text-[#FAF3E3] inline-flex items-center justify-center transition-colors"
                  >
                    <MapPin className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <p className="font-script italic text-xl text-[#DFB75E] leading-tight">
                Healthy Birds...
                <span className="block">Happy Farmers...</span>
              </p>
            </div>
          </div>

          <div className="mt-8 pt-5 border-t border-white/10 text-center text-[11px] text-[#9AA596]">
            © {new Date().getFullYear()} Kadaknath Poultry Farm. All Rights
            Reserved. | Bhoshana, Shivli Road, Uttar Pradesh ·{' '}
            <a
              href={`tel:+${contact.whatsappDigits}`}
              className="hover:text-[#DFB75E] tabular-nums"
            >
              {contact.phoneDisplay}
            </a>
          </div>
        </div>
      </footer>
    </>
  );
};
