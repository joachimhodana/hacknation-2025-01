import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import DashboardPage from "@/pages/Dashboard/DashboardPage.tsx"
import RoutesCreatorPage  from "@/pages/RoutesCreatorPage/RoutesCreatorPage.tsx"
import RoutesListPage from "@/pages/RoutesList/RoutesListPage.tsx"
import CharactersCreatorPage from "@/pages/CharactersCreatorPage/CharactersCreatorPage.tsx"
import CharactersListPage from "@/pages/CharactersPage/CharactersPage.tsx"
import { Documentation } from "@/pages/Documentation"
// import { Login } from "@/pages/Login/Login"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import Header from "@/components/shared/Header/Header.tsx";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Routes>
          {/*<Route path="/login" element={<Login />} />*/}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Header />
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/routes" element={<RoutesListPage />} />
                  <Route path="/routes/create" element={<RoutesCreatorPage />} />
                  <Route path="/characters" element={<CharactersListPage />} />
                  <Route path="/characters/create" element={<CharactersCreatorPage />} />
                  <Route path="/documentation" element={<Documentation />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
