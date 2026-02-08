'use client';

import { Playwrite_NZ } from 'next/font/google';
import dynamic from 'next/dynamic';

const Ballpit = dynamic(() => import('@/components/ui/Ballpit'), { ssr: false });

const playwrite = Playwrite_NZ({
  weight: '400',
});

export function Footer() {
  return (
    <footer className="relative w-full bg-black text-gray-300 border-t border-white/10 ">
      {/* Ballpit Background - covers entire footer */}
      <div className="absolute inset-0 pointer-events-none">
        <Ballpit
          count={100}
          gravity={0.01}
          friction={0.9975}
          wallBounce={0.95}
          followCursor={false}
          colors={[0x1a1a1a, 0x2a2a2a, 0x3a3a3a, 0x4a4a4a, 0x5a5a5a]}
        />
      </div>

      {/* Blur gradient overlay at top - fades balls as they go up */}
      <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none bg-gradient-to-b from-black via-black/60 to-transparent" />

      {/* Glow background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(156,163,175,0.15),transparent_60%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-8 py-24">
        {/* Top Row */}
        <div className="flex items-center justify-between mb-20">
          <div className="flex items-center gap-3 text-white text-lg font-semibold">
            <div className="w-8 h-8 rounded-md bg-white/10 grid place-items-center">
              ⬣
            </div>
            <span className={playwrite.className}>CreatorMind</span>
          </div>

          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#">Product</a>
            <a href="#">Enterprise</a>
            <a href="#">Pricing</a>
            <a href="#">Resources</a>
          </div>

          <div className="flex gap-3">
           
            <button className="px-4 py-1.5 rounded-full bg-white text-black text-sm">
              Download
            </button>
          </div>
        </div>

        {/* Footer Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12">
          <FooterCol title="Product" items={[
            "Agents","Enterprise","Code Review","Tab","CLI","Cloud Agents","Pricing"
          ]} />

          <FooterCol title="Resources" items={[
            "Download","Changelog","Docs","Forum","Status"
          ]} />

          <FooterCol title="Company" items={[
            "Careers","Blog","Community","Students","Brand","Anysphere"
          ]} />

          <FooterCol title="Legal" items={[
            "Terms of Service","Privacy Policy","Data Use","Security"
          ]} />

          <FooterCol title="Connect" items={[
            "X","LinkedIn","YouTube","Contact Us"
          ]} />
        </div>

        {/* Bottom Bar */}
        <div className="mt-24 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <div>
            © {new Date().getFullYear()} CreatorMind · SOC 2 Certified
          </div>

          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <button className="border border-white/10 px-3 py-1 rounded-full">
              🌐 English
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="text-gray-400 mb-4">{title}</h4>
      <ul className="space-y-3 text-white text-sm">
        {items.map((item, i) => (
          <li key={i}>
            <a href="#" className="hover:text-gray-300 transition">
              {item}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
