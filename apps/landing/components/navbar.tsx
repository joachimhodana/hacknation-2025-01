"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);


  return (
    <div className="fixed top-0 left-0 w-full flex items-center justify-center z-50 transition-all">
      <nav
        className={[
          "backdrop-blur-md rounded-full transition-all duration-300",
          scrolled
            ? "max-w-7xl w-full border border-border py-2 px-6 mt-3"
            : "w-full py-6 px-12"
        ].join(" ")}
      >
        <div className="flex items-center justify-between w-full">
          <div>
            <h1 className="font-semibold">BydGO</h1>
          </div>

          <div className="hidden md:flex md:absolute left-1/2 -translate-x-1/2 items-center gap-10">
            <a href="#o-nas" className="text-foreground/80 hover:text-foreground transition">
              O nas
            </a>
            <a href="#funkcje" className="text-foreground/80 hover:text-foreground transition">
              Funkcje
            </a>
            <a href="#kontakt" className="text-foreground/80 hover:text-foreground transition">
              Kontakt
            </a>
          </div>

          <div>
            <Button variant="outline" className="px-6">
              Pobierz aplikację
            </Button>
          </div>
        </div>
      </nav>
    </div>
  );
}
