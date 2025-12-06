import {Route} from "lucide-react";
import {Navigation} from "@/components/shared/Header/Navigation.tsx";

const Header = () => (
    <header className="border-b bg-card">
        <div className="container mx-auto px-4 w-full">
            <div className="flex h-16 items-center justify-between gap-4">
                <div className="flex items-center gap-1">
                    <Route className="h-6 w-6 text-blue-500 " />
                    <span className="text-xl font-bold text-blue-500">BydGO Admin Panel</span>
                </div>
                <Navigation/>
            </div>
        </div>
    </header>
)

export default Header;