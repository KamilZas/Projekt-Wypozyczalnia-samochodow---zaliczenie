import { useEffect, useState } from "react";
import { apiDelete, apiGet } from "../api/client";

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadReservations() {
    setLoading(true);
    try {
      const data = await apiGet("/admin/reservations");
      setReservations(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Nie udało się pobrać aktywnych wypożyczeń");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReservations();
  }, []);

  async function handleDelete(id) {
    if (!window.confirm("Na pewno usunąć tę rezerwację?")) {
      return;
    }

    try {
      await apiDelete(`/admin/reservations/${id}`);
      setReservations(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
      setError("Nie udało się usunąć rezerwacji");
    }
  }

  if (loading) {
    return <p>Ładowanie...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  return (
      <div className="section section--dark">
      <div className="section-header">
        <div>
          <h2>Aktualnie wypożyczone auta</h2>
          <p className="section-subtitle">Lista aktywnych rezerwacji z danymi klienta i pojazdu.</p>
        </div>
        <span className="status-pill">{reservations.length} aktywne</span>
      </div>

      {reservations.length === 0 && <p>Brak aktywnych wypożyczeń</p>}

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
                <span className="meta-label">Klient</span>
                <span className="meta-value">{r.userEmail}</span>
              </div>
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

            <div className="reservation-card__actions">
              <button className="btn-danger" onClick={() => handleDelete(r.id)}>Usuń rezerwację</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
