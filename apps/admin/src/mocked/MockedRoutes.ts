import type {RoutesObjectType} from "@/types/RoutesType.tsx";

export const mockedRoutesObject: RoutesObjectType[] = [{
    "route_id": "route_011",
    "title": "Gaudeamus po Bydgosku – Od Kolosa do Browara",
    "theme": "Szlak 'Wiecznego Studenta'. Odkryj historię nauki, miejsca kultowe dla bohemy i najlepsze miejscówki na reset.",
    "category": "Lifestyle / Edukacja",
    "total_time_minutes": 50,
    "difficulty": "Łatwy",
    "stops": [
        {
            "stop_id": 1,
            "name": "Copernicanum (UKW)",
            "map_marker": {
                "display_name": "Copernicanum (UKW)",
                "address": "ul. Mikołaja Kopernika 1",
                "coordinates": {
                    "latitude": 53.1312,
                    "longitude": 18.0098
                }
            },
            "place_description": "Zabytkowy, monumentalny budynek Uniwersytetu Kazimierza Wielkiego z czerwonej cegły.",
            "voice_over_text": "Witaj w świątyni wiedzy, młody adepcie! Te mury z czerwonej cegły widziały więcej ściąg niż jesteś w stanie sobie wyobrazić. Kiedyś była tu szkoła realna, potem szpital wojskowy, teraz Uniwersytet. Pokolenia się zmieniają, moda się zmienia, ale stres przed egzaminem jest zawsze ten sam. Weź głęboki oddech. Nauka to przywilej, nawet jeśli sesja wydaje się końcem świata. Powodzenia!"
        },
        {
            "stop_id": 2,
            "name": "Dzielnica Muzyczna / Filharmonia",
            "map_marker": {
                "display_name": "Park Jana Kochanowskiego",
                "address": "Aleje Adama Mickiewicza / Szwalbego",
                "coordinates": {
                    "latitude": 53.1298,
                    "longitude": 18.0085
                }
            },
            "place_description": "Serce Dzielnicy Muzycznej. Miejsce relaksu studentów w sąsiedztwie Filharmonii i Akademii Muzycznej.",
            "voice_over_text": "To nasza oaza. Słyszysz? Ktoś ćwiczy na trąbce przy otwartym oknie. Tutaj przychodzimy odpocząć między zajęciami. Możesz położyć się na trawie obok Bacha albo Chopina – oni nie gryzą. To jedyne miejsce w Bydgoszczy, gdzie cisza jest tak samo ważna jak dźwięk. Idealne na drzemkę albo randkę... oczywiście po zaliczeniu kolokwium."
        },
        {
            "stop_id": 3,
            "name": "Klub Mózg",
            "map_marker": {
                "display_name": "Klub Mózg",
                "address": "ul. Parkowa 2 (wejście od Gdańskiej)",
                "coordinates": {
                    "latitude": 53.1288,
                    "longitude": 18.0050
                }
            },
            "place_description": "Legendarne miejsce kultury alternatywnej, kolebka stylu Yass, ukryte w oficynie przy ulicy Gdańskiej.",
            "voice_over_text": "Tu kończy się akademia, a zaczyna prawdziwa sztuka. Klub Mózg. Legenda. Tu narodził się yass, tu grali najdziwniejsi muzycy świata. To miejsce jest surowe, stare, fabryczne, ale ma energię, której nie znajdziesz w wyczyszczonych galeriach. Jeśli chcesz poczuć ducha bydgoskiej bohemy, to właśnie tutaj. Wejdź, otwórz głowę i nie bój się myśleć inaczej."
        }
    ]
}]