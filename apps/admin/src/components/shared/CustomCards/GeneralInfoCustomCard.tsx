import type { ReactNode} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";

type GeneralInfoCustomCardProps = {
    title: string,
    icon:ReactNode,
    statsData: number,
    description: string,
    suffix?: string
}

const GeneralInfoCustomCard = ({title, icon, statsData, description, suffix}:GeneralInfoCustomCardProps) => {
    return (
        <Card className="border-blue-800 bg-blue-950/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-blue-900 ">
                    {statsData}{suffix}
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300">{description}</p>
            </CardContent>
        </Card>
    )
}

export default GeneralInfoCustomCard