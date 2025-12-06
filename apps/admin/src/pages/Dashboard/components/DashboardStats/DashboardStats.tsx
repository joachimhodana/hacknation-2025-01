import { Route, Users, CheckCircle, TrendingUp } from "lucide-react"
import GeneralInfoCustomCard from "@/components/shared/CustomCards/GeneralInfoCustomCard.tsx"

const DashboardStats = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <GeneralInfoCustomCard
        title="Wszystkie trasy"
        icon={<Route className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
        statsData={512}
        description="Aktywne projekty"
      />

      <GeneralInfoCustomCard
        title="Uczestnicy"
        icon={<Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
        statsData={215}
        description="Wszystkich uczestników"
      />

      <GeneralInfoCustomCard
        title="Ukończone"
        icon={<CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
        statsData={2137}
        description="Zakończone trasy"
      />

      <GeneralInfoCustomCard
        title="Wskaźnik ukończenia"
        icon={<TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
        statsData={69}
        description="Średnia ukończenia"
        suffix="%"
      />
    </div>
  )
}

export default DashboardStats
