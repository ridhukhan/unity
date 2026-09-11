'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.isAdmin) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      })
      .catch((err) => {
        console.error("Auth check error:", err);
        setIsLoggedIn(false);
      });
  }, [pathname]); 
  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", {
        method: "POST",
      });

      if (res.ok) {
        setIsLoggedIn(false);
        toast.success("সফলভাবে লগআউট হয়েছে!");
        router.push("/login");
        router.refresh();
      } else {
        toast.error("লগআউট করতে সমস্যা হয়েছে!");
      }
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("নেটওয়ার্ক সমস্যা!");
    }
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "সঞ্চয় ", href: "/shonchoi" },
    { name: "ঋণ ", href: "/rin" },
    { name: "সঞ্চয় ২ ", href: "/shonchoi2" },
    { name: "ঋণ ২", href: "/rin2" },

    { name: "সঞ্চয় ৩", href: "/shonchoi3" },
    { name: "ঋণ ৩", href: "/rin3" },


    { name: "Note", href: "/note" },
    { name: "Note 2", href: "/note2" },

    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 z-[1000] text-white shadow-lg">
      <nav className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        
        {/* Navigation Items */}
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

        {/* Dynamic Action Button (Login / Logout) */}
        <div className="flex-shrink-0">
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="px-5 py-2 rounded-lg text-sm font-bold bg-slate-800 hover:bg-red-600/20 text-red-400 hover:text-red-300 border border-red-500/40 transition-all duration-300 shadow-md active:scale-95"
            >
              Logout
            </button>
          ) : (
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
          )}
        </div>

      </nav>
    </header>
  );
}