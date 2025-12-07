# Propozycje Refaktoringu Komponentów

## Analiza obecnego stanu

### Największe komponenty wymagające refaktoringu:

1. **RouteCreatorPage.tsx** - 1279 linii ⚠️
2. **Documentation.tsx** - 1036 linii (dokumentacja - OK)
3. **CharacterCreatorPage.tsx** - 518 linii ⚠️
4. **MapComponent.tsx** - 499 linii
5. **RoutesListPage.tsx** - 420 linii ⚠️

---

## 1. RouteCreatorPage.tsx (1279 linii) - PRIORYTET WYSOKI

### Propozycje wyodrębnienia:

#### 1.1. AudioFileInput (linie 34-157)
**Status:** Funkcja wewnętrzna, powinna być osobnym komponentem

**Propozycja:**
```
components/shared/CustomCards/CustomInput/CustomAudioInput.tsx
```

**Korzyści:**
- Możliwość ponownego użycia w innych miejscach
- Lepsza organizacja kodu
- Łatwiejsze testowanie

#### 1.2. RouteStatisticsOverlay (linie 867-899)
**Status:** Duży blok JSX, można wyodrębnić

**Propozycja:**
```
pages/RouteCreator/components/RouteStatisticsOverlay/RouteStatisticsOverlay.tsx
```

**Props:**
```typescript
interface RouteStatisticsOverlayProps {
  routeDistance: number
  formattedTime: string
  pointsCount: number
}
```

#### 1.3. StepIndicator (linie 916-925)
**Status:** Używany też w CharacterCreatorPage - wspólny komponent

**Propozycja:**
```
components/shared/StepIndicator/StepIndicator.tsx
```

**Props:**
```typescript
interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
  stepLabels?: string[]
}
```

#### 1.4. PointsList (linie 1005-1102)
**Status:** Duży blok JSX z logiką wyświetlania punktów

**Propozycja:**
```
pages/RouteCreator/components/PointsList/PointsList.tsx
```

**Props:**
```typescript
interface PointsListProps {
  points: RoutePoint[]
  selectedPointId: string | null
  onPointSelect: (point: RoutePoint) => void
  onPointMove: (id: string, direction: "up" | "down") => void
  onPointDelete: (id: string) => void
  onAddPoint: () => void
}
```

#### 1.5. PointEditor (linie 1105-1245)
**Status:** Duży panel edycji punktu - ~140 linii JSX

**Propozycja:**
```
pages/RouteCreator/components/PointEditor/PointEditor.tsx
```

**Props:**
```typescript
interface PointEditorProps {
  point: RoutePoint
  characters: CharacterType[]
  isLoadingCharacters: boolean
  onPointChange: (point: RoutePoint) => void
  onSave: () => void
}
```

#### 1.6. MapOverlay (linie 840-855)
**Status:** Używany też w CharacterCreatorPage - wspólny komponent

**Propozycja:**
```
components/shared/MapOverlay/MapOverlay.tsx
```

**Props:**
```typescript
interface MapOverlayProps {
  isVisible: boolean
  title: string
  message: string
  icon?: React.ReactNode
}
```

---

## 2. CharacterCreatorPage.tsx (518 linii) - PRIORYTET ŚREDNI

### Propozycje wyodrębnienia:

#### 2.1. StepIndicator
**Status:** Wspólny z RouteCreatorPage - użyć wspólnego komponentu

#### 2.2. MapOverlay
**Status:** Wspólny z RouteCreatorPage - użyć wspólnego komponentu

#### 2.3. PositionSelector (linie 432-499)
**Status:** Panel wyboru pozycji - można wyodrębnić

**Propozycja:**
```
pages/CharacterCreator/components/PositionSelector/PositionSelector.tsx
```

**Props:**
```typescript
interface PositionSelectorProps {
  position: DefaultPosition | null
  isSelecting: boolean
  onPositionSelect: (lat: number, lng: number) => void
  onPositionRemove: () => void
  onStartSelecting: () => void
  onPositionDescriptionChange: (description: string) => void
}
```

---

## 3. RoutesListPage.tsx (420 linii) - PRIORYTET ŚREDNI

### Propozycje wyodrębnienia:

#### 3.1. RouteCard (linie 276-376)
**Status:** Karta trasy - duży blok JSX (~100 linii)

**Propozycja:**
```
pages/RoutesList/components/RouteCard/RouteCard.tsx
```

