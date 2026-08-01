import {
  Target,
  Search,
  Bookmark,
  ClipboardList,
} from "lucide-react";

export function JobDiscovery() {
  return (
    <section className="bg-muted/30 px-6 py-16 sm:py-20 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="order-2 mt-16 w-full max-w-2xl lg:order-1 lg:mt-0">
            <div className="h-140 rounded-[2rem] border border-border/70 bg-card/75 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:shadow-[0_20px_60px_rgba(0,0,0,0.3)]" />
          </div>

          <div className="order-1 lg:order-2">
            <p className="text-sm font-bold uppercase text-indigo-500 dark:text-indigo-400">
              Job discovery
            </p>

            <h1 className="mt-4 text-3xl font-bold text-foreground sm:text-5xl md:text-4xl lg:text-5xl">
              Stop scrolling. Start matching.
            </h1>

            <p className="mt-6 text-base text-muted-foreground sm:text-xl">
              AI reads your profile and returns roles you'll actually get
              — with match scores, salary insights, and one-click apply.
            </p>

            <div className="mt-9 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <h6 className="text-lg font-bold text-foreground">
                    AI Job Matching
                  </h6>
                  <p className="mt-1 text-base text-muted-foreground">
                    Rank by real fit.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <Search className="h-6 w-6" />
                </div>
                <div>
                  <h6 className="text-lg font-bold text-foreground">
                    Smart Search
                  </h6>
                  <p className="mt-1 text-base text-muted-foreground">
                    Filters that understand intent.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <Bookmark className="h-6 w-6" />
                </div>
                <div>
                  <h6 className="text-lg font-bold text-foreground">
                    Save & Apply
                  </h6>
                  <p className="mt-1 text-base text-muted-foreground">
                    Track in one workspace.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <ClipboardList className="h-6 w-6" />
                </div>
                <div>
                  <h6 className="text-lg font-bold text-foreground">
                    Application Tracker
                  </h6>
                  <p className="mt-1 text-base text-muted-foreground">
                    Monitor your applications in real-time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
