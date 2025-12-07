# Dokumentacja Techniczna

## Struktura projektu

Projekt składa się z czterech głównych aplikacji:

- **apps/mobile** - Aplikacja mobilna (React Native + Expo)
- **apps/core** - Backend API (Elysia + Bun)
- **apps/landing** - Strona landingowa (Next.js)
- **apps/admin** - Panel administratora (React + Vite)

---

## Aplikacja Mobilna

### Stack użyty do aplikacji

- **React Native** + **TypeScript**
- **Expo** ~54.0.27 (Expo Router ~6.0.17)
- **Better Auth** ^1.4.5 (@better-auth/expo) - autentykacja
- **React Navigation** - nawigacja między ekranami
- **MapLibre GL** ^3.6.2 / **React Native Maps** 1.18.0 - mapy
- **Expo Location** ~18.0.7 - geolokalizacja
- **Expo AV** ~15.0.1 - odtwarzanie audio
- **Expo Haptics** ~15.0.8 - feedback haptyczny
- **React Native Reanimated** ~4.1.1 - animacje
- **React Native SVG** 15.12.1 - grafika wektorowa
- **@solar-icons/react** ^1.0.1 - ikony

**Platformy:** iOS, Android, Web

### Ogólna struktura aplikacji

Aplikacja wykorzystuje **Expo Router** z file-based routing. Wszystkie ekrany znajdują się w katalogu `app/`.

#### Ekrany (routes)

- `/` (index.tsx) - ekran startowy z opcjami logowania i trybu gościa
- `/splash` - ekran powitalny/splash screen
- `/login` - formularz logowania
- `/signup` - formularz rejestracji
- `/map` - główna mapa z trasami i punktami
- `/explore` - przeglądanie dostępnych tras (Włóczykij)
- `/profile` - profil użytkownika ze statystykami
- `/collections` - skarbnica z zebranymi przedmiotami i nagrodami
- `/route-details` - szczegóły wybranej trasy
- `/modal` - modalne okna dialogowe

### Folderowa struktura projektu

```
apps/mobile/
├── app/                    # Ekrany aplikacji (Expo Router)
│   ├── _layout.tsx        # Główny layout z nawigacją Stack
│   ├── index.tsx          # Ekran startowy
│   ├── splash.tsx         # Splash screen
│   ├── login.tsx          # Logowanie
│   ├── signup.tsx         # Rejestracja
│   ├── map.tsx            # Mapa główna
│   ├── explore.tsx        # Przeglądanie tras
│   ├── profile.tsx        # Profil użytkownika
│   ├── collections.tsx    # Skarbnica
│   ├── route-details.tsx  # Szczegóły trasy
│   ├── modal.tsx          # Modalne okna
│   ├── api/               # API routes (Better Auth)
│   │   └── auth/
│   │       └── [...auth]+api.ts
│   └── data/              # Dane statyczne
│       └── items.ts
├── components/            # Komponenty reużywalne
│   ├── Map/              # Komponenty mapy
│   │   ├── Map.native.tsx
│   │   └── Map.web.tsx
│   ├── Navbar.tsx        # Nawigacja dolna (web)
│   ├── Navbar.native.tsx # Nawigacja dolna (native)
│   ├── PointsBadge.tsx   # Badge z punktami użytkownika
│   ├── route-card.tsx    # Karta trasy
│   ├── themed-text.tsx   # Tekst z obsługą motywu
│   ├── themed-view.tsx   # View z obsługą motywu
│   ├── haptic-tab.tsx    # Tab z feedbackiem haptycznym
│   ├── parallax-scroll-view.tsx
│   └── ui/               # Komponenty UI
│       ├── collapsible.tsx
│       ├── icon-symbol.tsx
│       └── icon-symbol.ios.tsx
├── lib/                  # Biblioteki i narzędzia
│   ├── api-client.ts     # Klient API do komunikacji z backendem
│   ├── api-url.ts        # Konfiguracja URL API
│   ├── auth-client.ts    # Klient autentykacji (Better Auth)
│   ├── auth.ts           # Pomocnicze funkcje autentykacji
│   └── geofence-utils.ts # Narzędzia do geofencing
├── hooks/                # Custom hooks
│   ├── use-color-scheme.ts
│   ├── use-color-scheme.web.ts
│   ├── use-device-detection.ts
│   └── use-theme-color.ts
├── constants/            # Stałe
│   └── theme.ts          # Kolory i motywy
├── assets/               # Zasoby statyczne
│   └── images/           # Obrazy
├── app.json              # Konfiguracja Expo
├── package.json
└── tsconfig.json
```

