import {    Check, Minus } from "lucide-react";

type ComparisonItem = {
    feature: string;
    traditional: boolean;
    hirefy: boolean;
};

const comparisonData: ComparisonItem[] = [
    {
        feature : "AI Resume Analysis",
        traditional : false,
        hirefy : true,
    },
    {
        feature : "Skill-Based  Job Matching",
        traditional : false,
        hirefy : true,
    },
    {
        feature : "Resume based job Matching",
        traditional : false,
        hirefy : true,
    },
    { 
         feature : "AI Candidate Ranking",
        traditional : false,
        hirefy : true,
    },
    {
         feature: "AI Career Chat",
    traditional: false,
    hirefy: true,
  },
  {
    feature: "Application Tracking",
    traditional: true,
    hirefy: true,
  },
  {
    feature: "Basic Job Search",
    traditional: true,
    hirefy: true,
  },
];

function ComparisonRow({ Item }: { Item: ComparisonItem }) {
    return (
        <div className="grid grid-cols-[2fr_1fr_1fr] items-center border-t border-border px-6 py-5">
            <p className="front-medum text-foreground">
                {Item.feature}
            </p>
            <div className="flex items-center justify-center">
            
                {Item.traditional ? (
                    <Check className="h-5 w-5 text-emerald-500" />
                ) : (
                    <Minus className="h-5 w-5  text-muted-foreground" />

                )}
            </div>  
            <div className="flex items-center justify-center">
                {Item.hirefy ? (
                    <Check className="h-5 w-5 text-emerald-500" />
                ) : (
                    <Minus className="h-5 w-5  text-muted-foreground" />
                )}
            </div>
        </div>
    );
} 

export default function Comparison() {
    return (
        < section className="bg-background px-6 py-20 lg:px-8">
            <div className="mx-auto max-w-7xl">

                {/* Headline */}

                <div className="mx-auto max-w-4xl text-center">
                    <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
                        why hirefy?
                    </p>
                    <h2 className="mt-4 text-4xl fold-extrabold tracking-tight text-foreground lg:text-5xl">
                        Traditional job portals do
                        <br />
                        listings. Hirefy does outcomes
                    </h2>

                    <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
                       Everything you need to land your next job or hire the best
                       candidate—powered by AI.
                    </p>
                </div>  

                {/* Comparison Table */}

                <div className="mt-16 overflow-hidden rounded-3xl border border-border bg-card shadow-sm">

                    {/* Header */}

                   <div className="grid grid-cols-[2fr_1fr_1fr] bg-muted px-6 py-4">
                     <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Capability
                      </p>

                     <p className="text-center text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                     Traditional
                     </p>

                    <p className="text-center text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                     Hirefy
                     </p>
                     </div>

                     {/* row  */}
                     {comparisonData.map((item) => (
                        <ComparisonRow
                            key={item.feature}
                            Item={item}
                        />
                     ))}
                </div>
            </div>
        </section>
    );
}