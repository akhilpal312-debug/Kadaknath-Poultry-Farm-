import heroFlockImg from '../assets/images/hero_kadaknath_flock_1793929896395.jpg';
import aboutFarmImg from '../assets/images/about_farm_exterior_1793929896758.jpg';
import productChickenImg from '../assets/images/product_kadaknath_chicken_1793929897181.jpg';
import productChicksImg from '../assets/images/product_kadaknath_chicks_1793929896557.jpg';
import productEggsImg from '../assets/images/product_kadaknath_eggs_1793929896705.jpg';
import bannerRoosterImg from '../assets/images/banner_black_jewel_rooster_1793929896846.jpg';
import galleryFlockImg from '../assets/images/gallery_flock_free_range_1793929897620.jpg';
import galleryHenImg from '../assets/images/gallery_hens_portrait_1793929898012.jpg';

export interface FarmContactConfig {
  farmName: string;
  addressLine: string;
  stateCountry: string;
  fullAddress: string;
  phoneDisplay: string;
  whatsappDigits: string;
  email: string;
}

export interface ProductItem {
  id: 'chickens' | 'chicks' | 'eggs';
  name: string;
  subtitle: string;
  description: string;
  priceLabel: string;
  unitLabel: string;
  image: string;
  imageAlt: string;
  highlights: string[];
}

export interface WhyChooseItem {
  id: string;
  title: string;
  detail: string;
}

export type GalleryCategory = 'All' | 'Roosters & Hens' | 'Chicks' | 'Farm & Eggs';

export interface GalleryPhoto {
  id: string;
  title: string;
  category: Exclude<GalleryCategory, 'All'>;
  caption: string;
  image: string;
  alt: string;
}

export type ReviewPurchaseCategory =
  | 'Kadaknath Chickens'
  | 'Kadaknath Chicks'
  | 'Kadaknath Eggs'
  | 'Farm Visit';

export interface CustomerReview {
  id: string;
  authorName: string;
  location: string;
  purchaseCategory: ReviewPurchaseCategory;
  rating: number;
  comment: string;
  status: 'published' | 'hidden';
  helpfulCount: number;
  authorUid: string;
  verifiedAccount: boolean;
  ownerReply: string;
  ownerRepliedAt?: Date | null;
  createdAt?: Date | null;
}

export interface CustomerEnquiry {
  id: string;
  name: string;
  mobile: string;
  message: string;
  status: 'new' | 'contacted';
  createdAt?: Date | null;
}

export const REVIEW_FIELD_LIMITS = {
  authorNameMin: 2,
  authorNameMax: 60,
  locationMin: 2,
  locationMax: 60,
  commentMin: 10,
  commentMax: 500,
  ownerReplyMax: 400,
} as const;

export const ENQUIRY_FIELD_LIMITS = {
  nameMin: 2,
  nameMax: 60,
  mobileMin: 10,
  mobileMax: 20,
  messageMin: 5,
  messageMax: 500,
} as const;

export const FARM_IMAGES = {
  heroFlock: heroFlockImg,
  aboutFarm: aboutFarmImg,
  productChicken: productChickenImg,
  productChicks: productChicksImg,
  productEggs: productEggsImg,
  bannerRooster: bannerRoosterImg,
  galleryFlock: galleryFlockImg,
  galleryHen: galleryHenImg,
};

export const DEFAULT_FARM_CONTACT: FarmContactConfig = {
  farmName: 'Kadaknath Poultry Farm',
  addressLine: 'Bhoshana, Shivli Road',
  stateCountry: 'Uttar Pradesh, India',
  fullAddress: 'Bhoshana, Shivli Road, Uttar Pradesh, India',
  phoneDisplay: '+91 6393860760',
  whatsappDigits: '916393860760',
  email: '',
};

export const GOOGLE_MAPS_DIRECTIONS_URL =
  'https://goo.gl/maps/AXYQmb3qZBZhFMzj7';

export const FARM_COORDINATES = {
  lat: 26.633036,
  lng: 80.070017,
  display: '26.633036° N, 80.070017° E',
};

export const REVIEW_PURCHASE_CATEGORIES: ReviewPurchaseCategory[] = [
  'Kadaknath Chickens',
  'Kadaknath Chicks',
  'Kadaknath Eggs',
  'Farm Visit',
];

