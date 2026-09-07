'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shonchoi", href: "/shonchoi" },
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 z-[1000] text-white shadow-lg">
      <nav className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        
        {/* Navigation Items (Scrollable when overflowed) */}
        <div className="flex-1 overflow-x-auto no-scrollbar py-2">
          <ul className="flex items-center gap-2 sm:gap-6 min-w-max">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={`px-3 py-2 text-sm font-semibold tracking-wide transition-all duration-200 border-b-2 ${
                      isActive
                        ? "border-red-500 text-red-500 font-bold"
                        : "border-transparent text-slate-300 hover:text-white hover:border-slate-500"
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Action Button / Login */}
        <div className="flex-shrink-0">
          <Link
            href="/login"
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-300 shadow-md ${
              pathname === "/login"
                ? "bg-red-700 text-white shadow-red-900/50 ring-2 ring-red-400"
                : "bg-red-600 hover:bg-red-500 text-white hover:shadow-lg hover:shadow-red-600/30 active:scale-95"
            }`}
          >
            Login
          </Link>
        </div>

      </nav>
    </header>
  );
}