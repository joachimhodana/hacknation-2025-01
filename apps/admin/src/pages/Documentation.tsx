import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@iconify/react"
import {
  MapPin,
  Plus,
  Edit2,
  GripVertical,
  Trash2,
  Save,
  Settings,
  List,
  Grid3x3,
  Eye,
  EyeOff,
  FileText,
  CheckCircle2,
  User,
} from "lucide-react"

export function Documentation() {
  return (
    <div className="container mx-auto p-6 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dokumentacja</h1>
        <p className="text-muted-foreground">Kompletny przewodnik po panelu administracyjnym</p>
      </div>

      {/* Niebieska wstawka */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 rounded-full p-2">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">
              Kompletny przewodnik
            </h3>
            <p className="text-sm text-muted-foreground">
              Poniżej znajdziesz szczegółowe instrukcje dotyczące wszystkich funkcji panelu administracyjnego,
              w tym kreatora tras, zarządzania trasami i dashboardu.
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Dashboard
          </CardTitle>
          <CardDescription>Przegląd statystyk i metryk</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Na stronie głównej znajdziesz ogólne statystyki dotyczące wszystkich tras,
            w tym liczbę tras, status publikacji, łączną długość tras oraz średni czas trwania.
          </p>
          
          {/* Statystyki ogólne */}
          <div>
            <h4 className="font-semibold mb-3">Statystyki ogólne</h4>
            <div className="grid md:grid-cols-2 gap-3 text-sm text-muted-foreground">
              <div className="bg-primary/5 rounded p-3 border border-primary/20">
                <p className="font-semibold text-foreground mb-1">Wszystkie trasy</p>
                <p>Wyświetla całkowitą liczbę wszystkich utworzonych tras w systemie</p>
              </div>
              <div className="bg-primary/5 rounded p-3 border border-primary/20">
                <p className="font-semibold text-foreground mb-1">Opublikowane</p>
                <p>Liczba tras dostępnych publicznie dla użytkowników aplikacji mobilnej</p>
              </div>
              <div className="bg-primary/5 rounded p-3 border border-primary/20">
                <p className="font-semibold text-foreground mb-1">Łączna długość</p>
                <p>Suma długości wszystkich tras wyrażona w kilometrach (automatyczna konwersja z metrów)</p>
              </div>
              <div className="bg-primary/5 rounded p-3 border border-primary/20">
                <p className="font-semibold text-foreground mb-1">Średni czas</p>
                <p>Średni czas trwania trasy obliczany na podstawie wszystkich tras (w minutach)</p>
              </div>
            </div>
          </div>

          {/* Projekty tras */}
          <div>
            <h4 className="font-semibold mb-3">Projekty tras</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Sekcja wyświetla karty z informacjami o trasach. Dla pierwszych 9 tras system automatycznie
              ładuje pełne dane, w tym punkty trasy, aby wyświetlić dokładne informacje.
            </p>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside ml-4">
              <li>
                <strong>Automatyczne ładowanie danych</strong> - system pobiera szczegóły tras z API
              </li>
              <li>
                <strong>Karty tras</strong> - każda karta pokazuje podstawowe informacje o trasie
              </li>
              <li>
                <strong>Status ładowania</strong> - podczas pobierania danych wyświetlane są animowane placeholdery
              </li>
              <li>
                <strong>Obsługa błędów</strong> - w przypadku błędu wyświetlany jest komunikat z informacją o problemie
              </li>
              <li>
                <strong>Pusta lista</strong> - jeśli nie ma tras, wyświetlany jest komunikat zachęcający do utworzenia pierwszej trasy
              </li>
            </ul>
          </div>

          {/* Funkcjonalności */}
          <div>
            <h4 className="font-semibold mb-2">Dostępne funkcje:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Przegląd wszystkich tras w systemie</li>
              <li>Statystyki w czasie rzeczywistym (aktualizowane przy każdym załadowaniu strony)</li>
              <li>Szczegółowe karty dla każdej trasy z podstawowymi informacjami</li>
              <li>Automatyczne formatowanie danych (dystans, czas, daty)</li>
              <li>Obsługa stanów ładowania i błędów</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Lista tras */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5 text-primary" />
            Lista tras
          </CardTitle>
          <CardDescription>Zarządzanie wszystkimi trasami</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Strona z listą wszystkich tras pozwala na przeglądanie, edycję i zarządzanie trasami.
            Wszystkie dane są pobierane z API w czasie rzeczywistym.
          </p>
          
          <div>
            <h4 className="font-semibold mb-3">Funkcjonalności:</h4>
            <ul className="text-sm text-muted-foreground space-y-3 list-disc list-inside">
              <li>
                <strong>Przełączanie widoku</strong> - możesz wybrać widok kafelków (grid) lub widok listy
                za pomocą przycisków w prawym górnym rogu. Widok jest zapisywany w stanie komponentu.
              </li>
              <li>
                <strong>Paginacja</strong> - trasy są podzielone na strony (6 tras na stronę). 
                Możesz nawigować między stronami za pomocą przycisków "Poprzednia" i "Następna".
              </li>
              <li>
                <strong>Informacje o trasie</strong> - każda karta pokazuje:
                <ul className="ml-4 mt-2 space-y-2">
                  <li>
                    <strong>Liczbę punktów</strong> - z poprawną odmianą (1 punkt, 2-4 punkty, 5+ punktów)
                  </li>
                  <li>
                    <strong>Dystans</strong> - automatycznie formatowany:
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>Dystans ≥ 1000m wyświetlany jako "X.X km"</li>
                      <li>Dystans &lt; 1000m wyświetlany jako "X m"</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Czas trwania</strong> - formatowany jako:
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>"Xh Ymin" dla tras dłuższych niż 60 minut</li>
                      <li>"Xmin" dla tras krótszych niż 60 minut</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Poziom trudności</strong> - wyświetlany z odpowiednim kolorem i etykietą
                  </li>
                  <li>
                    <strong>Datę ostatniej edycji</strong> - formatowana w formacie polskim (np. "15 stycznia 2024, 14:30")
                  </li>
                  <li>
                    <strong>Miniaturę trasy</strong> - jeśli dostępna, wyświetlana jako obrazek
                  </li>
                </ul>
              </li>
              <li>
                <strong>Publikacja</strong> - przycisk "Opublikuj" / "Zdejmij" pozwala na natychmiastową zmianę statusu trasy.
                Status jest aktualizowany przez API endpoint `/admin/paths/:id/toggle` i od razu odzwierciedlany w interfejsie.
              </li>
              <li>
                <strong>Edycja</strong> - przycisk "Edytuj" otwiera kreator z wypełnionymi danymi trasy.
                Przekierowuje do `/route-creator?edit=pathId` gdzie `pathId` to identyfikator trasy.
              </li>
              <li>
                <strong>Dodawanie nowej trasy</strong> - przycisk "Dodaj trasę" w nagłówku przekierowuje do kreatora tras.
              </li>
            </ul>
          </div>

          <div className="bg-primary/5 rounded p-3 border border-primary/20">
            <p className="font-semibold text-foreground mb-2">
              💡 Formatowanie danych:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Dystans jest automatycznie konwertowany z metrów na kilometry dla wartości ≥ 1000m</li>
              <li>Czas jest formatowany z podziałem na godziny i minuty</li>
              <li>Daty są wyświetlane w formacie polskim z godziną</li>
              <li>Liczba punktów ma poprawną odmianę w języku polskim</li>
            </ul>
          </div>

          <div className="bg-secondary/20 rounded p-3 border border-secondary/40">
            <p className="font-semibold text-foreground mb-2">
              ⚠️ Uwaga:
            </p>
            <p className="text-sm text-muted-foreground">
              Zmiana statusu publikacji jest natychmiastowa i nieodwracalna bez ponownego kliknięcia przycisku.
              Opublikowane trasy są widoczne dla użytkowników aplikacji mobilnej.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Lista postaci */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Lista postaci
          </CardTitle>
          <CardDescription>Zarządzanie wszystkimi postaciami</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Strona z listą wszystkich postaci pozwala na przeglądanie i edycję postaci używanych w trasach.
          </p>
          <div>
            <h4 className="font-semibold mb-2">Funkcjonalności:</h4>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
              <li>
                <strong>Przełączanie widoku</strong> - możesz wybrać widok kafelków (grid) lub widok listy
                za pomocą przycisków w prawym górnym rogu
              </li>
              <li>
                <strong>Paginacja</strong> - postaci są podzielone na strony (6 postaci na stronę)
              </li>
              <li>
                <strong>Informacje o postaci</strong> - każda karta pokazuje:
                <ul className="ml-4 mt-1 space-y-1">
                  <li>Nazwę postaci</li>
                  <li>Pozycję domyślną (jeśli ustawiona) z współrzędnymi i opisem</li>
                  <li>Datę ostatniej edycji</li>
                </ul>
              </li>
              <li>
                <strong>Edycja</strong> - przycisk "Edytuj" otwiera kreator z wypełnionymi danymi postaci
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Kreator tras */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Kreator tras - Kompletny przewodnik
          </CardTitle>
          <CardDescription>Szczegółowa instrukcja tworzenia i edycji tras</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sekcja 1: Wprowadzenie */}
          <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              1. Wprowadzenie
            </h3>
            <p className="text-sm text-muted-foreground">
              Kreator tras to narzędzie pozwalające na tworzenie interaktywnych tras turystycznych
              z punktami na mapie. Proces tworzenia trasy odbywa się w dwóch krokach:
            </p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
              <li><strong>Krok 1:</strong> Ustawienia ogólne - podstawowe informacje o trasie</li>
              <li><strong>Krok 2:</strong> Punkty trasy - dodawanie i konfiguracja punktów na mapie</li>
            </ul>
          </div>

          {/* Sekcja 2: Krok 1 - Ustawienia ogólne */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary" />
              2. Krok 1: Ustawienia ogólne
            </h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                W pierwszym kroku musisz wypełnić wszystkie wymagane pola formularza. Formularz ma walidację,
                więc nie możesz przejść do kroku 2, dopóki wszystkie pola nie będą poprawnie wypełnione.
              </p>
              <div>
                <h4 className="font-semibold mb-2">Wymagane pola:</h4>
                <ul className="space-y-2 list-disc list-inside ml-4">
                  <li>
                    <strong>Tytuł</strong> - min. 3 znaki, max. 100 znaków
                  </li>
                  <li>
                    <strong>Krótki opis</strong> - min. 10 znaków, max. 200 znaków
                  </li>
                  <li>
                    <strong>Długi opis</strong> - min. 20 znaków, max. 2000 znaków
                  </li>
                  <li>
                    <strong>Kategoria</strong> - wybierz z listy (Wędrówki, Rowerowe, Biegowe, Spacerowe, Inne)
                  </li>
                  <li>
                    <strong>Poziom trudności</strong> - wybierz z listy (Łatwy, Średni, Trudny, Ekspert)
                  </li>
                  <li>
                    <strong>Miniatura</strong> - przeciągnij i upuść plik obrazu lub kliknij, aby wybrać (max. 5MB)
                  </li>
                  <li>
                    <strong>Preset stylu</strong> - wybierz z listy (Nowoczesny, Klasyczny, Minimalistyczny, Kolorowy)
                  </li>
                  <li>
                    <strong>Ikona twórcy</strong> - przeciągnij i upuść plik obrazu lub kliknij, aby wybrać (max. 5MB)
                  </li>
                </ul>
              </div>
              <div className="bg-primary/5 rounded p-3 border border-primary/20">
                <p className="font-semibold text-foreground mb-1">
                  💡 Wskazówka:
                </p>
                <p className="text-sm text-muted-foreground">
                  Wszystkie pola są walidowane w czasie rzeczywistym. Błędy są wyświetlane pod każdym polem.
                  Przycisk "Przejdź do kroku 2" jest zablokowany, dopóki wszystkie pola nie będą poprawne.
                </p>
              </div>
            </div>
          </div>

          {/* Sekcja 3: Krok 2 - Punkty trasy */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              3. Krok 2: Punkty trasy
            </h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                W drugim kroku możesz dodawać i konfigurować punkty trasy. <strong>Uwaga:</strong> W kroku 1
                nie możesz dodawać punktów - musisz najpierw wypełnić formularz ustawień ogólnych.
              </p>
              <div>
                <h4 className="font-semibold mb-2">Dodawanie punktów:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    <strong>Kliknięcie na mapie</strong> - najszybszy sposób, punkt pojawi się dokładnie
                    w miejscu kliknięcia. Współrzędne są automatycznie zapisywane.
                  </li>
                  <li>
                    <strong>Przycisk "Dodaj punkt"</strong> - dodaje punkt w centrum mapy (domyślnie Bydgoszcz).
                    Możesz później przesunąć marker na mapie.
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Funkcje mapy:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    <strong>Przesuwanie markerów</strong> - możesz przesuwać markery punktów bezpośrednio na mapie
                    (drag & drop). Współrzędne są automatycznie aktualizowane.
                  </li>
                  <li>
                    <strong>Obliczanie dystansu</strong> - system automatycznie oblicza całkowity dystans trasy
                    na podstawie kolejności punktów. Dystans jest wyświetlany w kilometrach w panelu statystyk.
                  </li>
                  <li>
                    <strong>Szacowany czas</strong> - system oblicza szacowany czas trwania trasy na podstawie
                    dystansu (przy założeniu prędkości 3 km/h). Czas jest wyświetlany w formacie "Xh Ymin".
                  </li>
                  <li>
                    <strong>Wizualizacja trasy</strong> - punkty są połączone linią pokazującą kolejność trasy.
                    Linia jest aktualizowana automatycznie przy zmianie kolejności punktów.
                  </li>
                  <li>
                    <strong>Zaznaczony punkt</strong> - aktualnie edytowany punkt jest wyróżniony na mapie
                    (inny kolor/rozmiar markera).
                  </li>
                </ul>
              </div>
              <p className="mt-2">
                Punkty są automatycznie numerowane w kolejności dodania, ale możesz zmienić ich kolejność
                (patrz sekcja 6). Kolejność punktów określa również kolejność, w jakiej użytkownicy będą je odwiedzać.
              </p>
              <div className="bg-primary/5 rounded p-3 border border-primary/20">
                <p className="font-semibold text-foreground mb-1">
                  💡 Wskazówka:
                </p>
                <p className="text-sm text-muted-foreground">
                  Statystyki trasy (dystans i czas) są aktualizowane w czasie rzeczywistym podczas dodawania,
                  usuwania lub przesuwania punktów. Panel statystyk jest widoczny w prawym dolnym rogu mapy,
                  gdy trasa ma co najmniej 2 punkty.
                </p>
              </div>
            </div>
          </div>

          {/* Sekcja 4: Edycja punktów */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Edit2 className="h-4 w-4 text-primary" />
              4. Edycja szczegółów punktu
            </h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Aby edytować punkt, kliknij na niego w liście punktów. Panel edycji
                otworzy się automatycznie i pozwoli na zmianę:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Nazwa punktu</strong> - krótka nazwa identyfikująca punkt (wymagane)
                </li>
                <li>
                  <strong>Opis</strong> - szczegółowy opis punktu, który będzie widoczny dla użytkowników (wymagane)
                </li>
                <li>
                  <strong>Współrzędne geograficzne</strong> - szerokość i długość geograficzna (można edytować
                  ręcznie)
                </li>
                <li>
                  <strong>Własne audio</strong> - checkbox, jeśli chcesz dodać własne audio dla tego punktu
                  (format: MP3, WAV, OGG)
                </li>
                <li>
                  <strong>Postać</strong> - wybierz postać z listy (Historyk, Przewodnik, Mieszkaniec, itp.) (wymagane)
                </li>
                <li>
                  <strong>Dialog</strong> - tekst dialogu dla tego punktu (wymagane)
                </li>
              </ul>
              <div className="bg-primary/5 rounded p-3 border border-primary/20">
                <p className="font-semibold text-foreground mb-1">
                  💡 Wskazówka:
                </p>
                <p className="text-sm text-muted-foreground">
                  Po wprowadzeniu zmian kliknij "Zapisz zmiany", aby zatwierdzić edycję punktu.
                  Jeśli nie zapiszesz zmian, zostaną one utracone przy przejściu do innego punktu.
                </p>
              </div>
            </div>
          </div>

          {/* Sekcja 5: Edycja istniejącej trasy */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Edit2 className="h-4 w-4 text-primary" />
              5. Edycja istniejącej trasy
            </h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Aby edytować istniejącą trasę, przejdź do listy tras i kliknij przycisk "Edytuj" na karcie trasy.
                System automatycznie załaduje wszystkie dane trasy z API.
              </p>
              <div>
                <h4 className="font-semibold mb-2">Proces ładowania danych:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    <strong>Ładowanie podstawowych danych</strong> - system pobiera informacje o trasie (tytuł, opis, kategoria, itp.)
                  </li>
                  <li>
                    <strong>Ładowanie punktów</strong> - wszystkie punkty trasy są pobierane i konwertowane do formatu edytowalnego
                  </li>
                  <li>
                    <strong>Ładowanie plików</strong> - miniatura i ikona markera są wyświetlane (jeśli dostępne)
                  </li>
                  <li>
                    <strong>Wypełnienie formularza</strong> - wszystkie pola formularza są automatycznie wypełnione
                  </li>
                  <li>
                    <strong>Wyświetlenie na mapie</strong> - wszystkie punkty są wyświetlone na mapie z zachowaniem kolejności
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Funkcje edycji:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    <strong>Edycja ustawień ogólnych</strong> - możesz zmienić wszystkie pola z kroku 1
                  </li>
                  <li>
                    <strong>Zmiana plików</strong> - możesz zmienić miniatury i ikony (tylko nowe pliki są wysyłane do API)
                  </li>
                  <li>
                    <strong>Edycja punktów</strong> - możesz edytować istniejące punkty, dodawać nowe lub usuwać stare
                  </li>
                  <li>
                    <strong>Zmiana kolejności</strong> - możesz zmienić kolejność punktów
                  </li>
                  <li>
                    <strong>Zachowanie ID</strong> - istniejące punkty zachowują swoje ID, co pozwala na ich aktualizację zamiast tworzenia nowych
                  </li>
                </ul>
              </div>
              <div className="bg-primary/5 rounded p-3 border border-primary/20">
                <p className="font-semibold text-foreground mb-1">
                  ✅ Wskazówka:
                </p>
                <p className="text-sm text-muted-foreground">
                  Wszystkie dane są automatycznie wypełnione, więc możesz od razu przejść do edycji punktów
                  lub zmienić ustawienia ogólne. W trybie edycji avatar postaci jest opcjonalny - jeśli nie wybierzesz
                  nowego pliku, stary zostanie zachowany.
                </p>
              </div>
              <div className="bg-secondary/20 rounded p-3 border border-secondary/40">
                <p className="font-semibold text-foreground mb-1">
                  ⚠️ Uwaga techniczna:
                </p>
                <p className="text-sm text-muted-foreground">
                  W trybie edycji system najpierw aktualizuje podstawowe dane trasy, a następnie zarządza punktami
                  osobno. Nowe punkty są tworzone, istniejące są aktualizowane, a usunięte są usuwane z bazy danych.
                </p>
              </div>
            </div>
          </div>

          {/* Sekcja 6: Zmiana kolejności */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-primary" />
              6. Zmiana kolejności punktów
            </h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Kolejność punktów określa, w jakiej kolejności użytkownicy będą je odwiedzać. Aby zmienić
                kolejność:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>
                  <strong>Przycisk ↑ (strzałka w górę)</strong> - przesuwa punkt o jedną pozycję w górę
                  (wcześniej w kolejności)
                </li>
                <li>
                  <strong>Przycisk ↓ (strzałka w dół)</strong> - przesuwa punkt o jedną pozycję w dół
                  (później w kolejności)
                </li>
              </ul>
              <p className="mt-2">
                Pierwszy punkt nie może być przesunięty w górę, a ostatni w dół (przyciski będą
                nieaktywne).
              </p>
            </div>
          </div>

          {/* Sekcja 7: Usuwanie punktów */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-destructive" />
              7. Usuwanie punktów
            </h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Aby usunąć punkt z trasy, kliknij ikonę kosza (🗑️) obok punktu w liście. Punkt zostanie
                natychmiast usunięty z trasy i z mapy.
              </p>
              <div className="bg-secondary/20 rounded p-3 border border-secondary/40">
                <p className="font-semibold text-foreground mb-1">
                  ⚠️ Uwaga:
                </p>
                <p className="text-sm text-muted-foreground">
                  Usunięcie punktu jest nieodwracalne. Jeśli edytujesz punkt, który chcesz usunąć,
                  najpierw zamknij panel edycji (klikając poza niego lub zapisując zmiany).
                </p>
              </div>
            </div>
          </div>

          {/* Sekcja 8: Zapisywanie trasy */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Save className="h-4 w-4 text-primary" />
              8. Zapisywanie trasy
            </h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Po zakończeniu tworzenia trasy, kliknij przycisk "Zapisz trasę" na dole panelu.
                Aby zapisać trasę, musisz spełnić wszystkie wymagania:
              </p>
              <div>
                <h4 className="font-semibold mb-2">Wymagania dla ustawień ogólnych (Krok 1):</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Wszystkie pola formularza muszą być wypełnione poprawnie</li>
                  <li>Walidacja musi przejść pomyślnie</li>
                  <li>Miniatura jest wymagana (tylko przy tworzeniu nowej trasy)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Wymagania dla punktów (Krok 2):</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Dodać przynajmniej jeden punkt do trasy</li>
                  <li>
                    Każdy punkt musi mieć wypełnione:
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>Nazwę (wymagane)</li>
                      <li>Dialog (wymagane) - używany jako narrationText</li>
                    </ul>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Proces zapisywania:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    <strong>Walidacja</strong> - system sprawdza wszystkie wymagania przed zapisaniem
                  </li>
                  <li>
                    <strong>Przygotowanie danych</strong> - dane są formatowane i przygotowywane do wysłania do API
                  </li>
                  <li>
                    <strong>Obliczanie statystyk</strong> - dystans i czas są automatycznie obliczane na podstawie punktów
                  </li>
                  <li>
                    <strong>Wysłanie do API</strong> - dane są wysyłane przez odpowiedni endpoint (POST dla nowych, PATCH dla edycji)
                  </li>
                  <li>
                    <strong>Przekierowanie</strong> - po udanym zapisaniu następuje przekierowanie do listy tras
                  </li>
                </ul>
              </div>
              <p className="mt-2">
                Przycisk "Zapisz trasę" jest nieaktywny, dopóki nie spełnisz wszystkich powyższych warunków.
                Podczas zapisywania przycisk wyświetla stan "Zapisywanie..." i jest nieaktywny.
              </p>
              <div className="bg-primary/5 rounded p-3 border border-primary/20">
                <p className="font-semibold text-foreground mb-1">
                  ✅ Po zapisaniu:
                </p>
                <p className="text-sm text-muted-foreground">
                  Wszystkie dane trasy (ustawienia ogólne + punkty) zostaną zapisane. W trybie edycji
                  zmiany zostaną zaktualizowane, a w trybie tworzenia zostanie utworzona nowa trasa.
                  Po udanym zapisaniu zostaniesz przekierowany do listy tras.
                </p>
              </div>
              <div className="bg-secondary/20 rounded p-3 border border-secondary/40">
                <p className="font-semibold text-foreground mb-1">
                  ⚠️ Obsługa błędów:
                </p>
                <p className="text-sm text-muted-foreground">
                  W przypadku błędu podczas zapisywania, wyświetlony zostanie komunikat błędu. Możesz poprawić
                  dane i spróbować ponownie. Błędy mogą wynikać z problemów z API, nieprawidłowych danych
                  lub problemów z plikami.
                </p>
              </div>
            </div>
          </div>

          {/* Sekcja 9: Funkcjonalności dla admina */}
          <div>
            <h3 className="font-semibold mb-3">9. Funkcjonalności administracyjne</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Jako administrator masz pełną kontrolę nad tworzonymi trasami:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Tworzenie nieograniczonej liczby tras</strong> - możesz tworzyć dowolną liczbę
                  projektów tras
                </li>
                <li>
                  <strong>Pełna edycja</strong> - możesz edytować wszystkie pola ustawień ogólnych i punktów
                </li>
                <li>
                  <strong>Zarządzanie kolejnością</strong> - kontrolujesz kolejność, w jakiej użytkownicy
                  będą odwiedzać punkty
                </li>
                <li>
                  <strong>Wizualizacja na mapie</strong> - widzisz wszystkie punkty na interaktywnej mapie
                </li>
                <li>
                  <strong>Walidacja formularzy</strong> - wszystkie pola są walidowane w czasie rzeczywistym
                </li>
                <li>
                  <strong>Zarządzanie publikacją</strong> - możesz publikować i cofać publikację tras z listy tras
                </li>
                <li>
                  <strong>Przełączanie widoku</strong> - możesz wybrać widok kafelków lub listy w liście tras
                </li>
              </ul>
            </div>
          </div>

          {/* Sekcja 10: Wskazówki */}
          <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
            <h3 className="font-semibold text-foreground mb-2">
              💡 Przydatne wskazówki
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Zawsze zapisuj zmiany punktu przed przejściem do innego punktu</li>
              <li>Używaj opisowych nazw punktów, aby ułatwić identyfikację</li>
              <li>Dodawaj szczegółowe opisy, które pomogą użytkownikom zrozumieć znaczenie punktu</li>
              <li>Sprawdzaj kolejność punktów przed zapisaniem trasy</li>
              <li>Możesz przybliżać i oddalać mapę, aby precyzyjnie umieścić punkty</li>
              <li>Wszystkie pola formularza są walidowane - sprawdzaj komunikaty błędów</li>
              <li>Używaj drag & drop do szybkiego dodawania plików obrazów</li>
              <li>W widoku listy tras możesz szybko przełączać się między widokami</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Kreator postaci */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Kreator postaci
          </CardTitle>
          <CardDescription>Tworzenie i edycja postaci</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sekcja 1: Wprowadzenie */}
          <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Wprowadzenie
            </h3>
            <p className="text-sm text-muted-foreground">
              Kreator postaci pozwala na tworzenie i edycję postaci używanych w trasach. Proces tworzenia postaci
              odbywa się w dwóch krokach, podobnie jak w kreatorze tras.
            </p>
          </div>

          {/* Sekcja 2: Krok 1 - Ustawienia ogólne */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary" />
              Krok 1: Ustawienia ogólne
            </h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                W pierwszym kroku musisz wypełnić wszystkie wymagane pola formularza. Formularz ma walidację,
                więc nie możesz przejść do kroku 2, dopóki wszystkie pola nie będą poprawnie wypełnione.
              </p>
              <div>
                <h4 className="font-semibold mb-2">Wymagane pola:</h4>
                <ul className="space-y-2 list-disc list-inside ml-4">
                  <li>
                    <strong>Nazwa postaci</strong> - min. 2 znaki, max. 50 znaków
                  </li>
                  <li>
                    <strong>Avatar</strong> - przeciągnij i upuść plik obrazu lub kliknij, aby wybrać (max. 5MB)
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Sekcja 3: Krok 2 - Pozycja domyślna */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Krok 2: Pozycja domyślna (opcjonalnie)
            </h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                W drugim kroku możesz opcjonalnie ustawić pozycję domyślną postaci na mapie. To pozwala na
                wyświetlanie postaci w określonym miejscu.
              </p>
              <div>
                <h4 className="font-semibold mb-2">Jak wybrać pozycję:</h4>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Kliknij przycisk "Wybierz pozycję na mapie"</li>
                  <li>Kliknij na mapie po lewej stronie w miejscu, gdzie chcesz ustawić pozycję</li>
                  <li>Pozycja zostanie automatycznie zapisana i wyświetlona</li>
                  <li>Możesz dodać opcjonalny opis pozycji</li>
                </ol>
              </div>
              <div className="bg-primary/5 rounded p-3 border border-primary/20">
                <p className="font-semibold text-foreground mb-1">
                  💡 Wskazówka:
                </p>
                <p className="text-sm text-muted-foreground">
                  Pozycja domyślna jest opcjonalna. Możesz pominąć ten krok i zapisać postać bez pozycji.
                  Możesz również usunąć pozycję, klikając przycisk X obok wybranej pozycji.
                </p>
              </div>
            </div>
          </div>

          {/* Sekcja 4: Edycja postaci */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Edit2 className="h-4 w-4 text-primary" />
              Edycja istniejącej postaci
            </h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Aby edytować istniejącą postać, przejdź do listy postaci i kliknij przycisk "Edytuj" na karcie postaci.
                System automatycznie załaduje wszystkie dane postaci z API.
              </p>
              <div>
                <h4 className="font-semibold mb-2">Proces ładowania danych:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    <strong>Ładowanie podstawowych danych</strong> - system pobiera informacje o postaci (nazwa, opis)
                  </li>
                  <li>
                    <strong>Ładowanie avatara</strong> - avatar jest wyświetlany (jeśli dostępny), ale nie jest wymagany przy edycji
                  </li>
                  <li>
                    <strong>Ładowanie pozycji</strong> - pozycja domyślna jest załadowana i wyświetlona na mapie (jeśli ustawiona)
                  </li>
                  <li>
                    <strong>Wypełnienie formularza</strong> - wszystkie pola formularza są automatycznie wypełnione
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Funkcje edycji:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    <strong>Edycja nazwy</strong> - możesz zmienić nazwę postaci
                  </li>
                  <li>
                    <strong>Edycja opisu</strong> - możesz zmienić opis postaci (opcjonalne)
                  </li>
                  <li>
                    <strong>Zmiana avatara</strong> - możesz zmienić avatar (tylko nowy plik jest wysyłany do API)
                  </li>
                  <li>
                    <strong>Edycja pozycji</strong> - możesz zmienić lub usunąć pozycję domyślną
                  </li>
                  <li>
                    <strong>Zachowanie danych</strong> - jeśli nie zmienisz pola, stara wartość zostanie zachowana
                  </li>
                </ul>
              </div>
              <div className="bg-primary/5 rounded p-3 border border-primary/20">
                <p className="font-semibold text-foreground mb-1">
                  ✅ Wskazówka:
                </p>
                <p className="text-sm text-muted-foreground">
                  W trybie edycji avatar jest opcjonalny - jeśli nie wybierzesz nowego pliku, stary zostanie zachowany.
                  To samo dotyczy pozycji domyślnej - możesz ją usunąć lub zmienić.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Funkcje techniczne */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Funkcje techniczne
          </CardTitle>
          <CardDescription>Szczegóły techniczne i funkcje systemu</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* API i komunikacja */}
          <div>
            <h3 className="font-semibold mb-3">Komunikacja z API</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Wszystkie dane są pobierane i wysyłane przez REST API. System używa autoryzacji opartej na cookies.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Autoryzacja</strong> - wszystkie requesty wymagają sesji w cookies (Better Auth)
                </li>
                <li>
                  <strong>Format danych</strong> - dane są wysyłane jako FormData (dla plików) lub JSON
                </li>
                <li>
                  <strong>Obsługa błędów</strong> - wszystkie błędy API są wyświetlane użytkownikowi
                </li>
                <li>
                  <strong>Loading states</strong> - podczas ładowania danych wyświetlane są placeholdery
                </li>
                <li>
                  <strong>Automatyczne odświeżanie</strong> - niektóre dane są automatycznie odświeżane po operacjach
                </li>
              </ul>
            </div>
          </div>

          {/* Walidacja */}
          <div>
            <h3 className="font-semibold mb-3">Walidacja formularzy</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Wszystkie formularze używają React Hook Form z Yup do walidacji. Walidacja odbywa się w czasie rzeczywistym.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Walidacja w czasie rzeczywistym</strong> - błędy są wyświetlane natychmiast po wprowadzeniu zmian
                </li>
                <li>
                  <strong>Walidacja przed zapisaniem</strong> - system sprawdza wszystkie pola przed wysłaniem do API
                </li>
                <li>
                  <strong>Komunikaty błędów</strong> - każdy błąd ma czytelny komunikat w języku polskim
                </li>
                <li>
                  <strong>Blokowanie przycisków</strong> - przyciski są nieaktywne, dopóki walidacja nie przejdzie
                </li>
              </ul>
            </div>
          </div>

          {/* Formatowanie danych */}
          <div>
            <h3 className="font-semibold mb-3">Formatowanie danych</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                System automatycznie formatuje dane dla lepszej czytelności:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Dystans</strong> - automatyczna konwersja metrów na kilometry (≥1000m)
                </li>
                <li>
                  <strong>Czas</strong> - formatowanie na godziny i minuty (np. "2h 30min")
                </li>
                <li>
                  <strong>Daty</strong> - formatowanie w formacie polskim z godziną
                </li>
                <li>
                  <strong>Liczba punktów</strong> - poprawna odmiana w języku polskim
                </li>
                <li>
                  <strong>Poziomy trudności</strong> - wyświetlanie z odpowiednimi kolorami
                </li>
              </ul>
            </div>
          </div>

          {/* Mapa */}
          <div>
            <h3 className="font-semibold mb-3">Funkcje mapy</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Mapa oferuje wiele funkcji do zarządzania punktami:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Dodawanie punktów</strong> - przez kliknięcie na mapie lub przycisk
                </li>
                <li>
                  <strong>Przesuwanie markerów</strong> - drag & drop markerów na mapie
                </li>
                <li>
                  <strong>Obliczanie dystansu</strong> - automatyczne obliczanie całkowitego dystansu trasy
                </li>
                <li>
                  <strong>Szacowanie czasu</strong> - obliczanie czasu na podstawie dystansu (3 km/h)
                </li>
                <li>
                  <strong>Wizualizacja trasy</strong> - linia łącząca punkty w kolejności
                </li>
                <li>
                  <strong>Zaznaczanie punktów</strong> - wyróżnianie aktualnie edytowanego punktu
                </li>
                <li>
                  <strong>Usuwanie z mapy</strong> - możliwość usunięcia punktu bezpośrednio z mapy
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Szybka referencja */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Szybka referencja</CardTitle>
          <CardDescription>Najważniejsze funkcje w skrócie</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Ikony i przyciski:</h4>
            <div className="grid md:grid-cols-2 gap-3 text-sm text-foreground">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-primary" />
                <span>Ustawienia ogólne</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Punkt na mapie / Pozycja domyślna</span>
              </div>
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" />
                <span>Dodaj punkt / Nowa trasa / Nowa postać</span>
              </div>
              <div className="flex items-center gap-2">
                <Edit2 className="h-4 w-4 text-primary" />
                <span>Edytuj</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon icon="solar:alt-arrow-up-bold-duotone" className="h-4 w-4 text-primary" />
                <span>Przesuń punkt w górę</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon icon="solar:alt-arrow-down-bold-duotone" className="h-4 w-4 text-primary" />
                <span>Przesuń punkt w dół</span>
              </div>
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-destructive" />
                <span>Usuń punkt</span>
              </div>
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4 text-primary" />
                <span>Zapisz trasę / Zapisz postać</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                <span>Opublikuj trasę</span>
              </div>
              <div className="flex items-center gap-2">
                <EyeOff className="h-4 w-4 text-destructive" />
                <span>Zdejmij z publikacji</span>
              </div>
              <div className="flex items-center gap-2">
                <Grid3x3 className="h-4 w-4 text-primary" />
                <span>Widok kafelków</span>
              </div>
              <div className="flex items-center gap-2">
                <List className="h-4 w-4 text-primary" />
                <span>Widok listy</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <span>Postacie</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
