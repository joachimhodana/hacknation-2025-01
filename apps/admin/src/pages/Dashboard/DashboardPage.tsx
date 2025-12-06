
import { Route, Users, CheckCircle, TrendingUp, BarChart3 } from "lucide-react"
import GeneralInfoCustomCard from "@/components/shared/CustomCards/GeneralInfoCustomCard.tsx"
import RouteStatisticsInfoCustomCard from "@/components/shared/CustomCards/RouteStatisticsInfoCustomCard.tsx";
import InformationCard from "@/components/shared/CustomCards/InformationCard/InformationCard.tsx";

import {mockedRoutesObject} from "@/mocked/MockedRoutes.ts";
import type {RoutesObjectType} from "@/types/RoutesType.tsx";



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
      <div>
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground">Przegląd statystyk i projektów tras</p>
      </div>

      <InformationCard
          title={"Panel administracyjny"}
          description={"Tutaj możesz zarządzać trasami, przeglądać statystyki i monitorować aktywność użytkowników. \n Wykres poniżej można przełączać, aby wyświetlać różne metryki."}
          icon={<BarChart3 className="h-5 w-5 text-blue-600" />}
      />

      {/* Statystyki ogólne */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <GeneralInfoCustomCard
          title="Wszystkie trasy"
          icon={<Route className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
          // statsData={totalStats.totalRoutes}
          statsData={512}
          description="Aktywne projekty"
        />

        <GeneralInfoCustomCard
          title="Uczestnicy"
          icon={<Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
          statsData={215}
          // statsData={totalStats.totalParticipants}
          description="Wszystkich uczestników"
        />

        <GeneralInfoCustomCard
          title="Ukończone"
          icon={<CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
          // statsData={totalStats.totalCompleted}
          statsData={2137}
          description="Zakończone trasy"
        />

        <GeneralInfoCustomCard
          title="Wskaźnik ukończenia"
          icon={<TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
          statsData={69}
          // statsData={totalStats.completionRate}
          description="Średnia ukończenia"
          suffix="%"
        />
      </div>

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

      {/* Sekcja z projektami tras */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Projekty tras</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockedRoutesObject.map((route: RoutesObjectType) => (
              <RouteStatisticsInfoCustomCard route={route} key={route.pathId}/>
              ))}
        </div>
      </div>
    </div>
  )
}

export default DashboardPage