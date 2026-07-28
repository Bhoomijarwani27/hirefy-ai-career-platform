import {
  FileText,
  WandSparkles,
  CircleGauge,
  Orbit,
} from "lucide-react";

export function Resume() {
  return (
    <section
      id="resume"
      className="px-6 lg:px-8 bg-[#fbfbfd] py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12"> 
        {/* Left Side */}
        <div>
          <p className="text-sm font-bold uppercase text-indigo-500">
            Career Development
          </p>

          <h1 className="mt-4 text-3xl font-bold sm:text-5xl md:text-4xl lg:text-5xl">
            A resume that actually gets you interview.
          </h1>

          <p className="mt-6 text-base text-gray-700 sm:text-xl">
            Upload or build, then let Hirefy AI analyze, score, and rewrite it
            against real ATS systems and role-specific benchmarks.
          </p>

          <div className="mt-9 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Resume Builder */}
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                <FileText className="h-6 w-6" />
              </div>

              <div>
                <h6 className="text-lg font-bold text-slate-950">
                  Resume Builder
                </h6>

                <p className="mt-1 text-base text-slate-600">
                  Clean templates, live preview.
                </p>
              </div>
            </div>

            {/* AI Analysis */}
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                <WandSparkles className="h-6 w-6" />
              </div>

              <div>
                <h6 className="text-lg font-bold text-slate-950">
                  AI Analysis
                </h6>

                <p className="mt-1 text-base text-slate-600">
                  Line-by-line suggestions.
                </p>
              </div>
            </div>

            {/* ATS Score */}
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                <CircleGauge className="h-6 w-6" />
              </div>

              <div>
                <h6 className="text-lg font-bold text-slate-950">
                  ATS Score
                </h6>

                <p className="mt-1 text-base text-slate-600">
                  Test against 40+ systems.
                </p>
              </div>
            </div>

            {/* Skill Gap */}
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                <Orbit className="h-6 w-6" />
              </div>

              <div>
                <h6 className="text-lg font-bold text-slate-950">
                  Skill Gap
                </h6>

                <p className="mt-1 text-base text-slate-600">
                  See what's missing for the role.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="mt-16 lg:mt-0 w-full max-w-2xl mx-auto">
          <div className="h-140 rounded-[2rem] border border-white/70 bg-white/75 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl" />
          {/* image placeholder */}
        </div>
      </div>
      </div>
    </section>
  );
}