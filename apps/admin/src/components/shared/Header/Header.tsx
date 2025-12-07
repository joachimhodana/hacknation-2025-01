import { Link } from "react-router-dom";
import {Navigation} from "@/components/shared/Header/Navigation.tsx";

const Header = () => (
    <header className="border-b bg-card">
        <div className="container mx-auto px-4 w-full">
            <div className="flex h-16 items-center justify-between gap-4">
                <Link to="/" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                    <img src="/logo.png" alt="BydGO Logo" className="h-6 w-6" />
                    <span className="text-xl font-bold text-primary">BydGO Admin Panel</span>
                </Link>
                <Navigation/>
            </div>
        </div>
    </header>
)

export default Header;