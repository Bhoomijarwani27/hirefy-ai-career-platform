"use client";

export interface ResumeOption {
  id?: string;
  name: string;
  ats: number;
  years: string;
  skillsCount: number;
  updated: string;
  knownSkills: string[];
  candidateName?: string;
  rawResumeData?: ResumeData;
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  location: string;
  graduationDate: string;
  gpa?: string;
  details?: string;
}

export interface ExperienceEntry {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface ProjectEntry {
  id: string;
  title: string;
  techStack: string;
  link?: string;
  bullets: string[];
}

export interface ResumeData {
  id: string;
  title: string;
  fontFamily: "serif" | "sans";
  contact: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    githubOrPortfolio: string;
  };
  sectionOrder: Array<"education" | "experience" | "projects" | "skills" | "leadership">;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  skills: {
    technicalLanguages: string;
    frameworksAndTools: string;
    softSkills: string;
  };
  leadership: Array<{
    id: string;
    role: string;
    organization: string;
    date: string;
    description: string;
  }>;
}

export interface CoverLetterData {
  recipientName: string;
  recipientTitle: string;
  companyName: string;
  companyLocation: string;
  date: string;
  roleTarget: string;
  salutation: string;
  openingParagraph: string;
  bodyParagraph1: string;
  bodyParagraph2: string;
  closingParagraph: string;
  signoff: string;
}

const STORAGE_KEY = "hirefy_saved_resumes_v3";
const ACTIVE_RESUME_KEY = "hirefy_active_resume_key_v3";
export const SLOTS_STORAGE_KEY = "hirefy_resume_slots_v5";
export const ACTIVE_SLOT_KEY = "hirefy_active_slot_id_v5";

export const COVER_LETTER_SLOTS_KEY = "hirefy_cover_letter_slots_v1";
export const ACTIVE_COVER_LETTER_SLOT_KEY = "hirefy_active_cover_letter_slot_v1";

export type ResumeSlotId = "slot-1" | "slot-2" | "slot-3";

export interface ResumeSlot {
  slotId: ResumeSlotId;
  slotNumber: number;
  title: string;
  targetRole?: string;
  updatedLabel: string;
  isPrimary?: boolean;
  resume: ResumeOption | null;
}

export type CoverLetterSlotId = "cl-slot-1" | "cl-slot-2" | "cl-slot-3";

export interface CoverLetterSlot {
  slotId: CoverLetterSlotId;
  slotNumber: number;
  title: string;
  companyName: string;
  targetRole: string;
  updatedLabel: string;
  isPrimary?: boolean;
  data: CoverLetterData | null;
}

export function createBlankResume(userName?: string, userEmail?: string): ResumeData {
  return {
    id: `resume-${Date.now()}`,
    title: `${userName || "My"} — Resume`,
    fontFamily: "serif",
    contact: {
      fullName: userName || "",
      email: userEmail || "",
      phone: "",
      location: "",
      linkedin: "",
      githubOrPortfolio: "",
    },
    sectionOrder: ["education", "experience", "projects", "skills", "leadership"],
    education: [
      {
        id: "edu-1",
        institution: "",
        degree: "",
        location: "",
        graduationDate: "",
        gpa: "",
        details: "",
      },
    ],
    experience: [
      {
        id: "exp-1",
        role: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "Present",
        bullets: [""],
      },
    ],
    projects: [],
    skills: {
      technicalLanguages: "",
      frameworksAndTools: "",
      softSkills: "",
    },
    leadership: [],
  };
}

// Official Harvard FAS Career Services sample format for reference
export const HARVARD_FAS_OFFICIAL_SAMPLE: ResumeData = {
  id: "harvard-official-sample",
  title: "Harvard FAS Benchmark Resume",
  fontFamily: "serif",
  contact: {
    fullName: "Alex R. Morgan",
    email: "amorgan@college.harvard.edu",
    phone: "(617) 495-1000",
    location: "Cambridge, MA",
    linkedin: "linkedin.com/in/alexmorgan",
    githubOrPortfolio: "github.com/alexmorgan",
  },
  sectionOrder: ["education", "experience", "projects", "skills", "leadership"],
  education: [
    {
      id: "edu-sample-1",
      institution: "Harvard University",
      degree: "Bachelor of Arts (A.B.) in Applied Mathematics & Economics",
      location: "Cambridge, MA",
      graduationDate: "May 2025",
      gpa: "3.85 / 4.0",
      details: "Relevant Coursework: Multivariable Calculus, Econometrics, Algorithms, Data Science, Corporate Finance.",
    },
  ],
  experience: [
    {
      id: "exp-sample-1",
      role: "Summer Research Analyst",
      company: "Harvard Institute for Quantitative Social Science",
      location: "Cambridge, MA",
      startDate: "Jun 2024",
      endDate: "Aug 2024",
      bullets: [
        "Synthesized longitudinal survey datasets spanning 45,000+ respondents using Python and R, isolating key causal variance indicators.",
        "Engineered automated data cleaning pipelines, accelerating exploratory analysis turnaround time by 35% for faculty researchers.",
        "Co-authored technical research memorandum presented to department chairs, resulting in expanded grant allocation for computational modeling.",
      ],
    },
    {
      id: "exp-sample-2",
      role: "Operations & Strategy Intern",
      company: "Beacon Health Analytics",
      location: "Boston, MA",
      startDate: "Jun 2023",
      endDate: "Aug 2023",
      bullets: [
        "Constructed financial sensitivity models in Excel and SQL across 8 client accounts, forecasting $1.4M in potential resource savings.",
        "Conducted competitive benchmarking across 12 digital health providers, informing executive recommendations for Q4 product roadmap.",
      ],
    },
  ],
  projects: [
    {
      id: "proj-sample-1",
      title: "Algorithmic Portfolio Risk Optimizer",
      techStack: "Python, Pandas, NumPy, Streamlit",
      link: "github.com/alexmorgan/portfolio-risk",
      bullets: [
        "Developed Monte Carlo simulation tool evaluating Value at Risk (VaR) across multi-asset portfolios over 10,000 randomized iterations.",
        "Designed interactive visualization dashboard enabling users to stress-test historical drawdown scenarios during market volatility.",
      ],
    },
  ],
  skills: {
    technicalLanguages: "Python, SQL, R, JavaScript, TypeScript, Stata",
    frameworksAndTools: "Git, Pandas, NumPy, Tableau, Excel (VBA/Financial Modeling), Docker",
    softSkills: "Quantitative Research, Cross-functional Communication, Statistical Analysis, Problem Solving",
  },
  leadership: [
    {
      id: "lead-sample-1",
      role: "Treasurer & Executive Board Member",
      organization: "Harvard Undergraduate Economics Association",
      date: "Sep 2023 – Present",
      description: "Administer annual budget of $28,000; organized guest lecture series featuring 6 industry chief economists with 300+ attendees.",
    },
  ],
};

