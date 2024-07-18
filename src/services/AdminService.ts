import api from "./api";

export const getUsers = async () => {
  try {
    const response = await api.get("/admin/users", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};
