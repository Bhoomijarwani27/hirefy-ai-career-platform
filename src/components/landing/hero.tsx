import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
  {/* Base */}
  <div className="absolute inset-0 bg-[#fbfbfd]" />

  {/* Soft purple center glow */}
  <div className="absolute inset-x-0 top-0 h-140 bg-[radial-gradient(ellipse_at_50%_0%,rgba(139,92,246,0.20)_0%,rgba(167,139,250,0.13)_28%,rgba(255,255,255,0)_72%)]" />

  {/* Subtle grid */}
  <div
    className="absolute inset-0 opacity-40"
    style={{
      backgroundImage:
        "linear-gradient(rgba(99,102,241,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.055) 1px, transparent 1px)",
      backgroundSize: "61px 61px",
      maskImage:
        "linear-gradient(to bottom, black 0%, black 45%, transparent 82%)",
      WebkitMaskImage:
        "linear-gradient(to bottom, black 0%, black 45%, transparent 82%)",
    }}
  />

  {/* White side fade */}
  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,transparent_0%,transparent_38%,rgba(255,255,255,0.92)_82%)]" />

  {/* Bottom fade */}
  <div className="absolute inset-x-0 bottom-0 h-72 bg-linear-to-b from-transparent via-white/80 to-white" />
</div>

      <div className="relative z-10 container mx-auto px-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center pt-28 text-center">
          <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight text-slate-950 md:text-6xl lg:text-7xl">
            Get hired faster.
            <br />
            <span className="bg-linear-to-r from-indigo-600 via-sky-500 to-fuchsia-500 bg-clip-text text-transparent">
              Hire smarter.
            </span>
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
            The AI-powered career platform that helps you build stronger
            resumes, improve ATS scores, discover better job opportunities,
            and prepare for interviews — all in one workspace.
          </p>

          <div className="mt-10 flex items-center justify-center">
            <Button
              size="lg"
              className="rounded-full px-8 py-6 text-base font-semibold shadow-xl shadow-slate-900/10"
            >
              Get started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <div className="mt-16 w-full max-w-6xl">
            <div className="h-140 rounded-[2rem] border border-white/70 bg-white/75 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}