import { Icon } from "@iconify/react"
import InformationCard from "@/components/shared/CustomCards/InformationCard/InformationCard.tsx"
import DashboardStats from "@/pages/Dashboard/components/DashboardStats/DashboardStats.tsx"
import DashboardRoutes from "@/pages/Dashboard/components/DashboardRoutes/DashboardRoutes.tsx"

const DashboardPage = () => {

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground">Przegląd statystyk i projektów tras</p>
      </div>

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