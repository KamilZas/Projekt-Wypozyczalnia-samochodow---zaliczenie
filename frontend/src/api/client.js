const API_URL = '/api'

export async function apiGet(path) {
    const res = await fetch(`${API_URL}${path}`, {
        credentials: 'include',
    })

    if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || `API error: ${res.status}`)
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

  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(data.error || data.message || text || "Błąd");
  }

  return data;
}

export async function apiDelete(path) {
  const res = await fetch(`/api${path}`, {
    method: "DELETE",
    credentials: "include",
  });

  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(data.error || data.message || text || "Błąd");
  }

  return data;
}
