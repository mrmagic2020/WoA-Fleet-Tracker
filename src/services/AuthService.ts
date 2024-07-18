import api from "./api";

// Request interceptor to add the token to headers
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      // Redirect to login page
      window.location.href = "/login"; // Or use a more React-friendly method if needed
    }
    return Promise.reject(error);
  }
);

export const register = async (username: string, password: string) => {
  const response = await api.post("/auth/register", { username, password });
  return response.data;
};

export const login = async (username: string, password: string) => {
  const response = await api.post("/auth/login", { username, password });
  localStorage.setItem("token", response.data.token);
  return response.data;
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const logout = () => {
  localStorage.removeItem("token");
};

export default api; // Export the configured Axios instance
