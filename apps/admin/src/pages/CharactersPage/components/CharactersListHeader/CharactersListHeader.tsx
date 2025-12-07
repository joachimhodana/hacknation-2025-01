import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button.tsx"
import { Plus, Grid3x3, List } from "lucide-react"

type ViewMode = "grid" | "list"

interface CharactersListHeaderProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

const CharactersListHeader = ({ viewMode, onViewModeChange }: CharactersListHeaderProps) => {
  return (
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
            onClick={() => onViewModeChange("grid")}
            className={viewMode === "grid" ? "bg-primary hover:bg-primary/90 text-primary-foreground" : ""}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("list")}
            className={viewMode === "list" ? "bg-primary hover:bg-primary/90 text-primary-foreground" : ""}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
        <Link to="/characters/create">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            <Plus className="h-4 w-4" />
            Nowa postać
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default CharactersListHeader
