import { BarChart3 } from "lucide-react"
import { Icon } from "@iconify/react"
import InformationCard from "@/components/shared/CustomCards/InformationCard/InformationCard.tsx"
import DashboardHeader from "@/pages/Dashboard/components/DashboardHeader/DashboardHeader.tsx"
import DashboardStats from "./components/DashboardStats/DashboardStats"
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
          description={"Tutaj możesz zarządzać trasami, przeglądać statystyki i monitorować aktywność użytkowników. \n Wykres poniżej można przełączać, aby wyświetlać różne metryki."}
          icon={<Icon icon="solar:chart-2-bold-duotone" className="h-5 w-5 text-blue-600" />}
      />

      <DashboardStats />

      {/* Wykres */}
      {/*<Card className="border-blue-200 dark:border-blue-800">*/}
      {/*  <CardHeader>*/}
      {/*    <div className="flex items-center justify-between">*/}
      {/*      <div>*/}
      {/*        <CardTitle className="flex items-center gap-2">*/}
      {/*          <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />*/}
      {/*          Wykres statystyk*/}
      {/*        </CardTitle>*/}
      {/*        <CardDescription className="mt-1">*/}
      {/*          Wybierz typ danych do wyświetlenia na wykresie*/}
      {/*        </CardDescription>*/}
      {/*      </div>*/}
      {/*      <div className="flex gap-2">*/}
      {/*        <Button*/}
      {/*          variant={chartType === "participants" ? "default" : "outline"}*/}
      {/*          size="sm"*/}
      {/*          onClick={() => setChartType("participants")}*/}
      {/*          className={*/}
      {/*            chartType === "participants"*/}
      {/*              ? "bg-blue-600 hover:bg-blue-700 text-white"*/}
      {/*              : "border-blue-200 dark:border-blue-800"*/}
      {/*          }*/}
      {/*        >*/}
      {/*          Uczestnicy*/}
      {/*        </Button>*/}
      {/*        <Button*/}
      {/*          variant={chartType === "completed" ? "default" : "outline"}*/}
      {/*          size="sm"*/}
      {/*          onClick={() => setChartType("completed")}*/}
      {/*          className={*/}
      {/*            chartType === "completed"*/}
      {/*              ? "bg-blue-600 hover:bg-blue-700 text-white"*/}
      {/*              : "border-blue-200 dark:border-blue-800"*/}
      {/*          }*/}
      {/*        >*/}
      {/*          Ukończone*/}
      {/*        </Button>*/}
      {/*        <Button*/}
      {/*          variant={chartType === "inProgress" ? "default" : "outline"}*/}
      {/*          size="sm"*/}
      {/*          onClick={() => setChartType("inProgress")}*/}
      {/*          className={*/}
      {/*            chartType === "inProgress"*/}
      {/*              ? "bg-blue-600 hover:bg-blue-700 text-white"*/}
      {/*              : "border-blue-200 dark:border-blue-800"*/}
      {/*          }*/}
      {/*        >*/}
      {/*          W trakcie*/}
      {/*        </Button>*/}
      {/*        <Button*/}
      {/*          variant={chartType === "completionRate" ? "default" : "outline"}*/}
      {/*          size="sm"*/}
      {/*          onClick={() => setChartType("completionRate")}*/}
      {/*          className={*/}
      {/*            chartType === "completionRate"*/}
      {/*              ? "bg-blue-600 hover:bg-blue-700 text-white"*/}
      {/*              : "border-blue-200 dark:border-blue-800"*/}
      {/*          }*/}
      {/*        >*/}
      {/*          Wskaźnik (%)*/}
      {/*        </Button>*/}
      {/*      </div>*/}
      {/*    </div>*/}
      {/*  </CardHeader>*/}
        {/*Chart component*/}
      {/*  <CardContent>*/}
      {/*    <div className="space-y-4">*/}
      {/*      <div className="text-sm font-medium text-blue-900 dark:text-blue-100">*/}
      {/*        {getChartLabel()}*/}
      {/*      </div>*/}
      {/*      <div className="space-y-3">*/}
      {/*        {chartData.map((item, index) => (*/}
      {/*          <div key={index} className="space-y-1">*/}
      {/*            <div className="flex justify-between text-sm">*/}
      {/*              <span className="text-muted-foreground">{item.name}</span>*/}
      {/*              <span className="font-semibold text-blue-900 dark:text-blue-100">*/}
      {/*                {item.value}*/}
      {/*                {chartType === "completionRate" && "%"}*/}
      {/*              </span>*/}
      {/*            </div>*/}
      {/*            <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-full h-3 overflow-hidden">*/}
      {/*              <div*/}
      {/*                className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-500"*/}
      {/*                style={{ width: `${(item.value / maxValue) * 100}%` }}*/}
      {/*              />*/}
      {/*            </div>*/}
      {/*          </div>*/}
      {/*        ))}*/}
      {/*      </div>*/}
      {/*    </div>*/}
      {/*  </CardContent>*/}
      {/*</Card>*/}

      <DashboardRoutes />
    </div>
  )
}

export default DashboardPage