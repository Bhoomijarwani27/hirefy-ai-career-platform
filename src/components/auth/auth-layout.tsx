import { ReactNode } from "react";

type AuthLayoutProps = {
	children?: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
	return (
        <section className="min-h-screen bg-background">
            <div className="grid min-h-screen lg:grid-cols-2">
                {/* left side */}
               <div className="hidden lg:flex flex-col items-center justify-center bg-linear-to-br from-indigo-600 to-purple-700 p-12 text-white">
                <div >
                    <h1 className="text-3xl font-bold">Hirefy</h1>
                    <p className="mt-2 text-white/80">
                     AI-Powered Career Platform
                    </p>
                </div>

                <div className="max-w-md">
                  <h2 className="text-5xl font-bold leading-tight">
                  Build your career with AI.
                  </h2>  
                  <p className="mt-6 text-lg text-white/80">
                  Create ATS-friendly resumes, discover personalized jobs,
                  prepare for interviews with AI, and connect with top companies —
                  all in one platform.
                  </p>
                </div>
                        <div className="text-sm text-white/60">
                         © 2026 Hirefy. All rights reserved.
                        </div>
                 </div>

                {/* right side */}
                 {/* Right Side */}
        <div className="flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
  
            </div>
        </section>
    )
}