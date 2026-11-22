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

// Client-Side Resume Parser for Uploaded/Pasted Text
export function parseResumeText(rawText: string, defaultName?: string, defaultEmail?: string): ResumeData {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const result = createBlankResume(defaultName, defaultEmail);

  if (lines.length === 0) return result;

  // Try extracting email
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) result.contact.email = emailMatch[0];

  // Try extracting phone
  const phoneMatch = rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) result.contact.phone = phoneMatch[0];

  // Try extracting LinkedIn
  const linkedinMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+/i);
  if (linkedinMatch) result.contact.linkedin = linkedinMatch[0];

  // Try extracting GitHub / Portfolio
  const gitMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[\w-]+/i);
  if (gitMatch) result.contact.githubOrPortfolio = gitMatch[0];

  // Name: typically line 0 if it looks like a name and is not a header
  if (lines[0] && lines[0].length < 40 && !lines[0].toUpperCase().includes("RESUME") && !lines[0].includes("@")) {
    result.contact.fullName = lines[0];
    result.title = `${lines[0]} — Professional Resume`;
  }

  // Section parser state machine
  let currentSection: "header" | "education" | "experience" | "projects" | "skills" | "leadership" = "header";

  const expEntries: ExperienceEntry[] = [];
  const eduEntries: EducationEntry[] = [];
  const projEntries: ProjectEntry[] = [];
  const skillLines: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const upper = line.toUpperCase();

    // Section detection
    if (/^(EDUCATION|ACADEMIC BACKGROUND|ACADEMICS)/.test(upper)) {
      currentSection = "education";
      continue;
    }
    if (/^(EXPERIENCE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|EMPLOYMENT)/.test(upper)) {
      currentSection = "experience";
      continue;
    }
    if (/^(PROJECTS|ACADEMIC PROJECTS|KEY PROJECTS)/.test(upper)) {
      currentSection = "projects";
      continue;
    }
    if (/^(SKILLS|TECHNICAL SKILLS|CORE COMPETENCIES)/.test(upper)) {
      currentSection = "skills";
      continue;
    }
    if (/^(LEADERSHIP|ACTIVITIES|VOLUNTEERING|EXTRACURRICULAR)/.test(upper)) {
      currentSection = "leadership";
      continue;
    }

    if (currentSection === "education") {
      if (line.includes("University") || line.includes("College") || line.includes("Institute") || line.includes("School")) {
        eduEntries.push({
          id: `edu-${eduEntries.length + 1}`,
          institution: line,
          degree: "",
          location: "",
          graduationDate: "",
          details: "",
        });
      } else if (eduEntries.length > 0) {
        const lastEdu = eduEntries[eduEntries.length - 1];
        if (!lastEdu.degree) {
          lastEdu.degree = line;
        } else {
          lastEdu.details = (lastEdu.details ? `${lastEdu.details} ` : "") + line;
        }
      }
    } else if (currentSection === "experience") {
      const isBullet = /^[-*•–]/.test(line);
      if (isBullet && expEntries.length > 0) {
        const cleanBullet = line.replace(/^[-*•–]\s*/, "").trim();
        expEntries[expEntries.length - 1].bullets.push(cleanBullet);
      } else {
        // Likely a job title or company
        expEntries.push({
          id: `exp-${expEntries.length + 1}`,
          role: line,
          company: "",
          location: "",
          startDate: "",
          endDate: "Present",
          bullets: [],
        });
      }
    } else if (currentSection === "projects") {
      const isBullet = /^[-*•–]/.test(line);
      if (isBullet && projEntries.length > 0) {
        const cleanBullet = line.replace(/^[-*•–]\s*/, "").trim();
        projEntries[projEntries.length - 1].bullets.push(cleanBullet);
      } else {
        projEntries.push({
          id: `proj-${projEntries.length + 1}`,
          title: line,
          techStack: "",
          bullets: [],
        });
      }
    } else if (currentSection === "skills") {
      skillLines.push(line);
    }
  }

  if (eduEntries.length > 0) result.education = eduEntries;
  if (expEntries.length > 0) result.experience = expEntries;
  if (projEntries.length > 0) result.projects = projEntries;
  if (skillLines.length > 0) {
    result.skills.technicalLanguages = skillLines.join(", ");
  }

  return result;
}

export function getDefaultResumes(userName?: string, userEmail?: string): Record<string, ResumeOption> {
  const candidate = userName || "My Primary Resume";
  const fileName = `${candidate}.pdf`;

  return {
    [fileName]: {
      name: fileName,
      candidateName: candidate,
      ats: 88,
      years: "4+ years",
      skillsCount: 7,
      updated: "Active in Studio",
      knownSkills: ["Python", "SQL", "Data Analysis", "Project Management", "Problem Solving", "Communication", "Agile"],
    },
  };
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
  if (typeof window === "undefined") return Object.keys(getDefaultResumes())[0];
  try {
    return localStorage.getItem(ACTIVE_RESUME_KEY) || Object.keys(getStoredResumes())[0];
  } catch {
    return Object.keys(getDefaultResumes())[0];
  }
}
