"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MessageSquare, Star, Trash2, Search } from "lucide-react";

type Comment = {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  customerId: string;
  customerName: string;
  customerAvatar: string;
  rating: number;
  comment: string;
  createdAt: string;
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-NP", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={13}
          className={n <= value ? "text-amber fill-amber" : "text-cream-soft fill-cream-soft"}
        />
      ))}
    </div>
  );
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    fetch("/api/admin/comments")
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "Failed to load");
        }
        return res.json();
      })
      .then((data) => {
        setComments(data.comments || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Could not load comments.");
        setLoading(false);
      });
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this comment? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/comments/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert("Could not delete comment.");
    }
    setDeletingId(null);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return comments;
    return comments.filter(
      (c) =>
        c.productName.toLowerCase().includes(q) ||
        c.customerName.toLowerCase().includes(q) ||
        c.comment.toLowerCase().includes(q)
    );
  }, [comments, search]);

  const avgRating =
    comments.length > 0 ? comments.reduce((sum, c) => sum + c.rating, 0) / comments.length : 0;

  if (loading) {
    return <p className="text-sm text-ink-muted">Loading comments...</p>;
  }

  if (error) {
    return (
      <div className="max-w-xl">
        <h1 className="text-xl font-medium text-plum mb-2">Comments</h1>
        <p className="text-sm text-[#A32D2D] mb-2">{error}</p>
        <p className="text-xs text-ink-muted">
          Make sure you ran <code className="bg-cream-soft px-1 rounded">migration_11.sql</code> in
          Supabase SQL Editor.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-medium text-plum flex items-center gap-2">
            <MessageSquare size={20} />
            Comments
          </h1>
          <p className="text-sm text-ink-muted">
            {comments.length} comment{comments.length === 1 ? "" : "s"} across all products
            {comments.length > 0 && <> · average {avgRating.toFixed(1)} / 5</>}
          </p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product, customer, text..."
            className="text-sm rounded-xl border border-cream-soft pl-8 pr-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-berry/30"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-ink-muted bg-white border border-cream-soft rounded-xl p-6 text-center">
          {comments.length === 0 ? "No comments yet." : "No comments match your search."}
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <div key={c.id} className="bg-white border border-cream-soft rounded-xl p-4">
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  {c.customerAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.customerAvatar}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover bg-cream-soft flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-plum/10 text-plum flex items-center justify-center text-xs font-medium flex-shrink-0">
                      {c.customerName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium text-plum">{c.customerName}</div>
                    <Stars value={c.rating} />
                  </div>
                </div>
                <div className="text-right">
                  {c.productSlug ? (
                    <Link
                      href={`/product/${c.productSlug}`}
                      target="_blank"
                      className="text-xs font-medium text-berry-dark hover:underline"
                    >
                      {c.productName}
                    </Link>
                  ) : (
                    <span className="text-xs text-ink-muted">{c.productName}</span>
                  )}
                  <div className="text-[11px] text-ink-muted">{formatDate(c.createdAt)}</div>
                </div>
              </div>
              <p className="text-sm text-ink-muted leading-relaxed mb-3">{c.comment}</p>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleDelete(c.id)}
                  disabled={deletingId === c.id}
                  className="flex items-center gap-1.5 text-xs font-medium text-[#A32D2D] hover:opacity-80 disabled:opacity-50"
                >
                  <Trash2 size={13} />
                  {deletingId === c.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
