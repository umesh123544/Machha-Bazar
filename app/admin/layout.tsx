"use client";

import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    return <div className="bg-cream min-h-screen">{children}</div>;
  }

  return (
    <div className="bg-cream min-h-screen flex flex-col sm:flex-row">
      <AdminSidebar />
      <div className="flex-1 p-4 sm:p-8">{children}</div>
    </div>
  );
}
