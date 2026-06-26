import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/lib/auth"
import HomePage from "@/pages/HomePage"
import CarDetailsPage from "@/pages/CarDetailsPage"
import CarListingsPage from "@/pages/CarListingsPage"
import CompareVehiclesPage from "@/pages/CompareVehiclesPage"
import NewsPage from "@/pages/NewsPage"
import AdminPage from "@/pages/AdminPage"
import SignInPage from "@/pages/SignInPage"
import SignUpPage from "@/pages/SignUpPage"

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/cars" element={<CarListingsPage />} />
          <Route path="/cars/:id" element={<CarDetailsPage />} />
          <Route path="/compare" element={<CompareVehiclesPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
