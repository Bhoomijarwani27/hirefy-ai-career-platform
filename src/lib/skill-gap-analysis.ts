import { QuizQuestion, QuizAnswerEvaluation, QuizEvaluateRequest } from "./skill-gap-types";

/**
 * Hirefy AI - Role Taxonomies and Conversational Career Assessment Engine
 * Designed for user-friendly, actionable coaching skimmable in 2-3 minutes.
 */

export type ProfessionalDomain = "HR" | "SOFTWARE_DEV" | "MARKETING" | "FINANCE" | "DATA_ANALYTICS" | "PRODUCT";

export interface RoleTaxonomy {
  id: string;
  title: string;
  domain: ProfessionalDomain;
  level: "Junior" | "Mid-level" | "Senior" | "Staff / Lead";
  coreSkills: { name: string; priority: "Critical" | "Important" | "Optional"; whyItMatters: string; expectedProficiency: string; practiceAdvice: string }[];
  architectureSkills: { name: string; priority: "Critical" | "Important" | "Optional"; whyItMatters: string; expectedProficiency: string; practiceAdvice: string }[];
  productionRigor: { name: string; priority: "Critical" | "Important" | "Optional"; whyItMatters: string; expectedProficiency: string; practiceAdvice: string }[];
  capstoneBlueprints: {
    title: string;
    problemStatement: string;
    techStack: string;
    coreFeatures: string[];
    advancedChallenges: string[];
    skillsDemonstrated: string[];
    recruiterEvaluationCriteria: string[];
  }[];
  sampleInterviewQuestions: {
    category: string;
    difficulty: "Fundamental" | "Intermediate" | "Advanced";
    question: string;
    hint: string;
    whatInterviewerEvaluates: string;
  }[];
}