export const HARVARD_COVER_LETTER_SAMPLE: CoverLetterData = {
  recipientName: "Hiring Manager",
  recipientTitle: "Operations Search Committee",
  companyName: "Beacon Health Analytics",
  companyLocation: "Boston, MA",
  date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
  roleTarget: "Operations & Strategy Analyst",
  salutation: "Dear Beacon Health Analytics Hiring Team,",
  openingParagraph:
    "I am writing to express my enthusiastic interest in the Operations & Strategy Analyst position at Beacon Health Analytics. With my foundation in quantitative economics from Harvard University and proven experience in data analysis, I have developed a rigorous, results-oriented approach that aligns directly with your team's commitment to analytical excellence.",
  bodyParagraph1:
    "Throughout my academic and professional training, I have prioritized solving complex operational challenges. In my previous role at the Harvard Institute for Quantitative Social Science, I synthesized longitudinal datasets across 45,000+ respondents and engineered automated data cleaning pipelines that accelerated research turnaround by 35%.",
  bodyParagraph2:
    "What excites me most about Beacon Health Analytics is your forward-thinking mission and standard of excellence. My competencies in Python, SQL, financial sensitivity modeling, and cross-functional communication align seamlessly with your priorities, and I look forward to contributing immediately to your upcoming deliverables.",
  closingParagraph:
    "Thank you for your time and consideration. I would welcome the opportunity to discuss how my qualifications, technical skills, and commitment to quality can benefit Beacon Health Analytics. I look forward to the possibility of an interview.",
  signoff: "Sincerely,",
};

export function createSampleCoverLetter(
  candidateName?: string,
  role = "Software Engineer",
  company = "Target Company"
): CoverLetterData {
  return {
    recipientName: "Hiring Manager",
    recipientTitle: "Recruiting Committee",
    companyName: company,
    companyLocation: "San Francisco, CA",
    date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    roleTarget: role,
    salutation: `Dear ${company} Hiring Team,`,
    openingParagraph: `I am writing to express my enthusiastic interest in the ${role} position at ${company}. With my demonstrated record of delivering results and collaborating cross-functionally, I am excited about the opportunity to contribute to your team.`,
    bodyParagraph1: `Throughout my career, I have taken ownership of critical deliverables, solving challenging problems and driving measurable outcomes. By applying rigorous methodologies and clear communication, I consistently exceed project benchmarks.`,
    bodyParagraph2: `I am particularly drawn to ${company}'s mission and standard of excellence. My competencies align directly with your priorities, and I look forward to contributing immediately to your goals.`,
    closingParagraph: `Thank you for your time and consideration. I would welcome the opportunity to discuss my qualifications further in an interview.`,
    signoff: "Sincerely,",
  };
}

// Extracts skill tokens from a resume
export function extractSkillsList(skillsObj: ResumeData["skills"]): string[] {
  const all = [
    skillsObj.technicalLanguages,
    skillsObj.frameworksAndTools,
    skillsObj.softSkills,
  ].filter(Boolean).join(", ");

  return all
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1);
}

// Calculate ATS score based on Harvard FAS standard criteria
export function calculateAtsScore(resume: ResumeData): number {
  let score = 30;

  // Contact Completeness
  if (resume.contact.fullName) score += 10;
  if (resume.contact.email && resume.contact.phone) score += 10;
  if (resume.contact.location) score += 5;
  if (resume.contact.linkedin || resume.contact.githubOrPortfolio) score += 5;

  // Education
  if (resume.education.some((e) => e.degree && e.institution)) score += 15;

  // Experience
  const expBullets = resume.experience.flatMap((e) => e.bullets).filter(Boolean);
  if (expBullets.length >= 2) score += 10;
  if (expBullets.length >= 4) score += 5;

  // Quantified results check (numbers, percentages, dollar values)
  const hasQuantified = expBullets.some((b) => /\d+%|\$\d+|\d+\+|\d+k|\d+x/i.test(b));
  if (hasQuantified) score += 5;

  // Skills
  const skillsCount = extractSkillsList(resume.skills).length;
  if (skillsCount >= 4) score += 5;

  return Math.min(score, 98);
}

// Recognized technical programming languages for smart skill categorization
const KNOWN_PROGRAMMING_LANGUAGES = new Set([
  "python", "javascript", "typescript", "java", "c", "c++", "cpp", "c#", "csharp", "golang", "go",
  "rust", "ruby", "php", "swift", "kotlin", "scala", "dart", "perl", "r", "sql", "html", "css",
  "sass", "scss", "bash", "shell", "powershell", "lua", "haskell", "clojure", "elixir", "matlab",
  "assembly", "vba", "solidity", "graphql"
]);

// Recognized soft skills / methodologies for smart skill categorization
const KNOWN_SOFT_SKILLS = new Set([
  "leadership", "communication", "teamwork", "collaboration", "problem solving", "critical thinking",
  "project management", "time management", "mentorship", "public speaking", "negotiation",
  "adaptability", "creativity", "decision making", "emotional intelligence", "agile", "scrum",
  "kanban", "strategic planning", "stakeholder management", "cross-functional collaboration",
  "analytical thinking", "presentation skills", "conflict resolution", "product strategy",
  "user research", "wireframing", "prototyping", "design thinking"
]);

const DATE_RANGE_REGEX = /(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|\d{1,2}\/\d{2,4}|\b(?:19|20)\d\d\b)\s*[-–—to~]+\s*(?:Present|Current|Now|\d{1,2}\/\d{2,4}|\b(?:19|20)\d\d\b|(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}))/i;
const SINGLE_YEAR_REGEX = /\b(19\d\d|20\d\d)\b/;
const BULLET_START_REGEX = /^[-*•–—▪▫◦✓→+]\s*/;
const NUMBERED_BULLET_REGEX = /^\d+[\.\)]\s*/;
const ACTION_VERB_REGEX = /^(?:Led|Managed|Developed|Built|Designed|Engineered|Created|Implemented|Spearheaded|Architected|Automated|Resolved|Increased|Decreased|Optimized|Streamlined|Collaborated|Mentored|Deployed|Maintained|Analyzed|Formulated|Conducted|Coordinated|Initiated|Delivered|Configured|Executed|Launched|Authored|Produced|Established|Pioneered|Directed|Supervised|Oversaw|Generated|Modernized|Revamped|Enhanced|Programmed|Calculated|Administered|Trained|Facilitated|Integrated|Tested|Researched|Negotiated|Wrote)\b/i;

