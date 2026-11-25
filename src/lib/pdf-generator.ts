import { ResumeData, CoverLetterData } from "./resume-storage";

// Standard character width lookup table for 1000-unit Type 1 fonts
const CHAR_WIDTHS_TIMES: Record<string, number> = {
  " ": 250, "!": 333, '"': 408, "#": 500, "$": 500, "%": 833, "&": 778, "'": 333,
  "(": 333, ")": 333, "*": 500, "+": 564, ",": 250, "-": 333, ".": 250, "/": 278,
  ":": 278, ";": 278, "<": 564, "=": 564, ">": 564, "?": 444, "@": 921,
  "A": 722, "B": 667, "C": 667, "D": 722, "E": 611, "F": 556, "G": 722, "H": 722,
  "I": 333, "J": 389, "K": 722, "L": 611, "M": 889, "N": 722, "O": 722, "P": 556,
  "Q": 722, "R": 667, "S": 556, "T": 611, "U": 722, "V": 722, "W": 944, "X": 722,
  "Y": 722, "Z": 611, "[": 333, "\\": 278, "]": 333, "^": 469, "_": 500, "`": 333,
  "a": 444, "b": 500, "c": 444, "d": 500, "e": 444, "f": 278, "g": 500, "h": 500,
  "i": 278, "j": 278, "k": 444, "l": 278, "m": 778, "n": 500, "o": 500, "p": 500,
  "q": 500, "r": 333, "s": 389, "t": 278, "u": 500, "v": 500, "w": 722, "x": 500,
  "y": 500, "z": 444, "{": 348, "|": 200, "}": 348, "~": 541,
  "0": 500, "1": 500, "2": 500, "3": 500, "4": 500, "5": 500, "6": 500, "7": 500,
  "8": 500, "9": 500,
};

function getCharWidth(ch: string, isBold: boolean): number {
  const base = CHAR_WIDTHS_TIMES[ch] ?? 500;
  return isBold ? Math.round(base * 1.08) : base;
}

export function measureTextWidth(text: string, fontSize: number, isBold: boolean = false): number {
  let total = 0;
  for (let i = 0; i < text.length; i++) {
    total += getCharWidth(text[i], isBold);
  }
  return (total * fontSize) / 1000;
}

