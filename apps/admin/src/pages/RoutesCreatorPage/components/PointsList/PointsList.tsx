import { Button } from "@/components/ui/button.tsx"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx"
import { Icon } from "@iconify/react"

export interface RoutePoint {
  id: string
  name: string
  description: string
  lat: number
  lng: number
  order: number
  hasCustomAudio: boolean
  audioFile: File | null
  characterId: number | null
  dialog: string
}

type PointsListProps = {
  points: RoutePoint[]
  selectedPoint: RoutePoint | null
  onPointSelect: (point: RoutePoint) => void
  onPointDelete: (id: string) => void
  onPointMove: (id: string, direction: "up" | "down") => void
  onAddPoint: () => void
}

const PointsList = ({
  points,
  selectedPoint,
  onPointSelect,
  onPointDelete,
  onPointMove,
  onAddPoint,
}: PointsListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Punkty trasy ({points.length})</span>
          <Button
            variant="outline"
            size="sm"
            onClick={onAddPoint}
            className="bg-blue-50 hover:bg-blue-100 border-blue-200"
          >
            <Icon icon="solar:add-circle-bold-duotone" className="h-4 w-4 mr-2" />
            Dodaj punkt
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {points.length === 0 ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <Icon icon="solar:map-point-bold-duotone" className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <p className="text-sm text-blue-800 font-medium mb-1">
              Brak punktów
            </p>
            <p className="text-xs text-blue-600">
              Kliknij na mapie, aby dodać pierwszy punkt
            </p>
          </div>
        ) : (
          points
            .sort((a, b) => a.order - b.order)
            .map((point) => (
              <div
                key={point.id}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedPoint?.id === point.id
                    ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200"
                    : "hover:bg-blue-50/50 border-border"
                  }`}
                onClick={() => onPointSelect(point)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <Icon icon="solar:menu-dots-vertical-bold-duotone" className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium">{point.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        onPointMove(point.id, "up")
                      }}
                      disabled={point.order === 1}
                      className="h-8 w-8"
                    >
                      ↑
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        onPointMove(point.id, "down")
                      }}
                      disabled={point.order === points.length}
                      className="h-8 w-8"
                    >
                      ↓
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        onPointDelete(point.id)
                      }}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Icon icon="solar:trash-bin-trash-bold-duotone" className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
        )}
      </CardContent>
    </Card>
  )
}

export default PointsList