function categorizeSkillTokens(tokens: string[]): {
  technicalLanguages: string;
  frameworksAndTools: string;
  softSkills: string;
} {
  const languages: string[] = [];
  const tools: string[] = [];
  const soft: string[] = [];
  const seen = new Set<string>();

  for (const rawToken of tokens) {
    const token = rawToken.replace(/^[•\-\*\s]+|[•\-\*\s]+$/g, "").trim();
    if (!token || token.length < 2) continue;
    const lower = token.toLowerCase();
    if (seen.has(lower)) continue;
    seen.add(lower);

    if (KNOWN_PROGRAMMING_LANGUAGES.has(lower)) {
      languages.push(token);
    } else if (KNOWN_SOFT_SKILLS.has(lower)) {
      soft.push(token);
    } else {
      tools.push(token);
    }
  }

  return {
    technicalLanguages: languages.join(", "),
    frameworksAndTools: tools.join(", "),
    softSkills: soft.join(", "),
  };
}

type SectionType = "header" | "summary" | "experience" | "education" | "projects" | "skills" | "leadership";

function detectSectionHeader(line: string): SectionType | null {
  const clean = line.replace(/^[#*_\-\s:=]+|[#*_\-\s:=]+$/g, "").trim();
  if (!clean || clean.length > 55) return null;
  const upper = clean.toUpperCase();

  if (
    /^(WORK\s+EXPERIENCE|PROFESSIONAL\s+EXPERIENCE|EXPERIENCE|EMPLOYMENT\s+HISTORY|EMPLOYMENT|WORK\s+HISTORY|CAREER\s+HISTORY|RELEVANT\s+EXPERIENCE|PROFESSIONAL\s+BACKGROUND|EXPERIENCE\s*&\s*PROJECTS):?$/i.test(upper)
  ) {
    return "experience";
  }
  if (
    /^(EDUCATION|ACADEMIC\s+BACKGROUND|ACADEMICS|ACADEMIC\s+HISTORY|EDUCATION\s*&\s*CREDENTIALS|DEGREES|QUALIFICATIONS):?$/i.test(upper)
  ) {
    return "education";
  }
  if (
    /^(PROJECTS|PERSONAL\s+PROJECTS|ACADEMIC\s+PROJECTS|KEY\s+PROJECTS|TECHNICAL\s+PROJECTS|FEATURED\s+PROJECTS|SELECTED\s+PROJECTS|OPEN\s+SOURCE\s+PROJECTS):?$/i.test(upper)
  ) {
    return "projects";
  }
  if (
    /^(TECHNICAL\s+SKILLS|SKILLS\s*&\s*TOOLS|SKILLS\s*&\s*ABILITIES|CORE\s+COMPETENCIES|EXPERTISE|AREAS\s+OF\s+EXPERTISE|TECHNOLOGIES|SKILLS|TECH\s+STACK|CORE\s+SKILLS):?$/i.test(upper)
  ) {
    return "skills";
  }
  if (
    /^(LEADERSHIP|ACTIVITIES|EXTRACURRICULAR\s+ACTIVITIES|EXTRACURRICULAR|VOLUNTEERING|VOLUNTEER\s+EXPERIENCE|COMMUNITY\s+INVOLVEMENT|AWARDS|HONORS\s*&\s*AWARDS|CERTIFICATIONS|AFFILIATIONS):?$/i.test(upper)
  ) {
    return "leadership";
  }
  if (
    /^(PROFESSIONAL\s+SUMMARY|EXECUTIVE\s+SUMMARY|SUMMARY|PROFILE|CAREER\s+OBJECTIVE|OBJECTIVE|ABOUT\s+ME):?$/i.test(upper)
  ) {
    return "summary";
  }
  return null;
}

function parseEducationLines(lines: string[]): EducationEntry[] {
  const entries: EducationEntry[] = [];
  let current: EducationEntry | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const hasInstKeyword = /\b(University|College|Institute|School|Academy|Polytechnic|Campus|Faculty)\b/i.test(line);
    const hasDegreeKeyword = /\b(Bachelor|Master|Doctor|Ph\.?D|Associate|B\.?S|B\.?A|M\.?S|M\.?A|MBA|B\.?Tech|B\.?E|M\.?Tech|Diploma|Degree|Major in|Minor in)\b/i.test(line);
    const dateMatch = line.match(DATE_RANGE_REGEX) || line.match(SINGLE_YEAR_REGEX);
    const gpaMatch = line.match(/GPA[:\s]*([0-4]\.\d{1,2}(?:\s*\/\s*4(?:\.0)?)?|[0-9]\.\d{1,2}(?:\s*\/\s*10(?:\.0)?)?)/i);

    if (hasInstKeyword || (hasDegreeKeyword && (!current || current.degree))) {
      if (current && (current.institution && (current.degree || hasInstKeyword))) {
        entries.push(current);
        current = null;
      }
    }

    if (!current) {
      current = {
        id: `edu-${entries.length + 1}`,
        institution: "",
        degree: "",
        location: "",
        graduationDate: "",
        gpa: "",
        details: "",
      };
    }

    if (gpaMatch) {
      current.gpa = gpaMatch[1];
    }
    if (dateMatch && !current.graduationDate) {
      current.graduationDate = dateMatch[0].trim();
    }

    const parts = line.split(/[|•–—·]/).map((p) => p.trim()).filter(Boolean);

    if (parts.length > 1) {
      for (const part of parts) {
        if (/\b(University|College|Institute|School|Academy|Polytechnic)\b/i.test(part) && !current.institution) {
          current.institution = part;
        } else if (/\b(Bachelor|Master|Doctor|Ph\.?D|Associate|B\.?S|B\.?A|M\.?S|M\.?A|MBA|B\.?Tech|B\.?E|M\.?Tech|Diploma|Degree)\b/i.test(part) && !current.degree) {
          current.degree = part;
        } else if (/[A-Z][a-zA-Z\s]+,\s*[A-Z]{2}/.test(part) && !current.location) {
          current.location = part;
        } else if (!current.graduationDate && (DATE_RANGE_REGEX.test(part) || SINGLE_YEAR_REGEX.test(part))) {
          current.graduationDate = part;
        } else if (part !== current.institution && part !== current.degree && part !== current.location) {
          current.details = current.details ? `${current.details}; ${part}` : part;
        }
      }
    } else {
      if (hasInstKeyword && !current.institution) {
        current.institution = line.replace(DATE_RANGE_REGEX, "").replace(SINGLE_YEAR_REGEX, "").trim();
      } else if (hasDegreeKeyword && !current.degree) {
        current.degree = line.replace(DATE_RANGE_REGEX, "").replace(SINGLE_YEAR_REGEX, "").trim();
      } else if (!current.institution) {
        current.institution = line;
      } else if (!current.degree) {
        current.degree = line;
      } else {
        current.details = current.details ? `${current.details} ${line}` : line;
      }
    }
  }

  if (current && (current.institution || current.degree)) {
    entries.push(current);
  }

  return entries;
}

function parseExperienceLines(lines: string[]): ExperienceEntry[] {
  const entries: ExperienceEntry[] = [];
  let current: ExperienceEntry | null = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();
    if (!line) continue;

    const isBulletSymbol = BULLET_START_REGEX.test(line) || NUMBERED_BULLET_REGEX.test(line);
    const dateMatch = line.match(DATE_RANGE_REGEX);
    const hasJobTitleWord = /\b(Engineer|Developer|Manager|Designer|Analyst|Consultant|Architect|Lead|Director|Specialist|Associate|Intern|Coordinator|Administrator|Officer|Scientist|VP|Head|Founder|Co-Founder|Tech Lead|Product Manager)\b/i.test(line);
    const isSeparatedHeader = (line.includes("|") || line.includes(" – ") || line.includes(" — ") || line.includes(" · ")) && (dateMatch !== null || hasJobTitleWord);

    const isNewJobHeader =
      !isBulletSymbol &&
      (dateMatch !== null ||
        isSeparatedHeader ||
        (current && current.bullets.length > 0 && !ACTION_VERB_REGEX.test(line) && line.length < 90 && !line.endsWith(".")));

    if (isNewJobHeader) {
      if (current && (current.role || current.company || current.bullets.length > 0)) {
        entries.push(current);
      }

      current = {
        id: `exp-${entries.length + 1}`,
        role: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "Present",
        bullets: [],
      };

      if (dateMatch) {
        const fullDate = dateMatch[0].trim();
        const dateParts = fullDate.split(/[-–—to~]+/).map((s) => s.trim());
        current.startDate = dateParts[0] || "";
        current.endDate = dateParts[1] || "Present";
      }

      const locMatch = line.match(/\b([A-Z][a-zA-Z\s.-]+,\s*(?:[A-Z]{2}|[A-Z][a-zA-Z]+))\b|Remote|Hybrid/i);
      if (locMatch) {
        current.location = locMatch[0].trim();
      }

      const cleanedLine = line.replace(DATE_RANGE_REGEX, "").trim();
      const parts = cleanedLine.split(/[|–—·]/).map((p) => p.trim()).filter(Boolean);

      if (parts.length >= 2) {
        const p0 = parts[0];
        const p1 = parts[1];
        if (/\b(Engineer|Developer|Manager|Designer|Analyst|Consultant|Architect|Lead|Director|Specialist|Associate|Intern)\b/i.test(p0)) {
          current.role = p0;
          current.company = p1;
        } else {
          current.company = p0;
          current.role = p1;
        }
      } else if (cleanedLine.toLowerCase().includes(" at ")) {
        const atParts = cleanedLine.split(/\s+at\s+/i);
        current.role = atParts[0].trim();
        current.company = atParts[1]?.trim() || "";
      } else if (cleanedLine.toLowerCase().includes(" - ")) {
        const dashParts = cleanedLine.split(/\s+-\s+/);
        current.role = dashParts[0].trim();
        current.company = dashParts[1]?.trim() || "";
      } else if (hasJobTitleWord) {
        current.role = cleanedLine;
      } else {
        current.company = cleanedLine;
      }

      continue;
    }

    if (!current) {
      current = {
        id: `exp-${entries.length + 1}`,
        role: "Professional Role",
        company: "Organization",
        location: "",
        startDate: "",
        endDate: "Present",
        bullets: [],
      };
    }

    if (!current.role && hasJobTitleWord && current.bullets.length === 0) {
      current.role = line.replace(DATE_RANGE_REGEX, "").trim();
      if (dateMatch && !current.startDate) {
        const fullDate = dateMatch[0].trim();
        const dateParts = fullDate.split(/[-–—to~]+/).map((s) => s.trim());
        current.startDate = dateParts[0] || "";
        current.endDate = dateParts[1] || "Present";
      }
      continue;
    }
    if (!current.company && !hasJobTitleWord && current.bullets.length === 0 && line.length < 50) {
      current.company = line.replace(DATE_RANGE_REGEX, "").trim();
      continue;
    }

    const cleanBullet = line.replace(BULLET_START_REGEX, "").replace(NUMBERED_BULLET_REGEX, "").trim();
    if (cleanBullet) {
      current.bullets.push(cleanBullet);
    }
  }

  if (current && (current.role || current.company || current.bullets.length > 0)) {
    entries.push(current);
  }

  return entries;
}