export function wrapText(text: string, maxWidth: number, fontSize: number, isBold: boolean = false): string[] {
  if (!text) return [];
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const w = measureTextWidth(testLine, fontSize, isBold);
    if (w <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function escapePdfString(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/•/g, "\\225")
    .replace(/—/g, "\\227")
    .replace(/–/g, "\\226")
    .replace(/“/g, '"')
    .replace(/”/g, '"')
    .replace(/‘/g, "'")
    .replace(/’/g, "'");
}

/**
 * Pure zero-dependency PDF 1.4 Vector Writer.
 * Generates pristine, crisp, ATS-friendly vector PDF bytes with zero external dependencies.
 */
class SimplePdfWriter {
  private fontFam: "serif" | "sans";
  private pageStreams: string[] = [];
  private currentStream: string = "";

  constructor(fontFamily: "serif" | "sans" = "serif") {
    this.fontFam = fontFamily;
    this.addPage();
  }

  public addPage(): void {
    if (this.currentStream) {
      this.pageStreams.push(this.currentStream);
    }
    this.currentStream = "";
  }

  public drawText(
    text: string,
    x: number,
    y: number,
    opts: {
      font?: "F1" | "F2" | "F3" | "F4";
      size?: number;
      align?: "left" | "center" | "right";
      color?: [number, number, number];
    } = {}
  ): void {
    if (!text) return;
    const font = opts.font || "F1";
    const size = opts.size || 9.5;
    const align = opts.align || "left";
    const isBold = font === "F2" || font === "F4";
    const color = opts.color || [0.08, 0.08, 0.08];

    let startX = x;
    if (align === "center") {
      const w = measureTextWidth(text, size, isBold);
      startX = x - w / 2;
    } else if (align === "right") {
      const w = measureTextWidth(text, size, isBold);
      startX = x - w;
    }

    const escaped = escapePdfString(text);
    const r = color[0].toFixed(3);
    const g = color[1].toFixed(3);
    const b = color[2].toFixed(3);

    this.currentStream += `BT\n/${font} ${size.toFixed(1)} Tf\n${r} ${g} ${b} rg\n1 0 0 1 ${startX.toFixed(2)} ${y.toFixed(2)} Tm\n(${escaped}) Tj\nET\n`;
  }

  public drawLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    lineWidth: number = 0.5,
    color: [number, number, number] = [0.2, 0.2, 0.2]
  ): void {
    const r = color[0].toFixed(3);
    const g = color[1].toFixed(3);
    const b = color[2].toFixed(3);
    this.currentStream += `${lineWidth.toFixed(2)} w\n${r} ${g} ${b} RG\n${x1.toFixed(2)} ${y1.toFixed(2)} m\n${x2.toFixed(2)} ${y2.toFixed(2)} l\nS\n`;
  }

  public build(): Uint8Array {
    if (this.currentStream) {
      this.pageStreams.push(this.currentStream);
    }
    const pagesCount = this.pageStreams.length;

    const baseFont = this.fontFam === "sans" ? "Helvetica" : "Times-Roman";
    const boldFont = this.fontFam === "sans" ? "Helvetica-Bold" : "Times-Bold";
    const italicFont = this.fontFam === "sans" ? "Helvetica-Oblique" : "Times-Italic";
    const boldItalicFont = this.fontFam === "sans" ? "Helvetica-BoldOblique" : "Times-BoldItalic";

    let pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
    const offsets: number[] = [];

    // Helper to add an object
    const addObject = (content: string): number => {
      offsets.push(new TextEncoder().encode(pdf).length);
      const objId = offsets.length;
      pdf += `${objId} 0 obj\n${content}\nendobj\n`;
      return objId;
    };

    // Object 1: Catalog
    addObject("<< /Type /Catalog /Pages 2 0 R >>");

    // Pre-calculate page object IDs
    // Obj 2 is Pages root
    // Obj 3 is Font resources
    // Obj 4.. is Page 1, Stream 1, Page 2, Stream 2...
    const pageObjIds: number[] = [];
    for (let i = 0; i < pagesCount; i++) {
      pageObjIds.push(4 + i * 2);
    }

    // Object 2: Pages root
    addObject(`<< /Type /Pages /Kids [${pageObjIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pagesCount} >>`);

    // Object 3: Fonts Dictionary
    addObject(`<<
  /Font <<
    /F1 << /Type /Font /Subtype /Type1 /BaseFont /${baseFont} /Encoding /WinAnsiEncoding >>
    /F2 << /Type /Font /Subtype /Type1 /BaseFont /${boldFont} /Encoding /WinAnsiEncoding >>
    /F3 << /Type /Font /Subtype /Type1 /BaseFont /${italicFont} /Encoding /WinAnsiEncoding >>
    /F4 << /Type /Font /Subtype /Type1 /BaseFont /${boldItalicFont} /Encoding /WinAnsiEncoding >>
  >>
>>`);

    // Create Page objects & Content Streams
    for (let i = 0; i < pagesCount; i++) {
      const streamContent = this.pageStreams[i];
      const streamBytes = new TextEncoder().encode(streamContent);
      const streamLength = streamBytes.length;
      const streamObjId = 4 + i * 2 + 1;

      // Page Object
      addObject(`<<
  /Type /Page
  /Parent 2 0 R
  /MediaBox [0 0 612 792]
  /Resources 3 0 R
  /Contents ${streamObjId} 0 R
>>`);

      // Stream Object
      addObject(`<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream`);
    }

    // XREF Table
    const startXref = new TextEncoder().encode(pdf).length;
    const totalObjects = offsets.length;

    pdf += `xref\n0 ${totalObjects + 1}\n0000000000 65535 f \n`;
    for (let i = 0; i < totalObjects; i++) {
      const off = offsets[i].toString().padStart(10, "0");
      pdf += `${off} 00000 n \n`;
    }

    pdf += `trailer\n<<\n  /Size ${totalObjects + 1}\n  /Root 1 0 R\n>>\nstartxref\n${startXref}\n%%EOF\n`;

    return new TextEncoder().encode(pdf);
  }
}

