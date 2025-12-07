import { Card, CardContent } from "@/components/ui/card";
import { RoughNotation } from "react-rough-notation";
import { useInView } from "@/lib/hooks";


const Illustrations = {
  Routes: () => (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <svg
        className="absolute w-[120%] h-full -left-[10%] -top-[10%] text-blue-50 opacity-60"
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M50 350 C 150 150, 250 450, 350 150"
          stroke="currentColor"
          strokeWidth="40"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute top-[20%] right-[20%] p-3 bg-white rounded-2xl shadow-lg border border-blue-100 transform rotate-6 animate-pulse">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-blue-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      </div>
      <div className="absolute top-[40%] left-[15%] p-4 bg-yellow-400 rounded-full shadow-xl border-4 border-white z-10 transform -rotate-3 hover:scale-110 transition-transform">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 text-white"
          viewBox="0 0 24 24"
          fill="fill-current"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="10" r="3" />
          <path d="M12 2a8 8 0 0 0-8 8c0 1.892.402 3.13 1.5 4.5L12 22l6.5-7.5c1.098-1.37 1.5-2.608 1.5-4.5a8 8 0 0 0-8-8z" />
        </svg>
      </div>
    </div>
  ),

  MapDiscovery: () => (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-blue-50/20">
      <div className="absolute -top-10 -left-10 w-[140%] h-[140%] grid grid-cols-6 gap-4 transform rotate-12 opacity-30">
        {[...Array(24)].map((_, i) => (
          <div key={i} className="bg-blue-100 rounded-lg h-24 w-full"></div>
        ))}
      </div>
      <div className="absolute top-[25%] left-1/2 -translate-x-1/2 transform">
        <div className="relative group">
          <div className="absolute -inset-6 bg-blue-400/20 rounded-full blur-xl animate-pulse"></div>
          <div className="relative bg-white p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-blue-100 flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-green-400 animate-ping absolute top-0 right-0"></div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-blue-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="3 11 22 2 13 21 11 13 3 11" />
            </svg>
            <span className="text-sm font-bold text-gray-700">
              Skręć w prawo
            </span>
          </div>
        </div>
      </div>
    </div>
  ),

  Rewards: () => (
    <div className="absolute inset-0 w-full h-full overflow-hidden flex justify-center pt-10">
      <svg
        className="absolute top-[-50%] w-[200%] h-[200%] text-yellow-50/80 animate-[spin_60s_linear_infinite]"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
      <div className="relative z-10 transform hover:scale-110 transition-transform duration-500 ease-out">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-32 w-32 text-yellow-400 drop-shadow-2xl"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="white"
          strokeWidth="1"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border-2 border-white">
          +500 pkt
        </div>
      </div>
    </div>
  ),

  Feelings: () => (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-linear-to-br from-white to-blue-50/30">
      <svg
        className="absolute w-full h-48 top-[10%]"
        preserveAspectRatio="none"
        viewBox="0 0 400 200"
      >
        <path
          d="M0 100 H 100 Q 120 100, 130 80 T 150 100 T 170 140 T 190 100 H 250 Q 300 100, 350 50"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
          className="drop-shadow-sm opacity-20"
        />
        <path
          d="M0 100 H 100 Q 120 100, 130 80 T 150 100 T 170 140 T 190 100 H 250 Q 300 100, 350 50"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
          strokeDasharray="10 10"
          className="animate-[dash_20s_linear_infinite]"
        />
      </svg>

      <div className="absolute top-[20%] left-[15%] opacity-90 animate-[bounce_3s_infinite]">
        <div className="bg-white px-3 py-1.5 rounded-l-xl rounded-tr-xl rounded-br-none shadow-md border border-blue-100">
          <span className="text-xl">😌</span>
        </div>
      </div>
      <div className="absolute top-[35%] right-[20%] opacity-90 animate-[bounce_4s_infinite]">
        <div className="bg-white px-3 py-1.5 rounded-r-xl rounded-tl-xl rounded-bl-none shadow-md border border-yellow-200">
          <span className="text-xl">⚡</span>
        </div>
      </div>
    </div>
  ),

  Accessible: () => (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <div className="absolute -right-10 -top-10 w-64 h-64 border-[20px] border-yellow-50 rounded-full opacity-50"></div>
      <div className="absolute -right-10 -top-10 w-48 h-48 border-[20px] border-blue-50 rounded-full opacity-50"></div>

      <div className="absolute top-[25%] left-[10%]">
        <div className="flex gap-1 items-end h-16">
          <div className="w-2 bg-blue-500 rounded-full h-6 animate-[pulse_1s_ease-in-out_infinite]"></div>
          <div className="w-2 bg-blue-600 rounded-full h-10 animate-[pulse_1.2s_ease-in-out_infinite]"></div>
          <div className="w-2 bg-blue-500 rounded-full h-14 animate-[pulse_0.8s_ease-in-out_infinite]"></div>
          <div className="w-2 bg-blue-400 rounded-full h-8 animate-[pulse_1.5s_ease-in-out_infinite]"></div>
        </div>
      </div>

      <div className="absolute top-[20%] right-[15%] w-20 h-20 bg-white/80 backdrop-blur-sm rounded-full border-2 border-gray-900 shadow-xl flex items-center justify-center transform rotate-12">
        <span className="text-3xl font-bold text-gray-900">Aa</span>
      </div>
    </div>
  ),

  ForEveryone: () => (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <svg
        className="absolute w-full h-full opacity-80"
        viewBox="0 0 300 200"
        preserveAspectRatio="none"
      >
        <path
          d="M-50 150 C 50 150, 100 50, 150 50 S 250 150, 350 150"
          fill="none"
          stroke="#eab308"
          strokeWidth="12"
          strokeOpacity="0.15"
        />
        <path
          d="M-50 150 C 50 150, 100 50, 150 50 S 250 150, 350 150"
          fill="none"
          stroke="#eab308"
          strokeWidth="3"
          strokeDasharray="6 6"
        />

        <path
          d="M-50 50 C 50 50, 100 150, 150 150 S 250 50, 350 50"
          fill="none"
          stroke="#2563eb"
          strokeWidth="12"
          strokeOpacity="0.15"
        />
        <path
          d="M-50 50 C 50 50, 100 150, 150 150 S 250 50, 350 50"
          fill="none"
          stroke="#2563eb"
          strokeWidth="3"
        />
      </svg>

      <div className="absolute top-[40%] left-[45%] bg-white p-2 rounded-full shadow-lg border border-gray-100 z-10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-700"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </div>
    </div>
  ),
};

