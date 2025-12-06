import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@iconify/react"
import { MapPin, Plus, Edit2, GripVertical, Trash2, Save, ArrowUp, ArrowDown, Settings, List, Grid3x3, Eye, EyeOff, FileText, CheckCircle2, User } from "lucide-react"

export function Documentation() {
  return (
    <div className="container mx-auto p-6 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dokumentacja</h1>
        <p className="text-muted-foreground">Kompletny przewodnik po panelu administracyjnym</p>
      </div>

      {/* Niebieska wstawka */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 rounded-full p-2">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">
              Kompletny przewodnik
            </h3>
            <p className="text-sm text-blue-800">
              Poniżej znajdziesz szczegółowe instrukcje dotyczące wszystkich funkcji panelu administracyjnego,
              w tym kreatora tras, zarządzania trasami i dashboardu.
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Dashboard
          </CardTitle>
          <CardDescription>Przegląd statystyk i metryk</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Na stronie głównej znajdziesz ogólne statystyki dotyczące wszystkich tras,
            w tym liczbę uczestników, wskaźniki ukończenia oraz szczegółowe informacje
            o każdym projekcie trasy.
          </p>
          <div>
            <h4 className="font-semibold mb-2">Dostępne funkcje:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Przegląd wszystkich aktywnych tras</li>
              <li>Statystyki uczestników i ukończeń</li>
              <li>Interaktywny wykres z możliwością zmiany danych</li>
              <li>Szczegółowe karty dla każdej trasy</li>
              <li>Karty informacyjne z kluczowymi metrykami</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Lista tras */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5 text-blue-600" />
            Lista tras
          </CardTitle>
          <CardDescription>Zarządzanie wszystkimi trasami</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Strona z listą wszystkich tras pozwala na przeglądanie, edycję i zarządzanie trasami.
          </p>
          <div>
            <h4 className="font-semibold mb-2">Funkcjonalności:</h4>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
              <li>
                <strong>Przełączanie widoku</strong> - możesz wybrać widok kafelków (grid) lub widok listy
                za pomocą przycisków w prawym górnym rogu
              </li>
              <li>
                <strong>Paginacja</strong> - trasy są podzielone na strony (6 tras na stronę)
              </li>
              <li>
                <strong>Informacje o trasie</strong> - każda karta pokazuje:
                <ul className="ml-4 mt-1 space-y-1">
                  <li>Liczbę punktów (z poprawną odmianą)</li>
                  <li>Dystans w kilometrach lub metrach</li>
                  <li>Czas trwania w godzinach i minutach</li>
                  <li>Poziom trudności</li>
                  <li>Datę ostatniej edycji</li>
                </ul>
              </li>
              <li>
                <strong>Publikacja</strong> - przycisk "Opublikuj" / "Zdejmij" pozwala na zmianę statusu trasy
              </li>
              <li>
                <strong>Edycja</strong> - przycisk "Edytuj" otwiera kreator z wypełnionymi danymi trasy
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Lista postaci */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
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
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            Kreator tras - Kompletny przewodnik
          </CardTitle>
          <CardDescription>Szczegółowa instrukcja tworzenia i edycji tras</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sekcja 1: Wprowadzenie */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              1. Wprowadzenie
            </h3>
            <p className="text-sm text-blue-800">
              Kreator tras to narzędzie pozwalające na tworzenie interaktywnych tras turystycznych
              z punktami na mapie. Proces tworzenia trasy odbywa się w dwóch krokach:
            </p>
            <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
              <li><strong>Krok 1:</strong> Ustawienia ogólne - podstawowe informacje o trasie</li>
              <li><strong>Krok 2:</strong> Punkty trasy - dodawanie i konfiguracja punktów na mapie</li>
            </ul>
          </div>

            {/* Sekcja 2: Krok 1 - Ustawienia ogólne */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Settings className="h-4 w-4 text-blue-600" />
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
                <div className="bg-blue-50 rounded p-3 border border-blue-200">
                  <p className="font-semibold text-blue-900 mb-1">
                    💡 Wskazówka:
                  </p>
                  <p className="text-blue-800">
                    Wszystkie pola są walidowane w czasie rzeczywistym. Błędy są wyświetlane pod każdym polem.
                    Przycisk "Przejdź do kroku 2" jest zablokowany, dopóki wszystkie pola nie będą poprawne.
                  </p>
                </div>
              </div>
            </div>

            {/* Sekcja 3: Krok 2 - Punkty trasy */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
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
                      w miejscu kliknięcia
                    </li>
                    <li>
                      <strong>Przycisk "Dodaj punkt"</strong> - dodaje punkt w centrum mapy (Warszawa)
                    </li>
                  </ul>
                </div>
                <p className="mt-2">
                  Punkty są automatycznie numerowane w kolejności dodania, ale możesz zmienić ich kolejność
                  (patrz sekcja 6).
                </p>
              </div>
            </div>

            {/* Sekcja 4: Edycja punktów */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Edit2 className="h-4 w-4 text-blue-600" />
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
                <div className="bg-blue-50 rounded p-3 border border-blue-200">
                  <p className="font-semibold text-blue-900 mb-1">
                    💡 Wskazówka:
                  </p>
                  <p className="text-blue-800">
                    Po wprowadzeniu zmian kliknij "Zapisz zmiany", aby zatwierdzić edycję punktu.
                    Jeśli nie zapiszesz zmian, zostaną one utracone przy przejściu do innego punktu.
                  </p>
                </div>
              </div>
            </div>

            {/* Sekcja 5: Edycja istniejącej trasy */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Edit2 className="h-4 w-4 text-blue-600" />
                5. Edycja istniejącej trasy
              </h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Aby edytować istniejącą trasę, przejdź do listy tras i kliknij przycisk "Edytuj" na karcie trasy.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Formularz automatycznie wypełni się danymi trasy</li>
                  <li>Wszystkie punkty zostaną załadowane i wyświetlone na mapie</li>
                  <li>Automatycznie przejdziesz do kroku 2, jeśli trasa ma punkty</li>
                  <li>Możesz edytować wszystkie pola i zapisać zmiany</li>
                </ul>
                <div className="bg-green-50 rounded p-3 border border-green-200">
                  <p className="font-semibold text-green-900 mb-1">
                    ✅ Wskazówka:
                  </p>
                  <p className="text-green-800">
                    Wszystkie dane są automatycznie wypełnione, więc możesz od razu przejść do edycji punktów
                    lub zmienić ustawienia ogólne.
                  </p>
                </div>
              </div>
            </div>

            {/* Sekcja 6: Zmiana kolejności */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-blue-600" />
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
                <Trash2 className="h-4 w-4 text-blue-600" />
                7. Usuwanie punktów
              </h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Aby usunąć punkt z trasy, kliknij ikonę kosza (🗑️) obok punktu w liście. Punkt zostanie
                  natychmiast usunięty z trasy i z mapy.
                </p>
                <div className="bg-yellow-50 rounded p-3 border border-yellow-200">
                  <p className="font-semibold text-yellow-900 mb-1">
                    ⚠️ Uwaga:
                  </p>
                  <p className="text-yellow-800">
                    Usunięcie punktu jest nieodwracalne. Jeśli edytujesz punkt, który chcesz usunąć,
                    najpierw zamknij panel edycji (klikając poza niego lub zapisując zmiany).
                  </p>
                </div>
              </div>
            </div>

            {/* Sekcja 8: Zapisywanie trasy */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Save className="h-4 w-4 text-blue-600" />
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
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Wymagania dla punktów (Krok 2):</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Dodać przynajmniej jeden punkt do trasy</li>
                    <li>Każdy punkt musi mieć wypełnione:
                      <ul className="ml-4 mt-1 space-y-1">
                        <li>Nazwę (wymagane)</li>
                        <li>Opis (wymagane)</li>
                        <li>Postać (wymagane)</li>
                        <li>Dialog (wymagane)</li>
                      </ul>
                    </li>
                  </ul>
                </div>
                <p className="mt-2">
                  Przycisk "Zapisz trasę" jest nieaktywny, dopóki nie spełnisz wszystkich powyższych warunków.
                  Po zapisaniu, dane trasy zostaną wyświetlone w konsoli (w produkcji zostaną wysłane do API).
                </p>
                <div className="bg-green-50 rounded p-3 border border-green-200">
                  <p className="font-semibold text-green-900 mb-1">
                    ✅ Po zapisaniu:
                  </p>
                  <p className="text-green-800">
                    Wszystkie dane trasy (ustawienia ogólne + punkty) zostaną zapisane. W trybie edycji
                    zmiany zostaną zaktualizowane, a w trybie tworzenia zostanie utworzona nowa trasa.
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
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">
                💡 Przydatne wskazówki
              </h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
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
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Kreator postaci
          </CardTitle>
          <CardDescription>Tworzenie i edycja postaci</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sekcja 1: Wprowadzenie */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Wprowadzenie
            </h3>
            <p className="text-sm text-blue-800">
              Kreator postaci pozwala na tworzenie i edycję postaci używanych w trasach. Proces tworzenia postaci
              odbywa się w dwóch krokach, podobnie jak w kreatorze tras.
            </p>
          </div>

          {/* Sekcja 2: Krok 1 - Ustawienia ogólne */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Settings className="h-4 w-4 text-blue-600" />
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
              <MapPin className="h-4 w-4 text-blue-600" />
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
              <div className="bg-blue-50 rounded p-3 border border-blue-200">
                <p className="font-semibold text-blue-900 mb-1">
                  💡 Wskazówka:
                </p>
                <p className="text-blue-800">
                  Pozycja domyślna jest opcjonalna. Możesz pominąć ten krok i zapisać postać bez pozycji.
                  Możesz również usunąć pozycję, klikając przycisk X obok wybranej pozycji.
                </p>
              </div>
            </div>
          </div>

          {/* Sekcja 4: Edycja postaci */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Edit2 className="h-4 w-4 text-blue-600" />
              Edycja istniejącej postaci
            </h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Aby edytować istniejącą postać, przejdź do listy postaci i kliknij przycisk "Edytuj" na karcie postaci.
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Formularz automatycznie wypełni się danymi postaci</li>
                <li>Pozycja domyślna (jeśli ustawiona) zostanie załadowana i wyświetlona na mapie</li>
                <li>Automatycznie przejdziesz do kroku 2, jeśli postać ma pozycję domyślną</li>
                <li>Możesz edytować wszystkie pola i zapisać zmiany</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Szybka referencja */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle>Szybka referencja</CardTitle>
          <CardDescription>Najważniejsze funkcje w skrócie</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Ikony i przyciski:</h4>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-blue-600" />
                <span>Ustawienia ogólne</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span>Punkt na mapie / Pozycja domyślna</span>
              </div>
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-blue-600" />
                <span>Dodaj punkt / Nowa trasa / Nowa postać</span>
              </div>
              <div className="flex items-center gap-2">
                <Edit2 className="h-4 w-4 text-blue-600" />
                <span>Edytuj</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon icon="solar:alt-arrow-up-bold-duotone" className="h-4 w-4 text-blue-600" />
                <span>Przesuń punkt w górę</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon icon="solar:alt-arrow-down-bold-duotone" className="h-4 w-4 text-blue-600" />
                <span>Przesuń punkt w dół</span>
              </div>
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-red-600" />
                <span>Usuń punkt</span>
              </div>
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4 text-blue-600" />
                <span>Zapisz trasę / Zapisz postać</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-green-600" />
                <span>Opublikuj trasę</span>
              </div>
              <div className="flex items-center gap-2">
                <EyeOff className="h-4 w-4 text-red-600" />
                <span>Zdejmij z publikacji</span>
              </div>
              <div className="flex items-center gap-2">
                <Grid3x3 className="h-4 w-4 text-blue-600" />
                <span>Widok kafelków</span>
              </div>
              <div className="flex items-center gap-2">
                <List className="h-4 w-4 text-blue-600" />
                <span>Widok listy</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                <span>Postacie</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
