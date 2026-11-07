import React, { useState } from "react";
import {
  Package,
  Plus,
  Trash2,
  Edit2,
  MessageCircle,
  Settings,
  ArrowLeft,
  X,
  Search,
  Filter,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { resolveAsset, formatWhatsAppLink } from "../utils";

export interface Product {
  id: string;
  name: string;
  category: string;
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

export interface StoreSettings {
  storeName: string;
  tagline: string;
  city: string;
  phone: string;
  ownerName: string;
  instagramUrl: string;
  announcementText: string;
}

export interface CategoryItem {
  id: string;
  label: string;
  image: string;
  subtitle?: string;
  isCustom?: boolean;
}

interface AdminPanelProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  onBackToStore: () => void;
  storeSettings: StoreSettings;
  setStoreSettings: React.Dispatch<React.SetStateAction<StoreSettings>>;
  categories: CategoryItem[];
  setCategories: React.Dispatch<React.SetStateAction<CategoryItem[]>>;
}

export const AVAILABLE_PHOTOS = [
  { label: "Wati Mangalsutra (3-Line Official)", path: "/photos/shambhavi_signature_wati_haar.jpg" },
  { label: "Double Chain Wati Mangalsutra", path: "/photos/photo_11.jpg" },
  { label: "Diamond Floret Wati Set", path: "/photos/shambhavi_diamond_wati_set.jpg" },
  { label: "Traditional Long Wati on Model", path: "/photos/photo_18.jpg" },
  { label: "Kolhapuri 4-Line Ruby Wati Haar", path: "/photos/photo_15.jpg" },
  { label: "Ruby Halo Wati with Bangles", path: "/photos/photo_17.jpg" },
  { label: "Emerald Cut Mangalsutra", path: "/photos/photo_13.jpg" },
  { label: "Carved Gold Wati & Bangles", path: "/photos/photo_12.jpg" },
  { label: "Square Ruby Diamond Wati", path: "/photos/photo_19.jpg" },
  { label: "Hero Model with Paithani Bangles", path: "/photos/hero_model_bangles.jpg" },
  { label: "Bridal Jadau Ruby & Emerald Kadas", path: "/photos/jadau_ruby_emerald_kadas.jpg" },
  { label: "Peshwai Ruby Dome Kadas", path: "/photos/peshwai_ruby_cluster_kadas.jpg" },
  { label: "Russian Emerald Openable Bangles", path: "/photos/russian_emerald_royal_bangles.jpg" },
  { label: "Patli Tode Twisted Bangles Stack", path: "/photos/classic_patli_tode_bangles.jpg" },
  { label: "Royal Filigree Bridal Bangles", path: "/photos/photo_2.jpg" },
  { label: "South Temple Peacock Haar", path: "/photos/south_temple_peacock_haar.jpg" },
  { label: "Temple Medallion Haar & Studs", path: "/photos/temple_floral_medallion_necklace.jpg" },
  { label: "Gulabi Meenakari Jhumkas", path: "/images/gulabi_jhumkas.png" },
  { label: "Solitaire Rings Collection", path: "/images/feature_rings.jpg" },
  { label: "Curated Gift Hampers", path: "/images/feature_gift.jpg" },
];

export const AdminPanel: React.FC<AdminPanelProps> = ({
  products,
  setProducts,
  onBackToStore,
  storeSettings,
  setStoreSettings,
  categories,
  setCategories,
}) => {
  const [activeTab, setActiveTab] = useState<"products" | "categories" | "inquiries" | "settings">("products");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Settings local state for saving
  const [localSettings, setLocalSettings] = useState<StoreSettings>(() => {
    const clean = { ...storeSettings };
    if (clean.city && (clean.city.includes("Sambhajinagar") || clean.city.includes("CSN"))) {
      clean.city = "";
    }
    if (clean.tagline && (clean.tagline.includes("Sambhajinagar") || clean.tagline.includes("CSN"))) {
      clean.tagline = "Fine Jewellery & Bridal Atelier";
    }
    return clean;
  });
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  // Category Add Modal state
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState<CategoryItem>({
    id: "",
    label: "",
    image: "/photos/shambhavi_signature_wati_haar.jpg",
    subtitle: "",
    isCustom: true,
  });

  // Form State for Add / Edit Product
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    category: "necklaces",
    categoryLabel: "Mangalsutra",
    price: 999,
    originalPrice: 1499,
    image: "/photos/shambhavi_signature_wati_haar.jpg",
    plating: "Gold Plated Finish",
    stones: "Traditional Handcrafted Wati",
    description: "",
    shippingStatus: "Ready to Ship",
    badge: { text: "Original Click", variant: "new" },
  });

  // Simulated WhatsApp Inquiries log
  const [inquiries] = useState([
    {
      id: "inq-1",
      customer: "Snehal Deshmukh",
      phone: "+91 98231 44512",
      product: "Shambhavi Signature 3-Line Wati Mangalsutra",
      amount: "₹1,599",
      time: "15 mins ago",
      status: "WhatsApp Message Sent",
    },
    {
      id: "inq-2",
      customer: "Kavita Patil",
      phone: "+91 94220 89123",
      product: "Heritage Jadau Ruby & Emerald Bridal Kadas",
      amount: "₹1,699",
      time: "2 hours ago",
      status: "Order Confirmed",
    },
    {
      id: "inq-3",
      customer: "Rohini Kulkarni",
      phone: "+91 97654 32190",
      product: "Classic 24K Gold Polish Patli Tode Bangles (Set of 6)",
      amount: "₹1,299",
      time: "Yesterday",
      status: "Dispatched (Courier)",
    },
  ]);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categoryLabel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      category: categories.find((c) => c.id !== "all")?.id || "necklaces",
      categoryLabel: categories.find((c) => c.id !== "all")?.label || "Mangalsutra & Sets",
      price: 1199,
      originalPrice: 1699,
      image: "/photos/shambhavi_signature_wati_haar.jpg",
      plating: "Gold Plated Finish",
      stones: "Traditional Handcrafted Wati",
      description: "Fine handcrafted piece made with care.",
      shippingStatus: "Ready to Ship",
      badge: { text: "Original Click", variant: "new" },
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({ ...product });
    setIsAddModalOpen(true);
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from the catalog?`)) {
      setProducts((prev) => {
        const updated = prev.filter((p) => p.id !== id);
        localStorage.setItem("shambhavi_products_catalog_v2", JSON.stringify(updated));
        return updated;
      });
    }
  };

  const handleToggleStock = (id: string) => {
    setProducts((prev) => {
      const updated = prev.map((p) => {
        if (p.id === id) {
          const nextStatus =
            p.shippingStatus === "Ready to Ship" ? "Sold Out" : "Ready to Ship";
          return { ...p, shippingStatus: nextStatus };
        }
        return p;
      });
      localStorage.setItem("shambhavi_products_catalog_v2", JSON.stringify(updated));
      return updated;
    });
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    const matchedCat = categories.find((c) => c.id === formData.category);
    const categoryLabel = matchedCat ? matchedCat.label : (formData.categoryLabel || "Jewellery");

    if (editingProduct) {
      setProducts((prev) => {
        const updated = prev.map((p) =>
          p.id === editingProduct.id
            ? ({
                ...p,
                ...formData,
                categoryLabel,
                price: Number(formData.price),
                originalPrice: Number(formData.originalPrice || formData.price),
              } as Product)
            : p
        );
        localStorage.setItem("shambhavi_products_catalog_v2", JSON.stringify(updated));
        return updated;
      });
    } else {
      const newProduct: Product = {
        id: `p-custom-${Date.now()}`,
        name: formData.name || "New Jewellery Piece",
        category: formData.category || "necklaces",
        categoryLabel,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice || formData.price),
        rating: 5.0,
        reviewsCount: 1,
        image: formData.image || "/photos/shambhavi_signature_wati_haar.jpg",
        badge: formData.badge?.text
          ? formData.badge
          : { text: "Original Click", variant: "new" },
        plating: formData.plating || "Gold Plated Finish",
        stones: formData.stones || "Authentic Handcrafted Piece",
        description:
          formData.description ||
          "Handcrafted imitation jewellery piece from Shambhavi Creations.",
        shippingStatus: formData.shippingStatus || "Ready to Ship",
      };
      setProducts((prev) => {
        const updated = [newProduct, ...prev];
        localStorage.setItem("shambhavi_products_catalog_v2", JSON.stringify(updated));
        return updated;
      });
    }
    setIsAddModalOpen(false);
  };

  // Save Settings handler
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setStoreSettings(localSettings);
    localStorage.setItem("shambhavi_store_settings_v1", JSON.stringify(localSettings));
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 3500);
  };

  // Add Category Handler
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormData.label) return;
    const cleanId = (categoryFormData.id || categoryFormData.label.toLowerCase().replace(/[^a-z0-9]/g, "-")).trim();

    if (categories.some((c) => c.id === cleanId)) {
      alert("A category with this ID already exists. Please choose another ID.");
      return;
    }

    const newCat: CategoryItem = {
      ...categoryFormData,
      id: cleanId,
      isCustom: true,
    };

    const updated = [...categories, newCat];
    setCategories(updated);
    localStorage.setItem("shambhavi_categories_v1", JSON.stringify(updated));
    setIsAddCategoryOpen(false);
    setCategoryFormData({
      id: "",
      label: "",
      image: "/photos/shambhavi_signature_wati_haar.jpg",
      subtitle: "",
      isCustom: true,
    });
  };

  const handleDeleteCategory = (catId: string, label: string) => {
    if (window.confirm(`Delete category "${label}"? Existing products in this category will remain in the catalog.`)) {
      const updated = categories.filter((c) => c.id !== catId);
      setCategories(updated);
      localStorage.setItem("shambhavi_categories_v1", JSON.stringify(updated));
    }
  };

  const totalProducts = products.length;
  const inStockCount = products.filter((p) => p.shippingStatus === "Ready to Ship").length;
  const soldOutCount = products.filter((p) => p.shippingStatus === "Sold Out").length;

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#1F1E1D] font-sans">
      {/* Top Bar */}
      <header className="bg-white border-b border-[#EAE5DC] sticky top-0 z-40 px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToStore}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#FAF8F5] border border-[#EAE5DC] text-xs font-medium text-[#4A4744] hover:text-[#1F1E1D] hover:border-[#9E7D4B] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Storefront</span>
            </button>
            <div className="h-4 w-px bg-[#EAE5DC] hidden sm:block" />
            <div className="text-left">
              <span className="font-serif-luxury font-semibold text-lg tracking-wide text-[#1F1E1D] block leading-none">
                {storeSettings.storeName}
              </span>
              <span className="text-[0.62rem] uppercase tracking-[0.2em] text-[#9E7D4B] font-semibold">
                Owner Portal{storeSettings.city ? ` • ${storeSettings.city}` : " • Store & Catalog Manager"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAdd}
              className="btn-bronze text-xs py-2 px-3 sm:px-4 flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Product</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 border-b border-[#EAE5DC] pb-4 mb-6">
          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-sm transition-all cursor-pointer ${
              activeTab === "products"
                ? "bg-[#1F1E1D] text-white shadow-xs"
                : "bg-white text-[#4A4744] border border-[#EAE5DC] hover:text-[#1F1E1D]"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Product Catalog ({totalProducts})</span>
          </button>

          <button
            onClick={() => setActiveTab("categories")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-sm transition-all cursor-pointer ${
              activeTab === "categories"
                ? "bg-[#1F1E1D] text-white shadow-xs"
                : "bg-white text-[#4A4744] border border-[#EAE5DC] hover:text-[#1F1E1D]"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Category Management ({categories.filter((c) => c.id !== "all").length})</span>
          </button>

          <button
            onClick={() => setActiveTab("inquiries")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-sm transition-all cursor-pointer ${
              activeTab === "inquiries"
                ? "bg-[#1F1E1D] text-white shadow-xs"
                : "bg-white text-[#4A4744] border border-[#EAE5DC] hover:text-[#1F1E1D]"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Inquiries ({inquiries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-sm transition-all cursor-pointer ${
              activeTab === "settings"
                ? "bg-[#1F1E1D] text-white shadow-xs"
                : "bg-white text-[#4A4744] border border-[#EAE5DC] hover:text-[#1F1E1D]"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Store Settings & Contact</span>
          </button>
        </div>

        {/* TAB 1: PRODUCT CATALOG */}
        {activeTab === "products" && (
          <div className="space-y-6">
            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-sm border border-[#EAE5DC] p-4 text-left shadow-2xs">
                <span className="text-[0.68rem] text-[#78746F] font-semibold uppercase tracking-wider block">
                  Total Catalog Pieces
                </span>
                <span className="font-serif-luxury text-2xl font-bold text-[#1F1E1D] mt-1 block">
                  {totalProducts}
                </span>
                <span className="text-[0.68rem] text-[#9E7D4B] mt-0.5 block">
                  Active in storefront
                </span>
              </div>

              <div className="bg-white rounded-sm border border-[#EAE5DC] p-4 text-left shadow-2xs">
                <span className="text-[0.68rem] text-[#78746F] font-semibold uppercase tracking-wider block">
                  Ready to Ship
                </span>
                <span className="font-serif-luxury text-2xl font-bold text-[#1E7E34] mt-1 block">
                  {inStockCount}
                </span>
                <span className="text-[0.68rem] text-[#78746F] mt-0.5 block">
                  Available for immediate WhatsApp order
                </span>
              </div>

              <div className="bg-white rounded-sm border border-[#EAE5DC] p-4 text-left shadow-2xs">
                <span className="text-[0.68rem] text-[#78746F] font-semibold uppercase tracking-wider block">
                  Sold Out
                </span>
                <span className="font-serif-luxury text-2xl font-bold text-[#D9534F] mt-1 block">
                  {soldOutCount}
                </span>
                <span className="text-[0.68rem] text-[#78746F] mt-0.5 block">
                  Click status toggle to re-stock
                </span>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white rounded-sm border border-[#EAE5DC] p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#78746F] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search product name, category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border border-[#EAE5DC] rounded-sm text-xs text-[#1F1E1D] focus:outline-none focus:border-[#9E7D4B]"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-[#78746F]" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-[#FAF8F5] border border-[#EAE5DC] text-xs text-[#1F1E1D] py-2 px-3 rounded-sm focus:outline-none focus:border-[#9E7D4B] cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {categories.filter((c) => c.id !== "all").map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-sm border border-[#EAE5DC] overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] border-b border-[#EAE5DC] text-[#78746F] uppercase text-[0.65rem] tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Product Details</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Badge</th>
                      <th className="py-3 px-4">Stock Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0ECE6]">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={resolveAsset(product.image)}
                              alt={product.name}
                              className="w-12 h-14 object-cover rounded-[2px] border border-[#EAE5DC]"
                            />
                            <div>
                              <span className="font-semibold text-xs text-[#1F1E1D] block line-clamp-1">
                                {product.name}
                              </span>
                              <span className="text-[0.68rem] text-[#78746F] line-clamp-1 mt-0.5">
                                {product.plating} • {product.stones}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#4A4744]">
                          {product.categoryLabel}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-[#1F1E1D]">
                            ₹{product.price.toLocaleString("en-IN")}
                          </span>
                          {product.originalPrice > product.price && (
                            <span className="text-[0.68rem] text-[#78746F] line-through block">
                              ₹{product.originalPrice.toLocaleString("en-IN")}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {product.badge ? (
                            <span className="px-2 py-0.5 rounded-[2px] text-[0.68rem] font-medium bg-[#9E7D4B]/10 text-[#9E7D4B] border border-[#9E7D4B]/20">
                              {product.badge.text}
                            </span>
                          ) : (
                            <span className="text-[#78746F] text-[0.68rem]">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleStock(product.id)}
                            className={`px-2.5 py-1 rounded-full text-[0.68rem] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                              product.shippingStatus === "Ready to Ship"
                                ? "bg-[#1FA855]/10 text-[#1FA855] border border-[#1FA855]/30 hover:bg-[#1FA855]/20"
                                : "bg-[#D9534F]/10 text-[#D9534F] border border-[#D9534F]/30 hover:bg-[#D9534F]/20"
                            }`}
                            title="Click to toggle stock status"
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                product.shippingStatus === "Ready to Ship"
                                  ? "bg-[#1FA855]"
                                  : "bg-[#D9534F]"
                              }`}
                            />
                            <span>{product.shippingStatus}</span>
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(product)}
                              className="p-1.5 text-[#4A4744] hover:text-[#9E7D4B] hover:bg-white rounded-[2px] border border-transparent hover:border-[#EAE5DC] cursor-pointer"
                              title="Edit product"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id, product.name)}
                              className="p-1.5 text-[#78746F] hover:text-[#D9534F] hover:bg-white rounded-[2px] border border-transparent hover:border-[#EAE5DC] cursor-pointer"
                              title="Delete product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CATEGORY MANAGEMENT */}
        {activeTab === "categories" && (
          <div className="space-y-6 text-left">
            <div className="bg-white rounded-sm border border-[#EAE5DC] p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif-luxury text-xl text-[#1F1E1D]">
                  Category Collections
                </h3>
                <p className="text-xs text-[#78746F] mt-1">
                  Manage categories shown in the header mega menu, visual bubbles, and catalog filters.
                </p>
              </div>
              <button
                onClick={() => setIsAddCategoryOpen(true)}
                className="btn-bronze text-xs py-2 px-4 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.filter((c) => c.id !== "all").map((cat) => {
                const count = products.filter((p) =>
                  cat.id === "under-1000"
                    ? p.price <= 1000
                    : cat.id === "festive"
                    ? p.category === "festive" || p.category === "polki"
                    : p.category === cat.id
                ).length;

                return (
                  <div
                    key={cat.id}
                    className="bg-white rounded-sm border border-[#EAE5DC] p-4 flex items-start gap-4 shadow-2xs hover:border-[#9E7D4B] transition-colors"
                  >
                    <img
                      src={resolveAsset(cat.image)}
                      alt={cat.label}
                      className="w-16 h-16 object-cover rounded-[2px] border border-[#EAE5DC] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-serif-luxury font-medium text-base text-[#1F1E1D] truncate">
                          {cat.label}
                        </h4>
                        {cat.isCustom && (
                          <button
                            onClick={() => handleDeleteCategory(cat.id, cat.label)}
                            className="p-1 text-[#78746F] hover:text-[#D9534F] rounded-[2px] transition-colors cursor-pointer"
                            title="Delete custom category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <span className="text-[0.68rem] text-[#78746F] block mt-0.5 font-mono">
                        ID: {cat.id}
                      </span>
                      {cat.subtitle && (
                        <p className="text-xs text-[#4A4744] mt-1 line-clamp-1">
                          {cat.subtitle}
                        </p>
                      )}
                      <span className="mt-2 inline-block px-2 py-0.5 rounded-[2px] text-[0.65rem] font-semibold bg-[#9E7D4B]/10 text-[#9E7D4B]">
                        {count} {count === 1 ? "piece" : "pieces"} in catalog
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: WHATSAPP INQUIRIES */}
        {activeTab === "inquiries" && (
          <div className="bg-white rounded-sm border border-[#EAE5DC] p-6 text-left space-y-4 shadow-2xs">
            <div>
              <h3 className="font-serif-luxury text-xl text-[#1F1E1D]">
                Customer WhatsApp Inquiries
              </h3>
              <p className="text-xs text-[#78746F] mt-1">
                Direct buyer leads logged from the "Order on WhatsApp" buttons.
              </p>
            </div>

            <div className="divide-y divide-[#F0ECE6] border border-[#EAE5DC] rounded-sm">
              {inquiries.map((inq) => (
                <div key={inq.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-[#FAF8F5]/80 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-[#1F1E1D]">
                        {inq.customer}
                      </span>
                      <span className="text-[0.68rem] text-[#78746F]">({inq.phone})</span>
                      <span className="text-[0.62rem] bg-[#1FA855]/10 text-[#1FA855] px-2 py-0.5 rounded-full font-medium">
                        {inq.status}
                      </span>
                    </div>
                    <div className="text-xs text-[#4A4744]">
                      Inquired for: <span className="font-medium text-[#1F1E1D]">{inq.product}</span>
                    </div>
                    <span className="text-[0.68rem] text-[#78746F] block">{inq.time}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-serif-luxury text-base font-semibold text-[#1F1E1D]">
                      {inq.amount}
                    </span>
                    <a
                      href={formatWhatsAppLink(
                        storeSettings.phone,
                        `Hello ${inq.customer}, regarding your inquiry for ${inq.product}`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-[#1FA855] text-white text-xs font-semibold rounded-[2px] hover:bg-[#1B944B] transition-colors"
                    >
                      Chat on WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: STORE SETTINGS & CONTACT */}
        {activeTab === "settings" && (
          <div className="bg-white rounded-sm border border-[#EAE5DC] p-6 text-left space-y-6 max-w-3xl shadow-2xs">
            <div>
              <h3 className="font-serif-luxury text-xl text-[#1F1E1D]">
                Store Identity & Contact Settings
              </h3>
              <p className="text-xs text-[#78746F] mt-1">
                Customize your store name, WhatsApp contact number, announcement bar, and studio location. All changes update the live site immediately.
              </p>
            </div>

            {settingsSavedToast && (
              <div className="bg-[#EBF7EE] border border-[#1FA855]/30 text-[#1E7E34] px-4 py-3 rounded-sm flex items-center gap-2 text-xs font-medium animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Store settings saved successfully and updated live on the storefront!</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#1F1E1D] block mb-1">
                  Announcement Bar Notice
                </label>
                <input
                  type="text"
                  value={localSettings.announcementText}
                  onChange={(e) => setLocalSettings({ ...localSettings, announcementText: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#EAE5DC] px-3 py-2 text-xs rounded-sm focus:outline-none focus:border-[#9E7D4B]"
                  placeholder="e.g. COMPLIMENTARY VELVET BOX PACKAGING ON ALL ORDERS"
                />
                <span className="text-[0.68rem] text-[#78746F] mt-1 block">
                  Displayed at the very top of the customer storefront.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#1F1E1D] block mb-1">
                    Store Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={localSettings.storeName}
                    onChange={(e) => setLocalSettings({ ...localSettings, storeName: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#EAE5DC] px-3 py-2 text-xs rounded-sm focus:outline-none focus:border-[#9E7D4B]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1F1E1D] block mb-1">
                    Store Tagline *
                  </label>
                  <input
                    type="text"
                    required
                    value={localSettings.tagline}
                    onChange={(e) => setLocalSettings({ ...localSettings, tagline: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#EAE5DC] px-3 py-2 text-xs rounded-sm focus:outline-none focus:border-[#9E7D4B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#1F1E1D] block mb-1">
                    WhatsApp Order Number * (Country code + 10 digits)
                  </label>
                  <input
                    type="text"
                    required
                    value={localSettings.phone}
                    onChange={(e) => setLocalSettings({ ...localSettings, phone: e.target.value })}
                    placeholder="919156131162"
                    className="w-full bg-[#FAF8F5] border border-[#EAE5DC] px-3 py-2 text-xs rounded-sm focus:outline-none focus:border-[#9E7D4B]"
                  />
                  <span className="text-[0.68rem] text-[#78746F] mt-1 block">
                    All WhatsApp inquiry buttons and customer redirects use this number.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1F1E1D] block mb-1">
                    Owner / Contact Person Name
                  </label>
                  <input
                    type="text"
                    value={localSettings.ownerName}
                    onChange={(e) => setLocalSettings({ ...localSettings, ownerName: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#EAE5DC] px-3 py-2 text-xs rounded-sm focus:outline-none focus:border-[#9E7D4B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#1F1E1D] block mb-1">
                    City & Region Location
                  </label>
                  <input
                    type="text"
                    value={localSettings.city}
                    onChange={(e) => setLocalSettings({ ...localSettings, city: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#EAE5DC] px-3 py-2 text-xs rounded-sm focus:outline-none focus:border-[#9E7D4B]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1F1E1D] block mb-1">
                    Official Instagram URL
                  </label>
                  <input
                    type="url"
                    value={localSettings.instagramUrl}
                    onChange={(e) => setLocalSettings({ ...localSettings, instagramUrl: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#EAE5DC] px-3 py-2 text-xs rounded-sm focus:outline-none focus:border-[#9E7D4B]"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-[#F0ECE6]">
                <span className="text-xs text-[#78746F]">
                  Target WhatsApp URL: <code className="text-[#1FA855] font-mono">{formatWhatsAppLink(localSettings.phone)}</code>
                </span>
                <button
                  type="submit"
                  className="btn-bronze py-2.5 px-6 text-xs font-semibold rounded-sm cursor-pointer shadow-sm"
                >
                  Save Store Settings
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* MODAL: ADD / EDIT PRODUCT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-sm border border-[#EAE5DC] max-w-xl w-full p-6 text-left max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EAE5DC] pb-3 mb-4">
              <h4 className="font-serif-luxury text-lg text-[#1F1E1D]">
                {editingProduct ? "Edit Product Details" : "Add New Jewellery Piece"}
              </h4>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-[#78746F] hover:text-[#1F1E1D] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#1F1E1D] block mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kolhapuri Saaj Wati Haar"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#EAE5DC] px-3 py-2 text-xs rounded-sm focus:outline-none focus:border-[#9E7D4B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#1F1E1D] block mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const cat = categories.find((c) => c.id === e.target.value);
                      setFormData({
                        ...formData,
                        category: e.target.value,
                        categoryLabel: cat ? cat.label : "Jewellery",
                      });
                    }}
                    className="w-full bg-[#FAF8F5] border border-[#EAE5DC] px-3 py-2 text-xs rounded-sm focus:outline-none focus:border-[#9E7D4B] cursor-pointer"
                  >
                    {categories.filter((c) => c.id !== "all").map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1F1E1D] block mb-1">
                    Stock Status
                  </label>
                  <select
                    value={formData.shippingStatus}
                    onChange={(e) => setFormData({ ...formData, shippingStatus: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#EAE5DC] px-3 py-2 text-xs rounded-sm focus:outline-none focus:border-[#9E7D4B] cursor-pointer"
                  >
                    <option value="Ready to Ship">Ready to Ship</option>
                    <option value="Made to Order">Made to Order</option>
                    <option value="Sold Out">Sold Out</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#1F1E1D] block mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.price || ""}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full bg-[#FAF8F5] border border-[#EAE5DC] px-3 py-2 text-xs rounded-sm focus:outline-none focus:border-[#9E7D4B]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1F1E1D] block mb-1">
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.originalPrice || ""}
                    onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                    className="w-full bg-[#FAF8F5] border border-[#EAE5DC] px-3 py-2 text-xs rounded-sm focus:outline-none focus:border-[#9E7D4B]"
                  />
                </div>
              </div>

              {/* Photo selector */}
              <div>
                <label className="text-xs font-semibold text-[#1F1E1D] block mb-1">
                  Product Photo Asset *
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-36 overflow-y-auto p-2 bg-[#FAF8F5] border border-[#EAE5DC] rounded-sm mb-2">
                  {AVAILABLE_PHOTOS.map((ph) => (
                    <button
                      key={ph.path}
                      type="button"
                      onClick={() => setFormData({ ...formData, image: ph.path })}
                      className={`relative aspect-square rounded-[2px] overflow-hidden border-2 transition-all cursor-pointer ${
                        formData.image === ph.path
                          ? "border-[#9E7D4B] scale-95 shadow-xs"
                          : "border-transparent opacity-75 hover:opacity-100"
                      }`}
                      title={ph.label}
                    >
                      <img src={resolveAsset(ph.path)} alt={ph.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Or enter custom image URL (e.g. /photos/... or https://...)"
                  value={formData.image || ""}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#EAE5DC] px-3 py-2 text-xs rounded-sm focus:outline-none focus:border-[#9E7D4B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#1F1E1D] block mb-1">
                    Plating / Polish
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 24K Gold Polish, Antique Matte"
                    value={formData.plating || ""}
                    onChange={(e) => setFormData({ ...formData, plating: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#EAE5DC] px-3 py-2 text-xs rounded-sm focus:outline-none focus:border-[#9E7D4B]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1F1E1D] block mb-1">
                    Badge Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bestseller, Few Left, Original Click"
                    value={formData.badge?.text || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        badge: e.target.value ? { text: e.target.value, variant: "new" } : undefined,
                      })
                    }
                    className="w-full bg-[#FAF8F5] border border-[#EAE5DC] px-3 py-2 text-xs rounded-sm focus:outline-none focus:border-[#9E7D4B]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1F1E1D] block mb-1">
                  Stones & Craftsmanship Details
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dual Wati with 3-Line Black Beads"
                  value={formData.stones || ""}
                  onChange={(e) => setFormData({ ...formData, stones: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#EAE5DC] px-3 py-2 text-xs rounded-sm focus:outline-none focus:border-[#9E7D4B]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1F1E1D] block mb-1">
                  Product Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the craftsmanship, occasion styling, materials..."
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#EAE5DC] px-3 py-2 text-xs rounded-sm focus:outline-none focus:border-[#9E7D4B]"
                />
              </div>

              <div className="pt-3 border-t border-[#EAE5DC] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#78746F] hover:text-[#1F1E1D] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-bronze text-xs py-2 px-6 shadow-sm cursor-pointer"
                >
                  {editingProduct ? "Save Changes" : "Publish to Storefront"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD CUSTOM CATEGORY */}
      {isAddCategoryOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-sm border border-[#EAE5DC] max-w-md w-full p-6 text-left shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EAE5DC] pb-3 mb-4">
              <h4 className="font-serif-luxury text-lg text-[#1F1E1D]">
                Add New Category
              </h4>
              <button
                onClick={() => setIsAddCategoryOpen(false)}
                className="p-1 text-[#78746F] hover:text-[#1F1E1D] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#1F1E1D] block mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bridal Naths & Nosepins"
                  value={categoryFormData.label}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, label: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#EAE5DC] px-3 py-2 text-xs rounded-sm focus:outline-none focus:border-[#9E7D4B]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1F1E1D] block mb-1">
                  Category ID (Slug)
                </label>
                <input
                  type="text"
                  placeholder="e.g. naths (optional, auto-generated)"
                  value={categoryFormData.id}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, id: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#EAE5DC] px-3 py-2 text-xs rounded-sm focus:outline-none focus:border-[#9E7D4B]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1F1E1D] block mb-1">
                  Subtitle / Tagline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Authentic Maharashtrian Pearls"
                  value={categoryFormData.subtitle || ""}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, subtitle: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#EAE5DC] px-3 py-2 text-xs rounded-sm focus:outline-none focus:border-[#9E7D4B]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1F1E1D] block mb-1">
                  Category Preview Photo *
                </label>
                <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto p-2 bg-[#FAF8F5] border border-[#EAE5DC] rounded-sm mb-2">
                  {AVAILABLE_PHOTOS.slice(0, 12).map((ph) => (
                    <button
                      key={ph.path}
                      type="button"
                      onClick={() => setCategoryFormData({ ...categoryFormData, image: ph.path })}
                      className={`relative aspect-square rounded-[2px] overflow-hidden border-2 transition-all cursor-pointer ${
                        categoryFormData.image === ph.path
                          ? "border-[#9E7D4B] scale-95 shadow-xs"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={resolveAsset(ph.path)} alt={ph.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Or enter image URL"
                  value={categoryFormData.image}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, image: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#EAE5DC] px-3 py-2 text-xs rounded-sm focus:outline-none focus:border-[#9E7D4B]"
                />
              </div>

              <div className="pt-3 border-t border-[#EAE5DC] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddCategoryOpen(false)}
                  className="px-4 py-2 text-xs text-[#78746F] hover:text-[#1F1E1D] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-bronze text-xs py-2 px-6 shadow-sm cursor-pointer"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
