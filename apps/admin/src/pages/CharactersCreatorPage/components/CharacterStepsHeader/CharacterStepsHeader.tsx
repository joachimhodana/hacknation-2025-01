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
      <div className="flex items-center gap-2">
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded ${currentStep === 1 ? "bg-blue-100 text-blue-900" : "bg-gray-100 text-gray-600"}`}
        >
          <CheckCircle2 className={`h-4 w-4 ${currentStep === 1 ? "text-blue-600" : "text-gray-400"}`} />
          <span className="text-sm font-medium">Krok 1</span>
        </div>
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded ${currentStep === 2 ? "bg-blue-100 text-blue-900" : "bg-gray-100 text-gray-600"}`}
        >
          <CheckCircle2 className={`h-4 w-4 ${currentStep === 2 ? "text-blue-600" : "text-gray-400"}`} />
          <span className="text-sm font-medium">Krok 2</span>
        </div>
      </div>
    </div>
  )
}

export default CharacterStepsHeader