### Funkcjonalności

#### Autentykacja

- **Better Auth** z integracją Expo
- Obsługa logowania email/hasło
- Logowanie anonimowe (tryb gościa)
- Sesje przechowywane w SecureStore (native) lub cookies (web)
- Automatyczne przekierowania na podstawie stanu sesji

#### Mapa

- Integracja z **MapLibre GL** (web) i **React Native Maps** (native)
- Wyświetlanie tras i punktów na mapie
- Geolokalizacja użytkownika
- Geofencing - automatyczne wykrywanie wejścia w obszar punktu
- Markery z ikonami dla tras i punktów
- Obsługa różnych stylów map (style presets)

#### Trasy

- Lista dostępnych tras (tylko opublikowane)
- Szczegóły trasy z opisem, czasem trwania, trudnością
- Rozpoczynanie i wstrzymywanie tras
- Śledzenie postępu (odwiedzone punkty)
- Odtwarzanie audio narracji
- System nagród za odwiedzenie punktów

#### Profil użytkownika

- Statystyki użytkownika:
  - Procent ukończenia tras
  - Liczba ukończonych tras
  - Całkowity przebyty dystans
  - Liczba zebranych przedmiotów
- Tablica wyników (leaderboard)
- Historia aktywności

#### Skarbnica (Collections)

- Zebrane przedmioty z tras
- Wszystkie dostępne nagrody z informacją o statusie (zebrane/niezebrane)
- Filtrowanie i sortowanie
- Szczegóły każdego przedmiotu

#### Nawigacja

- Dolna nawigacja z 4 głównymi sekcjami:
  - **Mapa** - główna mapa
  - **Włóczykij** - przeglądanie tras
  - **Profil** - profil użytkownika
  - **Skarbnica** - zebrane przedmioty
- Obsługa motywu jasnego/ciemnego
- Feedback haptyczny na urządzeniach mobilnych

### Konfiguracja

#### Zmienne środowiskowe

Aplikacja wymaga skonfigurowania URL API backendu. W pliku `.env`:

```
EXPO_PUBLIC_API_URL=http://localhost:8080
```

#### Platformy

- **iOS** - bundle identifier: `com.kluczi.mobile`
- **Android** - package: `com.kluczi.mobile`
- **Web** - statyczny output, dostępny przez Expo web

#### Eksperymentalne funkcje

- **Typed Routes** - typowane ścieżki routingu
- **React Compiler** - kompilator React dla lepszej wydajności
- **New Architecture** - włączona nowa architektura React Native

### Rozwój

#### Uruchomienie w trybie deweloperskim

```bash
cd apps/mobile
npm install
npx expo start
```

#### Build dla platform natywnych

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

#### Linting

```bash
npm run lint
```

### Integracja z backendem

Aplikacja komunikuje się z backendem (`apps/core`) przez REST API:

- **Autentykacja**: `/api/auth/*` (Better Auth endpoints)
- **Statystyki użytkownika**: `GET /user/stats`
- **Trasy**: `GET /user/paths`
- **Postęp trasy**: `GET /user/paths/progress`
- **Rozpoczęcie trasy**: `POST /user/paths/:pathId/start`
- **Wstrzymanie trasy**: `POST /user/paths/:pathId/pause`
- **Odwiedzenie punktu**: `POST /user/paths/progress/visit`
- **Punkty publiczne**: `GET /user/points/public`
- **Nagrody**: `GET /user/rewards`
- **Tablica wyników**: `GET /user/leaderboard`

