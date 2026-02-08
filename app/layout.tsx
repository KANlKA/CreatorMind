import { initializeScheduler } from "@/lib/cron/init-scheduler";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import { ProfileDropdown } from "@/components/layout/profile-dropdown";


if (typeof window === "undefined") {
  initializeScheduler();
}
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CreatorMind - YouTube Creator Intelligence",
  description: "Know exactly what to create next, powered by your data",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navbar />
          {children}
          {/* Profile Dropdown available globally */}
          <div className="hidden">
            <ProfileDropdown />
          </div>
        </Providers>
      </body>
    </html>
  );
}