export const ROLE_TAXONOMIES: Record<string, RoleTaxonomy> = {
  "frontend-senior": {
    id: "frontend-senior",
    title: "Senior Frontend / Web Platform Engineer",
    domain: "SOFTWARE_DEV",
    level: "Senior",
    coreSkills: [
      { name: "TypeScript", priority: "Critical", whyItMatters: "Catches bugs before users see them and makes team collaboration seamless.", expectedProficiency: "Strong generics and strict types.", practiceAdvice: "Refactor dynamic any-types to strict union types." },
      { name: "React & Next.js", priority: "Critical", whyItMatters: "Standard for fast, server-rendered modern web apps.", expectedProficiency: "Server components, hooks, and clean state handling.", practiceAdvice: "Build an App Router project with streaming." },
      { name: "State Management", priority: "Important", whyItMatters: "Keeps UI snappy without messy prop-passing.", expectedProficiency: "TanStack Query and Zustand.", practiceAdvice: "Implement optimistic UI updates." },
      { name: "CSS & Tailwind", priority: "Important", whyItMatters: "Allows rapid, clean UI building with consistent styling.", expectedProficiency: "Responsive layouts and reusable components.", practiceAdvice: "Build an accessible design token system." },
      { name: "Web Vitals & Performance", priority: "Critical", whyItMatters: "Slow pages directly cause user drop-off and lower revenue.", expectedProficiency: "LCP, FID/INP, and CLS optimization.", practiceAdvice: "Profile and fix layout shifts using Chrome DevTools." },
    ],
    architectureSkills: [
      { name: "Server-Side Rendering (SSR/ISR)", priority: "Critical", whyItMatters: "Instant page loads and excellent SEO ranking.", expectedProficiency: "Dynamic route rendering and caching tags.", practiceAdvice: "Set up on-demand ISR revalidation." },
      { name: "Component Design Systems & A11y", priority: "Important", whyItMatters: "Ensures your app is accessible to all users including screen readers.", expectedProficiency: "ARIA attributes and keyboard navigation.", practiceAdvice: "Audit your components with axe-core." },
    ],
    productionRigor: [
      { name: "Automated E2E Testing (Playwright)", priority: "Critical", whyItMatters: "Prevents breaking critical customer flows like signup and checkout.", expectedProficiency: "Multi-browser user journey tests.", practiceAdvice: "Write 3 Playwright tests for auth and form submission." },
      { name: "CI/CD & Bundle Optimization", priority: "Important", whyItMatters: "Ensures code quality checks run automatically on every push.", expectedProficiency: "GitHub Actions workflows and code splitting.", practiceAdvice: "Create a GitHub Actions workflow that runs tests on pull requests." },
    ],
    capstoneBlueprints: [
      {
        title: "Realtime Collaborative Workspace",
        problemStatement: "A collaborative note or document editor with instant synchronization, offline mode, and sub-100ms response.",
        techStack: "Next.js, TypeScript, Tailwind CSS, TanStack Query, IndexedDB, Playwright",
        coreFeatures: ["Rich text block editor", "Live user presence indicators", "Offline saving with automatic sync", "Accessible keyboard navigation"],
        advancedChallenges: ["Zero layout shift during live updates", "Smooth 60 FPS scrolling with large documents"],
        skillsDemonstrated: ["Modern React architecture", "Web Vitals performance", "E2E testing"],
        recruiterEvaluationCriteria: ["Lighthouse score > 95", "Clean modular TypeScript", "Full keyboard accessibility"],
      },
    ],
    sampleInterviewQuestions: [
      {
        category: "Rendering Architecture",
        difficulty: "Fundamental",
        question: "What are the core differences between Client-Side Rendering (CSR), Server-Side Rendering (SSR), and Static Site Generation (SSG), and how do they impact initial page load and SEO?",
        hint: "Discuss where HTML is generated (browser vs Node server vs build time) and how TTFB and hydration differ.",
        whatInterviewerEvaluates: "Foundational understanding of web rendering strategies and performance trade-offs.",
      },
      {
        category: "Performance & Rendering",
        difficulty: "Intermediate",
        question: "How do you prevent unnecessary component re-renders when passing functions to child components in React?",
        hint: "Think about useCallback, reference equality, and React.memo.",
        whatInterviewerEvaluates: "Understanding of component re-render lifecycle and memory reference equality.",
      },
      {
        category: "Real-World Debugging & Web Vitals",
        difficulty: "Advanced",
        question: "Your team noticed that mobile page interactions feel sluggish and INP spiked to 320ms on complex pages. What is your complete diagnostic workflow and mitigation strategy?",
        hint: "Use Chrome DevTools Performance profiler to isolate Long Tasks (>50ms) on the main thread and break them up using scheduler.yield() or Web Workers.",
        whatInterviewerEvaluates: "Advanced browser performance diagnostics, main thread scheduling, and Web Vitals optimization.",
      },
    ],
  },

  "backend-senior": {
    id: "backend-senior",
    title: "Senior Backend / Distributed Systems Engineer",
    domain: "SOFTWARE_DEV",
    level: "Senior",
    coreSkills: [
      { name: "Node.js / Go / Python / Java", priority: "Critical", whyItMatters: "Core language to author fast, resilient APIs and background services.", expectedProficiency: "Async event loop, concurrency, and clean modular code.", practiceAdvice: "Build an async service handling concurrent tasks." },
      { name: "PostgreSQL & Schema Design", priority: "Critical", whyItMatters: "Reliably stores business data with integrity and transactions.", expectedProficiency: "Relational modeling, migrations, and ACID guarantees.", practiceAdvice: "Write clean migrations with proper foreign keys." },
      { name: "Database Indexing & Queries", priority: "Critical", whyItMatters: "Prevents slow queries from taking down production databases.", expectedProficiency: "Reading EXPLAIN ANALYZE and composite B-Tree indexes.", practiceAdvice: "Index your top slow queries and verify latency drops." },
      { name: "REST / gRPC API Design", priority: "Important", whyItMatters: "Clean contracts between services and frontend apps.", expectedProficiency: "Idempotent endpoints, HTTP status codes, and input validation.", practiceAdvice: "Implement cursor-based pagination with input validation." },
      { name: "Redis Caching", priority: "Critical", whyItMatters: "Shields your database from heavy traffic spikes.", expectedProficiency: "Cache-Aside pattern, TTLs, and distributed locking.", practiceAdvice: "Cache expensive queries with automatic invalidation." },
    ],
    architectureSkills: [
      { name: "Message Queues (Kafka/RabbitMQ/SQS)", priority: "Critical", whyItMatters: "Handles asynchronous jobs without slowing down user requests.", expectedProficiency: "Consumer workers, retry backoff, and dead-letter queues.", practiceAdvice: "Build an async email/notification worker queue." },
      { name: "Idempotency & Concurrency", priority: "Critical", whyItMatters: "Prevents double charges or duplicate data when network requests retry.", expectedProficiency: "Idempotency keys and atomic database operations.", practiceAdvice: "Add idempotency key checks to your payment or creation endpoints." },
    ],
    productionRigor: [
      { name: "Docker Containerization", priority: "Critical", whyItMatters: "Ensures your app runs identically on your machine and in the cloud.", expectedProficiency: "Multi-stage production Dockerfiles.", practiceAdvice: "Write a multi-stage Docker build producing a minimal image." },
      { name: "Observability (Prometheus / Logs)", priority: "Important", whyItMatters: "Helps you know when something breaks before your users complain.", expectedProficiency: "Structured logging, latency metrics, and error tracking.", practiceAdvice: "Add request timing middleware and structured JSON logging." },
    ],
    capstoneBlueprints: [
      {
        title: "Idempotent Payment & Settlement Service",
        problemStatement: "A high-reliability payment backend that handles network retries, concurrent duplicate charges, and background processing without failure.",
        techStack: "Node.js/Go, PostgreSQL, Redis, Docker, GitHub Actions",
        coreFeatures: ["Idempotent payment capture endpoint", "Redis distributed locking", "Async webhook event processing", "Prometheus latency metrics"],
        advancedChallenges: ["Zero double charges under 1,000 concurrent retries", "Graceful recovery from database reconnects"],
        skillsDemonstrated: ["Concurrency handling", "Data integrity", "Production containerization"],
        recruiterEvaluationCriteria: ["Automated integration test suite", "Clean Docker Compose setup", "Clear architecture diagram"],
      },
    ],
    sampleInterviewQuestions: [
      {
        category: "Databases & Storage",
        difficulty: "Fundamental",
        question: "What are the core architectural differences between a relational database (like PostgreSQL) and a NoSQL document database (like MongoDB), and what criteria determine your choice?",
        hint: "Discuss ACID compliance, schema rigidity, relations/joins, and vertical vs horizontal scaling trade-offs.",
        whatInterviewerEvaluates: "Foundational database knowledge and architectural selection criteria.",
      },
      {
        category: "Performance & Query Optimization",
        difficulty: "Intermediate",
        question: "Your production database CPU spikes to 95% during peak traffic. How do you identify which query is causing the bottleneck and what steps do you take to resolve it?",
        hint: "Inspect pg_stat_activity, examine execution plans using EXPLAIN ANALYZE, and add composite B-Tree indexes.",
        whatInterviewerEvaluates: "Practical database incident triage and query performance optimization.",
      },
      {
        category: "Distributed Systems & Idempotency",
        difficulty: "Advanced",
        question: "How do you architect an API endpoint so that if an unreliable client network triggers duplicate payment requests, the user is guaranteed to be charged only once?",
        hint: "Leverage unique Idempotency Keys stored with transactional uniqueness constraints in PostgreSQL or Redis distributed locks.",
        whatInterviewerEvaluates: "Understanding of distributed consistency, race condition prevention, and fault tolerance.",
      },
    ],
  },

  "fullstack-engineer": {
    id: "fullstack-engineer",
    title: "Full-Stack Software Engineer",
    domain: "SOFTWARE_DEV",
    level: "Mid-level",
    coreSkills: [
      { name: "TypeScript / JavaScript", priority: "Critical", whyItMatters: "End-to-end type safety from database to UI.", expectedProficiency: "Shared data schemas and async functions.", practiceAdvice: "Use Zod schemas to validate form inputs and API requests." },
      { name: "React & Next.js", priority: "Critical", whyItMatters: "The most in-demand full-stack framework today.", expectedProficiency: "Server components, server actions, and responsive UI.", practiceAdvice: "Build a multi-page app with authenticated routes." },
      { name: "Node.js & API Endpoints", priority: "Critical", whyItMatters: "Handles business logic and backend routing.", expectedProficiency: "Middleware, clean status codes, and error handling.", practiceAdvice: "Write clean, modular API routes." },
      { name: "PostgreSQL & Prisma", priority: "Critical", whyItMatters: "Defines database structure and handles migrations.", expectedProficiency: "Relational queries, joins, and Prisma models.", practiceAdvice: "Model relational data with 1-to-many relationships." },
      { name: "Authentication & Security", priority: "Critical", whyItMatters: "Protects user accounts and private data.", expectedProficiency: "Secure session cookies, passwords, and route protection.", practiceAdvice: "Implement auth with secure HttpOnly cookies." },
    ],
    architectureSkills: [
      { name: "Full-Stack Type Safety", priority: "Important", whyItMatters: "Ensures frontend and backend never fall out of sync.", expectedProficiency: "Shared Zod or tRPC contracts.", practiceAdvice: "Share validation schemas between client and server." },
    ],
    productionRigor: [
      { name: "Automated Testing", priority: "Critical", whyItMatters: "Ensures you can refactor and ship features with confidence.", expectedProficiency: "Testing core user signup, login, and workflows.", practiceAdvice: "Write 3 Playwright tests for your main user journey." },
      { name: "CI/CD & Cloud Deployment", priority: "Important", whyItMatters: "Automates testing and deploying your code to production.", expectedProficiency: "GitHub Actions and Vercel/Docker deployment.", practiceAdvice: "Set up automated tests on every GitHub push." },
    ],
    capstoneBlueprints: [
      {
        title: "Full-Stack SaaS Platform with Stripe Billing",
        problemStatement: "A complete multi-user SaaS with organization management, role permissions, Stripe subscription billing, and automated notifications.",
        techStack: "Next.js, TypeScript, Tailwind CSS, PostgreSQL, Prisma, Stripe, Playwright",
        coreFeatures: ["Team workspaces & invitations", "Stripe subscription checkout & webhooks", "Interactive analytics dashboard", "Automated email alerts"],
        advancedChallenges: ["Multi-tenant data isolation", "Webhook signature verification and retry handling"],
        skillsDemonstrated: ["Full-stack product engineering", "Authentication & RBAC", "Payment integration"],
        recruiterEvaluationCriteria: ["Live working demo", "Clean code structure", "Automated test workflow"],
      },
    ],
    sampleInterviewQuestions: [
      {
        category: "Web Security & Authentication",
        difficulty: "Fundamental",
        question: "What is the difference between Authentication and Authorization, and why should sensitive session tokens be stored in HttpOnly cookies rather than localStorage?",
        hint: "Explain auth (who you are) vs authz (what you can access), and how HttpOnly cookies mitigate Cross-Site Scripting (XSS) token theft.",
        whatInterviewerEvaluates: "Core understanding of web security principles and credential protection.",
      },
      {
        category: "Client-Server UX State",
        difficulty: "Intermediate",
        question: "How do you manage client-side state so that the UI updates immediately when a user clicks 'Like' or 'Save' before the server responds, and how do you handle network errors?",
        hint: "Describe optimistic UI updates with automatic rollback logic using tools like TanStack Query or React useOptimistic.",
        whatInterviewerEvaluates: "Modern UX pattern implementation, error recovery, and state synchronization.",
      },
      {
        category: "System Integration & Webhooks",
        difficulty: "Advanced",
        question: "How do you securely handle asynchronous webhook events from third-party payment providers like Stripe without opening security holes or processing duplicate events?",
        hint: "Verify HMAC cryptographic signatures using raw request bodies and enforce idempotency by storing processed event IDs.",
        whatInterviewerEvaluates: "Webhook security protocols, asynchronous processing, and event deduplication.",
      },
    ],
  },

  "hr-specialist": {
    id: "hr-specialist",
    title: "Human Resources Specialist & Talent Acquisition Partner",
    domain: "HR",
    level: "Mid-level",
    coreSkills: [
      { name: "Recruitment & Talent Acquisition", priority: "Critical", whyItMatters: "Attracts top-tier candidates and drives efficient hiring funnels.", expectedProficiency: "Sourcing pipelines, ATS management, and structured interviewing.", practiceAdvice: "Design a competency-based interview rubric for high-priority roles." },
      { name: "Labor Law & Employment Compliance", priority: "Critical", whyItMatters: "Shields the company from severe legal penalties, lawsuits, and statutory violations.", expectedProficiency: "FLSA, EEOC, wage/hour rules, and workplace policies.", practiceAdvice: "Conduct a mock audit of employee exempt vs non-exempt classifications." },
      { name: "Employee Onboarding & Retention", priority: "Important", whyItMatters: "Reduces early employee turnover and accelerates time-to-productivity.", expectedProficiency: "30-60-90 onboarding frameworks and retention programs.", practiceAdvice: "Build a structured 30-day onboarding checklist with milestone check-ins." },
      { name: "Conflict Resolution & Employee Relations", priority: "Critical", whyItMatters: "Maintains a safe, productive, and legally compliant workplace culture.", expectedProficiency: "Workplace investigation, mediation, and disciplinary documentation.", practiceAdvice: "Document a formal grievance investigation procedure with anti-retaliation protocols." },
      { name: "HR Operations & HRIS Management", priority: "Important", whyItMatters: "Ensures accurate employee records, benefits administration, and smooth payroll.", expectedProficiency: "HRIS systems (Workday, BambooHR), benefits, and personnel files.", practiceAdvice: "Streamline offboarding and equipment recovery workflows." },
      { name: "HR Analytics & People Metrics", priority: "Important", whyItMatters: "Enables data-driven headcount planning and retention forecasting.", expectedProficiency: "Time-to-hire, offer acceptance rate, eNPS, and attrition analysis.", practiceAdvice: "Calculate recruiting funnel drop-off rates across interview stages." },
    ],
    architectureSkills: [
      { name: "Compensation Benchmarking & Pay Equity", priority: "Critical", whyItMatters: "Ensures competitive offers while maintaining internal equity.", expectedProficiency: "Salary bands, market percentiles, and pay transparency compliance.", practiceAdvice: "Benchmark 5 core roles against market salary percentiles." },
    ],
    productionRigor: [
      { name: "HR Audit & Policy Governance", priority: "Critical", whyItMatters: "Guarantees corporate policies comply with federal, state, and local statutes.", expectedProficiency: "Employee handbooks, I-9 compliance, and safety standards.", practiceAdvice: "Review company handbook policies against current employment laws." },
    ],
    capstoneBlueprints: [
      {
        title: "Strategic Talent Acquisition & Retention System",
        problemStatement: "A high-growth organization faces an unsustainable 48-day time-to-hire and a 22% first-year turnover rate due to unstructured interviews and inconsistent onboarding.",
        techStack: "Greenhouse ATS, Workday HRIS, Culture Amp, Excel People Analytics",
        coreFeatures: ["Competency-based interview scorecard library", "Interactive 90-day onboarding roadmap", "Automated candidate experience survey loop", "Quarterly attrition cohort dashboard"],
        advancedChallenges: ["Standardizing interview calibration across reluctant hiring managers", "Ensuring pay equity compliance across multi-state remote teams"],
        skillsDemonstrated: ["Full-lifecycle talent acquisition", "Statutory compliance", "People analytics"],
        recruiterEvaluationCriteria: ["Objective scoring rubrics", "Documented conflict escalation procedures", "Measurable time-to-hire reduction strategy"],
      },
    ],
    sampleInterviewQuestions: [
      {
        category: "Labor Laws & Employment Compliance",
        difficulty: "Fundamental",
        question: "What is the fundamental legal difference between an exempt and a non-exempt employee under employment law (such as the FLSA), and what operational risks arise from misclassifying workers?",
        hint: "Focus on overtime eligibility, minimum salary threshold requirements, duties tests, and the risk of back-pay legal penalties.",
        whatInterviewerEvaluates: "Understanding of statutory wage-and-hour compliance, worker classification tests, and corporate risk mitigation.",
      },
      {
        category: "Conflict Resolution & Workplace Mediation",
        difficulty: "Intermediate",
        question: "An employee approaches HR alleging that their direct manager is engaging in favoritism, creating a hostile work environment, and unfairly withholding promotional opportunities. Walk me through your step-by-step investigation and resolution process.",
        hint: "Detail confidential fact-gathering, separate objective interviews, reviewing communication records, avoiding retaliation, and creating an actionable resolution plan.",
        whatInterviewerEvaluates: "Workplace investigation methodology, procedural fairness, documentation rigor, and risk management.",
      },
      {
        category: "Strategic Talent Acquisition & HR Analytics",
        difficulty: "Advanced",
        question: "Your company plans to scale headcount by 40% over the next two quarters, but recruiting analytics show offer acceptance rates have dropped to 62% and time-to-hire has spiked to 48 days. How would you diagnose the root causes and restructure the talent acquisition strategy to hit hiring goals?",
        hint: "Analyze stage-by-stage funnel drop-offs, compensation competitiveness against market percentiles, interviewer calibration, and sourcing channel ROI.",
        whatInterviewerEvaluates: "Data-driven HR strategy, recruiting funnel diagnostics, stakeholder alignment, and executive problem-solving.",
      },
    ],
  },

  "marketing-growth": {
    id: "marketing-growth",
    title: "Growth Marketing & Digital Campaign Specialist",
    domain: "MARKETING",
    level: "Mid-level",
    coreSkills: [
      { name: "Search Engine Optimization (SEO)", priority: "Critical", whyItMatters: "Builds sustainable, compounding organic customer acquisition channels.", expectedProficiency: "Keyword research, technical SEO, on-page optimization, and backlink strategies.", practiceAdvice: "Perform a technical SEO audit identifying crawl errors and Core Web Vital issues." },
      { name: "Paid Acquisition (PPC & Social)", priority: "Critical", whyItMatters: "Drives scalable, predictable demand generation and testing.", expectedProficiency: "Google Ads, Meta Ads Manager, bidding strategies, and copy testing.", practiceAdvice: "Structure an A/B test comparing value-focused vs fear-of-missing-out ad copy." },
      { name: "Marketing Analytics & Attribution", priority: "Critical", whyItMatters: "Proves return on ad spend (ROAS) and identifies high-performing channels.", expectedProficiency: "Google Analytics 4 (GA4), UTM governance, and multi-touch attribution.", practiceAdvice: "Set up customized event tracking and conversion goals in GA4." },
      { name: "Conversion Rate Optimization (CRO)", priority: "Important", whyItMatters: "Extracts maximum revenue and leads from existing web traffic.", expectedProficiency: "A/B testing, heatmaps, form optimization, and landing page architecture.", practiceAdvice: "Design an optimized above-the-fold landing page wireframe." },
      { name: "Content Strategy & Lifecycle Email", priority: "Important", whyItMatters: "Nurtures prospects through long evaluation cycles into paying customers.", expectedProficiency: "HubSpot/Klaviyo, lead magnets, and automated email nurturing sequences.", practiceAdvice: "Write a 4-part automated onboarding email drip sequence." },
    ],
    architectureSkills: [
      { name: "Unit Economics & CAC:LTV Optimization", priority: "Critical", whyItMatters: "Prevents unprofitable marketing spend and protects gross margins.", expectedProficiency: "CAC, LTV, payback period, and channel payback velocity.", practiceAdvice: "Model blended vs paid CAC across acquisition channels." },
    ],
    productionRigor: [
      { name: "Experimental Design & Hypothesis Testing", priority: "Important", whyItMatters: "Ensures marketing budget is directed toward statistically verified initiatives.", expectedProficiency: "Sample size calculation, statistical significance, and test documentation.", practiceAdvice: "Draft an experiment brief with clear hypothesis, sample size, and success metric." },
    ],
    capstoneBlueprints: [
      {
        title: "Omnichannel Inbound Lead Generation & Conversion Engine",
        problemStatement: "A company relies exclusively on expensive paid search ads, leading to unsustainable Customer Acquisition Costs (CAC) and stagnant organic search visibility.",
        techStack: "Google Analytics 4, HubSpot CRM, Google Tag Manager, Semrush, Hotjar",
        coreFeatures: ["Pillar-cluster SEO content engine", "High-converting comparison landing page variants", "Behavioral email lead-nurturing workflows", "Multi-touch ROI attribution dashboard"],
        advancedChallenges: ["Attributing conversions across complex multi-device customer journeys", "Balancing brand messaging with aggressive direct-response conversion tactics"],
        skillsDemonstrated: ["Organic SEO", "CRO experimentation", "Full-funnel marketing analytics"],
        recruiterEvaluationCriteria: ["Clear experimental framework", "Measurable CAC reduction strategy", "Documented keyword roadmap"],
      },
    ],
    sampleInterviewQuestions: [
      {
        category: "SEO & Search Engine Algorithms",
        difficulty: "Fundamental",
        question: "What are the core differences between On-Page SEO, Off-Page SEO, and Technical SEO, and how do they work in tandem to drive search engine rankings?",
        hint: "Differentiate between content/meta tags, domain authority/backlinks, and site speed/crawlability/Core Web Vitals.",
        whatInterviewerEvaluates: "Foundational understanding of search ranking factors and organic visibility principles.",
      },
      {
        category: "Campaign Diagnostics & CRO",
        difficulty: "Intermediate",
        question: "Your paid search campaign achieves a strong 5.2% click-through rate (CTR), but your landing page conversion rate sits at a disappointing 0.7%. What specific steps would you take to diagnose visitor drop-off, and what experiments would you run?",
        hint: "Examine ad copy to landing page message match, page loading speed, form field friction, above-the-fold value proposition, and heatmaps.",
        whatInterviewerEvaluates: "Practical funnel troubleshooting, conversion rate optimization methodology, and hypothesis-driven experimentation.",
      },
      {
        category: "Growth Strategy & Unit Economics",
        difficulty: "Advanced",
        question: "Over the last two quarters, Customer Acquisition Cost (CAC) surged by 38% while customer Lifetime Value (LTV) remained flat, reducing your LTV:CAC ratio from 3.8 to 2.3. How would you restructure acquisition channels and lifecycle retention to restore capital-efficient growth?",
        hint: "Audit channel-by-channel unit economics, reallocate budget from diminishing-return paid ads to organic content/referral loops, and implement onboarding optimizations to reduce early customer churn.",
        whatInterviewerEvaluates: "Executive marketing acumen, unit economics literacy, cross-functional retention strategy, and budget allocation leadership.",
      },
    ],
  },

  "finance-analyst": {
    id: "finance-analyst",
    title: "Financial Analyst & Corporate Finance Specialist",
    domain: "FINANCE",
    level: "Mid-level",
    coreSkills: [
      { name: "Financial Modeling & 3-Statement Integration", priority: "Critical", whyItMatters: "Forms the bedrock of corporate forecasting, valuation, and capital planning.", expectedProficiency: "Income statement, balance sheet, and cash flow integration in Excel.", practiceAdvice: "Build a dynamically linked 3-statement model from raw financials." },
      { name: "Budgeting & Forecasting (FP&A)", priority: "Critical", whyItMatters: "Empowers leadership to allocate capital and monitor operational spend.", expectedProficiency: "Annual budgets, rolling forecasts, and budget-vs-actual variance analysis.", practiceAdvice: "Model departmental budget variance identifying key cost drivers." },
      { name: "Valuation & Capital Budgeting", priority: "Critical", whyItMatters: "Determines whether corporate investments and acquisitions create shareholder value.", expectedProficiency: "Discounted Cash Flow (DCF), WACC, NPV, and IRR methodologies.", practiceAdvice: "Calculate company WACC using CAPM and current debt market rates." },
      { name: "Accounting Standards & Financial Reporting", priority: "Important", whyItMatters: "Ensures financial disclosures comply with statutory and regulatory mandates.", expectedProficiency: "GAAP / IFRS principles, revenue recognition (ASC 606), and audit support.", practiceAdvice: "Audit revenue recognition schedules against ASC 606 criteria." },
      { name: "Variance Analysis & Cost Control", priority: "Important", whyItMatters: "Identifies operating inefficiencies and margin compression before quarter-end.", expectedProficiency: "Price-volume variance, fixed vs variable cost allocation, and EBITDA analysis.", practiceAdvice: "Perform price-volume decomposition on quarterly gross profit variance." },
    ],
    architectureSkills: [
      { name: "Scenario Modeling & Sensitivity Analysis", priority: "Critical", whyItMatters: "Stress-tests corporate liquidity and solvency under adverse market conditions.", expectedProficiency: "Excel Data Tables, Monte Carlo concepts, and cash burn stress-testing.", practiceAdvice: "Build a two-variable sensitivity table testing revenue growth vs gross margin." },
    ],
    productionRigor: [
      { name: "Financial Controls & Model Integrity", priority: "Important", whyItMatters: "Prevents material misstatements and spreadsheet calculation errors.", expectedProficiency: "Formula auditing, circular reference elimination, and SOX controls.", practiceAdvice: "Implement automated balance sheet check cells verifying Assets = Liabilities + Equity." },
    ],
    capstoneBlueprints: [
      {
        title: "Integrated 3-Statement Corporate Financial Model & Variance Dashboard",
        problemStatement: "A mid-sized enterprise lacks dynamic financial projections and real-time variance visibility, leading to unexpected cash burn and inaccurate forecasts.",
        techStack: "Excel (Advanced Dynamic Arrays & Financial Functions), Power BI, NetSuite ERP",
        coreFeatures: ["Dynamically linked 3-statement model", "Scenario manager (base/bull/bear)", "Departmental budget-vs-actual variance tracker", "Cash runway and working capital sensitivity heatmaps"],
        advancedChallenges: ["Modeling non-cash working capital fluctuations during hyper-growth", "Eliminating circular debt-interest dependencies cleanly without Excel iterative calculation"],
        skillsDemonstrated: ["3-statement financial modeling", "FP&A variance analysis", "Cash flow forecasting"],
        recruiterEvaluationCriteria: ["Formula integrity without circular references", "Robust sensitivity analysis", "Executive presentation formatting"],
      },
    ],
    sampleInterviewQuestions: [
      {
        category: "Financial Accounting Mechanics",
        difficulty: "Fundamental",
        question: "Walk me through how a $100 increase in depreciation expense flows through the Income Statement, Cash Flow Statement, and Balance Sheet, assuming a 20% corporate tax rate.",
        hint: "Operating income drops by $100 -> Net income drops by $80 -> Cash flow from operations increases by $20 (non-cash addback) -> Cash rises by $20, PP&E drops by $100, Retained Earnings drops by $80.",
        whatInterviewerEvaluates: "Mastery of the fundamental mechanical linkages connecting the three primary financial statements.",
      },
      {
        category: "FP&A Variance Analysis",
        difficulty: "Intermediate",
        question: "At the end of Q2, you observe that departmental operating expenses are 22% over budget, while net revenue is 5% below forecast. How do you isolate the underlying cost drivers and present your actionable recommendations to executive leadership?",
        hint: "Break down price variance vs volume variance, separate non-recurring one-off charges from structural budget overruns, and propose corrective expense controls.",
        whatInterviewerEvaluates: "Variance investigation methodology, business partnering acumen, and crisp executive communication.",
      },
      {
        category: "Capital Budgeting & Corporate Valuation",
        difficulty: "Advanced",
        question: "Your company is considering acquiring a competitor for $20M. How would you determine whether this transaction creates shareholder value, what discount rate (WACC) adjustments would you apply, and how would you evaluate financing options (debt vs equity)?",
        hint: "Perform DCF valuation with terminal value sensitivity, analyze accretion/dilution on EPS, stress-test cost synergies, and calculate the cost of debt vs equity considering leverage limits.",
        whatInterviewerEvaluates: "Advanced valuation rigor, capital structure optimization, synergy sensitivity analysis, and strategic M&A decision-making.",
      },
    ],
  },

  "data-analytics": {
    id: "data-analytics",
    title: "Data Analyst & Business Intelligence Specialist",
    domain: "DATA_ANALYTICS",
    level: "Mid-level",
    coreSkills: [
      { name: "SQL Querying & Data Wrangling", priority: "Critical", whyItMatters: "Extracts and aggregates data from multi-terabyte production data warehouses.", expectedProficiency: "CTEs, window functions, complex joins, subqueries, and query optimization.", practiceAdvice: "Write complex window function queries solving running total and cohort retention problems." },
      { name: "Data Visualization & Dashboarding", priority: "Critical", whyItMatters: "Translates complex datasets into clear, actionable executive visual stories.", expectedProficiency: "Power BI, Tableau, Looker, and dashboard UX design.", practiceAdvice: "Build an executive KPI dashboard with interactive drill-down filters." },
      { name: "Statistical Analysis & Experimentation", priority: "Important", whyItMatters: "Ensures data insights and A/B test results are statistically sound.", expectedProficiency: "Hypothesis testing, p-values, sample sizing, and confidence intervals.", practiceAdvice: "Calculate minimum detectable effect (MDE) for a conversion test." },
      { name: "Data Modeling & Warehousing", priority: "Important", whyItMatters: "Structures data for rapid, reliable analytical querying.", expectedProficiency: "Star schema, snowflake schema, fact vs dimension tables, and dbt.", practiceAdvice: "Design a dimensional star schema for an e-commerce order analytics warehouse." },
    ],
    architectureSkills: [
      { name: "Metric Governance & Data Quality", priority: "Critical", whyItMatters: "Prevents conflicting metrics across sales, finance, and product teams.", expectedProficiency: "Semantic layer definitions, data lineage, and automated test alerts.", practiceAdvice: "Define unambiguous business metric calculation formulas in documentation." },
    ],
    productionRigor: [
      { name: "Query Performance & Cost Optimization", priority: "Important", whyItMatters: "Keeps cloud data warehouse costs manageable and dashboards fast.", expectedProficiency: "Partitioning, clustering, indexing, and cost monitoring.", practiceAdvice: "Optimize a slow query by replacing correlated subqueries with window functions." },
    ],
    capstoneBlueprints: [
      {
        title: "Enterprise Product Analytics & Retention Intelligence Dashboard",
        problemStatement: "Company leadership cannot determine where users drop off in the conversion funnel due to unstandardized event logs and fragmented data sources.",
        techStack: "PostgreSQL/BigQuery, Python (Pandas), Tableau/Power BI, dbt",
        coreFeatures: ["Automated dimensional models for event analytics", "Interactive cohort retention heatmap", "Conversion funnel bottleneck visualizations", "Statistical A/B test evaluation scorecard"],
        advancedChallenges: ["Resolving cross-device identity stitching", "Maintaining sub-second dashboard load times on multi-million row datasets"],
        skillsDemonstrated: ["Advanced SQL", "Dimensional data modeling", "Executive KPI visualization"],
        recruiterEvaluationCriteria: ["Clean modular SQL with CTEs", "Statistical rigor in test interpretation", "Actionable business recommendations"],
      },
    ],
    sampleInterviewQuestions: [
      {
        category: "SQL Analytical Functions",
        difficulty: "Fundamental",
        question: "What is the difference between ROW_NUMBER(), RANK(), and DENSE_RANK() in SQL window functions, and in what business scenarios would you use each?",
        hint: "Explain how each function handles duplicate tie values in sorting order and whether subsequent rank numbers are skipped.",
        whatInterviewerEvaluates: "Mastery of SQL window functions and analytical querying precision.",
      },
      {
        category: "A/B Testing & Counter-Metrics",
        difficulty: "Intermediate",
        question: "In an A/B test for a new checkout flow, the test variant demonstrated a statistically significant 6% increase in click-through rate, but overall revenue per visitor remained flat. How do you investigate this discrepancy before making a rollout recommendation?",
        hint: "Check for changes in average order value (AOV), segment performance by user cohort or device type, inspect sample ratio mismatch (SRM), and evaluate cannibalization.",
        whatInterviewerEvaluates: "Analytical skepticism, understanding of counter-metrics, segmentation analysis, and experiment validation.",
      },
      {
        category: "Data Modeling & Architecture",
        difficulty: "Advanced",
        question: "Your company's reporting queries are taking minutes to execute as the transaction database scales to tens of millions of rows. How would you design a dimensional model (Fact and Dimension tables) and an aggregation strategy to deliver sub-second executive dashboard queries?",
        hint: "Design a Star Schema with grain definition, surrogate keys, slowly changing dimensions (SCD), materialized aggregates, and incremental data loads.",
        whatInterviewerEvaluates: "Dimensional modeling expertise, database performance optimization, and scalable data warehousing architecture.",
      },
    ],
  },

  "product-manager": {
    id: "product-manager",
    title: "Product Manager & Product Strategy Leader",
    domain: "PRODUCT",
    level: "Mid-level",
    coreSkills: [
      { name: "Product Discovery & User Research", priority: "Critical", whyItMatters: "Validates real customer pain points before writing expensive code.", expectedProficiency: "User interviews, surveys, persona definition, and Jobs-To-Be-Done.", practiceAdvice: "Write a 5-question user discovery interview script for an unvalidated feature." },
      { name: "Feature Prioritization Frameworks", priority: "Critical", whyItMatters: "Prevents wasted engineering bandwidth on low-impact vanity features.", expectedProficiency: "RICE (Reach, Impact, Confidence, Effort), MoSCoW, and Kano model.", practiceAdvice: "Score 5 competing feature requests using the RICE framework." },
      { name: "Product Requirements & Execution", priority: "Critical", whyItMatters: "Translates business vision into clear, unambiguous engineering specs.", expectedProficiency: "Authoring comprehensive PRDs, user stories, and acceptance criteria.", practiceAdvice: "Draft a 1-page PRD with problem statement, non-goals, and success metrics." },
      { name: "Product Analytics & Metric Tracking", priority: "Important", whyItMatters: "Provides objective truth on user adoption, engagement, and retention.", expectedProficiency: "North Star metric definition, funnel conversion, and cohort retention.", practiceAdvice: "Define event telemetry instrumentation specifications for a new user flow." },
    ],
    architectureSkills: [
      { name: "Go-to-Market & Product Strategy", priority: "Critical", whyItMatters: "Aligns product roadmap with revenue goals and competitive differentiation.", expectedProficiency: "Product-market fit evaluation, pricing strategy, and release planning.", practiceAdvice: "Perform competitive differentiation mapping against top 3 market competitors." },
    ],
    productionRigor: [
      { name: "Cross-Functional Consensus & Alignment", priority: "Important", whyItMatters: "Maintains high engineering velocity while keeping sales and leadership aligned.", expectedProficiency: "Stakeholder management, roadmap communication, and risk mitigation.", practiceAdvice: "Structure a trade-off proposal reconciling sales requests with tech debt." },
    ],
    capstoneBlueprints: [
      {
        title: "End-to-End Product PRD & Go-to-Market Launch Strategy",
        problemStatement: "A high-potential feature suffered from poor market adoption due to a lack of user discovery, unclear requirements, and misaligned engineering deliverables.",
        techStack: "Figma, Jira, Mixpanel, Amplitude, Notion PRD Frameworks",
        coreFeatures: ["Comprehensive Product Requirements Document (PRD)", "Interactive low-fidelity user flow wireframe", "RICE prioritization scorecard", "Event telemetry and success metric dashboard specification"],
        advancedChallenges: ["Defending feature scope against executive scope creep", "Reconciling immediate enterprise revenue demands with long-term platform scalability"],
        skillsDemonstrated: ["User discovery", "Technical PRD authoring", "Data-driven prioritization"],
        recruiterEvaluationCriteria: ["Clear distinction between problem space and solution space", "Measurable success metrics", "Realistic engineering feasibility considerations"],
      },
    ],
    sampleInterviewQuestions: [
      {
        category: "Prioritization Frameworks",
        difficulty: "Fundamental",
        question: "Explain the RICE prioritization framework (Reach, Impact, Confidence, Effort). How do you calculate the score and prevent team bias when assigning Impact and Confidence values?",
        hint: "Formula is (R * I * C) / E. Discuss objective data sources for Confidence (e.g. user surveys, prototypes) versus gut feel.",
        whatInterviewerEvaluates: "Understanding of quantitative feature prioritization and rigorous decision-making.",
      },
      {
        category: "Stakeholder Alignment & Engineering Trade-Offs",
        difficulty: "Intermediate",
        question: "Engineering leadership insists on dedicating the next sprint to refactoring technical debt to prevent platform outages, while Sales demands immediate delivery of a custom enterprise feature to close a critical deal. How do you resolve this conflict?",
        hint: "Facilitate transparent risk-benefit conversations, quantify downtime cost vs revenue gain, explore compromise scopes (e.g. 70/30 split), and maintain trust with both sides.",
        whatInterviewerEvaluates: "Conflict resolution, business-technical translation, and principled product leadership.",
      },
      {
        category: "Product Strategy & PMF Metrics",
        difficulty: "Advanced",
        question: "You are tasked with defining the North Star metric and launch strategy for a brand-new collaboration product. What metric would you choose, what leading indicators would you track, and how would you identify whether the product has achieved true Product-Market Fit (PMF)?",
        hint: "Select a metric reflecting customer value creation (e.g., active collaborating teams), track retention cohorts flattening above zero, and use the Sean Ellis 40% 'very disappointed' survey threshold.",
        whatInterviewerEvaluates: "Strategic product vision, metric selection rigor, understanding of PMF, and long-term value creation.",
      },
    ],
  },
};

