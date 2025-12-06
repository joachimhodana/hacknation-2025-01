import { BrowserRouter, Routes, Route } from "react-router-dom"
import DashboardPage from "@/pages/Dashboard/DashboardPage.tsx"
import RouteCreatorPage  from "@/pages/RouteCreator/RouteCreatorPage.tsx"
import { Documentation } from "@/pages/Documentation"
import Header from "@/components/shared/Header/Header.tsx";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Header />
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/routes/create" element={<RouteCreatorPage />} />
          <Route path="/documentation" element={<Documentation />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
