import { useEffect, useState } from 'react'
import { apiGet, apiPost } from '../api/client'
import AvailabilityCalendar from "../components/AvailabilityCalendar";

export default function CarsList() {
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [selectedCar, setSelectedCar] = useState(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [pickUpLocation, setPickUpLocation] = useState('Poznań')
  const [dropOffLocation, setDropOffLocation] = useState('Poznań')

  const [submitLoading, setSubmitLoading] = useState(false)
  const [result, setResult] = useState(null)

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
    <div>
      <h2>Dostępne samochody</h2>

      <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', width: '100%' }}>
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

          <form onSubmit={submitReservation} style={{ display: 'grid', gap: '0.5rem', maxWidth: 420 }}>
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

            <button
              type="submit"
              disabled={submitLoading || !startDate || !endDate}
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