/**
 * Multi-Signal Domain & Role Matcher
 * Identifies the candidate's exact profession from query, job description, and resume.
 * Guarantees zero cross-domain pollution.
 */
export function detectTargetRoleAndDomain(
  roleQuery?: string,
  jobDescription?: string,
  resumeText?: string
): { roleTitle: string; domain: ProfessionalDomain; taxonomyId: string } {
  const query = (roleQuery || "").toLowerCase();
  const jd = (jobDescription || "").toLowerCase();
  const resume = (resumeText || "").toLowerCase();

  // 1. HR Domain Detection
  const hrKeywords = [
    "human resource", "hr ", "hr-", "talent acquisition", "recruiter", "recruitment",
    "people partner", "people ops", "employee relations", "onboarding", "staffing",
    "labor law", "eeoc", "shrm", "benefits admin", "hris", "workday", "bamboohr", "compensation & benefits"
  ];
  if (hrKeywords.some((k) => query.includes(k))) {
    return { roleTitle: "Human Resources & Talent Acquisition Partner", domain: "HR", taxonomyId: "hr-specialist" };
  }
  if (!query && hrKeywords.some((k) => jd.includes(k))) {
    return { roleTitle: "Human Resources Specialist", domain: "HR", taxonomyId: "hr-specialist" };
  }

  // 2. Marketing Domain Detection
  const marketingKeywords = [
    "marketing", "market ", "growth marketer", "seo", "sem", "growth lead",
    "content marketing", "social media", "copywrit", "digital marketing", "cro", "ppc", "google ads", "meta ads", "demand gen", "campaign"
  ];
  if (marketingKeywords.some((k) => query.includes(k))) {
    return { roleTitle: "Growth Marketing & Digital Campaign Specialist", domain: "MARKETING", taxonomyId: "marketing-growth" };
  }
  if (!query && marketingKeywords.some((k) => jd.includes(k))) {
    return { roleTitle: "Marketing & Growth Specialist", domain: "MARKETING", taxonomyId: "marketing-growth" };
  }

  // 3. Finance Domain Detection
  const financeKeywords = [
    "finance", "financial", "accounting", "accountant", "audit", "budget",
    "tax", "fp&a", "controller", "treasury", "bookkeep", "valuation", "gaap", "ifrs", "dcf", "cpa", "cfa"
  ];
  if (financeKeywords.some((k) => query.includes(k))) {
    return { roleTitle: "Financial Analyst & Corporate Finance Specialist", domain: "FINANCE", taxonomyId: "finance-analyst" };
  }
  if (!query && financeKeywords.some((k) => jd.includes(k))) {
    return { roleTitle: "Financial Analyst", domain: "FINANCE", taxonomyId: "finance-analyst" };
  }

  // 4. Data Analytics Domain Detection
  const dataKeywords = [
    "data analyst", "data analytics", "business intelligence", "bi analyst",
    "power bi", "tableau", "looker", "sql analyst", "data visualization"
  ];
  if (dataKeywords.some((k) => query.includes(k))) {
    return { roleTitle: "Data Analyst & Business Intelligence Specialist", domain: "DATA_ANALYTICS", taxonomyId: "data-analytics" };
  }
  if (!query && dataKeywords.some((k) => jd.includes(k))) {
    return { roleTitle: "Data Analyst", domain: "DATA_ANALYTICS", taxonomyId: "data-analytics" };
  }

  // 5. Product Management Domain Detection
  const productKeywords = [
    "product manager", "product management", "product owner", "group product", "head of product", "technical product manager"
  ];
  if (productKeywords.some((k) => query.includes(k))) {
    return { roleTitle: "Product Manager & Product Strategy Leader", domain: "PRODUCT", taxonomyId: "product-manager" };
  }
  if (!query && productKeywords.some((k) => jd.includes(k))) {
    return { roleTitle: "Product Manager", domain: "PRODUCT", taxonomyId: "product-manager" };
  }

  // 6. Resume Inspection fallback if query and JD didn't match a specific non-software domain
  if (!query && !jd) {
    if (hrKeywords.some((k) => resume.includes(k))) {
      return { roleTitle: "Human Resources Specialist", domain: "HR", taxonomyId: "hr-specialist" };
    }
    if (financeKeywords.some((k) => resume.includes(k))) {
      return { roleTitle: "Financial Analyst", domain: "FINANCE", taxonomyId: "finance-analyst" };
    }
    if (marketingKeywords.some((k) => resume.includes(k))) {
      return { roleTitle: "Marketing Specialist", domain: "MARKETING", taxonomyId: "marketing-growth" };
    }
  }

  // 7. Software Developer Domain (Frontend / Fullstack / Backend)
  if (query.includes("front") || query.includes("react") || query.includes("ui") || query.includes("client") || jd.includes("frontend")) {
    return { roleTitle: "Senior Frontend Engineer", domain: "SOFTWARE_DEV", taxonomyId: "frontend-senior" };
  }
  if (query.includes("full") || query.includes("fullstack") || query.includes("full-stack") || jd.includes("fullstack")) {
    return { roleTitle: "Full-Stack Software Engineer", domain: "SOFTWARE_DEV", taxonomyId: "fullstack-engineer" };
  }

  return { roleTitle: "Senior Backend / Systems Engineer", domain: "SOFTWARE_DEV", taxonomyId: "backend-senior" };
}

