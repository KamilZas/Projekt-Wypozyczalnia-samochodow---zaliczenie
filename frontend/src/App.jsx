import { Routes, Route, Link } from 'react-router-dom'
import { useEffect, useState } from "react"
import { apiGet } from "./api"

import CarsList from './pages/CarsList.jsx'
import ReservationsPage from './pages/ReservationsPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import AdminReservationsPage from './pages/AdminReservationsPage.jsx'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  async function loadUser() {
    try {
      const me = await apiGet("/me")
      setUser(me)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUser()
  }, [])

  if (loading) return <p>Ładowanie...</p>

  const isAdmin = user?.roles?.includes("ROLE_ADMIN")

  return (
    <div className='app app-shell'>
      <header className='card topbar'>
        <div className='brand'>
          <div className='brand__title'>Wypożyczalnia samochodów</div>
          <div className='brand__subtitle'>Nowoczesna flota, przejrzyste rezerwacje i pełna kontrola.</div>
        </div>

        {user && (
          <nav className='nav-links'>
            <Link to="/">Samochody</Link>
            <Link to="/reservations">Moje rezerwacje</Link>
            {isAdmin && (
              <Link to="/admin/reservations">Panel admina</Link>
            )}
            <button
              className="btn-ghost"
              onClick={() => {
                fetch("http://localhost:8000/api/logout", {
                  method: "POST",
                  credentials: "include",
                }).then(() => window.location.reload())
              }}
            >
              Wyloguj
            </button>
          </nav>
        )}
      </header>

      {!user ? (
        <LoginPage onLogin={loadUser} />
      ) : (
        <Routes>
          <Route path="/" element={<CarsList />} />
          <Route path="/reservations" element={<ReservationsPage />} />
          {isAdmin && (
            <Route path="/admin/reservations" element={<AdminReservationsPage />} />
          )}
        </Routes>
      )}
    </div>
  )
}

export default App
