import { useState } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx"
import { Button } from "@/components/ui/button.tsx"
import { MapPin, Edit, Plus, Grid3x3, List, User } from "lucide-react"
import type { CharacterType } from "@/types/CharactersType.tsx"

// Mock data - w prawdziwej aplikacji dane będą z API
const mockCharacters: CharacterType[] = [
  {
    id: "1",
    name: "Historyk",
    avatar: null as any,
    createdBy: "admin",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    lastModifiedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    deafultPosition: {
      latitude: 52.2297,
      longitude: 21.0122,
      description: "Muzeum Historii"
    }
  },
  {
    id: "2",
    name: "Przewodnik",
    avatar: null as any,
    createdBy: "admin",
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    lastModifiedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    deafultPosition: {
      latitude: 52.2300,
      longitude: 21.0130,
      description: "Centrum miasta"
    }
  },
  {
    id: "3",
    name: "Mieszkaniec",
    avatar: null as any,
    createdBy: "admin",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    lastModifiedAt: new Date(Date.now() - 3600000).toISOString(),
    deafultPosition: null as any,
  },
]

const ITEMS_PER_PAGE = 6

type ViewMode = "grid" | "list"

const CharactersListPage = () => {
  const [characters, setCharacters] = useState<CharacterType[]>(mockCharacters)
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<ViewMode>("grid")

  const totalPages = Math.ceil(characters.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentCharacters = characters.slice(startIndex, endIndex)

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lista postaci</h1>
          <p className="text-muted-foreground">Zarządzaj wszystkimi postaciami</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border rounded-md p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Link to="/characters/create">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Plus className="h-4 w-4" />
              Nowa postać
            </Button>
          </Link>
        </div>
      </div>

      {characters.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Brak postaci. Stwórz pierwszą postać!</p>
            <Link to="/characters/create">
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                Stwórz postać
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className={viewMode === "grid"
            ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            : "space-y-4"
          }>
            {currentCharacters.map((character) => (
              <Card key={character.id} className={`hover:shadow-lg transition-shadow ${
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
                      {character.deafultPosition ? (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          <span className="text-muted-foreground">
                            {character.deafultPosition.latitude.toFixed(4)}, {character.deafultPosition.longitude.toFixed(4)}
                          </span>
                          {character.deafultPosition.description && (
                            <span className="text-muted-foreground">- {character.deafultPosition.description}</span>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          Brak pozycji domyślnej
                        </div>
                      )}
                    </div>

                    <div className={`text-xs text-muted-foreground ${viewMode === "list" ? "mt-2" : "border-t pt-3"}`}>
                      Ostatnia edycja: {formatDate(character.lastModifiedAt)}
                    </div>

                    <div className={`flex gap-2 ${viewMode === "list" ? "mt-4" : "pt-2"}`}>
                      <Link to={`/characters/create?edit=${character.id}`} className="flex-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                          Edytuj
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>

          {/* Paginacja */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Poprzednia
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={currentPage === page ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Następna
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default CharactersListPage
