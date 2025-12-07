import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import type {RoutesObjectType} from "@/types/RoutesType.tsx";

type RouteStatisticsInfoCustomCardProps = {
    route: RoutesObjectType,
}

const RouteStatisticsInfoCustomCard = ({route}:RouteStatisticsInfoCustomCardProps) => {

    const description = route.shortDescription.length > 70 ? route.shortDescription.slice(0,70)+"..." : route.shortDescription

    return(
        <Card
            key={route.pathId}
            className="border-border hover:border-primary transition-colors"
        >
            <CardHeader>
                <CardTitle className="text-primary">{route.title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Czas trasy:</span>
                        <span className="font-medium text-primary">
                            {route.totalTimeMinutes}min
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Ilość przystanków:</span>
                        <span className="font-medium text-foreground">
                            {route.stops.length}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Trudność:</span>
                        <span className="font-medium text-destructive">
                            {route.difficulty}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default RouteStatisticsInfoCustomCard