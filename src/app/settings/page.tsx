import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { AccountActions } from "@/components/settings/account-actions";
import { requireAuthUser } from "@/lib/auth-session";

export default async function SettingsPage() {
  const user = await requireAuthUser();
  const role = user.role === "RECRUITER" ? "RECRUITER" : "CANDIDATE";

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Settings
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your account, role, and session.
          </p>
        </div>

        <AccountActions currentRole={role} email={user.email} />
      </main>
    </div>
  );
}
