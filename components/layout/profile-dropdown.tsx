"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, LogOut, HelpCircle, Mail, MessageSquare } from "lucide-react";

export function ProfileDropdown() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  if (!session?.user) {
    return null;
  }

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/auth/signin");
  };

  const handleSettings = () => {
    router.push("/settings");
    setIsOpen(false);
  };

  const handleContact = () => {
    router.push("/contact");
    setIsOpen(false);
  };

  const userInitials = session.user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || session.user.email?.[0]?.toUpperCase() || "U";

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-10 w-10 rounded-full p-0 hover:bg-zinc-800 transition-colors"
        >
          <Avatar className="h-10 w-10 cursor-pointer border-2 border-zinc-700">
            <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
            <AvatarFallback className="bg-zinc-700 text-white font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        sideOffset={8}
        className="w-64 bg-zinc-900 border border-zinc-700 shadow-xl rounded-lg p-2"
      >
        {/* User Info */}
        <div className="px-3 py-3 mb-1">
          <p className="text-sm font-semibold text-white truncate">
            {session.user.name || "Creator"}
          </p>
          <p className="text-xs text-gray-400 truncate">{session.user.email}</p>
        </div>

        <DropdownMenuSeparator className="bg-zinc-700 my-2" />

        {/* Settings */}
        <DropdownMenuItem 
          onClick={handleSettings} 
          className="cursor-pointer text-white hover:bg-zinc-800 focus:bg-zinc-800 rounded-md px-3 py-2 transition-colors"
        >
          <Settings className="mr-3 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>

        {/* Contact Us */}
        <DropdownMenuItem 
          onClick={handleContact} 
          className="cursor-pointer text-white hover:bg-zinc-800 focus:bg-zinc-800 rounded-md px-3 py-2 transition-colors"
        >
          <MessageSquare className="mr-3 h-4 w-4" />
          <span>Contact Us</span>
        </DropdownMenuItem>

        {/* Documentation */}
        <DropdownMenuItem
          onClick={() => {
            router.push("/documentation");
            setIsOpen(false);
          }}
          className="cursor-pointer text-white hover:bg-zinc-800 focus:bg-zinc-800 rounded-md px-3 py-2 transition-colors"
        >
          <HelpCircle className="mr-3 h-4 w-4" />
          <span>Documentation</span>
        </DropdownMenuItem>

        {/* Email Support */}
        <DropdownMenuItem
          onClick={() => {
            window.open("mailto:support@creatormind.ai", "_blank");
            setIsOpen(false);
          }}
          className="cursor-pointer text-white hover:bg-zinc-800 focus:bg-zinc-800 rounded-md px-3 py-2 transition-colors"
        >
          <Mail className="mr-3 h-4 w-4" />
          <span>Email Support</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-zinc-700 my-2" />

        {/* Logout */}
        <DropdownMenuItem 
          onClick={handleLogout} 
          className="cursor-pointer text-red-400 hover:bg-zinc-800 focus:bg-zinc-800 hover:text-red-300 rounded-md px-3 py-2 transition-colors"
        >
          <LogOut className="mr-3 h-4 w-4" />
          <span>Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}