/**
 * Strict Domain Validation Layer
 * Verifies that a question strictly belongs to the target profession and discards any unrelated questions.
 */
export function validateQuestionRelevance(
  question: { category: string; question: string; hint?: string },
  domain: ProfessionalDomain,
  targetRoleTitle: string
): boolean {
  const combined = `${question.question} ${question.category} ${question.hint || ""}`.toLowerCase();

  if (domain === "HR") {
    // HR must NEVER contain software/engineering code terms or finance/SEO terms
    const forbidden = ["usecallback", "react", "html", "css", "sql", "git", "api endpoint", "database cpu", "prisma", "docker", "redis", "javascript", "python script", "dcf", "gaap", "on-page seo"];
    if (forbidden.some((term) => combined.includes(term))) return false;
  }

  if (domain === "MARKETING") {
    const forbidden = ["usecallback", "react.memo", "database cpu", "prisma", "docker", "gaap", "depreciation expense", "flsa", "exempt vs non-exempt", "labor law"];
    if (forbidden.some((term) => combined.includes(term))) return false;
  }

  if (domain === "FINANCE") {
    const forbidden = ["usecallback", "react", "html", "css", "docker", "seo", "backlink", "flsa", "onboarding survey", "kubernetes"];
    if (forbidden.some((term) => combined.includes(term))) return false;
  }

  if (domain === "SOFTWARE_DEV") {
    const forbidden = ["labor law", "flsa", "hostile work environment", "gaap", "depreciation expense", "on-page seo", "off-page seo"];
    if (forbidden.some((term) => combined.includes(term))) return false;
  }

  return true;
}

