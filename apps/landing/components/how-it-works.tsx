"use client";

const IllustrationStep1 = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 400 300"
    className="w-full h-full text-primary"
    fill="none"
  >
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" className="stop-primary" stopOpacity="0.1" />
        <stop offset="100%" className="stop-background" stopOpacity="0.5" />
      </linearGradient>
    </defs>
    <rect
      x="100"
      y="20"
      width="200"
      height="260"
      rx="24"
      className="fill-background stroke-border"
      strokeWidth="2"
    />
    <rect
      x="115"
      y="40"
      width="170"
      height="220"
      rx="12"
      className="fill-muted/10"
    />

    <rect
      x="125"
      y="55"
      width="150"
      height="12"
      rx="6"
      className="fill-muted/20"
    />

    <g transform="translate(125, 85)">
      <rect
        width="70"
        height="90"
        rx="12"
        className="fill-background stroke-primary/30"
        strokeWidth="2"
      />
      <path
        d="M 15 70 C 15 40, 55 40, 55 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="4 4"
      />
      <circle cx="15" cy="70" r="5" className="fill-primary" />
      <circle cx="55" cy="10" r="5" className="fill-primary" />
      <rect
        x="10"
        y="100"
        width="50"
        height="8"
        rx="4"
        className="fill-primary/60"
      />
    </g>

    <g transform="translate(205, 85)">
      <rect
        width="70"
        height="90"
        rx="12"
        className="fill-background stroke-muted"
        strokeWidth="2"
      />
      <circle
        cx="35"
        cy="45"
        r="25"
        className="stroke-muted"
        strokeWidth="2"
        strokeDasharray="2 2"
      />
      <circle cx="35" cy="45" r="10" className="fill-muted/30" />
      <path
        d="M35 45 L55 25"
        className="stroke-muted"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect
        x="10"
        y="100"
        width="50"
        height="8"
        rx="4"
        className="fill-muted"
      />
    </g>

    <rect
      x="145"
      y="230"
      width="110"
      height="20"
      rx="10"
      className="fill-primary"
    />
    <path
      d="M190 240 L210 240"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const IllustrationStep2 = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 400 300"
    className="w-full h-full text-primary"
    fill="none"
  >
    <g transform="matrix(1, -0.2, 0, 1, 0, 50)">
      <rect
        x="50"
        y="50"
        width="300"
        height="200"
        rx="16"
        className="fill-background stroke-border"
        strokeWidth="2"
      />
      <path
        d="M50 100 L350 100 M50 150 L350 150 M50 200 L350 200"
        className="stroke-muted/20"
        strokeWidth="2"
      />
      <path
        d="M100 50 L100 250 M175 50 L175 250 M250 50 L250 250"
        className="stroke-muted/20"
        strokeWidth="2"
      />

      <path
        d="M100 200 L175 150 L175 100 L250 75"
        className="stroke-primary"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="8 6"
      />

      <circle
        cx="175"
        cy="150"
        r="6"
        className="fill-background stroke-primary"
        strokeWidth="2"
      />
      <circle
        cx="175"
        cy="100"
        r="6"
        className="fill-background stroke-primary"
        strokeWidth="2"
      />
    </g>

    <g transform="translate(100, 230)">
      <circle cx="0" cy="0" r="15" className="fill-primary/30 animate-ping" />
      <circle cx="0" cy="0" r="8" className="fill-primary" />
      <path d="M0 8 L0 20" className="stroke-primary" strokeWidth="2" />
    </g>

    <g transform="translate(250, 100)">
      <rect
        x="-20"
        y="-30"
        width="40"
        height="30"
        rx="6"
        className="fill-background stroke-primary"
        strokeWidth="2"
      />
      <text
        x="0"
        y="-10"
        textAnchor="middle"
        fontSize="18"
        fontWeight="bold"
        className="fill-primary"
      >
        ?
      </text>
      <path
        d="M0 0 L-5 8 L5 8 Z"
        className="fill-background stroke-primary"
        strokeWidth="2"
        transform="translate(0,2)"
      />
    </g>
  </svg>
);

