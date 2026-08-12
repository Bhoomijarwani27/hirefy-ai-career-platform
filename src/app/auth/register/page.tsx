import AuthPanel from "@/components/auth/AuthPanel";
import SocialLogin from "@/components/auth/social-login";
import { ThemeToggle } from "@/components/theme-toggle";

export default function RegisterPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
        {/* left side */}
        <AuthPanel
        badge="AI-powered career platform"
        title={
         <>
           Get hired faster.
           <br />
           Hire smarter.
         </>
        }
       description="Build your career with AI-powered tools designed to help you stand out."
       features={[
        "AI-powered resume analysis",
        "Personalized job matching",
        "Build and manage your resume",
      ]} 
       />
       

<section className="relative flex min-h-screen w-full flex-1 items-start bg-background px-5 py-10 text-foreground sm:px-8 sm:py-12 lg:px-12 lg:py-14">
  {/* Theme Toggle - temporary */}
  <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
    <ThemeToggle />
  </div>

  {/* Right side content */}
  <div className="w-full">
    <div className="w-full max-w-xl">
      
      {/* Heading */}
      <div className="mb-8">
        <span className="inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground sm:text-sm">
          Create your account
        </span>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Join Hirefy today
        </h1>

        <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
          Choose how you'll use Hirefy — you can switch anytime.
        </p>
      </div>

      {/* OAuth will come here */}
      <SocialLogin />
    </div>
  </div>
</section>
       
       
       
       
    </main>
  );
}  
