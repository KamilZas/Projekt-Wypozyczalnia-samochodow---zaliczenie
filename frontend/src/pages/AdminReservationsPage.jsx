import { useEffect, useState } from "react";
import { apiDelete, apiGet } from "../api";

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
    <div>
      <h2>Aktualnie wypożyczone auta</h2>

      {reservations.length === 0 && <p>Brak aktywnych wypożyczeń</p>}

      {reservations.map(r => (
        <div key={r.id} style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
          <p><b>ID:</b> {r.id}</p>
          <p><b>Auto:</b> {r.brand} {r.model} ({r.registrationNumber})</p>
          <p><b>Użytkownik:</b> {r.userEmail}</p>
          <p><b>Od:</b> {r.startDate}</p>
          <p><b>Do:</b> {r.endDate}</p>
          <p><b>Odbiór:</b> {r.pickUpLocation}</p>
          <p><b>Zwrot:</b> {r.dropOffLocation}</p>
          <p><b>Cena:</b> {r.totalPrice} zł</p>
          <p><b>Utworzono:</b> {r.createdAt}</p>
          <button onClick={() => handleDelete(r.id)}>Usuń rezerwację</button>
        </div>
      ))}
    </div>
  );
}
