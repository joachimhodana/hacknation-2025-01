import { Button } from "@/components/ui/button.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Label } from "@/components/ui/label.tsx"
import { Textarea } from "@/components/ui/textarea.tsx"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx"
import { Icon } from "@iconify/react"
import AudioFileInput from "../AudioFileInput/AudioFileInput.tsx"
import type { CharacterType } from "@/types/CharactersType.tsx"
import type { RoutePoint } from "../PointsList/PointsList.tsx"

type PointEditPanelProps = {
  point: RoutePoint
  characters: CharacterType[]
  isLoadingCharacters: boolean
  onPointChange: (point: RoutePoint) => void
  onSave: () => void
}

const PointEditPanel = ({
  point,
  characters,
  isLoadingCharacters,
  onPointChange,
  onSave,
}: PointEditPanelProps) => {
  return (
    <Card className="border-blue-200 bg-blue-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon icon="solar:pen-bold-duotone" className="h-4 w-4" />
          Edycja punktu
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="point-name">Nazwa</Label>
          <Input
            id="point-name"
            value={point.name}
            onChange={(e) =>
              onPointChange({ ...point, name: e.target.value })
            }
            className="bg-background"
          />
        </div>
        <div>
          <Label htmlFor="point-description">Opis</Label>
          <Textarea
            id="point-description"
            value={point.description}
            onChange={(e) =>
              onPointChange({ ...point, description: e.target.value })
            }
            rows={4}
            className="bg-background"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="point-lat">Szerokość geograficzna</Label>
            <Input
              id="point-lat"
              type="number"
              step="any"
              value={point.lat}
              onChange={(e) =>
                onPointChange({
                  ...point,
                  lat: parseFloat(e.target.value) || 0,
                })
              }
              className="bg-background"
            />
          </div>
          <div>
            <Label htmlFor="point-lng">Długość geograficzna</Label>
            <Input
              id="point-lng"
              type="number"
              step="any"
              value={point.lng}
              onChange={(e) =>
                onPointChange({
                  ...point,
                  lng: parseFloat(e.target.value) || 0,
                })
              }
              className="bg-background"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="point-has-custom-audio"
            checked={point.hasCustomAudio}
            onChange={(e) =>
              onPointChange({ ...point, hasCustomAudio: e.target.checked })
            }
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor="point-has-custom-audio" className="text-sm font-medium">
            Własne audio dla tego punktu
          </Label>
        </div>
        {point.hasCustomAudio && (
          <div>
            <Label htmlFor="point-audio-file">Plik audio</Label>
            <AudioFileInput
              id="point-audio-file"
              file={point.audioFile}
              onFileChange={(file) =>
                onPointChange({ ...point, audioFile: file })
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Format: MP3, WAV, OGG (maks. 10MB)
            </p>
          </div>
        )}
        <div>
          <Label htmlFor="point-character">Postać</Label>
          <select
            id="point-character"
            value={point.characterId || ""}
            onChange={(e) =>
              onPointChange({ 
                ...point, 
                characterId: e.target.value ? Number(e.target.value) : null 
              })
            }
            disabled={isLoadingCharacters}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Wybierz postać...</option>
            {characters.map((character) => (
              <option key={character.id} value={character.id}>
                {character.name}
              </option>
            ))}
          </select>
          {isLoadingCharacters && (
            <p className="text-xs text-muted-foreground mt-1">Ładowanie postaci...</p>
          )}
        </div>
        <div>
          <Label htmlFor="point-dialog">Dialog</Label>
          <Textarea
            id="point-dialog"
            value={point.dialog}
            onChange={(e) =>
              onPointChange({ ...point, dialog: e.target.value })
            }
            rows={3}
            placeholder="Wprowadź dialog dla tego punktu..."
            className="bg-background"
          />
        </div>
        <Button
          onClick={onSave}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          Zapisz zmiany
        </Button>
      </CardContent>
    </Card>
  )
}

export default PointEditPanel