Wszystkie endpointy (oprócz autentykacji) wymagają uwierzytelnienia. Na platformie web używane są cookies, na natywnych platformach - nagłówki Cookie z SecureStore.

---

## Backend (Core)

### Stack użyty do aplikacji

- **Bun** - runtime JavaScript/TypeScript
- **Elysia** (latest) - framework webowy
- **Drizzle ORM** ^0.45.0 - ORM do bazy danych
- **PostgreSQL** - baza danych
- **Better Auth** ^1.4.5 - system autentykacji
- **@elysiajs/cors** ^1.4.0 - obsługa CORS
- **@elysiajs/openapi** ^1.4.11 - dokumentacja OpenAPI/Swagger
- **@elysiajs/server-timing** ^1.4.0 - metryki wydajności
- **@elysiajs/static** ^1.4.7 - serwowanie plików statycznych

### Ogólna struktura aplikacji

Backend to REST API oparte na Elysia, które obsługuje:
- Autentykację użytkowników (Better Auth)
- Zarządzanie trasami (paths) i punktami (points)
- Zarządzanie postaciami (characters)
- Śledzenie postępu użytkowników
- System nagród i przedmiotów
- Statystyki użytkowników
- Panel administracyjny

### Endpointy API

#### Autentykacja
- `/api/auth/*` - wszystkie endpointy Better Auth (logowanie, rejestracja, sesje)

#### Endpointy użytkownika (wymagają autentykacji)
- `GET /user/stats` - statystyki użytkownika
- `GET /user/paths` - lista opublikowanych tras
- `GET /user/paths/:pathId` - szczegóły trasy
- `GET /user/paths/progress` - aktywny postęp trasy
- `POST /user/paths/:pathId/start` - rozpoczęcie trasy
- `POST /user/paths/:pathId/pause` - wstrzymanie trasy
- `POST /user/paths/progress/visit` - oznaczenie punktu jako odwiedzonego
- `GET /user/points/public` - publiczne punkty na mapie
- `GET /user/rewards` - wszystkie nagrody użytkownika
- `GET /user/leaderboard` - tablica wyników

#### Endpointy administracyjne (wymagają uprawnień admin)
- `GET /admin/paths` - lista wszystkich tras
- `POST /admin/paths` - utworzenie nowej trasy
- `PUT /admin/paths/:id` - aktualizacja trasy
- `DELETE /admin/paths/:id` - usunięcie trasy
- `GET /admin/points` - lista wszystkich punktów
- `POST /admin/points` - utworzenie nowego punktu
- `PUT /admin/points/:id` - aktualizacja punktu
- `DELETE /admin/points/:id` - usunięcie punktu
- `GET /admin/characters` - lista wszystkich postaci
- `POST /admin/characters` - utworzenie nowej postaci
- `PUT /admin/characters/:id` - aktualizacja postaci
- `DELETE /admin/characters/:id` - usunięcie postaci

#### Inne
- `GET /health` - health check
- `GET /resources/*` - serwowanie plików statycznych (obrazy, audio)
- `/swagger` - dokumentacja OpenAPI/Swagger UI

### Folderowa struktura projektu

```
apps/core/
├── src/
│   ├── index.ts              # Entry point z clustering
│   ├── server.ts             # Główny serwer Elysia
│   ├── db/                   # Baza danych
│   │   ├── index.ts          # Połączenie z bazą danych
│   │   ├── schema.ts         # Schemat Drizzle ORM (tabele główne)
│   │   ├── auth-schema.ts    # Schemat Better Auth
│   │   └── migrations/       # Migracje bazy danych
│   ├── lib/                  # Biblioteki pomocnicze
│   │   ├── auth.ts           # Konfiguracja Better Auth
│   │   └── admin-middleware.ts # Middleware do weryfikacji uprawnień admin
│   └── routes/               # Endpointy API
│       ├── admin/            # Endpointy administracyjne
│       │   ├── index.ts      # Router główny admin
│       │   ├── paths.ts      # CRUD tras
│       │   ├── points.ts     # CRUD punktów
│       │   └── characters.ts # CRUD postaci
│       └── user/             # Endpointy użytkownika
│           ├── paths.ts      # Trasy użytkownika
│           └── stats.ts      # Statystyki użytkownika
├── scripts/                  # Skrypty pomocnicze
│   ├── create-admin.ts       # Tworzenie konta administratora
│   └── seed.ts               # Seedowanie bazy danych
├── seeds/                    # Dane do seedowania
│   ├── characters.json
│   ├── paths.json
│   ├── path-points.json
│   └── points.json
├── resources/                # Zasoby (obrazy, audio) - seeded files
│   ├── avatars/
│   ├── marker_icons/
│   ├── thumbnails/
│   └── seeded/
├── public/                   # Zasoby publiczne (uploaded files)
│   └── resources/
│       ├── avatars/
│       ├── marker_icons/
│       └── thumbnails/
├── drizzle.config.ts         # Konfiguracja Drizzle ORM
├── package.json
└── tsconfig.json
```

