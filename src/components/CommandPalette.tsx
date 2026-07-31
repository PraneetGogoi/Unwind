"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Activity, Wind, Lightbulb, LineChart, Home, Sparkles, X } from "lucide-react";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    const toggleEvent = () => setOpen((open) => !open);

    document.addEventListener("keydown", down);
    window.addEventListener("unwind-toggle-cmdk", toggleEvent);
    return () => {
      document.removeEventListener("keydown", down);
      window.removeEventListener("unwind-toggle-cmdk", toggleEvent);
    };
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-ink/20 backdrop-blur-sm">
      <div 
        className="fixed inset-0"
        onClick={() => setOpen(false)}
      />
      <div className="relative w-full max-w-lg bg-paper border-2 border-ink shadow-hard overflow-hidden brutal-card animate-in fade-in zoom-in-95 duration-200">
        <Command
          className="w-full flex flex-col"
          shouldFilter={true}
        >
          <div className="flex items-center border-b-2 border-ink px-4 bg-frame">
            <Command.Input 
              placeholder="Type a command or search..." 
              className="flex-1 h-14 bg-transparent outline-none font-mono text-sm placeholder:text-muted-foreground text-ink"
              autoFocus
            />
            <button 
              onClick={() => setOpen(false)}
              className="p-1 hover:bg-ink/10 rounded-[3px] transition-colors focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
            >
              <X className="w-5 h-5 text-ink" />
            </button>
          </div>
          
          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty className="p-6 text-center text-sm font-mono text-muted-foreground">
              No results found.
            </Command.Empty>

            <Command.Group heading="Hub & Tools" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:text-muted-foreground">
              <Command.Item 
                onSelect={() => runCommand(() => router.push("/predict"))}
                className="flex items-center gap-3 px-3 py-3 rounded-[3px] font-sans font-bold text-sm cursor-pointer aria-selected:bg-ink aria-selected:text-paper"
              >
                <Sparkles className="w-4 h-4" />
                Run Risk Prediction
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => router.push("/my-unwind"))}
                className="flex items-center gap-3 px-3 py-3 rounded-[3px] font-sans font-bold text-sm cursor-pointer aria-selected:bg-ink aria-selected:text-paper"
              >
                <Activity className="w-4 h-4" />
                Go to My Unwind
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => router.push("/breathe"))}
                className="flex items-center gap-3 px-3 py-3 rounded-[3px] font-sans font-bold text-sm cursor-pointer aria-selected:bg-ink aria-selected:text-paper"
              >
                <Wind className="w-4 h-4" />
                Take a Breathe Session
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => router.push("/tips"))}
                className="flex items-center gap-3 px-3 py-3 rounded-[3px] font-sans font-bold text-sm cursor-pointer aria-selected:bg-ink aria-selected:text-paper"
              >
                <Lightbulb className="w-4 h-4" />
                View Recommended Habits
              </Command.Item>
            </Command.Group>

            <Command.Separator className="h-[2px] bg-ink/10 my-1 mx-[-8px]" />

            <Command.Group heading="Data & Explore" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:text-muted-foreground">
              <Command.Item 
                onSelect={() => runCommand(() => router.push("/dashboard"))}
                className="flex items-center gap-3 px-3 py-3 rounded-[3px] font-sans font-bold text-sm cursor-pointer aria-selected:bg-ink aria-selected:text-paper"
              >
                <LineChart className="w-4 h-4" />
                Explore the Data Dashboard
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => router.push("/"))}
                className="flex items-center gap-3 px-3 py-3 rounded-[3px] font-sans font-bold text-sm cursor-pointer aria-selected:bg-ink aria-selected:text-paper"
              >
                <Home className="w-4 h-4" />
                Go to Home
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
