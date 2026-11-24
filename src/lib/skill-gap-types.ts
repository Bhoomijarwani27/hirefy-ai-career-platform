export interface QuizQuestion {
  id: string;
  category: string;
  difficulty: "Fundamental" | "Intermediate" | "Advanced";
  question: string;
  hint: string;
  whatInterviewerEvaluates: string;
  modelAnswerSnippet?: string;
}

export interface QuizAnswerEvaluation {
  status: "correct" | "partially_correct" | "incorrect";
  statusLabel: string; // "Correct" | "Partially Correct" | "Needs Improvement"
  score: number; // 0 - 10
  conceptExplanation: string;
  userAnswerReview: string;
  exampleOrCorrection: string;
  topicToRevise?: string;
}

export interface QuizEvaluateRequest {
  question: string;
  category: string;
  difficulty?: string;
  userAnswer: string;
  hint?: string;
  whatInterviewerEvaluates?: string;
  targetRole?: string;
  customApiKey?: string;
}

export interface CareerChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  attachedResumeName?: string;
  quizQuestions?: QuizQuestion[];
  quizStates?: Record<string, {
    userAnswer: string;
    isSubmitted: boolean;
    evaluation?: QuizAnswerEvaluation;
  }>;
}

export interface AttachedResumeInfo {
  name: string;
  content: string;
  skills: string[];
  jobDescription?: string;
}

export interface CareerChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: CareerChatMessage[];
  attachedResume?: AttachedResumeInfo;
  jobDescription?: string;
}

export interface ChatApiRequest {
  messages: {
    role: "user" | "assistant" | "system";
    content: string;
  }[];
  attachedResume?: {
    name: string;
    content: string;
  };
  jobDescription?: string;
  customApiKey?: string;
}