**Props:**
```typescript
interface RouteCardProps {
  route: RoutesObjectType
  viewMode: "grid" | "list"
  onTogglePublish: (route: RoutesObjectType) => void
  formatDistance: (meters: number) => string
  formatTime: (minutes: number) => string
  formatDate: (timestamp: number) => string
}
```

#### 3.2. ViewModeToggle (linie 210-227)
**Status:** Przełącznik widoku - można wyodrębnić

**Propozycja:**
```
components/shared/ViewModeToggle/ViewModeToggle.tsx
```

**Props:**
```typescript
interface ViewModeToggleProps {
  viewMode: "grid" | "list"
  onViewModeChange: (mode: "grid" | "list") => void
}
```

#### 3.3. PaginationControls (linie 381-413)
**Status:** Kontrolki paginacji - można wyodrębnić

**Propozycja:**
```
components/shared/PaginationControls/PaginationControls.tsx
```

**Props:**
```typescript
interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}
```

---

## 4. MapComponent.tsx (499 linii) - PRIORYTET NISKI

### Analiza:
Komponent jest już dobrze zorganizowany, ale można rozważyć:

#### 4.1. RoutingControl (logika routingu)
**Status:** Można wyodrębnić do osobnego hooka lub komponentu

**Propozycja:**
```
hooks/useRouteRouting.ts
```

---

## 5. Wspólne komponenty do utworzenia

### 5.1. StepIndicator
**Lokalizacja:** `components/shared/StepIndicator/StepIndicator.tsx`
**Używany w:** RouteCreatorPage, CharacterCreatorPage

### 5.2. MapOverlay
**Lokalizacja:** `components/shared/MapOverlay/MapOverlay.tsx`
**Używany w:** RouteCreatorPage, CharacterCreatorPage

### 5.3. ViewModeToggle
**Lokalizacja:** `components/shared/ViewModeToggle/ViewModeToggle.tsx`
**Używany w:** RoutesListPage, CharactersListPage (prawdopodobnie)

### 5.4. PaginationControls
**Lokalizacja:** `components/shared/PaginationControls/PaginationControls.tsx`
**Używany w:** RoutesListPage, CharactersListPage (prawdopodobnie)

---

## Plan implementacji

### Faza 1: Wspólne komponenty (najwyższy priorytet)
1. ✅ StepIndicator
2. ✅ MapOverlay
3. ✅ ViewModeToggle
4. ✅ PaginationControls

### Faza 2: RouteCreatorPage
1. ✅ AudioFileInput
2. ✅ RouteStatisticsOverlay
3. ✅ PointsList
4. ✅ PointEditor

### Faza 3: CharacterCreatorPage
1. ✅ PositionSelector
2. ✅ Użycie wspólnych komponentów (StepIndicator, MapOverlay)

### Faza 4: RoutesListPage
1. ✅ RouteCard
2. ✅ Użycie wspólnych komponentów (ViewModeToggle, PaginationControls)

### Faza 5: MapComponent (opcjonalnie)
1. ⚠️ useRouteRouting hook (jeśli potrzebne)

---

## Szacowane korzyści

### Przed refaktoringiem:
- RouteCreatorPage: **1279 linii**
- CharacterCreatorPage: **518 linii**
- RoutesListPage: **420 linii**
- **Razem: ~2217 linii w 3 plikach**

### Po refaktoringu:
- RouteCreatorPage: **~600-700 linii** (redukcja ~50%)
- CharacterCreatorPage: **~300-350 linii** (redukcja ~40%)
- RoutesListPage: **~200-250 linii** (redukcja ~50%)
- **Nowe komponenty: ~800-1000 linii** (lepiej zorganizowane)
- **Razem: ~1900-2300 linii** (lepiej zorganizowane, łatwiejsze w utrzymaniu)

### Korzyści:
- ✅ Lepsza czytelność kodu
- ✅ Możliwość ponownego użycia komponentów
- ✅ Łatwiejsze testowanie
- ✅ Lepsza organizacja
- ✅ Łatwiejsze utrzymanie
- ✅ Mniejsze ryzyko błędów

---

## Uwagi

1. **Documentation.tsx** (1036 linii) - pozostawić bez zmian, to dokumentacja
2. **MapComponent.tsx** (499 linii) - można rozważyć refaktoring w przyszłości
3. Wszystkie nowe komponenty powinny mieć odpowiednie typy TypeScript
4. Należy zachować wszystkie istniejące funkcjonalności
5. Testy powinny być zaktualizowane po refaktoringu
