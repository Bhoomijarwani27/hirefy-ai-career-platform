import { Building2, CheckCircle, GraduationCap } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function Platform() {
  return (
    <section id="platform" className="bg-[#fbfbfd] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8"> 
            <div className="mx-auto max-w-4xl text-center">
                
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-500 sm:text-sm">
                        One platform
                    </p>
                    <h2 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                        Build careers. Hire
                        <br/>
                         smarter. All in one place.
                        </h2>
                    <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600 sm:text-xl sm:leading-9">
                        Hirefy unifies the tools job seekers and companies actually need — from AI 
                        resume analysis to candidate ranking — inside a single, intelligent workspace.
                        </p>
                </div>
                <div className="mt-12 grid gap-6  lg:mt-16 lg:grid-cols-2">
                    <Card className=" width-full rounded-3xl border-indigo-100 bg-linear-to-b from-indigo-100/80  via-white shadow-none">
                        <CardHeader className="p-6 pb-0 sm:pb-0 lg:p-10 lg:pb-0">
                            <div className="inline-flex w-fit items-center gap-2 rounded-full border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700">
                                 <GraduationCap className="h-4 w-4"/>
                                For Job Seekers
                            </div>

                            <CardTitle className="mt-7 text-3xl font-extrabold tracking-tight text-slate-950 lg:text-4xl">
                                A copilot for your entire career.
                            </CardTitle>

                            <CardDescription className="mt-4 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                            Build a resume in minutes, learn what's missing, and get matched to jobs
                            where you'll actually get hired. 
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="p-6 pt-7 sm:p-8 sm:pt-7  lg:p-10 lg:pt-7">
                            <ul className="space-y-4 text-base text-slate-950 sm:text-lg">

                            <li className="flex items-center gap-3">
                                <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500"/>
                                ATS score in seconds
                            </li>
                            <li className="flex items-center gap-3">
                                <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500"/>
                                Personalized job matches
                            </li>
                            <li className="flex items-center gap-3">
                                <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500"/>
                                skill gap analysis
                            </li>
                            </ul>
                        </CardContent>
                    </Card>
                    <Card className="w-full rounded-3xl border-cyan-100 bg-linear-to-br from-cyan-100/80 via-white to-white shadow-none">
                    <CardHeader className="p-6 pb-0  sm:p-8 sm:pb-0 lg:p-10 lg:pb-0">
                       <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700">
                           <Building2 className="h-4 w-4" />
                          For Companies
                       </div>

                   <CardTitle className="mt-7 text-3xl font-extrabold tracking-tight text-slate-950 lg:text-4xl">
                   A hiring team that scales with AI
                   </CardTitle>

                   <CardDescription className="mt-4 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                    Post jobs, receive AI-ranked applicants, and compare candidates
                    side-by-side with data that actually matters.
                  </CardDescription>
                  </CardHeader>

                <CardContent className="p-6 pt-7 sm:p-8 sm:pt-7  lg:p-10 lg:pt-7">
                   <ul className="space-y-4 text-base text-slate-950 sm:text-lg">
                     <li className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" />
                        AI candidate ranking
                    </li>
                    <li className="flex items-center gap-3">
                       <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" />
                       Side-by-side comparison
                    </li>
                <li className="flex items-center gap-3">
                 <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" />
                 Hiring analytics
                </li>
             </ul>
            </CardContent>
        </Card>

     </div>

    </div>        
        
</section>


  );
}