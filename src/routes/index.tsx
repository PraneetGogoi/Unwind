import { createFileRoute, Link } from "@tanstack/react-router";
import { ThemeProvider, useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Wind, BarChart3, Moon, Sun, Activity } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Unwind — Developer Burnout Analytics" },
      { name: "description", content: "Understand, predict, and recover from developer burnout — backed by 7,000 developer data points." },
    ],
  }),
  component: Landing,
});

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme" className="rounded-full">
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}

function LandingInner() {
  return (
    <div className="min-h-screen bg-hero overflow-hidden">
      {/* nav */}
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
            <Activity className="h-5 w-5" />
          </div>
          <div className="font-display text-xl">Unwind</div>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <Link to="/dashboard" className="hover:text-foreground transition">Dashboard</Link>
          <Link to="/predict" className="hover:text-foreground transition">Predict</Link>
          <Link to="/breathe" className="hover:text-foreground transition">Breathe</Link>
          <Link to="/tips" className="hover:text-foreground transition">Tips</Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild className="rounded-full">
            <Link to="/dashboard">Open app <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
      </header>

      {/* hero */}
      <section className="relative mx-auto max-w-7xl px-6 pt-10 pb-24">
        <div className="pointer-events-none absolute -top-20 right-0 h-[520px] w-[520px] rounded-full bg-aurora opacity-40 blur-3xl animate-spin-slow" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-[420px] w-[420px] rounded-full bg-aurora opacity-30 blur-3xl animate-spin-slow" />

        <div className="grid lg:grid-cols-12 gap-10 items-center relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7"
          >
            <div className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs text-muted-foreground glass">
              <span className="inline-block h-2 w-2 rounded-full bg-accent animate-pulse" />
              Trained on 7,000 developers
            </div>
            <h1 className="mt-6 font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.02] text-balance">
              The quiet science of
              <span className="block italic text-primary">staying well at the keyboard.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Unwind turns burnout signals — sleep, caffeine, commits, meetings — into clear insight.
              Explore the data, predict your risk, and recover with guided breathing.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full h-12 px-6 shadow-glow">
                <Link to="/dashboard">Explore the dashboard <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full h-12 px-6">
                <Link to="/predict">Predict my burnout</Link>
              </Button>
            </div>
            <dl className="mt-12 grid grid-cols-3 gap-6 max-w-lg">
              {[
                { v: "7,000", l: "developers analyzed" },
                { v: "12", l: "burnout signals" },
                { v: "4", l: "ML models compared" },
              ].map((s) => (
                <div key={s.l}>
                  <dt className="font-display text-3xl text-foreground">{s.v}</dt>
                  <dd className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{s.l}</dd>
                </div>
              ))}
            </dl>
          </motion.div>

          {/* breathing orb */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="lg:col-span-5 relative h-[460px] flex items-center justify-center"
          >
            <div className="absolute inset-0 m-auto h-80 w-80 rounded-full bg-aurora opacity-60 blur-2xl animate-spin-slow" />
            <motion.div
              animate={{ scale: [1, 1.18, 1.18, 1, 1], opacity: [0.7, 1, 1, 0.7, 0.7] }}
              transition={{ duration: 19, repeat: Infinity, times: [0, 0.21, 0.58, 0.79, 1], ease: "easeInOut" }}
              className="relative h-72 w-72 rounded-full bg-gradient-to-br from-primary/80 to-accent/80 shadow-glow flex items-center justify-center"
            >
              <div className="absolute inset-3 rounded-full border border-white/30" />
              <div className="text-center text-primary-foreground">
                <div className="font-display text-2xl">breathe</div>
                <div className="text-xs uppercase tracking-[0.3em] mt-1 opacity-80">4 · 7 · 8</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* feature trio */}
      <section className="mx-auto max-w-7xl px-6 pb-28">
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: BarChart3, title: "Live dashboard", desc: "Distributions, correlations, and tier breakdowns rendered with interactive Plotly charts.", to: "/dashboard" },
            { icon: Sparkles, title: "Burnout predictor", desc: "A weighted model derived from feature importance tells you where you stand.", to: "/predict" },
            { icon: Wind, title: "4-7-8 breather", desc: "A 19-second cycle proven to calm the nervous system. Two minutes resets a day.", to: "/breathe" },
          ].map((f) => (
            <Link key={f.title} to={f.to} className="group rounded-3xl glass p-6 hover:shadow-soft transition shadow-soft">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition" />
              </div>
              <h3 className="font-display text-2xl mt-5">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{f.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <div>© Unwind — built with care for developers.</div>
          <div className="font-mono text-xs">dataset · 7000 × 12 · cleaned</div>
        </div>
      </footer>
    </div>
  );
}

function Landing() {
  return (
    <ThemeProvider>
      <LandingInner />
    </ThemeProvider>
  );
}
