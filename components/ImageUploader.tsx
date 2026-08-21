"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";

export default function ImageUploader({
  value,
  onChange,
  scope
}: {
  value: string;
  onChange: (url: string) => void;
  scope: "product" | "banner";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    setError("");
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("scope", scope);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        onChange(data.url);
      } else {
        setError(data.message || "Upload failed.");
      }
    } catch {
      setError("Upload failed. Check your connection.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {value ? (
        <div className="relative w-full h-40 rounded-lg overflow-hidden border border-cream-soft bg-plum">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Uploaded" className="absolute inset-0 w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80"
            aria-label="Remove image"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full h-40 rounded-lg border-2 border-dashed border-cream-soft flex flex-col items-center justify-center gap-2 text-ink-muted hover:border-berry hover:text-berry-dark transition-colors disabled:opacity-60"
        >
          {uploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
          <span className="text-xs">{uploading ? "Uploading..." : "Click to upload a photo"}</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      {error && <p className="text-xs text-[#A32D2D] mt-1">{error}</p>}
    </div>
  );
}
