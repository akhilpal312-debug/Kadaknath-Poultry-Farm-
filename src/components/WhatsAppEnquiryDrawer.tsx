import React, { useEffect, useState } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  MessageCircle,
  Minus,
  Plus,
  X,
} from 'lucide-react';
import { FarmContactConfig, PRODUCTS } from '../data/farmData';

interface WhatsAppEnquiryDrawerProps {
  isOpen: boolean;
  initialProductId?: 'chickens' | 'chicks' | 'eggs';
  contact: FarmContactConfig;
  onClose: () => void;
}

export const WhatsAppEnquiryDrawer: React.FC<WhatsAppEnquiryDrawerProps> = ({
  isOpen,
  initialProductId = 'chickens',
  contact,
  onClose,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<
    'chickens' | 'chicks' | 'eggs'
  >(initialProductId);
  const [quantity, setQuantity] = useState<number>(5);
  const [customerName, setCustomerName] = useState('');
  const [customerLocation, setCustomerLocation] = useState('');
  const [fulfillment, setFulfillment] = useState<'pickup' | 'delivery'>(
    'pickup'
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedProductId(initialProductId);
      setQuantity(initialProductId === 'eggs' ? 30 : 5);
      setCopied(false);
    }
  }, [isOpen, initialProductId]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const selectedProduct =
    PRODUCTS.find((p) => p.id === selectedProductId) || PRODUCTS[0];

  const unitWord =
    selectedProductId === 'eggs'
      ? 'Eggs'
      : selectedProductId === 'chicks'
      ? 'Chicks'
      : 'Birds';

  const formattedMessage = [
    `Namaste ${contact.farmName} (Bhoshana, Shivli Road),`,
    `I would like to enquire about: *${selectedProduct.name}*`,
    `Quantity: ${quantity} ${unitWord}`,
    `Preference: ${
      fulfillment === 'pickup'
        ? 'Direct Farm Visit / Pickup'
        : 'Local Supply Enquiry'
    }`,
    customerName.trim() ? `Name: ${customerName.trim()}` : null,
    customerLocation.trim()
      ? `Village / City: ${customerLocation.trim()}`
      : null,
    `Please share current availability and rates.`,
  ]
    .filter(Boolean)
    .join('\n');

  const whatsappUrl = `https://wa.me/${contact.whatsappDigits}?text=${encodeURIComponent(
    formattedMessage
  )}`;

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(formattedMessage);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard fallback ignored if blocked
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/55"
      role="dialog"
      aria-modal="true"
      aria-label="WhatsApp Product Enquiry Drawer"
    >
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md bg-[#FAF3E3] border-l border-[#D4BE98] h-full flex flex-col justify-between shadow-2xl overflow-y-auto">
        <div>
          {/* Drawer Header */}
          <div className="px-6 py-5 bg-[#1B3B22] text-[#FAF3E3] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <MessageCircle className="w-5 h-5 text-[#DFB75E]" />
              <div>
                <h3 className="font-display text-lg font-bold leading-tight">
                  WhatsApp Farm Enquiry
                </h3>
                <p className="text-xs text-[#D8CBB0] tabular-nums">
                  Bhoshana, Shivli Road · {contact.phoneDisplay}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close WhatsApp enquiry drawer"
              className="w-10 h-10 rounded-lg bg-[#112616] hover:bg-[#264F2F] text-[#FAF3E3] inline-flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Product Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#1E241E] mb-2">
                Select Product (Enquiry on Request)
              </label>
              <div className="grid grid-cols-1 gap-2">
                {PRODUCTS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedProductId(item.id);
                      setQuantity(item.id === 'eggs' ? 30 : 5);
                    }}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                      selectedProductId === item.id
                        ? 'bg-[#1B3B22] text-[#FAF3E3] border-[#1B3B22]'
                        : 'bg-white/80 text-[#1E241E] border-[#DEC9A4] hover:bg-[#EFE2C6]'
                    }`}
                  >
                    <div>
                      <span className="text-sm font-semibold block">
                        {item.name}
                      </span>
                      <span
                        className={`text-[11px] ${
                          selectedProductId === item.id
                            ? 'text-[#DFB75E]'
                            : 'text-[#4A544A]'
                        }`}
                      >
                        {item.subtitle}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        selectedProductId === item.id
                          ? 'text-[#FAF3E3]'
                          : 'text-[#1B3B22]'
                      }`}
                    >
                      Enquiry
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Stepper */}
            <div>
              <label className="block text-xs font-semibold text-[#1E241E] mb-2">
                Approximate Quantity ({unitWord})
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="w-11 h-11 rounded-lg bg-[#EFE2C6] hover:bg-[#E2CFAF] text-[#1E241E] inline-flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min={1}
                  max={5000}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, Number(e.target.value) || 1))
                  }
                  className="w-24 text-center py-2.5 rounded-lg bg-white border border-[#D4BE98] font-semibold text-sm text-[#1E241E] tabular-nums"
                />
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="w-11 h-11 rounded-lg bg-[#EFE2C6] hover:bg-[#E2CFAF] text-[#1E241E] inline-flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Pickup vs Local Supply */}
            <div>
              <label className="block text-xs font-semibold text-[#1E241E] mb-2">
                Collection Preference
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFulfillment('pickup')}
                  className={`py-2.5 px-3 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    fulfillment === 'pickup'
                      ? 'bg-[#1B3B22] text-[#FAF3E3] border-[#1B3B22]'
                      : 'bg-white/80 text-[#1E241E] border-[#DEC9A4]'
                  }`}
                >
                  Farm Pickup
                </button>
                <button
                  type="button"
                  onClick={() => setFulfillment('delivery')}
                  className={`py-2.5 px-3 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    fulfillment === 'delivery'
                      ? 'bg-[#1B3B22] text-[#FAF3E3] border-[#1B3B22]'
                      : 'bg-white/80 text-[#1E241E] border-[#DEC9A4]'
                  }`}
                >
                  Local Supply Enquiry
                </button>
              </div>
            </div>

            {/* Optional Visitor Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="wa-name"
                  className="block text-xs font-semibold text-[#1E241E] mb-1"
                >
                  Your Name (Optional)
                </label>
                <input
                  id="wa-name"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#D4BE98] text-sm text-[#1E241E]"
                />
              </div>

              <div>
                <label
                  htmlFor="wa-city"
                  className="block text-xs font-semibold text-[#1E241E] mb-1"
                >
                  Village / City
                </label>
                <input
                  id="wa-city"
                  type="text"
                  value={customerLocation}
                  onChange={(e) => setCustomerLocation(e.target.value)}
                  placeholder="e.g. Shivli / Kanpur"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#D4BE98] text-sm text-[#1E241E]"
                />
              </div>
            </div>

            {/* Live Formatted Message Preview */}
            <div>
              <span className="block text-xs font-semibold text-[#1E241E] mb-1.5">
                Message Preview
              </span>
              <pre className="whitespace-pre-wrap font-sans text-xs bg-[#EFE2C6]/75 border border-[#DEC9A4] rounded-xl p-3 text-[#2A332A] leading-relaxed">
                {formattedMessage}
              </pre>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-6 border-t border-[#DEC9A4] bg-[#F5EBD6] space-y-2.5">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#1B3B22] hover:bg-[#132B18] text-[#FAF3E3] text-sm font-semibold shadow-sm transition-colors min-h-[46px]"
          >
            <MessageCircle className="w-4 h-4 text-[#DFB75E]" />
            <span>Continue to WhatsApp</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>

          <button
            type="button"
            onClick={handleCopyMessage}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-[#FAF3E3] hover:bg-[#EFE2C6] border border-[#C8B28B] text-[#1E241E] text-xs font-semibold transition-colors cursor-pointer min-h-[40px]"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#1B3B22]" />
                <span>Enquiry Message Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Enquiry Message</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
