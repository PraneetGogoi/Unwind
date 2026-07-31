"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // We disable animations for the /breathe page because it has its own 
  // complex physics-based mounting animations that conflict.
  if (pathname === "/breathe") {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
        transition={{ 
          duration: 0.35, 
          ease: [0.22, 1, 0.36, 1] // Custom spring-like easing for a brutalist but smooth feel
        }}
        className="w-full h-full min-h-[calc(100vh-4rem-6rem)]"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
