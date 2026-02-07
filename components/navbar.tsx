"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, TrendingUp, Lightbulb } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  // Don't show navbar on auth pages or home page
  if (pathname?.startsWith("/auth") || pathname === "/") {
    return null;
  }

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/insights", label: "Insights", icon: TrendingUp },
    { href: "/ideas", label: "Ideas", icon: Lightbulb },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard">
            <span className="font-bold text-lg text-gray-900">CreatorMind</span>
          </Link>

          {/* Navigation Links - Centered */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-purple-50 text-purple-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
