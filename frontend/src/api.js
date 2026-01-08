export async function apiPost(url, data) {
  const res = await fetch(`http://localhost:8000/api${url}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Błąd API");
  }

  return res.json().catch(() => ({}));
}

export async function apiGet(url) {
  const res = await fetch(`http://localhost:8000/api${url}`, {
    credentials: "include",
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Błąd API");
  }

  return res.json();
}

export async function apiDelete(url) {
  const res = await fetch(`http://localhost:8000/api${url}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Błąd API");
  }

  return res.json().catch(() => ({}));
}
