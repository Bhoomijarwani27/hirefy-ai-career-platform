import {
  Upload,
  ScanSearch,
  CircleGauge,
  Target,
  WandSparkles,
  Sparkles,
  Users,
  BarChart3,
  ChevronRight,
  BrainCircuit,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type StepCategory = "Seeker" | "Company" | "Shared";

type ProcessStep = {
  number: string;
  title: string;
  category: StepCategory;
  icon: LucideIcon;
};

const processSteps: ProcessStep[] = [
  { number: "01", title: "Resume Upload", category: "Seeker", icon: Upload },
  { number: "02", title: "AI Analysis", category: "Seeker", icon: ScanSearch },
  { number: "03", title: "ATS Score", category: "Seeker", icon: CircleGauge },
  {
    number: "04",
    title: "Skill Gap Detection",
    category: "Seeker",
    icon: Target,
  },
  {
    number: "05",
    title: "Resume Improvement",
    category: "Seeker",
    icon: WandSparkles,
  },
  { number: "06", title: "Job Matching", category: "Shared", icon: Sparkles },
  {
    number: "07",
    title: "Candidate Ranking",
    category: "Company",
    icon: Users,
  },
  {
    number: "08",
    title: "Hiring Insights",
    category: "Company",
    icon: BarChart3,
  },
];

const stats = [
  { value: "10M+", label: "Resumes analyzed" },
  { value: "<2s", label: "Average AI response" },
  { value: "98%", label: "Match accuracy" },
];

const categoryStyles: Record<
  StepCategory,
  { badge: string; icon: string }
> = {
  Seeker: {
    badge:
      "text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/50",
    icon: "bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400",
  },
  Company: {
    badge: "text-cyan-700 bg-cyan-50 dark:text-cyan-400 dark:bg-cyan-950/50",
    icon: "bg-cyan-100 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400",
  },
  Shared: {
    badge:
      "text-violet-700 bg-violet-50 dark:text-violet-400 dark:bg-violet-950/50",
    icon: "bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400",
  },
};

function StepCard({ step }: { step: ProcessStep }) {
  const Icon = step.icon;
  const styles = categoryStyles[step.category];

  return (
    <div className="flex min-w-0 flex-1 flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md dark:hover:border-indigo-800">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          {step.number}
        </span>
      </div>
      <div className="mt-4">
        <h3 className="text-base font-bold text-foreground">{step.title}</h3>
        <span
          className={`mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${styles.badge}`}
        >
          {step.category}
        </span>
      </div>
    </div>
  );
}

function ProcessRow({ steps }: { steps: ProcessStep[] }) {
  return (
    <div className="hidden items-stretch gap-2 lg:flex">
      {steps.map((step, index) => (
        <div
          key={step.number}
          className="flex min-w-0 flex-1 items-center gap-2"
        >
          <StepCard step={step} />
          {index < steps.length - 1 && (
            <ChevronRight
              className="h-4 w-4 shrink-0 text-muted-foreground/50"
              aria-hidden
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function Features() {
  const rowOne = processSteps.slice(0, 4);
  const rowTwo = processSteps.slice(4, 8);

  return (
    <section
      id="features"
      className="bg-muted/30 px-6 py-16 sm:py-20 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-card px-4 py-1.5 text-sm font-medium text-indigo-600 shadow-sm dark:border-indigo-900/50 dark:text-indigo-400">
            <BrainCircuit className="h-4 w-4" />
            AI Intelligence Engine
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            One intelligence layer powering every step
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            From resume upload to hiring insights — Hirefy&apos;s AI engine
            connects every workflow into a single, seamless pipeline for job
            seekers and companies alike.
          </p>
        </div>

        <div className="mt-12 space-y-3 lg:mt-16 lg:space-y-3">
          <ProcessRow steps={rowOne} />
          <ProcessRow steps={rowTwo} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
            {processSteps.map((step) => (
              <StepCard key={step.number} step={step} />
            ))}
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3 lg:mt-16">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-3xl border border-border bg-card px-8 py-10 text-center shadow-sm"
            >
              <p className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm font-medium text-muted-foreground sm:text-base">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
