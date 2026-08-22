"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, Star, Pencil, Trash2 } from "lucide-react";

type Comment = {
  id: string;
  productId: string;
  customerId: string;
  customerName: string;
  customerAvatar: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
};

const PAGE_SIZE = 3;

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-NP", { dateStyle: "medium" });
  } catch {
    return iso;
  }
}

function Stars({
  value,
  size = 14,
  onChange
}: {
  value: number;
  size?: number;
  onChange?: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
          aria-label={`${n} star`}
        >
          <Star
            size={size}
            className={n <= value ? "text-amber fill-amber" : "text-cream-soft fill-cream-soft"}
          />
        </button>
      ))}
    </div>
  );
}

export default function ProductComments({ productId }: { productId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [myComment, setMyComment] = useState<Comment | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);

  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formMessage, setFormMessage] = useState("");

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/comments?productId=${encodeURIComponent(productId)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load comments");
      setComments(data.comments || []);
      setMyComment(data.myComment || null);
      setLoggedIn(!!data.loggedIn);
      if (data.myComment) {
        setRating(data.myComment.rating);
        setText(data.myComment.comment);
      }
    } catch (err: any) {
      setError(err.message || "Could not load comments.");
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setFormMessage("");
    if (!text.trim()) {
      setFormError("Please write a comment.");
      return;
    }
    setSubmitting(true);
    try {
      const isEdit = !!myComment;
      const url = isEdit ? `/api/comments/${myComment!.id}` : "/api/comments";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { rating, comment: text } : { productId, rating, comment: text })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not save your comment.");
      setFormMessage(isEdit ? "Your review was updated." : "Thanks for your review!");
      setEditing(false);
      await load();
    } catch (err: any) {
      setFormError(err.message || "Something went wrong.");
    }
    setSubmitting(false);
  }

  async function handleDelete() {
    if (!myComment) return;
    if (!confirm("Delete your review?")) return;
    setSubmitting(true);
    try {
      await fetch(`/api/comments/${myComment.id}`, { method: "DELETE" });
      setMyComment(null);
      setRating(5);
      setText("");
      setEditing(false);
      await load();
    } catch {
      // ignore
    }
    setSubmitting(false);
  }

  const avgRating =
    comments.length > 0 ? comments.reduce((sum, c) => sum + c.rating, 0) / comments.length : 0;

  const visibleComments = showAll ? comments : comments.slice(0, PAGE_SIZE);

  return (
    <div className="mt-14 max-w-3xl">
      <div className="flex items-center gap-2 mb-1">
        <MessageSquare size={18} className="text-plum" />
        <h2 className="text-lg font-medium text-plum">Customer Comments</h2>
      </div>

      {!loading && comments.length > 0 && (
        <div className="flex items-center gap-2 mb-5 text-sm text-ink-muted">
          <Stars value={Math.round(avgRating)} />
          <span>
            {avgRating.toFixed(1)} out of 5 · {comments.length} comment
            {comments.length === 1 ? "" : "s"}
          </span>
        </div>
      )}

      {loading && <p className="text-sm text-ink-muted mb-6">Loading comments...</p>}
      {error && <p className="text-sm text-[#A32D2D] mb-6">{error}</p>}

      {!loading && !error && (
        <>
          {/* Comment form / login prompt */}
          <div className="bg-white border border-cream-soft rounded-xl p-4 mb-6">
            {!loggedIn ? (
              <p className="text-sm text-ink-muted">
                <Link href="/account" className="text-berry-dark font-medium">
                  Log in
                </Link>{" "}
                to leave a comment on this product.
              </p>
            ) : myComment && !editing ? (
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="text-xs font-medium text-plum">Your review</div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-1 text-xs text-ink-muted hover:text-plum"
                    >
                      <Pencil size={12} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={submitting}
                      className="flex items-center gap-1 text-xs text-[#A32D2D] hover:opacity-80"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
                <Stars value={myComment.rating} />
                <p className="text-sm text-ink mt-2">{myComment.comment}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="text-xs font-medium text-plum">
                  {myComment ? "Edit your review" : "Write a comment"}
                </div>
                <Stars value={rating} size={20} onChange={setRating} />
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  maxLength={1000}
                  rows={3}
                  placeholder="Share your experience with this fish..."
                  className="w-full text-sm rounded-xl border border-cream-soft px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-berry/30"
                />
                {formError && <p className="text-sm text-[#A32D2D]">{formError}</p>}
                {formMessage && <p className="text-sm text-[#1E7A6E]">{formMessage}</p>}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-plum text-cream text-sm font-medium px-5 py-2.5 rounded-xl disabled:opacity-60"
                  >
                    {submitting ? "Saving..." : myComment ? "Update comment" : "Post comment"}
                  </button>
                  {myComment && editing && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        setRating(myComment.rating);
                        setText(myComment.comment);
                        setFormError("");
                      }}
                      className="text-sm text-ink-muted px-3 py-2.5"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* Comment list */}
          {comments.length === 0 ? (
            <p className="text-sm text-ink-muted">No comments yet. Be the first to share your experience!</p>
          ) : (
            <div className="space-y-4">
              {visibleComments.map((c) => (
                <div key={c.id} className="border-b border-cream-soft pb-4 last:border-b-0">
                  <div className="flex items-center gap-2.5 mb-1.5">
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
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-plum">{c.customerName}</div>
                      <div className="flex items-center gap-2">
                        <Stars value={c.rating} size={12} />
                        <span className="text-[11px] text-ink-muted">{formatDate(c.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-ink-muted leading-relaxed ml-[42px]">{c.comment}</p>
                </div>
              ))}
            </div>
          )}

          {comments.length > PAGE_SIZE && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="mt-4 text-sm font-medium text-berry-dark hover:underline"
            >
              {showAll ? "Show less" : `View all ${comments.length} comments`}
            </button>
          )}
        </>
      )}
    </div>
  );
}
