import { useEffect, useState } from "react";
import { apiGet } from "../api";

export default function AvailabilityCalendar({ carId, onSelect }) {
  const [busy, setBusy] = useState([]);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1, 12);
  });

  function fmt(d) {
    return d.toISOString().slice(0, 10);
  }

  useEffect(() => {
    const from = new Date(currentMonth);
    const to = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 12);

    apiGet(`/cars/${carId}/availability?from=${fmt(from)}&to=${fmt(to)}`)
      .then(setBusy);
  }, [carId, currentMonth]);

  function isBusy(dateStr) {
    const d = new Date(dateStr + "T12:00:00");

    return busy.some(b => {
      const start = new Date(b.start + "T12:00:00");
      const end   = new Date(b.end   + "T12:00:00");
      return d >= start && d < end;
    });
  }

  function isPast(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const d = new Date(dateStr + "T12:00:00");
    return d < today;
  }

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0, 12).getDate();
  const firstDay = new Date(year, month, 1, 12).getDay();

  // poniedziałek = 0
  const offset = (firstDay + 6) % 7;

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push(fmt(new Date(year, month, i, 12)));
  }

  return (
    <div className="card">
      <h3>Dostępność</h3>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1, 12))}>◀</button>
        <b>{currentMonth.toLocaleString("pl-PL", { month: "long", year: "numeric" })}</b>
        <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1, 12))}>▶</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i}></div>;

          const busyDay = isBusy(d);
          const pastDay = isPast(d);
          const disabled = busyDay || pastDay;

          return (
            <div
              key={d}
              onClick={() => !disabled && onSelect(d)}
              style={{
                padding: 10,
                textAlign: "center",
                borderRadius: 8,
                cursor: disabled ? "not-allowed" : "pointer",
                background: disabled ? "#e5e5e5" : "#dbeafe",
                color: disabled ? "#777" : "#000",
                fontWeight: 600
              }}
            >
              {d.slice(8, 10)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
