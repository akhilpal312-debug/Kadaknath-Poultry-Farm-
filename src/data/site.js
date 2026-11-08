/**
 * ─────────────────────────────────────────────────────────────
 *  KADAKNATH POULTRY FARM — site content
 * ─────────────────────────────────────────────────────────────
 *  Everything the owner needs to change lives in this one file.
 *
 *  ⚠  PLACEHOLDERS PENDING OWNER VERIFICATION (search for "TODO"):
 *     · phone / whatsapp  — currently a clearly non-real sample number
 *     · email             — sample address
 *     · social profiles   — currently link to the platform home pages
 *  The farm address is exactly as supplied by the owner.
 * ─────────────────────────────────────────────────────────────
 */

export const farm = {
  name: 'Kadaknath Poultry Farm',
  shortName: 'Kadaknath',
  tagline: 'Healthy Birds... Healthy Life...',
  logoSub: 'Pure • Healthy • Natural',
  establishedNote: 'Bhoshana · Shivli Road · Uttar Pradesh',

  phone: '+91 6393860760',
  phoneHref: '+916393860760',
  // digits only, country code first — used for every WhatsApp deep link
  whatsapp: '916393860760',

  // TODO: replace with the farm's verified e-mail
  email: 'hello@kadaknathfarm.in',

  address: {
    line1: 'Bhoshana, Shivli Road',
    line2: 'Uttar Pradesh, India',
    full: 'Bhoshana, Shivli Road, Uttar Pradesh, India',
  },
  mapQuery: 'Bhoshana, Shivli Road, Uttar Pradesh, India',
  mapLink: 'https://www.google.com/maps/search/?api=1&query=Bhoshana%2C%20Shivli%20Road%2C%20Uttar%20Pradesh%2C%20India',
  mapEmbed:
    'https://www.google.com/maps?q=Bhoshana%2C+Shivli+Road%2C+Uttar+Pradesh%2C+India&z=11&output=embed',

  // TODO: point these at the farm's real profiles when they exist
  socials: [
    { label: 'Facebook', href: 'https://www.facebook.com/', icon: 'facebook' },
    { label: 'YouTube', href: 'https://www.youtube.com/', icon: 'youtube' },
    { label: 'Instagram', href: 'https://www.instagram.com/', icon: 'instagram' },
  ],
}

export const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About Us', href: '#about' },
  { label: 'Our Products', href: '#products' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Why Choose Us', href: '#why-choose-us' },
  { label: 'Contact Us', href: '#contact' },
]

export const heroBadges = [
  { icon: 'leaf', label: '100% Natural', sub: 'Farming' },
  { icon: 'shield', label: 'Disease Free', sub: 'Poultry' },
  { icon: 'heart', label: 'Nutritious &', sub: 'Healthy Meat' },
]

export const features = [
  {
    icon: 'feather',
    title: 'Pure Kadaknath Breed',
    text: 'Birds from our own Kadaknath bloodline — the true black plumage, dark skin and slate-grey meat the breed is known for.',
  },
  {
    icon: 'badge',
    title: 'Quality Poultry',
    text: 'Birds are graded for health, weight and vigour before every dispatch, so what reaches you is ready to thrive.',
  },
  {
    icon: 'sparkles',
    title: 'Clean & Hygienic Environment',
    text: 'Fresh bedding, clean water lines and regular shed cleaning keep the flock comfortable through every season.',
  },
  {
    icon: 'heart-handshake',
    title: 'Customer Satisfaction',
    text: 'We answer questions before and after the sale — from brooding advice to the right feed for your birds.',
  },
  {
    icon: 'award',
    title: 'Quality Products',
    text: 'Live birds, day-old chicks and eggs, all from the same carefully managed farm flock.',
  },
]

