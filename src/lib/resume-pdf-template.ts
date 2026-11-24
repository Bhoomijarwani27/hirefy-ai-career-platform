import { ResumeData, CoverLetterData } from "./resume-storage";
import {
  generateResumePdfBytes,
  generateCoverLetterPdfBytes,
  downloadPdfDirect,
} from "./pdf-generator";

/**
 * Downloads a Harvard FAS Resume directly as a .pdf file without opening print dialogs
 * or altering the screen size.
 */
export function downloadResumeDirect(
  resume: ResumeData,
  fileName?: string,
  fontFamily: "serif" | "sans" = "serif"
): void {
  const candidateName = resume.contact.fullName || "Candidate";
  const finalName = fileName || `${candidateName.replace(/\s+/g, "_")}_Resume.pdf`;
  const bytes = generateResumePdfBytes(resume, fontFamily);
  downloadPdfDirect(bytes, finalName);
}

/**
 * Downloads a Harvard FAS Cover Letter directly as a .pdf file without opening print dialogs
 * or altering the screen size.
 */
export function downloadCoverLetterDirect(
  cl: CoverLetterData,
  candidateName: string,
  candidateContact: { phone?: string; email?: string; location?: string },
  fileName?: string,
  fontFamily: "serif" | "sans" = "serif"
): void {
  const finalName = fileName || `${candidateName.replace(/\s+/g, "_")}_Cover_Letter.pdf`;
  const bytes = generateCoverLetterPdfBytes(cl, candidateName, candidateContact, fontFamily);
  downloadPdfDirect(bytes, finalName);
}

/**
 * Backward-compatible helper that triggers a direct file download.
 */
export async function downloadDocumentAsPdf(
  htmlContent: string,
  fileName: string
): Promise<void> {
  // If htmlContent is passed, create a Blob from it or direct download
  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = fileName.replace(/\.pdf$/i, ".html");
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    try {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {}
  }, 1000);
}

/**
 * Generates pristine Harvard FAS HTML for standard Letter/A4 resume printing & PDF export.
 */
