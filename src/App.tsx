import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Heart,
  ShoppingBag,
  ChevronDown,
  CheckCircle2,
  Share2,
  X,
  Eye,
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
  Menu,
} from "lucide-react";
import {
  AdminPanel,
  type Product,
  type StoreSettings,
  type CategoryItem,
} from "./components/AdminPanel";
import { resolveAsset, formatWhatsAppLink } from "./utils";
import {
  subscribeToFirestoreProducts,
  subscribeToFirestoreSettings,
  autoSeedIfEmpty,
} from "./firebase";

interface CartItem {
  product: Product;
  quantity: number;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: "Shambhavi Creation",
  tagline: "Fine Jewellery",
  city: "",
  phone: "919156131162",
  ownerName: "Pallavi",
  instagramUrl: "https://www.instagram.com/shambhavii_creations/",
  announcementText: "✨ FESTIVE WEDDING ATELIER — COMPLIMENTARY VELVET BOX PACKAGING ON ALL ORDERS ✨",
};

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: "all", label: "All Pieces", image: "/photos/shambhavi_signature_wati_haar.jpg", subtitle: "Complete Collection" },
  { id: "necklaces", label: "Mangalsutra & Sets", image: "/photos/shambhavi_signature_wati_haar.jpg", subtitle: "Signature Wati & Haars" },
  { id: "bangles", label: "Bangles & Kadas", image: "/photos/hero_model_bangles.jpg", subtitle: "Patli, Tode & Kadas" },
  { id: "festive", label: "Festive Ready", image: "/photos/south_temple_peacock_haar.jpg", subtitle: "Temple & Kundan Sets" },
  { id: "earrings", label: "Earrings & Jhumkas", image: "/images/gulabi_jhumkas.png", subtitle: "Meenakari & Drops" },
  { id: "rings", label: "Rings & Solitaires", image: "/images/feature_rings.jpg", subtitle: "Statement Rings" },
  { id: "under-1000", label: "Under ₹1,000", image: "/images/feature_gift.jpg", subtitle: "Affordable Luxury Gifts" },
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