const benefitsData = [
  {
    title: "Tematyczne trasy",
    description:
      "Zwiedzaj miasto w sposób dopasowany do Twoich zainteresowań — od historii po miejskie legendy.",
    illustration: Illustrations.Routes,
    colSpan: "md:col-span-1",
  },
  {
    title: "Odkrywanie mapy",
    description:
      "Interaktywna mapa prowadzi Cię przez najciekawsze punkty i podpowiada co jest najbliżej.",
    illustration: Illustrations.MapDiscovery,
    colSpan: "md:col-span-1",
  },
  {
    title: "System nagród",
    description:
      "Zdobywaj punkty, odblokowuj odznaki i rywalizuj ze znajomymi eksplorując miasto.",
    illustration: Illustrations.Rewards,
    colSpan: "md:col-span-1",
  },
  {
    title: "Realne odczucia",
    description:
      "Aplikacja reaguje na Twoją pozycję i tempo zwiedzania, zmieniając narrację w czasie rzeczywistym.",
    illustration: Illustrations.Feelings,
    colSpan: "md:col-span-2",
  },
  {
    title: "Dostępna dla każdego",
    description:
      "Wbudowany lektor, wysoki kontrast i asystent głosowy dla pełnej dostępności.",
    illustration: Illustrations.Accessible,
    colSpan: "md:col-span-1",
  },
  {
    title: "Dla mieszkańców i turystów",
    description:
      "Jedno narzędzie — pozwala turystom odkrywać, a mieszkańcom poznawać miasto na nowo.",
    illustration: Illustrations.ForEveryone,
    colSpan: "md:col-span-3",
  },
];

const FeaturesSection = () => {
  const { ref: headingRef, isInView } = useInView<HTMLHeadingElement>();

  return (
    <section id="funkcje" className="bg-white py-20 relative">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <div className="mb-16 md:mb-20 text-center max-w-3xl mx-auto">
          <h2
            ref={headingRef}
            className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight"
          >
            Miasto w Twoim{" "}
            <RoughNotation
              type="highlight"
              show={isInView}
              color="var(--secondary)"
              animationDelay={300}
              padding={[2, 6]}
              strokeWidth={2}
            >
              rytmie
            </RoughNotation>
          </h2>
          <p className="text-lg text-gray-600">
            Technologia, która znika, zostawiając Cię sam na sam z przygodą.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[320px]">
          {benefitsData.map((benefit) => {
            const Illustration = benefit.illustration;
            return (
              <Card
                key={benefit.title}
                className={`relative overflow-hidden rounded-[2rem] border-0 bg-gray-50 group transition-all duration-500 ${
                  benefit.colSpan || ""
                }`}
              >
                <div className="absolute inset-0 z-0 transition-transform duration-700 group-hover:scale-105">
                  <Illustration />
                </div>

                <div className="absolute inset-0 z-10 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none" />

                <CardContent className="relative z-20 h-full flex flex-col justify-end p-8">
                  <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 font-medium leading-relaxed opacity-90">
                      {benefit.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
