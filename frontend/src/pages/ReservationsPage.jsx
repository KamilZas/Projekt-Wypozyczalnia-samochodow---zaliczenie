import { useEffect, useState } from "react";
import { apiGet } from "../api";

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);

  // Na razie na sztywno auto nr 1 — później można to powiązać z wyborem auta
  const selectedCarId = 1;

  useEffect(() => {
    apiGet("/reservations/me")
      .then(data => {
        console.log("REZERWACJE:", data);
        setReservations(data);
      })
      .catch(err => {
        console.error(err);
        setError("Nie udało się pobrać rezerwacji");
      });
  }, []);

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
