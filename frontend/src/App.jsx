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

        <nav className='nav-links'>
          <Link to="/">Samochody</Link>
          {user && <Link to="/reservations">Moje rezerwacje</Link>}
          {isAdmin && <Link to="/admin/reservations">Panel admina</Link>}
          {!user ? (
            <Link className="link-button" to="/login">Zaloguj się</Link>
          ) : (
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
          )}
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<CarsList user={user} />} />
        <Route path="/login" element={<LoginPage onLogin={loadUser} />} />
        <Route path="/reservations" element={user ? <ReservationsPage /> : <LoginPage onLogin={loadUser} />} />
        <Route
          path="/admin/reservations"
          element={user && isAdmin ? <AdminReservationsPage /> : <LoginPage onLogin={loadUser} />}
        />
      </Routes>
    </div>
  )
}

export default App
