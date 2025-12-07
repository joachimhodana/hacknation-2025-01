import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx"
import { Button } from "@/components/ui/button.tsx"
import { MapPin, Edit, User } from "lucide-react"
import type { CharacterType } from "@/types/CharactersType.tsx"

interface CharacterCardProps {
  character: CharacterType
  viewMode: "grid" | "list"
  formatDate: (timestamp: string) => string
}

const CharacterCard = ({ character, viewMode, formatDate }: CharacterCardProps) => {
  return (
    <Card className={`hover:shadow-lg transition-shadow ${
      viewMode === "list" ? "flex" : ""
    }`}>
      {viewMode === "list" && (
        <div className="w-48 h-48 bg-gray-100 rounded-l-lg flex items-center justify-center flex-shrink-0">
          <User className="h-12 w-12 text-gray-400" />
        </div>
      )}
      <div className={viewMode === "list" ? "flex-1 flex flex-col" : ""}>
        <CardHeader>
          <div className={`flex items-start justify-between ${viewMode === "list" ? "flex-row" : ""}`}>
            <div className="flex-1">
              <CardTitle className={`${viewMode === "list" ? "text-xl" : "text-lg"} mb-2`}>
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
            {character.avatarUrl && (
              <div className="text-xs text-muted-foreground">
                Avatar: {character.avatarUrl}
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
