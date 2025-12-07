import { useEffect, useRef } from "react"
import { Icon } from "@iconify/react"
import { useSession } from "@/lib/auth-client"
import { authClient } from "@/lib/auth-client"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"

interface ProfilePanelProps {
  isOpen: boolean
  onClose: () => void
}

export function ProfilePanel({ isOpen, onClose }: ProfilePanelProps) {
  const { data: session } = useSession()
  const navigate = useNavigate()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    console.log("ProfilePanel render", { isOpen, hasSession: !!session })
  }, [isOpen, session])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  const handleLogout = async () => {
    await authClient.signOut()
    navigate("/login")
  }

  const user = session?.user
  const userName = user?.name as string | undefined
  const initials = userName
    ? userName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U"

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 opacity-100"
        style={{ zIndex: 9999 }}
        onClick={onClose}
      />

      {/* Profile Panel */}
      <div
        ref={panelRef}
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-[10000] transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ zIndex: 10000 }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profil</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Icon icon="solar:close-circle-bold-duotone" className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Profile Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-20 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {initials}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {userName || "Użytkownik"}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {(user?.email as string | undefined) || "brak email"}
                  </p>
                  {user?.role && (
                    <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      {(user.role as string) === "admin" ? "Administrator" : (user.role as string)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">0</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Trasy</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">0</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Postacie</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">0</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Punkty</div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  navigate("/")
                  onClose()
                }}
                className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
              >
                <Icon icon="solar:home-bold-duotone" className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-gray-900 dark:text-white">Dashboard</span>
              </button>

              <button
                onClick={() => {
                  navigate("/routes")
                  onClose()
                }}
                className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
              >
                <Icon icon="solar:route-bold-duotone" className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-gray-900 dark:text-white">Trasy</span>
              </button>

              <button
                onClick={() => {
                  navigate("/characters")
                  onClose()
                }}
                className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
              >
                <Icon icon="solar:user-bold-duotone" className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-gray-900 dark:text-white">Postacie</span>
              </button>

              <button
                onClick={() => {
                  navigate("/documentation")
                  onClose()
                }}
                className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
              >
                <Icon icon="solar:document-bold-duotone" className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-gray-900 dark:text-white">Dokumentacja</span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-800">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full gap-2 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Icon icon="solar:logout-bold-duotone" className="h-5 w-5" />
              Wyloguj się
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

