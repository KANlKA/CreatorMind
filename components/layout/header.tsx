"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Brain, Settings, LogOut } from "lucide-react";

export function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  // Detect scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled 
          ? "bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50" 
          : "bg-white/95 backdrop-blur-sm border-b border-gray-200"
      }`}
    >
      {/* Narrower container with rounded effect */}
      <div className="max-w-2xl mx-auto px-5 py-3">
        <div 
          className={`flex items-center justify-between transition-all duration-300 ${
            scrolled ? "py-2" : "py-4"
          }`}
        >
          {/* Logo */}
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 hover:opacity-80 transition-opacity group"
          >
            <div className={`transition-transform duration-300 ${scrolled ? "scale-90" : "scale-100"}`}>
              <Brain className="h-8 w-8 text-purple-600 group-hover:text-purple-700" />
            </div>
            <span className={`font-bold text-gray-900 transition-all duration-300 ${
              scrolled ? "text-xl" : "text-2xl"
            }`}>
              CreatorMind
            </span>
          </Link>

          {/* Navigation with active state */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink href="/dashboard" active={pathname === "/dashboard"}>
              Dashboard
            </NavLink>
            <NavLink href="/insights" active={pathname === "/insights"}>
              Insights
            </NavLink>
            <NavLink href="/ideas" active={pathname?.startsWith("/ideas")}>
              Ideas
            </NavLink>
          </nav>

          {/* User Menu */}
          {session?.user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-purple-200 transition-all"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                    <AvatarFallback className="bg-purple-100 text-purple-700 font-semibold">
                      {session.user.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-4xl shadow-xl border-gray-200">
                <div className="flex items-center justify-start gap-3 p-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={session.user.image || ""} />
                    <AvatarFallback className="bg-purple-100 text-purple-700">
                      {session.user.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1 leading-none">
                    {session.user.name && (
                      <p className="font-semibold text-gray-900">{session.user.name}</p>
                    )}
                    {session.user.email && (
                      <p className="text-xs text-gray-500">
                        {session.user.email}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer py-2">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 py-2"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}

// Navigation Link Component with active state
function NavLink({ 
  href, 
  active, 
  children 
}: { 
  href: string; 
  active?: boolean; 
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
        active 
          ? "bg-purple-100 text-purple-700" 
          : "text-gray-700 hover:bg-purple-50 hover:text-purple-600"
      }`}
    >
      {children}
    </Link>
  );
}