/**
 * Generates a Harvard FAS Standard 8.5" x 11" PDF from ResumeData.
 */
export function generateResumePdfBytes(resume: ResumeData, fontFamily: "serif" | "sans" = "serif"): Uint8Array {
  const writer = new SimplePdfWriter(fontFamily);

  let y = 756;
  const leftX = 36;
  const rightX = 576;
  const contentWidth = 540;
  const bottomMargin = 45;

  const ensureSpace = (needed: number) => {
    if (y - needed < bottomMargin) {
      writer.addPage();
      y = 756;
    }
  };

  // 1. Header: Candidate Name
  const name = resume.contact.fullName || "Candidate";
  writer.drawText(name.toUpperCase(), 306, y, {
    font: "F2",
    size: 18,
    align: "center",
    color: [0.03, 0.03, 0.03],
  });
  y -= 15;

  // Contact line
  const contactParts: string[] = [];
  if (resume.contact.location) contactParts.push(resume.contact.location);
  if (resume.contact.phone) contactParts.push(resume.contact.phone);
  if (resume.contact.email) contactParts.push(resume.contact.email);
  if (resume.contact.linkedin) contactParts.push(resume.contact.linkedin.replace(/^https?:\/\/(www\.)?/, ""));
  if (resume.contact.githubOrPortfolio) contactParts.push(resume.contact.githubOrPortfolio.replace(/^https?:\/\/(www\.)?/, ""));

  if (contactParts.length > 0) {
    const contactStr = contactParts.join(" • ");
    writer.drawText(contactStr, 306, y, {
      font: "F1",
      size: 8.8,
      align: "center",
      color: [0.2, 0.2, 0.2],
    });
    y -= 10;
  }

  // Header bottom border line
  writer.drawLine(leftX, y, rightX, y, 1.2, [0.1, 0.1, 0.1]);
  y -= 13;

  // 2. Sections
  const sectionOrder = resume.sectionOrder || ["education", "experience", "projects", "skills", "leadership"];

  for (const sec of sectionOrder) {
    if (sec === "education" && resume.education && resume.education.length > 0 && resume.education.some((e) => e.institution || e.degree)) {
      ensureSpace(40);
      // Section Header
      writer.drawText("EDUCATION", leftX, y, { font: "F2", size: 9.8, color: [0.05, 0.05, 0.05] });
      y -= 3;
      writer.drawLine(leftX, y, rightX, y, 0.6, [0.25, 0.25, 0.25]);
      y -= 11;

      for (const edu of resume.education) {
        if (!edu.institution && !edu.degree) continue;
        ensureSpace(28);

        // Row 1: Institution (Bold) & Location (Regular)
        if (edu.institution) {
          writer.drawText(edu.institution, leftX, y, { font: "F2", size: 9.2, color: [0.05, 0.05, 0.05] });
        }
        if (edu.location) {
          writer.drawText(edu.location, rightX, y, { font: "F1", size: 8.8, align: "right", color: [0.2, 0.2, 0.2] });
        }
        y -= 11;

        // Row 2: Degree + GPA (Italic) & Graduation Date (Regular)
        const degText = `${edu.degree || ""}${edu.gpa ? ` — GPA: ${edu.gpa}` : ""}`;
        if (degText) {
          writer.drawText(degText, leftX, y, { font: "F3", size: 8.8, color: [0.2, 0.2, 0.2] });
        }
        if (edu.graduationDate) {
          writer.drawText(edu.graduationDate, rightX, y, { font: "F1", size: 8.8, align: "right", color: [0.2, 0.2, 0.2] });
        }
        y -= 10;

        // Details
        if (edu.details) {
          const detailLines = wrapText(edu.details, contentWidth, 8.2, false);
          for (const dLine of detailLines) {
            ensureSpace(12);
            writer.drawText(dLine, leftX, y, { font: "F1", size: 8.2, color: [0.25, 0.25, 0.25] });
            y -= 9.5;
          }
        }
        y -= 3;
      }
      y -= 5;
    }

    if (sec === "experience" && resume.experience && resume.experience.length > 0 && resume.experience.some((e) => e.role || e.company)) {
      ensureSpace(45);
      // Section Header
      writer.drawText("EXPERIENCE", leftX, y, { font: "F2", size: 9.8, color: [0.05, 0.05, 0.05] });
      y -= 3;
      writer.drawLine(leftX, y, rightX, y, 0.6, [0.25, 0.25, 0.25]);
      y -= 11;

      for (const exp of resume.experience) {
        if (!exp.role && !exp.company) continue;
        ensureSpace(32);

        // Row 1: Company (Bold) & Location (Regular)
        if (exp.company) {
          writer.drawText(exp.company, leftX, y, { font: "F2", size: 9.2, color: [0.05, 0.05, 0.05] });
        }
        if (exp.location) {
          writer.drawText(exp.location, rightX, y, { font: "F1", size: 8.8, align: "right", color: [0.2, 0.2, 0.2] });
        }
        y -= 11;

        // Row 2: Role (Italic) & Dates (Regular)
        if (exp.role) {
          writer.drawText(exp.role, leftX, y, { font: "F3", size: 8.8, color: [0.2, 0.2, 0.2] });
        }
        const dateStr = `${exp.startDate || ""} – ${exp.endDate || "Present"}`.trim();
        if (dateStr && dateStr !== "–") {
          writer.drawText(dateStr, rightX, y, { font: "F1", size: 8.5, align: "right", color: [0.25, 0.25, 0.25] });
        }
        y -= 10;

        // Bullets
        if (exp.bullets && exp.bullets.length > 0) {
          for (const bullet of exp.bullets) {
            if (!bullet?.trim()) continue;
            const bulletLines = wrapText(bullet, 520, 8.6, false);
            if (bulletLines.length === 0) continue;

            ensureSpace(12);
            // Draw bullet marker
            writer.drawText("•", leftX + 8, y, { font: "F1", size: 8.6, color: [0.15, 0.15, 0.15] });
            // Draw first line with hanging indent
            writer.drawText(bulletLines[0], leftX + 16, y, { font: "F1", size: 8.6, color: [0.15, 0.15, 0.15] });
            y -= 10.5;

            // Subsequent lines
            for (let lIdx = 1; lIdx < bulletLines.length; lIdx++) {
              ensureSpace(12);
              writer.drawText(bulletLines[lIdx], leftX + 16, y, { font: "F1", size: 8.6, color: [0.15, 0.15, 0.15] });
              y -= 10.5;
            }
          }
        }
        y -= 3;
      }
      y -= 5;
    }

    if (sec === "projects" && resume.projects && resume.projects.length > 0 && resume.projects.some((p) => p.title)) {
      ensureSpace(45);
      // Section Header
      writer.drawText("PROJECTS", leftX, y, { font: "F2", size: 9.8, color: [0.05, 0.05, 0.05] });
      y -= 3;
      writer.drawLine(leftX, y, rightX, y, 0.6, [0.25, 0.25, 0.25]);
      y -= 11;

      for (const proj of resume.projects) {
        if (!proj.title) continue;
        ensureSpace(28);

        // Row 1: Title (Bold) & Tech Stack (Italic)
        writer.drawText(proj.title, leftX, y, { font: "F2", size: 9.2, color: [0.05, 0.05, 0.05] });
        if (proj.techStack) {
          writer.drawText(proj.techStack, rightX, y, { font: "F3", size: 8.5, align: "right", color: [0.25, 0.25, 0.25] });
        }
        y -= 11;

        if (proj.link) {
          writer.drawText(proj.link, leftX, y, { font: "F1", size: 8.2, color: [0.12, 0.35, 0.8] });
          y -= 9.5;
        }

        // Bullets
        if (proj.bullets && proj.bullets.length > 0) {
          for (const bullet of proj.bullets) {
            if (!bullet?.trim()) continue;
            const bulletLines = wrapText(bullet, 520, 8.6, false);
            if (bulletLines.length === 0) continue;

            ensureSpace(12);
            writer.drawText("•", leftX + 8, y, { font: "F1", size: 8.6, color: [0.15, 0.15, 0.15] });
            writer.drawText(bulletLines[0], leftX + 16, y, { font: "F1", size: 8.6, color: [0.15, 0.15, 0.15] });
            y -= 10.5;

            for (let lIdx = 1; lIdx < bulletLines.length; lIdx++) {
              ensureSpace(12);
              writer.drawText(bulletLines[lIdx], leftX + 16, y, { font: "F1", size: 8.6, color: [0.15, 0.15, 0.15] });
              y -= 10.5;
            }
          }
        }
        y -= 3;
      }
      y -= 5;
    }

    if (sec === "skills" && (resume.skills.technicalLanguages || resume.skills.frameworksAndTools || resume.skills.softSkills)) {
      ensureSpace(45);
      // Section Header
      writer.drawText("SKILLS & COMPETENCIES", leftX, y, { font: "F2", size: 9.8, color: [0.05, 0.05, 0.05] });
      y -= 3;
      writer.drawLine(leftX, y, rightX, y, 0.6, [0.25, 0.25, 0.25]);
      y -= 11;

      const renderSkillLine = (label: string, items: string) => {
        if (!items?.trim()) return;
        ensureSpace(14);
        const full = `${label}: ${items}`;
        const lines = wrapText(full, contentWidth, 8.8, false);
        for (let lIdx = 0; lIdx < lines.length; lIdx++) {
          ensureSpace(12);
          if (lIdx === 0) {
            const labelWidth = measureTextWidth(`${label}: `, 8.8, true);
            writer.drawText(`${label}: `, leftX, y, { font: "F2", size: 8.8, color: [0.08, 0.08, 0.08] });
            const rest = lines[0].substring(`${label}: `.length);
            writer.drawText(rest, leftX + labelWidth, y, { font: "F1", size: 8.8, color: [0.18, 0.18, 0.18] });
          } else {
            writer.drawText(lines[lIdx], leftX, y, { font: "F1", size: 8.8, color: [0.18, 0.18, 0.18] });
          }
          y -= 11;
        }
      };

      if (resume.skills.technicalLanguages) renderSkillLine("Languages", resume.skills.technicalLanguages);
      if (resume.skills.frameworksAndTools) renderSkillLine("Frameworks & Tools", resume.skills.frameworksAndTools);
      if (resume.skills.softSkills) renderSkillLine("Core Competencies", resume.skills.softSkills);
      y -= 5;
    }

    if (sec === "leadership" && resume.leadership && resume.leadership.length > 0 && resume.leadership.some((l) => l.role || l.organization)) {
      ensureSpace(40);
      // Section Header
      writer.drawText("LEADERSHIP & ACTIVITIES", leftX, y, { font: "F2", size: 9.8, color: [0.05, 0.05, 0.05] });
      y -= 3;
      writer.drawLine(leftX, y, rightX, y, 0.6, [0.25, 0.25, 0.25]);
      y -= 11;

      for (const lead of resume.leadership) {
        if (!lead.role && !lead.organization) continue;
        ensureSpace(25);

        if (lead.organization) {
          writer.drawText(lead.organization, leftX, y, { font: "F2", size: 9.2, color: [0.05, 0.05, 0.05] });
        }
        if (lead.date) {
          writer.drawText(lead.date, rightX, y, { font: "F1", size: 8.8, align: "right", color: [0.2, 0.2, 0.2] });
        }
        y -= 11;

        if (lead.role) {
          writer.drawText(lead.role, leftX, y, { font: "F3", size: 8.8, color: [0.2, 0.2, 0.2] });
          y -= 10;
        }

        if (lead.description) {
          const lines = wrapText(lead.description, contentWidth, 8.5, false);
          for (const line of lines) {
            ensureSpace(12);
            writer.drawText(line, leftX, y, { font: "F1", size: 8.5, color: [0.25, 0.25, 0.25] });
            y -= 10;
          }
        }
        y -= 3;
      }
      y -= 5;
    }
  }

  return writer.build();
}

