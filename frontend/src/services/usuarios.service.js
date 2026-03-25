const API_URL = `${import.meta.env.VITE_API_URL}/api/usuarios`;
const AUTH_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

const getToken = () => localStorage.getItem("token");

const request = async (url, options = {}) => {
  const token = getToken();

  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const res = await fetch(url, {
    ...options,
    headers
  });

  if (!res.ok) {
    let message = "Error en la solicitud";
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {}
    throw new Error(message);
  }

  return res.json();
};

export const getUsuarios = async () => {
  return request(API_URL);
};

export const createUsuarioAdmin = async (data) => {
  return request(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
};

export const updateUsuario = async (id, data) => {
  if (data.role) {
    data.role = data.role.toLowerCase();
  }

  return request(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
};

export const deleteUsuario = async (id) => {
  return request(`${API_URL}/${id}`, {
    method: "DELETE"
  });
};

export const registerUsuario = async (data) => {
  return request(`${AUTH_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
};

export const loginUsuario = async (data) => {
  return request(`${AUTH_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
};