### Baza danych

#### Schemat bazy danych (PostgreSQL)

##### Tabele autentykacji (Better Auth)
- `user` - użytkownicy
- `session` - sesje użytkowników
- `account` - konta powiązane (OAuth)
- `verification` - weryfikacja email

##### Tabele główne
- `paths` - trasy/ścieżki
  - id, pathId (unikalny identyfikator), title, shortDescription, longDescription
  - category, difficulty, totalTimeMinutes, distanceMeters
  - thumbnailUrl, markerIconUrl, stylePreset
  - isPublished, createdBy, createdAt, updatedAt

- `characters` - postacie w aplikacji
  - id, name, avatarUrl, description
  - createdBy, createdAt, updatedAt

- `points` - punkty na mapie (geofence)
  - id, latitude, longitude, radiusMeters
  - locationLabel, narrationText, audioUrl
  - characterId (opcjonalna postać)
  - rewardLabel, rewardIconUrl
  - isPublic, createdBy, createdAt, updatedAt

- `path_points` - relacja wiele-do-wielu między trasami a punktami
  - id, pathId, pointId, orderIndex
  - createdAt, updatedAt

##### Tabele postępu użytkownika
- `user_path_progress` - postęp użytkownika na trasie
  - id, userId, pathId, status (not_started/in_progress/completed)
  - startedAt, completedAt
  - visitedStopsCount, lastVisitedStopOrder
  - createdAt, updatedAt

- `user_point_visit` - odwiedzenia punktów przez użytkownika
  - id, userId, pointId, pathProgressId (opcjonalne)
  - firstEnteredAt, lastEnteredAt

- `user_items` - przedmioty zebrane przez użytkownika
  - id, userId, rewardLabel, rewardIconUrl, pointId
  - collectedAt

- `user_characters` - postacie odblokowane przez użytkownika
  - id, userId, characterId, unlockedAt

#### Migracje

Migracje są zarządzane przez **Drizzle Kit**:

```bash
# Generowanie migracji na podstawie zmian w schema.ts
bun run db:generate

# Aplikowanie migracji
bun run db:migrate

# Push schematu bezpośrednio do bazy (dev only)
bun run db:push
```

### Autentykacja

Backend używa **Better Auth** do zarządzania autentykacją:

- Logowanie email/hasło
- Rejestracja
- Sesje (cookies na web, tokeny na mobile)
- Logowanie anonimowe (guest mode)
- Middleware do weryfikacji sesji w endpointach

#### Middleware autentykacji

Elysia używa makra `auth` do weryfikacji sesji:

```typescript
app.use(betterAuth).get("/protected", ({ auth }) => {
  // auth.user i auth.session są dostępne
});
```

#### Middleware administracyjne

Endpointy `/admin/*` wymagają dodatkowej weryfikacji uprawnień administratora:

```typescript
app.use(adminMiddleware).post("/admin/paths", ...)
```

### Serwowanie plików statycznych

Backend serwuje pliki z dwóch lokalizacji:

1. **`public/resources/`** - pliki przesłane przez administratorów (upload)
2. **`resources/`** - pliki z seedowania (fallback)

Endpoint: `GET /resources/*`

