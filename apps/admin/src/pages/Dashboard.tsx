import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Route, Users, CheckCircle, TrendingUp, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"

// Mock data - w prawdziwej aplikacji dane będą z API
const mockRoutes = [
  {
    id: 1,
    name: "Trasa po Warszawie",
    totalParticipants: 245,
    completed: 189,
    inProgress: 56,
  },
  {
    id: 2,
    name: "Szlak górski Beskidy",
    totalParticipants: 132,
    completed: 98,
    inProgress: 34,
  },
  {
    id: 3,
    name: "Wycieczka rowerowa",
    totalParticipants: 78,
    completed: 65,
    inProgress: 13,
  },
]

const totalStats = {
  totalRoutes: mockRoutes.length,
  totalParticipants: mockRoutes.reduce((sum, r) => sum + r.totalParticipants, 0),
  totalCompleted: mockRoutes.reduce((sum, r) => sum + r.completed, 0),
  completionRate: Math.round(
    (mockRoutes.reduce((sum, r) => sum + r.completed, 0) /
      mockRoutes.reduce((sum, r) => sum + r.totalParticipants, 0)) *
      100
  ),
}

type ChartDataType = "participants" | "completed" | "inProgress" | "completionRate"

export function Dashboard() {
  const [chartType, setChartType] = useState<ChartDataType>("participants")

  const getChartData = () => {
    switch (chartType) {
      case "participants":
        return mockRoutes.map((r) => ({ name: r.name, value: r.totalParticipants }))
      case "completed":
        return mockRoutes.map((r) => ({ name: r.name, value: r.completed }))
      case "inProgress":
        return mockRoutes.map((r) => ({ name: r.name, value: r.inProgress }))
      case "completionRate":
        return mockRoutes.map((r) => ({
          name: r.name,
          value: Math.round((r.completed / r.totalParticipants) * 100),
        }))
      default:
        return []
    }
  }

  const chartData = getChartData()
  const maxValue = Math.max(...chartData.map((d) => d.value), 1)

  const getChartLabel = () => {
    switch (chartType) {
      case "participants":
        return "Uczestnicy"
      case "completed":
        return "Ukończone"
      case "inProgress":
        return "W trakcie"
      case "completionRate":
        return "Wskaźnik ukończenia (%)"
      default:
        return ""
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground">Przegląd statystyk i projektów tras</p>
      </div>

      {/* Niebieska wstawka informacyjna */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 dark:bg-blue-900/40 rounded-full p-2">
            <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Panel administracyjny
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Tutaj możesz zarządzać trasami, przeglądać statystyki i monitorować aktywność użytkowników.
              Wykres poniżej można przełączać, aby wyświetlać różne metryki.
            </p>
          </div>
        </div>
      </div>

      {/* Statystyki ogólne */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wszystkie trasy</CardTitle>
            <Route className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {totalStats.totalRoutes}
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300">Aktywne projekty</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uczestnicy</CardTitle>
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {totalStats.totalParticipants}
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300">Wszystkich uczestników</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ukończone</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {totalStats.totalCompleted}
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300">Zakończone trasy</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wskaźnik ukończenia</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {totalStats.completionRate}%
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300">Średnia ukończenia</p>
          </CardContent>
        </Card>
      </div>

      {/* Wykres */}
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Wykres statystyk
              </CardTitle>
              <CardDescription className="mt-1">
                Wybierz typ danych do wyświetlenia na wykresie
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={chartType === "participants" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType("participants")}
                className={
                  chartType === "participants"
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "border-blue-200 dark:border-blue-800"
                }
              >
                Uczestnicy
              </Button>
              <Button
                variant={chartType === "completed" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType("completed")}
                className={
                  chartType === "completed"
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "border-blue-200 dark:border-blue-800"
                }
              >
                Ukończone
              </Button>
              <Button
                variant={chartType === "inProgress" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType("inProgress")}
                className={
                  chartType === "inProgress"
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "border-blue-200 dark:border-blue-800"
                }
              >
                W trakcie
              </Button>
              <Button
                variant={chartType === "completionRate" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType("completionRate")}
                className={
                  chartType === "completionRate"
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "border-blue-200 dark:border-blue-800"
                }
              >
                Wskaźnik (%)
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
              {getChartLabel()}
            </div>
            <div className="space-y-3">
              {chartData.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-semibold text-blue-900 dark:text-blue-100">
                      {item.value}
                      {chartType === "completionRate" && "%"}
                    </span>
                  </div>
                  <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(item.value / maxValue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sekcja z projektami tras */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Projekty tras</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockRoutes.map((route) => (
            <Card
              key={route.id}
              className="border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
            >
              <CardHeader>
                <CardTitle className="text-blue-900 dark:text-blue-100">{route.name}</CardTitle>
                <CardDescription>ID: {route.id}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Uczestnicy:</span>
                    <span className="font-medium text-blue-900 dark:text-blue-100">
                      {route.totalParticipants}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ukończone:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {route.completed}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">W trakcie:</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      {route.inProgress}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Wskaźnik ukończenia:</span>
                      <span className="font-bold text-blue-900 dark:text-blue-100">
                        {Math.round((route.completed / route.totalParticipants) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
