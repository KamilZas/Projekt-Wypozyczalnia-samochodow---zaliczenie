const API_URL = '/api'

export async function apiGet(path) {
    const res = await fetch(`${API_URL}${path}`, {
        credentials: 'include',
    })

    if (!res.ok) {
        throw new Error(`API error: ${res.status}`)
    }

    return res.json()
}

export async function apiPost(path, body) {
  const res = await fetch(`/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "Błąd");
  }

  return data;
}
