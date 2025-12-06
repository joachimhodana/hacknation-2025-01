import { useState} from "react"
import type { CharacterType } from "@/types/CharactersType.tsx"
import CharactersListHeader from "@/pages/CharactersPage/components/CharactersListHeader/CharactersListHeader.tsx"
import CharactersListEmpty from "@/pages/CharactersPage/components/CharactersListEmpty/CharactersListEmpty.tsx"
import CharacterCard from "@/pages/CharactersPage/components/CharacterCard/CharacterCard.tsx"
import CharactersListPagination from "@/pages/CharactersPage/components/CharactersListPagination/CharactersListPagination.tsx"

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
    lastModifiedAt: new Date(Date.now() - 86400000).toISOString(),
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

const CharactersPage = () => {
  // const [characters, setCharacters] = useState<CharacterType[]>(mockCharacters)
  const characters = mockCharacters
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
      <CharactersListHeader viewMode={viewMode} onViewModeChange={setViewMode} />

      {characters.length === 0 ? (
        <CharactersListEmpty />
      ) : (
        <>
          <div className={viewMode === "grid"
            ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            : "space-y-4"
          }>
            {currentCharacters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                viewMode={viewMode}
                formatDate={formatDate}
              />
            ))}
          </div>

          <CharactersListPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  )
}

export default CharactersPage
