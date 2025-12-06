import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import type {RoutesObjectType} from "@/types/RoutesType.tsx";

type CustomCardProps = {
    route: RoutesObjectType,
}

const StatisticsInfoCustomCard = ({route}:CustomCardProps) => {

    const description = route.theme.length > 70 ? route.theme.slice(0,70)+"..." : route.theme

    return(
        <Card
            key={route.route_id}
            className="border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
        >
            <CardHeader>
                <CardTitle className="text-blue-900">{route.title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Czas trasy:</span>
                        <span className="font-medium text-blue-600">
                      {route.total_time_minutes}min
                    </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Ilość przystanków:</span>
                        <span className="font-medium text-green-600 ">
                      {route.stops.length}
                    </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Trudność:</span>
                        <span className="font-medium text-red-600 ">
                      {route.difficulty}
                    </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default StatisticsInfoCustomCard