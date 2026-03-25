import authFetch from "./authFetch";

export const getActividades = () => authFetch("/actividades");

export const completarActividadService = (id) =>
  authFetch(`/actividades/${id}/completar`, {
    method: "PATCH",
  });