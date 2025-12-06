import { Link, useLocation } from "react-router-dom"
import { Home, Route, FileText, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"

export function Navigation() {
  const location = useLocation()
  const [routesOpen, setRoutesOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isActive = (path: string) => location.pathname === path
  const isRoutesActive = location.pathname.startsWith("/routes")

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setRoutesOpen(false)
      }
    }

    if (routesOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [routesOpen])

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center gap-4">
          <div className="flex items-center gap-1">
            <Route className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span className="text-xl font-bold text-blue-900 dark:text-blue-100">Admin Panel</span>
          </div>
          
          <div className="flex flex-1 items-center gap-1">
            <Link to="/">
              <Button
                variant={isActive("/") ? "default" : "ghost"}
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
            </Link>

            <div className="relative" ref={dropdownRef}>
              <Button
                variant={isRoutesActive ? "default" : "ghost"}
                className="gap-2"
                onClick={() => setRoutesOpen(!routesOpen)}
              >
                <Route className="h-4 w-4" />
                Trasy
                <ChevronDown className="h-4 w-4" />
              </Button>
              
              {routesOpen && (
                <div className="absolute left-0 top-full mt-1 w-48 rounded-md border bg-card shadow-lg z-50">
                  <Link to="/routes/create" onClick={() => setRoutesOpen(false)}>
                    <div className="px-4 py-2 hover:bg-accent cursor-pointer rounded-t-md">
                      Stwórz trasę
                    </div>
                  </Link>
                </div>
              )}
            </div>

            <Link to="/documentation">
              <Button
                variant={isActive("/documentation") ? "default" : "ghost"}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                Dokumentacja
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