function parseProjectLines(lines: string[]): ProjectEntry[] {
  const entries: ProjectEntry[] = [];
  let current: ProjectEntry | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const isBullet = BULLET_START_REGEX.test(line) || NUMBERED_BULLET_REGEX.test(line);

    if (!isBullet && (!current || current.bullets.length > 0)) {
      if (current) entries.push(current);

      current = {
        id: `proj-${entries.length + 1}`,
        title: "",
        techStack: "",
        bullets: [],
      };

      const linkMatch = line.match(/https?:\/\/[^\s]+|github\.com\/[^\s]+/i);
      if (linkMatch) {
        current.link = linkMatch[0];
      }

      const cleaned = line.replace(/https?:\/\/[^\s]+|github\.com\/[^\s]+/i, "").trim();
      const parts = cleaned.split(/[|–—·]/).map((p) => p.trim()).filter(Boolean);

      if (parts.length >= 2) {
        current.title = parts[0];
        current.techStack = parts.slice(1).join(", ");
      } else {
        current.title = cleaned;
      }
      continue;
    }

    if (!current) {
      current = {
        id: `proj-${entries.length + 1}`,
        title: "Key Project",
        techStack: "",
        bullets: [],
      };
    }

    const cleanBullet = line.replace(BULLET_START_REGEX, "").replace(NUMBERED_BULLET_REGEX, "").trim();
    if (cleanBullet) {
      current.bullets.push(cleanBullet);
    }
  }

  if (current && (current.title || current.bullets.length > 0)) {
    entries.push(current);
  }

  return entries;
}

