import {
  Building,
  Trophy,
  Scale,
  Layers3,
  MessageSquare,
  BarChart3,
} from "lucide-react";

export function Recruiter() {
  return (
    <section
      id="for-companies"
      className="bg-muted/30 px-6 py-16 sm:py-20 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center text-sm">
          <p className="text-sm font-bold uppercase text-indigo-500 dark:text-indigo-400">
            For Recruiters
          </p>
          <h1 className="mt-4 text-3xl font-bold text-foreground sm:text-5xl md:text-4xl lg:text-5xl">
            Hire the right talent, faster.
          </h1>
          <p className="mt-6 text-base text-muted-foreground sm:text-xl">
            Find, evaluate, and hire the best candidates with AI-powered resume
            analysis, intelligent candidate ranking, interview management, and
            actionable hiring insights—all in one platform.
          </p>
        </div>

        <div className="mt-9 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="mt-16 w-full max-w-7xl lg:mt-0">
            <div className="h-110 rounded-[2rem] border border-border/70 bg-card/75 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:shadow-[0_20px_60px_rgba(0,0,0,0.3)]" />
          </div>

          <div className="flex w-full flex-col items-start gap-3">
            {[
              {
                icon: Building,
                title: "company Dashboard",
                desc: "Manage jobs and hiring in one place.",
              },
              {
                icon: Trophy,
                title: "AI Candidate Ranking",
                desc: "AI ranks candidates by job fit.",
              },
              {
                icon: Layers3,
                title: "Shortlisted Candidates",
                desc: "Review and manage top candidates.",
              },
              {
                icon: MessageSquare,
                title: "Interview Pipeline",
                desc: "Track interviews from start to hire.",
              },
              {
                icon: BarChart3,
                title: "Hiring Analytics",
                desc: "Monitor hiring performance and trends.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex w-full items-center gap-4 rounded-3xl border border-violet-200 bg-card px-4 py-2 shadow-sm transition-all hover:border-violet-400 hover:shadow-md dark:border-violet-900/50 dark:hover:border-violet-700"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h6 className="text-lg font-bold text-foreground">{title}</h6>
                  <p className="mt-1 text-base text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
