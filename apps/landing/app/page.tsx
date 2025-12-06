import Hero from "@/components/hero";
import Navbar from "@/components/navbar";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center w-full">
      <Navbar />
      <Hero />
    </div>
  );
}
