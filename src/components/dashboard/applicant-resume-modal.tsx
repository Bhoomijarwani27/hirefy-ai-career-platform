"use client";

import { useEffect } from "react";
import { Download, ExternalLink, FileText, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ApplicantDTO } from "@/lib/application-types";
import { downloadResumeDirect } from "@/lib/resume-pdf-template";

interface ApplicantResumeModalProps {
  applicant: ApplicantDTO | null;
  onClose: () => void;
}

export function ApplicantResumeModal({
  applicant,
  onClose,
}: ApplicantResumeModalProps) {
  useEffect(() => {
    if (!applicant) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [applicant, onClose]);

  if (!applicant) return null;

  const rd = applicant.resumeData;

  const handleDownloadPdf = () => {
    if (rd) {
      downloadResumeDirect(
        rd,
        `${applicant.candidateName.replace(/\s+/g, "_")}_Resume.pdf`
      );
      return;
    }
    if (applicant.resumeUrl) {
      window.open(applicant.resumeUrl, "_blank", "noopener,noreferrer");
      return;
    }
    if (applicant.resumeText) {
      const blob = new Blob([applicant.resumeText], {
        type: "text/plain;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${applicant.candidateName.replace(/\s+/g, "_")}_Resume.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-modal-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <FileText className="size-5 shrink-0 text-violet-600" />
            <div className="min-w-0">
              <h2
                id="resume-modal-title"
                className="truncate text-base font-bold text-foreground"
              >
                {applicant.candidateName} — Resume
              </h2>
              <p className="truncate text-xs text-muted-foreground">
                {applicant.candidateEmail}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close resume modal"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-muted/30 p-4 sm:p-6">
          {rd ? (
            <div className="mx-auto max-w-2xl rounded-xl border border-zinc-200 bg-white p-6 text-zinc-900 shadow-xs space-y-5 font-serif">
              <div className="border-b border-zinc-300 pb-3 text-center">
                <h3 className="text-lg font-bold uppercase tracking-wide text-zinc-950">
                  {rd.contact?.fullName || applicant.candidateName}
                </h3>
                <p className="mt-1 text-xs text-zinc-600">
                  {[
                    rd.contact?.location,
                    rd.contact?.phone,
                    rd.contact?.email || applicant.candidateEmail,
                    rd.contact?.linkedin,
                    rd.contact?.githubOrPortfolio,
                  ]
                    .filter(Boolean)
                    .join(" • ")}
                </p>
              </div>

              {rd.education && rd.education.length > 0 && (
                <div>
                  <h4 className="border-b border-zinc-300 pb-1 text-xs font-bold uppercase tracking-wider text-zinc-900">
                    Education
                  </h4>
                  <div className="mt-2 space-y-2 text-xs">
                    {rd.education.map((edu, idx) => (
                      <div key={edu.id || idx}>
                        <div className="flex justify-between font-bold">
                          <span>{edu.institution}</span>
                          <span>{edu.location}</span>
                        </div>
                        <div className="flex justify-between italic text-zinc-700">
                          <span>
                            {edu.degree}
                            {edu.gpa ? ` — GPA: ${edu.gpa}` : ""}
                          </span>
                          <span>{edu.graduationDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {rd.experience && rd.experience.length > 0 && (
                <div>
                  <h4 className="border-b border-zinc-300 pb-1 text-xs font-bold uppercase tracking-wider text-zinc-900">
                    Experience
                  </h4>
                  <div className="mt-2 space-y-3 text-xs">
                    {rd.experience.map((exp, idx) => (
                      <div key={exp.id || idx}>
                        <div className="flex justify-between font-bold">
                          <span>{exp.company}</span>
                          <span>{exp.location}</span>
                        </div>
                        <div className="flex justify-between italic text-zinc-700">
                          <span>{exp.role}</span>
                          <span>
                            {exp.startDate} – {exp.endDate || "Present"}
                          </span>
                        </div>
                        {exp.bullets && exp.bullets.length > 0 && (
                          <ul className="mt-1 list-disc space-y-1 pl-5 text-zinc-800">
                            {exp.bullets.filter(Boolean).map((b, bIdx) => (
                              <li key={bIdx}>{b}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {rd.projects && rd.projects.length > 0 && (
                <div>
                  <h4 className="border-b border-zinc-300 pb-1 text-xs font-bold uppercase tracking-wider text-zinc-900">
                    Projects
                  </h4>
                  <div className="mt-2 space-y-2.5 text-xs">
                    {rd.projects.map((proj, idx) => (
                      <div key={proj.id || idx}>
                        <div className="flex justify-between font-bold">
                          <span>{proj.title}</span>
                          <span className="font-normal italic text-zinc-600">
                            {proj.techStack}
                          </span>
                        </div>
                        {proj.bullets && proj.bullets.length > 0 && (
                          <ul className="mt-1 list-disc space-y-1 pl-5 text-zinc-800">
                            {proj.bullets.filter(Boolean).map((b, bIdx) => (
                              <li key={bIdx}>{b}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(rd.skills?.technicalLanguages ||
                rd.skills?.frameworksAndTools ||
                rd.skills?.softSkills) && (
                <div>
                  <h4 className="border-b border-zinc-300 pb-1 text-xs font-bold uppercase tracking-wider text-zinc-900">
                    Skills
                  </h4>
                  <div className="mt-2 space-y-1 text-xs">
                    {rd.skills.technicalLanguages && (
                      <p>
                        <strong>Languages:</strong>{" "}
                        {rd.skills.technicalLanguages}
                      </p>
                    )}
                    {rd.skills.frameworksAndTools && (
                      <p>
                        <strong>Frameworks &amp; Tools:</strong>{" "}
                        {rd.skills.frameworksAndTools}
                      </p>
                    )}
                    {rd.skills.softSkills && (
                      <p>
                        <strong>Core Competencies:</strong>{" "}
                        {rd.skills.softSkills}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : applicant.resumeText ? (
            <div className="mx-auto max-w-2xl rounded-xl border border-border bg-background p-5 text-xs leading-relaxed whitespace-pre-wrap text-foreground">
              {applicant.resumeText}
            </div>
          ) : (
            <div className="mx-auto max-w-md rounded-xl border border-dashed border-border bg-background p-8 text-center">
              <FileText className="mx-auto size-8 text-muted-foreground" />
              <h3 className="mt-3 text-sm font-bold">
                {applicant.resumeUrl
                  ? "External Resume File Attached"
                  : "No Resume Document Provided"}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {applicant.resumeUrl
                  ? "Open the attached resume link below to view or download."
                  : "This candidate applied using their Hirefy profile details."}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border px-5 py-3.5">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="min-h-10 rounded-xl"
          >
            Close
          </Button>
          {applicant.resumeUrl && (
            <Button
              asChild
              variant="outline"
              className="min-h-10 rounded-xl gap-1.5"
            >
              <a
                href={applicant.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="size-4" />
                <span>Open File</span>
              </a>
            </Button>
          )}
          {(rd || applicant.resumeText || applicant.resumeUrl) && (
            <Button
              type="button"
              onClick={handleDownloadPdf}
              className="min-h-10 rounded-xl bg-violet-600 text-white hover:bg-violet-700 gap-1.5"
            >
              <Download className="size-4" />
              <span>{rd ? "Download PDF" : "Download Resume"}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
