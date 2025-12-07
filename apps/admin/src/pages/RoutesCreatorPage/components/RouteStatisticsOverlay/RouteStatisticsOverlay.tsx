import { Icon } from "@iconify/react"

type RouteStatisticsOverlayProps = {
  routeDistance: number
  formattedTime: string
}

const RouteStatisticsOverlay = ({ routeDistance, formattedTime }: RouteStatisticsOverlayProps) => {
  return (
    <div className="absolute bottom-4 right-4 bg-background/95 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-border z-[1000]">
      <div className="space-y-4">
        {/* Distance */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Icon icon="solar:route-bold-duotone" className="h-4 w-4 text-foreground" />
            <span className="text-sm font-medium text-foreground">Długość trasy</span>
          </div>
          <div className="text-lg font-semibold text-neutral-900 tracking-tight">
            {routeDistance.toFixed(2)} km
          </div>
        </div>

        {/* Time */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Icon icon="solar:clock-circle-bold-duotone" className="h-4 w-4 text-foreground" />
            <span className="text-sm font-medium text-foreground">Szacowany czas</span>
          </div>
          <div className="text-lg font-semibold text-neutral-900 tracking-tight">
            {formattedTime}
          </div>
        </div>
        <div className="text-xs text-muted-foreground pt-2 border-t border-border">
          (przy prędkości 3 km/h)
        </div>
      </div>
    </div>
  )
}

export default RouteStatisticsOverlay
