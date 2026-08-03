import Link from "next/link";
import {

  Link as LinkIcon,
  Mail,
  Briefcase,
} from "lucide-react";

const product = [
  "Resume Builder",
  "AI Resume Analysis",
  "Job Matching",
  "Candidate Ranking",
  "Company Dashboard",
];

const seekers = [
  "Browse Jobs",
  "Resume Studio",
  "AI Career Chat",
  "Application Tracker",
  "Saved Jobs",
];

const companies = [
  "Post a Job",
  "Manage Applicants",
  "Candidate Ranking",
  "Hiring Analytics",
  "Interview Pipeline",
];

const support = [
  "FAQ",
  "Contact",
  "Privacy Policy",
  "Terms of Service",
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">

        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">

          {/* Brand */}

          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-cyan-400 text-white">
                <Briefcase className="h-5 w-5" />
              </div>

              <span className="text-2xl font-bold text-foreground">
                Hirefy
              </span>
            </div>

            <p className="mt-5 max-w-sm text-muted-foreground leading-7">
              AI-powered career platform helping job seekers build stronger
              resumes and helping recruiters hire the best candidates faster.
            </p>

            <div className="mt-6 flex gap-3">

              <button className="rounded-xl border border-border p-3 transition hover:bg-muted">
                <LinkIcon className="h-5 w-5" />
              </button>

              <button className="rounded-xl border border-border p-3 transition hover:bg-muted">
                <LinkIcon className="h-5 w-5" />
              </button>

              <button className="rounded-xl border border-border p-3 transition hover:bg-muted">
                <Mail className="h-5 w-5" />
              </button>

            </div>
          </div>

          {/* Product */}

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Product
            </h3>

            <ul className="mt-5 space-y-3">
              {product.map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-muted-foreground transition hover:text-foreground"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Job Seekers */}

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Job Seekers
            </h3>

            <ul className="mt-5 space-y-3">
              {seekers.map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-muted-foreground transition hover:text-foreground"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Companies */}

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Companies
            </h3>

            <ul className="mt-5 space-y-3">
              {companies.map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-muted-foreground transition hover:text-foreground"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Support
            </h3>

            <ul className="mt-5 space-y-3">
              {support.map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-muted-foreground transition hover:text-foreground"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom */}

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-sm text-muted-foreground md:flex-row">

          <p>
            © 2026 Hirefy. All rights reserved.
          </p>

          <p>
            Built with Next.js • Tailwind CSS • AI
          </p>

        </div>
      </div>
    </footer>
  );
}