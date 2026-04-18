import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeProvider, useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

function HeaderThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <header className="sticky top-0 z-30 h-14 flex items-center justify-between gap-2 border-b bg-background/70 backdrop-blur px-3">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <span className="text-sm text-muted-foreground hidden sm:inline">Developer burnout analytics</span>
              </div>
              <HeaderThemeToggle />
            </header>
            <main className="flex-1">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
