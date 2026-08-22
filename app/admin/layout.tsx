import type { Metadata } from "next";
import AdminShell from "@/components/AdminShell";

export const metadata: Metadata = {
  title: "Admin",
  manifest: "/admin-manifest.json",
  icons: {
    icon: "/icons/favicon.svg",
    apple: "/icons/apple-touch-icon.png"
  }
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
