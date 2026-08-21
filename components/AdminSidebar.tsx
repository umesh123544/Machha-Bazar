"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Fish, LogOut, Settings, Users } from "lucide-react";
import type { AdminPermissions } from "@/lib/types";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [permissions, setPermissions] = useState<AdminPermissions | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setPermissions(data.permissions);
          setIsOwner(data.isOwner);
        }
      });
  }, []);

  const items = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard, show: true },
    { href: "/admin/products", label: "Products", icon: Fish, show: isOwner || permissions?.products },
    { href: "/admin/settings", label: "Settings & Banner", icon: Settings, show: isOwner || permissions?.content },
    { href: "/admin/users", label: "Users", icon: Users, show: isOwner || permissions?.users }
  ];

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="w-full sm:w-56 sm:min-h-[calc(100vh-64px)] bg-plum sm:flex-shrink-0">
      <div className="p-4 flex sm:flex-col gap-2">
        {items
          .filter((item) => item.show)
          .map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors ${
                pathname === item.href ? "bg-cream/10 text-cream" : "text-cream/60 hover:text-cream"
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg text-cream/60 hover:text-cream mt-auto"
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>
    </aside>
  );
}
