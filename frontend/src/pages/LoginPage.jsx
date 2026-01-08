import { useState } from "react";
import { apiPost } from "../api";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login"); // login | register
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
  e.preventDefault();
  setError("");
  setSuccess("");

 
  if (mode === "register" && !email.includes("@")) {
    setError("Email musi zawierać znak @");
    return;
  }

  try {
    if (mode === "login") {
      await apiPost("/login", { email, password });
      onLogin();
    } else {
      await apiPost("/register", { email, password });
      setSuccess("Konto utworzone — możesz się zalogować");
      setMode("login");
    }
  } catch (err) {
  // jeśli apiPost zwraca JSON jako string w err.message, próbujemy go rozkodować
  let msg = "";
  try {
    const obj = JSON.parse(err.message);
    msg = obj.error || obj.message || "";
  } catch {
    msg = err.message || "";
  }

  if (mode === "register") {
    // rejestracja: pokaż konkretny błąd z backendu (np. "Ten email już istnieje")
    setError(msg || "Błąd rejestracji — sprawdź dane");
  } else {
    // logowanie: zawsze ten sam tekst (żeby nie zdradzać czy email istnieje)
    setError("Błędny email lub hasło");
  }
}
}


  return (
    <div className="card" style={{ maxWidth: 380, margin: "4rem auto" }}>
      <h2>{mode === "login" ? "Logowanie" : "Rejestracja"}</h2>

      <form className="form" onSubmit={handleSubmit}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br /><br />

        <input
          type="password"
          placeholder="Hasło"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br /><br />

        <button>
          {mode === "login" ? "Zaloguj" : "Zarejestruj"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <p style={{ marginTop: 20 }}>
        {mode === "login" ? (
          <>
            Nie masz konta?{" "}
            <button onClick={() => setMode("register")}>Zarejestruj się</button>
          </>
        ) : (
          <>
            Masz konto?{" "}
            <button onClick={() => setMode("login")}>Zaloguj się</button>
          </>
        )}
      </p>
    </div>
  );
}
