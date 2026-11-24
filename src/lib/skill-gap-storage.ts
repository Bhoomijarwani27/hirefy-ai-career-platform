import { CareerChatSession } from "./skill-gap-types";

const SESSIONS_STORAGE_KEY = "hirefy_career_chat_sessions_v3";
const ACTIVE_CHAT_KEY = "hirefy_active_career_chat_id_v3";

export function createNewSession(initialTitle = "New Career Evaluation"): CareerChatSession {
  const id = `chat-${Date.now()}`;
  return {
    id,
    title: initialTitle,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [
      {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: `👋 **Welcome to Hirefy AI Career Assessment & Job Preparation Coach!**\n\nUpload your resume and enter your desired job role (or paste a job description) to automatically receive a complete, personalized 8-section evaluation:\n\n1. 🎯 **Overall Role Readiness Score** (Independent of any specific opening, with experience level & blocking factors)\n2. ⚠️ **Missing Skills & Skill Gap Analysis** (Demonstrated, Partially Demonstrated & Not Mentioned; Critical vs Important)\n3. 💼 **Specific Job Role Match Score** (Separate score comparing required vs preferred qualifications)\n4. 💡 **Personalized Interview Preparation** (Fundamentals, system design, debugging & behavioral with interactive AI practice)\n5. 🗺️ **Personalized Phased Learning Roadmap** (Immediate priorities through advanced skills)\n6. 🚀 **Portfolio Project Recommendations** (2–3 bespoke capstones solving your exact gaps)\n7. 📝 **Resume Improvement & Google XYZ Rewrites** (Evidence-based bullet rewrites)\n8. 📊 **Final Career Action Plan Summary** (Milestones, priorities & preparation runway)\n\nWhat desired role would you like to evaluate today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ],
  };
}

export function getChatSessions(): CareerChatSession[] {
  if (typeof window === "undefined") return [createNewSession()];
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (!raw) {
      const initial = [createNewSession()];
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [createNewSession()];
  } catch (err) {
    console.error("Failed to load chat sessions", err);
    return [createNewSession()];
  }
}

export function saveChatSession(session: CareerChatSession): void {
  if (typeof window === "undefined") return;
  try {
    const current = getChatSessions();
    const idx = current.findIndex((s) => s.id === session.id);
    let updated: CareerChatSession[];
    if (idx >= 0) {
      updated = [...current];
      updated[idx] = { ...session, updatedAt: new Date().toISOString() };
    } else {
      updated = [session, ...current];
    }
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem(ACTIVE_CHAT_KEY, session.id);
    window.dispatchEvent(new Event("hirefy-chat-storage-update"));
  } catch (err) {
    console.error("Failed to save chat session", err);
  }
}

export function deleteChatSession(id: string): CareerChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    const current = getChatSessions();
    const filtered = current.filter((s) => s.id !== id);
    const result = filtered.length > 0 ? filtered : [createNewSession()];
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(result));
    if (getActiveChatId() === id) {
      localStorage.setItem(ACTIVE_CHAT_KEY, result[0].id);
    }
    window.dispatchEvent(new Event("hirefy-chat-storage-update"));
    return result;
  } catch (err) {
    console.error("Failed to delete chat session", err);
    return [];
  }
}

export function getActiveChatId(): string {
  if (typeof window === "undefined") return "";
  try {
    const active = localStorage.getItem(ACTIVE_CHAT_KEY);
    if (active) return active;
    const all = getChatSessions();
    return all[0]?.id || "";
  } catch {
    return "";
  }
}

export function setActiveChatId(id: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ACTIVE_CHAT_KEY, id);
    window.dispatchEvent(new Event("hirefy-chat-storage-update"));
  } catch (err) {
    console.error("Failed to set active chat ID", err);
  }
}
