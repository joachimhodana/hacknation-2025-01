import { Link, useLocation } from "react-router-dom"
import { Home, Route, FileText } from "lucide-react"
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
  NavigationMenuContent,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu.tsx"
import { cn } from "@/lib/utils"

export function Navigation() {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <NavigationMenu>
      <NavigationMenuList className={"text-blue-500"}>
        <NavigationMenuItem >
          <Link 
            to="/" 
            className={cn(
              navigationMenuTriggerStyle(), 
              "gap-2",
              isActive("/") && "underline underline-offset-4"
            )}
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
            <NavigationMenuTrigger className="gap-2">
              <Route className="h-4 w-4" />
              Trasy
            </NavigationMenuTrigger>
            <NavigationMenuContent >
              <ul className="grid w-[200px] gap-1 p-2 text-gray-500">
                <li>
                  <NavigationMenuLink asChild>
                    <Link to="/routes/create">Stwórz trasę</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild >
                    <Link to="/routes/list">Lista tras</Link>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link 
            to="/documentation" 
            className={cn(
              navigationMenuTriggerStyle(), 
              "gap-2",
              isActive("/documentation") && "underline underline-offset-4"
            )}
          >
            <FileText className="h-4 w-4" />
            Dokumentacja
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

