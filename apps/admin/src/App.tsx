import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Dashboard } from "@/pages/Dashboard/Dashboard.tsx"
import { RouteCreator } from "@/pages/RouteCreator"
import { Documentation } from "@/pages/Documentation"
import Header from "@/components/shared/Header/Header.tsx";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Header />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/routes/create" element={<RouteCreator />} />
          <Route path="/documentation" element={<Documentation />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
