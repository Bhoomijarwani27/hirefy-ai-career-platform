import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { JobDiscovery } from "@/components/landing/JobDiscovery";
import Navbar from "@/components/landing/navbar";
import { Platform } from "@/components/landing/platform";
import { Recruiter } from "@/components/landing/Recruiter";
import { Resume } from "@/components/landing/resume";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar/>
      <Hero/>
      <Platform/>
      <Features/>
      <Resume/>
      <JobDiscovery/>
      <Recruiter/>
      

    </main>
  );
}
