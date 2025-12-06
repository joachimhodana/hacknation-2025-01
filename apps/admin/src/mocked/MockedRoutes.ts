import type { RoutesObjectType, RouteStopType } from "@/types/RoutesType.tsx";

// --- Przystanki dla Trasy 1 (Kraków) ---
const krakowStop1: RouteStopType = {
    stop_id: 1,
    name: "Rynek Główny",
    map_marker: {
        display_name: "Rynek Główny w Krakowie",
        address: "Rynek Główny, 31-042 Kraków",
        coordinates: { latitude: 50.0614, longitude: 19.9383 },
    },
    place_description: "Serce Krakowa, otoczone zabytkowymi kamienicami, z Kościołem Mariackim i Sukiennicami.",
    voice_over_text: "Witamy na Rynku, największym średniowiecznym placu Europy. Zostań na chwilę, posłuchaj hejnału z Wieży Mariackiej i poczuj tętno historycznej stolicy Polski.",
};

const krakowStop2: RouteStopType = {
    stop_id: 2,
    name: "Wawel",
    map_marker: {
        display_name: "Zamek Królewski na Wawelu",
        address: "Wawel 5, 31-001 Kraków",
        coordinates: { latitude: 50.0544, longitude: 19.9351 },
    },
    place_description: "Wzgórze Wawelskie z Zamkiem Królewskim i Katedrą – symbol polskiej państwowości.",
    voice_over_text: "Oto Wawel, miejsce spoczynku królów i serce polskiej historii. Poczuj majestat tego miejsca i poszukaj Smoka Wawelskiego nad Wisłą. Nie zapomnij zajrzeć do Katedry, to prawdziwa skarbnica narodowa.",
};

// --- Przystanki dla Trasy 2 (Warszawa) ---
const warszawaStop1: RouteStopType = {
    stop_id: 1,
    name: "Pałac Kultury i Nauki",
    map_marker: {
        display_name: "Pałac Kultury i Nauki (PKiN)",
        address: "Plac Defilad 1, 00-901 Warszawa",
        coordinates: { latitude: 52.2319, longitude: 21.0067 },
    },
    place_description: "Charakterystyczny socrealistyczny wieżowiec w centrum Warszawy, prezent od ZSRR.",
    voice_over_text: "Kontrowersyjny, ale niepowtarzalny. PKiN, przez jednych kochany, przez innych nienawidzony. To centrum kultury, rozrywki i symbol minionej epoki. Wjedź na taras widokowy, by zobaczyć panoramę miasta, które dynamicznie się zmienia.",
};

// --- Przystanki dla Trasy 3 (Łódź) ---
const lodzStop1: RouteStopType = {
    stop_id: 1,
    name: "Piotrkowska",
    map_marker: {
        display_name: "Ulica Piotrkowska",
        address: "Ulica Piotrkowska, Łódź",
        coordinates: { latitude: 51.7709, longitude: 19.4533 },
    },
    place_description: "Najdłuższa ulica handlowa w Polsce, pełna secesyjnych kamienic, restauracji i pubów.",
    voice_over_text: "Piotrkowska – serce Łodzi. To tutaj rodziła się potęga włókiennicza miasta. Poszukaj 'Ławeczki Tuwima' i pomnika 'Fortepian Rubinszteina'. Ulica jest długa, ale pełna życia – od historycznych pałaców po nowoczesne murale.",
};
// ----------------------------------------------------

export const mockedRoutesObject: RoutesObjectType[] = [
    // --- TRASA 1: Historyczny Kraków ---
    {
        pathId: "krakow_001",
        title: "Królewska Pętla: Od Rynku do Wawelu",
        shortDescription: "Klasyczna trasa po najważniejszych zabytkach Starego Miasta w Krakowie.",
        longDescription: "Szlak obejmuje obowiązkowe punkty na mapie Krakowa. Idealny dla tych, którzy chcą poczuć ducha dawnej stolicy Polski, łącząc średniowieczny Rynek z królewskim Wawelem.",
        category: "Historia / Zwiedzanie",
        totalTimeMinutes: 90,
        difficulty: "Łatwy",
        distanceMeters: 2200,
        thumbnailUrl: "https://example.com/images/krakow_wawel_thumb.jpg",
        isPublished: true,
        stylePreset: "classic_tour",
        makerIconUrl: "https://example.com/icons/crown_marker.png",
        createBy: "CityExplorer",
        createdAt: 1672531200000, // 1 stycznia 2023
        updatedAt: 1708992000000, // 27 lutego 2024
        stops: [krakowStop1, krakowStop2],
    },

    // --- TRASA 2: Post-Industrialna Warszawa ---
    {
        pathId: "warszawa_003",
        title: "Kontrasty Stolicy: Od PKiN do Pragi",
        shortDescription: "Trasa ukazująca architektoniczne kontrasty Warszawy: socrealizm, nowoczesność i stara Praga.",
        longDescription: "Półtoragodzinna podróż przez dwa brzegi Wisły. Zaczynamy od ikony socrealizmu, by przejść mostem i odkryć surowy, autentyczny urok prawobrzeżnej Warszawy z jej starymi kamienicami.",
        category: "Architektura / Urbanizm",
        totalTimeMinutes: 90,
        difficulty: "Umiarkowany",
        distanceMeters: 4500,
        thumbnailUrl: "https://example.com/images/warszawa_praga_thumb.jpg",
        isPublished: true,
        stylePreset: "urban_contrast",
        makerIconUrl: "https://example.com/icons/tower_marker.png",
        createBy: "CultureVulture",
        createdAt: 1709251200000, // 2 marca 2024
        updatedAt: 1709251200000,
        stops: [warszawaStop1],
    },

    // --- TRASA 3: Secesyjna Łódź ---
    {
        pathId: "lodz_002",
        title: "Włókienniczy Sen: Secesyjna Łódź",
        shortDescription: "Pieszy szlak wzdłuż ul. Piotrkowskiej, koncentrujący się na architekturze i kinie.",
        longDescription: "Trasa dedykowana pięknu łódzkiej secesji i dziedzictwu filmowemu. Odkryj pałace fabrykantów, podwórka artystów oraz miejsca związane z polską kinematografią.",
        category: "Sztuka / Architektura",
        totalTimeMinutes: 60,
        difficulty: "Łatwy",
        distanceMeters: 1500,
        thumbnailUrl: "https://example.com/images/lodz_piotrkowska_thumb.jpg",
        isPublished: false, // Wersja robocza
        stylePreset: "art_deco_walk",
        makerIconUrl: "https://example.com/icons/camera_marker.png",
        createBy: "ŁódźFan",
        createdAt: 1711929600000, // 1 kwietnia 2024
        updatedAt: 1711929600000,
        stops: [lodzStop1],
    },
];