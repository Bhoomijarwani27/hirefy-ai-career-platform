import {
    Building,
    Trophy,
    Scale,
    Layers3,
    MessageSquare,
    BarChart3,
} from "lucide-react";

export function Recruiter() {
    return (
        <section 
        id="for-companies"
            className="px-6 lg:px-8 bg-[#fbfbfd] py-16 sm:py-20 lg:py-24"
        >
          <div className="mx-auto max-w-7xl">
          <div className="text-center  text-sm  mx-auto max-w-3xl">
            <p className="text-sm font-bold uppercase text-indigo-500">
                For Recruiters
            </p>
            <h1 className="mt-4 text-3xl font-bold sm:text-5xl md:text-4xl lg:text-5xl">
                Hire the right talent, faster.
            </h1>
            <p className="mt-6 text-base text-gray-700 sm:text-xl">
            Find, evaluate, and hire the best candidates with AI-powered resume analysis, 
             intelligent candidate ranking, interview management, and actionable hiring insights—all in one platform.
            </p>
          </div>
            {/* image  */}
            <div className="mt-9 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className=" mt-16 lg:mt-0 w-full max-w-7xl">
                <div className="h-120 rounded-[2rem] border border-white/70 bg-white/75 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
                 {/* Dashboard Image */}
              </div>
            </div>
            {/* text */}
            <div className="flex flex-col items-start gap-3 w-full">
              <div className="flex w-full items-center gap-4 rounded-3xl border border-violet-200 bg-white px-6 py-4 shadow-sm transition-all hover:border-violet-400 hover:shadow-md">
                     <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                <Building className="h-6 w-6" />
              </div>
              
                   <div>
                <h6 className="text-lg font-bold text-slate-950">
                  company Dashboard
                </h6>

                <p className="mt-1 text-base text-slate-600">
                Manage jobs and hiring in one place.
                </p>
              </div>
            </div>
            <div className="flex w-full items-center gap-4 rounded-3xl border border-violet-200 bg-white px-6 py-4 shadow-sm transition-all hover:border-violet-400 hover:shadow-md">
                     <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                <Trophy className="h-6 w-6" />
              </div>
                   <div>
                <h6 className="text-lg font-bold text-slate-950">
                  AI Candidate Ranking
                </h6>

                <p className="mt-1 text-base text-slate-600">
                  AI ranks candidates by job fit.
                </p>
              </div>
            </div>
            <div className="flex w-full items-center gap-4 rounded-3xl border border-violet-200 bg-white px-6 py-4 shadow-sm transition-all hover:border-violet-400 hover:shadow-md">
                     <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                <Layers3 className="h-6 w-6" />
              </div>
                   <div>
                <h6 className="text-lg font-bold text-slate-950">
                  Shortlisted Candidates
                </h6>
                <p className="mt-1 text-base text-slate-600">
                Review and manage top candidates.
                </p>
                </div>
            </div>
            <div className="flex w-full items-center gap-4 rounded-3xl border border-violet-200 bg-white px-6 py-4 shadow-sm transition-all hover:border-violet-400 hover:shadow-md">
                     <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                <MessageSquare className="h-6 w-6" />   
                </div>
                <div>
                <h6 className="text-lg font-bold text-slate-950">
                  Interview Pipeline
                </h6>
                <p className="mt-1 text-base text-slate-600">
                Track interviews from start to hire.
                </p>
                </div>
            </div>
            <div className="flex w-full items-center gap-4 rounded-3xl border border-violet-200 bg-white px-6 py-4 shadow-sm transition-all hover:border-violet-400 hover:shadow-md">
                     <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                <BarChart3 className="h-6 w-6" />   
                </div>
                <div>
                <h6 className="text-lg font-bold text-slate-950">
                 Hiring Analytics 
                </h6>
                <p className="mt-1 text-base text-slate-600">
                Monitor hiring performance and trends.
                </p>
                </div>
            </div>   
           </div>
           </div>
          </div>   
        </section>
    );
}    
