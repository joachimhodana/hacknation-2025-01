import { mockedRoutesObject } from "@/mocked/MockedRoutes.ts"
import type { RoutesObjectType } from "@/types/RoutesType.tsx"
import DashboardCustomStatsCard from "@/pages/Dashboard/components/DashboardCustomStatsCard/DashboardCustomStatsCard.tsx"

const DashboardRoutes = () => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Projekty tras</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockedRoutesObject.map((route: RoutesObjectType) => (
          <DashboardCustomStatsCard route={route} key={route.pathId} />
        ))}
      </div>
    </div>
  )
}

export default DashboardRoutes
