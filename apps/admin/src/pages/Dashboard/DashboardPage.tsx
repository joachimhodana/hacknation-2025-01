import { Icon } from "@iconify/react"
import InformationCard from "@/components/shared/CustomCards/InformationCard/InformationCard.tsx"
import DashboardStats from "@/pages/Dashboard/components/DashboardStats/DashboardStats.tsx"
import DashboardRoutes from "@/pages/Dashboard/components/DashboardRoutes/DashboardRoutes.tsx"
import DashboardHeader from "@/pages/Dashboard/components/DashboardHeader/DashboardHeader.tsx"

const DashboardPage = () => {

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

      <DashboardStats />

      <DashboardRoutes />
    </div>
  )
}

export default DashboardPage