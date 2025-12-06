import { Link } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card.tsx"
import { Button } from "@/components/ui/button.tsx"
import { User } from "lucide-react"

const CharactersListEmpty = () => {
  return (
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
  )
}

export default CharactersListEmpty
