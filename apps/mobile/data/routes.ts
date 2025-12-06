export interface RouteStop {
  stop_id: number;
  name: string;
  map_marker: {
    display_name: string;
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  place_description: string;
  voice_over_text: string;
}

export interface Route {
  route_id: string;
  title: string;
  theme: string;
  category: string;
  total_time_minutes: number;
  difficulty: string;
  stops: RouteStop[];
}

export const routes: Route[] = [
  {
    route_id: "route_010",
    title: "Gdzie się jadało, gdzie się pijało",
    theme: "Podróż sentymentalna po miejscach, których już nie ma. Poczuj smak dawnej Bydgoszczy.",
    category: "Lifestyle / Nostalgia",
    total_time_minutes: 40,
    difficulty: "Łatwy (Spacerowy)",
    stops: [
      {
        stop_id: 1,
        name: "Dawna Kawiarnia 'Bristol'",
        map_marker: {
          display_name: "Dawna Kawiarnia Bristol",
          address: "Róg ulicy Mostowej i Starego Rynku",
          coordinates: {
            latitude: 53.1226,
            longitude: 18.0013,
          },
        },
        place_description: "Tu biło towarzyskie serce miasta przed wojną. Narożna kamienica (często kojarzona z siedzibą banku), gdzie dawniej spotykała się elita.",
        voice_over_text: "Dzień dobry, Szanowny Panie. Stolik przy oknie? Oczywiście. Ach, co to były za czasy... Kawiarnia Bristol. Tu nie wpadało się na 'szybką kawę'. Tu się bywało! Panowie w cylindrach czytali 'Dziennik Bydgoski', dyskutowali o polityce, dym z cygar unosił się pod sufit. Pachniało świeżo mieloną arabiką i wuzetkami. Dziś jest tu bank, ale ja wciąż słyszę brzęk porcelany i dźwięki pianina. Niech Pan usiądzie na chwilę w wyobraźni.",
      },
      {
        stop_id: 2,
        name: "Hala Targowa",
        map_marker: {
          display_name: "Hala Targowa",
          address: "ul. Podwale / Magdzińskiego",
          coordinates: {
            latitude: 53.1222,
            longitude: 18.0025,
          },
        },
        place_description: "Zabytkowa hala z charakterystyczną kopułą. Miejsce handlu, które przez lata karmiło miasto, a teraz zmienia swoje oblicze.",
        voice_over_text: "Świeże ryby! Gęsi owsiane! Najlepsze w mieście! Oj, kochaniutki, tu wrzało życie. Hala Targowa to był brzuch Bydgoszczy. Każdy tu przychodził. Targowali się, krzyczeli, śmiali. Zapach wędzonych ryb mieszał się z zapachem kwiatów. Teraz robią tu jakieś modne jedzenie, ale duch starego targu wciąż tu jest. Słyszysz to echo pod kopułą? To głosy tysięcy bydgoszczan, którzy przez lata robili tu zakupy na niedzielny obiad.",
      },
    ],
  },
  {
    route_id: "route_011",
    title: "Gaudeamus po Bydgosku – Od Kolosa do Browara",
    theme: "Szlak 'Wiecznego Studenta'. Odkryj historię nauki, miejsca kultowe dla bohemy i najlepsze miejscówki na reset.",
    category: "Lifestyle / Edukacja",
    total_time_minutes: 50,
    difficulty: "Łatwy",
    stops: [
      {
        stop_id: 1,
        name: "Copernicanum (UKW)",
        map_marker: {
          display_name: "Copernicanum (UKW)",
          address: "ul. Mikołaja Kopernika 1",
          coordinates: {
            latitude: 53.1312,
            longitude: 18.0098,
          },
        },
        place_description: "Zabytkowy, monumentalny budynek Uniwersytetu Kazimierza Wielkiego z czerwonej cegły.",
        voice_over_text: "Witaj w świątyni wiedzy, młody adepcie! Te mury z czerwonej cegły widziały więcej ściąg niż jesteś w stanie sobie wyobrazić. Kiedyś była tu szkoła realna, potem szpital wojskowy, teraz Uniwersytet. Pokolenia się zmieniają, moda się zmienia, ale stres przed egzaminem jest zawsze ten sam. Weź głęboki oddech. Nauka to przywilej, nawet jeśli sesja wydaje się końcem świata. Powodzenia!",
      },
      {
        stop_id: 2,
        name: "Dzielnica Muzyczna / Filharmonia",
        map_marker: {
          display_name: "Park Jana Kochanowskiego",
          address: "Aleje Adama Mickiewicza / Szwalbego",
          coordinates: {
            latitude: 53.1298,
            longitude: 18.0085,
          },
        },
        place_description: "Serce Dzielnicy Muzycznej. Miejsce relaksu studentów w sąsiedztwie Filharmonii i Akademii Muzycznej.",
        voice_over_text: "To nasza oaza. Słyszysz? Ktoś ćwiczy na trąbce przy otwartym oknie. Tutaj przychodzimy odpocząć między zajęciami. Możesz położyć się na trawie obok Bacha albo Chopina – oni nie gryzą. To jedyne miejsce w Bydgoszczy, gdzie cisza jest tak samo ważna jak dźwięk. Idealne na drzemkę albo randkę... oczywiście po zaliczeniu kolokwium.",
      },
      {
        stop_id: 3,
        name: "Klub Mózg",
        map_marker: {
          display_name: "Klub Mózg",
          address: "ul. Parkowa 2 (wejście od Gdańskiej)",
          coordinates: {
            latitude: 53.1288,
            longitude: 18.0050,
          },
        },
        place_description: "Legendarne miejsce kultury alternatywnej, kolebka stylu Yass, ukryte w oficynie przy ulicy Gdańskiej.",
        voice_over_text: "Tu kończy się akademia, a zaczyna prawdziwa sztuka. Klub Mózg. Legenda. Tu narodził się yass, tu grali najdziwniejsi muzycy świata. To miejsce jest surowe, stare, fabryczne, ale ma energię, której nie znajdziesz w wyczyszczonych galeriach. Jeśli chcesz poczuć ducha bydgoskiej bohemy, to właśnie tutaj. Wejdź, otwórz głowę i nie bój się myśleć inaczej.",
      },
    ],
  },
  {
    route_id: "route_007",
    title: "Secesyjny Szyk – Polowanie na Detale",
    theme: "Podnieś głowę! Posłuchaj opowieści zaklętych w fasadach najpiękniejszych kamienic.",
    category: "Architektura / Estetyka",
    total_time_minutes: 40,
    difficulty: "Łatwy (Spacerowy)",
    stops: [
      {
        stop_id: 1,
        name: "Hotel Pod Orłem",
        map_marker: {
          display_name: "Hotel Pod Orłem",
          address: "Ulica Gdańska 14",
          coordinates: {
            latitude: 53.1285,
            longitude: 18.0055,
          },
        },
        place_description: "Perła bydgoskiej secesji. Ikoniczny budynek zaprojektowany przez Józefa Święcickiego.",
        voice_over_text: "Ach, moje największe dzieło! 'Hotel Pod Orłem'. Kiedy go projektowałem, chciałem, żeby Bydgoszcz poczuła się jak Berlin czy Wiedeń. Spójrz na tego orła na szczycie – rozpościera skrzydła nad gośćmi, obiecując luksus i nowoczesność. Secesja to nie tylko styl, to filozofia. Linie muszą płynąć jak rośliny, detale muszą zachwycać. Nie patrz pod nogi, patrz w górę! Tam ukryłem duszę tego miasta.",
      },
      {
        stop_id: 2,
        name: "Dom Towarowy Jedynak",
        map_marker: {
          display_name: "DT Jedynak (Dawny Conitzer)",
          address: "Gdańska 15 / Dworcowa",
          coordinates: {
            latitude: 53.1288,
            longitude: 18.0058,
          },
        },
        place_description: "Dawny dom towarowy Conitzerów. Modernistyczny gmach z elementami secesji.",
        voice_over_text: "Och, czy widziałeś te witryny? Conitzer to był paryski szyk w sercu Bydgoszczy! Wchodziło się przez obrotowe drzwi prosto do wielkiego atrium. Zapach perfum, szelest jedwabiów, gwar rozmów... To tutaj damy kupowały kapelusze, a panowie cygara. Budynek stoi do dziś i wciąż zachwyca, choć czasy się zmieniły. Ale spójrz na te figury na fasadzie – one wciąż patrzą na ulicę Gdańską z tą samą dumą co sto lat temu.",
      },
    ],
  },
  {
    route_id: "route_006",
    title: "Symfonia Miasta – Dźwięki Bydgoszczy",
    theme: "Bydgoszcz brzmi muzyką. Wsłuchaj się w melodię płynącą z pomników i gmachów kultury.",
    category: "Muzyka / Sztuka",
    total_time_minutes: 45,
    difficulty: "Łatwy (Spacerowy)",
    stops: [
      {
        stop_id: 1,
        name: "Pomnik Łuczniczki",
        map_marker: {
          display_name: "Pomnik Łuczniczki",
          address: "Park Jana Kochanowskiego",
          coordinates: {
            latitude: 53.1292,
            longitude: 18.0088,
          },
        },
        place_description: "Ikona Bydgoszczy w otoczeniu gmachów kultury, stojąca naprzeciwko Teatru Polskiego i blisko Filharmonii.",
        voice_over_text: "Ciii... nie płosz moich myśli. Stoję tu napięta, gotowa do strzału od ponad wieku. Moja strzała leci prosto do celu, tak jak idealnie zagrany akord w Filharmonii za moimi plecami. Widziałam, jak zmieniał się ten park, jak zmieniali się ludzie, ale muzyka została ta sama. Balans, skupienie, precyzja. To łączy mnie ze skrzypkiem i pianistą. Poczuj ten rytm, on jest wszędzie, nawet w szumie liści.",
      },
      {
        stop_id: 2,
        name: "Opera Nova",
        map_marker: {
          display_name: "Opera Nova",
          address: "Zakole Brdy / ul. Marszałka Focha 5",
          coordinates: {
            latitude: 53.1236,
            longitude: 17.9967,
          },
        },
        place_description: "Nowoczesny gmach opery przypominający kręgi na wodzie, malowniczo położony nad samą rzeką.",
        voice_over_text: "Witamy w świątyni sztuki! Spójrz na ten budynek – trzy kręgi, jakby ktoś wrzucił kamień do Brdy. Ale prawdziwa magia dzieje się w środku. Tam, na scenie, ludzie płaczą, kochają i umierają w blasku świateł. Bydgoszcz kocha operę, a opera kocha Bydgoszcz. Kiedy wieczorem zapalają się światła, a orkiestra stroi instrumenty, całe miasto wstrzymuje oddech. Jesteś gotowy na uwerturę?",
      },
    ],
  },
  {
    route_id: "route_004",
    title: "TeH2O – Maszyny, Woda, Para",
    theme: "Zostań inżynierem z XIX wieku. Posłuchaj huku maszyn i szumu wody, które uczyniły z Bydgoszczy potęgę gospodarczą.",
    category: "Historia Techniki / Przemysł",
    total_time_minutes: 45,
    difficulty: "Średni",
    stops: [
      {
        stop_id: 1,
        name: "Młyny Rothera",
        map_marker: {
          display_name: "Młyny Rothera",
          address: "Wyspa Młyńska",
          coordinates: {
            latitude: 53.1238,
            longitude: 17.9992,
          },
        },
        place_description: "Monumentalny kompleks młynów, który po latach odzyskał blask.",
        voice_over_text: "Czujesz ten zapach? Dziś pachnie tu kawą i rzeką, ale zamknij oczy... Przez sto lat unosił się tu pył mączny, a huk maszyn był tak głośny, że musieliśmy do siebie krzyczeć! To był gigant. Karmiliśmy stąd całe królestwo. Te mury, te belki – to wszystko majstersztyk inżynierii. Woda napędzała koła, koła napędzały żarna, a żarna dawały życie. Teraz jest tu cicho, ale jeśli przyłożysz ucho do ściany, wciąż usłyszysz echo tamtej potęgi.",
      },
      {
        stop_id: 2,
        name: "Stary Kanał Bydgoski (Śluzy)",
        map_marker: {
          display_name: "Stary Kanał Bydgoski",
          address: "Park nad Starym Kanałem",
          coordinates: {
            latitude: 53.1245,
            longitude: 17.9778,
          },
        },
        place_description: "Cud inżynierii XVIII wieku łączący wschód z zachodem.",
        voice_over_text: "Ahoj! Widzisz tę wodę? To nie jest zwykły rów. To okno na świat! Dzięki tym śluzom Bydgoszcz połączyła Wisłę z Odra, Wschód z Zachodem. Ile ja się tu naczekałem na śluzowanie... Barki z drewnem, zbożem, cegłą. To była ciężka praca, kręcenie korbami, walka z prądem. Ale byliśmy dumni. Bydgoszcz wyrosła na wodzie i dzięki wodzie. Szanuj ten kanał, to żywy pomnik ludzkiego sprytu.",
      },
    ],
  },
  {
    route_id: "route_003",
    title: "Kamienie, które krzyczą – Bydgoszcz 1939",
    theme: "Poruszająca podróż przez wydarzenia września 1939 roku. Posłuchaj niemych świadków historii i zapal wirtualne światło pamięci.",
    category: "Edukacja Historyczna / Pamięć",
    total_time_minutes: 50,
    difficulty: "Średni (Refleksyjny)",
    stops: [
      {
        stop_id: 1,
        name: "Stary Rynek - Pomnik Walki i Męczeństwa",
        map_marker: {
          display_name: "Pomnik Walki i Męczeństwa",
          address: "Stary Rynek",
          coordinates: {
            latitude: 53.1218,
            longitude: 18.0005,
          },
        },
        place_description: "Serce miasta i miejsce egzekucji mieszkańców w 1939 roku.",
        voice_over_text: "Zatrzymaj się. Proszę, zachowaj ciszę. Tu, gdzie teraz stoisz, historia zostawiła najgłębszą bliznę. Wrzesień 1939 roku zmienił ten rynek w scenę dramatu. Słyszysz ten gwar kawiarni dookoła? Wtedy była tu tylko cisza przerywana wystrzałami. Zginęli tu nasi sąsiedzi, nauczyciele, księża... najlepsi z nas. Ten pomnik to nie tylko kamień. To krzyk, który zastygł w czasie. Nie bój się patrzeć w przeszłość. Pamięć to nasz obowiązek wobec tych, którzy nie mogą już mówić.",
      },
      {
        stop_id: 2,
        name: "Bydgoskie Lwy (Pomnik)",
        map_marker: {
          display_name: "Plac Wolności",
          address: "Plac Wolności",
          coordinates: {
            latitude: 53.1256,
            longitude: 18.0062,
          },
        },
        place_description: "Lwy, które zniknęły i wróciły. Symbolizują siłę miasta.",
        voice_over_text: "Spójrz mi w oczy. Jestem z brązu, ale mam serce wierne temu miastu. Kiedyś stałem tu dumnie, potem nas zabrano, przetopiono, chciano wymazać. Myśleli, że jeśli usuną symbole, zniknie też polskość Bydgoszczy. Mylili się. Wróciliśmy. Może trochę inni, może odnowieni, ale wciąż na straży. Tak jak wraca wolność, tak i my wróciliśmy na swoje miejsce. Pamiętaj: siły miasta nie mierzy się grubością murów, ale tym, ile razy potrafi się podnieść z kolan.",
      },
      {
        stop_id: 3,
        name: "Wieża Ciśnień",
        map_marker: {
          display_name: "Wieża Ciśnień (Muzeum Wodociągów)",
          address: "Wzgórze Dąbrowskiego",
          coordinates: {
            latitude: 53.1205,
            longitude: 17.9940,
          },
        },
        place_description: "Punkt widokowy i świadek historii walk o wyzwolenie.",
        voice_over_text: "To najwyższy punkt. Strategiczne miejsce. Kto ma wzgórze, ten ma miasto. Spójrz na tę panoramę – dziś jest spokojna, dachy lśnią w słońcu. Ale każdy z tych dachów, każda ulica, którą widzisz w dole, ma swoją opowieść o odwadze. Tu, na tym wzgórzu, ziemia drżała od wybuchów. Dziś wieża służy do podziwiania widoków, ale nigdy nie zapomnij, że kiedyś służyła do obrony tego, co kochamy najbardziej – naszego domu.",
      },
    ],
  },
  {
    route_id: "route_002",
    title: "Magia nad Brdą – Szlak Legend",
    theme: "Odkryj magiczną stronę Bydgoszczy. Opowieści zaklęte w pomnikach – od balansu nad rzeką, przez historię potopu, aż po czarnoksiężnika na rynku.",
    category: "Spacer Narracyjny / Audio Guide",
    total_time_minutes: 45,
    difficulty: "Łatwy (Spacerowy)",
    stops: [
      {
        stop_id: 1,
        name: "Rzeźba 'Przechodzący przez rzekę'",
        map_marker: {
          display_name: "Przechodzący przez rzekę",
          address: "Nad rzeką Brdą, przy moście Jerzego Sulimy-Kamińskiego",
          coordinates: {
            latitude: 53.1235,
            longitude: 18.0042,
          },
        },
        place_description: "Niezwykła rzeźba balansująca na linie. Symbol nowoczesnej Bydgoszczy zawieszony nad wodą.",
        voice_over_text: "Spójrz w górę. Nie bój się, nie spadnę. Wiszę tak od dnia wejścia Polski do Unii Europejskiej, zawieszony między jednym brzegiem a drugim. Dla Ciebie to tylko lina i metal, ale dla mnie to wieczna medytacja. Widzisz tę rzekę pode mną? To Brda – krwiobieg tego miasta. Balans to życie, przyjacielu. Bydgoszcz też musi balansować – jedną nogą stoi twardo w swojej historii, w murach spichrzy i starych kamienicach, a drugą szuka oparcia w przyszłości, w szkle, w operze, w nowych technologiach. Stoję tu, by przypominać Ci, że dopóki patrzysz przed siebie i idziesz odważnie, grawitacja nie ma nad Tobą władzy. Przejdźmy dalej, woda niesie kolejne opowieści.",
      },
      {
        stop_id: 2,
        name: "Fontanna Potop",
        map_marker: {
          display_name: "Fontanna Potop",
          address: "Park Kazimierza Wielkiego",
          coordinates: {
            latitude: 53.1268,
            longitude: 18.0075,
          },
        },
        place_description: "Zrekonstruowana, monumentalna fontanna przedstawiająca biblijny Potop.",
        voice_over_text: "Zamknij na chwilę oczy i posłuchaj wody. Słyszysz ten potężny szum? Przez lata w tym miejscu panowała martwa cisza. Ta fontanna to nie tylko biblijna scena potopu, to symbol naszej nieustępliwości. Podczas wojny, w 1943 roku, zabrano nam ją. Spiżowe ciała ludzi i zwierząt zostały przetopione na niemieckie armaty. Został tylko pusty basen. Ale my, bydgoszczanie, nigdy o niej nie zapomnieliśmy. Każda kropla, która teraz spada, jest dowodem na to, że to, co kochamy, można odzyskać. Złożyliśmy się na nią wszyscy – mieszkańcy, firmy, miasto. To nie jest zwykła woda. To łzy wzruszenia i pot naszej pracy. Otwórz oczy. Widzisz teraz więcej niż tylko rzeźbę, prawda?",
      },
      {
        stop_id: 3,
        name: "Okno Pana Twardowskiego",
        map_marker: {
          display_name: "Kamienica Pana Twardowskiego",
          address: "Stary Rynek 15",
          coordinates: {
            latitude: 53.1220,
            longitude: 18.0005,
          },
        },
        place_description: "Miejsce, gdzie codziennie o 13:13 i 21:13 ukazuje się postać czarnoksiężnika.",
        voice_over_text: "Hahaha! A któż to zadziera głowę i gapi się w moje okno? Myślałeś, że jestem tylko drewnianą kukłą, która wyskakuje o 13:13 ku uciesze gawiedzi? Błąd! Ja tu mieszkam od wieków! Wszyscy mówią o Krakowie, o kogucie i Księżycu, ale to Bydgoszcz dała mi gościnę, gdy uciekałem przed diabłem. To miasto ma w sobie magię, czujesz to? Jest w czerwonej cegle, w nurcie rzeki, w zapachu chleba. Nie potrzebujesz cyrografu, żeby być szczęśliwym. Wystarczy, że rozejrzysz się dookoła. No, idź już zwiedzać dalej, bo zaraz Węgliszek, mój diabelski służący, zacznie przypalać mi buty. Bywaj, wędrowcze!",
      },
    ],
  },
  {
    route_id: "route_001",
    title: "Kod Bydgoszczy – Śladami Rejewskiego",
    theme: "Śladami Rejewskiego – Matematyczny geniusz kontra machina wojenna",
    category: "Gra Miejska / Zagadki",
    total_time_minutes: 60,
    difficulty: "Trudny",
    stops: [
      {
        stop_id: 1,
        name: "Pomnik Mariana Rejewskiego",
        map_marker: {
          display_name: "Ławeczka Rejewskiego",
          address: "Ulica Gdańska / Śniadeckich",
          coordinates: {
            latitude: 53.1276,
            longitude: 18.0035,
          },
        },
        place_description: "Słynny pomnik w formie ławeczki. Marian Rejewski siedzi tu z notatnikiem, patrząc na przechodniów. To idealne miejsce na start – w sercu miasta.",
        voice_over_text: "Cześć. Nazywam się Marian Rejewski. Widzisz ten pomnik? Wyglądam na nim na spokojnego, prawda? Ale w mojej głowie... w mojej głowie zawsze trwała wojna na liczby. Matematyka to nie tylko nudne równania w szkole. To klucz do wolności. Jeśli potrafisz dostrzec wzór tam, gdzie inni widzą chaos – możesz zmienić losy świata. Pomożesz mi? Musimy złamać jeszcze jedną depeszę, zanim zrobi to wróg.",
      },
      {
        stop_id: 2,
        name: "I Liceum Ogólnokształcące (Alma Mater)",
        map_marker: {
          display_name: "Budynek I LO",
          address: "Plac Wolności",
          coordinates: {
            latitude: 53.1255,
            longitude: 18.0060,
          },
        },
        place_description: "Historyczny budynek szkoły (dawne Państwowe Gimnazjum Klasyczne), którą Rejewski ukończył w 1923 roku. Tu zdobył wiedzę, która zmieniła losy wojny.",
        voice_over_text: "Jestem bydgoszczaninem, tak jak Ty może jesteś lub będziesz. Urodziłem się tutaj w 1905 roku. Chodziłem do gimnazjum przy Placu Wolności. Wszyscy myśleli, że będę po prostu księgowym albo nauczycielem. Ale ja widziałem świat inaczej. Kiedy wywiad wojskowy szukał ludzi do łamania kodów, nie szukali lingwistów, szukali matematyków. Wybrali mnie. I to była najważniejsza decyzja w moim życiu.",
      },
      {
        stop_id: 3,
        name: "Makieta Dawnej Bydgoszczy / Spichrze",
        map_marker: {
          display_name: "Spichrze nad Brdą & Makieta",
          address: "Okolice Mostowej / Grodzkiej",
          coordinates: {
            latitude: 53.1230,
            longitude: 18.0040,
          },
        },
        place_description: "Symbol miasta – zabytkowe spichrze oraz makieta. Miejsce styku historii z rzeką Brdą, symbolizujące powrót do korzeni.",
        voice_over_text: "To jest cena bycia kryptologiem. Przez całe życie musiałem milczeć. Nawet moja żona nie wiedziała, co robiłem w Warszawie przed wojną. Kiedy uciekaliśmy, niszczyliśmy wszystko. Świat dowiedział się o naszym sukcesie dopiero po latach... Czasem największym bohaterstwem jest milczenie i robienie swojej roboty. Ale cieszę się, że Bydgoszcz teraz pamięta.",
      },
    ],
  },
];

