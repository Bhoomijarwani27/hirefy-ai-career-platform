"user client" ;

import { Briefcase, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleSelectorProps {
    value: "CANDIDATE" | "RECRUITER";
    onChange: (value: "CANDIDATE" | "RECRUITER") => void;
}

export default function RoleSelector({
    value,
    onChange,
}: RoleSelectorProps) {
    return (
        <div className="grid grid-cols-2 gap-4">
            {/* Candidate Role */}
            <button
            type="button"
            onClick={() => onChange("CANDIDATE")}
            className={cn(
                "rounded-xl border p-5 transition-all",
                value === "CANDIDATE"
                ? "border-indigo-600 bg-indigo-50 dark:*:bg-indigo-950"
                : "border-border hover:border-indigo-300"
            )}
            >
           <User className="mx-auto h-6 w-8 text-indigo-600" />

           <h3 className="mt-3 font-semibold ">
                  job Seeker
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
            Find jobs, build resumes and prepare with AI.
            </p>
            </button>

            {/* Recruiter Role */}
             

       </div>    

            
   )
}