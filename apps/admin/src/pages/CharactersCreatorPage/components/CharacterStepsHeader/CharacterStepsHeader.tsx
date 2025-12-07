import { CheckCircle2 } from "lucide-react"

type CharacterStepsHeaderProps = {
  editCharacterId: string | null
  currentStep: 1 | 2
}

const CharacterStepsHeader = ({ editCharacterId, currentStep }: CharacterStepsHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-xl font-bold">
          {editCharacterId ? "Edytuj postać" : "Kreator postaci"}
        </h2>
        {editCharacterId && (
          <p className="text-sm text-muted-foreground">ID: {editCharacterId}</p>
        )}
      </div>
    </div>
  )
}

export default CharacterStepsHeader
