import { authFetch } from "./authFetch";

// ✅ Normalización: usar directamente la URL que devuelve el backend
const normalizeReporte = (reporte) => ({
  ...reporte,
  imagen: reporte.imagen || null,
});

export async function getReportesByCultivo(cultivoId) {
  const res = await authFetch(`/api/reportes/cultivo/${cultivoId}`);
  if (!res.ok) throw new Error("Error cargando reportes");
  const data = await res.json();
  return Array.isArray(data) ? data.map(normalizeReporte) : [];
}

export async function createReporte(data) {
  const res = await authFetch("/api/reportes", {
    method: "POST",
    body: data,
  });
  if (!res.ok) {
    const error = await res.text();
    console.error(error);
    throw new Error("Error creando reporte");
  }
  const reporte = await res.json();
  return normalizeReporte(reporte);
}