export const PRODUCTS: ProductItem[] = [
  {
    id: 'chickens',
    name: 'Kadaknath Chickens',
    subtitle: 'Strong & Healthy Birds',
    description:
      'Pure-breed adult Kadaknath roosters and hens raised naturally with balanced farm feed and open foraging space.',
    priceLabel: 'Enquiry on Request',
    unitLabel: 'Live Bird / Farm Pickup & Local Supply',
    image: productChickenImg,
    imageAlt: 'Pure black Kadaknath rooster standing on natural golden straw',
    highlights: [
      'Pure black plumage, comb, and skin',
      'Naturally reared without growth hormones',
      'Direct farm selection at Bhoshana, Shivli Road',
    ],
  },
  {
    id: 'chicks',
    name: 'Kadaknath Chicks',
    subtitle: 'Healthy Chicks for a Better Tomorrow',
    description:
      'Active, hardy day-old and brooded Kadaknath chicks nurtured in clean, temperature-monitored brooding enclosures.',
    priceLabel: 'Enquiry on Request',
    unitLabel: 'Per Chick / Batch Booking',
    image: productChicksImg,
    imageAlt: 'Two healthy fluffy black Kadaknath chicks standing on straw',
    highlights: [
      'Strong immunity and active foraging instincts',
      'Hygienic brooding and routine health care',
      'Guidance provided for new backyard & farm keepers',
    ],
  },
  {
    id: 'eggs',
    name: 'Kadaknath Eggs',
    subtitle: 'Nutritious & Protein Rich',
    description:
      'Fresh country Kadaknath eggs gathered daily from our free-foraging hens nourished on wholesome grains and greens.',
    priceLabel: 'Enquiry on Request',
    unitLabel: 'Fresh Farm Eggs / Tray Booking',
    image: productEggsImg,
    imageAlt: 'Fresh natural Kadaknath eggs arranged in a woven straw nest',
    highlights: [
      'Collected fresh daily at our Bhoshana farm',
      'Rich natural protein and traditional nutritional value',
      'Carefully packed for farm collection or local orders',
    ],
  },
];

export const WHY_CHOOSE_US: WhyChooseItem[] = [
  {
    id: 'pure-breed',
    title: 'Pure Kadaknath Breed',
    detail: 'Authentic Jet-Black and Pencilled Kadaknath lineage maintained with care.',
  },
  {
    id: 'quality-poultry',
    title: 'Quality Poultry',
    detail: 'Active, well-nourished birds raised at a natural pace on wholesome feed.',
  },
  {
    id: 'hygiene',
    title: 'Clean & Hygienic Environment',
    detail: 'Sanitized coops, fresh bedding, clean drinking water, and airy runs.',
  },
  {
    id: 'customer-satisfaction',
    title: 'Customer Satisfaction',
    detail: 'Transparent farm visits, honest guidance, and dependable batch fulfillment.',
  },
  {
    id: 'quality-products',
    title: 'Quality Products',
    detail: 'Direct farm availability of adult birds, healthy chicks, and fresh country eggs.',
  },
];

export const GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    id: 'gal-hen-pasture',
    title: 'Kadaknath Hen on Green Pasture',
    category: 'Roosters & Hens',
    caption: 'Healthy pure-breed Kadaknath hen foraging naturally in open daylight at our Bhoshana farm.',
    image: galleryHenImg,
    alt: 'Black Kadaknath hen standing on green pasture at the farm',
  },
  {
    id: 'gal-flock-foraging',
    title: 'Free-Foraging Heritage Flock',
    category: 'Roosters & Hens',
    caption: 'Our Kadaknath flock roaming beneath shady neem trees along Shivli Road, Uttar Pradesh.',
    image: galleryFlockImg,
    alt: 'Flock of black Kadaknath hens and roosters foraging on green grass under trees',
  },
  {
    id: 'gal-adult-rooster',
    title: 'Adult Kadaknath Rooster',
    category: 'Roosters & Hens',
    caption: 'Distinctive metallic green-black iridescent feathers and dark comb of a mature Kadaknath rooster.',
    image: productChickenImg,
    alt: 'Mature black Kadaknath rooster standing on golden straw',
  },
  {
    id: 'gal-chicks-brood',
    title: 'Young Kadaknath Chicks',
    category: 'Chicks',
    caption: 'Alert, healthy Kadaknath chicks raised on clean golden straw bedding with attentive care.',
    image: productChicksImg,
    alt: 'Two fluffy black Kadaknath chicks standing together on golden straw',
  },
  {
    id: 'gal-fresh-eggs',
    title: 'Fresh Country Kadaknath Eggs',
    category: 'Farm & Eggs',
    caption: 'Daily harvest of natural cream and light-brown Kadaknath eggs nestled in woven straw.',
    image: productEggsImg,
    alt: 'Fresh Kadaknath eggs inside a woven straw nest',
  },
  {
    id: 'gal-farm-courtyard',
    title: 'Bhoshana Farm Courtyard & Shed',
    category: 'Farm & Eggs',
    caption: 'Clean, ventilated poultry housing surrounded by mature shade trees in Bhoshana, Shivli Road.',
    image: aboutFarmImg,
    alt: 'Exterior view of Kadaknath Poultry Farm building surrounded by neem trees',
  },
  {
    id: 'gal-black-jewel',
    title: 'The Black Jewel — Heritage Rooster',
    category: 'Roosters & Hens',
    caption: 'Close-up portrait highlighting the regal posture and melanin-rich traits of the Kadaknath breed.',
    image: bannerRoosterImg,
    alt: 'Close-up studio portrait of a pure black Kadaknath rooster',
  },
  {
    id: 'gal-rooster-hen-chick',
    title: 'Three Generations at the Farm',
    category: 'Chicks',
    caption: 'Kadaknath rooster, hen, and young chick together in the sunlit natural courtyard.',
    image: heroFlockImg,
    alt: 'Kadaknath rooster, hen, and chick standing on a mossy stone',
  },
];
