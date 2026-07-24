import { FileText } from "lucide-react";
import { WandSparkles } from "lucide-react";
import { CircleGauge } from "lucide-react";
import { BrainCircuit } from "lucide-react";

export function Resume() {
    return (
        <section id="resume" className=" mx-auto max-w-7xl bg-[#fbfbfd] py-16 sm:py-20 lg:py-24 ">
            <div className="grid lg:grid-cols-2">
                <div className="p-10 left-t">
                <p className=" left-t   text-sm font-bold uppercase text-indigo-500">
                    career development
                </p>
        
                <h1 className=" text-5xl font-bold">
                    A resume that actually gets you interview.
                </h1>
                <br/>
                <p className="text-lg  text-gray-700 sm:text-xl">
                    Upload or build, then let Hirefy AI analyze, score, and rewrite it against real ATS
                     systems and role-specific benchmarks.
                </p>
                <div  className="mt-9   grid-cols-2 gap-6  max-w-fit ">
                    <div className="flex gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                    
                           <FileText className=" h-6 w-6 "/>
                        </div>
                    <div>
                    <h6 className="text-lg font-bold text-slate-950">
                        Resume Builder
                    </h6>
                        
                    <p  className="mt-1 text-base  text-slate-600">
                            Clean templates, live preview.
                        </p>
                    </div>
                    
                    <div className="flex gap-6">  
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600"> 
                    <WandSparkles className=" h-6 w-6"/>
                    </div>
                    <div>
                    <h6 className="text-lg font-bold text-slate-950">
                        AI Analysis
                    </h6>   
                    <p  className="mt-1 text-base  text-slate-600">
                        Line-by-line suggestions.
                    </p>
                    </div>
                    </div>
                    </div>
                    <div className="mt-9 grid grid-cols-2 gap-6">
                    <div className="flex  gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                    
                           <CircleGauge className=" h-6 w-6 "/>
                        </div>
                    <div>
                    <h6 className="text-lg font-bold text-slate-950">
                        ATS Score
                    </h6>
                        
                    <p  className="mt-1 text-base  text-slate-600">
                            Test against 40+ systems.
                        </p>
                    </div>
                    </div>
                      <div className="flex gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                    
                           <BrainCircuit className=" h-6 w-6 "/>
                        </div>
                    <div>
                    <h6 className="text-lg font-bold text-slate-950">
                        Skill Gap
                    </h6>
                        
                    <p  className="mt-1 text-base  text-slate-600">
                            see what's missing for the role.
                        </p>
                    </div>
                    </div>  
                    </div>


 
                    
                     
                </div>
                </div>

            </div>
            
        </section>
    );
}