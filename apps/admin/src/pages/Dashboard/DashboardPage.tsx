import { BarChart3 } from "lucide-react"
import { Icon } from "@iconify/react"
import InformationCard from "@/components/shared/CustomCards/InformationCard/InformationCard.tsx"
import DashboardStats from "@/pages/Dashboard/components/DashboardStats/DashboardStats.tsx"
import DashboardRoutes from "@/pages/Dashboard/components/DashboardRoutes/DashboardRoutes.tsx"



// const totalStats = {
//   totalRoutes: mockRoutes.length,
//   totalParticipants: mockRoutes.reduce((sum, r) => sum + r.totalParticipants, 0),
//   totalCompleted: mockRoutes.reduce((sum, r) => sum + r.completed, 0),
//   completionRate: Math.round(
//     (mockRoutes.reduce((sum, r) => sum + r.completed, 0) /
//       mockRoutes.reduce((sum, r) => sum + r.totalParticipants, 0)) *
//       100
//   ),
// }

// type ChartDataType = "participants" | "completed" | "inProgress" | "completionRate"

const DashboardPage = () => {
  // const [chartType, setChartType] = useState<ChartDataType>("participants")

  // const getChartData = () => {
  //   switch (chartType) {
  //     case "participants":
  //       return mockRoutes.map((r) => ({ name: r.name, value: r.totalParticipants }))
  //     case "completed":
  //       return mockRoutes.map((r) => ({ name: r.name, value: r.completed }))
  //     case "inProgress":
  //       return mockRoutes.map((r) => ({ name: r.name, value: r.inProgress }))
  //     case "completionRate":
  //       return mockRoutes.map((r) => ({
  //         name: r.name,
  //         value: Math.round((r.completed / r.totalParticipants) * 100),
  //       }))
  //     default:
  //       return []
  //   }
  // }

  // const chartData = getChartData()
  // const maxValue = Math.max(...chartData.map((d) => d.value), 1)

  // const getChartLabel = () => {
  //   switch (chartType) {
  //     case "participants":
  //       return "Uczestnicy"
  //     case "completed":
  //       return "Ukończone"
  //     case "inProgress":
  //       return "W trakcie"
  //     case "completionRate":
  //       return "Wskaźnik ukończenia (%)"
  //     default:
  //       return ""
  //   }
  // }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <DashboardHeader />

      <InformationCard
        title={"Panel administracyjny"}
        description={"Tutaj możesz zarządzać trasami, przeglądać statystyki i monitorować aktywność użytkowników."}
        icon={
          <Icon
            icon="solar:chart-2-bold-duotone"
            className="h-5 w-5 text-primary"
          />
        }
      />

      {/* Statystyki ogólne */}
      <DashboardStats />

      {/* Sekcja z projektami tras */}
      <DashboardRoutes />
    </div>
  )
}

export default DashboardPage