export const products = [
  {
    id: 'chickens',
    name: 'Kadaknath Chickens',
    kicker: 'Strong & Healthy Birds',
    text: 'Live, naturally reared Kadaknath birds with the breed’s signature black plumage and rich, dark meat.',
    price: 'Price on enquiry',
    image: '/images/hen.webp',
    alt: 'A pure black Kadaknath hen standing on the ground at the farm',
    enquiry: 'Kadaknath chickens',
  },
  {
    id: 'chicks',
    name: 'Kadaknath Chicks',
    kicker: 'Healthy Chicks for a Better Tomorrow',
    text: 'Vigorous young chicks from our own hatch, ready to settle into your brooder or backyard coop.',
    price: 'Price on enquiry',
    image: '/images/chicks.webp',
    alt: 'Young chicks grouped in a clean brooder tray',
    enquiry: 'Kadaknath chicks',
  },
  {
    id: 'eggs',
    name: 'Kadaknath Eggs',
    kicker: 'Nutritious & Protein Rich',
    text: 'Farm-fresh eggs collected daily — for the table, or for hatching your own Kadaknath flock.',
    price: 'Price on enquiry',
    image: '/images/eggs.webp',
    alt: 'A woven basket filled with fresh farm eggs resting on straw',
    enquiry: 'Kadaknath eggs',
  },
]

export const gallery = [
  { src: '/images/rooster-head.webp', alt: 'Close portrait of a Kadaknath rooster’s head and comb', caption: 'The rooster', tag: 'Roosters' },
  { src: '/images/hen.webp', alt: 'Black Kadaknath hen standing in the farm run', caption: 'A healthy hen', tag: 'Hens' },
  { src: '/images/chicks.webp', alt: 'Young chicks in a brooder tray at the farm', caption: 'This season’s chicks', tag: 'Chicks' },
  { src: '/images/eggs.webp', alt: 'Basket of speckled farm eggs on straw', caption: 'Morning collection', tag: 'Eggs' },
  { src: '/images/pair-wide.webp', alt: 'Kadaknath rooster and hen together with woven baskets', caption: 'Cock and hen', tag: 'Farm' },
  { src: '/images/hen-head.webp', alt: 'Front view of a Kadaknath rooster showing its comb and wattles', caption: 'Full plumage', tag: 'Roosters' },
]

/**
 * Sample review cards. Clearly marked as samples in the UI until the owner
 * supplies verified customer feedback — no invented names or quotes.
 */
export const testimonials = [
  {
    sample: true,
    quote: 'Sample review — a verified customer’s words will appear here.',
    author: 'Verified customer',
    meta: 'Awaiting review',
  },
  {
    sample: true,
    quote: 'Sample review — a verified customer’s words will appear here.',
    author: 'Verified customer',
    meta: 'Awaiting review',
  },
  {
    sample: true,
    quote: 'Sample review — a verified customer’s words will appear here.',
    author: 'Verified customer',
    meta: 'Awaiting review',
  },
]

/** Photo attribution — required by the CC BY-SA 4.0 licence. */
export const photoCredits = {
  note:
    'Photographs on this page are reference images of the Kadaknath breed and are not photographs of this farm. They are cropped and colour-graded, and the adapted versions are shared under the same licence.',
  items: [
    {
      title: 'Kadaknath pair · Kadaknath hen · Kadaknath rooster · Kadaknath flock',
      author: 'Jegadeeswaran natarajan',
      licence: 'CC BY-SA 4.0',
      href: 'https://commons.wikimedia.org/wiki/Category:Kadaknath',
    },
    {
      title: 'Eggs in basket',
      author: 'George Chernilevsky',
      licence: 'CC BY-SA 4.0',
      href: 'https://commons.wikimedia.org/wiki/File:Eggs_in_basket_2020_G1.jpg',
    },
    {
      title: 'Chicks in brooder',
      author: 'Narek Avetisyan',
      licence: 'CC BY-SA 4.0',
      href: 'https://commons.wikimedia.org/wiki/File:Broiler_chicks_Armenia_03.jpg',
    },
  ],
}