Obsługiwane typy:
- Obrazy: PNG, JPG, JPEG, GIF, SVG
- Audio: MP3, WAV

Pliki są cache'owane z nagłówkiem `Cache-Control: public, max-age=31536000`.

### CORS

CORS jest skonfigurowany dla następujących originów:
- `http://localhost:3000` (landing)
- `http://localhost:3001` (admin)
- `http://localhost:8081` (Expo web)
- Originy z zmiennych środowiskowych: `SERVICE_URL_LANDING`, `SERVICE_URL_ADMIN`

### Rozwój

#### Uruchomienie w trybie deweloperskim

```bash
cd apps/core
bun install
bun run dev
```

Serwer uruchomi się na `http://localhost:8080` (lub port z `PORT` env).

#### Build produkcyjny

```bash
bun run build
```

Tworzy skompilowany plik binarny `core` w katalogu głównym.

#### Tworzenie konta administratora

```bash
bun run create-admin
```

#### Seedowanie bazy danych

```bash
bun run seed
```

#### Konfiguracja Better Auth

```bash
# Generowanie secret
bun run better-auth:secret

# Generowanie migracji Better Auth
bun run better-auth:generate

# Aplikowanie migracji Better Auth
bun run better-auth:migrate
```

### Zmienne środowiskowe

Wymagane zmienne środowiskowe:

- `DATABASE_URL` - connection string do PostgreSQL
- `BETTER_AUTH_SECRET` - secret do Better Auth
- `BETTER_AUTH_URL` - URL backendu (dla Better Auth)
- `PORT` - port serwera (domyślnie 8080)
- `HOST` - hostname serwera (domyślnie 0.0.0.0)

Opcjonalne:
- `SERVICE_URL_LANDING` - URL landing page (dla CORS)
- `SERVICE_URL_ADMIN` - URL panelu admin (dla CORS)

### Clustering

Aplikacja używa Node.js clustering dla lepszej wydajności. Liczba workerów jest równa liczbie dostępnych rdzeni CPU (`os.availableParallelism()`).

### Dokumentacja API

Dokumentacja OpenAPI/Swagger jest dostępna pod adresem `/swagger` po uruchomieniu serwera.

---

## Landing Page

### Stack użyty do aplikacji

- **Next.js 16** (App Router)
- **TypeScript**
- **SSG** (Static Site Generation)
- **Tailwind CSS** - stylowanie
- **shadcn/ui** - zestaw headless komponentów UI opartych na Radix UI (przyciski, formularze, karty, akordeony, input-group itd.)
- **react-rough-notation** - animowane highlighty/underlines w nagłówkach
- **Iconify** - ikony Solar

### Ogólna struktura aplikacji

#### Strony

- `/` - home page
- `/kontakt` - formularz kontaktowy

### Folderowa struktura projektu

```
apps/landing/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Główny layout
│   ├── page.tsx           # Strona główna
│   ├── kontakt/           # Strona kontaktowa
│   │   └── page.tsx
│   ├── not-found.tsx      # Strona 404
│   ├── globals.css        # Globalne style
│   └── manifest.json      # Web manifest
├── components/            # Komponenty React
│   ├── hero.tsx          # Sekcja hero
│   ├── features.tsx      # Sekcja funkcje
│   ├── how-it-works.tsx  # Sekcja jak to działa
│   ├── faq.tsx           # Sekcja FAQ
│   ├── cta.tsx           # Call to action
│   ├── navbar.tsx        # Nawigacja
│   ├── footer.tsx        # Stopka
│   └── ui/               # Komponenty UI (shadcn/ui)
│       └── [komponenty]
├── lib/                  # Narzędzia
│   ├── utils.ts          # Funkcje pomocnicze
│   └── hooks.ts          # Custom hooks
├── public/               # Zasoby statyczne
│   ├── logo.png          # Logo aplikacji
│   ├── logo-bdg.png      # Logo Bydgoszczy
│   ├── background.png    # Tło
│   ├── mockup.png        # Mockup aplikacji
│   ├── mockup2.png       # Mockup aplikacji 2
│   ├── bydgoszcz.jpg     # Zdjęcia Bydgoszczy
│   ├── bydgoszcz2.jpg
│   └── partners/         # Logo partnerów
├── components.json       # Konfiguracja shadcn/ui
├── package.json
└── tsconfig.json
```