export function matchRoleTaxonomy(
  roleQuery: string,
  jobDescription?: string,
  resumeText?: string
): RoleTaxonomy {
  const detected = detectTargetRoleAndDomain(roleQuery, jobDescription, resumeText);
  return ROLE_TAXONOMIES[detected.taxonomyId] || ROLE_TAXONOMIES["backend-senior"];
}

export interface DetailedAnalysisResult {
  overallRoleReadinessScore: number;
  specificJobMatchScore: number;
  isJobDescriptionProvided: boolean;
  currentExperienceLevel: string;
  markdownReport: string;
  questions?: QuizQuestion[];
  domain: ProfessionalDomain;
  targetRoleTitle: string;
}

/**
 * Performs conversational, actionable heuristic career coach analysis
 */
export function analyzeResumeHeuristically(
  resumeText: string,
  targetRoleQuery: string,
  jobDescription?: string
): DetailedAnalysisResult {
  const detected = detectTargetRoleAndDomain(targetRoleQuery, jobDescription, resumeText);
  const taxonomy = ROLE_TAXONOMIES[detected.taxonomyId] || ROLE_TAXONOMIES["backend-senior"];
  const textLower = (resumeText || "").toLowerCase();
  const jdLower = (jobDescription || "").toLowerCase().trim();
  const hasJd = jdLower.length > 30;

  const checkPresence = (skillName: string): boolean => {
    const tokens = skillName.toLowerCase().split(/[\s/(),-]+/).filter((t) => t.length > 2);
    return tokens.some((token) => textLower.includes(token));
  };

  const demonstrated: string[] = [];
  const partiallyDemonstrated: string[] = [];
  const notMentioned: RoleTaxonomy["coreSkills"] = [];

  const allTaxonomySkills = [...taxonomy.coreSkills, ...taxonomy.architectureSkills, ...taxonomy.productionRigor];

  allTaxonomySkills.forEach((skill) => {
    const found = checkPresence(skill.name);
    if (found) {
      if (textLower.includes(skill.name.toLowerCase())) {
        demonstrated.push(skill.name);
      } else {
        partiallyDemonstrated.push(skill.name);
      }
    } else {
      notMentioned.push(skill);
    }
  });

  const metricMatches = (resumeText.match(/\b\d+(%|ms|s|k|m|x)\b|\$\d+/gi) || []).length;
  const projectCount = (resumeText.match(/•|technical projects|project:|experience|responsibilities/gi) || []).length;

  const demonstratedWeight = demonstrated.length * 8;
  const partialWeight = partiallyDemonstrated.length * 4;
  const metricBonus = Math.min(18, metricMatches * 3.5);
  const projectBonus = Math.min(14, projectCount * 3);

  const rawReadiness = Math.round(demonstratedWeight + partialWeight + metricBonus + projectBonus);
  const overallReadinessScore = Math.min(94, Math.max(30, rawReadiness));

  let currentLevel = "Associate / Junior Professional";
  if (overallReadinessScore >= 80) currentLevel = "Senior Specialist / Lead";
  else if (overallReadinessScore >= 65) currentLevel = "Mid-Level Professional";
  else if (overallReadinessScore < 45) currentLevel = "Early Career / Junior";

  let specificJobMatchScore = 0;
  if (hasJd) {
    const jdWords = jdLower.split(/[\s,.;:()/\n]+/).filter((w) => w.length > 3);
    const matchedJdWords = jdWords.filter((w) => textLower.includes(w));
    const jdRatio = matchedJdWords.length / Math.max(1, jdWords.length);
    specificJobMatchScore = Math.min(95, Math.max(30, Math.round(jdRatio * 85 + (demonstrated.length > 4 ? 12 : 5))));
  } else {
    specificJobMatchScore = Math.max(25, overallReadinessScore - 4);
  }

  const criticalGaps = notMentioned.filter((s) => s.priority === "Critical");
  const importantGaps = notMentioned.filter((s) => s.priority === "Important");
  const topPriorities = criticalGaps.concat(importantGaps).slice(0, 3);
  const capstone = taxonomy.capstoneBlueprints[0];

  // Strictly filter and format questions ensuring domain fidelity
  const validatedQuestions: QuizQuestion[] = taxonomy.sampleInterviewQuestions
    .filter((q) => validateQuestionRelevance(q, taxonomy.domain, taxonomy.title))
    .slice(0, 3)
    .map((q, idx) => ({
      id: `q-${idx + 1}`,
      category: q.category,
      difficulty: q.difficulty,
      question: q.question,
      hint: q.hint,
      whatInterviewerEvaluates: q.whatInterviewerEvaluates,
    }));

  // Domain-specific simple terms narrative
  let domainSimpleTerms = "You have a solid grasp of core fundamentals and common workflows. To become fully competitive for **" + taxonomy.title + "** roles, your main goal is proving hands-on experience in specialized domain frameworks, automated rigor, and measurable impact.";
  if (taxonomy.domain === "HR") {
    domainSimpleTerms = `You have proven foundational capabilities in human resources and employee support. To become fully competitive for **${taxonomy.title}** roles, your primary objective is demonstrating leadership in structured recruitment calibration, labor law compliance (FLSA/EEOC), and data-driven employee retention.`;
  } else if (taxonomy.domain === "MARKETING") {
    domainSimpleTerms = `You have strong creative and campaign execution capabilities. To become fully competitive for **${taxonomy.title}** roles, your primary objective is proving mastery in multi-touch attribution, conversion rate optimization (CRO), and capital-efficient unit economics (CAC:LTV).`;
  } else if (taxonomy.domain === "FINANCE") {
    domainSimpleTerms = `You have solid quantitative and financial capabilities. To become fully competitive for **${taxonomy.title}** roles, your primary objective is showcasing integrated 3-statement financial modeling, departmental budget variance analysis, and capital allocation decision-making.`;
  } else if (taxonomy.domain === "DATA_ANALYTICS") {
    domainSimpleTerms = `You have strong analytical intuition and query capabilities. To become fully competitive for **${taxonomy.title}** roles, your primary objective is demonstrating advanced SQL window function mastery, dimensional data warehousing, and statistically sound experimentation.`;
  } else if (taxonomy.domain === "PRODUCT") {
    domainSimpleTerms = `You have strong user empathy and feature delivery capabilities. To become fully competitive for **${taxonomy.title}** roles, your primary objective is proving structured prioritization (RICE), technical PRD authoring, and North Star metric definition.`;
  }

  // Domain-specific roadmap steps
  let step1 = "Step 1: Core Domain Foundations (Weeks 1-2) — Master essential tools and standardized workflows.";
  let step2 = "Step 2: Practical Optimization & Analysis (Weeks 3-4) — Deepen diagnostic frameworks, compliance, and efficiency.";
  let step3 = "Step 3: Strategic Portfolio Showcase (Weeks 5-6) — Author a comprehensive capstone initiative solving high-impact challenges.";

  if (taxonomy.domain === "HR") {
    step1 = "Step 1: Structured Sourcing & Rubrics (Weeks 1-2) — Master ATS pipeline stages, Boolean search, and competency-based interview scoring rubrics.";
    step2 = "Step 2: Compliance & Workplace Relations (Weeks 3-4) — Deepen command of wage-and-hour compliance (FLSA), grievance investigation protocols, and onboarding frameworks.";
    step3 = "Step 3: People Analytics & Retention (Weeks 5-6) — Build an employee engagement scorecard tracking attrition cohorts, eNPS, and offer acceptance velocity.";
  } else if (taxonomy.domain === "MARKETING") {
    step1 = "Step 1: High-Intent SEO & Content Clustering (Weeks 1-2) — Perform keyword intent mapping, technical crawl audits, and Core Web Vitals optimization.";
    step2 = "Step 2: Paid Acquisition & CRO Experiments (Weeks 3-4) — Implement landing page A/B tests, message-match alignment, and custom event tracking in GA4.";
    step3 = "Step 3: Unit Economics & Attribution (Weeks 5-6) — Build an executive dashboard modeling blended CAC, payback velocity, and customer lifetime value (LTV).";
  } else if (taxonomy.domain === "FINANCE") {
    step1 = "Step 1: 3-Statement Modeling Integration (Weeks 1-2) — Master dynamic mechanical linkages between Income Statement, Balance Sheet, and Cash Flow Statement in Excel.";
    step2 = "Step 2: FP&A Variance Decomposition (Weeks 3-4) — Isolate price vs volume variances and build rolling department forecasts with expense controls.";
    step3 = "Step 3: Valuation & Capital Allocation (Weeks 5-6) — Construct DCF valuation models with WACC sensitivity tables and debt vs equity scenario planning.";
  } else if (taxonomy.domain === "DATA_ANALYTICS") {
    step1 = "Step 1: Advanced Analytical SQL (Weeks 1-2) — Master complex CTEs, window functions (ROW_NUMBER, DENSE_RANK, LEAD/LAG), and running totals.";
    step2 = "Step 2: Dimensional Modeling & dbt (Weeks 3-4) — Design star schemas with fact and dimension tables and automated data tests.";
    step3 = "Step 3: Executive BI Dashboards (Weeks 5-6) — Build interactive Power BI/Tableau dashboards with statistical A/B test evaluation scorecards.";
  } else if (taxonomy.domain === "PRODUCT") {
    step1 = "Step 1: Problem Discovery & User Research (Weeks 1-2) — Conduct JTBD customer interviews and validate real pain points before scoping solutions.";
    step2 = "Step 2: Quantitative Prioritization & PRDs (Weeks 3-4) — Score feature backlogs using the RICE framework and author comprehensive technical PRDs.";
    step3 = "Step 3: North Star Metrics & PMF (Weeks 5-6) — Define retention curves, leading indicators, and go-to-market release strategies.";
  }

  // Domain-specific 7-day starter plan
  let starterPlanItems = [
    "- [ ] **Day 1:** Audit your current resume against modern ATS parsing standards.",
    "- [ ] **Day 2:** Draft a structured rubric with 5 core evaluation criteria for your target role.",
    "- [ ] **Day 3:** Research industry benchmark standards and diagnostic frameworks for your profession.",
    "- [ ] **Day 4:** Document an end-to-end practical workflow solving a common workplace bottleneck.",
    "- [ ] **Day 5:** Establish measurable KPI metrics to track and quantify your project outcomes.",
    "- [ ] **Day 6:** Rewrite 2 resume bullets using the Google XYZ formula: *Accomplished [X], measured by [Y], by doing [Z]*.",
    "- [ ] **Day 7:** Practice answering the 3 interview questions above and review your progress!",
  ];

  if (taxonomy.domain === "HR") {
    starterPlanItems = [
      "- [ ] **Day 1:** Audit your resume to ensure recruitment metrics and ATS keywords are prominently featured.",
      "- [ ] **Day 2:** Draft a competency-based interview rubric with 5 behavioral criteria for a high-priority role.",
      "- [ ] **Day 3:** Review FLSA exempt vs non-exempt salary threshold and duties tests to refresh compliance knowledge.",
      "- [ ] **Day 4:** Outline a structured 30-60-90 day employee onboarding roadmap.",
      "- [ ] **Day 5:** Calculate recruiting funnel drop-off metrics (time-to-hire, offer acceptance rate).",
      "- [ ] **Day 6:** Rewrite 2 resume bullets using the Google XYZ formula: *Accomplished [X], measured by [Y], by doing [Z]*.",
      "- [ ] **Day 7:** Practice answering the 3 HR interview questions above and review progress!",
    ];
  } else if (taxonomy.domain === "MARKETING") {
    starterPlanItems = [
      "- [ ] **Day 1:** Perform a technical SEO audit on your portfolio or sample site identifying crawl errors.",
      "- [ ] **Day 2:** Map 3 high-intent keyword topic clusters with search volume and user intent.",
      "- [ ] **Day 3:** Configure custom event tracking and conversion goals in Google Analytics 4 (GA4).",
      "- [ ] **Day 4:** Design an A/B test brief comparing value-proposition variations on a landing page.",
      "- [ ] **Day 5:** Model blended CAC across paid vs organic acquisition channels.",
      "- [ ] **Day 6:** Rewrite 2 resume bullets using the Google XYZ formula: *Accomplished [X], measured by [Y], by doing [Z]*.",
      "- [ ] **Day 7:** Practice answering the 3 Marketing interview questions above and review progress!",
    ];
  } else if (taxonomy.domain === "FINANCE") {
    starterPlanItems = [
      "- [ ] **Day 1:** Build a dynamically linked 3-statement model connecting Net Income to Cash Flow and Balance Sheet.",
      "- [ ] **Day 2:** Eliminate circular interest calculations cleanly using average debt or flag logic.",
      "- [ ] **Day 3:** Decompose quarterly operating variance into price and volume drivers.",
      "- [ ] **Day 4:** Build an Excel scenario manager comparing bull, base, and bear operating assumptions.",
      "- [ ] **Day 5:** Model company WACC using CAPM and current corporate debt interest rates.",
      "- [ ] **Day 6:** Rewrite 2 resume bullets using the Google XYZ formula: *Accomplished [X], measured by [Y], by doing [Z]*.",
      "- [ ] **Day 7:** Practice answering the 3 Finance interview questions above and review progress!",
    ];
  } else if (taxonomy.domain === "SOFTWARE_DEV") {
    starterPlanItems = [
      "- [ ] **Day 1:** Install automated tests in your top project and run your first test.",
      "- [ ] **Day 2:** Write tests covering user login and form validation edge cases.",
      "- [ ] **Day 3:** Read about database indexing and inspect slow queries using \`EXPLAIN ANALYZE\`.",
      "- [ ] **Day 4:** Add a composite database index to your project and verify the query speedup.",
      "- [ ] **Day 5:** Create a basic GitHub Actions workflow that runs your tests on every push.",
      "- [ ] **Day 6:** Rewrite 2 resume bullets using the Google XYZ formula: *Accomplished [X], measured by [Y], by doing [Z]*.",
      "- [ ] **Day 7:** Practice answering the 3 interview questions above and review your progress!",
    ];
  }

  // Domain-specific Google XYZ resume rewrites
  let rewrite1Before = "Worked on API endpoints and database integration for the team.";
  let rewrite1After = `Architected 12 RESTful API endpoints using ${taxonomy.coreSkills[0]?.name || "modern tools"}, reducing payload size by 35% and implementing database indexing to achieve sub-40ms p95 latency.`;
  let rewrite2Before = "Wrote tests and deployed the application to cloud.";
  let rewrite2After = "Implemented automated end-to-end testing with Playwright across core user workflows and built a GitHub Actions CI/CD pipeline, reducing release bugs by 60%.";

  if (taxonomy.domain === "HR") {
    rewrite1Before = "Handled recruiting and interviewed applicants for company openings.";
    rewrite1After = "Orchestrated full-lifecycle recruitment for 42+ positions across 6 departments using Greenhouse ATS, reducing average time-to-hire from 48 to 28 days while achieving an 89% offer acceptance rate.";
    rewrite2Before = "Managed employee relations and resolved workplace complaints.";
    rewrite2After = "Investigated and resolved 100% of employee grievances through documented mediation protocols, mitigating workplace litigation risk and improving team retention by 18%.";
  } else if (taxonomy.domain === "MARKETING") {
    rewrite1Before = "Ran marketing campaigns and managed company social media accounts.";
    rewrite1After = "Architected an omnichannel content engine across 12 high-intent keyword clusters, increasing organic inbound traffic by 64% and generating $340K in verified pipeline.";
    rewrite2Before = "Managed paid ad campaigns and Google Analytics.";
    rewrite2After = "Optimized paid search campaigns across Google Ads and LinkedIn, lowering Customer Acquisition Cost (CAC) by 32% while boosting landing page conversion rate from 1.1% to 3.6%.";
  } else if (taxonomy.domain === "FINANCE") {
    rewrite1Before = "Helped with financial modeling and monthly budget reports.";
    rewrite1After = "Constructed an integrated 3-statement financial model with multi-scenario forecasting across 8 departments, uncovering $420K in operating cost efficiencies and improving forecast accuracy by 19%.";
    rewrite2Before = "Assisted with accounting reconciliations and audit prep.";
    rewrite2After = "Led month-end financial reconciliations across 14 ledger accounts and enforced ASC 606 revenue recognition controls, accelerating financial close turnaround by 5 business days.";
  } else if (taxonomy.domain === "DATA_ANALYTICS") {
    rewrite1Before = "Wrote SQL queries and generated weekly reports for management.";
    rewrite1After = "Authored optimized SQL data models utilizing window functions and CTEs across 15M+ rows, reducing dashboard query latency by 72% and automating executive KPI delivery.";
    rewrite2Before = "Created dashboards in Tableau for business teams.";
    rewrite2After = "Architected an executive Tableau retention dashboard with cohort heatmaps, enabling leadership to detect onboarding drop-off and boosting 30-day user retention by 14%.";
  } else if (taxonomy.domain === "PRODUCT") {
    rewrite1Before = "Managed product features and wrote tickets for developers.";
    rewrite1After = "Authored 8 comprehensive Product Requirement Documents (PRDs) with user stories and telemetry specs, delivering a core onboarding redesign that lifted conversion by 26%.";
    rewrite2Before = "Prioritized user feature requests with the team.";
    rewrite2After = "Implemented the RICE prioritization framework across a 60+ item backlog, aligning engineering and sales leadership while eliminating 35% of low-impact feature churn.";
  }

  const markdownReport = `
# 🚀 Your Personalized Career Coach Report

---

## 🎯 Your Scores at a Glance

### 1. Overall Role Readiness Score: **${overallReadinessScore}%**
* **Your Assessed Level:** **${currentLevel}**
* **In Simple Terms:** ${domainSimpleTerms}

### 2. Specific Job Match Score: **${specificJobMatchScore}%** (${hasJd ? "Matched to your Job Description" : "Industry Benchmark"})
* **What this means:** ${hasJd ? `Your resume matches approximately ${specificJobMatchScore}% of the requirements listed in the job description you attached.` : `Based on standard hiring criteria across companies, you currently align with about ${specificJobMatchScore}% of the expected qualifications for **${taxonomy.title}**. (Paste a specific job description to get an exact match score!).`}

---

## 🔍 What You Have vs. What You Are Missing
> 💡 *Note: Skills marked "Missing from Resume" may simply be omitted from your resume text — you might already know some of them!*

### 🌟 Your Strongest Demonstrated Skills
${demonstrated.slice(0, 4).map((s) => `* **${s}**: Clearly visible in your experience and project descriptions.`).join("\n") || "* Foundational concepts detected in your background."}

### ⚠️ Skills That Need More Proof (Partially Demonstrated)
${partiallyDemonstrated.slice(0, 3).map((s) => `* **${s}**: Mentioned on your resume, but lacks project bullets demonstrating scale or concrete impact.`).join("\n") || "* All detected skills have matching context."}

### 🔴 High-Priority Skills Missing from Your Resume
${criticalGaps.slice(0, 3).map((s) => `* **${s.name}** *(Critical)*: ${s.whyItMatters} Employers expect ${s.expectedProficiency.toLowerCase()}`).join("\n\n") || "* No critical gaps detected! You cover the core role stack well."}

---

## ⚡ What Should You Do Next? (Your Top 3 Priorities)
Based on your actual background and target role requirements, focus on these top 3 high-impact actions first:

${topPriorities.map((p, idx) => `### 🎯 Priority ${idx + 1}: ${p.name}
* **What to learn:** ${p.expectedProficiency}
* **Why it matters:** ${p.whyItMatters}
* **Practical task:** ${p.practiceAdvice}
* **Estimated time:** 2–4 hours of focused practice.`).join("\n\n")}

---

## 🗺️ Phased Learning Roadmap

### Phase 1: Core Fundamentals & Quick Wins (Weeks 1–2)
* **Milestone:** ${step1}
* **Focus:** Master essential tools and terminology, address high-priority gaps, and set up your development environment.

### Phase 2: Practical Projects & Implementation (Weeks 3–4)
* **Milestone:** ${step2}
* **Focus:** Build production-grade features, integrate core workflows, and write automated tests or documentation.

### Phase 3: Advanced Optimization & Interview Readiness (Weeks 5–6)
* **Milestone:** ${step3}
* **Focus:** System-level optimization, architecture tradeoffs, and polishing your portfolio project.

---

## 📅 Your 7-Day Starter Plan (Check off as you complete!)
${starterPlanItems.join("\n")}

---

<details>
<summary>🔍 <strong>Click to view Recommended Portfolio Project & Resume Rewrites</strong></summary>

### Recommended Project: **${capstone.title}**
* **The Problem:** ${capstone.problemStatement}
* **Recommended Stack / Tools:** \`${capstone.techStack}\`
* **Core Deliverables:** ${capstone.coreFeatures.join(", ")}
* **What Recruiters Look For:** ${capstone.recruiterEvaluationCriteria.join(", ")}

### High-Impact Resume Rewrites (Google XYZ Formula)
* ❌ *Before:* "${rewrite1Before}"
* ✅ *After:* **"${rewrite1After}"**

* ❌ *Before:* "${rewrite2Before}"
* ✅ *After:* **"${rewrite2After}"**
</details>
`;

  return {
    overallRoleReadinessScore: overallReadinessScore,
    specificJobMatchScore: specificJobMatchScore,
    isJobDescriptionProvided: hasJd,
    currentExperienceLevel: currentLevel,
    markdownReport,
    domain: taxonomy.domain,
    targetRoleTitle: taxonomy.title,
  };
}

