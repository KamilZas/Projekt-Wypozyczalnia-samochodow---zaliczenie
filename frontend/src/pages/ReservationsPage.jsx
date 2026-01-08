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
    <div>


      {selectedDate && (
        <p style={{ marginTop: 10 }}>
          Wybrana data: <b>{selectedDate}</b>
        </p>
      )}

      <h2 style={{ marginTop: 20 }}>Moje rezerwacje</h2>

      {reservations.length === 0 && <p>Brak rezerwacji</p>}

      {reservations.map(r => (
        <div key={r.id} style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
          <p><b>ID:</b> {r.id}</p>
          <p><b>Od:</b> {r.startDate}</p>
          <p><b>Do:</b> {r.endDate}</p>
          <p><b>Odbiór:</b> {r.pickUpLocation}</p>
          <p><b>Zwrot:</b> {r.dropOffLocation}</p>
          <p><b>Cena:</b> {r.totalPrice} zł</p>
          <p><b>Utworzono:</b> {r.createdAt}</p>
        </div>
      ))}
    </div>
  );
}
