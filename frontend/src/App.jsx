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
    <div className='app' style={{ maxWidth: 900, margin: '0 auto', padding: '1rem' }}>
      <header className='card' style={{ marginBottom: '1rem' }}>
        <h1>Wypożyczalnia samochodów</h1>

        {user && (
          <nav>
            <Link to="/">Samochody</Link> |{" "}
            <Link to="/reservations">Moje rezerwacje</Link> |{" "}
            {isAdmin && (
              <>
                <Link to="/admin/reservations">Panel admina</Link> |{" "}
              </>
            )}
            <button
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