// Curated authentic catalog pieces
const CURATED_PRODUCTS: Product[] = [
  {
    id: "p-photo-9",
    name: "Shambhavi Signature 3-Line Wati Mangalsutra",
    category: "necklaces",
    categoryLabel: "Mangalsutra & Sets",
    price: 1599,
    originalPrice: 2299,
    rating: 5.0,
    reviewsCount: 184,
    image: "/photos/shambhavi_signature_wati_haar.jpg",
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
    plating: "24K Gold Polish Finish",
    stones: "Twisted Wire Rope Carving (Set of 6 Bangles)",
    description: "Traditional daily and festive wear twisted wire bangles stack in pure yellow gold polish. Lightweight, smooth edges, and long lasting.",
    shippingStatus: "Ready to Ship",
  },
  {
    id: "p-photo-11",
    name: "Double-Chain Floral Wati Mangalsutra",
    category: "necklaces",
    categoryLabel: "Mangalsutra & Sets",
    price: 1399,
    originalPrice: 1899,
    rating: 4.8,
    reviewsCount: 126,
    image: "/photos/photo_11.jpg",
    plating: "Gold Plated Finish",
    stones: "Micro Pave Floral Cap with Auspicious Black Beads",
    description: "Dual-chain wati mangalsutra featuring delicate micro-etched floral cup details and auspicious high-luster black beads.",
    shippingStatus: "Ready to Ship",
  },
  {
    id: "p-photo-3",
    name: "Peshwai Ruby Cluster Antique Kadas (Pair)",
    category: "bangles",
    categoryLabel: "Bangles & Kadas",
    price: 1450,
    originalPrice: 1999,
    rating: 4.9,
    reviewsCount: 94,
    image: "/photos/peshwai_ruby_cluster_kadas.jpg",
    plating: "Antique Matte Finish",
    stones: "Carved Floral Ruby Dome Cabochons",
    description: "Traditional Peshwai antique finish kadas adorned with raised ruby flower clusters. Styled traditionally with Paithani sarees.",
    shippingStatus: "Ready to Ship",
  },
  {
    id: "p-photo-4",
    name: "Royal Russian Emerald & Ruby Bridal Bangles",
    category: "bangles",
    categoryLabel: "Bangles & Kadas",
    price: 1599,
    originalPrice: 2199,
    rating: 5.0,
    reviewsCount: 88,
    image: "/photos/russian_emerald_royal_bangles.jpg",
    plating: "Antique Brass Polish",
    stones: "Baguette Cut Russian Emeralds & Rubies",
    description: "Regal openable bridal kadas accented with faceted faux Russian emeralds and ruby gemstones for an opulent wedding look.",
    shippingStatus: "Ready to Ship",
  },
  {
    id: "p-photo-8",
    name: "Temple Medallion Haar & Studs Set",
    category: "festive",
    categoryLabel: "Festive Ready",
    price: 1899,
    originalPrice: 2499,
    rating: 4.9,
    reviewsCount: 76,
    image: "/photos/temple_floral_medallion_necklace.jpg",
    plating: "Temple Matte Finish",
    stones: "Goddess Lakshmi Floral Repoussé & Coin Drops",
    description: "Intricately embossed temple deity medallion necklace with auspicious floral filigree and matching earrings.",
    shippingStatus: "Ready to Ship",
  },
  {
    id: "p-photo-10",
    name: "Shambhavi Diamond Floral Wati Set with Bangles",
    category: "necklaces",
    categoryLabel: "Mangalsutra & Sets",
    price: 1699,
    originalPrice: 2399,
    rating: 4.9,
    reviewsCount: 112,
    image: "/photos/shambhavi_diamond_wati_set.jpg",
    plating: "Dual Tone Gold Finish",
    stones: "American Diamond Floret Cluster in Traditional Wati",
    description: "Modern twist on traditional wati mangalsutra with sparkling cubic zirconia floral florets and matching gold bangles.",
    shippingStatus: "Ready to Ship",
  },
  {
    id: "p-photo-18",
    name: "Long Traditional Wati Mangalsutra & Model Set",
    category: "necklaces",
    categoryLabel: "Mangalsutra & Sets",
    price: 1899,
    originalPrice: 2599,
    rating: 5.0,
    reviewsCount: 138,
    image: "/photos/photo_18.jpg",
    plating: "Pure 24K Micro Gold Plated",
    stones: "Traditional Maharashtrian Heavy Watis",
    description: "Grand 28-inch long traditional mangalsutra with dual hollow-carved wati medallions. A prized wedding heirloom piece.",
    shippingStatus: "Ready to Ship",
  },
  {
    id: "p-photo-17",
    name: "Ruby Halo Floral Wati Mangalsutra & Bangles Set",
    category: "festive",
    categoryLabel: "Festive Ready",
    price: 1799,
    originalPrice: 2450,
    rating: 4.9,
    reviewsCount: 96,
    image: "/photos/photo_17.jpg",
    plating: "Yellow Gold Polish",
    stones: "Ruby Halo Beads with Traditional Wati Cups",
    description: "Festive ensemble pairing a ruby-accented wati mangalsutra with coordinating bridal bangles.",
    shippingStatus: "Ready to Ship",
  },
  {
    id: "p-photo-15",
    name: "Shambhavi 4-Line Kolhapuri Wati Haar",
    category: "necklaces",
    categoryLabel: "Mangalsutra & Sets",
    price: 1999,
    originalPrice: 2699,
    rating: 5.0,
    reviewsCount: 84,
    image: "/photos/photo_15.jpg",
    plating: "Antique Gold Polish",
    stones: "4-Line Black Bead Weave with Heavy Watis",
    description: "Authentic Kolhapuri style 4-line mangalsutra with dense black bead weaving and hand-engraved gold beads.",
    shippingStatus: "Ready to Ship",
  },
  {
    id: "p-photo-12",
    name: "Classic Gold Wati Necklace & Bangles Duo",
    category: "under-1000",
    categoryLabel: "Under ₹1,000",
    price: 899,
    originalPrice: 1299,
    rating: 4.8,
    reviewsCount: 162,
    image: "/photos/photo_12.jpg",
    badge: { text: "Under ₹1K", variant: "bestseller" },
    plating: "High Polish Gold Plated",
    stones: "Dual Wati Beads & Gold Kada Duo",
    description: "Chic everyday wati mangalsutra and matching gold kada duo set. Premium look at an accessible price point.",
    shippingStatus: "Ready to Ship",
  },
  {
    id: "p-photo-19",
    name: "Geometric Ruby Diamond Wati Set with Bangles",
    category: "under-1000",
    categoryLabel: "Under ₹1,000",
    price: 949,
    originalPrice: 1399,
    rating: 4.8,
    reviewsCount: 108,
    image: "/photos/photo_19.jpg",
    badge: { text: "Under ₹1K", variant: "new" },
    plating: "Gold Plated Finish",
    stones: "Square Ruby Centrepiece with AD stones",
    description: "Contemporary square-cut ruby pendant set on traditional black bead chain with matching sleek bangles.",
    shippingStatus: "Ready to Ship",
  },
  {
    id: "p-photo-13",
    name: "Emerald Cut Solitaire Mangalsutra Set",
    category: "necklaces",
    categoryLabel: "Mangalsutra & Sets",
    price: 1149,
    originalPrice: 1599,
    rating: 4.9,
    reviewsCount: 92,
    image: "/photos/photo_13.jpg",
    plating: "Dual Tone Micro Polish",
    stones: "Emerald Cut Austrian Crystal with Black Bead Chain",
    description: "Refined modern mangalsutra showcasing an emerald-cut crystal solitaire framed in delicate yellow gold prongs.",
    shippingStatus: "Ready to Ship",
  },
  {
    id: "p-photo-2",
    name: "Carved Royal Openable Bridal Bangles (Pair)",
    category: "bangles",
    categoryLabel: "Bangles & Kadas",
    price: 1399,
    originalPrice: 1899,
    rating: 4.8,
    reviewsCount: 78,
    image: "/photos/photo_2.jpg",
    plating: "Antique 24K Matte Polish",
    stones: "Hand Carved Floral Filigree with Screw Pin",
    description: "Handcrafted bridal kadas featuring openable screw lock and regal antique gold filigree.",
    shippingStatus: "Ready to Ship",
  },
  {
    id: "p-gulabi",
    name: "Gulabi Meenakari Jhumkas",
    category: "earrings",
    categoryLabel: "Earrings & Jhumkas",
    price: 749,
    originalPrice: 1099,
    rating: 4.9,
    reviewsCount: 142,
    image: "/images/gulabi_jhumkas.png",
    badge: { text: "Under ₹1K", variant: "bestseller" },
    plating: "24K Gold Micro-Plated",
    stones: "Hand-painted Pink Meenakari, Seed Pearls",
    description: "Vibrant Jaipur gulabi pink meenakari dome jhumkas with hanging seed pearl tassels.",
    shippingStatus: "Ready to Ship",
  },
  {
    id: "p-solitaire-ring",
    name: "Heritage Floral Solitaire Statement Ring",
    category: "rings",
    categoryLabel: "Rings & Solitaires",
    price: 549,
    originalPrice: 799,
    rating: 4.8,
    reviewsCount: 88,
    image: "/images/feature_rings.jpg",
    badge: { text: "Under ₹1K", variant: "new" },
    plating: "Gold Plated Brass",
    stones: "Convex Crystal Facet with Carved Shank",
    description: "Adjustable artisanal statement ring designed with an intricate floral border around a sparkling solitaire stone.",
    shippingStatus: "Ready to Ship",
  },
  {
    id: "p-polki-choker",
    name: "Jaipur Kundan Polki Choker Set",
    category: "festive",
    categoryLabel: "Festive Ready",
    price: 1899,
    originalPrice: 2699,
    rating: 5.0,
    reviewsCount: 114,
    image: "/images/polki_choker.jpg",
    badge: { text: "Atelier Signature", variant: "bestseller" },
    plating: "Meenakari Enamel & 24K Gold Foil",
    stones: "Uncut Polki Stones, Natural Emerald Drops",
    description: "Spectacular bridal choker set handset with uncut polki gems and genuine emerald drops.",
    shippingStatus: "Ready to Ship",
  },
  {
    id: "p-temple-kada",
    name: "Temple Floral Studded Screw Kada",
    category: "bangles",
    categoryLabel: "Bangles & Kadas",
    price: 999,
    originalPrice: 1399,
    rating: 4.9,
    reviewsCount: 78,
    image: "/images/heritage_kada.jpg",
    badge: { text: "Under ₹1K", variant: "few-left" },
    plating: "Matte Gold Finish",
    stones: "Emerald Green Stones & Pearl Border",
    description: "Easy openable screw-lock kada that fits all wrist sizes. Detailed floral carving with smooth inner finish.",
    shippingStatus: "Ready to Ship",
  },
];