function parseSkillLines(lines: string[]): {
  technicalLanguages: string;
  frameworksAndTools: string;
  softSkills: string;
} {
  let languages = "";
  let tools = "";
  let soft = "";
  const unclassifiedTokens: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const langMatch = line.match(/^(?:Languages|Programming Languages|Languages & Paradigms|Core Languages)[:\-]\s*(.*)/i);
    const toolMatch = line.match(/^(?:Frameworks|Frameworks & Tools|Tools & Technologies|Technologies|Developer Tools|Databases|Cloud & DevOps|Libraries)[:\-]\s*(.*)/i);
    const softMatch = line.match(/^(?:Soft Skills|Methodologies|Interpersonal Skills|Core Competencies|Practices)[:\-]\s*(.*)/i);

    if (langMatch) {
      languages = languages ? `${languages}, ${langMatch[1]}` : langMatch[1];
    } else if (toolMatch) {
      tools = tools ? `${tools}, ${toolMatch[1]}` : toolMatch[1];
    } else if (softMatch) {
      soft = soft ? `${soft}, ${softMatch[1]}` : softMatch[1];
    } else {
      const tokens = line
        .split(/[,|•\/;]/)
        .map((t) => t.trim())
        .filter(Boolean);
      unclassifiedTokens.push(...tokens);
    }
  }

  if (unclassifiedTokens.length > 0) {
    const categorized = categorizeSkillTokens(unclassifiedTokens);
    if (!languages) languages = categorized.technicalLanguages;
    else if (categorized.technicalLanguages) languages += `, ${categorized.technicalLanguages}`;

    if (!tools) tools = categorized.frameworksAndTools;
    else if (categorized.frameworksAndTools) tools += `, ${categorized.frameworksAndTools}`;

    if (!soft) soft = categorized.softSkills;
    else if (categorized.softSkills) soft += `, ${categorized.softSkills}`;
  }

  return {
    technicalLanguages: languages.trim(),
    frameworksAndTools: tools.trim(),
    softSkills: soft.trim(),
  };
}

function parseLeadershipLines(lines: string[]): Array<{
  id: string;
  role: string;
  organization: string;
  date: string;
  description: string;
}> {
  const entries: Array<{
    id: string;
    role: string;
    organization: string;
    date: string;
    description: string;
  }> = [];

  let current: {
    id: string;
    role: string;
    organization: string;
    date: string;
    description: string;
  } | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const isBullet = BULLET_START_REGEX.test(line) || NUMBERED_BULLET_REGEX.test(line);

    if (!isBullet) {
      if (current) entries.push(current);

      const dateMatch = line.match(DATE_RANGE_REGEX) || line.match(SINGLE_YEAR_REGEX);
      const cleaned = line.replace(DATE_RANGE_REGEX, "").trim();
      const parts = cleaned.split(/[|–—·]/).map((p) => p.trim()).filter(Boolean);

      current = {
        id: `lead-${entries.length + 1}`,
        role: parts[0] || cleaned,
        organization: parts[1] || "",
        date: dateMatch ? dateMatch[0].trim() : "",
        description: "",
      };
      continue;
    }

    if (!current) {
      current = {
        id: `lead-${entries.length + 1}`,
        role: "Leadership & Activities",
        organization: "",
        date: "",
        description: "",
      };
    }

    const cleanBullet = line.replace(BULLET_START_REGEX, "").replace(NUMBERED_BULLET_REGEX, "").trim();
    current.description = current.description ? `${current.description} ${cleanBullet}` : cleanBullet;
  }

  if (current) entries.push(current);

  return entries;
}

