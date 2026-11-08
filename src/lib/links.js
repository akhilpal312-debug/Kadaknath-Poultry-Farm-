import { farm } from '../data/site'

/** Build a WhatsApp deep link with an optional pre-filled message. */
export function whatsappLink(message) {
  const base = `https://wa.me/${farm.whatsapp}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

export const defaultEnquiry =
  `Hello ${farm.name}, I would like to enquire about your Kadaknath birds. Please share availability and price.`

export function productEnquiry(product) {
  return `Hello ${farm.name}, I would like to enquire about ${product}. Please share availability and price.`
}
