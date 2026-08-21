import type { StockStatus } from "@/lib/types";

const labels: Record<StockStatus, string> = {
  in_stock: "Available",
  limited: "Limited stock",
  sold_out: "Sold out"
};

const styles: Record<StockStatus, string> = {
  in_stock: "bg-[#E3F3EF] text-[#1E7A6E]",
  limited: "bg-[#FBEBD9] text-[#B5651D]",
  sold_out: "bg-[#F0E9DC] text-ink-muted"
};

export default function StockBadge({ status }: { status: StockStatus }) {
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
