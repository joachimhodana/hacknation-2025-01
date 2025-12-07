import { useState } from "react"
import { useSession } from "@/lib/auth-client"
import { ProfilePanel } from "./ProfilePanel"

export function FloatingProfileButton() {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const { data: session } = useSession()

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

  // Debug - sprawdź czy komponent się renderuje
  console.log("FloatingProfileButton render", { hasSession: !!session, initials })

  return (
    <>
      {/* Floating Profile Button */}
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          console.log("Profile button clicked!", { isProfileOpen })
          setIsProfileOpen(true)
        }}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center z-[9998] group hover:scale-110 cursor-pointer border-4 border-background"
        style={{ 
          zIndex: 9998,
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
        }}
        aria-label="Otwórz profil"
        type="button"
      >
        <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center text-xl font-bold text-white">
          {initials}
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 shadow-lg"></div>
      </button>

      {/* Profile Panel */}
      <ProfilePanel isOpen={isProfileOpen} onClose={() => {
        console.log("Closing profile panel")
        setIsProfileOpen(false)
      }} />
    </>
  )
}

