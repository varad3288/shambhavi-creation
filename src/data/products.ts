export interface Product {
  id: string;
  name: string;
  slug: string;
  category: "Sets" | "Earrings" | "Rings" | "Bangles" | "Necklaces" | "Nath";
  priceInr: number;
  originalPriceInr?: number;
  material: string;
  weight: string;
  dimensions?: string;
  craftsmanshipNotes: string;
  availability: "In Stock" | "Made to Order";
  tag: string;
}

export const ATELIER_CATALOG: Product[] = [
  {
    id: "sc-01",
    name: "Manikarnika Kundan Choker & Tikka Set",
    slug: "manikarnika-kundan-choker",
    category: "Sets",
    priceInr: 1249,
    originalPriceInr: 1599,
    material: "Brass alloy, handset kundan, basra simulated pearls",
    weight: "85 g",
    dimensions: "Choker 38 cm adjustable, Tikka 12 cm drop",
    craftsmanshipNotes: "Artisanal prong-set kundan backed with hand-braided zari dori. Light enough for entire wedding rituals.",
    availability: "In Stock",
    tag: "Atelier Signature",
  },
  {
    id: "sc-02",
    name: "Temple Gold Lakshmi Motif Jhumkas",
    slug: "temple-gold-lakshmi-jhumkas",
    category: "Earrings",
    priceInr: 899,
    material: "Antique gold micro-plated brass, seed pearls",
    weight: "28 g",
    dimensions: "6.5 cm drop length",
    craftsmanshipNotes: "Repoussé stamped deity medallion with ringing seed pearl cluster bell.",
    availability: "In Stock",
    tag: "Heritage Classic",
  },
  {
    id: "sc-03",
    name: "Oxidised Silver Aaina Mirror Ring",
    slug: "oxidised-silver-aaina-ring",
    category: "Rings",
    priceInr: 550,
    material: "Oxidised German silver, convex mirror glass",
    weight: "14 g",
    dimensions: "Adjustable 16–22 mm inner band",
    craftsmanshipNotes: "Hand-chiseled radial petaled bezel enclosing an authentic reflecting glass center.",
    availability: "In Stock",
    tag: "Daily Vintage",
  },
  {
    id: "sc-04",
    name: "Gulabi Meenakari Chandbali Hoops",
    slug: "gulabi-meenakari-chandbali",
    category: "Earrings",
    priceInr: 650,
    originalPriceInr: 850,
    material: "Gold finished brass, hand-fired rose enamel",
    weight: "18 g",
    dimensions: "5 cm hoop diameter",
    craftsmanshipNotes: "Fine kiln-cured pink enamel accents with cascading micro-pearl droplets.",
    availability: "In Stock",
    tag: "Few Left",
  },
  {
    id: "sc-05",
    name: "Kashmiri Jali Filigree Bangles (Pair)",
    slug: "kashmiri-jali-filigree-bangles",
    category: "Bangles",
    priceInr: 1100,
    originalPriceInr: 1350,
    material: "Antique gold electroplated brass",
    weight: "42 g (pair)",
    dimensions: "Sizes 2.4, 2.6, 2.8 available",
    craftsmanshipNotes: "Openwork floral lattice wire drawing inspired by traditional Chinar leaves.",
    availability: "In Stock",
    tag: "Festive Pair",
  },
  {
    id: "sc-06",
    name: "Guttapusalu Pearl Bunch Rani Haar",
    slug: "guttapusalu-pearl-rani-haar",
    category: "Necklaces",
    priceInr: 2450,
    material: "Temple gold brass, synthetic rubies, pearl bunches",
    weight: "115 g",
    dimensions: "Necklace 24 inches with back dori",
    craftsmanshipNotes: "Cluster pearl tassels framing cabochon ruby accents. A hallmark South Indian royal silhouette.",
    availability: "Made to Order",
    tag: "Bridal Heirloom",
  },
  {
    id: "sc-07",
    name: "Traditional Brahmani Basra Pearl Nath",
    slug: "brahmani-basra-pearl-nath",
    category: "Nath",
    priceInr: 399,
    material: "Gold plated brass, simulated pearls, ruby crystal",
    weight: "6 g",
    dimensions: "Comfort left-septum press clip",
    craftsmanshipNotes: "Authentic Peshwai silhouette featuring curved teardrop pearl framing and non-pierced secure tension clip.",
    availability: "In Stock",
    tag: "Maharashtrian Special",
  },
  {
    id: "sc-08",
    name: "Kolhapuri Saaj Motif Choker",
    slug: "kolhapuri-saaj-choker",
    category: "Sets",
    priceInr: 949,
    material: "Oxidised silver brass alloy, auspicious charm plaques",
    weight: "72 g",
    dimensions: "Collar 34 cm + extension link",
    craftsmanshipNotes: "Traditional Maharashtrian 21-charm auspicious leaves reinterpreted in modern wearable oxidised silver.",
    availability: "In Stock",
    tag: "Occasion Wear",
  },
];

export function formatINR(val: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
}

export function buildWhatsAppLink(productName: string, price: number, refCode?: string): string {
  const code = refCode ? ` [Item: ${refCode}]` : "";
  const message = encodeURIComponent(
    `Namaste Shambhavi Creation! 🙏 I would like to order: *${productName}* (${formatINR(price)})${code}. Please share payment details and delivery estimate for Chh. Sambhajinagar/courier.`
  );
  return `https://wa.me/919156131162?text=${message}`;
}