const CURRENT_YEAR = new Date().getFullYear();

// Helper to ensure deprecated badges like "Original Click" are cleanly removed from cached & live states
const sanitizeProduct = (p: Product): Product => {
  if (p.badge?.text === "Original Click") {
    const { badge, ...rest } = p;
    return rest as Product;
  }
  return p;
};

export default function App() {
  const [currentView, setCurrentView] = useState<"storefront" | "admin">(() => {
    return window.location.hash === "#admin" ? "admin" : "storefront";
  });

  // Store Settings with persistence
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem("shambhavi_store_settings_v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.tagline && (parsed.tagline.includes("Sambhajinagar") || parsed.tagline.includes("CSN") || parsed.tagline.includes("Bridal Atelier"))) {
          parsed.tagline = "Fine Jewellery";
        }
        if (parsed.city && (parsed.city.includes("Sambhajinagar") || parsed.city.includes("CSN"))) {
          parsed.city = "";
        }
        if (parsed.ownerName && (parsed.ownerName.includes("Shambhavi") || parsed.ownerName === "Pallavi / Shambhavi")) {
          parsed.ownerName = "Pallavi";
        }
        return parsed;
      }
    } catch (e) {
      console.error("Error reading store settings from localStorage", e);
    }
    return DEFAULT_STORE_SETTINGS;
  });

  // Categories with persistence
  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    try {
      const saved = localStorage.getItem("shambhavi_categories_v1");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error reading categories from localStorage", e);
    }
    return DEFAULT_CATEGORIES;
  });

  // Product Catalog with persistence & automatic catalog healing
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem("shambhavi_products_catalog_v2");
      if (saved) {
        const parsed: Product[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with CURATED_PRODUCTS so an accidental single-item overwrite is immediately healed!
          const map = new Map<string, Product>();
          CURATED_PRODUCTS.forEach((p) => map.set(p.id, sanitizeProduct(p)));
          parsed.forEach((p) => map.set(p.id, sanitizeProduct(p)));
          const cleaned = Array.from(map.values());
          localStorage.setItem("shambhavi_products_catalog_v2", JSON.stringify(cleaned));
          return cleaned;
        }
      }
    } catch (e) {
      console.error("Error reading products catalog from localStorage", e);
    }
    return CURATED_PRODUCTS.map(sanitizeProduct);
  });

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

  // Real-time Firestore sync when Firebase is configured
  useEffect(() => {
    // Attempt auto-seed if cloud database is currently unpopulated or missing items
    autoSeedIfEmpty(CURATED_PRODUCTS.map(sanitizeProduct), DEFAULT_CATEGORIES, DEFAULT_STORE_SETTINGS);

    const unsubProducts = subscribeToFirestoreProducts((liveProducts) => {
      if (liveProducts && liveProducts.length > 0) {
        setProducts((prev) => {
          // Merge live Firestore updates with CURATED_PRODUCTS and prev state so default items are never wiped out
          const map = new Map<string, Product>();
          CURATED_PRODUCTS.forEach((p) => map.set(p.id, sanitizeProduct(p)));
          prev.forEach((p) => map.set(p.id, sanitizeProduct(p)));
          liveProducts.forEach((p) => map.set(p.id, sanitizeProduct(p)));

          const merged = Array.from(map.values());
          localStorage.setItem("shambhavi_products_catalog_v2", JSON.stringify(merged));
          return merged;
        });
      }
    });

    const unsubSettings = subscribeToFirestoreSettings((liveSettings) => {
      if (liveSettings) {
        setStoreSettings((prev) => ({ ...prev, ...liveSettings }));
        localStorage.setItem("shambhavi_store_settings_v1", JSON.stringify(liveSettings));
      }
    });

    return () => {
      unsubProducts();
      unsubSettings();
    };
  }, []);

  const [activeTab, setActiveTab] = useState<string>("all");
  const [isCategoriesOpen, setIsCategoriesOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [emailInput, setEmailInput] = useState<string>("");
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const [shareToast, setShareToast] = useState<boolean>(false);

  // Pagination state: clean initial view of 8 items
  const [visibleCount, setVisibleCount] = useState<number>(8);

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setVisibleCount(8);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setVisibleCount(8);
  };

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

  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  // Wishlist toggle
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Cart operations
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const cartItemsCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // WhatsApp helper using dynamic phone from storeSettings
  const handleOrderWhatsApp = (productName: string, price: number) => {
    const text = `Hello Shambhavi Creations, I would like to order "${productName}" (₹${price.toLocaleString()}) via your online storefront. Is it available for delivery?`;
    window.open(formatWhatsAppLink(storeSettings.phone, text), "_blank");
  };

  const handleCheckoutCartWhatsApp = () => {
    if (cart.length === 0) return;
    const itemsList = cart
      .map((item) => `• ${item.product.name} (Qty: ${item.quantity}) - ₹${(item.product.price * item.quantity).toLocaleString()}`)
      .join("\n");
    const message = `Hello Shambhavi Creations, I would like to place an order for the following items:\n\n${itemsList}\n\n*Total Order Value:* ₹${cartTotal.toLocaleString()}\n\nPlease confirm availability and delivery to my address.`;
    window.open(formatWhatsAppLink(storeSettings.phone, message), "_blank");
  };

  const handleShareWebsite = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: storeSettings.storeName,
          text: `${storeSettings.storeName} — ${storeSettings.tagline}`,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    }
  };

  // If in admin view, render AdminPortal
  if (currentView === "admin") {
    return (
      <AdminPanel
        products={products}
        setProducts={setProducts}
        defaultProducts={CURATED_PRODUCTS}
        onBackToStore={() => {
          setCurrentView("storefront");
          window.location.hash = "#store";
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        storeSettings={storeSettings}
        setStoreSettings={setStoreSettings}
        categories={categories}
        setCategories={setCategories}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1F1E1D] font-sans antialiased selection:bg-[#9E7D4B] selection:text-white">
      {/* Toast Notification */}
      {shareToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1F1E1D] text-white px-4 py-2.5 rounded-[2px] shadow-lg text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#1FA855]" />
          <span>Store link copied to clipboard!</span>
        </div>
      )}

      {/* 1. Luxury Gold Announcement Bar */}
      <div className="bg-[#1F1E1D] text-[#FAF8F5] text-[0.62rem] sm:text-[0.68rem] tracking-[0.24em] font-medium py-2 px-4 uppercase text-center border-b border-[#33312E] flex items-center justify-center gap-2">
        <Sparkles className="w-3 h-3 text-[#9E7D4B]" />
        <span>{storeSettings.announcementText}</span>
        <Sparkles className="w-3 h-3 text-[#9E7D4B]" />
      </div>

      {/* 2. Main Luxury Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#F0ECE6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Mobile Menu & Logo Left */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 text-[#1F1E1D] hover:text-[#9E7D4B] transition-colors cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-6 h-6 stroke-[1.5]" />
            </button>

            {/* Brand Logo & Wordmark - Integrated Seamlessly into Header */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-2 sm:gap-3 text-left group cursor-pointer py-1 select-none shrink-0"
            >
              <div className="relative flex items-center justify-center shrink-0">
                <img
                  src={resolveAsset("/images/shambhavi_crest_transparent.png")}
                  alt="Shambhavi Creations Emblem"
                  className="h-10 sm:h-12 md:h-13 w-auto object-contain drop-shadow-[0_2px_8px_rgba(158,125,75,0.22)] group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="flex flex-col justify-center min-w-0">
                <span className="font-serif-luxury text-[0.95rem] sm:text-lg md:text-[1.3rem] font-bold tracking-[0.18em] sm:tracking-[0.2em] text-[#1F1E1D] group-hover:text-[#9E7D4B] transition-colors uppercase leading-none whitespace-nowrap">
                  Shambhavi
                </span>
                
                {/* Mobile: Clean single line that never wraps */}
                <div className="sm:hidden mt-1 whitespace-nowrap">
                  <span className="text-[0.52rem] uppercase tracking-[0.22em] text-[#9E7D4B] font-semibold leading-none whitespace-nowrap">
                    {storeSettings.tagline || "Fine Jewellery"}
                  </span>
                </div>

                {/* Tablet & Desktop: Creations • Fine Jewellery */}
                <div className="hidden sm:flex items-center gap-1.5 mt-1 whitespace-nowrap">
                  <span className="text-[0.62rem] uppercase tracking-[0.26em] text-[#9E7D4B] font-semibold leading-none whitespace-nowrap">
                    Creations
                  </span>
                  <span className="text-[0.45rem] text-[#C2A374] leading-none">•</span>
                  <span className="text-[0.56rem] uppercase tracking-[0.2em] text-[#78746F] font-medium leading-none whitespace-nowrap">
                    {storeSettings.tagline}
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Center Navigation Links (Laptop / Desktop) */}
          <nav className="hidden lg:flex items-center space-x-8 text-[0.82rem] font-medium tracking-wide text-[#4A4744]">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="text-[#1F1E1D] hover:text-[#9E7D4B] transition-colors cursor-pointer"
            >
              Home
            </button>

            {/* Direct Catalog Link */}
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

            {/* Laptop View Categories Trigger Button */}
            <button
              onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
              className={`hover:text-[#9E7D4B] transition-colors flex items-center gap-1.5 text-[0.82rem] font-medium cursor-pointer py-1.5 px-2 rounded-sm ${isCategoriesOpen ? "text-[#9E7D4B] bg-[#FAF8F5]" : "text-[#4A4744]"
                }`}
            >
              <span>Categories</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${isCategoriesOpen ? "rotate-180 text-[#9E7D4B]" : ""
                  }`}
              />
            </button>

            {/* WhatsApp Direct Nav */}
            <a
              href={formatWhatsAppLink(storeSettings.phone, "Hello Shambhavi Creations, I am browsing your jewellery catalog.")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1FA855] font-semibold flex items-center gap-1.5 hover:underline"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#1FA855] animate-pulse" />
              Chat on WhatsApp
            </a>
          </nav>

          {/* Right Action Icons */}
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
              className="relative p-1.5 hover:text-[#9E7D4B] transition-colors cursor-pointer"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 stroke-[1.5]" />
              {wishlist.length > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-[#9E7D4B] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-1.5 hover:text-[#9E7D4B] transition-colors cursor-pointer"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
              {cartItemsCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-[#1F1E1D] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* FULL-WIDTH LAPTOP VIEW CATEGORY MEGA MENU */}
        {isCategoriesOpen && (
          <div
            onMouseLeave={() => setIsCategoriesOpen(false)}
            className="hidden lg:block absolute top-full left-0 right-0 w-full bg-white border-b border-[#EAE5DC] shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
              {/* Mega Menu Top Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#F0ECE6]">
                <div>
                  <span className="text-[0.65rem] uppercase tracking-[0.24em] text-[#9E7D4B] font-bold block">
                    ATELIER COLLECTIONS
                  </span>
                  <h3 className="font-serif-luxury text-xl sm:text-2xl text-[#1F1E1D] font-normal mt-0.5">
                    Explore Handcrafted Jewellery by Category
                  </h3>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      setActiveTab("all");
                      setIsCategoriesOpen(false);
                      const el = document.getElementById("catalog");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-xs font-semibold text-[#9E7D4B] hover:text-[#1F1E1D] transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All Pieces ({products.length})</span>
                    <span>→</span>
                  </button>
                  <button
                    onClick={() => setIsCategoriesOpen(false)}
                    className="p-1.5 text-[#78746F] hover:text-[#1F1E1D] hover:bg-[#FAF8F5] rounded-full transition-colors cursor-pointer"
                    aria-label="Close categories"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Grid of Category Cards with Image Previews */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-6">
                {categories.filter((c) => c.id !== "all").map((cat) => {
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
                        setIsCategoriesOpen(false);
                        const el = document.getElementById("catalog");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="group flex flex-col text-left rounded-[3px] border border-[#F0ECE6] hover:border-[#9E7D4B] p-2.5 bg-white hover:bg-[#FAF8F5]/60 hover:shadow-md transition-all duration-300 cursor-pointer"
                    >
                      <div className="aspect-[4/3] w-full rounded-[2px] overflow-hidden bg-[#FAF8F5] mb-3 relative">
                        <img
                          src={resolveAsset(cat.image)}
                          alt={cat.label}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-sans font-medium px-1.5 py-0.5 rounded-[2px]">
                          {count} {count === 1 ? "piece" : "pieces"}
                        </span>
                      </div>
                      <h4 className="font-serif-luxury text-sm font-medium text-[#1F1E1D] group-hover:text-[#9E7D4B] transition-colors line-clamp-1">
                        {cat.label}
                      </h4>
                      {cat.subtitle && (
                        <p className="text-[11px] text-[#78746F] line-clamp-1 mt-0.5">
                          {cat.subtitle}
                        </p>
                      )}
                      <span className="mt-2 text-[10px] font-semibold text-[#9E7D4B] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        Explore Collection →
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Slide-out Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-[#EAE5DC] px-6 py-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
            <nav className="flex flex-col space-y-3 text-left">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="py-2 text-base font-serif-luxury text-[#1F1E1D] hover:text-[#9E7D4B] border-b border-[#FAF8F5] text-left cursor-pointer"
              >
                Home
              </button>

              <button
                onClick={() => {
                  setActiveTab("all");
                  setIsMobileMenuOpen(false);
                  const el = document.getElementById("catalog");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="py-2 text-base font-serif-luxury text-[#1F1E1D] hover:text-[#9E7D4B] border-b border-[#FAF8F5] text-left cursor-pointer"
              >
                Catalog (All Designs)
              </button>

              {/* Mobile Categories Collapsible */}
              <div className="border-b border-[#FAF8F5] pb-2">
                <button
                  onClick={() => setIsMobileCategoriesOpen(!isMobileCategoriesOpen)}
                  className="w-full py-2 text-base font-serif-luxury text-[#1F1E1D] hover:text-[#9E7D4B] flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span>Shop by Category</span>
                    <span className="text-[0.62rem] font-sans uppercase tracking-wider text-[#9E7D4B] font-bold">
                      ({categories.filter((t) => t.id !== "all").length} Collections)
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#9E7D4B] transition-transform duration-200 ${isMobileCategoriesOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {isMobileCategoriesOpen && (
                  <div className="pb-2 pt-1 pl-2 space-y-1 animate-in fade-in duration-200">
                    {categories.filter((t) => t.id !== "all").map((cat) => {
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
                          className="w-full py-1.5 px-3 rounded-[2px] text-xs text-[#4A4744] hover:bg-[#FAF8F5] hover:text-[#9E7D4B] flex items-center justify-between text-left transition-colors cursor-pointer"
                        >
                          <span>{cat.label}</span>
                          <span className="text-[0.65rem] text-[#78746F] font-mono">
                            {count} pieces
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* WhatsApp direct CTA */}
              <div className="pt-3">
                <a
                  href={formatWhatsAppLink(storeSettings.phone, "Hello Shambhavi Creations, I am browsing your jewellery catalog.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-2.5 bg-[#1FA855] hover:bg-[#1B944B] text-white rounded-[2px] text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>Chat with {storeSettings.ownerName || "Pallavi"}</span>
                </a>
              </div>
            </nav>
          </div>
        )}

        {/* Expandable Live Search Bar */}
        {isSearchOpen && (
          <div className="bg-[#FAF8F5] border-t border-[#EAE5DC] px-4 py-3 transition-all duration-300">
            <div className="max-w-3xl mx-auto flex items-center gap-3">
              <Search className="w-4 h-4 text-[#78746F]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search earrings, chokers, rings, kundan, polki..."
                className="w-full bg-transparent text-sm text-[#1F1E1D] placeholder-[#78746F] focus:outline-none"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange("")}
                  className="text-xs text-[#78746F] hover:text-[#1F1E1D] cursor-pointer"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 text-[#78746F] hover:text-[#1F1E1D] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 3. Hero Section */}
      <section className="bg-[#FAF8F5] relative overflow-hidden border-b border-[#F0ECE6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Copy Column */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <h1 className="font-serif-luxury text-4xl sm:text-5xl lg:text-6xl text-[#1F1E1D] font-normal leading-[1.12]">
                Jewellery That <br />
                <span className="italic font-normal">Tells Your Story</span>
              </h1>

              <p className="text-[#78746F] text-sm sm:text-base max-w-md leading-relaxed font-light">
                Artisanal Kundan polki, South Indian temple jewellery, and elegant daily wear. Handcrafted with precision and care.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => {
                    const el = document.getElementById("catalog");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="btn-bronze shadow-sm cursor-pointer flex items-center gap-2"
                >
                  <span>EXPLORE CATALOG</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <a
                  href={formatWhatsAppLink(storeSettings.phone, "Hello Shambhavi Creations, I would like to book a bridal jewellery consultation.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-bronze-outline"
                >
                  BRIDAL CONSULTATION
                </a>
              </div>
            </div>

            {/* Right Photo Column */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-[2px] overflow-hidden shadow-lg aspect-square sm:aspect-[4/3] border border-[#EAE5DC]">
                <img
                  src={resolveAsset("/photos/hero_model_bangles.jpg")}
                  alt="Shambhavi Creations Traditional Look"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                <div className="absolute bottom-6 right-6 text-right pointer-events-none drop-shadow-md">
                  <span className="font-serif-luxury italic text-xl sm:text-2xl text-white block leading-tight font-light">
                    More Than Jewellery,
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

      {/* 4. Curated Visual Highlight Bubbles */}
      <section id="categories" className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-[0.68rem] uppercase tracking-[0.24em] text-[#9E7D4B] font-semibold block mb-1">
          CURATED VISUAL STORIES
        </span>
        <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#1F1E1D] font-normal">
          Trending Studio Stories
        </h2>
        <p className="text-xs sm:text-sm text-[#78746F] mt-2 max-w-md mx-auto">
          Tap any story circle to instantly filter by bridal looks, signature wati haars, and festive kadas.
        </p>

        <div className="mt-8 flex md:grid md:grid-cols-7 gap-4 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x snap-mandatory justify-start md:justify-center -mx-4 px-4 sm:mx-0">
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
              <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-full overflow-hidden border-2 border-[#EAE5DC] group-hover:border-[#9E7D4B] transition-all duration-300 p-1 shadow-sm bg-white">
                <img
                  src={resolveAsset(cat.image)}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <span className="mt-2 text-[0.72rem] sm:text-xs font-medium text-[#1F1E1D] group-hover:text-[#9E7D4B] transition-colors text-center line-clamp-1">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 5. Complete Catalog & Product Showcase (De-cluttered with Load More) */}
      <section id="catalog" className="py-16 bg-[#FAF8F5] border-t border-[#F0ECE6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 text-left">
            <div>
              <span className="text-[0.68rem] uppercase tracking-[0.24em] text-[#9E7D4B] font-semibold block mb-1">
                COMPLETE CATALOG
              </span>
              <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#1F1E1D] font-normal">
                {activeTab === "all" ? "All Handcrafted Pieces" : categories.find((c) => c.id === activeTab)?.label || "Selected Collection"} ({filteredProducts.length})
              </h2>
              <p className="text-xs sm:text-sm text-[#78746F] mt-1">
                Handcrafted with devotion and care. Tap any piece for full details and WhatsApp ordering.
              </p>
            </div>

            <div className="mt-4 md:mt-0 text-xs text-[#78746F]">
              Showing <span className="font-semibold text-[#1F1E1D]">{visibleProducts.length}</span> of <span className="font-semibold text-[#1F1E1D]">{filteredProducts.length}</span> pieces
            </div>
          </div>

          {/* Catalog Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
            {categories.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 shrink-0 border cursor-pointer ${isActive
                      ? "bg-[#1F1E1D] text-white border-[#1F1E1D] shadow-xs"
                      : "bg-white text-[#4A4744] border-[#EAE5DC] hover:border-[#9E7D4B] hover:text-[#9E7D4B]"
                    }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Product Cards Grid */}
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
                className="btn-bronze text-xs py-2 px-4 cursor-pointer"
              >
                VIEW ALL DESIGNS
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {visibleProducts.map((product) => {
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
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-white border border-[#D9DCD8]/70 rounded-none shadow-2xs">
                      {product.badge && product.badge.text !== "Original Click" && (
                        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 flex flex-col gap-1 pointer-events-none z-10">
                          <span className="bg-[#E9CFCB] text-[#1E2321] text-[10px] sm:text-[11px] font-sans font-medium px-1.5 sm:px-2 py-0.5 rounded-[2px] tracking-wide shadow-2xs">
                            {product.badge.text}
                          </span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product.id);
                        }}
                        className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 hover:bg-white flex items-center justify-center text-[#1E2321] transition-all z-10 shadow-2xs hover:scale-105 cursor-pointer"
                        aria-label="Save to wishlist"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${isWishlisted
                              ? "fill-[#9C2B2B] text-[#9C2B2B] scale-110"
                              : "text-[#1E2321] stroke-[1.75]"
                            }`}
                        />
                      </button>

                      <img
                        src={resolveAsset(product.image)}
                        alt={product.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />

                      <div className="hidden lg:block absolute inset-x-2.5 bottom-2.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuickViewProduct(product);
                          }}
                          className="w-full py-2 bg-white/95 hover:bg-white text-[#1E2321] text-[12px] font-medium rounded-[3px] border border-[#D9DCD8] shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#17382F]" />
                          <span>Quick view</span>
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 sm:mt-2.5 text-left">
                      <h3 className="font-sans font-medium text-[13px] sm:text-[15px] leading-snug text-[#1E2321] line-clamp-1 group-hover:text-[#9E7D4B] transition-colors">
                        {product.name}
                      </h3>
                    </div>

                    <div className="mt-0.5 sm:mt-1 flex items-baseline gap-1.5 sm:gap-2 text-left flex-wrap">
                      <span className="font-sans font-semibold text-[13px] sm:text-[15px] text-[#1E2321] tabular-nums">
                        ₹{product.price.toLocaleString()}
                      </span>
                      {product.originalPrice > product.price && (
                        <>
                          <span className="font-sans text-[11px] sm:text-[13px] text-[#717674] line-through tabular-nums">
                            ₹{product.originalPrice.toLocaleString()}
                          </span>
                          <span className="font-sans text-[10px] sm:text-[12px] font-medium text-[#9C2B2B]">
                            {discount}% off
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Clean Pagination / Load More Bar */}
          {visibleCount < filteredProducts.length && (
            <div className="mt-12 pt-8 border-t border-[#EAE5DC] flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-48 h-1 bg-[#EAE5DC] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#9E7D4B] transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (visibleProducts.length / filteredProducts.length) * 100)}%`,
                  }}
                />
              </div>
              <span className="text-xs text-[#78746F]">
                Showing {visibleProducts.length} of {filteredProducts.length} pieces
              </span>
              <div className="flex items-center gap-3 mt-1">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 8)}
                  className="btn-bronze text-xs py-2.5 px-6 rounded-sm cursor-pointer shadow-sm"
                >
                  SHOW MORE DESIGNS ({filteredProducts.length - visibleCount} REMAINING)
                </button>
                <button
                  onClick={() => setVisibleCount(filteredProducts.length)}
                  className="text-xs text-[#4A4744] hover:text-[#9E7D4B] underline underline-offset-4 cursor-pointer font-medium"
                >
                  View All ({filteredProducts.length})
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 6. Dual Editorial Feature Banners */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                className="btn-bronze bg-white/95 text-[#1F1E1D] hover:bg-white text-xs font-semibold py-2.5 px-5 rounded-[2px] cursor-pointer"
              >
                <span>EXPLORE WEDDING</span>
                <span>→</span>
              </button>
            </div>
          </div>

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
                className="btn-bronze bg-white/95 text-[#1F1E1D] hover:bg-white text-xs font-semibold py-2.5 px-5 rounded-[2px] cursor-pointer"
              >
                <span>SHOP GIFTS</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Newsletter Banner */}
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
            <button type="submit" className="btn-bronze w-full sm:w-auto py-3 px-6 rounded-[2px] cursor-pointer">
              {subscribed ? "THANK YOU FOR SUBSCRIBING ♡" : "SUBSCRIBE"}
            </button>
          </form>

          <span className="font-serif-luxury italic text-sm text-[#9E7D4B] block pt-1">
            A Brighter Tomorrow Together ♡
          </span>
        </div>
      </section>

      {/* 8. Minimized Clean Luxury Footer */}
      <footer className="bg-white text-[#1F1E1D] pt-12 pb-8 border-t border-[#F0ECE6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-[#F0ECE6] text-left">
            {/* Brand Col (4 cols) */}
            <div className="md:col-span-4 space-y-3">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="flex items-center gap-3 text-left group cursor-pointer select-none"
              >
                <img
                  src={resolveAsset("/images/shambhavi_crest_transparent.png")}
                  alt="Shambhavi Creations"
                  className="h-13 sm:h-14 w-auto object-contain drop-shadow-[0_2px_8px_rgba(158,125,75,0.2)] group-hover:scale-105 transition-transform duration-300"
                />
                <div className="flex flex-col justify-center min-w-0">
                  <span className="font-serif-luxury text-lg sm:text-xl font-bold tracking-[0.2em] text-[#1F1E1D] group-hover:text-[#9E7D4B] transition-colors uppercase leading-none whitespace-nowrap">
                    Shambhavi
                  </span>
                  <div className="flex items-center gap-1.5 mt-1 whitespace-nowrap">
                    <span className="text-[0.58rem] uppercase tracking-[0.28em] text-[#9E7D4B] font-semibold leading-none whitespace-nowrap">
                      Creations
                    </span>
                    <span className="text-[0.45rem] text-[#C2A374] leading-none">•</span>
                    <span className="text-[0.52rem] uppercase tracking-[0.22em] text-[#78746F] font-medium leading-none whitespace-nowrap">
                      {storeSettings.tagline}
                    </span>
                  </div>
                </div>
              </button>
              <p className="text-xs text-[#78746F] max-w-sm leading-relaxed">
                Handcrafted imitation jewellery, bridal collections, and authentic festive ornaments.
              </p>
            </div>

            {/* All Categories Column (5 cols) */}
            <div className="md:col-span-5 space-y-3">
              <h4 className="text-xs font-semibold text-[#1F1E1D] uppercase tracking-wider">
                All Collections & Categories
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-[#78746F]">
                {categories.filter((c) => c.id !== "all").map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      handleSelectTab(cat.id);
                      const el = document.getElementById("catalog");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="hover:text-[#9E7D4B] transition-colors text-left cursor-pointer truncate"
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Social & Connect Column (3 cols) */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-xs font-semibold text-[#1F1E1D] uppercase tracking-wider">
                Connect With Us
              </h4>
              <div className="flex flex-col space-y-2.5 text-xs">
                <a
                  href={storeSettings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#4A4744] hover:text-[#9E7D4B] transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                  <span>Instagram Profile</span>
                </a>
                <a
                  href={formatWhatsAppLink(storeSettings.phone, "Hello Shambhavi Creations, I would like to inquire about your jewellery collections.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#1FA855] hover:underline transition-colors font-medium"
                >
                  <span className="w-2 h-2 rounded-full bg-[#1FA855] animate-pulse" />
                  <span>WhatsApp Inquiries</span>
                </a>
                <button
                  onClick={handleShareWebsite}
                  className="flex items-center gap-2 text-[#4A4744] hover:text-[#9E7D4B] transition-colors cursor-pointer text-left"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Store Link</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[0.72rem] text-[#78746F] gap-2">
            <p>© {CURRENT_YEAR} {storeSettings.storeName}. All rights reserved.</p>
            <p className="font-serif-luxury italic text-[#9E7D4B]">
              Handcrafted with pride & devotion ♡
            </p>
          </div>
        </div>
      </footer>

      {/* 9. Interactive Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-[2px] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#EAE5DC] relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 p-2 text-[#78746F] hover:text-[#1F1E1D] z-10 rounded-full hover:bg-[#FAF8F5] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8">
              <div className="aspect-square rounded-[2px] overflow-hidden bg-[#FAF8F5] border border-[#EAE5DC]">
                <img
                  src={resolveAsset(quickViewProduct.image)}
                  alt={quickViewProduct.name}
                  className="w-full h-full object-cover object-center"
                />
              </div>

              <div className="space-y-4 text-left flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[0.65rem] uppercase tracking-wider text-[#9E7D4B] font-semibold">
                      {quickViewProduct.categoryLabel}
                    </span>
                    <span className="text-[0.62rem] bg-[#EBF7EE] text-[#1E7E34] px-1.5 py-0.5 rounded-sm font-semibold">
                      {quickViewProduct.shippingStatus}
                    </span>
                  </div>

                  <h3 className="font-serif-luxury text-2xl text-[#1F1E1D] font-normal leading-tight">
                    {quickViewProduct.name}
                  </h3>

                  <div className="flex items-baseline gap-3 my-3">
                    <span className="text-2xl font-semibold text-[#1F1E1D]">
                      ₹{quickViewProduct.price.toLocaleString()}
                    </span>
                    {quickViewProduct.originalPrice > quickViewProduct.price && (
                      <>
                        <span className="text-sm text-[#78746F] line-through">
                          ₹{quickViewProduct.originalPrice.toLocaleString()}
                        </span>
                        <span className="text-xs text-[#1E7E34] font-medium">
                          Save ₹{(quickViewProduct.originalPrice - quickViewProduct.price).toLocaleString()}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="space-y-2 border-t border-[#F0ECE6] pt-3 text-xs text-[#78746F]">
                    <div>
                      <span className="font-semibold text-[#1F1E1D]">Plating: </span>
                      {quickViewProduct.plating}
                    </div>
                    <div>
                      <span className="font-semibold text-[#1F1E1D]">Stones & Craft: </span>
                      {quickViewProduct.stones}
                    </div>
                    <div className="pt-2 text-xs leading-relaxed text-[#4A4744]">
                      {quickViewProduct.description}
                    </div>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <button
                    onClick={() => {
                      addToCart(quickViewProduct);
                      setQuickViewProduct(null);
                    }}
                    className="btn-bronze w-full py-3 text-xs rounded-[2px] cursor-pointer"
                  >
                    ADD TO CURATED BOX
                  </button>
                  <button
                    onClick={() => {
                      handleOrderWhatsApp(quickViewProduct.name, quickViewProduct.price);
                      setQuickViewProduct(null);
                    }}
                    className="w-full bg-[#1FA855] hover:bg-[#1B944B] text-white py-3 text-xs font-semibold rounded-[2px] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>ORDER ON WHATSAPP DIRECTLY</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. Cart Slide-out Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs">
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-[#EAE5DC]">
              <div className="p-5 border-b border-[#F0ECE6] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#9E7D4B]" />
                  <h3 className="font-serif-luxury text-lg text-[#1F1E1D] font-medium">
                    Your Curated Box ({cartItemsCount})
                  </h3>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 text-[#78746F] hover:text-[#1F1E1D] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <ShoppingBag className="w-12 h-12 text-[#EAE5DC] mx-auto stroke-[1]" />
                    <p className="text-sm text-[#78746F]">Your curated box is currently empty.</p>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="btn-bronze text-xs py-2 px-4 cursor-pointer"
                    >
                      EXPLORE CATALOG
                    </button>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex gap-4 pb-4 border-b border-[#FAF8F5] text-left"
                    >
                      <img
                        src={resolveAsset(item.product.image)}
                        alt={item.product.name}
                        className="w-16 h-20 object-cover rounded-[2px] border border-[#EAE5DC]"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-medium text-[#1F1E1D] line-clamp-1">
                          {item.product.name}
                        </h4>
                        <span className="text-[0.68rem] text-[#78746F] block mt-0.5">
                          {item.product.categoryLabel}
                        </span>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs font-semibold text-[#1F1E1D]">
                            ₹{(item.product.price * item.quantity).toLocaleString()}
                          </span>
                          <div className="flex items-center border border-[#EAE5DC] rounded-[2px]">
                            <button
                              onClick={() => updateCartQuantity(item.product.id, -1)}
                              className="px-2 py-0.5 text-xs text-[#78746F] hover:bg-[#FAF8F5] cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.product.id, 1)}
                              className="px-2 py-0.5 text-xs text-[#78746F] hover:bg-[#FAF8F5] cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-5 border-t border-[#F0ECE6] space-y-3 bg-[#FAF8F5]">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-[#4A4744]">Subtotal</span>
                    <span className="font-serif-luxury text-base font-semibold text-[#1F1E1D]">
                      ₹{cartTotal.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[0.68rem] text-[#78746F]">
                    Shipping and complimentary velvet gift box included across Maharashtra.
                  </p>
                  <button
                    onClick={handleCheckoutCartWhatsApp}
                    className="w-full bg-[#1FA855] hover:bg-[#1B944B] text-white py-3 text-xs font-semibold rounded-[2px] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <span>CHECKOUT ON WHATSAPP</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 11. Wishlist Slide-out Drawer */}
      {isWishlistOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs">
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-[#EAE5DC]">
              <div className="p-5 border-b border-[#F0ECE6] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-[#9C2B2B]" />
                  <h3 className="font-serif-luxury text-lg text-[#1F1E1D] font-medium">
                    Your Wishlist ({wishlist.length})
                  </h3>
                </div>
                <button
                  onClick={() => setIsWishlistOpen(false)}
                  className="p-1 text-[#78746F] hover:text-[#1F1E1D] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {wishlist.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <Heart className="w-12 h-12 text-[#EAE5DC] mx-auto stroke-[1]" />
                    <p className="text-sm text-[#78746F]">Your wishlist is currently empty.</p>
                  </div>
                ) : (
                  products
                    .filter((p) => wishlist.includes(p.id))
                    .map((p) => (
                      <div
                        key={p.id}
                        className="flex gap-4 pb-4 border-b border-[#FAF8F5] text-left items-center"
                      >
                        <img
                          src={resolveAsset(p.image)}
                          alt={p.name}
                          className="w-14 h-18 object-cover rounded-[2px] border border-[#EAE5DC]"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-medium text-[#1F1E1D] line-clamp-1">{p.name}</h4>
                          <span className="text-xs font-semibold text-[#1F1E1D] mt-1 block">
                            ₹{p.price.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => {
                              addToCart(p);
                              toggleWishlist(p.id);
                            }}
                            className="px-2.5 py-1 bg-[#1F1E1D] text-white text-[11px] font-medium rounded-[2px] hover:bg-[#9E7D4B] transition-colors cursor-pointer"
                          >
                            Add to Cart
                          </button>
                          <button
                            onClick={() => toggleWishlist(p.id)}
                            className="text-[10px] text-[#78746F] hover:text-[#9C2B2B] text-center cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