### Funkcjonalności

#### Strona główna

- **Sekcja Hero** - główny baner z CTA
- **Sekcja Funkcje** - prezentacja funkcji aplikacji w formie Bento grid
- **Sekcja Jak to działa** - instrukcja korzystania z aplikacji
- **Sekcja FAQ** - często zadawane pytania
- **Call to Action** - zachęta do pobrania aplikacji
- **Footer** - informacje kontaktowe i linki

#### Formularz kontaktowy

- Formularz kontaktowy z walidacją
- Integracja z backendem (opcjonalnie)

### Zasoby graficzne

- **Logo** - wygenerowane przy pomocy AI
- **Favicon** - wygenerowane przy pomocy AI
- **Ilustracje SVG** - wygenerowane przy użyciu AI do sekcji funkcje
- **Zdjęcia Bydgoszczy** - z licencją free to use
- **Mockupy aplikacji** - wizualizacje interfejsu

### Rozwój

#### Uruchomienie w trybie deweloperskim

```bash
cd apps/landing
npm install
npm run dev
```

Aplikacja będzie dostępna pod adresem: `http://localhost:3000`

#### Build produkcyjny

```bash
npm run build
npm start
```

#### Eksport statyczny (SSG)

```bash
npm run build
```

Next.js automatycznie wygeneruje statyczne pliki HTML, CSS i JavaScript w katalogu `.next`.

### Konfiguracja

#### Zmienne środowiskowe

Utwórz plik `.env.local` w katalogu głównym projektu (jeśli potrzebne):

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Stylowanie

Aplikacja używa **Tailwind CSS** do stylowania. Komponenty UI pochodzą z **shadcn/ui**, które są oparte na **Radix UI**.

#### Motywy

Aplikacja obsługuje motyw jasny/ciemny (automatycznie wykrywany na podstawie preferencji systemowych).

### Animacje

- **react-rough-notation** - animowane podkreślenia i highlighty w nagłówkach
- **Tailwind CSS transitions** - płynne przejścia między sekcjami

### SEO

- Meta tagi w `layout.tsx`
- Web manifest dla PWA
- Strukturalne dane (opcjonalnie)

### Deploy

Aplikacja może być wdrożona na:
- **Vercel** (zalecane dla Next.js)
- **Netlify**
- **Inne platformy** obsługujące Next.js SSG

---

## Panel administratora

### Stack użyty do aplikacji

- **React 18** - Biblioteka UI
- **TypeScript** - Typowanie statyczne
- **Vite** - Build tool i dev server
- **React Router** - Routing
- **React Hook Form** - Zarządzanie formularzami
- **Yup** - Walidacja formularzy
- **Tailwind CSS** - Stylowanie
- **shadcn/ui** - Komponenty UI
- **Lucide React** - Ikony

### Ogólna struktura aplikacji

- `/` - strona główna. Ogólne statystyki do wglądu przez użytkownika aplikacji
- `/routes` - strona z listą wszystkich tras (tych opublikowanych i w edycji)
- `/route-creator` - kreator tras
- `/route-creator?edit=i` - edytor dla konkretnej trasy (gdzie i = pathId)
- `/characters` - strona z listą wszystkich postaci, które są dodane do bazy danych
- `/character-creator` - kreator postaci
- `/character-creator?edit=i` - edytor dla konkretnej postaci (gdzie i = id)
- `/documentation` - dokumentacja aplikacji dla użytkownika
- `/login` - strona z formularzem do zalogowania

### Folderowa struktura projektu

