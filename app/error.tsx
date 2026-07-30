"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // We could log to Sentry here if we had it configured
    console.error("Runtime Error Caught by Boundary:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 text-high font-mono font-bold uppercase tracking-widest mb-4">
        <AlertTriangle className="w-5 h-5" />
        Application Error
      </div>
      <h1 className="font-display text-5xl md:text-7xl mb-6">Something Broke</h1>
      <p className="font-sans text-xl text-grey-text max-w-lg mx-auto mb-12">
        We've caught an unexpected error. The system couldn't recover gracefully.
      </p>
      <button
        onClick={() => reset()}
        className="brutal-btn brutal-btn-primary px-8 py-4 font-bold text-lg"
      >
        Try Again
      </button>
    </div>
  );
}
