"use client";

import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import InstallPWA from "@/components/InstallPWA";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    return <div className="bg-cream min-h-screen">{children}</div>;
  }

  return (
    <div className="bg-cream min-h-screen flex flex-col sm:flex-row">
      <AdminSidebar />
      <div className="flex-1 p-4 sm:p-8 min-w-0">{children}</div>
      <InstallPWA
        title="Install Admin App"
        description="Add the admin dashboard to your home screen for quick access on your phone."
      />
    </div>
  );
}
