import { Icon } from "@iconify/react"

type RouteStepsHeaderProps = {
  editPathId: string | null
  currentStep: 1 | 2
}

const RouteStepsHeader = ({ editPathId, currentStep }: RouteStepsHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-xl font-bold">
          {editPathId ? "Edytuj trasę" : "Kreator trasy"}
        </h2>
        {editPathId && (
          <p className="text-sm text-muted-foreground">ID: {editPathId}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-1 px-2 py-1 rounded ${currentStep === 1 ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-600'}`}>
          <Icon icon="solar:check-circle-bold-duotone" className={`h-4 w-4 ${currentStep === 1 ? 'text-blue-600' : 'text-gray-400'}`} />
          <span className="text-sm font-medium">Krok 1</span>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded ${currentStep === 2 ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-600'}`}>
          <Icon icon="solar:check-circle-bold-duotone" className={`h-4 w-4 ${currentStep === 2 ? 'text-blue-600' : 'text-gray-400'}`} />
          <span className="text-sm font-medium">Krok 2</span>
        </div>
      </div>
    </div>
  )
}

export default RouteStepsHeader
