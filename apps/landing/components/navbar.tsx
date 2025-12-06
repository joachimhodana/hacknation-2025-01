"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Icon } from "@iconify/react";
import Link from "next/link";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center">
      <nav
        className={[
          "flex w-full items-center justify-between rounded-full transition-all duration-300",
          scrolled
            ? "mt-4 border border-border/80 py-2 px-4 bg-background/25 backdrop-blur-2xl max-w-4xl"
            : "border border-transparent py-4 px-8 bg-transparent max-w-6xl",
        ].join(" ")}
      >
        <Link href="/" className="flex items-center gap-2">
          <img src="logo.png" alt="BydGO logo" height={48} width={48} />
          <h1 className="font-semibold text-black text-2xl [font-family:var(--font-reenie)]">
            BydGO
          </h1>
        </Link>

        <div className="hidden md:flex md:absolute left-1/2 -translate-x-1/2 items-center gap-10 text-sm">
          <a
            href="#funkcje"
            className="text-foreground/70 hover:text-[#0095DA] transition-colors font-medium"
          >
            Funkcje
          </a>
          <a
            href="#dzialanie"
            className="text-foreground/70 hover:text-[#0095DA] transition-colors font-medium"
          >
            Jak to działa
          </a>
          <a
            href="#faq"
            className="text-foreground/70 hover:text-[#0095DA] transition-colors font-medium"
          >
            FAQ
          </a>
          <a
            href="/kontakt"
            className="text-foreground/70 hover:text-[#0095DA] transition-colors font-medium"
          >
            Kontakt
          </a>
        </div>

        {/* CTA */}
        <div>
          <Button
            className="rounded-full bg-[#0095DA] hover:bg-[#007ec0] text-white w-48 text-sm font-medium"
            asChild
          >
            <Link href="/#pobierz">
              <Icon
                icon="material-symbols-light:download-rounded"
                className="size-6"
              />
              Pobierz aplikację
            </Link>
          </Button>
        </div>
      </nav>
    </div>
  );
}
