import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Heart,
  ShoppingBag,
  Star,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  CheckCircle2,
  Share2,
  X,
  Eye,
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
  Play,
  Menu,
} from "lucide-react";
import { AdminPanel } from "./components/AdminPanel";
import { resolveAsset } from "./utils";

interface Product {
  id: string;
  name: string;
  category: "all" | "under-1000" | "festive" | "polki" | "earrings" | "necklaces" | "rings" | "bangles";
  categoryLabel: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewsCount: number;
  image: string;
  badge?: {
    text: string;
    variant: "new" | "few-left" | "bestseller";
  };
  plating: string;
  stones: string;
  description: string;
  shippingStatus: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const CATEGORY_TABS = [
  { id: "all", label: "All Pieces" },
  { id: "necklaces", label: "Mangalsutra & Sets" },
  { id: "under-1000", label: "Under ₹1,000" },
  { id: "festive", label: "Festive Ready" },
  { id: "polki", label: "Kundan & Polki" },
  { id: "earrings", label: "Earrings" },
  { id: "rings", label: "Rings" },
  { id: "bangles", label: "Bangles & Kadas" },
];

const CIRCULAR_STORIES = [
  { name: "Wati Mangalsutra", image: "/photos/shambhavi_signature_wati_haar.jpg", tab: "necklaces" },
  { name: "Bridal Kadas", image: "/photos/jadau_ruby_emerald_kadas.jpg", tab: "bangles" },
  { name: "Temple Sets", image: "/photos/south_temple_peacock_haar.jpg", tab: "festive" },
  { name: "Patli Bangles", image: "/photos/classic_patli_tode_bangles.jpg", tab: "bangles" },
  { name: "Traditional Look", image: "/photos/photo_18.jpg", tab: "necklaces" },
  { name: "Under ₹1,000", image: "/photos/photo_12.jpg", tab: "under-1000" },
  { name: "Emerald Kadas", image: "/photos/russian_emerald_royal_bangles.jpg", tab: "bangles" },
];

const CATALOG_PRODUCTS: Product[] = [
  {
    id: "p-photo-9",
    name: "Shambhavi Signature 3-Line Wati Mangalsutra",
    category: "necklaces",
    categoryLabel: "Mangalsutra",
    price: 1599,
    originalPrice: 2299,
    rating: 5.0,
    reviewsCount: 184,
    image: "/photos/shambhavi_signature_wati_haar.jpg",
    badge: { text: "Original Click", variant: "bestseller" },
    plating: "Gold Plated Finish",
    stones: "Traditional Handcrafted Dual Wati with 3-Line Black & Gold Beads",
    description: "Signature 3-line traditional Maharashtrian Wati Mangalsutra crafted with delicate black beads, fluted gold beads, and rich gold polish.",
    shippingStatus: "Ready to Ship",
  },
  {
    id: "p-photo-1",
    name: "Heritage Jadau Ruby & Emerald Bridal Kadas",
    category: "bangles",
    categoryLabel: "Bangles & Kadas",
    price: 1699,
    originalPrice: 2399,
    rating: 5.0,
    reviewsCount: 142,
    image: "/photos/jadau_ruby_emerald_kadas.jpg",
    badge: { text: "Original Click", variant: "bestseller" },
    plating: "Antique Gold Finish",
    stones: "Jadau Rubies, Emeralds & Seed Pearl Border",
    description: "Exquisite pair of handcrafted bridal kadas with royal floral carving, fine seed pearls, and secure side lock. Fits comfortably on all wrists.",
    shippingStatus: "Ready to Ship",
  },
  {
    id: "p-photo-6",
    name: "South Indian Peacock Temple Haar Set",
    category: "festive",
    categoryLabel: "Festive Ready",
    price: 2199,
    originalPrice: 2999,
    rating: 4.9,
    reviewsCount: 118,
    image: "/photos/south_temple_peacock_haar.jpg",
    badge: { text: "Original Click", variant: "few-left" },
    plating: "Antique Matte Gold Finish",
    stones: "Peacock Motif Medallion with Ruby Cabochon Drop & Matching Studs",
    description: "Grand South Indian temple necklace set with an intricate peacock medallion, ruby gemstone drops, and matching temple stud earrings.",
    shippingStatus: "Ready to Ship",
  },
  {
    id: "p-photo-5",
    name: "Classic 24K Gold Polish Patli Tode Bangles (Set of 6)",
    category: "bangles",
    categoryLabel: "Bangles & Kadas",
    price: 1299,
    originalPrice: 1750,
    rating: 4.9,
    reviewsCount: 156,
    image: "/photos/classic_patli_tode_bangles.jpg",
    badge: { text: "Original Click", variant: "bestseller" },
    plating: "24K Gold Polish Finish",
    stones: "Twisted Wire Rope Carving (Set of 6 Bangles)",
    description: "Traditional daily and festive wear twisted wire bangles stack in pure yellow gold polish. Lightweight, smooth edges, and long lasting.",
    shippingStatus: "Ready to Ship",
  },
  {
    id: "p-photo-11",
    name: "Double-Chain Floral Wati Mangalsutra",
    category: "necklaces",
    categoryLabel: "Mangalsutra",
    price: 1399,
    originalPrice: 1899,
    rating: 4.9,
    reviewsCount: 126,
    image: "/photos/photo_11.jpg",
    badge: { text: "Original Click", variant: "new" },
    plating: "Gold Plated Finish",
    stones: "Floral Sunburst Wati with Dual Gold & Black Bead Chains",
    description: "Double-chain traditional Wati Mangalsutra featuring delicately carved floral sunburst wati pendants and auspicious black beads.",
    shippingStatus: "Ready to Ship",
  },
  {
    id: "p-photo-3",
    name: "Peshwai Ruby Cluster Antique Kadas (Pair)",
    category: "bangles",
    categoryLabel: "Bangles & Kadas",
    price: 1549,
    originalPrice: 2199,
    rating: 5.0,
    reviewsCount: 94,
    image: "/photos/peshwai_ruby_cluster_kadas.jpg",
    badge: { text: "Original Click", variant: "bestseller" },
    plating: "Antique Gold Finish",
    stones: "Raised Ruby & Emerald Floral Domes with Intricate Beading",
    description: "Classic Peshwai dome-carved kadas pair with deep ruby stones and side opening hinge for an effortless fit.",
    shippingStatus: "Ready to Ship",
  },
  {
    id: "p-photo-4",
    name: "Royal Russian Emerald & Ruby Bridal Bangles",
    category: "bangles",
    categoryLabel: "Bangles & Kadas",
    price: 1499,
    originalPrice: 1999,
    rating: 4.9,
    reviewsCount: 88,
    image: "/photos/russian_emerald_royal_bangles.jpg",
    badge: { text: "Original Click", variant: "new" },
    plating: "Antique Gold Finish",
    stones: "Mint Green Russian Emeralds with Pearl Bead Framing",
    description: "Statement openable bridal bangles pair featuring square mint emerald stones, ruby florets, and micro-pearl borders.",
    shippingStatus: "Ready to Ship",
  },
  {
    id: "p-photo-8",
    name: "Temple Medallion Haar & Studs Set",
    category: "festive",
    categoryLabel: "Festive Ready",
    price: 1999,
    originalPrice: 2699,
    rating: 4.9,
    reviewsCount: 76,
    image: "/photos/temple_floral_medallion_necklace.jpg",
    badge: { text: "Original Click", variant: "few-left" },
    plating: "Antique Matte Gold",
    stones: "Carved Medallion with Ruby Center & Matching Tops",
    description: "Royal temple haar designed with layered leaf motifs, ruby gemstones, and matching temple tops. Perfect for silk sarees.",
    shippingStatus: "Ready to Ship",
  },
  {
    id: "p-photo-10",
    name: "Shambhavi Diamond Floral Wati Set with Bangles",
    category: "necklaces",
    categoryLabel: "Mangalsutra",
    price: 1449,
    originalPrice: 1999,
    rating: 5.0,
    reviewsCount: 112,
    image: "/photos/shambhavi_diamond_wati_set.jpg",
    badge: { text: "Original Click", variant: "bestseller" },
    plating: "Gold Plated Finish",
    stones: "Diamond Floret Wati, Black Bead Chain & Pair of Gold Bangles",
    description: "Festive set including an American diamond floret wati mangalsutra and a pair of textured gold bangles in a luxury presentation box.",
    shippingStatus: "Ready to Ship",
  },
  {
    id: "p-photo-18",
    name: "Long Traditional Wati Mangalsutra & Model Set",
    category: "necklaces",
    categoryLabel: "Mangalsutra",
    price: 1499,
    originalPrice: 2100,
    rating: 5.0,
    reviewsCount: 138,
    image: "/photos/photo_18.jpg",
    badge: { text: "Original Click", variant: "bestseller" },
    plating: "Gold Plated Finish",
    stones: "Long 2-Line Wati Mangalsutra with Fluted Gold Beads",
    description: "Graceful long-line traditional Wati Mangalsutra as seen on our model. Auspicious and timeless piece for everyday elegance.",
    shippingStatus: "Ready to Ship",
  },
  {
    id: "p-photo-17",
    name: "Ruby Halo Floral Wati Mangalsutra & Bangles Set",
    category: "festive",
    categoryLabel: "Festive Ready",
    price: 1399,
    originalPrice: 1899,
    rating: 4.9,
    reviewsCount: 96,
    image: "/photos/photo_17.jpg",
    badge: { text: "Original Click", variant: "new" },
    plating: "Gold Plated Finish",
    stones: "Ruby Halo Watis, Black Bead Strand & Pair of Bangles",
    description: "Vibrant ruby stone centered in sparkling crystal halos with matching gold-finish bangles on pure silk styling.",
    shippingStatus: "Ready to Ship",
  },
  {
    id: "p-photo-15",
    name: "Shambhavi 4-Line Kolhapuri Wati Haar",
    category: "necklaces",
    categoryLabel: "Mangalsutra",
    price: 1649,
    originalPrice: 2299,
    rating: 5.0,
    reviewsCount: 84,
    image: "/photos/photo_15.jpg",
    badge: { text: "Original Click", variant: "few-left" },
    plating: "Gold Plated Finish",
    stones: "4-Line Black & Gold Beads with Ruby Seed Droplets",
    description: "Grand 4-line Kolhapuri style wati haar with hanging ruby seed beads and floral repoussé work. Distinctive traditional look.",
    shippingStatus: "Ready to Ship",
  },
  {
    id: "p-photo-12",
    name: "Classic Gold Wati Necklace & Bangles Duo",
    category: "under-1000",
    categoryLabel: "Under ₹1,000",
    price: 999,
    originalPrice: 1499,
    rating: 4.8,
    reviewsCount: 162,
    image: "/photos/photo_12.jpg",
    badge: { text: "Under ₹1,000", variant: "bestseller" },
    plating: "Gold Plated Finish",
    stones: "Carved Golden Wati with Matching Textured Bangles",
    description: "All-gold traditional look with fluted golden wati pendants and a pair of textured daily-wear bangles under ₹1,000.",
    shippingStatus: "Ready to Ship",
  },
  {
    id: "p-photo-19",
    name: "Geometric Ruby Diamond Wati Set with Bangles",
    category: "under-1000",
    categoryLabel: "Under ₹1,000",
    price: 949,
    originalPrice: 1399,
    rating: 4.9,
    reviewsCount: 108,
    image: "/photos/photo_19.jpg",
    badge: { text: "Under ₹1,000", variant: "new" },
    plating: "Gold Plated Finish",
    stones: "Rhombus Ruby & Zirconia Wati with Pair of Bangles",
    description: "Modern geometric rhombus pendant set with ruby center stone, accompanied by two smooth gold bangles.",
    shippingStatus: "Ready to Ship",
  },
  {
    id: "p-photo-13",
    name: "Emerald Cut Solitaire Mangalsutra Set",
    category: "necklaces",
    categoryLabel: "Mangalsutra",
    price: 1199,
    originalPrice: 1699,
    rating: 4.9,
    reviewsCount: 92,
    image: "/photos/photo_13.jpg",
    badge: { text: "Original Click", variant: "new" },
    plating: "Gold Plated Finish",
    stones: "Emerald-Cut Center Diamond & Diamond Halo with Bangles",
    description: "Regal emerald-cut centerpiece framed in sparkling halo crystals, complete with two gold bangles.",
    shippingStatus: "Ready to Ship",
  },
  {
    id: "p-photo-2",
    name: "Carved Royal Openable Bridal Bangles (Pair)",
    category: "bangles",
    categoryLabel: "Bangles & Kadas",
    price: 1449,
    originalPrice: 1999,
    rating: 4.9,
    reviewsCount: 78,
    image: "/photos/photo_2.jpg",
    badge: { text: "Original Click", variant: "bestseller" },
    plating: "24K Gold Polish Finish",
    stones: "Intricate Filigree & Ruby Floral Accents",
    description: "Exquisite filigree openable bangles pair with ruby stone center florets and side clip hinge.",
    shippingStatus: "Ready to Ship",
  },
  {
    id: "p-flagship-1",
    name: "Round Solitaire Floral Mangalsutra Combo",
    category: "necklaces",
    categoryLabel: "Mangalsutra",
    price: 1499,
    originalPrice: 2199,
    rating: 5.0,
    reviewsCount: 168,
    image: "/products/solitaire_mangalsutra_combo.jpg",
    badge: { text: "Original Click", variant: "bestseller" },
    plating: "Gold Plated Finish",
    stones: "American Diamond Pendant with Black Beads & Dual Bangles",
    description: "Complete festive combo set: fine gold-finish mangalsutra necklace, matching ear climber studs, and a pair of classic smooth bangles.",
    shippingStatus: "Ready to Ship",
  },
  {
    id: "p-flagship-2",
    name: "Butterfly Diamond Motif Mangalsutra Set",
    category: "necklaces",
    categoryLabel: "Mangalsutra",
    price: 1199,
    originalPrice: 1699,
    rating: 4.9,
    reviewsCount: 114,
    image: "/products/butterfly_motif_set.jpg",
    badge: { text: "Original Click", variant: "new" },
    plating: "Gold Plated Finish",
    stones: "Crystal Butterfly Motif with Matching Studs & Bangles",
    description: "Charming butterfly centerpiece adorned with micro-stones, accompanied by matching butterfly stud earrings and gold bangles.",
    shippingStatus: "Ready to Ship",
  },
  {
    id: "p-flagship-3",
    name: "Teardrop Floral Pendant Mangalsutra Set",
    category: "festive",
    categoryLabel: "Festive Ready",
    price: 1349,
    originalPrice: 1950,
    rating: 5.0,
    reviewsCount: 92,
    image: "/products/teardrop_floral_set.jpg",
    badge: { text: "Original Click", variant: "few-left" },
    plating: "Gold Plated Finish",
    stones: "Teardrop Crystal Drop with Mini Hoops & Bangles",
    description: "Graceful teardrop pendant with floral crown detailing, complete with pavé hoop earrings and gold bangles.",
    shippingStatus: "Ready to Ship",
  },
  {
    id: "p-flagship-4",
    name: "Sunbeam Crescent Moon Mangalsutra Set",
    category: "under-1000",
    categoryLabel: "Under ₹1,000",
    price: 999,
    originalPrice: 1450,
    rating: 4.8,
    reviewsCount: 88,
    image: "/products/crescent_moon_set.jpg",
    badge: { text: "Under ₹1,000", variant: "bestseller" },
    plating: "Gold Plated Finish",
    stones: "Radiant Crescent Motif with Bow Pearl Studs & Bangles",
    description: "Auspicious sun-crescent pendant paired with sweet pearl bow earrings and classic gold bangles.",
    shippingStatus: "Ready to Ship",
  },
  {
    id: "p-flagship-5",
    name: "Tri-Leaf Arch Diamond Mangalsutra Set",
    category: "necklaces",
    categoryLabel: "Mangalsutra",
    price: 1299,
    originalPrice: 1899,
    rating: 4.9,
    reviewsCount: 104,
    image: "/products/tri_leaf_mangalsutra_set.jpg",
    badge: { text: "Original Click", variant: "new" },
    plating: "Gold Plated Finish",
    stones: "Pavé Zirconia Tri-Leaf Pendant & Drop Earrings",
    description: "Modern tri-leaf arch pendant strung on delicate black and gold beads, paired with geometric statement drop earrings.",
    shippingStatus: "Ready to Ship",
  },
  {
    id: "p-flagship-6",
    name: "Royal Solitaire Halo Mangalsutra Set",
    category: "necklaces",
    categoryLabel: "Mangalsutra",
    price: 1249,
    originalPrice: 1799,
    rating: 4.9,
    reviewsCount: 76,
    image: "/products/cushion_halo_set.jpg",
    badge: { text: "Original Click", variant: "new" },
    plating: "Gold Plated Finish",
    stones: "Brilliant Solitaire Halo & Cushion Studs with Bangles",
    description: "Timeless solitaire framed by a delicate halo ring, with matching cushion-cut stud earrings and sleek gold bangles.",
    shippingStatus: "Ready to Ship",
  },
  {
    id: "p-flagship-7",
    name: "Crown Heart Chevron Mangalsutra Set",
    category: "festive",
    categoryLabel: "Festive Ready",
    price: 1399,
    originalPrice: 1999,
    rating: 5.0,
    reviewsCount: 82,
    image: "/products/chevron_heart_set.jpg",
    badge: { text: "Original Click", variant: "few-left" },
    plating: "Gold Plated Finish",
    stones: "Chevron Heart Pendant & Triangular Pearl Studs with Bangles",
    description: "Delicate chevron curve holding a radiant heart floral crest, complemented by pearl stud earrings and bangles.",
    shippingStatus: "Ready to Ship",
  },
  {
    id: "p-flagship-8",
    name: "Minimalist Halo Solitaire Mangalsutra Set",
    category: "under-1000",
    categoryLabel: "Under ₹1,000",
    price: 899,
    originalPrice: 1299,
    rating: 4.8,
    reviewsCount: 96,
    image: "/products/halo_solitaire_set.jpg",
    badge: { text: "Under ₹1,000", variant: "bestseller" },
    plating: "Gold Plated Finish",
    stones: "Round Halo Solitaire & Floral Studs",
    description: "Clean modern design ideal for daily workwear and festive occasions. Comes in a luxury keepsake box.",
    shippingStatus: "Ready to Ship",
  },
  {
    id: "p-gulabi",
    name: "Gulabi Meenakari Jhumkas",
    category: "earrings",
    categoryLabel: "Earrings",
    price: 849,
    originalPrice: 1299,
    rating: 4.9,
    reviewsCount: 142,
    image: "/images/gulabi_jhumkas.png",
    badge: { text: "New", variant: "new" },
    plating: "Antique Gold Finish",
    stones: "Hand-painted pink enamel & pearl clusters",
    description: "Traditional dome-shaped jhumkas with delicate pink enamel work, floral carving, and pearl drops. 5.5 cm length.",
    shippingStatus: "Ready to Ship",
  },
  {
    id: "p1",
    name: "Jaipur Antique Kundan & Pearl Choker Set",
    category: "polki",
    categoryLabel: "Kundan & Polki",
    price: 2499,
    originalPrice: 3499,
    rating: 4.9,
    reviewsCount: 142,
    image: "/photos/south_temple_peacock_haar.jpg",
    badge: { text: "New Arrival", variant: "new" },
    plating: "Antique Gold Finish",
    stones: "Polki glass stones & pearl drops",
    description: "Traditional kundan choker set with matching earrings and adjustable thread string.",
    shippingStatus: "Ready to Ship",
  },
  {
    id: "p2",
    name: "Royal Peacock Chaandbalis",
    category: "earrings",
    categoryLabel: "Earrings",
    price: 999,
    originalPrice: 1350,
    rating: 5.0,
    reviewsCount: 96,
    image: "/photos/photo_6.jpg",
    badge: { text: "Bestseller", variant: "bestseller" },
    plating: "Gold Plated Finish",
    stones: "Ruby red enamel & polki stones",
    description: "Lightweight and comfortable chaandbali earrings inspired by royal Rajasthani designs. Perfect for festivals.",
    shippingStatus: "Ready to Ship",
  },
  {
    id: "p3",
    name: "Classic Solitaire Claw Ring",
    category: "rings",
    categoryLabel: "Rings",
    price: 849,
    originalPrice: 1199,
    rating: 4.8,
    reviewsCount: 188,
    image: "/images/feature_rings.jpg",
    badge: { text: "Few Left", variant: "few-left" },
    plating: "Gold Plated Finish",
    stones: "Sparkling American Diamond Solitaire",
    description: "Elegant solitaire ring with a secure claw setting. Designed for comfortable everyday wear.",
    shippingStatus: "Ready to Ship",
  },
  {
    id: "p4",
    name: "Heritage Jadau Floral Openable Kada",
    category: "bangles",
    categoryLabel: "Bangles & Kadas",
    price: 1699,
    originalPrice: 2299,
    rating: 4.9,
    reviewsCount: 78,
    image: "/images/heritage_kada.jpg",
    badge: { text: "Few Left", variant: "few-left" },
    plating: "Matte Gold Finish",
    stones: "Emerald green stones & pearl border",
    description: "Easy openable screw-lock kada that fits all wrist sizes. Detailed floral carving with smooth inner finish.",
    shippingStatus: "Ready to Ship",
  },
];

const TESTIMONIALS = [
  {
    id: "t1",
    name: "Priya Somani",
    city: "Chh. Sambhajinagar",
    role: "Verified Customer",
    quote: "“The Jaipur Polki choker arrived beautifully packed with a personal card. The gold finish looks just like real gold!”",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  },
  {
    id: "t2",
    name: "Ayesha Kothari",
    city: "Mumbai",
    role: "Regular Customer",
    quote: "“I’ve ordered multiple times from Shambhavi. The finish is lovely and ordering directly on WhatsApp is so easy.”",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
  },
  {
    id: "t3",
    name: "Rohan & Sneha",
    city: "Bengaluru",
    role: "Anniversary Gift",
    quote: "“Ordered the Solitaire ring and tennis necklace. Beautifully packed, quickly delivered, and arrived right on our anniversary!”",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
  },
];

interface SocialItem {
  id: string;
  type: "reel" | "post";
  category: "all" | "reels" | "bridal";
  title: string;
  caption: string;
  url: string;
  thumbnail: string;
  views?: string;
  tag: string;
}

const INSTAGRAM_COMMUNITY: SocialItem[] = [
  {
    id: "reel-1",
    type: "reel",
    category: "reels",
    title: "Festive Bangles & Paithani Styling",
    caption: "Traditional 24K gold polish bangles stack styled with classic silk saree in Chh. Sambhajinagar ✨",
    url: "https://www.instagram.com/shambhavii_creations/reel/Dejo0mSt5hM/",
    thumbnail: "/photos/hero_model_bangles.jpg",
    views: "14.2K",
    tag: "Trending Look",
  },
  {
    id: "reel-2",
    type: "reel",
    category: "reels",
    title: "South Peacock Temple Haar Reveal",
    caption: "Intricately carved South Indian temple set with ruby cabochon drops ♡",
    url: "https://www.instagram.com/shambhavii_creations/reel/Deeyg8MtgGe/",
    thumbnail: "/photos/south_temple_peacock_haar.jpg",
    views: "28.6K",
    tag: "Temple Series",
  },
  {
    id: "reel-3",
    type: "reel",
    category: "reels",
    title: "Peshwai Ruby Cluster Kadas",
    caption: "Handcrafted antique gold finish kadas pair with dome flower carvings 📦",
    url: "https://www.instagram.com/shambhavii_creations/reel/DeBDWyCs74J/",
    thumbnail: "/photos/peshwai_ruby_cluster_kadas.jpg",
    views: "19.4K",
    tag: "Bangles Click",
  },
  {
    id: "post-1",
    type: "post",
    category: "bridal",
    title: "Bespoke Bridal Nail Studio by Pallavi",
    caption: "Professional French ombre nails with crystal embellishments 💅🏻",
    url: "https://www.instagram.com/shambhavii_creations/p/Deq5bypjXvv/",
    thumbnail: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=600&auto=format&fit=crop&q=80",
    tag: "Nail Studio",
  },
  {
    id: "reel-4",
    type: "reel",
    category: "bridal",
    title: "Festive Ready-Made Rangoli Setting",
    caption: "Handcrafted reusable peacock motif rangoli for Diwali & weddings 🦚",
    url: "https://www.instagram.com/shambhavii_creations/reel/Dd8i6TbtPUA/",
    thumbnail: "/images/feature_gift.jpg",
    views: "32.1K",
    tag: "Ready Rangoli",
  },
  {
    id: "post-2",
    type: "post",
    category: "all",
    title: "Signature Floral Wati Mangalsutra",
    caption: "Authentic double-chain wati mangalsutra with auspicious black beads ✨",
    url: "https://www.instagram.com/shambhavii_creations/p/DelYRzFjerU/",
    thumbnail: "/photos/photo_11.jpg",
    tag: "Original Click",
  },
];

export default function App() {
  const [currentView, setCurrentView] = useState<"storefront" | "admin">(() => {
    return window.location.hash === "#admin" ? "admin" : "storefront";
  });
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem("shambhavi_products_catalog_v2");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return CATALOG_PRODUCTS;
  });
  const [announcementText, setAnnouncementText] = useState<string>(() => {
    return (
      localStorage.getItem("shambhavi_announcement_text") ||
      "SHIPPING ALL ACROSS INDIA • DIRECT WHATSAPP ORDERS • HANDCRAFTED IN CHH. SAMBHAJINAGAR"
    );
  });

  useEffect(() => {
    try {
      localStorage.setItem("shambhavi_products_catalog_v2", JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  useEffect(() => {
    localStorage.setItem("shambhavi_announcement_text", announcementText);
  }, [announcementText]);

  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === "#admin") {
        setCurrentView("admin");
      } else if (window.location.hash === "#store" || window.location.hash === "") {
        setCurrentView("storefront");
      }
    };
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const [activeTab, setActiveTab] = useState<string>("all");
  const [isCategoriesOpen, setIsCategoriesOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState<boolean>(true);
  const [socialTab, setSocialTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [emailInput, setEmailInput] = useState<string>("");
  const [subscribed, setSubscribed] = useState<boolean>(false);

  // Filter products based on selected tab & search query
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.stones.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeTab === "all") return true;
      if (activeTab === "under-1000") return item.price <= 1000;
      if (activeTab === "festive") return item.category === "festive" || item.category === "polki";
      return item.category === activeTab;
    });
  }, [products, activeTab, searchQuery]);

  const toggleWishlist = (id: string) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const totalCartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const handleOrderWhatsApp = (productName: string, price: number) => {
    const message = encodeURIComponent(
      `Hi Shambhavi Creation! I would like to order: *${productName}* (₹${price.toLocaleString()}). Please confirm availability & delivery details.`
    );
    window.open(`https://wa.me/919156131162?text=${message}`, "_blank");
  };

  const handleCheckoutWhatsAppCart = () => {
    if (cart.length === 0) return;
    const itemList = cart
      .map(
        (item, index) =>
          `${index + 1}. *${item.product.name}* (Qty: ${item.quantity}) - ₹${(
            item.product.price * item.quantity
          ).toLocaleString()}`
      )
      .join("\n");

    const message = encodeURIComponent(
      `Hello Shambhavi Creation! I would like to place an order for the following curated pieces:\n\n${itemList}\n\n*Total Order Value:* ₹${cartTotal.toLocaleString()}\n*Shipping:* FREE (Standard Express)\n\nPlease share payment details and delivery timeframe.`
    );
    window.open(`https://wa.me/919156131162?text=${message}`, "_blank");
  };

  if (currentView === "admin") {
    return (
      <AdminPanel
        products={products}
        setProducts={setProducts}
        onBackToStore={() => {
          setCurrentView("storefront");
          window.location.hash = "#store";
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        announcementText={announcementText}
        setAnnouncementText={setAnnouncementText}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#1F1E1D] font-sans antialiased selection:bg-[#9E7D4B] selection:text-white">

      {/* ── 1. Clean Luxury Navigation Header ───────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#F0ECE6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Menu Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 -ml-1 text-[#1F1E1D] hover:text-[#9E7D4B] transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Brand Logo Wordmark */}
            <a href="#" className="flex flex-col text-left group">
              <span className="font-serif-luxury font-semibold text-xl sm:text-2xl md:text-3xl tracking-[0.06em] sm:tracking-[0.08em] text-[#1F1E1D] leading-none group-hover:text-[#9E7D4B] transition-colors">
                SHAMBHAVI
              </span>
              <span className="text-[0.52rem] sm:text-[0.62rem] uppercase tracking-[0.18em] sm:tracking-[0.3em] text-[#9E7D4B] font-semibold mt-1">
                FINE JEWELLERY • CHH. SAMBHAJINAGAR
              </span>
            </a>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-8 text-[0.82rem] font-medium tracking-wide text-[#4A4744]">
            <a href="#" className="text-[#1F1E1D] hover:text-[#9E7D4B] transition-colors">
              Home
            </a>

            {/* Direct Catalog Link to All Pieces */}
            <button
              onClick={() => {
                setActiveTab("all");
                const el = document.getElementById("catalog");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="hover:text-[#9E7D4B] transition-colors font-medium text-[0.82rem] text-[#4A4744] cursor-pointer"
            >
              Catalog
            </button>

            {/* Interactive Categories Dropdown */}
            <div className="relative" onMouseLeave={() => setIsCategoriesOpen(false)}>
              <button
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                onMouseEnter={() => setIsCategoriesOpen(true)}
                className="hover:text-[#9E7D4B] transition-colors flex items-center gap-1 text-[0.82rem] font-medium text-[#4A4744] cursor-pointer"
              >
                <span>Categories</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isCategoriesOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isCategoriesOpen && (
                <div
                  onMouseEnter={() => setIsCategoriesOpen(true)}
                  className="absolute top-full left-0 mt-2 w-64 bg-white border border-[#EAE5DC] shadow-xl rounded-[2px] py-2 z-50 text-left"
                >
                  <div className="px-3 py-1.5 text-[0.65rem] uppercase tracking-wider text-[#9E7D4B] font-bold border-b border-[#F0ECE6] mb-1">
                    Select Jewelry Category
                  </div>
                  {CATEGORY_TABS.filter((t) => t.id !== "all").map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setActiveTab(cat.id);
                        setIsCategoriesOpen(false);
                        const el = document.getElementById("catalog");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="w-full px-3 py-2 text-xs text-[#1F1E1D] hover:bg-[#FAF8F5] hover:text-[#9E7D4B] flex items-center justify-between text-left transition-colors cursor-pointer"
                    >
                      <span>{cat.label}</span>
                      <span className="text-[0.65rem] text-[#78746F]">
                        {
                          products.filter((p) =>
                            cat.id === "under-1000"
                              ? p.price <= 1000
                              : cat.id === "festive"
                              ? p.category === "festive" || p.category === "polki"
                              : p.category === cat.id
                          ).length
                        }
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <a href="#reviews" className="hover:text-[#9E7D4B] transition-colors">
              Reviews
            </a>
            <a href="#instagram" className="hover:text-[#9E7D4B] transition-colors">
              Community
            </a>
            <a
              href="https://wa.me/919156131162"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1FA855] font-semibold flex items-center gap-1.5 hover:underline"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#1FA855]" />
              WhatsApp
            </a>
          </nav>

          {/* Right Action Icons (Interactive Search, Wishlist, Cart Drawer) - Admin Button Hidden */}
          <div className="flex items-center space-x-2.5 sm:space-x-4 text-[#1F1E1D]">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-1.5 hover:text-[#9E7D4B] transition-colors cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-5 h-5 stroke-[1.5]" />
            </button>

            <button
              onClick={() => setIsWishlistOpen(true)}
              className="p-1.5 hover:text-[#9E7D4B] transition-colors relative cursor-pointer"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 stroke-[1.5]" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#9E7D4B] text-white text-[0.62rem] rounded-full flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="p-1.5 hover:text-[#9E7D4B] transition-colors relative cursor-pointer"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#1F1E1D] text-white text-[0.62rem] rounded-full flex items-center justify-center font-bold">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer / Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white/98 backdrop-blur-md border-t border-[#F0ECE6] px-5 py-5 animate-in slide-in-from-top-2 duration-200 shadow-2xl text-left">
            <div className="flex flex-col space-y-1">
              {/* Home */}
              <a
                href="#"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-3 text-sm font-serif-luxury text-[#1F1E1D] hover:text-[#9E7D4B] border-b border-[#FAF8F5] flex items-center justify-between transition-colors"
              >
                <span>Home</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#C8B89C]" />
              </a>

              {/* Complete Catalog */}
              <button
                onClick={() => {
                  setActiveTab("all");
                  setIsMobileMenuOpen(false);
                  const el = document.getElementById("catalog");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="py-3 text-sm font-serif-luxury text-[#1F1E1D] hover:text-[#9E7D4B] border-b border-[#FAF8F5] flex items-center justify-between w-full text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span>Complete Catalog</span>
                  <span className="text-[0.65rem] font-sans font-semibold bg-[#FAF8F5] text-[#9E7D4B] px-2 py-0.5 rounded-full border border-[#EAE5DC]">
                    {products.length} Designs
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#C8B89C]" />
              </button>

              {/* Collapsible Categories Accordion */}
              <div className="border-b border-[#FAF8F5] py-1">
                <button
                  onClick={() => setIsMobileCategoriesOpen(!isMobileCategoriesOpen)}
                  className="py-2.5 text-sm font-serif-luxury text-[#1F1E1D] hover:text-[#9E7D4B] flex items-center justify-between w-full text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span>Shop by Category</span>
                    <span className="text-[0.62rem] font-sans uppercase tracking-wider text-[#9E7D4B] font-bold">
                      ({CATEGORY_TABS.filter((t) => t.id !== "all").length} Collections)
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#9E7D4B] transition-transform duration-200 ${
                      isMobileCategoriesOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isMobileCategoriesOpen && (
                  <div className="pb-2 pt-1 pl-2 space-y-1 animate-in fade-in duration-200">
                    {CATEGORY_TABS.filter((t) => t.id !== "all").map((cat) => {
                      const count = products.filter((p) =>
                        cat.id === "under-1000"
                          ? p.price <= 1000
                          : cat.id === "festive"
                          ? p.category === "festive" || p.category === "polki"
                          : p.category === cat.id
                      ).length;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setActiveTab(cat.id);
                            setIsMobileMenuOpen(false);
                            const el = document.getElementById("catalog");
                            if (el) el.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="w-full py-2 px-3 text-xs font-sans text-[#4A4744] hover:text-[#9E7D4B] hover:bg-[#FAF8F5] rounded-[2px] flex items-center justify-between transition-colors text-left cursor-pointer"
                        >
                          <span className="font-medium">{cat.label}</span>
                          <span className="text-[0.65rem] text-[#9E7D4B] font-semibold bg-[#FAF8F5] px-2 py-0.5 rounded-full border border-[#EAE5DC]/60">
                            {count} designs
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Reviews */}
              <a
                href="#reviews"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-3 text-sm font-serif-luxury text-[#1F1E1D] hover:text-[#9E7D4B] border-b border-[#FAF8F5] flex items-center justify-between transition-colors"
              >
                <span>Customer Reviews</span>
                <span className="text-[0.68rem] font-sans text-[#9E7D4B] font-semibold">★ 4.9 Rating</span>
              </a>

              {/* Community & Instagram Reels */}
              <a
                href="#instagram"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-3 text-sm font-serif-luxury text-[#1F1E1D] hover:text-[#9E7D4B] border-b border-[#FAF8F5] flex items-center justify-between transition-colors"
              >
                <span>Community & Studio Reels</span>
                <span className="text-[0.68rem] font-sans text-[#E1306C] font-semibold">@shambhavii_creations</span>
              </a>

              {/* WhatsApp direct CTA */}
              <div className="pt-3">
                <a
                  href="https://wa.me/919156131162?text=Hello%20Shambhavi%20Creations%2C%20I%20am%20browsing%20your%20jewellery%20catalog"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-2.5 bg-[#1FA855] hover:bg-[#1B944B] text-white rounded-[2px] text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>WhatsApp Inquiry: +91 91561 31162</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Expandable Live Search Bar (From Mihira Jewels catalog) */}
        {isSearchOpen && (
          <div className="bg-[#FAF8F5] border-t border-[#EAE5DC] px-4 py-3 transition-all duration-300">
            <div className="max-w-3xl mx-auto flex items-center gap-3">
              <Search className="w-4 h-4 text-[#78746F]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search earrings, chokers, rings, kundan, polki..."
                className="w-full bg-transparent text-sm text-[#1F1E1D] placeholder-[#78746F] focus:outline-none"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-[#78746F] hover:text-[#1F1E1D]"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 text-[#78746F] hover:text-[#1F1E1D]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── 3. Hero Section (Aurelia Fine Jewelry Aesthetic with Vogue Photography) ─ */}
      <section className="bg-[#FAF8F5] relative overflow-hidden border-b border-[#F0ECE6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Copy Column */}
            <div className="lg:col-span-6 space-y-6 text-left">


              <h1 className="font-serif-luxury text-4xl sm:text-5xl lg:text-6xl text-[#1F1E1D] font-normal leading-[1.12]">
                Jewelry That <br />
                <span className="italic font-normal">Tells Your Story</span>
              </h1>

              <p className="text-[#78746F] text-sm sm:text-base max-w-md leading-relaxed font-light">
                Artisanal Kundan polki, South Indian temple jewellery, and elegant daily wear. Handcrafted in Chh. Sambhajinagar with care.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <a href="#catalog" className="btn-bronze shadow-sm">
                  <span>EXPLORE CATALOG</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <a
                  href="#reviews"
                  className="btn-bronze-outline"
                >
                  CUSTOMER REVIEWS
                </a>
              </div>
            </div>

            {/* Right Photo Column with Handwritten Script Overlay */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-[2px] overflow-hidden shadow-lg aspect-square sm:aspect-[4/3] border border-[#EAE5DC]">
                <img
                  src={resolveAsset("/photos/hero_model_bangles.jpg")}
                  alt="Shambhavi Creations Traditional Look — Chh. Sambhajinagar"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                {/* Script overlay exactly like reference */}
                <div className="absolute bottom-6 right-6 text-right pointer-events-none drop-shadow-md">
                  <span className="font-serif-luxury italic text-xl sm:text-2xl text-white block leading-tight font-light">
                    More Than Jewelry,
                  </span>
                  <span className="font-serif-luxury italic text-2xl sm:text-3xl text-white font-normal">
                    A Feeling ♡
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ── 5. Curated Visual Stories (Quick Highlight Bubbles) ─────────────── */}
      <section id="categories" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-[0.68rem] uppercase tracking-[0.24em] text-[#9E7D4B] font-semibold block mb-1">
          CURATED VISUAL STORIES
        </span>
        <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#1F1E1D] font-normal">
          Trending Studio Stories
        </h2>
        <p className="text-xs sm:text-sm text-[#78746F] mt-2 max-w-md mx-auto">
          Tap any story circle to instantly filter by bridal looks, signature wati haars, and festive kadas.
        </p>

        {/* 7 Circular Category Bubbles with Clickable Tab Triggers (Mobile Horizontal Snap Scroll) */}
        <div className="mt-8 sm:mt-12 flex md:grid md:grid-cols-7 gap-4 sm:gap-4 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x snap-mandatory justify-start md:justify-center -mx-4 px-4 sm:mx-0">
          {CIRCULAR_STORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => {
                setActiveTab(cat.tab);
                const el = document.getElementById("catalog");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex flex-col items-center group cursor-pointer focus:outline-none shrink-0 snap-start w-20 sm:w-auto"
            >
              <div className="w-18 h-18 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-[#EAE5DC] group-hover:border-[#9E7D4B] transition-all duration-300 p-1 shadow-sm bg-white">
                <img
                  src={resolveAsset(cat.image)}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <span className="mt-2.5 text-[0.72rem] sm:text-xs font-medium text-[#1F1E1D] group-hover:text-[#9E7D4B] transition-colors text-center line-clamp-1">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ── 6. Interactive Complete Catalog & Product Showcase ───────────────── */}
      <section id="catalog" className="py-16 bg-[#FAF8F5] border-t border-[#F0ECE6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 text-left">
            <div>
              <span className="text-[0.68rem] uppercase tracking-[0.24em] text-[#9E7D4B] font-semibold block mb-1">
                COMPLETE CATALOG
              </span>
              <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#1F1E1D] font-normal">
                All Handcrafted Pieces ({products.length})
              </h2>
              <p className="text-xs sm:text-sm text-[#78746F] mt-1">
                Handcrafted with care in Chh. Sambhajinagar. Filter by category or search below.
              </p>
            </div>

            {/* Total Results Count */}
            <div className="mt-4 md:mt-0 text-xs text-[#78746F]">
              Showing <span className="font-semibold text-[#1F1E1D]">{filteredProducts.length}</span> handcrafted designs
            </div>
          </div>

          {/* Catalog Filter Pills (Signature layout touch from jewelry-catalog-one) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
            {CATEGORY_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 shrink-0 border ${
                    isActive
                      ? "bg-[#1F1E1D] text-white border-[#1F1E1D] shadow-xs"
                      : "bg-white text-[#4A4744] border-[#EAE5DC] hover:border-[#9E7D4B] hover:text-[#9E7D4B]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Product Cards Grid (Matching reference + catalog touches) */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-[2px] border border-[#EAE5DC] p-12 text-center max-w-md mx-auto my-8 space-y-4">
              <Sparkles className="w-8 h-8 text-[#9E7D4B] mx-auto stroke-[1.5]" />
              <h3 className="font-serif-luxury text-xl text-[#1F1E1D]">No pieces found</h3>
              <p className="text-xs text-[#78746F]">
                Try selecting another category or clearing your search term.
              </p>
              <button
                onClick={() => {
                  setActiveTab("all");
                  setSearchQuery("");
                }}
                className="btn-bronze text-xs py-2 px-4"
              >
                VIEW ALL DESIGNS
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {filteredProducts.map((product) => {
                const isWishlisted = wishlist.includes(product.id);
                const discount = Math.round(
                  ((product.originalPrice - product.price) / product.originalPrice) * 100
                );

                return (
                  <div
                    key={product.id}
                    className="group relative flex flex-col text-left cursor-pointer"
                    onClick={() => setQuickViewProduct(product)}
                  >
                    {/* Exact Image Container with 4:5 Aspect Ratio & Hairline Border */}
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-white border border-[#D9DCD8]/70 rounded-none shadow-2xs">
                      {/* 'New' Badge Top-Left in soft blush/rose tone exactly from screenshot */}
                      {product.badge && (
                        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 flex flex-col gap-1 pointer-events-none z-10">
                          <span className="bg-[#E9CFCB] text-[#1E2321] text-[10px] sm:text-[11px] font-sans font-medium px-1.5 sm:px-2 py-0.5 rounded-[2px] tracking-wide shadow-2xs">
                            {product.badge.text}
                          </span>
                        </div>
                      )}

                      {/* Wishlist Heart Button Top-Right: Circular white with outline heart */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product.id);
                        }}
                        className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 hover:bg-white flex items-center justify-center text-[#1E2321] transition-all z-10 shadow-2xs hover:scale-105"
                        aria-label="Save to wishlist"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${
                            isWishlisted
                              ? "fill-[#9C2B2B] text-[#9C2B2B] scale-110"
                              : "text-[#1E2321] stroke-[1.75]"
                          }`}
                        />
                      </button>

                      {/* Product Image */}
                      <img
                        src={resolveAsset(product.image)}
                        alt={product.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />

                      {/* Quick View Button Overlay on Hover (Desktop) */}
                      <div className="hidden lg:block absolute inset-x-2.5 bottom-2.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuickViewProduct(product);
                          }}
                          className="w-full py-2 bg-white/95 hover:bg-white text-[#1E2321] text-[12px] font-medium rounded-[3px] border border-[#D9DCD8] shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#17382F]" />
                          <span>Quick view</span>
                        </button>
                      </div>
                    </div>

                    {/* Product Title directly under image */}
                    <div className="mt-2 sm:mt-2.5 text-left">
                      <h3 className="font-sans font-medium text-[13px] sm:text-[15px] leading-snug text-[#1E2321] line-clamp-1 group-hover:text-[#9E7D4B] transition-colors">
                        {product.name}
                      </h3>
                    </div>

                    {/* Exact Price Line: Rs. 849  Rs. 1,299  35% off */}
                    <div className="mt-0.5 sm:mt-1 flex items-baseline gap-1.5 sm:gap-2 text-left flex-wrap">
                      <span className="font-sans font-semibold text-[13px] sm:text-[15px] text-[#1E2321] tabular-nums">
                        Rs. {product.price.toLocaleString()}
                      </span>
                      <span className="font-sans text-[11px] sm:text-[13px] text-[#717674] line-through tabular-nums">
                        Rs. {product.originalPrice.toLocaleString()}
                      </span>
                      <span className="font-sans text-[10px] sm:text-[12px] font-medium text-[#9C2B2B]">
                        {discount}% off
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── 7. Dual Editorial Feature Banners (50/50 Split from Aurelia) ───── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Promo Card: Crafted for Life's Special Moments */}
          <div className="relative rounded-[2px] overflow-hidden min-h-[380px] flex items-center justify-start p-8 sm:p-12 shadow-sm group border border-[#EAE5DC]">
            <img
              src={resolveAsset("/images/feature_rings.jpg")}
              alt="Crafted for Life's Special Moments"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/35" />
            <div className="relative z-10 text-left text-white max-w-xs space-y-4">
              <span className="text-[0.65rem] uppercase tracking-[0.2em] text-[#EAE5DC] font-semibold">
                BRIDAL HERITAGE
              </span>
              <h3 className="font-serif-luxury text-3xl sm:text-4xl leading-tight font-light">
                Crafted for Life's <br />
                <span className="italic font-normal">Special Moments</span>
              </h3>
              <button
                onClick={() => {
                  setActiveTab("festive");
                  const el = document.getElementById("catalog");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="btn-bronze bg-white/95 text-[#1F1E1D] hover:bg-white text-xs font-semibold py-2.5 px-5 rounded-[2px]"
              >
                <span>EXPLORE WEDDING</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* Right Promo Card: A Gift That Lasts Forever */}
          <div className="relative rounded-[2px] overflow-hidden min-h-[380px] flex items-center justify-start p-8 sm:p-12 shadow-sm group border border-[#EAE5DC]">
            <img
              src={resolveAsset("/images/feature_gift.jpg")}
              alt="A Gift That Lasts Forever"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/35" />
            <div className="relative z-10 text-left text-white max-w-xs space-y-4">
              <span className="text-[0.65rem] uppercase tracking-[0.2em] text-[#EAE5DC] font-semibold">
                CURATED GIFTING
              </span>
              <h3 className="font-serif-luxury text-3xl sm:text-4xl leading-tight font-light">
                A Gift That <br />
                <span className="italic font-normal">Lasts Forever</span>
              </h3>
              <button
                onClick={() => {
                  setActiveTab("under-1000");
                  const el = document.getElementById("catalog");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="btn-bronze bg-white/95 text-[#1F1E1D] hover:bg-white text-xs font-semibold py-2.5 px-5 rounded-[2px]"
              >
                <span>SHOP GIFTS</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </section>


      {/* ── 10. Customer Testimonials ("Loved by Thousands") ────────────────── */}
      <section id="reviews" className="py-16 bg-[#FAF8F5] border-t border-[#F0ECE6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10 text-left">
            <div>
              <span className="text-[0.68rem] uppercase tracking-[0.24em] text-[#9E7D4B] font-semibold block mb-1">
                WHAT OUR PATRONS SAY
              </span>
              <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#1F1E1D] font-normal">
                Loved by Thousands
              </h2>
            </div>
            {/* Arrows */}
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-full border border-[#EAE5DC] bg-white hover:bg-[#FAF8F5] text-[#1F1E1D] shadow-2xs">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-full border border-[#EAE5DC] bg-white hover:bg-[#FAF8F5] text-[#1F1E1D] shadow-2xs">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 3 Review Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-[2px] border border-[#F0ECE6] p-6 text-left flex flex-col justify-between shadow-2xs hover:shadow-md transition-shadow"
              >
                <div className="space-y-4">
                  <div className="flex text-[#9E7D4B]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#9E7D4B]" />
                    ))}
                  </div>
                  <p className="font-serif-luxury italic text-sm text-[#4A4744] leading-relaxed">
                    {t.quote}
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-6 mt-6 border-t border-[#F0ECE6]">
                  <img
                    src={resolveAsset(t.avatar)}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#EAE5DC]"
                  />
                  <div>
                    <h5 className="text-xs font-semibold text-[#1F1E1D]">{t.name}</h5>
                    <span className="text-[0.68rem] text-[#9E7D4B] font-medium">
                      {t.role} • {t.city}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 11. Instagram Community & Reels Showcase ──────────────────────── */}
      <section id="instagram" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Header with verified handle and studio identity */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 text-left gap-6 border-b border-[#F0ECE6] pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FAF8F5] border border-[#EAE5DC] rounded-full mb-3">
              <span className="w-2 h-2 rounded-full bg-[#E1306C]" />
              <span className="text-[0.68rem] uppercase tracking-[0.24em] text-[#9E7D4B] font-semibold">
                @SHAMBHAVII_CREATIONS
              </span>
            </div>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#1F1E1D] font-normal leading-tight">
              From Our Studio to Your Feed
            </h2>
            <p className="text-xs sm:text-sm text-[#78746F] mt-2 max-w-xl leading-relaxed">
              Wholesale imitation sets, new designs, bridal nails, and ready rangolis. Direct from Pallavi in Chh. Sambhajinagar.
            </p>
          </div>

          {/* Social CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://www.instagram.com/shambhavii_creations/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white text-xs font-semibold rounded-[3px] shadow-sm hover:opacity-95 transition-opacity"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
              </svg>
              <span>Follow @shambhavii_creations</span>
            </a>
            <a
              href="https://chat.whatsapp.com/JfWXg1qccdpFrU5HYO0OtJ"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1FA855] hover:bg-[#1B944B] text-white text-xs font-semibold rounded-[3px] shadow-sm transition-colors"
            >
              <span>Join Reseller WhatsApp</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Filter Tabs for Social Items */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 justify-start sm:justify-center scrollbar-none">
          {[
            { id: "all", label: "All Creations (6)" },
            { id: "reels", label: "Trending Reels (4)" },
            { id: "bridal", label: "Nails & Rangoli (2)" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSocialTab(tab.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                socialTab === tab.id
                  ? "bg-[#1F1E1D] text-white border-[#1F1E1D]"
                  : "bg-white text-[#4A4744] border-[#EAE5DC] hover:border-[#9E7D4B] hover:text-[#9E7D4B]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 6 Rich Instagram & Reels Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {INSTAGRAM_COMMUNITY.filter((item) => {
            if (socialTab === "all") return true;
            return item.category === socialTab;
          }).map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col bg-white border border-[#EAE5DC] rounded-[2px] overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300"
            >
              {/* Media Container with 4:5 Portrait Ratio */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#FAF8F5]">
                <img
                  src={resolveAsset(item.thumbnail)}
                  alt={item.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />

                {/* Badge (Reel / Post tag) */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-[2px]">
                  {item.type === "reel" ? (
                    <>
                      <Play className="w-3 h-3 fill-white" />
                      <span>{item.tag}</span>
                      {item.views && <span className="text-[#C8B89C]"> • {item.views}</span>}
                    </>
                  ) : (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      </svg>
                      <span>{item.tag}</span>
                    </>
                  )}
                </div>

                {/* Center Hover Action */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-white/90 text-[#1F1E1D] flex items-center justify-center mb-2 shadow-lg group-hover:scale-110 transition-transform">
                    {item.type === "reel" ? (
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      </svg>
                    )}
                  </div>
                  <span className="text-xs font-semibold tracking-wide">
                    {item.type === "reel" ? "Watch Reel on Instagram" : "View on Instagram"} ↗
                  </span>
                </div>
              </div>

              {/* Title & Caption Info */}
              <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-serif-luxury text-base font-medium text-[#1F1E1D] group-hover:text-[#9E7D4B] transition-colors line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#78746F] line-clamp-2 leading-relaxed mt-1">
                    {item.caption}
                  </p>
                </div>
                <div className="pt-3 border-t border-[#F0ECE6] flex items-center justify-between text-[0.7rem] text-[#9E7D4B] font-medium">
                  <span>@shambhavii_creations</span>
                  <span className="group-hover:translate-x-1 transition-transform">Open in App →</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── 12. Newsletter / Exclusive Offers Banner ───────────────────────── */}
      <section className="bg-[#FAF8F5] border-y border-[#F0ECE6] py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#1F1E1D] font-normal">
            Get Exclusive Offers
          </h2>
          <p className="text-xs sm:text-sm text-[#78746F] max-w-md mx-auto">
            Subscribe and be the first to know about new collections, bridal consultations, and private studio releases.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (emailInput) setSubscribed(true);
            }}
            className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto pt-2"
          >
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Enter your email address"
              className="w-full sm:flex-1 bg-white border border-[#EAE5DC] px-4 py-3 text-xs text-[#1F1E1D] placeholder-[#78746F] rounded-[2px] focus:outline-none focus:border-[#9E7D4B]"
              required
            />
            <button type="submit" className="btn-bronze w-full sm:w-auto py-3 px-6 rounded-[2px]">
              {subscribed ? "THANK YOU FOR SUBSCRIBING ♡" : "SUBSCRIBE"}
            </button>
          </form>

          <span className="font-serif-luxury italic text-sm text-[#9E7D4B] block pt-1">
            A Brighter Tomorrow Together ♡
          </span>
        </div>
      </section>

      {/* ── 13. Clean Minimalist Footer ───────────────────────────────────── */}
      <footer className="bg-white text-[#1F1E1D] pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#F0ECE6] text-left">
            {/* Brand Col */}
            <div className="lg:col-span-2 space-y-4">
              <span className="font-serif-luxury font-semibold text-2xl tracking-[0.06em] text-[#1F1E1D] block">
                SHAMBHAVI
              </span>
              <span className="text-[0.62rem] uppercase tracking-[0.24em] text-[#9E7D4B] font-semibold block -mt-2">
                FINE JEWELLERY • CHH. SAMBHAJINAGAR
              </span>
              <p className="text-xs text-[#78746F] max-w-sm leading-relaxed">
                Timeless imitation sets, custom bridal nails, and handcrafted festive rangolis. Hand-assembled with care in Chh. Sambhajinagar.
              </p>
              {/* Social icons */}
              <div className="flex items-center gap-4 text-[#1F1E1D] pt-2">
                <a href="https://www.instagram.com/shambhavii_creations/" target="_blank" rel="noopener noreferrer" className="hover:text-[#9E7D4B] transition-colors" aria-label="Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#9E7D4B] transition-colors" aria-label="Facebook">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#9E7D4B] transition-colors" aria-label="YouTube">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
                    <polygon points="10 15 15 12 10 9 10 15" fill="currentColor"/>
                  </svg>
                </a>
                <a href="#" className="hover:text-[#9E7D4B] transition-colors" aria-label="Share">
                  <Share2 className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Shop Column */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-[#1F1E1D] uppercase tracking-wider">Shop</h4>
              <ul className="space-y-2 text-xs text-[#78746F]">
                <li><button onClick={() => { setActiveTab("all"); document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" }); }} className="hover:text-[#1F1E1D]">All Products</button></li>
                <li><button onClick={() => { setActiveTab("rings"); document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" }); }} className="hover:text-[#1F1E1D]">Rings</button></li>
                <li><button onClick={() => { setActiveTab("necklaces"); document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" }); }} className="hover:text-[#1F1E1D]">Necklaces</button></li>
                <li><button onClick={() => { setActiveTab("earrings"); document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" }); }} className="hover:text-[#1F1E1D]">Earrings</button></li>
                <li><button onClick={() => { setActiveTab("bangles"); document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" }); }} className="hover:text-[#1F1E1D]">Bangles</button></li>
                <li><button onClick={() => { setActiveTab("festive"); document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" }); }} className="hover:text-[#1F1E1D]">Bridal & Festive</button></li>
              </ul>
            </div>

            {/* About Column */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-[#1F1E1D] uppercase tracking-wider">About</h4>
              <ul className="space-y-2 text-xs text-[#78746F]">
                <li><a href="#reviews" className="hover:text-[#1F1E1D]">Customer Reviews</a></li>
                <li><a href="#catalog" className="hover:text-[#1F1E1D]">Jaipur & Chh. Sambhajinagar Craft</a></li>
                <li><a href="https://wa.me/919156131162" className="hover:text-[#1F1E1D]">Quality Guarantee</a></li>
                <li><a href="https://wa.me/919156131162" className="hover:text-[#1F1E1D]">Design Consultation</a></li>
              </ul>
            </div>

            {/* Customer Care */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-[#1F1E1D] uppercase tracking-wider">Customer Care</h4>
              <ul className="space-y-2 text-xs text-[#78746F]">
                <li><a href="https://wa.me/919156131162" className="hover:text-[#1F1E1D]">Track Order (WhatsApp)</a></li>
                <li><a href="#" className="hover:text-[#1F1E1D]">Returns & Exchanges</a></li>
                <li><a href="#" className="hover:text-[#1F1E1D]">Bangle Size Guide</a></li>
                <li><a href="https://wa.me/919156131162" className="hover:text-[#1F1E1D]">Instant Support</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright & Admin Access */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[0.72rem] text-[#78746F] gap-2">
            <p>© 2026 Shambhavi Creation. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setCurrentView("admin");
                  window.location.hash = "#admin";
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="hover:text-[#9E7D4B] transition-colors underline underline-offset-4 cursor-pointer"
              >
                Owner Admin Access ↗
              </button>
              <span>•</span>
              <p className="font-serif-luxury italic text-[#9E7D4B]">
                Handcrafted in Chh. Sambhajinagar with ♡
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* ── 14. Interactive Quick View Modal / Drawer (Mihira Jewels style) ─── */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-[2px] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#EAE5DC] relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 p-2 text-[#78746F] hover:text-[#1F1E1D] z-10 rounded-full hover:bg-[#FAF8F5]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8">
              {/* Product Visual */}
              <div className="aspect-square rounded-[2px] overflow-hidden bg-[#FAF8F5] border border-[#EAE5DC]">
                <img
                  src={resolveAsset(quickViewProduct.image)}
                  alt={quickViewProduct.name}
                  className="w-full h-full object-cover object-center"
                />
              </div>

              {/* Product Details & Specifications */}
              <div className="space-y-4 text-left flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[0.65rem] uppercase tracking-wider text-[#9E7D4B] font-semibold">
                      {quickViewProduct.categoryLabel}
                    </span>
                    <span className="text-[0.62rem] bg-[#EBF7EE] text-[#1E7E34] px-1.5 py-0.5 rounded-sm font-semibold">
                      In Stock
                    </span>
                  </div>

                  <h3 className="font-serif-luxury text-2xl text-[#1F1E1D] font-normal leading-tight">
                    {quickViewProduct.name}
                  </h3>

                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex text-[#9E7D4B]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-[#9E7D4B]" />
                      ))}
                    </div>
                    <span className="text-xs text-[#78746F]">
                      {quickViewProduct.rating} ({quickViewProduct.reviewsCount} verified reviews)
                    </span>
                  </div>

                  <div className="flex items-baseline gap-3 my-3">
                    <span className="text-2xl font-semibold text-[#1F1E1D]">
                      ₹{quickViewProduct.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-[#78746F] line-through">
                      ₹{quickViewProduct.originalPrice.toLocaleString()}
                    </span>
                    <span className="text-xs text-[#1E7E34] font-medium">
                      Save ₹{(quickViewProduct.originalPrice - quickViewProduct.price).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-[#78746F] leading-relaxed">
                    {quickViewProduct.description}
                  </p>

                  {/* Product Details */}
                  <div className="mt-4 pt-4 border-t border-[#F0ECE6] space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#78746F]">Plating:</span>
                      <span className="font-medium text-[#1F1E1D]">{quickViewProduct.plating}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#78746F]">Stones:</span>
                      <span className="font-medium text-[#1F1E1D]">{quickViewProduct.stones}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#78746F]">Packaging:</span>
                      <span className="font-medium text-[#1F1E1D]">Velvet Keepsake Box Included</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#78746F]">Shipping:</span>
                      <span className="font-medium text-[#1E7E34]">{quickViewProduct.shippingStatus}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 space-y-2">
                  <button
                    onClick={() => {
                      addToCart(quickViewProduct);
                      setQuickViewProduct(null);
                    }}
                    className="btn-bronze w-full py-3 text-xs rounded-[2px]"
                  >
                    ADD TO CURATED BOX
                  </button>
                  <button
                    onClick={() => {
                      handleOrderWhatsApp(quickViewProduct.name, quickViewProduct.price);
                      setQuickViewProduct(null);
                    }}
                    className="w-full bg-[#1FA855] hover:bg-[#1B944B] text-white py-3 text-xs font-semibold rounded-[2px] transition-colors flex items-center justify-center gap-2"
                  >
                    ORDER ON WHATSAPP
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 15. Slide-Out Curated Box / Cart Drawer (Mihira Jewels style) ────── */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-[#EAE5DC] animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-5 border-b border-[#F0ECE6] flex items-center justify-between">
              <div>
                <h3 className="font-serif-luxury text-xl text-[#1F1E1D]">Your Curated Box</h3>
                <span className="text-xs text-[#78746F]">
                  {cart.length} unique {cart.length === 1 ? "design" : "designs"}
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1 text-[#78746F] hover:text-[#1F1E1D]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress */}
            <div className="bg-[#FAF8F5] px-5 py-3 border-b border-[#F0ECE6] text-xs">
              {cartTotal >= 1499 ? (
                <p className="text-[#1E7E34] font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> You've unlocked Free Express Shipping!
                </p>
              ) : (
                <p className="text-[#4A4744]">
                  Add <span className="font-bold text-[#1F1E1D]">₹{(1499 - cartTotal).toLocaleString()}</span> more for <span className="text-[#9E7D4B] font-semibold">Free Express Shipping</span>
                </p>
              )}
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <ShoppingBag className="w-10 h-10 text-[#C8B89C] mx-auto stroke-[1.2]" />
                  <p className="font-serif-luxury text-lg text-[#1F1E1D]">Your box is empty</p>
                  <p className="text-xs text-[#78746F]">Explore our heirloom collection to curate your look.</p>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="btn-bronze text-xs py-2 px-5 mt-2"
                  >
                    BROWSE PIECES
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-4 pb-4 border-b border-[#F0ECE6] items-center"
                  >
                    <img
                      src={resolveAsset(item.product.image)}
                      alt={item.product.name}
                      className="w-18 h-18 rounded-[2px] object-cover bg-[#FAF8F5] border border-[#EAE5DC]"
                    />
                    <div className="flex-1 text-left">
                      <h4 className="font-serif-luxury text-sm font-medium text-[#1F1E1D] line-clamp-1">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-[#9E7D4B] font-semibold mt-0.5">
                        ₹{item.product.price.toLocaleString()}
                      </p>
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, -1)}
                          className="w-6 h-6 border border-[#EAE5DC] rounded-xs flex items-center justify-center text-[#78746F] hover:bg-[#FAF8F5]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-semibold text-[#1F1E1D] w-5 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, 1)}
                          className="w-6 h-6 border border-[#EAE5DC] rounded-xs flex items-center justify-center text-[#78746F] hover:bg-[#FAF8F5]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer Checkout via WhatsApp */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-[#F0ECE6] bg-[#FAF8F5] space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-[#78746F] uppercase tracking-wider">Subtotal</span>
                  <span className="text-lg font-bold text-[#1F1E1D]">₹{cartTotal.toLocaleString()}</span>
                </div>
                <p className="text-[0.68rem] text-[#78746F] text-left">
                  Includes complimentary velvet keepsake box & blessing card.
                </p>
                <button
                  onClick={handleCheckoutWhatsAppCart}
                  className="w-full bg-[#1FA855] hover:bg-[#1B944B] text-white py-3.5 text-xs font-semibold rounded-[2px] transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>ORDER VIA WHATSAPP (₹{cartTotal.toLocaleString()})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 16. Slide-Out Wishlist Drawer ──────────────────────────────────── */}
      {isWishlistOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-[#EAE5DC] animate-in slide-in-from-right duration-300">
            <div className="p-5 border-b border-[#F0ECE6] flex items-center justify-between">
              <div>
                <h3 className="font-serif-luxury text-xl text-[#1F1E1D]">Saved Pieces</h3>
                <span className="text-xs text-[#78746F]">
                  {wishlist.length} saved for your wishlist
                </span>
              </div>
              <button
                onClick={() => setIsWishlistOpen(false)}
                className="p-1 text-[#78746F] hover:text-[#1F1E1D]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {wishlist.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Heart className="w-10 h-10 text-[#C8B89C] mx-auto stroke-[1.2]" />
                  <p className="font-serif-luxury text-lg text-[#1F1E1D]">No pieces saved yet</p>
                  <p className="text-xs text-[#78746F]">Tap the heart icon on any design to save it here.</p>
                </div>
              ) : (
                CATALOG_PRODUCTS.filter((p) => wishlist.includes(p.id)).map((p) => (
                  <div key={p.id} className="flex gap-4 pb-4 border-b border-[#F0ECE6] items-center">
                    <img
                      src={resolveAsset(p.image)}
                      alt={p.name}
                      className="w-16 h-16 rounded-[2px] object-cover bg-[#FAF8F5] border border-[#EAE5DC]"
                    />
                    <div className="flex-1 text-left">
                      <h4 className="font-serif-luxury text-xs font-medium text-[#1F1E1D] line-clamp-1">
                        {p.name}
                      </h4>
                      <p className="text-xs text-[#9E7D4B] font-semibold mt-0.5">
                        ₹{p.price.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => {
                            addToCart(p);
                            setIsWishlistOpen(false);
                          }}
                          className="btn-bronze text-[0.62rem] py-1 px-3"
                        >
                          MOVE TO BOX
                        </button>
                        <button
                          onClick={() => toggleWishlist(p.id)}
                          className="text-[0.62rem] text-[#78746F] hover:text-red-600 underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Floating Mobile WhatsApp Order Button ────────────────────────────── */}
      {!isMobileMenuOpen && (
        <a
          href="https://wa.me/919156131162?text=Hello%20Shambhavi%20Creations%2C%20I%20am%20interested%20in%20ordering%20handcrafted%20jewellery"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-5 right-4 z-40 lg:hidden flex items-center gap-2 bg-[#1FA855] text-white px-3.5 py-2.5 rounded-full shadow-lg font-medium text-xs hover:bg-[#1B944B] transition-transform active:scale-95 cursor-pointer"
          aria-label="Chat on WhatsApp"
        >
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="font-semibold tracking-wide">WhatsApp Us</span>
        </a>
      )}
    </div>
  );
}
