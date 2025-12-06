import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import type {RoutesObjectType} from "@/types/RoutesType.tsx";

type CustomCardProps = {
    route: RoutesObjectType,
}

const StatisticsInfoCustomCard = ({route}:CustomCardProps) => {
    return(
        <Card
            key={route.id}
            className="border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
        >
            <CardHeader>
                <CardTitle className="text-blue-900">{route.name}</CardTitle>
                <CardDescription>{route.description.length > 70 ? route.description.slice(0,70)+"..." : route.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Uczestnicy:</span>
                        <span className="font-medium text-blue-600">
                      {route.totalParticipants}
                    </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Ukończone:</span>
                        <span className="font-medium text-green-600 ">
                      {route.completed}
                    </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Nieukończone:</span>
                        <span className="font-medium text-red-600 ">
                      {route.inProgress}
                    </span>
                    </div>
                    <div className="pt-2 border-t bborder-blue-800">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Wskaźnik ukończenia:</span>
                            <span className="font-bold text-blue-900 ">
                        {Math.round((route.completed / route.totalParticipants) * 100)}%
                      </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default StatisticsInfoCustomCard