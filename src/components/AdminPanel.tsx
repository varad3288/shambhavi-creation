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
} from "lucide-react";
import { resolveAsset } from "../utils";

export interface Product {
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

interface AdminPanelProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  onBackToStore: () => void;
  announcementText: string;
  setAnnouncementText: (text: string) => void;
}

const AVAILABLE_PHOTOS = [
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
];

export const AdminPanel: React.FC<AdminPanelProps> = ({
  products,
  setProducts,
  onBackToStore,
  announcementText,
  setAnnouncementText,
}) => {
  const [activeTab, setActiveTab] = useState<"products" | "inquiries" | "settings">("products");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    category: "necklaces",
    categoryLabel: "Mangalsutra",
    price: 999,
    originalPrice: 1499,
    image: "/photos/shambhavi_signature_wati_haar.jpg",
    plating: "Gold Plated Finish",
    stones: "Traditional Black & Gold Beads",
    description: "",
    shippingStatus: "Ready to Ship",
    badge: { text: "Original Click", variant: "new" },
  });

  // Simulated WhatsApp Inquiries log for Pallavi
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
      status: "Dispatched (Chh. Sambhajinagar)",
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
      category: "necklaces",
      categoryLabel: "Mangalsutra",
      price: 1199,
      originalPrice: 1699,
      image: "/photos/shambhavi_signature_wati_haar.jpg",
      plating: "Gold Plated Finish",
      stones: "Traditional Handcrafted Wati",
      description: "Fine handcrafted piece made with care in Chh. Sambhajinagar.",
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
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleToggleStock = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextStatus =
            p.shippingStatus === "Ready to Ship" ? "Sold Out" : "Ready to Ship";
          return { ...p, shippingStatus: nextStatus };
        }
        return p;
      })
    );
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    if (editingProduct) {
      // Update existing
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? ({
                ...p,
                ...formData,
                price: Number(formData.price),
                originalPrice: Number(formData.originalPrice || formData.price),
              } as Product)
            : p
        )
      );
    } else {
      // Create new
      const newProduct: Product = {
        id: `p-custom-${Date.now()}`,
        name: formData.name || "New Jewellery Piece",
        category: (formData.category as any) || "necklaces",
        categoryLabel:
          formData.category === "bangles"
            ? "Bangles & Kadas"
            : formData.category === "festive"
            ? "Festive Ready"
            : formData.category === "under-1000"
            ? "Under ₹1,000"
            : formData.category === "earrings"
            ? "Earrings"
            : formData.category === "rings"
            ? "Rings"
            : "Mangalsutra",
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
      setProducts((prev) => [newProduct, ...prev]);
    }
    setIsAddModalOpen(false);
  };

  // Stats
  const totalProducts = products.length;
  const inStockCount = products.filter((p) => p.shippingStatus === "Ready to Ship").length;
  const soldOutCount = products.filter((p) => p.shippingStatus === "Sold Out").length;

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#1F1E1D] font-sans">
      {/* ── Top Bar ────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-[#EAE5DC] sticky top-0 z-40 px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToStore}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#FAF8F5] border border-[#EAE5DC] text-xs font-medium text-[#4A4744] hover:text-[#1F1E1D] hover:border-[#9E7D4B] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>View Live Store</span>
            </button>
            <div className="h-4 w-px bg-[#EAE5DC] hidden sm:block" />
            <div className="text-left">
              <span className="font-serif-luxury font-semibold text-lg tracking-wide text-[#1F1E1D] block leading-none">
                SHAMBHAVI CREATIONS
              </span>
              <span className="text-[0.62rem] uppercase tracking-[0.2em] text-[#9E7D4B] font-semibold">
                Owner Admin Portal • Chh. Sambhajinagar
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAdd}
              className="btn-bronze text-xs py-2 px-3 sm:px-4 flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Product</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Container ─────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-[#EAE5DC] pb-4 mb-6">
          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-sm transition-all ${
              activeTab === "products"
                ? "bg-[#1F1E1D] text-white shadow-xs"
                : "bg-white text-[#4A4744] border border-[#EAE5DC] hover:text-[#1F1E1D]"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Product Catalog ({totalProducts})</span>
          </button>

          <button
            onClick={() => setActiveTab("inquiries")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-sm transition-all ${
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
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-sm transition-all ${
              activeTab === "settings"
                ? "bg-[#1F1E1D] text-white shadow-xs"
                : "bg-white text-[#4A4744] border border-[#EAE5DC] hover:text-[#1F1E1D]"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Store Settings</span>
          </button>
        </div>

        {/* ── TAB 1: PRODUCT CATALOG ────────────────────────────────────────── */}
        {activeTab === "products" && (
          <div className="space-y-6 text-left">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-sm border border-[#EAE5DC] shadow-2xs">
                <span className="text-[0.68rem] text-[#78746F] uppercase tracking-wider font-semibold block">
                  Total Catalog Pieces
                </span>
                <span className="text-2xl font-serif-luxury font-medium text-[#1F1E1D] mt-1 block">
                  {totalProducts}
                </span>
                <span className="text-[0.68rem] text-[#9E7D4B] mt-0.5 block">Original Clicks & Sets</span>
              </div>

              <div className="bg-white p-4 rounded-sm border border-[#EAE5DC] shadow-2xs">
                <span className="text-[0.68rem] text-[#78746F] uppercase tracking-wider font-semibold block">
                  Ready to Ship
                </span>
                <span className="text-2xl font-serif-luxury font-medium text-[#1FA855] mt-1 block">
                  {inStockCount}
                </span>
                <span className="text-[0.68rem] text-[#78746F] mt-0.5 block">Immediate dispatch</span>
              </div>

              <div className="bg-white p-4 rounded-sm border border-[#EAE5DC] shadow-2xs">
                <span className="text-[0.68rem] text-[#78746F] uppercase tracking-wider font-semibold block">
                  Sold Out / Paused
                </span>
                <span className="text-2xl font-serif-luxury font-medium text-[#D9534F] mt-1 block">
                  {soldOutCount}
                </span>
                <span className="text-[0.68rem] text-[#78746F] mt-0.5 block">Can toggle anytime</span>
              </div>

              <div className="bg-white p-4 rounded-sm border border-[#EAE5DC] shadow-2xs">
                <span className="text-[0.68rem] text-[#78746F] uppercase tracking-wider font-semibold block">
                  WhatsApp Inquiries
                </span>
                <span className="text-2xl font-serif-luxury font-medium text-[#9E7D4B] mt-1 block">
                  {inquiries.length}
                </span>
                <span className="text-[0.68rem] text-[#1FA855] mt-0.5 block">Active buyers</span>
              </div>
            </div>

            {/* Controls Bar: Search & Filter */}
            <div className="bg-white p-4 rounded-sm border border-[#EAE5DC] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#78746F] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search products by title, category, or stone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#EAE5DC] pl-9 pr-3 py-2 text-xs rounded-sm focus:outline-none focus:border-[#9E7D4B]"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-[#78746F]" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-[#FAF8F5] border border-[#EAE5DC] px-3 py-2 text-xs rounded-sm focus:outline-none focus:border-[#9E7D4B]"
                >
                  <option value="all">All Categories</option>
                  <option value="necklaces">Mangalsutra & Sets</option>
                  <option value="bangles">Bangles & Kadas</option>
                  <option value="festive">Festive Ready</option>
                  <option value="under-1000">Under ₹1,000</option>
                  <option value="earrings">Earrings</option>
                  <option value="rings">Rings</option>
                </select>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-sm border border-[#EAE5DC] overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAF8F5] border-b border-[#EAE5DC] text-[#78746F] uppercase tracking-wider text-[0.68rem] font-semibold">
                      <th className="py-3 px-4">Item</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Badge</th>
                      <th className="py-3 px-4">Stock Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0ECE6]">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                        {/* Thumbnail & Title */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={resolveAsset(product.image)}
                              alt={product.name}
                              className="w-12 h-12 rounded-[2px] object-cover border border-[#EAE5DC] shrink-0 bg-white"
                            />
                            <div>
                              <span className="font-medium text-[#1F1E1D] block line-clamp-1">
                                {product.name}
                              </span>
                              <span className="text-[0.68rem] text-[#78746F] block mt-0.5">
                                {product.stones}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[0.68rem] font-medium bg-[#FAF8F5] border border-[#EAE5DC] text-[#4A4744]">
                            {product.categoryLabel}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#1F1E1D]">
                            ₹{product.price.toLocaleString("en-IN")}
                          </div>
                          {product.originalPrice > product.price && (
                            <span className="text-[0.68rem] text-[#78746F] line-through block">
                              ₹{product.originalPrice.toLocaleString("en-IN")}
                            </span>
                          )}
                        </td>

                        {/* Badge */}
                        <td className="py-3 px-4">
                          {product.badge ? (
                            <span className="px-2 py-0.5 rounded-[2px] text-[0.68rem] font-medium bg-[#9E7D4B]/10 text-[#9E7D4B] border border-[#9E7D4B]/20">
                              {product.badge.text}
                            </span>
                          ) : (
                            <span className="text-[#78746F] text-[0.68rem]">—</span>
                          )}
                        </td>

                        {/* Stock Status toggle */}
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleStock(product.id)}
                            className={`px-2.5 py-1 rounded-full text-[0.68rem] font-semibold transition-all flex items-center gap-1.5 ${
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

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(product)}
                              className="p-1.5 text-[#4A4744] hover:text-[#9E7D4B] hover:bg-white rounded-[2px] border border-transparent hover:border-[#EAE5DC]"
                              title="Edit product"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id, product.name)}
                              className="p-1.5 text-[#78746F] hover:text-[#D9534F] hover:bg-white rounded-[2px] border border-transparent hover:border-[#EAE5DC]"
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

        {/* ── TAB 2: WHATSAPP INQUIRIES ─────────────────────────────────────── */}
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
                      href={`https://wa.me/919156131162?text=Hello%20${encodeURIComponent(inq.customer)}%2C%20regarding%20your%20inquiry%20for%20${encodeURIComponent(inq.product)}`}
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

        {/* ── TAB 3: STORE SETTINGS ─────────────────────────────────────────── */}
        {activeTab === "settings" && (
          <div className="bg-white rounded-sm border border-[#EAE5DC] p-6 text-left space-y-6 max-w-2xl shadow-2xs">
            <div>
              <h3 className="font-serif-luxury text-xl text-[#1F1E1D]">
                Store Identity & Banner Settings
              </h3>
              <p className="text-xs text-[#78746F] mt-1">
                Manage your business contact details and announcement bar text.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#1F1E1D] block mb-1">
                  Announcement Bar Notice
                </label>
                <input
                  type="text"
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#EAE5DC] px-3 py-2 text-xs rounded-sm focus:outline-none focus:border-[#9E7D4B]"
                />
                <span className="text-[0.68rem] text-[#78746F] mt-1 block">
                  Displayed at the very top of the customer storefront.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#1F1E1D] block mb-1">
                    Store City & Region
                  </label>
                  <input
                    type="text"
                    disabled
                    value="Chh. Sambhajinagar (CSN)"
                    className="w-full bg-[#FAF8F5] border border-[#EAE5DC] px-3 py-2 text-xs rounded-sm text-[#78746F]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1F1E1D] block mb-1">
                    WhatsApp Order Number
                  </label>
                  <input
                    type="text"
                    disabled
                    value="+91 91561 31162 (Pallavi)"
                    className="w-full bg-[#FAF8F5] border border-[#EAE5DC] px-3 py-2 text-xs rounded-sm text-[#78746F]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1F1E1D] block mb-1">
                  Official Instagram Profile
                </label>
                <input
                  type="text"
                  disabled
                  value="https://www.instagram.com/shambhavii_creations/"
                  className="w-full bg-[#FAF8F5] border border-[#EAE5DC] px-3 py-2 text-xs rounded-sm text-[#78746F]"
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── MODAL: ADD / EDIT PRODUCT ───────────────────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-sm border border-[#EAE5DC] max-w-xl w-full p-6 text-left max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EAE5DC] pb-3 mb-4">
              <h4 className="font-serif-luxury text-lg text-[#1F1E1D]">
                {editingProduct ? "Edit Product Details" : "Add New Jewellery Piece"}
              </h4>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-[#78746F] hover:text-[#1F1E1D]"
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#1F1E1D] block mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as any,
                        categoryLabel:
                          e.target.value === "bangles"
                            ? "Bangles & Kadas"
                            : e.target.value === "festive"
                            ? "Festive Ready"
                            : e.target.value === "under-1000"
                            ? "Under ₹1,000"
                            : e.target.value === "earrings"
                            ? "Earrings"
                            : e.target.value === "rings"
                            ? "Rings"
                            : "Mangalsutra",
                      })
                    }
                    className="w-full bg-[#FAF8F5] border border-[#EAE5DC] px-3 py-2 text-xs rounded-sm focus:outline-none focus:border-[#9E7D4B]"
                  >
                    <option value="necklaces">Mangalsutra & Sets</option>
                    <option value="bangles">Bangles & Kadas</option>
                    <option value="festive">Festive Ready</option>
                    <option value="under-1000">Under ₹1,000</option>
                    <option value="earrings">Earrings</option>
                    <option value="rings">Rings</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1F1E1D] block mb-1">
                    Stock Availability
                  </label>
                  <select
                    value={formData.shippingStatus}
                    onChange={(e) =>
                      setFormData({ ...formData, shippingStatus: e.target.value })
                    }
                    className="w-full bg-[#FAF8F5] border border-[#EAE5DC] px-3 py-2 text-xs rounded-sm focus:outline-none focus:border-[#9E7D4B]"
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
                    onChange={(e) =>
                      setFormData({ ...formData, price: Number(e.target.value) })
                    }
                    className="w-full bg-[#FAF8F5] border border-[#EAE5DC] px-3 py-2 text-xs rounded-sm focus:outline-none focus:border-[#9E7D4B]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1F1E1D] block mb-1">
                    Original Price / MRP (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.originalPrice || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, originalPrice: Number(e.target.value) })
                    }
                    className="w-full bg-[#FAF8F5] border border-[#EAE5DC] px-3 py-2 text-xs rounded-sm focus:outline-none focus:border-[#9E7D4B]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1F1E1D] block mb-1">
                  Product Photo Choice
                </label>
                <select
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#EAE5DC] px-3 py-2 text-xs rounded-sm focus:outline-none focus:border-[#9E7D4B] mb-2"
                >
                  {AVAILABLE_PHOTOS.map((ph) => (
                    <option key={ph.path} value={ph.path}>
                      {ph.label} ({ph.path})
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-3 p-2 bg-[#FAF8F5] border border-[#EAE5DC] rounded-sm">
                  <img
                    src={resolveAsset(formData.image)}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded-[2px] border border-[#EAE5DC]"
                  />
                  <div className="text-[0.68rem] text-[#78746F]">
                    Selected Image: <span className="font-mono text-[#1F1E1D]">{formData.image}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1F1E1D] block mb-1">
                  Stones & Crafting Details
                </label>
                <input
                  type="text"
                  placeholder="e.g. Traditional Black Beads with Ruby Accents"
                  value={formData.stones || ""}
                  onChange={(e) => setFormData({ ...formData, stones: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#EAE5DC] px-3 py-2 text-xs rounded-sm focus:outline-none focus:border-[#9E7D4B]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1F1E1D] block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full bg-[#FAF8F5] border border-[#EAE5DC] px-3 py-2 text-xs rounded-sm focus:outline-none focus:border-[#9E7D4B]"
                />
              </div>

              <div className="pt-3 border-t border-[#EAE5DC] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-[#EAE5DC] text-xs font-medium rounded-sm text-[#4A4744] hover:bg-[#FAF8F5]"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-bronze text-xs py-2 px-5">
                  {editingProduct ? "Save Changes" : "Publish to Store"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
