import {
  Target,
  Search,
  Bookmark,
  ClipboardList,
} from "lucide-react";

export function JobDiscovery() {
    return (
        <section
            className="px-6 lg:px-8 bg-[#fbfbfd] py-16 sm:py-20 lg:py-24"
        >
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
                {/* Dashboard */}
              <div className="order-2 lg:order-1 mt-16 lg:mt-0 w-full max-w-2xl">
                <div className="h-140 rounded-[2rem] border border-white/70 bg-white/75 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
                 {/* Dashboard Image */}
              </div>
            </div>
            {/* Text */}
            <div className="order-1 lg:order-2">
                <p className="text-sm font-bold uppercase text-indigo-500">
                Job discovery
               </p>

             <h1 className="mt-4 text-3xl font-bold sm:text-5xl md:text-4xl lg:text-5xl">
            Stop scrolling. Start matching.
           </h1>

           <p className="mt-6 text-base text-gray-700 sm:text-xl">
            AI reads your profile and returns roles you'll actually get — with match scores,
             salary insights, and one-click apply.
          </p>

          <div className="mt-9 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* AI job matching */}
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                <Target className="h-6 w-6" />
              </div>

              <div>
                <h6 className="text-lg font-bold text-slate-950">
                  AI Job Matching

                </h6>

                <p className="mt-1 text-base text-slate-600">
                  Rank by real fit.
                </p>
              </div>
            </div>

            {/* Smart Search */}
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                <Search className="h-6 w-6" />
              </div>

               <div>
                <h6 className="text-lg font-bold text-slate-950">
                  Smart Search
                </h6>

                 <p className="mt-1 text-base text-slate-600">
                    Filters that understand intent.
                </p>
              </div>
            </div>

            {/* save & apply */}
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                <Bookmark className="h-6 w-6" />
              </div>

              <div>
                <h6 className="text-lg font-bold text-slate-950">
                  Save & Apply
                </h6>

                  <p className="mt-1 text-base text-slate-600">
                  Track in one workspace.
                </p>
              </div>
            </div>

            {/* Application Tracker */}
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                <ClipboardList className="h-6 w-6" />
              </div>

                <div>
                <h6 className="text-lg font-bold text-slate-950">
                  Application Tracker
                </h6>

                 <p className="mt-1 text-base text-slate-600">
                  Monitor your applications in real-time.
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
