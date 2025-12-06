import { useState, useEffect } from "react"
import { Route, Users, CheckCircle, TrendingUp } from "lucide-react"
import GeneralInfoCustomCard from "@/components/shared/CustomCards/GeneralInfoCustomCard.tsx"
import { getPaths } from "@/lib/api-client.ts"

const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalRoutes: 0,
    publishedRoutes: 0,
    totalDistance: 0,
    averageTime: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        const response = await getPaths()
        
        if (response.success && response.data) {
          const routes = response.data
          const totalRoutes = routes.length
          const publishedRoutes = routes.filter((r: any) => r.isPublished).length
          const totalDistance = routes.reduce((sum: number, r: any) => sum + (r.distanceMeters || 0), 0)
          const totalTime = routes.reduce((sum: number, r: any) => sum + (r.totalTimeMinutes || 0), 0)
          const averageTime = totalRoutes > 0 ? Math.round(totalTime / totalRoutes) : 0
          
          setStats({
            totalRoutes,
            publishedRoutes,
            totalDistance: Math.round(totalDistance / 1000), // Convert to km
            averageTime,
          })
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <GeneralInfoCustomCard
        title="Wszystkie trasy"
        icon={<Route className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
        statsData={stats.totalRoutes}
        description="Wszystkie utworzone trasy"
      />

      <GeneralInfoCustomCard
        title="Opublikowane"
        icon={<CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
        statsData={stats.publishedRoutes}
        description="Trasy dostępne publicznie"
      />

      <GeneralInfoCustomCard
        title="Łączna długość"
        icon={<TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
        statsData={stats.totalDistance}
        description="Suma długości wszystkich tras"
        suffix=" km"
      />

      <GeneralInfoCustomCard
        title="Średni czas"
        icon={<Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
        statsData={stats.averageTime}
        description="Średni czas trasy"
        suffix=" min"
      />
    </div>
  )
}

export default DashboardStats