// Client-Side Comprehensive Resume Parser for Uploaded / Pasted Text
export function parseResumeText(rawText: string, defaultName?: string, defaultEmail?: string): ResumeData {
  const result: ResumeData = {
    id: `resume-${Date.now()}`,
    title: `${defaultName || "Candidate"} — Resume`,
    fontFamily: "serif",
    contact: {
      fullName: defaultName || "",
      email: defaultEmail || "",
      phone: "",
      location: "",
      linkedin: "",
      githubOrPortfolio: "",
    },
    sectionOrder: ["education", "experience", "projects", "skills", "leadership"],
    education: [],
    experience: [],
    projects: [],
    skills: {
      technicalLanguages: "",
      frameworksAndTools: "",
      softSkills: "",
    },
    leadership: [],
  };

  if (!rawText || !rawText.trim()) return result;

  // 1. Check if rawText is valid JSON (direct export or structured data)
  const trimmed = rawText.trim();
  if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
    try {
      const parsedJson = JSON.parse(trimmed);
      const data = Array.isArray(parsedJson) ? parsedJson[0] : parsedJson;
      if (data && typeof data === "object") {
        if (data.contact) {
          result.contact = {
            fullName: data.contact.fullName || defaultName || "",
            email: data.contact.email || defaultEmail || "",
            phone: data.contact.phone || "",
            location: data.contact.location || "",
            linkedin: data.contact.linkedin || "",
            githubOrPortfolio: data.contact.githubOrPortfolio || "",
          };
        }
        if (data.title) result.title = data.title;
        if (Array.isArray(data.education) && data.education.length > 0) {
          result.education = data.education.map((e: any, idx: number) => ({
            id: e.id || `edu-${idx + 1}`,
            institution: e.institution || e.school || e.university || "",
            degree: e.degree || e.major || "",
            location: e.location || "",
            graduationDate: e.graduationDate || e.year || e.date || "",
            gpa: e.gpa || "",
            details: e.details || "",
          }));
        }
        if (Array.isArray(data.experience) && data.experience.length > 0) {
          result.experience = data.experience.map((e: any, idx: number) => ({
            id: e.id || `exp-${idx + 1}`,
            role: e.role || e.title || e.position || "",
            company: e.company || e.organization || "",
            location: e.location || "",
            startDate: e.startDate || "",
            endDate: e.endDate || "Present",
            bullets: Array.isArray(e.bullets)
              ? e.bullets.filter(Boolean)
              : typeof e.description === "string"
              ? [e.description]
              : [],
          }));
        }
        if (Array.isArray(data.projects) && data.projects.length > 0) {
          result.projects = data.projects.map((p: any, idx: number) => ({
            id: p.id || `proj-${idx + 1}`,
            title: p.title || p.name || "",
            techStack: p.techStack || p.technologies || "",
            link: p.link || p.url || "",
            bullets: Array.isArray(p.bullets) ? p.bullets.filter(Boolean) : [],
          }));
        }
        if (data.skills) {
          if (typeof data.skills === "object") {
            result.skills = {
              technicalLanguages: data.skills.technicalLanguages || data.skills.languages || "",
              frameworksAndTools: data.skills.frameworksAndTools || data.skills.tools || "",
              softSkills: data.skills.softSkills || "",
            };
          } else if (typeof data.skills === "string") {
            result.skills.technicalLanguages = data.skills;
          }
        }
        if (Array.isArray(data.leadership) && data.leadership.length > 0) {
          result.leadership = data.leadership;
        }

        if (result.experience.length > 0 || result.education.length > 0 || result.skills.technicalLanguages) {
          return result;
        }
      }
    } catch {}
  }

  // 2. Extract contact info via regex across text
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) result.contact.email = emailMatch[0];

  const phoneMatch = rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{10}\b/);
  if (phoneMatch) result.contact.phone = phoneMatch[0];

  const linkedinMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|profile)\/[a-zA-Z0-9_-]+/i);
  if (linkedinMatch) result.contact.linkedin = linkedinMatch[0];

  const gitMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/i);
  if (gitMatch) result.contact.githubOrPortfolio = gitMatch[0];

  const locationMatch = rawText.match(/\b([A-Z][a-zA-Z\s.-]+,\s*(?:[A-Z]{2}|[A-Z][a-zA-Z]+))\b/);
  if (
    locationMatch &&
    !locationMatch[0].includes("University") &&
    !locationMatch[0].includes("College") &&
    !locationMatch[0].includes("January") &&
    !locationMatch[0].includes("Present")
  ) {
    result.contact.location = locationMatch[0];
  }

  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // Extract Name from first 5 lines
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const l = lines[i].replace(/^[#*_\-\s]+|[#*_\-\s]+$/g, "").trim();
    if (
      l.length > 1 &&
      l.length < 45 &&
      !l.includes("@") &&
      !l.includes("http") &&
      !l.includes(".com") &&
      !/\d{3}[-.]\d{3}/.test(l) &&
      !/^(RESUME|CURRICULUM|CV|PROFILE|SUMMARY|EXPERIENCE|EDUCATION)/i.test(l)
    ) {
      result.contact.fullName = l;
      result.title = `${l} — Professional Resume`;
      break;
    }
  }

  // 3. Partition lines by section
  const sectionLines: Record<SectionType, string[]> = {
    header: [],
    summary: [],
    experience: [],
    education: [],
    projects: [],
    skills: [],
    leadership: [],
  };

  let currentSec: SectionType = "header";

  for (const line of lines) {
    const detected = detectSectionHeader(line);
    if (detected) {
      currentSec = detected;
      continue;
    }
    sectionLines[currentSec].push(line);
  }

  // 4. Parse individual sections
  if (sectionLines.education.length > 0) {
    const edu = parseEducationLines(sectionLines.education);
    if (edu.length > 0) result.education = edu;
  }

  if (sectionLines.experience.length > 0) {
    const exp = parseExperienceLines(sectionLines.experience);
    if (exp.length > 0) result.experience = exp;
  }

  if (sectionLines.projects.length > 0) {
    const proj = parseProjectLines(sectionLines.projects);
    if (proj.length > 0) result.projects = proj;
  }

  if (sectionLines.skills.length > 0) {
    result.skills = parseSkillLines(sectionLines.skills);
  }

  if (sectionLines.leadership.length > 0) {
    const lead = parseLeadershipLines(sectionLines.leadership);
    if (lead.length > 0) result.leadership = lead;
  }

  // 5. Fallback heuristics if sections weren't caught by headers
  if (result.experience.length === 0 && sectionLines.header.length > 3) {
    const fallbackExp = parseExperienceLines(sectionLines.header.slice(2));
    if (fallbackExp.length > 0) result.experience = fallbackExp;
  }

  if (result.education.length === 0) {
    result.education = [
      {
        id: "edu-1",
        institution: "",
        degree: "",
        location: "",
        graduationDate: "",
        gpa: "",
        details: "",
      },
    ];
  }

  if (result.experience.length === 0) {
    result.experience = [
      {
        id: "exp-1",
        role: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "Present",
        bullets: [""],
      },
    ];
  }

  return result;
}

export function getDefaultResumes(userName?: string, userEmail?: string): Record<string, ResumeOption> {
  return {};
}

// Generate the 3 initial clean empty slots (user will add their own)
export function getDefaultSlots(userName?: string, userEmail?: string): ResumeSlot[] {
  return [
    {
      slotId: "slot-1",
      slotNumber: 1,
      title: "Empty Slot",
      targetRole: "Available",
      updatedLabel: "Not started",
      isPrimary: true,
      resume: null,
    },
    {
      slotId: "slot-2",
      slotNumber: 2,
      title: "Empty Slot",
      targetRole: "Available",
      updatedLabel: "Not started",
      isPrimary: false,
      resume: null,
    },
    {
      slotId: "slot-3",
      slotNumber: 3,
      title: "Empty Slot",
      targetRole: "Available",
      updatedLabel: "Not started",
      isPrimary: false,
      resume: null,
    },
  ];
}

// Retrieve the 3 slots from localStorage with graceful fallback
export function getResumeSlots(defaultUserName?: string, defaultUserEmail?: string): ResumeSlot[] {
  if (typeof window === "undefined") return getDefaultSlots(defaultUserName, defaultUserEmail);
  try {
    const raw = localStorage.getItem(SLOTS_STORAGE_KEY);
    if (!raw) {
      const defaults = getDefaultSlots(defaultUserName, defaultUserEmail);
      saveSlotsToStorage(defaults);
      return defaults;
    }
    const parsed = JSON.parse(raw) as ResumeSlot[];
    if (!Array.isArray(parsed) || parsed.length !== 3) {
      const defaults = getDefaultSlots(defaultUserName, defaultUserEmail);
      saveSlotsToStorage(defaults);
      return defaults;
    }
    return parsed;
  } catch {
    return getDefaultSlots(defaultUserName, defaultUserEmail);
  }
}

// Save the 3 slots and synchronize with legacy storage key for cross-app compatibility
export function saveSlotsToStorage(slots: ResumeSlot[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SLOTS_STORAGE_KEY, JSON.stringify(slots));

    // Mirror to legacy storage for JobDiscovery & SkillGapStudio
    const mirrorMap: Record<string, ResumeOption> = {};
    let activeKey = "";

    slots.forEach((s) => {
      if (s.resume) {
        mirrorMap[s.resume.name] = s.resume;
        if (s.isPrimary || !activeKey) {
          activeKey = s.resume.name;
        }
      }
    });

    if (Object.keys(mirrorMap).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mirrorMap));
      if (activeKey) {
        localStorage.setItem(ACTIVE_RESUME_KEY, activeKey);
      }
    }

    window.dispatchEvent(new Event("hirefy-resume-storage-update"));
  } catch (err) {
    console.error("Failed to save slots to storage", err);
  }
}

