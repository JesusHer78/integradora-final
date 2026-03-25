const API_URL = `${import.meta.env.VITE_API_URL}/api/cultivos`;

const getToken = () => localStorage.getItem("token");

// ✅ Ya no concatenamos nada, el backend devuelve la URL completa
const normalizeCultivo = (cultivo) => ({
  ...cultivo,
  imagen: cultivo.imagen || null,
});

export const getCultivos = async () => {
  const res = await fetch(API_URL, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Error obteniendo cultivos");
  const data = await res.json();
  return Array.isArray(data) ? data.map(normalizeCultivo) : [];
};

export const createCultivo = async (data) => {
  const headers =
    data instanceof FormData
      ? { Authorization: `Bearer ${getToken()}` }
      : { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` };

  const res = await fetch(API_URL, {
    method: "POST",
    headers,
    body: data instanceof FormData ? data : JSON.stringify(data),
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error(errorText);
    throw new Error("Error creando cultivo");
  }
  const cultivo = await res.json();
  return normalizeCultivo(cultivo);
};

export const updateCultivo = async (id, data) => {
  const headers =
    data instanceof FormData
      ? { Authorization: `Bearer ${getToken()}` }
      : { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` };

  const res = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers,
    body: data instanceof FormData ? data : JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error actualizando cultivo");
  const cultivo = await res.json();
  return normalizeCultivo(cultivo);
};

export const deleteCultivo = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Error eliminando cultivo");
  return true;
};