import { Hero } from "@/components/landing/hero";
import Navbar from "@/components/landing/navbar";
import { Platform } from "@/components/landing/platform";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar/>
      <Hero/>
      <Platform/>

    </main>
  );
}
