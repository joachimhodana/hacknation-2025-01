export default function Footer() {
  return (
    <footer className="tracking-wide bg-background border-t border-border/60 px-8 sm:px-12 pt-12 pb-6">
      <div className="grid min-[1200px]:grid-cols-3 gap-12 xl:gap-16">
        <div className="min-[1200px]:max-w-sm max-w-lg w-full">
          <div className="flex items-center gap-2">
            <img src="logo.png" alt="BydGO logo" height={48} width={48} />
            <h1 className="font-semibold text-black text-2xl [font-family:var(--font-reenie)]">
              BydGO
            </h1>
          </div>

          <div className="mt-6">
            <p className="text-sm leading-relaxed text-muted-foreground">
              BydGO to aplikacja do odkrywania Bydgoszczy na nowo – z
              tematycznymi trasami, ciekawostkami i systemem nagród. Bez
              papierowych przewodników, bez zbędnego kombinowania.
            </p>
          </div>

          <ul className="mt-6 flex space-x-4">
            <li>
              <a
                href="https://www.facebook.com/bydgoszczpl/"
                aria-label="Facebook"
                className="inline-flex items-center justify-center rounded-full border border-border/70 p-2 hover:border-primary hover:text-primary transition-colors"
              >
                {/* FB */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M13.5 9H16V5.5h-2.5C10.91 5.5 9 7.41 9 9.75V11H7v3.5h2V21h3.5v-6.5H16V11h-3.5V9.75c0-.48.27-.75 1-.75Z" />
                </svg>
              </a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/bydgoszcz.pl/"
                aria-label="Instagram"
                className="inline-flex items-center justify-center rounded-full border border-border/70 p-2 hover:border-primary hover:text-primary transition-colors"
              >
                {/* IG */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <rect x="4" y="4" width="16" height="16" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17" cy="7" r="1.1" fill="currentColor" />
                </svg>
              </a>
            </li>
            <li>
              <a
                href="https://x.com/BydgoszczPL"
                aria-label="X / Twitter"
                className="inline-flex items-center justify-center rounded-full border border-border/70 p-2 hover:border-primary hover:text-primary transition-colors"
              >
                {/* X */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.5 4h-3.1l-3 4-3-4H6.3l4.3 5.9L5.5 20h3.1l3.2-4.4 3.2 4.4h3.1l-5.2-7.2L18.5 4Z" />
                </svg>
              </a>
            </li>
          </ul>
        </div>

        {/* PRAWA STRONA – LINKI */}
        <div className="min-[1200px]:col-span-2 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* KOLUMNA 1 */}
          <div className="max-lg:min-w-[140px]">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-[0.16em]">
              Aplikacja
            </h4>
            <ul className="mt-5 space-y-3">
              <li>
                <a
                  href="#dzialanie"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Jak to działa
                </a>
              </li>
              <li>
                <a
                  href="#funkcje"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Funkcje
                </a>
              </li>
              <li>
                <a
                  href="#pobierz"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pobierz aplikację
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* KOLUMNA 2 */}
          <div className="max-lg:min-w-[140px]">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-[0.16em]">
              Dla miasta
            </h4>
            <ul className="mt-5 space-y-3">
              <li>
                <a
                  href="https://bip.um.bydgoszcz.pl/artykul/2/3/dane-podstawowe"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Kontakt dla urzędu
                </a>
              </li>
              <li>
                <a
                  href="https://zdmikp.bydgoszcz.pl/pl/"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Komunikacja miejska
                </a>
              </li>
            </ul>
          </div>

          {/* KOLUMNA 3 */}
          <div className="max-lg:min-w-[140px]">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-[0.16em]">
              Społeczność
            </h4>
            <ul className="mt-5 space-y-3">
              <li>
                <a
                  href="https://www.bydgoszcz.pl/aktualnosci/" rel="noopener" target="_blank"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Aktualności
                </a>
              </li>
              <li>
                <a
                  href="#events"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Wydarzenia w mieście
                </a>
              </li>
            </ul>
          </div>

          {/* KOLUMNA 4 */}
          <div className="max-lg:min-w-[140px]">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-[0.16em]">
              Więcej
            </h4>
            <ul className="mt-5 space-y-3">
              <li>
                <a
                  href="/regulamin"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Regulamin
                </a>
              </li>
              <li>
                <a
                  href="/polityka-prywatnosci"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Polityka prywatności
                </a>
              </li>
              <li>
                <a
                  href="/kontakt"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Kontakt
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <hr className="mt-10 mb-6 border-border/60" />

      <div className="flex flex-wrap max-md:flex-col gap-4 items-center">
        <ul className="md:flex md:space-x-6 max-md:space-y-2 text-sm">
          <li>
            <a
              href="/regulamin"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Regulamin
            </a>
          </li>
          <li>
            <a
              href="/polityka-prywatnosci"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Polityka prywatności
            </a>
          </li>
          <li>
            <a
              href="#security"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Bezpieczeństwo danych
            </a>
          </li>
        </ul>

        <p className="text-sm text-muted-foreground md:ml-auto">
          © {new Date().getFullYear()} BydGO. Wszystkie prawa zastrzeżone.
        </p>
      </div>
    </footer>
  );
}
