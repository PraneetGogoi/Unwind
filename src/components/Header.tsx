"use client";

import { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Moon, Sun, Menu, X, Command } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

const NAV_GROUPS = [
  {
    label: "Hub",
    routes: [
      { name: "My Unwind", path: "/my-unwind" }
    ]
  },
  {
    label: "Tools",
    routes: [
      { name: "Predict", path: "/predict" },
      { name: "Breathe", path: "/breathe" },
      { name: "Tips", path: "/tips" },
    ]
  },
  {
    label: "Data",
    routes: [
      { name: "Dashboard", path: "/dashboard" },
    ]
  }
];

// flat map for mobile
const ALL_ROUTES = NAV_GROUPS.flatMap(g => g.routes);

export function Header() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const latestPrediction = useLiveQuery(() => db.settings.get("unwind_latest_prediction"))?.value;
  const riskLevel = latestPrediction?.result?.prediction || null;
  const riskTimestamp = latestPrediction?.timestamp ? formatDistanceToNow(new Date(latestPrediction.timestamp), { addSuffix: true }) : null;

  const getRiskColor = () => {
    if (riskLevel === "Low") return "bg-low";
    if (riskLevel === "Medium") return "bg-medium";
    if (riskLevel === "High") return "bg-high";
    return "bg-ink";
  };

  return (
    <>
      <style>
        {`
          @keyframes heartbeat {
            0%, 100% { transform: scale(1); }
            10% { transform: scale(1.15); }
            20% { transform: scale(1); }
            30% { transform: scale(1.15); }
            40% { transform: scale(1); }
          }
          .animate-heartbeat {
            animation: heartbeat 3s infinite cubic-bezier(0.2, 0.8, 0.2, 1);
          }
        `}
      </style>
      <header 
        className={`sticky top-0 z-50 w-full transition-all duration-300 bg-frame border-b-2 border-ink ${
          isScrolled ? "h-14 shadow-hard" : "h-16"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          
          {/* Brand */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-ink text-paper rounded-[3px] transition-transform group-hover:scale-105">
              <Activity className="w-5 h-5 md:w-6 md:h-6 animate-heartbeat" strokeWidth={3} />
            </div>
            <div className="flex flex-col justify-center">
              <span className={`font-display font-bold leading-none transition-all ${isScrolled ? "text-lg" : "text-xl"} translate-y-[2px]`}>
                Unwind
              </span>
              <span className="font-mono text-[9px] md:text-[10px] uppercase font-bold text-grey-text">
                dev burnout lab
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 font-bold font-sans">
            {NAV_GROUPS.map((group, groupIdx) => (
              <div key={group.label} className="flex items-center gap-1">
                {group.routes.map((route) => {
                  const isActive = pathname === route.path || (route.path !== '/' && pathname.startsWith(route.path));
                  const isMyUnwind = route.name === "My Unwind";
                  
                  return (
                    <Link
                      key={route.path}
                      href={route.path}
                      aria-current={isActive ? "page" : undefined}
                      className={`relative px-4 py-2 rounded-[3px] transition-colors text-sm uppercase tracking-wide font-mono focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2 ${
                        isActive ? "text-paper" : "text-ink hover:bg-ink/10"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeNavIndicator"
                          className="absolute inset-0 bg-ink rounded-[3px] border-2 border-ink"
                          initial={false}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-2">
                        {route.name}
                        {isMyUnwind && riskLevel && (
                          <span 
                            className={`w-2 h-2 rounded-full ${getRiskColor()} ${isActive ? 'border border-paper' : ''}`}
                            title={`${riskLevel} risk ${riskTimestamp ? `— updated ${riskTimestamp}` : ''}`}
                          />
                        )}
                      </span>
                    </Link>
                  );
                })}
                {/* Separator between groups */}
                {groupIdx < NAV_GROUPS.length - 1 && (
                  <div className="w-[2px] h-4 bg-ink/20 ml-5" />
                )}
              </div>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('unwind-toggle-cmdk'))}
              className="brutal-btn brutal-btn-ghost flex items-center gap-2 px-3 py-2 font-mono text-xs font-bold text-muted-foreground"
              aria-label="Open Command Palette"
            >
              <Command className="w-4 h-4 text-ink" />
              <span>⌘K</span>
            </button>
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="brutal-btn brutal-btn-icon bg-paper w-10 h-10"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-ink" />
              ) : (
                <Moon className="w-4 h-4 text-ink" />
              )}
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('unwind-toggle-cmdk'))}
              className="brutal-btn brutal-btn-icon bg-paper w-10 h-10"
              aria-label="Open Command Palette"
            >
              <Command className="w-4 h-4 text-ink" />
            </button>
            <button
              className="brutal-btn brutal-btn-icon bg-paper w-10 h-10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-ink" />
              ) : (
                <Menu className="w-5 h-5 text-ink" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-frame border-b-2 border-ink shadow-hard flex flex-col z-50">
            <nav className="flex flex-col p-4 gap-2 max-h-[80vh] overflow-y-auto">
              {ALL_ROUTES.map((route) => {
                const isActive = pathname === route.path || (route.path !== '/' && pathname.startsWith(route.path));
                const isMyUnwind = route.name === "My Unwind";
                return (
                  <Link
                    key={route.path}
                    href={route.path}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`p-4 flex items-center justify-between font-mono uppercase font-bold text-sm border-2 rounded-[3px] transition-all focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2 ${
                      isActive
                        ? "bg-ink text-paper border-ink"
                        : "bg-paper text-ink border-ink shadow-hard-sm active:translate-y-1 active:translate-x-1 active:shadow-none"
                    }`}
                  >
                    {route.name}
                    {isMyUnwind && riskLevel && (
                      <span 
                        className={`w-3 h-3 rounded-full ${getRiskColor()} ${isActive ? 'border-2 border-paper' : ''}`}
                        title={`${riskLevel} risk ${riskTimestamp ? `— updated ${riskTimestamp}` : ''}`}
                      />
                    )}
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  toggle();
                  setMobileMenuOpen(false);
                }}
                className="p-4 mt-4 flex items-center justify-center gap-2 font-mono uppercase font-bold text-sm border-2 border-ink bg-paper shadow-hard-sm rounded-[3px] text-ink focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="w-4 h-4" /> Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4" /> Dark Mode
                  </>
                )}
              </button>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