/**
 * Generates Harvard FAS Standard 8.5" x 11" PDF from CoverLetterData.
 */
export function generateCoverLetterPdfBytes(
  cl: CoverLetterData,
  candidateName: string,
  candidateContact: { phone?: string; email?: string; location?: string },
  fontFamily: "serif" | "sans" = "serif"
): Uint8Array {
  const writer = new SimplePdfWriter(fontFamily);

  let y = 746;
  const leftX = 40;
  const rightX = 572;
  const contentWidth = 532;

  // Header: Candidate Name
  writer.drawText(candidateName.toUpperCase(), leftX, y, {
    font: "F2",
    size: 18,
    color: [0.03, 0.03, 0.03],
  });
  y -= 15;

  // Contact info
  const contactParts = [candidateContact.location, candidateContact.phone, candidateContact.email].filter(Boolean);
  if (contactParts.length > 0) {
    writer.drawText(contactParts.join(" • "), leftX, y, {
      font: "F1",
      size: 9,
      color: [0.25, 0.25, 0.25],
    });
    y -= 10;
  }

  // Header line
  writer.drawLine(leftX, y, rightX, y, 1.2, [0.1, 0.1, 0.1]);
  y -= 22;

  // Metadata: Date, Recipient & Company
  if (cl.date) {
    writer.drawText(cl.date, leftX, y, { font: "F1", size: 9.5, color: [0.2, 0.2, 0.2] });
    y -= 14;
  }
  if (cl.companyName) {
    writer.drawText(cl.companyName, leftX, y, { font: "F2", size: 9.5, color: [0.05, 0.05, 0.05] });
    y -= 12;
  }
  if (cl.companyLocation) {
    writer.drawText(cl.companyLocation, leftX, y, { font: "F1", size: 9.5, color: [0.25, 0.25, 0.25] });
    y -= 14;
  }
  y -= 6;

  // Salutation
  if (cl.salutation) {
    writer.drawText(cl.salutation, leftX, y, { font: "F2", size: 9.8, color: [0.05, 0.05, 0.05] });
    y -= 16;
  }

  // Body Paragraphs
  const paragraphs = [cl.openingParagraph, cl.bodyParagraph1, cl.bodyParagraph2, cl.closingParagraph].filter(Boolean);

  for (const para of paragraphs) {
    const lines = wrapText(para, contentWidth, 9.5, false);
    for (const line of lines) {
      if (y < 45) {
        writer.addPage();
        y = 746;
      }
      writer.drawText(line, leftX, y, { font: "F1", size: 9.5, color: [0.1, 0.1, 0.1] });
      y -= 14;
    }
    y -= 8;
  }

  // Signoff
  y -= 6;
  if (y < 65) {
    writer.addPage();
    y = 746;
  }
  writer.drawText(cl.signoff || "Sincerely,", leftX, y, { font: "F1", size: 9.5, color: [0.1, 0.1, 0.1] });
  y -= 22;
  writer.drawText(candidateName, leftX, y, { font: "F2", size: 10, color: [0.05, 0.05, 0.05] });

  return writer.build();
}

/**
 * Triggers an immediate, direct file download of a PDF in the browser.
 * NEVER opens the print dialog. NEVER shrinks or touches the viewport/DOM.
 */
export function downloadPdfDirect(pdfBytes: Uint8Array, fileName: string): void {
  if (typeof window === "undefined") return;

  const cleanName = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.style.display = "none";
  anchor.href = url;
  anchor.download = cleanName;

  document.body.appendChild(anchor);
  anchor.click();

  setTimeout(() => {
    try {
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch {}
  }, 1000);
}
