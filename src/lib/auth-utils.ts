export type UserRole = "CANDIDATE" | "RECRUITER" | "ADMIN";

export function getDashboardPath(role?: string | null) {
  if (role === "RECRUITER") {
    return "/company/dashboard";
  }

  return "/seeker/dashboard";
}
