"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Fish,
  LogOut,
  Settings,
  Users,
  Layers,
  FileText,
  Contact,
  Tag,
  MessageSquare,
  Menu,
  X,
  Clock
} from "lucide-react";
import type { AdminPermissions } from "@/lib/types";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [permissions, setPermissions] = useState<AdminPermissions | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setPermissions(data.permissions);
          setIsOwner(data.isOwner);
          setLoggedIn(true);
        }
      });
  }, []);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const items = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard, show: true },
    { href: "/admin/products", label: "Products", icon: Fish, show: isOwner || permissions?.products },
    { href: "/admin/categories", label: "Categories", icon: Layers, show: isOwner || permissions?.products },
    { href: "/admin/coming-soon", label: "Coming Soon", icon: Clock, show: isOwner || permissions?.products },
    { href: "/admin/comments", label: "Comments", icon: MessageSquare, show: isOwner || permissions?.products },
    { href: "/admin/pages", label: "Page Content", icon: FileText, show: isOwner || permissions?.content },
    { href: "/admin/settings", label: "Settings & Banner", icon: Settings, show: isOwner || permissions?.content },
    { href: "/admin/offers", label: "Offers", icon: Tag, show: isOwner || permissions?.content },
    {
      href: "/admin/customers",
      label: "Customers",
      icon: Contact,
      show: loggedIn
    },
    { href: "/admin/users", label: "Users", icon: Users, show: isOwner || permissions?.users }
  ];

  const visibleItems = items.filter((item) => item.show);
  const currentLabel = visibleItems.find((item) => item.href === pathname)?.label || "Menu";

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <>
      {/* Mobile top bar: current section + hamburger toggle */}
      <div className="sm:hidden flex items-center justify-between bg-plum px-4 py-3 sticky top-0 z-40">
        <span className="text-cream text-sm font-medium truncate">{currentLabel}</span>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="text-cream p-1.5 -mr-1.5"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="sm:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-72 max-w-[85%] bg-plum h-full flex flex-col overflow-y-auto animate-in slide-in-from-left">
            <div className="flex items-center justify-between px-4 py-3 border-b border-cream/10">
              <span className="text-cream text-sm font-medium">Admin menu</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="text-cream/70 p-1"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-3 flex flex-col gap-1 flex-1">
              {visibleItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 text-sm px-3 py-2.5 rounded-lg transition-colors ${
                    pathname === item.href ? "bg-cream/10 text-cream" : "text-cream/70"
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              ))}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 text-sm px-3 py-2.5 m-3 rounded-lg text-cream/70"
            >
              <LogOut size={18} />
              Log out
            </button>
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden sm:block w-56 sm:min-h-[calc(100vh-64px)] bg-plum flex-shrink-0">
        <div className="p-4 flex flex-col gap-2">
          {visibleItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors ${
                pathname === item.href ? "bg-cream/10 text-cream" : "text-cream/60 hover:text-cream"
              }`}
            >
              <item.icon size={16} />
              <span>{item.label}</span>
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg text-cream/60 hover:text-cream mt-auto"
          >
            <LogOut size={16} />
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
