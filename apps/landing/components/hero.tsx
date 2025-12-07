"use client";

import { Button } from "@/components/ui/button";
import { RoughNotation } from "react-rough-notation";
import { Icon } from "@iconify/react";
import { Marquee } from "./ui/marquee";
import Link from "next/link";

const partners = [
  {
    name: "Ministerstwo Cyfryzacji",
    img: "/cyfr.png",
    url: "https://www.gov.pl/web/cyfryzacja",
  },
  {
    name: "Govtech Polska",
    img: "/govtech.jpg",
    url: "https://www.govtech.gov.pl/",
  },
  {
    name: "Urząd Miasta Bydgoszczy",
    img: "/urzad.png",
    url: "https://www.bydgoszcz.pl/",
  },
  {
    name: "Hacknation",
    img: "/hacknation.jpg",
    url: "https://hacknation.pl/",
  },
];

const stats = [
  {
    label: "Gotowych tras spacerowych",
    value: "40+",
    icon: "solar:walking-bold",
  },
  {
    label: "Użytkowników w mieście",
    value: "10k+",
    icon: "solar:users-group-rounded-bold",
  },
];

export default function Hero() {
  return (
    <div className="min-h-svh w-full bg-background text-foreground">
      <main>
        <section className="relative min-h-svh w-full overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/bydgoszcz.jpg')" }}
            aria-hidden="true"
          />
          <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-background via-background/95 to-background/10" />
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-background/95 via-background/10 to-transparent" />

          <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-12 px-4 pb-16 pt-24 sm:px-6 md:flex-row md:items-center md:gap-14 md:pb-20 md:pt-28 lg:px-12 lg:gap-20 mt-12">
            <div className="flex-1 space-y-7 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground md:justify-start">
                <img
                  src="/logo-bdg.png"
                  alt="Logo miasta Bydgoszcz"
                  className="w-40 sm:w-48"
                />
              </div>

              <div className="space-y-4">
                <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                  Odkrywaj Bydgoszcz
                  <br className="hidden sm:block" /> w swoim tempie z{" "}
                  <span className="text-primary">
                    <RoughNotation type="underline" show>
                      BydGO
                    </RoughNotation>
                  </span>
                  .
                </h1>

                <p className="mx-auto max-w-xl text-pretty text-sm text-muted-foreground sm:text-base">
                  Interaktywne trasy, miejskie historie i najciekawsze miejsca w
                  jednej aplikacji. Dla mieszkańców i osób, które są tu pierwszy
                  raz – po prostu wybierz trasę i idziesz.
                </p>
              </div>

              <div className="flex flex-col flex-wrap items-center justify-center gap-3 sm:flex-row md:justify-start">
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full max-w-xs sm:w-auto"
                  asChild
                >
                  <a href="#pobierz">
                    <Icon
                      icon="material-symbols-light:download-rounded"
                      className="size-6"
                    />
                    Pobierz aplikację
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full max-w-xs sm:w-auto"
                  asChild
                >
                  <Link href='#funkcje'>Dowiedz się więcej</Link>
                </Button>
              </div>

              <div className="mt-10 grid w-full gap-8 text-xs text-muted-foreground sm:grid-cols-2 md:text-sm">
                {stats.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-center gap-4 md:justify-start"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <Icon icon={item.icon} className="h-5 w-5 text-primary" />
                    </div>

                    <div className="flex flex-col leading-tight">
                      <span className="text-base font-semibold text-foreground sm:text-lg text-start">
                        {item.value}
                      </span>
                      <span className="text-[0.75rem] text-muted-foreground sm:text-sm">
                        {item.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-1 items-center justify-center">
              <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-xs lg:max-w-sm">
                <div className="absolute inset-0 -z-10 scale-110 rounded-[2.5rem] bg-secondary/25 blur-2xl" />
                <div className="w-full">
                  <img
                    src="/mockup.png"
                    alt="Widok aplikacji BydGO na telefonie"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-background py-8 sm:py-10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-12">
            <p className="text-center text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground sm:text-xs md:text-left">
              We współpracy z
            </p>

            <div className="relative mt-4 w-full overflow-hidden">
              <Marquee reverse pauseOnHover className="[--duration:20s] w-full">
                {partners.map((partner) => (
                  <a
                    key={partner.name}
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-8 transition hover:scale-105 sm:px-10 md:px-12"
                  >
                    <img
                      src={`/partners/${partner.img}`}
                      alt={partner.name}
                      className="h-7 w-auto sm:h-8 md:h-10"
                    />
                  </a>
                ))}
              </Marquee>

              <div className="pointer-events-none absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-background" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-background" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
