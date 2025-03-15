import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ProtectedRoute } from "./components/protected-route"
import Login from "./pages/Login"
import TankControl from "./pages/TankControl"
import History from "./pages/History"
import TankExplanation from "./pages/TankExplanation"
import"./index.css"


function App() {

  return (

    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/control"
          element={
            <ProtectedRoute>
              <TankControl />
            </ProtectedRoute>

          }
        />
        <Route
        path="/history"
        element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        }
        />
        <Route
        path="/System"
        element={
          <ProtectedRoute>
            <TankExplanation />
          </ProtectedRoute>
        }
        />
      </Routes>
      
    </BrowserRouter>
  )
}

export default App