/**
 * Extracts structured interview quiz questions from raw Markdown text.
 * Works seamlessly across AI-generated and heuristically-generated responses.
 */
export function extractQuizQuestionsFromMarkdown(markdown: string): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const lines = markdown.split("\n");
  let currentQ: Partial<QuizQuestion> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Match question header: ### Q1: Category — *Difficulty* or ### Q1: Category
    const qMatch = line.match(/^###\s+Q(\d+)[:\.]?\s*(.*?)(?:—\s*\*(.*?)\*)?$/i);
    if (qMatch) {
      if (currentQ && currentQ.question) {
        questions.push(currentQ as QuizQuestion);
      }
      const rawCategory = qMatch[2]?.trim() || `Question ${qMatch[1]}`;
      const rawDifficulty = (qMatch[3]?.trim() as "Fundamental" | "Intermediate" | "Advanced") || "Intermediate";
      const difficulty = ["Fundamental", "Intermediate", "Advanced"].includes(rawDifficulty) ? rawDifficulty : "Intermediate";

      currentQ = {
        id: `q-${qMatch[1]}`,
        category: rawCategory,
        difficulty,
        question: "",
        hint: "",
        whatInterviewerEvaluates: "",
      };
      continue;
    }

    if (currentQ) {
      // Match blockquote question text: > **"Question"** or > "Question"
      if (line.startsWith(">")) {
        const qText = line
          .replace(/^>\s*/, "")
          .replace(/^\*\*"?/, "")
          .replace(/"?\*\*$/, "")
          .replace(/^"/, "")
          .replace(/"$/, "")
          .trim();
        if (qText && !qText.startsWith("💡") && !qText.startsWith("*")) {
          currentQ.question = currentQ.question ? `${currentQ.question} ${qText}` : qText;
        }
      } else if (line.includes("💡 **Hint:**") || line.includes("💡 Hint:")) {
        currentQ.hint = line.replace(/.*💡\s*\**Hint:\**\s*/i, "").trim();
      } else if (line.includes("Evaluates:") || line.includes("evaluating:")) {
        currentQ.whatInterviewerEvaluates = line.replace(/.*(?:Evaluates:|evaluating:)\s*/i, "").trim();
      } else if (line.startsWith("---") || (line.startsWith("## ") && !line.includes("Quick Practice"))) {
        if (currentQ.question) {
          questions.push(currentQ as QuizQuestion);
          currentQ = null;
        }
      }
    }
  }

  if (currentQ && currentQ.question) {
    questions.push(currentQ as QuizQuestion);
  }

  return questions;
}

/**
 * Intelligent Heuristic Quiz Evaluator
 * Evaluates semantic concepts, supports partial credit, and provides concise, actionable feedback.
 */
export function evaluateQuizAnswerHeuristically(params: QuizEvaluateRequest): QuizAnswerEvaluation {
  const answer = (params.userAnswer || "").trim();
  const lowerAnswer = answer.toLowerCase();
  const lowerQuestion = (params.question || "").toLowerCase();
  const category = params.category || "General Engineering";

  // 1. Edge Case: Empty or low-effort responses
  if (
    !answer ||
    answer.length < 15 ||
    ["idk", "i don't know", "skip", "no idea", "pass", "not sure", "none"].includes(lowerAnswer)
  ) {
    return {
      status: "incorrect",
      statusLabel: "Needs Improvement",
      score: 2,
      conceptExplanation: params.hint
        ? `Core concept: ${params.hint}`
        : "In professional interviews, interviewers look for clear reasoning around mechanisms, trade-offs, and practical edge cases.",
      userAnswerReview: "No substantive explanation was provided. Aim to walk through the underlying concept or methodology step-by-step.",
      exampleOrCorrection: "Tip: Even when unsure, start by defining the problem, propose a structured framework or tool, and discuss trade-offs.",
      topicToRevise: category,
    };
  }

  // 2. HR Domain - FLSA / Exempt vs Non-Exempt
  if (lowerQuestion.includes("exempt") || lowerQuestion.includes("flsa") || lowerQuestion.includes("misclassif")) {
    const hasOvertime = lowerAnswer.includes("overtime") || lowerAnswer.includes("1.5") || lowerAnswer.includes("hours");
    const hasSalaryOrDuties = lowerAnswer.includes("salary") || lowerAnswer.includes("threshold") || lowerAnswer.includes("duties") || lowerAnswer.includes("executive") || lowerAnswer.includes("professional");
    const hasRisk = lowerAnswer.includes("back pay") || lowerAnswer.includes("penalt") || lowerAnswer.includes("lawsuit") || lowerAnswer.includes("liabilit") || lowerAnswer.includes("audit") || lowerAnswer.includes("legal");

    if (hasOvertime && (hasSalaryOrDuties || hasRisk)) {
      return {
        status: "correct",
        statusLabel: "Correct",
        score: 10,
        conceptExplanation:
          "Under the FLSA, non-exempt employees are legally entitled to overtime pay (1.5x regular pay for hours worked over 40/week), whereas exempt employees are paid a fixed salary and meet specific job duties tests.",
        userAnswerReview:
          "What was right: Excellent answer. You clearly identified overtime eligibility distinctions and addressed the salary/duties test or legal liabilities associated with misclassification.",
        exampleOrCorrection:
          "Best practice: Regularly audit job descriptions against current salary thresholds and the three primary FLSA exemption categories (Executive, Administrative, Professional).",
      };
    }
    if (hasOvertime || hasSalaryOrDuties) {
      return {
        status: "partially_correct",
        statusLabel: "Partially Correct",
        score: 7,
        conceptExplanation:
          "Exemption status depends on three legal tests: (1) Salary-level test, (2) Salary-basis test, and (3) Job duties test. Non-exempt workers must receive overtime pay.",
        userAnswerReview:
          "What was right: You correctly identified the overtime component. What was missing: Be sure to mention the formal duties tests and the financial liabilities (e.g. liquidated damages and back-pay penalties) of misclassifying employees.",
        exampleOrCorrection:
          "Correction: Remember to mention both the salary threshold and the substantive job duties evaluation.",
        topicToRevise: "FLSA Wage & Hour Regulations",
      };
    }
  }

  // 3. HR Domain - Workplace Grievance & Conflict Investigation
  if (lowerQuestion.includes("favoritism") || lowerQuestion.includes("hostile work") || lowerQuestion.includes("grievance") || lowerQuestion.includes("investigat")) {
    const hasFactFinding = lowerAnswer.includes("confidential") || lowerAnswer.includes("separate") || lowerAnswer.includes("interview") || lowerAnswer.includes("fact") || lowerAnswer.includes("document");
    const hasResolution = lowerAnswer.includes("retaliat") || lowerAnswer.includes("action") || lowerAnswer.includes("resolution") || lowerAnswer.includes("pip") || lowerAnswer.includes("training") || lowerAnswer.includes("report");

    if (hasFactFinding && hasResolution) {
      return {
        status: "correct",
        statusLabel: "Correct",
        score: 10,
        conceptExplanation:
          "A defensible workplace investigation requires prompt, confidential fact-finding, interviewing parties separately, gathering corroborating records, protecting against retaliation, and issuing a documented resolution.",
        userAnswerReview:
          "What was right: Thorough answer demonstrating HR procedural fairness, objective documentation, and anti-retaliation safeguards.",
        exampleOrCorrection:
          "Key takeaway: Always document interview notes immediately and follow up with the reporting employee after 30 days to ensure zero retaliation.",
      };
    }
    if (hasFactFinding || hasResolution) {
      return {
        status: "partially_correct",
        statusLabel: "Partially Correct",
        score: 6,
        conceptExplanation:
          "Investigating grievances requires balancing thorough fact-gathering with legal risk mitigation and explicit anti-retaliation assurances.",
        userAnswerReview:
          "What was right: Good intuition on speaking with involved parties. What was missing: Emphasize formal documentation, confidentiality boundaries, and explicitly reiterating the company's anti-retaliation policy.",
        exampleOrCorrection:
          "Best practice: Structure your response using: (1) Initial intake, (2) Evidence collection, (3) Separate interviews, (4) Findings synthesis, and (5) Action plan.",
        topicToRevise: "Workplace Investigation Procedures",
      };
    }
  }

  // 4. Marketing Domain - SEO Fundamentals
  if (lowerQuestion.includes("on-page seo") || lowerQuestion.includes("off-page") || lowerQuestion.includes("technical seo")) {
    const hasContentOrMeta = lowerAnswer.includes("content") || lowerAnswer.includes("keyword") || lowerAnswer.includes("meta") || lowerAnswer.includes("title");
    const hasBacklinks = lowerAnswer.includes("backlink") || lowerAnswer.includes("authority") || lowerAnswer.includes("link");
    const hasTechnical = lowerAnswer.includes("crawl") || lowerAnswer.includes("speed") || lowerAnswer.includes("index") || lowerAnswer.includes("sitemap") || lowerAnswer.includes("core web");

    if (hasContentOrMeta && (hasBacklinks || hasTechnical)) {
      return {
        status: "correct",
        statusLabel: "Correct",
        score: 10,
        conceptExplanation:
          "On-page SEO optimizes visible content and meta tags; Off-page SEO builds domain trust and backlink equity; Technical SEO optimizes site crawlability, indexing, and Core Web Vitals performance.",
        userAnswerReview:
          "What was right: Excellent distinction across the three core pillars of organic search engine optimization.",
        exampleOrCorrection:
          "Pro tip: Search engines evaluate technical crawl health before content relevance can even be indexed.",
      };
    }
    if (hasContentOrMeta || hasBacklinks || hasTechnical) {
      return {
        status: "partially_correct",
        statusLabel: "Partially Correct",
        score: 7,
        conceptExplanation:
          "SEO requires harmonizing on-page content relevance, off-page authority signals, and technical site architecture.",
        userAnswerReview:
          "What was right: You clearly understand one or two pillars. What was missing: Make sure to clearly contrast content optimization (on-page), backlink profiles (off-page), and technical crawlability (technical SEO).",
        exampleOrCorrection:
          "Correction: Clearly define how technical factors like robots.txt and sitemaps enable Google to index your on-page keywords.",
        topicToRevise: "Holistic SEO Architecture",
      };
    }
  }

  // 5. Finance Domain - $100 Depreciation 3-Statement Flow
  if (lowerQuestion.includes("depreciation") && (lowerQuestion.includes("three") || lowerQuestion.includes("statement"))) {
    const mentionsNetIncomeDown = lowerAnswer.includes("80") || lowerAnswer.includes("net income") || lowerAnswer.includes("operating income") || lowerAnswer.includes("pre-tax");
    const mentionsCashUp = lowerAnswer.includes("20") || lowerAnswer.includes("cash flow") || lowerAnswer.includes("non-cash") || lowerAnswer.includes("cash increase");
    const mentionsBalanceSheet = lowerAnswer.includes("balance sheet") || lowerAnswer.includes("pp&e") || lowerAnswer.includes("retained earnings") || lowerAnswer.includes("assets");

    if (mentionsNetIncomeDown && mentionsCashUp) {
      return {
        status: "correct",
        statusLabel: "Correct",
        score: 10,
        conceptExplanation:
          "On the Income Statement, Operating Income drops by $100 and Net Income falls by $80 (with 20% tax). On Cash Flow, the $100 non-cash expense is added back, netting +$20 cash from operations. On the Balance Sheet, Cash is +$20 and PP&E is -$100 (net Assets -$80), balanced by Retained Earnings down $80.",
        userAnswerReview:
          "What was right: Outstanding answer. You demonstrated precise mechanical mastery of how non-cash accounting adjustments flow through all three financial statements.",
        exampleOrCorrection:
          "Summary formula: Operating Income -$100 -> Net Income -$80 -> Cash from Ops +$20 -> Cash +$20, Net PP&E -$100, Equity -$80.",
      };
    }
    if (mentionsNetIncomeDown || mentionsCashUp) {
      return {
        status: "partially_correct",
        statusLabel: "Partially Correct",
        score: 6,
        conceptExplanation:
          "Depreciation is a non-cash expense that shields operating income from taxes, creating a positive cash flow impact.",
        userAnswerReview:
          "What was right: You understand the tax shield or net income impact. What was missing: Be sure to trace the complete loop to the Balance Sheet (PP&E drops by $100, Cash increases by $20, Retained Earnings drops by $80).",
        exampleOrCorrection:
          "Remember: Assets (Cash +$20, PP&E -$100 = -$80) must balance Liabilities & Equity (Retained Earnings -$80).",
        topicToRevise: "3-Statement Financial Linkages",
      };
    }
  }

  // 2. React Re-renders / useCallback / memo evaluation
  if (lowerQuestion.includes("re-render") || lowerQuestion.includes("usecallback") || lowerQuestion.includes("child component")) {
    const mentionsCallbackOrRef =
      lowerAnswer.includes("usecallback") ||
      lowerAnswer.includes("callback") ||
      lowerAnswer.includes("memoiz") ||
      lowerAnswer.includes("reference") ||
      lowerAnswer.includes("function reference") ||
      lowerAnswer.includes("identity");

    const mentionsMemoOrShallow =
      lowerAnswer.includes("react.memo") ||
      lowerAnswer.includes("memo(") ||
      lowerAnswer.includes("purecomponent") ||
      lowerAnswer.includes("shallow") ||
      lowerAnswer.includes("prop comparison") ||
      lowerAnswer.includes("props haven't changed");

    if (mentionsCallbackOrRef && mentionsMemoOrShallow) {
      return {
        status: "correct",
        statusLabel: "Correct",
        score: 10,
        conceptExplanation:
          "Functions in JavaScript create new memory references on every render. Wrapping the function in `useCallback` preserves its reference, and wrapping the child in `React.memo` enables shallow prop comparison to skip rendering.",
        userAnswerReview:
          "What was right: Excellent answer. You clearly identified both halves of the puzzle: preserving function reference equality with `useCallback` AND ensuring the child component performs shallow comparison via `React.memo`.",
        exampleOrCorrection:
          "Example:\n`const handleClick = useCallback(() => doSomething(), [deps]);`\n`const Child = React.memo(({ onClick }) => <button onClick={onClick} />);`",
      };
    }

    if (mentionsCallbackOrRef && !mentionsMemoOrShallow) {
      return {
        status: "partially_correct",
        statusLabel: "Partially Correct",
        score: 7,
        conceptExplanation:
          "`useCallback` memoizes the function instance so its reference doesn't change between renders. However, child components still re-render by default when a parent renders unless they are wrapped in `React.memo`.",
        userAnswerReview:
          "What was right: You correctly identified that `useCallback` preserves function reference equality. What was missing: `useCallback` alone will NOT stop child components from re-rendering unless the child component is also wrapped in `React.memo` (or implements shallow prop checks).",
        exampleOrCorrection:
          "Correction: Pair `useCallback` with `const Child = React.memo(...)` so the memoized prop reference actually prevents the child's render pass.",
        topicToRevise: "Component Lifecycle & React.memo",
      };
    }
  }

  // 3. Web Vitals / INP / Long Tasks / Sluggishness
  if (lowerQuestion.includes("inp") || lowerQuestion.includes("sluggish") || lowerQuestion.includes("main thread") || lowerQuestion.includes("devtools")) {
    const mentionsProfiling =
      lowerAnswer.includes("performance") ||
      lowerAnswer.includes("devtools") ||
      lowerAnswer.includes("profiler") ||
      lowerAnswer.includes("long task") ||
      lowerAnswer.includes("main thread") ||
      lowerAnswer.includes("cpu");

    const mentionsRemediation =
      lowerAnswer.includes("worker") ||
      lowerAnswer.includes("break") ||
      lowerAnswer.includes("yield") ||
      lowerAnswer.includes("chunk") ||
      lowerAnswer.includes("requestidlecallback") ||
      lowerAnswer.includes("debounce") ||
      lowerAnswer.includes("throttle") ||
      lowerAnswer.includes("async") ||
      lowerAnswer.includes("optimize");

    if (mentionsProfiling && mentionsRemediation) {
      return {
        status: "correct",
        statusLabel: "Correct",
        score: 10,
        conceptExplanation:
          "INP (Interaction to Next Paint) measures responsiveness to user input. High INP is almost always caused by Long Tasks (>50ms) blocking the browser's main thread during user events.",
        userAnswerReview:
          "What was right: You described a complete engineering workflow: first measuring with Chrome DevTools Performance profiler to spot long tasks, then mitigating the blockage by breaking up or deferring heavy computations.",
        exampleOrCorrection:
          "Example: Use `scheduler.yield()` or `requestIdleCallback` to yield execution back to the browser between chunks of heavy client-side work.",
      };
    }

    if (mentionsProfiling || mentionsRemediation) {
      return {
        status: "partially_correct",
        statusLabel: "Partially Correct",
        score: 6,
        conceptExplanation:
          "INP diagnosis requires two steps: (1) Profiling the main thread in Chrome DevTools to locate long tasks (>50ms), and (2) Breaking up synchronous event handlers.",
        userAnswerReview:
          "What was right: Good intuition on identifying performance tools. What was missing: Make sure to explain how you isolate Long Tasks (>50ms) on the main thread and specifically how you yield control back to the browser (e.g. using Web Workers or `scheduler.yield()`).",
        exampleOrCorrection:
          "Next step: Mention inspecting the 'Interactions' track in Chrome DevTools to see input delay, processing time, and presentation delay breakdown.",
        topicToRevise: "Core Web Vitals & Main Thread Profiling",
      };
    }
  }

  // 4. Server-Client State Synchronization
  if (lowerQuestion.includes("state synchronization") || lowerQuestion.includes("server and the client") || lowerQuestion.includes("sync")) {
    const hasQueryLib =
      lowerAnswer.includes("tanstack") ||
      lowerAnswer.includes("react query") ||
      lowerAnswer.includes("swr") ||
      lowerAnswer.includes("rtk query") ||
      lowerAnswer.includes("cache") ||
      lowerAnswer.includes("optimistic");

    const hasInvalidationOrSocket =
      lowerAnswer.includes("invalidation") ||
      lowerAnswer.includes("refetch") ||
      lowerAnswer.includes("websocket") ||
      lowerAnswer.includes("sse") ||
      lowerAnswer.includes("polling") ||
      lowerAnswer.includes("mutation");

    if (hasQueryLib && hasInvalidationOrSocket) {
      return {
        status: "correct",
        statusLabel: "Correct",
        score: 10,
        conceptExplanation:
          "Modern server-client state management treats server state as a shared, asynchronous cache with declarative invalidation, caching keys, and optimistic UI updates.",
        userAnswerReview:
          "What was right: You demonstrated real-world experience by describing dedicated query/caching patterns alongside cache invalidation and UI synchronization.",
        exampleOrCorrection:
          "Key pattern: Using `queryClient.invalidateQueries({ queryKey: [...] })` after mutations, combined with optimistic rollback if the request fails.",
      };
    }

    if (hasQueryLib || hasInvalidationOrSocket) {
      return {
        status: "partially_correct",
        statusLabel: "Partially Correct",
        score: 7,
        conceptExplanation:
          "Synchronizing server and client state involves managing cache lifetime, handling optimistic rollbacks, and invalidating stale caches upon mutation.",
        userAnswerReview:
          "What was right: Good grasp of state synchronization tools. What was missing: Be sure to mention how you handle network errors during optimistic updates (rollback logic) or how you coordinate background cache revalidation.",
        exampleOrCorrection:
          "Example: Show how you use optimistic updates with an `onError` rollback handler in TanStack Query.",
        topicToRevise: "Asynchronous Cache Management & Optimistic UI",
      };
    }
  }

  // 5. Database Indexing & Slow Queries
  if (lowerQuestion.includes("index") || lowerQuestion.includes("query") || lowerQuestion.includes("explain analyze") || lowerQuestion.includes("slow")) {
    const hasExplain = lowerAnswer.includes("explain") || lowerAnswer.includes("execution plan") || lowerAnswer.includes("scan") || lowerAnswer.includes("profile");
    const hasIndex = lowerAnswer.includes("index") || lowerAnswer.includes("b-tree") || lowerAnswer.includes("composite") || lowerAnswer.includes("cardinality");

    if (hasExplain && hasIndex) {
      return {
        status: "correct",
        statusLabel: "Correct",
        score: 10,
        conceptExplanation:
          "Diagnosing slow database queries starts with inspecting the query execution plan using `EXPLAIN (ANALYZE, BUFFERS)` to spot sequential scans, then authoring targeted indexes or restructuring filters.",
        userAnswerReview:
          "What was right: Thorough answer covering execution plan inspection and targeted indexing on filtered/joined columns.",
        exampleOrCorrection:
          "Example: `CREATE INDEX idx_orders_user_created ON orders (user_id, created_at DESC);`",
      };
    }

    if (hasExplain || hasIndex) {
      return {
        status: "partially_correct",
        statusLabel: "Partially Correct",
        score: 7,
        conceptExplanation:
          "Always verify sequential table scans with `EXPLAIN ANALYZE` before creating indexes, as unnecessary indexes increase write latency.",
        userAnswerReview:
          "What was right: You identified the core optimization. What was missing: Mention analyzing the query execution plan to verify whether the optimizer chooses an index scan over a sequential scan.",
        exampleOrCorrection:
          "Tip: Mention compound index column order (equality columns first, followed by range/sorting columns).",
        topicToRevise: "Database Indexing & Query Execution Plans",
      };
    }
  }

  // 6. General Semantic Evaluation for Any Other Question
  const words = answer.split(/\s+/).filter(Boolean);
  const reasoningTokens = ["because", "since", "prevents", "handles", "ensures", "reduces", "improves", "avoids", "trade-off", "instead", "pattern"];
  const hasReasoning = reasoningTokens.some((t) => lowerAnswer.includes(t));

  if (words.length >= 25 && hasReasoning) {
    return {
      status: "correct",
      statusLabel: "Correct",
      score: 9,
      conceptExplanation: params.hint
        ? `Underlying concept: ${params.hint}`
        : "A strong technical answer explains the mechanism, rationale, and real-world implications.",
      userAnswerReview:
        "What was right: Your answer demonstrates solid technical reasoning with clear explanation of why this approach works.",
      exampleOrCorrection:
        "In interviews, following up with a concrete metrics example (e.g. latency, bundle size, or error reduction) will make your answer even stronger.",
    };
  }

  if (words.length >= 10) {
    return {
      status: "partially_correct",
      statusLabel: "Partially Correct",
      score: 6,
      conceptExplanation: params.hint
        ? `Key concept: ${params.hint}`
        : "Explain the underlying architecture and practical trade-offs.",
      userAnswerReview:
        "What was right: You are on the right track with the core idea. What was missing: Add more technical depth on the 'why'—explain how this functions under the hood and any trade-offs involved.",
      exampleOrCorrection:
        "Tip: Structure your response using the STAR or Problem-Solution-Tradeoff framework.",
      topicToRevise: category,
    };
  }

  return {
    status: "incorrect",
    statusLabel: "Needs Improvement",
    score: 4,
    conceptExplanation: params.hint
      ? `Expected concept: ${params.hint}`
      : "Provide a complete explanation detailing the mechanism and trade-offs.",
    userAnswerReview:
      "What was missing: The answer was too brief or incomplete to demonstrate working mastery of this concept.",
    exampleOrCorrection:
      "Review the fundamentals for this topic and try articulating the answer out loud.",
    topicToRevise: category,
  };
}
