import {
  FileText,
  WandSparkles,
  CircleGauge,
  Orbit,
} from "lucide-react";
import { ResumeStudioPreview } from "@/components/landing/landing-previews";

export function Resume() {
  return (
    <section
      id="resume"
      className="bg-muted/30 px-6 py-16 sm:py-20 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase text-indigo-500 dark:text-indigo-400">
              Career Development
            </p>

            <h1 className="mt-4 text-3xl font-bold text-foreground sm:text-5xl md:text-4xl lg:text-5xl">
              A resume that actually gets you interviews.
            </h1>

            <p className="mt-6 text-base text-muted-foreground sm:text-xl">
              Upload or build, then let Hirefy AI analyze, score, and rewrite it
              against real ATS systems and role-specific benchmarks.
            </p>

            <div className="mt-9 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h6 className="text-lg font-bold text-foreground">
                    Resume Builder
                  </h6>
                  <p className="mt-1 text-base text-muted-foreground">
                    Clean templates, live preview.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <WandSparkles className="h-6 w-6" />
                </div>
                <div>
                  <h6 className="text-lg font-bold text-foreground">
                    AI Analysis
                  </h6>
                  <p className="mt-1 text-base text-muted-foreground">
                    Line-by-line suggestions.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <CircleGauge className="h-6 w-6" />
                </div>
                <div>
                  <h6 className="text-lg font-bold text-foreground">
                    Resume Match Score
                  </h6>
                  <p className="mt-1 text-base text-muted-foreground">
                    See how well your resume matches a specific job role.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <Orbit className="h-6 w-6" />
                </div>
                <div>
                  <h6 className="text-lg font-bold text-foreground">
                    Skill Gap
                  </h6>
                  <p className="mt-1 text-base text-muted-foreground">
                    See what&apos;s missing for the role.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-16 w-full max-w-2xl lg:mt-0">
            <ResumeStudioPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
