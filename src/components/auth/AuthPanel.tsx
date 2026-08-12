type AuthPanelProps = {
  badge: string;
  title: React.ReactNode;
  description: string;
  features?: string[];
};
export default function AuthPanel({
  badge,
  title,
  description,
  features,
}: AuthPanelProps) {
  return (
    <section className="relative hidden min-h-screen overflow-hidden bg-background px-16 py-14 text-foreground lg:flex lg:flex-col">
      {/* Grid */}
      <div
        className="
          absolute inset-0
          bg-[linear-gradient(to_right,color-mix(in_oklab,var(--foreground)_8%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--foreground)_8%,transparent)_1px,transparent_1px)]
          bg-size-[48px_48px]
        "
      />

      {/* Purple Glow */}
      <div className="absolute -right-20 -top-20 h-137.5 w-137.5 rounded-full bg-violet-500/15 blur-[120px] dark:bg-violet-400/20" />

      {/* Blue Glow */}
      <div className="absolute -bottom-20 -left-20 h-75 w-75 rounded-full bg-sky-500/10 blur-[100px] dark:bg-sky-400/15" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm shadow-violet-500/25 dark:bg-violet-500">
            <span className="text-sm font-bold">H</span>
          </div>
          <span className="text-xl font-semibold tracking-tight text-foreground">Hirefy</span>
        </div>
        {/* Badge */}
        <div className="mt-16 inline-flex w-fit items-center gap-2 rounded-full border border-violet-200/70 bg-violet-50/80 px-3 py-1.5 text-sm font-medium text-violet-700 dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-300">
          <span className="size-1.5 rounded-full bg-violet-500"/>
          {badge}
        </div>
        {/* Heading */}
        <h1 className="mt-6 max-w-xl text-5xl font-semibold leading-[1.08] tracking-tight text-foreground xl:text-6xl">
        {title}
         </h1>
         {/* Description */}
         <p className="mt-6 max-w-lg text-lg leading-8 text-muted-foreground">
         {description}
        </p>
        {/* Features */}
        {features && features.length > 0 && (
          <div className="mt-10 space-y-4">
             {features.map((feature) => (
             <div key={feature} className="flex items-center gap-3">
               <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-violet-600 dark:bg-violet-400/10 dark:text-violet-400">
                ✓
               </div>

               <span className="text-sm text-muted-foreground">
               {feature}
               </span>
              </div>
         ))}
    </div>
  )}

      </div>
    </section>
  );
}