export function getActiveSlotId(): ResumeSlotId {
  if (typeof window === "undefined") return "slot-1";
  try {
    const active = localStorage.getItem(ACTIVE_SLOT_KEY) as ResumeSlotId;
    return active && ["slot-1", "slot-2", "slot-3"].includes(active) ? active : "slot-1";
  } catch {
    return "slot-1";
  }
}

export function setActiveSlotId(slotId: ResumeSlotId): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ACTIVE_SLOT_KEY, slotId);
    window.dispatchEvent(new Event("hirefy-resume-storage-update"));
  } catch {}
}

// Save or update a resume in a specific slot
export function saveResumeToSlot(
  slotId: ResumeSlotId,
  rawData: ResumeData,
  customTitle?: string
): ResumeSlot {
  const slots = getResumeSlots();
  const targetIdx = slots.findIndex((s) => s.slotId === slotId);
  const nowStr = "Edited just now";
  const title = customTitle || rawData.title || (slotId === "slot-1" ? "Product Designer" : slotId === "slot-2" ? "UX Designer · General" : "Specialized Resume");
  const atsScore = calculateAtsScore(rawData);
  const skillsList = extractSkillsList(rawData.skills);
  const candidateName = rawData.contact.fullName || "Candidate";

  const newResumeOption: ResumeOption = {
    id: `${slotId}-${Date.now()}`,
    name: title,
    candidateName,
    ats: atsScore,
    years: "3+ years",
    skillsCount: skillsList.length || 6,
    updated: nowStr,
    knownSkills: skillsList.length > 0 ? skillsList : ["Design Systems", "User Research", "Prototyping"],
    rawResumeData: rawData,
  };

  const updatedSlot: ResumeSlot = {
    slotId,
    slotNumber: slotId === "slot-1" ? 1 : slotId === "slot-2" ? 2 : 3,
    title,
    targetRole: title,
    updatedLabel: nowStr,
    isPrimary: targetIdx >= 0 ? slots[targetIdx].isPrimary : slotId === "slot-1",
    resume: newResumeOption,
  };

  if (targetIdx >= 0) {
    slots[targetIdx] = updatedSlot;
  } else {
    slots.push(updatedSlot);
  }

  saveSlotsToStorage(slots);
  setActiveSlotId(slotId);
  try {
    saveResumeToStore(newResumeOption);
  } catch {}
  return updatedSlot;
}

// Delete / Clear a slot back to empty state
export function deleteResumeFromSlot(slotId: ResumeSlotId): ResumeSlot[] {
  const slots = getResumeSlots();
  const targetIdx = slots.findIndex((s) => s.slotId === slotId);
  if (targetIdx >= 0) {
    slots[targetIdx] = {
      slotId,
      slotNumber: slots[targetIdx].slotNumber,
      title: "Empty Slot",
      targetRole: "Available",
      updatedLabel: "Not started",
      isPrimary: false,
      resume: null,
    };

    // If we deleted the primary slot, assign primary to the first available non-empty slot
    if (!slots.some((s) => s.isPrimary && s.resume)) {
      const firstAvailable = slots.find((s) => s.resume !== null);
      if (firstAvailable) {
        firstAvailable.isPrimary = true;
        setActiveSlotId(firstAvailable.slotId);
      }
    }

    saveSlotsToStorage(slots);
  }
  return slots;
}

// Duplicate a slot into an empty target slot
export function duplicateResumeSlot(
  sourceSlotId: ResumeSlotId,
  targetSlotId: ResumeSlotId
): ResumeSlot[] {
  const slots = getResumeSlots();
  const source = slots.find((s) => s.slotId === sourceSlotId);
  const targetIdx = slots.findIndex((s) => s.slotId === targetSlotId);

  if (source && source.resume && targetIdx >= 0) {
    const rawData = source.resume.rawResumeData
      ? JSON.parse(JSON.stringify(source.resume.rawResumeData))
      : { ...HARVARD_FAS_OFFICIAL_SAMPLE, title: `${source.title} (Copy)` };

    rawData.title = `${source.title} (Copy)`;

    slots[targetIdx] = {
      slotId: targetSlotId,
      slotNumber: slots[targetIdx].slotNumber,
      title: `${source.title} (Copy)`,
      targetRole: source.targetRole,
      updatedLabel: "Edited just now",
      isPrimary: false,
      resume: {
        ...source.resume,
        id: `${targetSlotId}-${Date.now()}`,
        name: `${source.title} (Copy)`,
        updated: "Edited just now",
        rawResumeData: rawData,
      },
    };

    saveSlotsToStorage(slots);
  }
  return slots;
}

// Get the ResumeData for editing a slot (or blank if null)
export function getResumeDataForSlot(
  slotId: ResumeSlotId,
  userName?: string,
  userEmail?: string
): ResumeData {
  const slots = getResumeSlots(userName, userEmail);
  const slot = slots.find((s) => s.slotId === slotId);
  if (slot?.resume?.rawResumeData) {
    return slot.resume.rawResumeData;
  }
  // If slot is empty, return fresh blank resume template
  const blank = createBlankResume(userName, userEmail);
  blank.title = slotId === "slot-1" ? "Product Designer" : slotId === "slot-2" ? "UX Designer · General" : "Tailored Resume";
  return blank;
}

// Import parsed text directly into a slot
export function importResumeToSlot(
  slotId: ResumeSlotId,
  rawText: string,
  userName?: string,
  userEmail?: string
): ResumeSlot {
  const parsed = parseResumeText(rawText, userName, userEmail);
  return saveResumeToSlot(slotId, parsed, parsed.title);
}

export function getStoredResumes(defaultUserName?: string, defaultUserEmail?: string): Record<string, ResumeOption> {
  if (typeof window === "undefined") return getDefaultResumes(defaultUserName, defaultUserEmail);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaults = getDefaultResumes(defaultUserName, defaultUserEmail);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(raw);
  } catch {
    return getDefaultResumes(defaultUserName, defaultUserEmail);
  }
}

export function saveResumeToStore(resume: ResumeOption) {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredResumes();
    current[resume.name] = resume;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    localStorage.setItem(ACTIVE_RESUME_KEY, resume.name);
    window.dispatchEvent(new Event("hirefy-resume-storage-update"));
  } catch (err) {
    console.error("Failed to save resume", err);
  }
}

