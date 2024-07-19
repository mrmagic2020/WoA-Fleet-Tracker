import { UserRole } from "@mrmagic2020/shared/dist/enums";
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
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const register = async (username: string, password: string, invitationCode: string) => {
  const response = await api.post("/auth/register", { username, password, role: UserRole.User, invitationCode });
  console.log(response);
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

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
}

export const updateUsername = async (username: string) => {
  const response = await api.put("/auth/me/username", { username });
  return response.data;
}

export default api;
