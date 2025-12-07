import { Button } from "@/components/ui/button.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Label } from "@/components/ui/label.tsx"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx"
import { MapPin, X } from "lucide-react"

export interface DefaultPosition {
  latitude: number
  longitude: number
  description: string
}

type DefaultPositionStepProps = {
  defaultPosition: DefaultPosition | null
  isSelectingPosition: boolean
  onPositionSelect: () => void
  onPositionRemove: () => void
  onPositionDescriptionChange: (description: string) => void
}

const DefaultPositionStep = ({
  defaultPosition,
  isSelectingPosition,
  onPositionSelect,
  onPositionRemove,
  onPositionDescriptionChange,
}: DefaultPositionStepProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pozycja domyślna</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {defaultPosition ? (
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-blue-900">Pozycja wybrana</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onPositionRemove}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-sm text-blue-800 space-y-1">
                <p>
                  <strong>Szerokość:</strong> {defaultPosition.latitude.toFixed(6)}
                </p>
                <p>
                  <strong>Długość:</strong> {defaultPosition.longitude.toFixed(6)}
                </p>
              </div>
            </div>
            <div>
              <Label htmlFor="position-description">Opis pozycji (opcjonalnie)</Label>
              <Input
                id="position-description"
                value={defaultPosition.description}
                onChange={(e) => onPositionDescriptionChange(e.target.value)}
                placeholder="Np. Główna siedziba postaci"
                className="bg-background"
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Nie wybrano pozycji domyślnej. Kliknij przycisk poniżej, aby wybrać pozycję na mapie.
            </p>
            <Button
              onClick={onPositionSelect}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <MapPin className="h-4 w-4" />
              Wybierz pozycję na mapie
            </Button>
          </div>
        )}

        {isSelectingPosition && !defaultPosition && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              Kliknij na mapie po lewej stronie, aby wybrać pozycję domyślną.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default DefaultPositionStep
