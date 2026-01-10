import { useEffect, useMemo, useState } from 'react'
import { apiGet, apiPost } from '../api/client'
import AvailabilityCalendar from "../components/AvailabilityCalendar";

export default function CarsList({ user }) {
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [selectedCar, setSelectedCar] = useState(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [pickUpLocation, setPickUpLocation] = useState('Poznań')
  const [dropOffLocation, setDropOffLocation] = useState('Poznań')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')

  const [submitLoading, setSubmitLoading] = useState(false)
  const [result, setResult] = useState(null)

  const totalPrice = useMemo(() => {
    if (!selectedCar || !startDate || !endDate) return null
    const start = new Date(`${startDate}T12:00:00`)
    const end = new Date(`${endDate}T12:00:00`)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null
    const diffMs = end.getTime() - start.getTime()
    if (diffMs <= 0) return null
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    return days * selectedCar.pricePerDay
  }, [selectedCar, startDate, endDate])

  useEffect(() => {
    apiGet('/cars')
      .then((data) => {
        setCars(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setError('Nie udało się pobrać listy samochodów')
        setLoading(false)
      })
  }, [])

  async function submitReservation(e) {
    e.preventDefault()
    if (!selectedCar || !startDate || !endDate) return

    setSubmitLoading(true)
    setResult(null)

    try {
      const payload = {
        carId: selectedCar.id,
        startDate,
        endDate,
        pickUpLocation,
        dropOffLocation,
        firstName,
        lastName,
        phoneNumber,
      }

      const data = await apiPost('/reservations', payload)
      setResult({ ok: true, data })
    } catch (err) {
      setResult({ ok: false, error: err.message })
    } finally {
      setSubmitLoading(false)
    }
  }

  if (loading) return <p>Ładowanie...</p>
  if (error) return <p>{error}</p>

  return (
    <div className="cars-list">
      <h2>Dostępne samochody</h2>

     <table
        className="cars-table"
        border="1"
        cellPadding="6"
        style={{ borderCollapse: 'collapse', width: '100%' }}
      >
        <thead>
          <tr>
            <th>Marka</th>
            <th>Model</th>
            <th>Rok</th>
            <th>Klasa</th>
            <th>Cena / dzień</th>
            <th>Akcja</th>
          </tr>
        </thead>
        <tbody>
          {cars.map((car) => (
            <tr key={car.id}>
              <td>{car.brand}</td>
              <td>{car.model}</td>
              <td>{car.year}</td>
              <td>{car.class}</td>
              <td>{car.pricePerDay} zł</td>
              <td>
                <button onClick={() => {
                  setSelectedCar(car)
                  setResult(null)
                  setStartDate('')
                  setEndDate('')
                  setFirstName('')
                  setLastName('')
                  setPhoneNumber('')
                }}>
                  Rezerwuj
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedCar && (
        <div style={{ marginTop: '1.5rem' }}>

          <AvailabilityCalendar
            carId={selectedCar.id}
            onSelect={(date) => {
              if (!startDate || (startDate && endDate)) {
                setStartDate(date)
                setEndDate('')
              } else {
                setEndDate(date)
              }
            }}
          />

          <h3>Rezerwacja: {selectedCar.brand} {selectedCar.model}</h3>

          <form
            className="reservation-form"
            onSubmit={submitReservation}
            style={{ display: 'grid', gap: '0.5rem', maxWidth: 420 }}
          >
            <label>
              Data od:
              <input type="text" value={startDate} placeholder="Wybierz z kalendarza" readOnly />
            </label>

            <label>
              Data do:
              <input type="text" value={endDate} placeholder="Wybierz z kalendarza" readOnly />
            </label>

            <label>
              Odbiór:
              <input value={pickUpLocation} onChange={(e) => setPickUpLocation(e.target.value)} required />
            </label>

            <label>
              Zwrot:
              <input value={dropOffLocation} onChange={(e) => setDropOffLocation(e.target.value)} required />
            </label>

            <label>
              Imię:
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </label>

            <label>
              Nazwisko:
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </label>

            <label>
              Telefon:
              <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
            </label>

            <div className="price-summary">
              <span>Łączna cena:</span>
              <strong>{totalPrice ? `${totalPrice} zł` : '—'}</strong>
            </div>

            {!user && (
              <div className="info-callout">
                Aby zarezerwować samochód, musisz się zalogować lub zarejestrować.
              </div>
            )}

            <button
              type="submit"
              disabled={submitLoading || !startDate || !endDate || !user}
            >
              {submitLoading ? 'Wysyłanie...' : 'Zarezerwuj'}
            </button>
          </form>

          {result && result.ok && (
            <p style={{ marginTop: '0.75rem' }}>
              ✅ {result.data.message} | ID: {result.data.reservationId} | Cena: {result.data.totalPrice} zł
            </p>
          )}

          {result && !result.ok && (
            <p style={{ marginTop: '0.75rem' }}>
              ❌ {result.error}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
