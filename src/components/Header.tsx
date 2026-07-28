import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-frame text-ink border-b-2 border-ink shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-6">
        <Link href="/" className="flex items-center justify-center w-10 h-10 bg-ink text-paper rounded-[8px] font-display font-bold text-xl hover:scale-105 transition-transform">
          M
        </Link>
        <nav className="flex items-center gap-6 text-sm font-bold font-sans">
          <Link href="/dashboard" className="hover:underline underline-offset-4 decoration-2">Dashboard</Link>
          <Link href="/predict" className="hover:underline underline-offset-4 decoration-2">Predict</Link>
          <Link href="/breathe" className="hover:underline underline-offset-4 decoration-2">Breathe</Link>
          <Link href="/tips" className="hover:underline underline-offset-4 decoration-2">Tips</Link>
        </nav>
      </div>
    </header>
  );
}