export function getActiveResumeKey(): string {
  if (typeof window === "undefined") return Object.keys(getDefaultResumes())[0] ?? "";
  try {
    return (
      localStorage.getItem(ACTIVE_RESUME_KEY) ||
      Object.keys(getStoredResumes())[0] ||
      ""
    );
  } catch {
    return Object.keys(getDefaultResumes())[0] ?? "";
  }
}

// ---------------------------------------------------------------------------
// Cover Letter 3-Slot Storage Vault
// ---------------------------------------------------------------------------

export function getDefaultCoverLetterSlots(): CoverLetterSlot[] {
  return [
    {
      slotId: "cl-slot-1",
      slotNumber: 1,
      title: "Empty Slot",
      companyName: "",
      targetRole: "",
      updatedLabel: "Not started",
      isPrimary: true,
      data: null,
    },
    {
      slotId: "cl-slot-2",
      slotNumber: 2,
      title: "Empty Slot",
      companyName: "",
      targetRole: "",
      updatedLabel: "Not started",
      isPrimary: false,
      data: null,
    },
    {
      slotId: "cl-slot-3",
      slotNumber: 3,
      title: "Empty Slot",
      companyName: "",
      targetRole: "",
      updatedLabel: "Not started",
      isPrimary: false,
      data: null,
    },
  ];
}

export function getCoverLetterSlots(): CoverLetterSlot[] {
  if (typeof window === "undefined") return getDefaultCoverLetterSlots();
  try {
    const raw = localStorage.getItem(COVER_LETTER_SLOTS_KEY);
    if (!raw) {
      const defaults = getDefaultCoverLetterSlots();
      saveCoverLetterSlots(defaults);
      return defaults;
    }
    const parsed = JSON.parse(raw) as CoverLetterSlot[];
    if (!Array.isArray(parsed) || parsed.length !== 3) {
      const defaults = getDefaultCoverLetterSlots();
      saveCoverLetterSlots(defaults);
      return defaults;
    }
    return parsed;
  } catch {
    return getDefaultCoverLetterSlots();
  }
}

export function saveCoverLetterSlots(slots: CoverLetterSlot[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(COVER_LETTER_SLOTS_KEY, JSON.stringify(slots));
    window.dispatchEvent(new Event("hirefy-cover-letter-storage-update"));
  } catch (err) {
    console.error("Failed to save cover letter slots", err);
  }
}

export function getActiveCoverLetterSlotId(): CoverLetterSlotId {
  if (typeof window === "undefined") return "cl-slot-1";
  try {
    const active = localStorage.getItem(ACTIVE_COVER_LETTER_SLOT_KEY) as CoverLetterSlotId;
    return active && ["cl-slot-1", "cl-slot-2", "cl-slot-3"].includes(active) ? active : "cl-slot-1";
  } catch {
    return "cl-slot-1";
  }
}

export function setActiveCoverLetterSlotId(slotId: CoverLetterSlotId): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ACTIVE_COVER_LETTER_SLOT_KEY, slotId);
    window.dispatchEvent(new Event("hirefy-cover-letter-storage-update"));
  } catch {}
}

export function saveCoverLetterToSlot(
  slotId: CoverLetterSlotId,
  data: CoverLetterData,
  customTitle?: string
): CoverLetterSlot {
  const slots = getCoverLetterSlots();
  const targetIdx = slots.findIndex((s) => s.slotId === slotId);
  const nowStr = "Edited just now";
  const title =
    customTitle ||
    (data.companyName
      ? `${data.roleTarget || "Application"} — ${data.companyName}`
      : "Tailored Cover Letter");

  const updatedSlot: CoverLetterSlot = {
    slotId,
    slotNumber: slotId === "cl-slot-1" ? 1 : slotId === "cl-slot-2" ? 2 : 3,
    title,
    companyName: data.companyName,
    targetRole: data.roleTarget,
    updatedLabel: nowStr,
    isPrimary: targetIdx >= 0 ? slots[targetIdx].isPrimary : slotId === "cl-slot-1",
    data,
  };

  if (targetIdx >= 0) {
    slots[targetIdx] = updatedSlot;
  } else {
    slots.push(updatedSlot);
  }

  saveCoverLetterSlots(slots);
  setActiveCoverLetterSlotId(slotId);
  return updatedSlot;
}

export function deleteCoverLetterFromSlot(slotId: CoverLetterSlotId): CoverLetterSlot[] {
  const slots = getCoverLetterSlots();
  const targetIdx = slots.findIndex((s) => s.slotId === slotId);
  if (targetIdx >= 0) {
    slots[targetIdx] = {
      slotId,
      slotNumber: slots[targetIdx].slotNumber,
      title: "Empty Slot",
      companyName: "",
      targetRole: "",
      updatedLabel: "Not started",
      isPrimary: false,
      data: null,
    };

    if (!slots.some((s) => s.isPrimary && s.data)) {
      const firstAvailable = slots.find((s) => s.data !== null);
      if (firstAvailable) {
        firstAvailable.isPrimary = true;
        setActiveCoverLetterSlotId(firstAvailable.slotId);
      }
    }

    saveCoverLetterSlots(slots);
  }
  return slots;
}

export function duplicateCoverLetterSlot(
  sourceSlotId: CoverLetterSlotId,
  targetSlotId: CoverLetterSlotId
): CoverLetterSlot[] {
  const slots = getCoverLetterSlots();
  const source = slots.find((s) => s.slotId === sourceSlotId);
  const targetIdx = slots.findIndex((s) => s.slotId === targetSlotId);

  if (source && source.data && targetIdx >= 0) {
    slots[targetIdx] = {
      slotId: targetSlotId,
      slotNumber: slots[targetIdx].slotNumber,
      title: `${source.title} (Copy)`,
      companyName: source.companyName,
      targetRole: source.targetRole,
      updatedLabel: "Edited just now",
      isPrimary: false,
      data: JSON.parse(JSON.stringify(source.data)),
    };
    saveCoverLetterSlots(slots);
  }
  return slots;
}

export function getCoverLetterDataForSlot(slotId: CoverLetterSlotId): CoverLetterData {
  const slots = getCoverLetterSlots();
  const slot = slots.find((s) => s.slotId === slotId);
  if (slot?.data) {
    return slot.data;
  }
  return {
    recipientName: "Hiring Manager",
    recipientTitle: "Recruiting Team",
    companyName: "",
    companyLocation: "",
    date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    roleTarget: "",
    salutation: "Dear Hiring Team,",
    openingParagraph: "",
    bodyParagraph1: "",
    bodyParagraph2: "",
    closingParagraph: "",
    signoff: "Sincerely,",
  };
}
