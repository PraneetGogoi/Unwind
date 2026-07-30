import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4">
      <div className="brutal-card bg-paper p-8 flex flex-col items-center gap-4 shadow-hard">
        <Loader2 className="w-10 h-10 text-ink animate-spin" />
        <span className="font-mono font-bold uppercase tracking-widest text-sm text-grey-text animate-pulse">
          Loading...
        </span>
      </div>
    </div>
  );
}
