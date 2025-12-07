import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx"
import { Button } from "@/components/ui/button.tsx"
import { Edit, User, X } from "lucide-react"
import type { CharacterType } from "@/types/CharactersType.tsx"
import { getBackendImageUrl } from "@/lib/image-utils.ts"

interface CharacterCardProps {
  character: CharacterType
  viewMode: "grid" | "list"
  formatDate: (timestamp: string) => string
  onDelete?: (id: number) => void
}

const CharacterCard = ({ character, viewMode, formatDate, onDelete }: CharacterCardProps) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (window.confirm(`Czy na pewno chcesz usunąć postać "${character.name}"? Ta operacja jest nieodwracalna.`)) {
      onDelete?.(character.id)
    }
  }

  const avatarUrl = character.avatarUrl ? getBackendImageUrl(character.avatarUrl) : null

  return (
    <Card className={`hover:shadow-lg transition-shadow relative ${
      viewMode === "list" ? "flex" : ""
    }`}>
      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 z-10"
          onClick={handleDelete}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      {viewMode === "list" && (
        <div className="w-48 h-48 bg-gray-100 rounded-l-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={character.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
                const parent = (e.target as HTMLImageElement).parentElement
                if (parent) {
                  parent.innerHTML = '<div class="flex items-center justify-center w-full h-full"><svg class="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div>'
                }
              }}
            />
          ) : (
            <User className="h-12 w-12 text-gray-400" />
          )}
        </div>
      )}
      {viewMode === "grid" && avatarUrl && (
        <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden rounded-t-lg">
          <img 
            src={avatarUrl} 
            alt={character.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
      )}
      <div className={viewMode === "list" ? "flex-1 flex flex-col" : ""}>
        <CardHeader>
          <div className={`flex items-start justify-between ${viewMode === "list" ? "flex-row" : ""}`}>
            <div className="flex-1">
              <CardTitle className={`${viewMode === "list" ? "text-xl" : "text-lg"} mb-2 ${onDelete ? "pr-10" : ""}`}>
                {character.name}
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className={`${viewMode === "list" ? "flex-1 flex flex-col justify-between" : "space-y-4"}`}>
          <div className={viewMode === "list"
            ? "flex items-center gap-6 flex-wrap"
            : "space-y-2"
          }>
            {character.description ? (
              <div className="text-sm text-muted-foreground">
                {character.description}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Brak opisu
              </div>
            )}
          </div>

          <div className={`text-xs text-muted-foreground ${viewMode === "list" ? "mt-2" : "border-t pt-3"}`}>
            Ostatnia edycja: {formatDate(character.updatedAt)}
          </div>

          <div className={`flex gap-2 ${viewMode === "list" ? "mt-4" : "pt-2"}`}>
            <Link to={`/characters/create?edit=${character.id}`} className="flex-1">
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/5"
              >
                <Edit className="h-4 w-4" />
                Edytuj
              </Button>
            </Link>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

export default CharacterCard
