import type {ReactNode} from "react";

type InformationCardProps = {
    title: string,
    description: string,
    icon: ReactNode
}

const InformationCard = ({title, description, icon}:InformationCardProps) => {
    return(
        <div className="bg-blue-50 border border-blue-500  rounded-lg p-4">
            <div className="flex items-start gap-3">
                <div className="bg-blue-100  rounded-full p-2">
                    {icon}
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-blue-900  mb-1">
                        {title}
                    </h3>
                    <p className="text-sm text-blue-800">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default InformationCard;