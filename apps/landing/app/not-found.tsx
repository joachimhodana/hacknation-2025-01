"use client";

import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import Link from "next/link";

export default function ContactPage() {
  return (
    <section className="relative min-h-screen w-full bg-background">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/bydgoszcz.jpg')" }}
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-background via-background/95 to-background/10" />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-background/95 via-background/10 to-transparent" />

      <Navbar />

      <div className="absolute top-1/2 w-full max-w-xl md:ml-48 -translate-y-1/2 px-6 space-y-8">
        <h1 className="text-3xl font-semibold text-foreground">
          Strona nie została znaleziona.
        </h1>
        <Button asChild>
          <Link href="/">Wróć do strony głównej</Link>
        </Button>
      </div>
    </section>
  );
}
