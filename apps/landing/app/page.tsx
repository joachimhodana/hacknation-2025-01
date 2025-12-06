'use client'

import DownloadCta from "@/components/cta";
import FAQ from "@/components/faq";
import FeaturesSection from "@/components/features";
import Footer from "@/components/footer";
import Hero from "@/components/hero";
import HowItWorks from "@/components/how-it-works";
import Navbar from "@/components/navbar";

export default function Home() {
  return (
    <div className="min-h-screen w-full font-sans">
      <Navbar />
      <Hero />
      <FeaturesSection />
      <HowItWorks />
      <FAQ />
      <DownloadCta />
      <Footer />
    </div>
  );
}
