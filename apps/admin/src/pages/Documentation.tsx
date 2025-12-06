import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@iconify/react"

export function Documentation() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dokumentacja</h1>
        <p className="text-muted-foreground">Przewodnik po panelu administracyjnym</p>
      </div>

      {/* Niebieska wstawka */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 dark:bg-blue-900/40 rounded-full p-2">
            <Icon icon="solar:map-point-bold-duotone" className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Kompletny przewodnik
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Poniżej znajdziesz szczegółowe instrukcje dotyczące wszystkich funkcji panelu administracyjnego,
              ze szczególnym uwzględnieniem kreatora tras.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon icon="solar:map-point-bold-duotone" className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Dashboard
            </CardTitle>
            <CardDescription>Przegląd statystyk</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Na stronie głównej znajdziesz ogólne statystyki dotyczące wszystkich tras,
              w tym liczbę uczestników, wskaźniki ukończenia oraz szczegółowe informacje
              o każdym projekcie trasy.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Przegląd wszystkich aktywnych tras</li>
              <li>Statystyki uczestników i ukończeń</li>
              <li>Interaktywny wykres z możliwością zmiany danych</li>
              <li>Szczegółowe karty dla każdej trasy</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon icon="solar:map-point-bold-duotone" className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Kreator tras - Kompletny przewodnik
            </CardTitle>
            <CardDescription>Szczegółowa instrukcja tworzenia i edycji tras</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sekcja 1: Wprowadzenie */}
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                1. Wprowadzenie
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Kreator tras to narzędzie pozwalające na tworzenie interaktywnych tras turystycznych
                z punktami na mapie. Każda trasa składa się z nazwy oraz serii punktów, które użytkownicy
                będą mogli odwiedzać w określonej kolejności.
              </p>
            </div>

            {/* Sekcja 2: Tworzenie trasy */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Icon icon="solar:add-circle-bold-duotone" className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                2. Tworzenie nowej trasy
              </h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex gap-3">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">Krok 1:</span>
                  <span>Wprowadź nazwę trasy w polu "Nazwa trasy" w lewym panelu.</span>
                </div>
                <div className="flex gap-3">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">Krok 2:</span>
                  <span>
                    Kliknij na mapie (po prawej stronie) w miejscu, gdzie chcesz dodać pierwszy punkt trasy.
                    Alternatywnie możesz użyć przycisku "Dodaj punkt" w panelu po lewej stronie.
                  </span>
                </div>
                <div className="flex gap-3">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">Krok 3:</span>
                  <span>
                    Po kliknięciu na mapie, punkt zostanie automatycznie dodany do listy i pojawi się
                    marker na mapie. Panel edycji punktu otworzy się automatycznie.
                  </span>
                </div>
              </div>
            </div>

            {/* Sekcja 3: Dodawanie punktów */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                3. Dodawanie kolejnych punktów
              </h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Możesz dodać dowolną liczbę punktów do trasy. Każdy punkt może być dodany poprzez:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    <strong>Kliknięcie na mapie</strong> - najszybszy sposób, punkt pojawi się dokładnie
                    w miejscu kliknięcia
                  </li>
                  <li>
                    <strong>Przycisk "Dodaj punkt"</strong> - dodaje punkt w centrum mapy (Warszawa)
                  </li>
                </ul>
                <p className="mt-2">
                  Punkty są automatycznie numerowane w kolejności dodania, ale możesz zmienić ich kolejność
                  (patrz sekcja 5).
                </p>
              </div>
            </div>

            {/* Sekcja 4: Edycja punktów */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Icon icon="solar:pen-bold-duotone" className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                4. Edycja szczegółów punktu
              </h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Aby edytować punkt, kliknij na niego w liście punktów po lewej stronie. Panel edycji
                  otworzy się automatycznie i pozwoli na zmianę:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    <strong>Nazwa punktu</strong> - krótka nazwa identyfikująca punkt (np. "Pomnik Chopina")
                  </li>
                  <li>
                    <strong>Opis</strong> - szczegółowy opis punktu, który będzie widoczny dla użytkowników
                  </li>
                  <li>
                    <strong>Współrzędne geograficzne</strong> - szerokość i długość geograficzna (można edytować
                    ręcznie lub zmienić poprzez przesunięcie markera na mapie)
                  </li>
                </ul>
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded p-3 border border-blue-200 dark:border-blue-800">
                  <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    💡 Wskazówka:
                  </p>
                  <p className="text-blue-800 dark:text-blue-200">
                    Po wprowadzeniu zmian kliknij "Zapisz zmiany", aby zatwierdzić edycję punktu.
                    Jeśli nie zapiszesz zmian, zostaną one utracone przy przejściu do innego punktu.
                  </p>
                </div>
              </div>
            </div>

            {/* Sekcja 5: Zmiana kolejności */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Icon icon="solar:menu-dots-vertical-bold-duotone" className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                5. Zmiana kolejności punktów
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

            {/* Sekcja 6: Usuwanie punktów */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Icon icon="solar:trash-bin-trash-bold-duotone" className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                6. Usuwanie punktów
              </h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Aby usunąć punkt z trasy, kliknij ikonę kosza (🗑️) obok punktu w liście. Punkt zostanie
                  natychmiast usunięty z trasy i z mapy.
                </p>
                <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded p-3 border border-yellow-200 dark:border-yellow-800">
                  <p className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                    ⚠️ Uwaga:
                  </p>
                  <p className="text-yellow-800 dark:text-yellow-200">
                    Usunięcie punktu jest nieodwracalne. Jeśli edytujesz punkt, który chcesz usunąć,
                    najpierw zamknij panel edycji (klikając poza niego lub zapisując zmiany).
                  </p>
                </div>
              </div>
            </div>

            {/* Sekcja 7: Zapisywanie trasy */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Icon icon="solar:diskette-bold-duotone" className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                7. Zapisywanie trasy
              </h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Po zakończeniu tworzenia trasy, kliknij przycisk "Zapisz trasę" na dole lewego panelu.
                  Aby zapisać trasę, musisz:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Wprowadzić nazwę trasy (pole nie może być puste)</li>
                  <li>Dodać przynajmniej jeden punkt do trasy</li>
                </ul>
                <p className="mt-2">
                  Po zapisaniu, trasa zostanie zapisana lokalnie w przeglądarce. Przycisk "Zapisz trasę"
                  jest nieaktywny (szary), dopóki nie spełnisz powyższych warunków.
                </p>
                <div className="bg-green-50 dark:bg-green-950/20 rounded p-3 border border-green-200 dark:border-green-800">
                  <p className="font-semibold text-green-900 dark:text-green-100 mb-1">
                    ✅ Po zapisaniu:
                  </p>
                  <p className="text-green-800 dark:text-green-200">
                    Trasa zostanie zapisana i pojawi się komunikat potwierdzający. Formularz zostanie
                    wyczyszczony, aby umożliwić tworzenie kolejnej trasy.
                  </p>
                </div>
              </div>
            </div>

            {/* Sekcja 8: Funkcjonalności dla admina */}
            <div>
              <h3 className="font-semibold mb-3">8. Funkcjonalności administracyjne</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Jako administrator masz pełną kontrolę nad tworzonymi trasami:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    <strong>Tworzenie nieograniczonej liczby tras</strong> - możesz tworzyć dowolną liczbę
                    projektów tras
                  </li>
                  <li>
                    <strong>Pełna edycja</strong> - możesz edytować nazwy, opisy i współrzędne każdego punktu
                  </li>
                  <li>
                    <strong>Zarządzanie kolejnością</strong> - kontrolujesz kolejność, w jakiej użytkownicy
                    będą odwiedzać punkty
                  </li>
                  <li>
                    <strong>Wizualizacja na mapie</strong> - widzisz wszystkie punkty na interaktywnej mapie
                    OpenStreetMap
                  </li>
                  <li>
                    <strong>Zapis lokalny</strong> - wszystkie trasy są zapisywane w przeglądarce (localStorage)
                  </li>
                </ul>
              </div>
            </div>

            {/* Sekcja 9: Wskazówki */}
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                💡 Przydatne wskazówki
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                <li>Zawsze zapisuj zmiany punktu przed przejściem do innego punktu</li>
                <li>Używaj opisowych nazw punktów, aby ułatwić identyfikację</li>
                <li>Dodawaj szczegółowe opisy, które pomogą użytkownikom zrozumieć znaczenie punktu</li>
                <li>Sprawdzaj kolejność punktów przed zapisaniem trasy</li>
                <li>Możesz przybliżać i oddalać mapę, aby precyzyjnie umieścić punkty</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle>Zarządzanie punktami</CardTitle>
            <CardDescription>Edycja i organizacja</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Każdy punkt może mieć nazwę, opis i współrzędne geograficzne. Możesz
              zmieniać kolejność punktów za pomocą przycisków strzałek lub usuwać
              niepotrzebne punkty.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Icon icon="solar:alt-arrow-up-bold-duotone" className="h-4 w-4 text-blue-600" />
                <span>Przesuń punkt w górę</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon icon="solar:alt-arrow-down-bold-duotone" className="h-4 w-4 text-blue-600" />
                <span>Przesuń punkt w dół</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon icon="solar:trash-bin-trash-bold-duotone" className="h-4 w-4 text-red-600" />
                <span>Usuń punkt z trasy</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
