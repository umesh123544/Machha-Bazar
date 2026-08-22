<<<<<<< HEAD
"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, X } from "lucide-react";
import type { Product, StockStatus, Category } from "@/lib/types";
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
      variants: [{ id: "v1", name: "Pair", price: form.price, stock: 5 }]
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
      <div className="flex items-center justify-between mb-6">
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
        <form onSubmit={handleSubmit} className="bg-white border border-cream-soft rounded-xl p-5 mb-6 space-y-3">
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
        <div className="bg-white border border-cream-soft rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-ink-muted border-b border-cream-soft">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Category</th>
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
      )}
=======
import { notFound } from "next/navigation";
import Link from "next/link";
import { Fish, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { getProductBySlug, getSiteSettings } from "@/lib/data";
import ProductOrderPanel from "@/components/ProductOrderPanel";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "Fish Not Found" };
  const settings = await getSiteSettings();
  const name = settings.businessName || "Maccha Bazar";
  return {
    title: `${product.name} | ${name}`,
    description: `${product.shortDescription} Home-bred and available with Kathmandu Valley delivery from ${name}.`
  };
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  const settings = await getSiteSettings();

  if (!product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-medium text-plum mb-2">Fish Not Found</h1>
        <p className="text-sm text-ink-muted mb-6">We couldn&apos;t find the fish you&apos;re looking for.</p>
        <Link href="/shop" className="text-sm font-medium text-berry-dark">Back to Shop</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-plum mb-6">
        <ArrowLeft size={14} />
        Back to shop
      </Link>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="h-72 sm:h-96 bg-plum rounded-2xl flex items-center justify-center relative overflow-hidden">
          {product.image && !product.image.includes("fish-placeholder") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <Fish size={90} className="text-amber" />
          )}
        </div>
        <ProductOrderPanel product={product} whatsappNumber={settings.whatsappNumber} businessName={settings.businessName} />
      </div>

      <div className="mt-14 max-w-3xl">
        <h2 className="text-lg font-medium text-plum mb-3">About this fish</h2>
        <p className="text-sm text-ink-muted leading-relaxed">{product.description}</p>
      </div>
>>>>>>> 86f9f50 (category select in admin + category-wise shop page)
    </div>
  );
}
