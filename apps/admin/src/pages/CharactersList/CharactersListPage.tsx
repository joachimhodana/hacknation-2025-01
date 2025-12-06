import { useState, useEffect } from "react"
import type { CharacterType } from "@/types/CharactersType.tsx"
import { getCharacters } from "@/services/charactersApi.ts"
import CharactersListHeader from "@/pages/CharactersPage/components/CharactersListHeader/CharactersListHeader.tsx"
import CharactersListEmpty from "@/pages/CharactersPage/components/CharactersListEmpty/CharactersListEmpty.tsx"
import CharacterCard from "@/pages/CharactersPage/components/CharacterCard/CharacterCard.tsx"
import CharactersListPagination from "@/pages/CharactersPage/components/CharactersListPagination/CharactersListPagination.tsx"

const ITEMS_PER_PAGE = 6

type ViewMode = "grid" | "list"

const CharactersListPage = () => {
  const [characters, setCharacters] = useState<CharacterType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<ViewMode>("grid")

  // Fetch characters from API
  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getCharacters()
        setCharacters(data)
      } catch (err) {
        console.error("Failed to fetch characters:", err)
        setError(err instanceof Error ? err.message : "Nie udało się załadować postaci")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCharacters()
  }, [])

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

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <CharactersListHeader viewMode={viewMode} onViewModeChange={setViewMode} />
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Ładowanie postaci...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <CharactersListHeader viewMode={viewMode} onViewModeChange={setViewMode} />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    )
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

export default CharactersListPage
