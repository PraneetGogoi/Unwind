import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center gap-3 text-high font-mono font-bold uppercase tracking-widest mb-4">
        <AlertCircle className="w-5 h-5" />
        404: Flow Broken
      </div>
      <h1 className="font-display text-5xl md:text-7xl mb-6">Page Not Found</h1>
      <p className="font-sans text-xl text-grey-text max-w-lg mx-auto mb-12">
        The route you requested doesn't exist. Let's get you back to safety.
      </p>
      <Link href="/" className="brutal-btn brutal-btn-primary px-8 py-4 font-bold text-lg">
        Return Home
      </Link>
    </div>
  );
}