```
apps/admin/
├── src/
│   ├── components/          # Komponenty React
│   │   ├── shared/          # Współdzielone komponenty
│   │   └── ui/              # Komponenty UI (shadcn/ui)
│   ├── lib/                 # Narzędzia i utilities
│   │   ├── api-client.ts    # Klient API
│   │   └── utils.ts         # Funkcje pomocnicze
│   ├── pages/               # Strony aplikacji
│   │   ├── Dashboard/       # Dashboard
│   │   ├── RouteCreator/    # Kreator tras
│   │   ├── RoutesList/      # Lista tras
│   │   ├── CharacterCreator/ # Kreator postaci
│   │   ├── CharactersList/  # Lista postaci
│   │   └── Documentation.tsx # Dokumentacja
│   ├── services/            # Serwisy API
│   ├── types/               # Definicje typów TypeScript
│   └── App.tsx              # Główny komponent aplikacji
├── public/                  # Pliki statyczne
└── package.json
```

### Główne funkcjonalności

#### 1. Dashboard
- Przegląd statystyk i metryk
- Interaktywne wykresy
- Karty informacyjne dla każdej trasy
- Statystyki uczestników i ukończeń

#### 2. Zarządzanie trasami

##### Kreator tras (`/route-creator`)
- **Krok 1: Ustawienia ogólne**
  - Tytuł, opis (krótki i długi)
  - Kategoria, poziom trudności
  - Miniatura, ikona markera
  - Preset stylu
  - Walidacja formularza w czasie rzeczywistym

- **Krok 2: Punkty trasy**
  - Dodawanie punktów przez kliknięcie na mapie
  - Edycja szczegółów punktu (nazwa, opis, dialog, postać, audio)
  - Zmiana kolejności punktów
  - Usuwanie punktów
  - Wizualizacja na interaktywnej mapie

##### Lista tras (`/routes`)
- Widok kafelków (grid) i widok listy
- Paginacja (6 tras na stronę)
- Publikacja/cofanie publikacji tras
- Edycja tras
- Informacje o trasie (punkty, dystans, czas, trudność)

#### 3. Zarządzanie postaciami

##### Kreator postaci (`/character-creator`)
- **Krok 1: Ustawienia ogólne**
  - Nazwa postaci
  - Avatar (opcjonalnie przy edycji)
  - Opis (opcjonalnie)

- **Krok 2: Pozycja domyślna** (opcjonalnie)
  - Wybór pozycji na mapie
  - Opis pozycji

##### Lista postaci (`/characters`)
- Widok kafelków (grid) i widok listy
- Paginacja (6 postaci na stronę)
- Edycja postaci
- Informacje o postaci (pozycja domyślna, data edycji)

#### 4. Dokumentacja (`/documentation`)
- Kompletny przewodnik po panelu administracyjnym
- Instrukcje dla wszystkich funkcji
- Wskazówki i najlepsze praktyki

### API Client

Główny klient API znajduje się w `src/lib/api-client.ts`:

#### Funkcje API

##### Paths/Routes

```typescript
// Utworzenie nowej trasy
createPath(data: {
  pathId: string;
  title: string;
  shortDescription: string;
  longDescription?: string;
  category: string;
  difficulty: string;
  totalTimeMinutes: number;
  distanceMeters: number;
  thumbnailFile: File;
  markerIconFile?: File;
  stylePreset?: string;
  points?: Array<PointData>;
}): Promise<ApiResponse<any>>

// Pobranie wszystkich tras
getPaths(): Promise<ApiResponse<any[]>>

// Pobranie konkretnej trasy
getPath(id: number | string): Promise<ApiResponse<any>>
```

##### Characters

```typescript
// Pobranie wszystkich postaci
getCharacters(): Promise<ApiResponse<any[]>>
```

#### Endpointy API

Wszystkie endpointy wymagają autoryzacji (sesja w cookies):

- `GET /admin/paths` - Lista wszystkich tras
- `GET /admin/paths/:id` - Szczegóły trasy
- `POST /admin/paths` - Utworzenie nowej trasy
- `PATCH /admin/paths/:id` - Aktualizacja trasy
- `DELETE /admin/paths/:id` - Usunięcie trasy
- `PATCH /admin/paths/:id/toggle` - Przełączenie statusu publikacji
- `GET /admin/characters` - Lista wszystkich postaci
- `GET /admin/characters/:id` - Szczegóły postaci
- `POST /admin/characters` - Utworzenie nowej postaci
- `PATCH /admin/characters/:id` - Aktualizacja postaci