export function generateResumeHtml(resume: ResumeData, fontFamily: "serif" | "sans" = "serif"): string {
  const name = resume.contact.fullName || "Candidate";
  const contactParts: string[] = [];
  if (resume.contact.location) contactParts.push(resume.contact.location);
  if (resume.contact.phone) contactParts.push(resume.contact.phone);
  if (resume.contact.email) contactParts.push(resume.contact.email);
  if (resume.contact.linkedin) contactParts.push(resume.contact.linkedin.replace(/^https?:\/\/(www\.)?/, ""));
  if (resume.contact.githubOrPortfolio) contactParts.push(resume.contact.githubOrPortfolio.replace(/^https?:\/\/(www\.)?/, ""));

  const fontStack =
    fontFamily === "sans"
      ? "Arial, Helvetica, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      : "Georgia, 'Times New Roman', Times, Cambria, serif";

  let sectionsHtml = "";

  for (const sec of resume.sectionOrder || ["education", "experience", "projects", "skills", "leadership"]) {
    if (sec === "education" && resume.education && resume.education.length > 0 && resume.education.some((e) => e.institution)) {
      const items = resume.education
        .filter((e) => e.institution || e.degree)
        .map(
          (edu) => `
          <div class="entry">
            <div class="row-main">
              <span>${escapeHtml(edu.institution)}</span>
              <span>${escapeHtml(edu.location || "")}</span>
            </div>
            <div class="row-sub">
              <span>${escapeHtml(edu.degree)}${edu.gpa ? ` — GPA: ${escapeHtml(edu.gpa)}` : ""}</span>
              <span>${escapeHtml(edu.graduationDate || "")}</span>
            </div>
            ${edu.details ? `<div class="entry-details">${escapeHtml(edu.details)}</div>` : ""}
          </div>
        `
        )
        .join("");

      sectionsHtml += `
        <div class="section">
          <div class="section-title">Education</div>
          ${items}
        </div>
      `;
    }

    if (sec === "experience" && resume.experience && resume.experience.length > 0 && resume.experience.some((e) => e.role || e.company)) {
      const items = resume.experience
        .filter((e) => e.role || e.company)
        .map(
          (exp) => `
          <div class="entry">
            <div class="row-main">
              <span>${escapeHtml(exp.company)}</span>
              <span>${escapeHtml(exp.location || "")}</span>
            </div>
            <div class="row-sub">
              <span>${escapeHtml(exp.role)}</span>
              <span>${escapeHtml(exp.startDate || "")} – ${escapeHtml(exp.endDate || "Present")}</span>
            </div>
            ${
              exp.bullets && exp.bullets.filter(Boolean).length > 0
                ? `<ul class="bullets">
                    ${exp.bullets.filter(Boolean).map((b) => `<li>${escapeHtml(b)}</li>`).join("")}
                  </ul>`
                : ""
            }
          </div>
        `
        )
        .join("");

      sectionsHtml += `
        <div class="section">
          <div class="section-title">Experience</div>
          ${items}
        </div>
      `;
    }

    if (sec === "projects" && resume.projects && resume.projects.length > 0 && resume.projects.some((p) => p.title)) {
      const items = resume.projects
        .filter((p) => p.title)
        .map(
          (proj) => `
          <div class="entry">
            <div class="row-main">
              <span>${escapeHtml(proj.title)}</span>
              <span class="row-tech">${escapeHtml(proj.techStack || "")}</span>
            </div>
            ${proj.link ? `<div class="entry-link"><a href="${escapeHtml(proj.link)}">${escapeHtml(proj.link.replace(/^https?:\/\//, ""))}</a></div>` : ""}
            ${
              proj.bullets && proj.bullets.filter(Boolean).length > 0
                ? `<ul class="bullets">
                    ${proj.bullets.filter(Boolean).map((b) => `<li>${escapeHtml(b)}</li>`).join("")}
                  </ul>`
                : ""
            }
          </div>
        `
        )
        .join("");

      sectionsHtml += `
        <div class="section">
          <div class="section-title">Projects</div>
          ${items}
        </div>
      `;
    }

    if (sec === "skills" && (resume.skills.technicalLanguages || resume.skills.frameworksAndTools || resume.skills.softSkills)) {
      sectionsHtml += `
        <div class="section">
          <div class="section-title">Skills & Competencies</div>
          ${resume.skills.technicalLanguages ? `<div class="skill-line"><span class="skill-label">Languages: </span>${escapeHtml(resume.skills.technicalLanguages)}</div>` : ""}
          ${resume.skills.frameworksAndTools ? `<div class="skill-line"><span class="skill-label">Frameworks & Tools: </span>${escapeHtml(resume.skills.frameworksAndTools)}</div>` : ""}
          ${resume.skills.softSkills ? `<div class="skill-line"><span class="skill-label">Core Competencies: </span>${escapeHtml(resume.skills.softSkills)}</div>` : ""}
        </div>
      `;
    }

    if (sec === "leadership" && resume.leadership && resume.leadership.length > 0 && resume.leadership.some((l) => l.role || l.organization)) {
      const items = resume.leadership
        .filter((l) => l.role || l.organization)
        .map(
          (lead) => `
          <div class="entry">
            <div class="row-main">
              <span>${escapeHtml(lead.organization)}</span>
              <span>${escapeHtml(lead.date || "")}</span>
            </div>
            <div class="row-sub">
              <span>${escapeHtml(lead.role)}</span>
              <span></span>
            </div>
            ${lead.description ? `<div class="entry-details">${escapeHtml(lead.description)}</div>` : ""}
          </div>
        `
        )
        .join("");

      sectionsHtml += `
        <div class="section">
          <div class="section-title">Leadership & Activities</div>
          ${items}
        </div>
      `;
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(name)} — Resume</title>
  <style>
    @page {
      size: letter portrait;
      margin: 0.5in 0.55in;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background: #ffffff !important;
      color: #111111 !important;
      font-family: ${fontStack};
      font-size: 9.5pt;
      line-height: 1.35;
      padding: 0.45in 0.5in;
      max-width: 8.5in;
      margin: 0 auto;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .header {
      text-align: center;
      border-bottom: 1.5px solid #222222;
      padding-bottom: 7px;
      margin-bottom: 11px;
    }
    .name {
      font-size: 18pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: #050505;
      margin-bottom: 3px;
    }
    .contact-info {
      font-size: 8.8pt;
      color: #333333;
    }
    .section {
      margin-bottom: 11px;
    }
    .section-title {
      font-size: 10pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      border-bottom: 1px solid #333333;
      padding-bottom: 2px;
      margin-bottom: 6px;
      color: #111111;
    }
    .entry {
      margin-bottom: 7px;
    }
    .row-main {
      display: flex;
      justify-content: space-between;
      font-weight: 700;
      font-size: 9.3pt;
      color: #000000;
    }
    .row-sub {
      display: flex;
      justify-content: space-between;
      font-style: italic;
      font-size: 8.8pt;
      color: #333333;
      margin-bottom: 2px;
    }
    .row-tech {
      font-weight: 400;
      font-style: italic;
      font-size: 8.5pt;
      color: #444444;
    }
    .entry-details {
      font-size: 8.5pt;
      color: #444444;
      margin-top: 1px;
    }
    .entry-link a {
      font-size: 8.5pt;
      color: #1d4ed8;
      text-decoration: none;
    }
    ul.bullets {
      list-style-type: disc;
      margin-left: 17px;
      margin-top: 2px;
      font-size: 8.9pt;
      color: #1f1f1f;
    }
    ul.bullets li {
      margin-bottom: 2.5px;
      line-height: 1.32;
    }
    .skill-line {
      font-size: 8.8pt;
      margin-bottom: 2.5px;
      color: #222222;
    }
    .skill-label {
      font-weight: 700;
      color: #111111;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="name">${escapeHtml(name)}</h1>
    <div class="contact-info">${escapeHtml(contactParts.join(" • "))}</div>
  </div>
  ${sectionsHtml}
</body>
</html>`;
}

/**
 * Generates pristine Harvard FAS HTML for Cover Letter printing & export.
 */
export function generateCoverLetterHtml(
  cl: CoverLetterData,
  candidateName: string,
  candidateContact: { phone?: string; email?: string; location?: string },
  fontFamily: "serif" | "sans" = "serif"
): string {
  const fontStack =
    fontFamily === "sans"
      ? "Arial, Helvetica, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      : "Georgia, 'Times New Roman', Times, Cambria, serif";

  const contactLine = [candidateContact.location, candidateContact.phone, candidateContact.email]
    .filter(Boolean)
    .join(" • ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(candidateName)} — Cover Letter</title>
  <style>
    @page {
      size: letter portrait;
      margin: 0.6in 0.65in;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background: #ffffff !important;
      color: #111111 !important;
      font-family: ${fontStack};
      font-size: 10pt;
      line-height: 1.5;
      padding: 0.5in 0.6in;
      max-width: 8.5in;
      margin: 0 auto;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .header {
      border-bottom: 1.5px solid #222222;
      padding-bottom: 8px;
      margin-bottom: 20px;
    }
    .name {
      font-size: 18pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #050505;
      margin-bottom: 3px;
    }
    .contact-info {
      font-size: 9pt;
      color: #333333;
    }
    .meta {
      margin-bottom: 20px;
      font-size: 9.5pt;
      color: #333333;
      line-height: 1.4;
    }
    .salutation {
      font-weight: bold;
      margin-bottom: 14px;
    }
    .paragraph {
      margin-bottom: 14px;
      text-align: justify;
      color: #111111;
    }
    .signoff {
      margin-top: 24px;
    }
    .signoff-name {
      font-weight: bold;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="name">${escapeHtml(candidateName)}</h1>
    <div class="contact-info">${escapeHtml(contactLine)}</div>
  </div>

  <div class="meta">
    <div>${escapeHtml(cl.date)}</div>
    <div style="font-weight: bold; margin-top: 6px;">${escapeHtml(cl.companyName)}</div>
    <div>${escapeHtml(cl.companyLocation)}</div>
  </div>

  <div class="salutation">${escapeHtml(cl.salutation)}</div>
  <div class="paragraph">${escapeHtml(cl.openingParagraph)}</div>
  <div class="paragraph">${escapeHtml(cl.bodyParagraph1)}</div>
  <div class="paragraph">${escapeHtml(cl.bodyParagraph2)}</div>
  <div class="paragraph">${escapeHtml(cl.closingParagraph)}</div>

  <div class="signoff">
    <div>${escapeHtml(cl.signoff)}</div>
    <div class="signoff-name">${escapeHtml(candidateName)}</div>
  </div>
</body>
</html>`;
}



function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
