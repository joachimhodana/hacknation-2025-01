import type {ReactNode} from "react";

type InformationCardProps = {
    title: string,
    description: string,
    icon: ReactNode
}

const InformationCard = ({title, description, icon}: InformationCardProps) => {
    return (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-2">
                    {icon}
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">
                        {title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default InformationCard;