### Komponenty UI

Aplikacja używa komponentów z `shadcn/ui`:
- Button, Input, Textarea, Label
- Card, CardHeader, CardTitle, CardContent
- Form (React Hook Form integration)
- Dialog, Dropdown Menu
- Icons (Lucide React)

### Walidacja formularzy

Walidacja jest realizowana przez:
- **Yup** - schematy walidacji
- **React Hook Form** - integracja z formularzami
- Walidacja w czasie rzeczywistym
- Komunikaty błędów pod polami

#### Przykładowe schematy walidacji:

```typescript
// Trasa
- title: min 3, max 100 znaków
- shortDescription: min 10, max 200 znaków
- longDescription: min 20, max 2000 znaków
- thumbnailFile: wymagany, max 5MB, tylko obrazy

// Postać
- name: min 2, max 50 znaków
- avatarFile: opcjonalny przy edycji, max 5MB, tylko obrazy
```

### Mapa

Aplikacja używa komponentu `MapComponent` do:
- Wyświetlania punktów trasy
- Dodawania punktów przez kliknięcie
- Przesuwania markerów
- Obliczania dystansu trasy
- Wizualizacji trasy

### Autoryzacja

Autoryzacja jest realizowana przez:
- **Better Auth** - zarządzanie sesjami
- Sesje przechowywane w cookies
- Wszystkie requesty API wymagają `credentials: 'include'`

### Rozwój

#### Instalacja

```bash
cd apps/admin
npm install
# lub
bun install
```

#### Uruchomienie

```bash
# Development mode
npm run dev
# lub
bun run dev

# Build production
npm run build
# lub
bun run build

# Preview production build
npm run preview
# lub
bun run preview
```

Aplikacja będzie dostępna pod adresem: `http://localhost:5173` (lub inny port, jeśli 5173 jest zajęty)

### Konfiguracja

#### Zmienne środowiskowe

Utwórz plik `.env` w katalogu głównym projektu:

```env
VITE_BETTER_AUTH_URL=http://localhost:8080
```

- `VITE_BETTER_AUTH_URL` - URL backendu API (domyślnie: `http://localhost:8080`)

### Rozwiązywanie problemów

#### Problem: API zwraca błędy autoryzacji
- Sprawdź, czy backend jest uruchomiony
- Sprawdź, czy zmienna `VITE_BETTER_AUTH_URL` jest poprawnie ustawiona
- Sprawdź, czy jesteś zalogowany w aplikacji

#### Problem: Mapa nie wyświetla się
- Sprawdź, czy klucz API mapy jest poprawnie skonfigurowany
- Sprawdź konsolę przeglądarki pod kątem błędów

#### Problem: Formularze nie walidują poprawnie
- Sprawdź, czy wszystkie wymagane pola są wypełnione
- Sprawdź komunikaty błędów pod polami
- Sprawdź konsolę przeglądarki pod kątem błędów walidacji

---

## Uruchomienie projektu

### Wymagania

- Node.js 18+ lub Bun
- PostgreSQL
- Docker (opcjonalnie, dla łatwego uruchomienia całego stacku)

### Uruchomienie z Docker Compose

```bash
docker-compose up
```

### Uruchomienie lokalne

1. **Backend (core)**
   ```bash
   cd apps/core
   bun install
   bun run dev
   ```

2. **Aplikacja mobilna**
   ```bash
   cd apps/mobile
   npm install
   npx expo start
   ```

3. **Panel administratora**
   ```bash
   cd apps/admin
   npm install
   npm run dev
   ```

4. **Landing page**
   ```bash
   cd apps/landing
   npm install
   npm run dev
   ```

## Konfiguracja

Każda aplikacja wymaga odpowiedniej konfiguracji zmiennych środowiskowych. Szczegóły znajdują się w sekcjach dotyczących poszczególnych aplikacji powyżej.

## Licencja

Projekt jest częścią większego systemu zarządzania trasami turystycznymi.
