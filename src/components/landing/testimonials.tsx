import { Star , BadgeCheck} from  "lucide-react";

type Testimonial = {
    quote: string;
    name: string;
    role: string;
    company: string;
};

const testimonials: Testimonial[] = [
    {
    quote:
      "Hirefy showed exactly why recruiters were rejecting my resume. After following the AI suggestions, I started getting interview calls within two weeks.",
    name: "Aarav Shah",
    role: "Software Engineer",
    company: "TechCorp",
  },
    {
    quote:
      "Candidate ranking saved our hiring team hours every week. We now interview the best-fit applicants first instead of reading every resume.",
    name: "Sarah W.",
    role: "Talent Acquisition Manager",
    company: "TechNova",
  },
    {
      quote:
      "The AI skill gap analysis showed exactly what I was missing. I focused on those skills and received my first internship offer.",
    name: "Rahul P.",
    role: "Intern",
    company: "InnovateX",
  },
];

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
    return (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md">
           {/* stars */}
            <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-current" />
                ))}
            </div>
                {/* quote */}
                <p className="mt-6 text-base leading-7 text-foreground">
                    "{testimonial.quote}"
                </p>

                {/* Divider */}
                <div className="my-8 h-px bg-border" />

                {/* User Info */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex  h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-violet-500 text-lg font-bold text-white">
                            {testimonial.name.charAt(0)}
                        </div>

                        <div>
                          <h4 className="font-semibold text-foreground">
                           {testimonial.name}
                           </h4>

                            <p className="text-sm text-muted-foreground">
                            {testimonial.role} • {testimonial.company}
                             </p>
                         </div>
                     </div>

                     <BadgeCheck className="h-5 w-5 text-indigo-500"/>
                    </div>
        </div>
    );
}

export function Testimonials() {
  return (
    <section className="bg-background px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Heading */}

        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-600">
            Loved by Job Seekers & Recruiters
          </p>

          <h2 className="mt-4 text-4xl font-abold tracking-tight text-foreground lg:text-6xl">
            A career platform
            <br />
            that delivers results.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Real stories from people who found jobs faster and hired smarter
            with Hirefy.
          </p>
        </div>

        {/* Cards */}

        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial.name}
              testimonial={testimonial}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
        



