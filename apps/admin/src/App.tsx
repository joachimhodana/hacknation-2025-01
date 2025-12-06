import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Navigation } from "@/components/Navigation"
import { Dashboard } from "@/pages/Dashboard"
import { RouteCreator } from "@/pages/RouteCreator"
import { Documentation } from "@/pages/Documentation"

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Navigation />
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
