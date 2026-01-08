import { useEffect, useState } from "react";
import { apiGet } from "../api/client";

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);

  // Na razie na sztywno auto nr 1 — później można to powiązać z wyborem auta
  const selectedCarId = 1;

  useEffect(() => {
    let active = true;

    const loadReservations = () => {
      apiGet("/reservations/me")
        .then(data => {
          if (!active) return;
          setReservations(data);
          setError("");
        })
        .catch(err => {
          console.error(err);
          if (!active) return;
          setError("Nie udało się pobrać rezerwacji");
        })
        .finally(() => {
          if (!active) return;
          setLoading(false);
        });
    };

    loadReservations();
    const interval = setInterval(loadReservations, 15000);
    const onFocus = () => loadReservations();
    window.addEventListener("focus", onFocus);

    return () => {
      active = false;
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  if (loading) return <p>Ładowanie...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="section">
      {selectedDate && (
        <p style={{ marginTop: 10 }}>
          Wybrana data: <b>{selectedDate}</b>
        </p>
      )}

      <div className="section-header">
        <div>
          <h2>Moje rezerwacje</h2>
          <p className="section-subtitle">Twoje aktywne i zakończone rezerwacje.</p>
        </div>
        <span className="status-pill">{reservations.length} łącznie</span>
      </div>

      {reservations.length === 0 && <p>Brak rezerwacji</p>}

      <div className="reservation-grid">
        {reservations.map(r => (
          <div key={r.id} className="reservation-card">
            <div className="reservation-card__header">
              <div>
                <div className="reservation-card__title">{r.brand} {r.model}</div>
                <div className="reservation-card__subtitle">Rejestracja: {r.registrationNumber}</div>
              </div>
              <span className="reservation-card__badge">ID #{r.id}</span>
            </div>

            <div className="reservation-card__meta">
              <div>
                <span className="meta-label">Okres</span>
                <span className="meta-value">{r.startDate} → {r.endDate}</span>
              </div>
              <div>
                <span className="meta-label">Odbiór</span>
                <span className="meta-value">{r.pickUpLocation}</span>
              </div>
              <div>
                <span className="meta-label">Zwrot</span>
                <span className="meta-value">{r.dropOffLocation}</span>
              </div>
              <div>
                <span className="meta-label">Cena</span>
                <span className="meta-value">{r.totalPrice} zł</span>
              </div>
              <div>
                <span className="meta-label">Utworzono</span>
                <span className="meta-value">{r.createdAt}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
