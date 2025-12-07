import { Link, useLocation } from "react-router-dom"
import { Icon } from "@iconify/react"
import { User } from "lucide-react"
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
  NavigationMenuContent,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu.tsx"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"

export function Navigation() {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  const handleLogout = async () => {
    try {
      await authClient.signOut()
      window.location.href = "/"
    } catch (error) {
      console.error("Logout error:", error)
      window.location.href = "/"
    }
  }

  return (
    <NavigationMenu>
      <NavigationMenuList className="text-primary">
        
        <NavigationMenuItem>
          <Link
            to="/"
            className={cn(
              navigationMenuTriggerStyle(),
              "gap-2",
              isActive("/") && "bg-accent text-foreground"
            )}
          >
            <Icon icon="solar:home-bold-duotone" className="h-4 w-4 text-primary" />
            Home
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger className="gap-2 text-foreground">
            <Icon icon="solar:route-bold-duotone" className="h-4 w-4 text-primary" />
            Trasy
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[200px] gap-1 p-2 text-muted-foreground">
              <li>
                <NavigationMenuLink asChild>
                  <Link to="/routes" className="hover:text-foreground">
                    Lista tras
                  </Link>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <Link to="/routes/create" className="hover:text-foreground">
                    Stwórz trasę
                  </Link>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger className="gap-2 text-foreground">
            <User className="h-4 w-4 text-primary" />
            Postacie
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[200px] gap-1 p-2 text-muted-foreground">
              <li>
                <NavigationMenuLink asChild>
                  <Link to="/characters" className="hover:text-foreground">
                    Lista postaci
                  </Link>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <Link to="/characters/create" className="hover:text-foreground">
                    Stwórz postać
                  </Link>
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
              isActive("/documentation") &&
                "bg-accent text-foreground"
            )}
          >
            <Icon icon="solar:document-bold-duotone" className="h-4 w-4 text-primary" />
            Dokumentacja
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="gap-2 text-destructive hover:text-destructive/80"
          >
            <Icon icon="solar:logout-bold-duotone" className="h-4 w-4" />
            Logout
          </Button>
        </NavigationMenuItem>

      </NavigationMenuList>
    </NavigationMenu>
  )
}
