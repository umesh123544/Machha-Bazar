"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, Pencil, X } from "lucide-react";
import type { Product, StockStatus, Category } from "@/lib/types";
import { hasDiscount, discountPercent } from "@/lib/pricing";
import ImageUploader from "@/components/ImageUploader";

type FormState = {
  name: string;
  category: string;
  categorySlug: string;
  shortDescription: string;
  description: string;
  size: string;
  stockStatus: StockStatus;
  isActive: boolean;
  isFeatured: boolean;
  isComingSoon: boolean;
  price: number;
  compareAtPrice: number;
  image: string;
};

const emptyForm: FormState = {
  name: "",
  category: "",
  categorySlug: "",
  shortDescription: "",
  description: "",
  size: "",
  stockStatus: "in_stock",
  isActive: true,
  isFeatured: false,
  isComingSoon: false,
  price: 0,
  compareAtPrice: 0,
  image: ""
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  // Whenever the form opens (add or edit — including editing the last product
  // in a long list), scroll it into view instead of leaving the user stuck
  // looking at a form that opened off-screen above the fold.
  useEffect(() => {
    if (showForm) {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showForm, editingId]);

  async function load() {
    setLoading(true);
    const [productsRes, categoriesRes] = await Promise.all([
      fetch("/api/products"),
      fetch("/api/admin/categories")
    ]);
    const data = await productsRes.json();
    const cats: Category[] = await categoriesRes.json();
    setProducts(data);
    setCategories(cats);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openAddForm() {
    setEditingId(null);
    const firstCat = categories[0];
    setForm({
      ...emptyForm,
      category: firstCat?.name || "",
      categorySlug: firstCat?.slug || ""
    });
    setShowForm(true);
  }

  function handleCategoryChange(slug: string) {
    const cat = categories.find((c) => c.slug === slug);
    setForm((prev) => ({
      ...prev,
      categorySlug: slug,
      category: cat?.name || prev.category
    }));
  }

  function openEditForm(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      category: product.category,
      categorySlug: product.categorySlug,
      shortDescription: product.shortDescription,
      description: product.description,
      size: product.size,
      stockStatus: product.stockStatus,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      isComingSoon: product.isComingSoon,
      price: product.variants[0]?.price || 0,
      compareAtPrice: product.variants[0]?.compareAtPrice || 0,
      image: product.image && !product.image.includes("fish-placeholder") ? product.image : ""
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("Enter a product name.");
      return;
    }
    if (!form.price || form.price <= 0) {
      setError("Enter a valid price.");
      return;
    }
    if (form.compareAtPrice && form.compareAtPrice <= form.price) {
      setError("Original (before discount) price must be higher than the selling price.");
      return;
    }
    if (!form.categorySlug) {
      setError("Select a category.");
      return;
    }

    const payload = {
      name: form.name,
      category: form.category,
      categorySlug: form.categorySlug,
      shortDescription: form.shortDescription,
      description: form.description,
      size: form.size,
      stockStatus: form.stockStatus,
      isActive: form.isActive,
      isFeatured: form.isFeatured,
      isComingSoon: form.isComingSoon,
      image: form.image || undefined,
      galleryImages: form.image ? [form.image] : undefined,
      variants: [
        {
          id: "v1",
          name: "Pair",
          price: form.price,
          compareAtPrice: form.compareAtPrice > form.price ? form.compareAtPrice : undefined,
          stock: 5
        }
      ]
    };

    const res = editingId
      ? await fetch(`/api/products/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
      : await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

    if (res.ok) {
      closeForm();
      load();
    } else {
      setError("Could not save product. Make sure you are logged in and have product access.");
    }
  }

  async function toggleActive(product: Product) {
    await fetch(`/api/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !product.isActive })
    });
    load();
  }

  async function toggleStock(product: Product) {
    const next: StockStatus = product.stockStatus === "sold_out" ? "in_stock" : "sold_out";
    await fetch(`/api/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stockStatus: next })
    });
    load();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-medium text-plum">Products</h1>
          <p className="text-sm text-ink-muted">Manage fish listed on the shop.</p>
        </div>
        <button
          onClick={() => (showForm ? closeForm() : openAddForm())}
          className="flex items-center gap-2 bg-berry hover:bg-berry-dark text-berry-text text-sm font-medium px-4 py-2 rounded-lg"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? "Close" : "Add product"}
        </button>
      </div>

      {showForm && (
        <form ref={formRef} onSubmit={handleSubmit} className="bg-white border border-cream-soft rounded-xl p-5 mb-6 space-y-3">
          <p className="text-sm font-medium text-plum">{editingId ? "Edit product" : "New product"}</p>
          <div>
            <label className="text-xs text-ink-muted mb-1 block">Photo</label>
            <ImageUploader value={form.image} onChange={(url) => setForm({ ...form, image: url })} scope="product" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              placeholder="Product name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="text-sm rounded-lg border border-cream-soft px-3 py-2.5"
            />
            <input
              type="number"
              placeholder="Price (Rs.)"
              value={form.price || ""}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              className="text-sm rounded-lg border border-cream-soft px-3 py-2.5"
            />
            <input
              type="number"
              placeholder="Original price before discount (optional)"
              value={form.compareAtPrice || ""}
              onChange={(e) => setForm({ ...form, compareAtPrice: Number(e.target.value) })}
              className="text-sm rounded-lg border border-cream-soft px-3 py-2.5"
              title="Leave blank for no discount. If filled, must be higher than Price — shows as a strikethrough price and % off badge on the shop."
            />
            <input
              placeholder="Size (e.g. Medium 3-4cm)"
              value={form.size}
              onChange={(e) => setForm({ ...form, size: e.target.value })}
              className="text-sm rounded-lg border border-cream-soft px-3 py-2.5"
            />
            <select
              value={form.stockStatus}
              onChange={(e) => setForm({ ...form, stockStatus: e.target.value as StockStatus })}
              className="text-sm rounded-lg border border-cream-soft px-3 py-2.5"
            >
              <option value="in_stock">In stock</option>
              <option value="limited">Limited stock</option>
              <option value="sold_out">Sold out</option>
            </select>
            <select
              value={form.categorySlug}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="text-sm rounded-lg border border-cream-soft px-3 py-2.5"
            >
              <option value="" disabled>Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <input
            placeholder="Short description"
            value={form.shortDescription}
            onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
            className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5"
          />
          <textarea
            placeholder="Full description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5"
          />
          <label className="flex items-center gap-2 text-sm text-ink-muted">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Active (visible on the shop)
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-muted">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
            />
            Featured (show on homepage &quot;Available now&quot; section)
          </label>
          {error && <p className="text-xs text-[#A32D2D]">{error}</p>}
          <button type="submit" className="bg-plum text-cream text-sm font-medium px-4 py-2 rounded-lg">
            {editingId ? "Save changes" : "Save product"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-ink-muted">Loading products...</p>
      ) : (
        <>
          {/* Mobile: stacked cards */}
          <div className="sm:hidden space-y-3">
            {products.map((p) => (
              <div key={p.id} className="bg-white border border-cream-soft rounded-xl p-3">
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-lg bg-cream-soft flex-shrink-0 overflow-hidden">
                    {p.image && !p.image.includes("fish-placeholder") && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-plum truncate">{p.name}</p>
                    <a
                      href={`/shop?category=${p.categorySlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-ink-muted hover:text-plum hover:underline"
                    >
                      {p.category}
                    </a>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-xs font-medium text-plum">Rs. {p.variants[0]?.price ?? "-"}</span>
                      {hasDiscount(p.variants[0]) && (
                        <>
                          <span className="text-[11px] text-[#B3261E] line-through font-medium">
                            Rs. {p.variants[0]?.compareAtPrice}
                          </span>
                          <span className="text-[10px] font-bold text-white bg-[#E11D3C] px-1.5 py-0.5 rounded">
                            {discountPercent(p.variants[0])}% OFF
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => openEditForm(p)}
                      className="text-ink-muted hover:text-plum p-1"
                      aria-label={`Edit ${p.name}`}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-ink-muted hover:text-[#A32D2D] p-1"
                      aria-label={`Delete ${p.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => toggleStock(p)}
                    className="text-xs px-2.5 py-1 rounded-full bg-cream-soft text-ink"
                  >
                    {p.stockStatus.replace("_", " ")}
                  </button>
                  <button
                    onClick={() => toggleActive(p)}
                    className={`text-xs px-2.5 py-1 rounded-full ${
                      p.isActive ? "bg-[#E3F3EF] text-[#1E7A6E]" : "bg-cream-soft text-ink-muted"
                    }`}
                  >
                    {p.isActive ? "Active" : "Inactive"}
                  </button>
                </div>
              </div>
            ))}
            {products.length === 0 && <p className="text-sm text-ink-muted">No products yet.</p>}
          </div>

          {/* Desktop / tablet: table */}
          <div className="hidden sm:block bg-white border border-cream-soft rounded-xl overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="text-left text-xs text-ink-muted border-b border-cream-soft">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium">Active</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-cream-soft last:border-0">
                    <td className="px-4 py-3 text-plum">{p.name}</td>
                    <td className="px-4 py-3 text-ink-muted">
                      <a
                        href={`/shop?category=${p.categorySlug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-plum hover:underline"
                      >
                        {p.category}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-plum font-medium">Rs. {p.variants[0]?.price ?? "-"}</span>
                        {hasDiscount(p.variants[0]) && (
                          <>
                            <span className="text-xs text-[#B3261E] line-through font-medium">
                              Rs. {p.variants[0]?.compareAtPrice}
                            </span>
                            <span className="text-[10px] font-bold text-white bg-[#E11D3C] px-1.5 py-0.5 rounded">
                              {discountPercent(p.variants[0])}% OFF
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleStock(p)}
                        className="text-xs px-2.5 py-1 rounded-full bg-cream-soft text-ink"
                      >
                        {p.stockStatus.replace("_", " ")}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(p)}
                        className={`text-xs px-2.5 py-1 rounded-full ${
                          p.isActive ? "bg-[#E3F3EF] text-[#1E7A6E]" : "bg-cream-soft text-ink-muted"
                        }`}
                      >
                        {p.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => openEditForm(p)}
                          className="text-ink-muted hover:text-plum"
                          aria-label={`Edit ${p.name}`}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-ink-muted hover:text-[#A32D2D]"
                          aria-label={`Delete ${p.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
