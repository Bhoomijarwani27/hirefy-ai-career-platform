"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "How does Hirefy match me with jobs?",
    answer:
      "Hirefy analyzes your resume, skills, projects, and experience using AI, then recommends jobs that closely match your profile and career goals.",
  },
  {
    question: "Can I improve my resume with AI?",
    answer:
      "Yes. Hirefy provides AI-powered resume analysis, personalized suggestions, and identifies missing skills to help improve your chances of getting interviews.",
  },
  {
    question: "How does AI candidate ranking work?",
    answer:
      "For recruiters, Hirefy compares every applicant against the job requirements and ranks candidates based on skills, experience, education, and overall job fit.",
  },
  {
    question: "Can recruiters contact shortlisted candidates?",
    answer:
      "Yes. Recruiters can shortlist candidates, review their profiles, and connect with them directly through the platform.",
  },
  {
    question: "Is Hirefy free for job seekers?",
    answer:
      "Yes. Job seekers can create resumes, analyze scores, discover jobs, and use AI career assistance for free. Premium features may be introduced in the future.",
  },
  {
    question: "Can I upload my existing resume?",
    answer:
      "Absolutely. Upload your existing PDF resume, and Hirefy will analyze it instantly, generate an analysis, and recommend improvements.",
  },
];

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm transition-all hover:border-indigo-200 dark:hover:border-indigo-800">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="text-base font-semibold text-foreground sm:text-lg">
          {question}
        </span>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
          aria-hidden
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-200 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-5 text-base leading-7 text-muted-foreground">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      id="faq"
      className="bg-muted/30 px-6 py-16 sm:py-20 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-600 dark:text-indigo-400">
            Frequently Asked Questions
          </p>

          <h2 className="mt-4 text-4xl font-bold tracking-tight text-foreground lg:text-6xl">
            Everything you need to know.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Answers to common questions about Hirefy&apos;s AI-powered job
            matching and career development platform.
          </p>
        </div>

        <div className="mx-auto mt-12 flex max-w-3xl flex-col gap-4 lg:mt-16">
          {faqs.map((faq, index) => (
            <FAQItem
              key={faq.question}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() =>
                setOpenIndex(openIndex === index ? null : index)
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
