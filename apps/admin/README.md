# Admin Panel - Panel Administracyjny

Panel administracyjny do zarządzania trasami turystycznymi, postaciami i treściami aplikacji mobilnej.

## 🚀 Technologie

- **React 18** - Biblioteka UI
- **TypeScript** - Typowanie statyczne
- **Vite** - Build tool i dev server
- **React Router** - Routing
- **React Hook Form** - Zarządzanie formularzami
- **Yup** - Walidacja formularzy
- **Tailwind CSS** - Stylowanie
- **shadcn/ui** - Komponenty UI
- **Lucide React** - Ikony

## 📦 Instalacja

```bash
# Zainstaluj zależności
npm install
# lub
bun install
```

## 🏃 Uruchomienie

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

## 🔧 Konfiguracja

### Zmienne środowiskowe

Utwórz plik `.env` w katalogu głównym projektu:

```env
VITE_BETTER_AUTH_URL=http://localhost:8080
```

- `VITE_BETTER_AUTH_URL` - URL backendu API (domyślnie: `http://localhost:8080`)

## 📁 Struktura projektu

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

## 🎯 Główne funkcjonalności

### 1. Dashboard
- Przegląd statystyk i metryk
- Interaktywne wykresy
- Karty informacyjne dla każdej trasy
- Statystyki uczestników i ukończeń

### 2. Zarządzanie trasami

#### Kreator tras (`/route-creator`)
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

#### Lista tras (`/routes`)
- Widok kafelków (grid) i widok listy
- Paginacja (6 tras na stronę)
- Publikacja/cofanie publikacji tras
- Edycja tras
- Informacje o trasie (punkty, dystans, czas, trudność)

### 3. Zarządzanie postaciami

#### Kreator postaci (`/character-creator`)
- **Krok 1: Ustawienia ogólne**
  - Nazwa postaci
  - Avatar (opcjonalnie przy edycji)
  - Opis (opcjonalnie)

- **Krok 2: Pozycja domyślna** (opcjonalnie)
  - Wybór pozycji na mapie
  - Opis pozycji

#### Lista postaci (`/characters`)
- Widok kafelków (grid) i widok listy
- Paginacja (6 postaci na stronę)
- Edycja postaci
- Informacje o postaci (pozycja domyślna, data edycji)

### 4. Dokumentacja (`/documentation`)
- Kompletny przewodnik po panelu administracyjnym
- Instrukcje dla wszystkich funkcji
- Wskazówki i najlepsze praktyki

## 🔌 API Client

Główny klient API znajduje się w `src/lib/api-client.ts`:

### Funkcje API

#### Paths/Routes

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

#### Characters

```typescript
// Pobranie wszystkich postaci
getCharacters(): Promise<ApiResponse<any[]>>
```

### Endpointy API

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

## 🎨 Komponenty UI

Aplikacja używa komponentów z `shadcn/ui`:
- Button, Input, Textarea, Label
- Card, CardHeader, CardTitle, CardContent
- Form (React Hook Form integration)
- Dialog, Dropdown Menu
- Icons (Lucide React)

## 📝 Walidacja formularzy

Walidacja jest realizowana przez:
- **Yup** - schematy walidacji
- **React Hook Form** - integracja z formularzami
- Walidacja w czasie rzeczywistym
- Komunikaty błędów pod polami

### Przykładowe schematy walidacji:

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

## 🗺️ Mapa

Aplikacja używa komponentu `MapComponent` do:
- Wyświetlania punktów trasy
- Dodawania punktów przez kliknięcie
- Przesuwania markerów
- Obliczania dystansu trasy
- Wizualizacji trasy

## 🔐 Autoryzacja

Autoryzacja jest realizowana przez:
- **Better Auth** - zarządzanie sesjami
- Sesje przechowywane w cookies
- Wszystkie requesty API wymagają `credentials: 'include'`

## 📚 Dodatkowe zasoby

- [Dokumentacja React](https://react.dev)
- [Dokumentacja Vite](https://vitejs.dev)
- [Dokumentacja React Router](https://reactrouter.com)
- [Dokumentacja React Hook Form](https://react-hook-form.com)
- [Dokumentacja shadcn/ui](https://ui.shadcn.com)

## 🐛 Rozwiązywanie problemów

### Problem: API zwraca błędy autoryzacji
- Sprawdź, czy backend jest uruchomiony
- Sprawdź, czy zmienna `VITE_BETTER_AUTH_URL` jest poprawnie ustawiona
- Sprawdź, czy jesteś zalogowany w aplikacji

### Problem: Mapa nie wyświetla się
- Sprawdź, czy klucz API mapy jest poprawnie skonfigurowany
- Sprawdź konsolę przeglądarki pod kątem błędów

### Problem: Formularze nie walidują poprawnie
- Sprawdź, czy wszystkie wymagane pola są wypełnione
- Sprawdź komunikaty błędów pod polami
- Sprawdź konsolę przeglądarki pod kątem błędów walidacji

## 📄 Licencja

Projekt jest częścią większego systemu zarządzania trasami turystycznymi.