const IllustrationStep3 = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 400 300"
    className="w-full h-full text-primary"
    fill="none"
  >
    <g className="stroke-muted/10" strokeWidth="2" strokeDasharray="4 4">
      <line x1="200" y1="150" x2="200" y2="20" />
      <line x1="200" y1="150" x2="330" y2="150" />
      <line x1="200" y1="150" x2="70" y2="150" />
      <line x1="200" y1="150" x2="200" y2="280" />
      <line x1="200" y1="150" x2="290" y2="60" />
      <line x1="200" y1="150" x2="110" y2="60" />
    </g>

    <g transform="translate(200, 130)">
      <path
        d="M0 -70 L 60 -40 L 60 20 C 60 60, 0 90, 0 90 C 0 90, -60 60, -60 20 L -60 -40 Z"
        className="fill-background stroke-primary"
        strokeWidth="4"
      />
      <path
        d="M0 -60 L 50 -35 L 50 20 C 50 50, 0 75, 0 75 C 0 75, -50 50, -50 20 L -50 -35 Z"
        className="fill-primary/10"
      />

      <path
        d="M0 -30 L 10 -5 L 35 -5 L 15 15 L 25 40 L 0 25 L -25 40 L -15 15 L -35 -5 L -10 -5 Z"
        className="fill-primary"
      />
    </g>

    <circle
      cx="100"
      cy="80"
      r="15"
      className="fill-background stroke-primary"
      strokeWidth="2"
    />
    <text
      x="100"
      y="85"
      textAnchor="middle"
      fontSize="14"
      fontWeight="bold"
      className="fill-primary"
    >
      +50
    </text>

    <circle
      cx="300"
      cy="100"
      r="12"
      className="fill-background stroke-primary"
      strokeWidth="2"
    />
    <circle cx="300" cy="100" r="6" className="fill-primary/40" />

    <circle
      cx="280"
      cy="220"
      r="10"
      className="fill-background stroke-muted"
      strokeWidth="2"
    />

    <g transform="translate(100, 250)">
      <text x="0" y="-10" fontSize="12" className="fill-muted-foreground">
        Twój postęp
      </text>
      <rect
        x="0"
        y="0"
        width="200"
        height="12"
        rx="6"
        className="fill-muted/20"
      />
      <rect
        x="0"
        y="0"
        width="140"
        height="12"
        rx="6"
        className="fill-primary"
      />
      <circle
        cx="140"
        cy="6"
        r="8"
        className="fill-background stroke-primary"
        strokeWidth="2"
      />
    </g>
  </svg>
);

// Aktualizacja tablicy steps - używamy komponentów SVG zamiast ścieżek do obrazów
const steps = [
  {
    title: "Wybierz trasę lub tryb zwiedzania",
    description:
      "Otwierasz BydGO, wybierasz tematyczną trasę albo tryb swobodnego odkrywania i od razu widzisz, co ciekawego jest w pobliżu.",
    illustration: <IllustrationStep1 />,
  },
  {
    title: "Ruszaj w miasto z interaktywną mapą",
    description:
      "Aplikacja prowadzi Cię punkt po punkcie, pokazuje ukryte miejsca, podpowiada ciekawostki i reaguje na Twoją lokalizację.",
    illustration: <IllustrationStep2 />,
  },
  {
    title: "Zdobywaj punkty, odznaki i więcej",
    description:
      "Za odkrywanie miasta zdobywasz punkty i odznaki. Możesz wracać do ulubionych tras, śledzić postępy i rywalizować ze znajomymi.",
    illustration: <IllustrationStep3 />,
  },
];

export default function HowItWorks() {
  return (
    <section
      className="
        relative overflow-hidden border-b border-border/60 py-16 md:py-20
        bg-[url('/bydgoszcz2.jpg')] bg-cover bg-center bg-fixed
      "
      id="dzialanie"
    >
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" />

      <div className="relative mx-auto max-w-7xl px-6 sm:px-6 lg:px-8">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold md:text-5xl text-white drop-shadow-lg">
            Jak to działa
          </h2>
          <p className="text-sm md:text-xl text-white drop-shadow">
            Trzy proste kroki, żeby zacząć odkrywać Bydgoszcz na nowo.
          </p>
        </div>

        <div className="relative mt-16 hidden md:block">
          <div className="absolute inset-x-0 top-2 px-20 lg:px-32">
            <svg
              className="w-full"
              xmlns="http://www.w3.org/2000/svg"
              width="875"
              height="48"
              viewBox="0 0 875 48"
              fill="none"
            >
              <path
                d="M2 29C20.2154 33.6961 38.9915 35.1324 57.6111 37.5555C80.2065 40.496 102.791 43.3231 125.556 44.5555C163.184 46.5927 201.26 45 238.944 45C312.75 45 385.368 30.7371 458.278 20.6666C495.231 15.5627 532.399 11.6429 569.278 6.11109C589.515 3.07551 609.767 2.09927 630.222 1.99998C655.606 1.87676 681.208 1.11809 706.556 2.44442C739.552 4.17096 772.539 6.75565 805.222 11.5C828 14.8064 850.34 20.2233 873 24"
                stroke="#D4D4D8"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="1 12"
              />
            </svg>
          </div>
        </div>

        <div className="relative mt-8 grid gap-12 md:grid-cols-3 text-center">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative flex flex-col items-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-background shadow-md text-xl font-semibold text-primary z-10">
                {index + 1}
              </div>

              <div className="mt-6 w-full overflow-hidden rounded-3xl p-6 md:p-8 flex items-center justify-center aspect-4/3 bg-background/25 backdrop-blur-md border border-border/30 shadow-lg">
                <div className="w-full h-full transition-transform hover:scale-105 duration-300">
                  {step.illustration}
                </div>
              </div>

              <h3 className="mt-6 text-lg font-semibold text-accent">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-white max-w-xs mx-auto leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
