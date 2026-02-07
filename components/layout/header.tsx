"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Brain } from "lucide-react";
import { ProfileDropdown } from "./profile-dropdown";
import { usePathname } from "next/navigation";

export function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Don't show header on auth pages
  if (pathname?.startsWith("/auth")) {
    return null;
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-purple-600" />
            <span className="text-xl font-bold text-gray-900">CreatorMind</span>
          </Link>

          {/* Navigation (only show if authenticated) */}
          {session?.user && (
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors ${
                  pathname === "/dashboard"
                    ? "text-purple-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/ideas"
                className={`text-sm font-medium transition-colors ${
                  pathname === "/ideas"
                    ? "text-purple-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Ideas
              </Link>
              <Link
                href="/insights"
                className={`text-sm font-medium transition-colors ${
                  pathname === "/insights"
                    ? "text-purple-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Insights
              </Link>
            </nav>
          )}

          {/* Profile Dropdown */}
          {session?.user && <ProfileDropdown />}
        </div>
      </div>
    </header>
  );
}