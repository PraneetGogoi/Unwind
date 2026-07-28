"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

const ROUTES = [
  { name: "Home", path: "/" },
  { name: "Dashboard", path: "/dashboard" },
  { name: "Predict", path: "/predict" },
  { name: "My Unwind", path: "/my-unwind" },
  { name: "Breathe", path: "/breathe" },
  { name: "Tips", path: "/tips" },
];

export function Header() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full h-16 bg-frame border-b-2 border-ink">
      <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-3 group"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="flex items-center justify-center w-10 h-10 bg-ink text-paper rounded-[3px] transition-transform group-hover:scale-105">
            <Activity className="w-6 h-6" strokeWidth={3} />
          </div>
          <div className="flex flex-col justify-center">
            <span className="font-display font-bold leading-none text-xl translate-y-[2px]">
              Unwind
            </span>
            <span className="font-mono text-[10px] uppercase font-bold text-grey-text">
              dev burnout lab
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2 font-bold font-sans">
          {ROUTES.map((route) => {
            const isActive = pathname === route.path;
            return (
              <Link
                key={route.path}
                href={route.path}
                aria-current={isActive ? "page" : undefined}
                className={`px-4 py-2 rounded-[3px] transition-colors border-2 ${
                  isActive
                    ? "bg-ink text-paper border-ink"
                    : "bg-transparent text-ink border-transparent hover:border-ink"
                }`}
              >
                {route.name}
              </Link>
            );
          })}
        </nav>

        {/* Spacer for desktop (since nav is centered-ish or pushed left, we want toggle on right) */}
        <div className="hidden md:flex items-center">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="flex items-center justify-center w-10 h-10 bg-paper border-2 border-ink shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all rounded-[3px]"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden flex items-center justify-center w-10 h-10 border-2 border-ink bg-paper shadow-hard-sm"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-frame border-b-2 border-ink shadow-hard flex flex-col">
          <nav className="flex flex-col p-4 gap-2">
            {ROUTES.map((route) => {
              const isActive = pathname === route.path;
              return (
                <Link
                  key={route.path}
                  href={route.path}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-4 text-center font-bold text-lg border-2 rounded-[3px] ${
                    isActive
                      ? "bg-ink text-paper border-ink"
                      : "bg-paper text-ink border-ink shadow-hard-sm active:translate-y-1 active:translate-x-1 active:shadow-none"
                  }`}
                >
                  {route.name}
                </Link>
              );
            })}
            <button
              onClick={() => {
                toggle();
                setMobileMenuOpen(false);
              }}
              className="p-4 mt-4 flex items-center justify-center gap-2 font-bold text-lg border-2 border-ink bg-paper shadow-hard-sm rounded-[3px]"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-5 h-5" /> Light Mode
                </>
              ) : (
                <>
                  <Moon className="w-5 h-5" /> Dark Mode
                </>
              )}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
